import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import {
  FileUp,
  AlertCircle,
  CheckCircle2,
  Info,
  AlertTriangle,
} from "lucide-react";
import {
  db,
  auth,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "../firebase";
import { doc, getDoc, serverTimestamp, updateDoc } from "firebase/firestore";
import { Account } from "../types";
import CustomSelect from "./shared/CustomSelect";
import BankLogo from "./ui/BankLogo";

interface ExcelImportProps {
  onImport: () => void;
  accounts: Account[];
}

const detectBankFromSheet = (rows: any[][]) => {
  const text = rows.slice(0, 10).flat().join(" ").toLowerCase();

  if (text.includes("hdfc")) return "hdfc";
  if (text.includes("icici")) return "icici";
  if (text.includes("state bank") || text.includes("sbi")) return "sbi";
  if (text.includes("axis")) return "axis";
  if (text.includes("kotak")) return "kotak";

  return "unknown";
};

const cleanNarration = (narration: string) => {
  if (narration.includes("/")) {
    const parts = narration.split("/").map((p) => p.trim());

    const possible = parts.find(
      (p) =>
        p &&
        !p.toLowerCase().includes("upi") &&
        !p.toLowerCase().includes("dr") &&
        !p.toLowerCase().includes("wdl") &&
        !p.toLowerCase().includes("tfr")
    );

    if (possible) {
      narration = possible;
    }
  }
  if (!narration) return "Transaction";

  let text = narration.trim();
  const parts = text.split("-").map((p) => p.trim());

  let merchant = "";

  if (parts[0].startsWith("UPI")) {
    merchant = parts[1] || parts[0];
  } else if (parts[0].startsWith("IMPS") || parts[0].startsWith("NEFT")) {
    merchant = parts[2] || parts[1] || parts[0];
  } else if (parts[0].startsWith("ACH")) {
    merchant = parts[1] || parts[0];
  } else if (parts[0].startsWith("FT")) {
    merchant = parts[2] || parts[1];
  } else {
    merchant = parts[0];
  }

  merchant = merchant.split("@")[0];
  merchant = merchant.replace(/[0-9]/g, "");
  merchant = merchant.replace(/limited|pvt ltd|private|ltd/gi, "");
  merchant = merchant.trim();

  merchant = merchant
    .toLowerCase()
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");

  return merchant || "Transaction";
};

export default function ExcelImport({ onImport, accounts }: ExcelImportProps) {
  const [status, setStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  const createHash = (tx: any) => {
    return `${tx.rawNarration}-${tx.amount}-${tx.date}-${tx.type}`
      .toLowerCase()
      .replace(/\s+/g, "");
  };

  const [selectedAccountId, setSelectedAccountId] = useState<string>("");

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0];
      if (!file) return;

      if (!selectedAccountId) {
        setStatus({
          type: "error",
          message:
            "Please select a bank account before uploading the statement.",
        });
        return;
      }

      if (!auth.currentUser) {
        setStatus({
          type: "error",
          message: "You must be signed in to import data.",
        });
        return;
      }

      setStatus({ type: "loading" });

      const reader = new FileReader();

      reader.onload = async (e: ProgressEvent<FileReader>) => {
        try {
          const data = e.target?.result;
          if (!data) return;

          let workbook;

          try {
            workbook = XLSX.read(data, { type: "binary" });
          } catch (err) {
            console.error("🚫 Encrypted file:", err);

            setStatus({
              type: "error",
              message:
                "This file seems to be password protected… the note above might help",
            });

            return;
          }
          const sheet = workbook.Sheets[workbook.SheetNames[0]];

          const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
          // 🔥 STEP 0: Extract opening balance from SUMMARY section
          // 🔥 STEP 0: Extract opening balance from SUMMARY section
          let detectedOpeningBalance = 0;

          for (let i = rows.length - 1; i >= 0; i--) {
            const row = rows[i];
            const rowText = row.join(" ").toLowerCase();

            if (rowText.includes("opening balance")) {
              // ✅ Try same row first
              let value =
                row.find((cell: any) => String(cell).match(/^\d+(\.\d+)?$/)) ||
                null;

              // ✅ If not found, check NEXT ROW (this is your case)
              if (!value && rows[i + 1]) {
                value = rows[i + 1].find((cell: any) =>
                  String(cell).match(/^\d+(\.\d+)?$/)
                );
              }

              detectedOpeningBalance =
                parseFloat(String(value || "0").replace(/,/g, "")) || 0;

              break;
            }
          }

          const bank = detectBankFromSheet(rows);
          console.log("DETECTED BANK:", bank);

          let headerRowIndex = rows.findIndex((row) =>
            row.some((cell: any) => {
              const c = String(cell).toLowerCase();

              if (bank === "sbi") {
                return (
                  c.includes("date") &&
                  row.join(" ").toLowerCase().includes("details")
                );
              }

              // existing logic
              return (
                c.includes("narration") ||
                c.includes("description") ||
                c.includes("withdrawal") ||
                c.includes("deposit") ||
                c.includes("balance")
              );
            })
          );

          console.log("HEADER INDEX:", headerRowIndex);
          console.log("HEADER ROW:", rows[headerRowIndex]);

          if (headerRowIndex === -1) headerRowIndex = 0;

          const rawData = XLSX.utils.sheet_to_json<any[]>(sheet, {
            header: 1,
          });

          let headers = (rawData[headerRowIndex] as any[]).map((h: any) =>
            String(h || "")
              .toLowerCase()
              .trim()
          );

          // 🔥 SBI FIX (no impact on others)
          if (bank === "sbi") {
            headers = headers.map((h) => {
              if (h === "details") return "narration";
              if (h === "debit") return "withdrawal";
              if (h === "credit") return "deposit";
              return h;
            });
          }

          const jsonData = rawData
            .slice(headerRowIndex + 1)
            .map((row: any[]) => {
              const obj: Record<string, any> = {};
              headers.forEach((key: string, i: number) => {
                obj[key] = row[i];
              });
              return obj;
            });

          const uid = auth.currentUser?.uid;
          if (!uid) throw new Error("User not authenticated");

          const formattedData = jsonData
            .map((row: any) => {
              const normalizeKey = (key: string) => key.trim().toLowerCase();

              const normalizedRow = Object.fromEntries(
                Object.entries(row).map(([k, v]) => [normalizeKey(k), v])
              ) as Record<string, any>;

              if (!normalizedRow["date"] && !normalizedRow["txn date"]) {
                return null;
              }

              const dateRaw =
                normalizedRow["date"] ||
                normalizedRow["txn date"] ||
                normalizedRow["transaction date"] ||
                normalizedRow["tran date"];
              const narration =
                normalizedRow["narration"] ||
                normalizedRow["description"] ||
                normalizedRow["particulars"] ||
                normalizedRow["remarks"] ||
                "";
              const debit =
                normalizedRow["withdrawal amt."] ||
                normalizedRow["withdrawal"] ||
                normalizedRow["debit"] ||
                normalizedRow["dr"] ||
                normalizedRow["debit amount"] ||
                "";

              const credit =
                normalizedRow["deposit amt."] ||
                normalizedRow["deposit"] ||
                normalizedRow["credit"] ||
                normalizedRow["cr"] ||
                normalizedRow["credit amount"] ||
                "";
              const narrationLower = narration.toLowerCase();
              if (narrationLower.includes("opening")) {
                return null;
              }

              if (
                !dateRaw ||
                !narration ||
                narrationLower.includes("balance") ||
                narrationLower.includes("statement") ||
                narrationLower.includes("generated") ||
                narrationLower.includes("summary") ||
                narrationLower.includes("gst") ||
                narrationLower.includes("office") ||
                narrationLower.includes("address") ||
                narrationLower.includes("end of statement") ||
                narrationLower.includes("opening") ||
                narrationLower.includes("closing")
              ) {
                return null;
              }

              const parseAmount = (val: any) => {
                if (val === null || val === undefined) return 0;

                const cleaned = String(val).replace(/,/g, "").trim();

                if (cleaned === "" || cleaned === "-") return 0;

                return parseFloat(cleaned) || 0;
              };
              let creditAmt = parseAmount(credit);
              let debitAmt = parseAmount(debit);

              if (bank === "sbi") {
                if (!creditAmt && credit) {
                  creditAmt = parseAmount(credit);
                }

                if (!debitAmt && debit) {
                  debitAmt = parseAmount(debit);
                }
              }

              console.log("SBI ROW:", {
                narration,
                debit,
                credit,
                debitAmt,
                creditAmt,
              });

              if (creditAmt === 0 && debitAmt === 0) {
                console.log("❌ Skipping row (both zero):", narration);
                return null;
              }

              let amount = 0;
              let type: "expense" | "credit";

              if (bank === "sbi") {
                if (creditAmt > 0) {
                  amount = creditAmt;
                  type = "credit";
                } else {
                  amount = debitAmt;
                  type = "expense";
                }
              } else {
                if (creditAmt > 0 && debitAmt > 0) {
                  return null;
                }

                if (creditAmt > 0) {
                  amount = creditAmt;
                  type = "credit";
                } else {
                  amount = debitAmt;
                  type = "expense";
                }
              }

              if (creditAmt > 0) {
                amount = creditAmt;
                type = "credit";
              } else {
                amount = debitAmt;
                type = "expense";
              }

              let parsedDate = "";

              if (typeof dateRaw === "number") {
                const excelDate = XLSX.SSF.parse_date_code(dateRaw);

                parsedDate = `${excelDate.y}-${String(excelDate.m).padStart(
                  2,
                  "0"
                )}-${String(excelDate.d).padStart(2, "0")}`;
              } else if (typeof dateRaw === "string") {
                const parts = dateRaw.split("/");
                if (parts.length !== 3) return null;

                const day = Number(parts[0]);
                const month = Number(parts[1]);
                const year = Number(parts[2]);

                parsedDate = `${year < 100 ? 2000 + year : year}-${String(
                  month
                ).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              } else {
                return null;
              }
              const title = cleanNarration(narration);

              return {
                title,
                rawNarration: narration,
                amount,
                type,
                mode: "digital",
                category: "Imported",
                date: parsedDate,
                description: "",
                hash: createHash({
                  rawNarration: narration,
                  amount,
                  date: parsedDate,
                  type,
                }),
              };
            })
            .filter(Boolean);

          let adjustedOpeningBalance = detectedOpeningBalance;

          if (formattedData.length > 0 && detectedOpeningBalance) {
            const firstTx = formattedData[0];

            if (firstTx.type === "credit") {
              adjustedOpeningBalance -= firstTx.amount;
            } else {
              adjustedOpeningBalance += firstTx.amount;
            }
          }
          const accountRef = doc(db, "accounts", selectedAccountId);
          const accountSnap = await getDoc(accountRef);

          if (accountSnap.exists()) {
            const accData = accountSnap.data();

            if (
              (!accData.initial_balance || accData.initial_balance === 0) &&
              adjustedOpeningBalance > 0
            ) {
              await updateDoc(accountRef, {
                initial_balance: adjustedOpeningBalance,
              });
            }
          }

          const existingSnapshot = await getDocs(
            query(collection(db, "transactions"), where("uid", "==", uid))
          );

          const existingHashes = new Set(
            existingSnapshot.docs.map((doc) => doc.data().hash)
          );

          const newTransactions = formattedData.filter(
            (tx) => !existingHashes.has(tx.hash)
          );

          await Promise.all(
            newTransactions.map((item) =>
              addDoc(collection(db, "transactions"), {
                title: item.title,
                amount: item.amount,
                type: item.type,
                mode: item.mode,
                category: item.category,
                date: item.date,
                description: item.description,
                hash: item.hash,
                account_id: selectedAccountId,
                created_at: serverTimestamp(),
                uid: uid,
              })
            )
          );

          setStatus({
            type: "success",
            message: `Imported ${newTransactions.length} new transactions`,
          });

          onImport();
        } catch (error: any) {
          console.error("Import error:", error);

          setStatus({
            type: "error",
            message: error?.message || "Failed to parse Excel file.",
          });
        }
      };

      reader.readAsBinaryString(file);
    },
    [onImport, selectedAccountId]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [
        ".xlsx",
      ],
      "application/vnd.ms-excel": [".xls"],
      "text/csv": [".csv"],
    },
  });

  return (
    <div className="space-y-4" id="excel-import">
      <div className="flex items-center gap-3 p-4 rounded-xl border bg-yellow-500/10 border-yellow-500/20 text-yellow-700">
        <AlertTriangle className="w-5 h-5" />
        <span className="text-sm font-medium">
          Password-protected statements are not supported yet. Please upload a
          file without a password.
        </span>
      </div>
      <CustomSelect
        label="Select Bank Account"
        options={(accounts || []).map((acc) => ({
          id: acc.id,
          name: acc.name,
          icon: (
            <BankLogo name={acc.name} url={acc.logo_url} className="w-4 h-4" />
          ),
        }))}
        value={selectedAccountId}
        onChange={(val) => setSelectedAccountId(val)}
        placeholder="Choose bank account"
      />
      <div
        {...getRootProps()}
        className={`p-8 border-2 border-dashed rounded-2xl transition-all cursor-pointer text-center ${
          isDragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        }`}
      >
        <input {...getInputProps()} />
        <FileUp className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />

        <p className="text-sm font-medium">
          {isDragActive
            ? "Drop the file here"
            : "Drag & drop Excel/CSV file, or click to select"}
        </p>

        <p className="text-xs text-muted-foreground mt-2">
          Supports bank statements and spreadsheets
        </p>
      </div>

      {status.type !== "idle" && (
        <div
          className={`flex items-center gap-3 p-4 rounded-xl border ${
            status.type === "success"
              ? "bg-green-500/10 border-green-500/20 text-green-600"
              : status.type === "error"
              ? "bg-destructive/10 border-destructive/20 text-destructive"
              : "bg-secondary text-secondary-foreground"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle2 className="w-5 h-5" />
          ) : status.type === "error" ? (
            <AlertCircle className="w-5 h-5" />
          ) : (
            <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
          )}

          <span className="text-sm font-medium">
            {status.message ||
              (status.type === "loading" ? "Processing file..." : "")}
          </span>
        </div>
      )}
    </div>
  );
}
