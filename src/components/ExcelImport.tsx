import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { FileUp, AlertCircle, CheckCircle2 } from "lucide-react";
import {
  db,
  auth,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "../firebase";
import { doc, getDoc, serverTimestamp } from "firebase/firestore";
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
  if (!narration) return "Transaction";

  let text = narration.trim();

  // split by hyphen
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

  // remove handles like @ybl
  merchant = merchant.split("@")[0];

  // remove numbers
  merchant = merchant.replace(/[0-9]/g, "");

  // remove extra words
  merchant = merchant.replace(/limited|pvt ltd|private|ltd/gi, "");

  merchant = merchant.trim();

  // title case
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

  const createHash = (title: string, amount: number, date: string) => {
    return `${title}-${amount}-${date}`.toLowerCase();
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

          const workbook = XLSX.read(data, { type: "binary" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];

          // read raw rows
          const rows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });

          // Detect bank from uploaded statement
          const detectedBank = detectBankFromSheet(rows);

          let headerRowIndex = rows.findIndex((row) =>
            row.some((cell: any) => {
              const c = String(cell).toLowerCase();

              return (
                c.includes("narration") ||
                c.includes("description") ||
                c.includes("withdrawal") ||
                c.includes("deposit") ||
                c.includes("balance")
              );
            })
          );

          if (headerRowIndex === -1) headerRowIndex = 0;

          if (headerRowIndex === -1) headerRowIndex = 0;

          // convert to json
          const jsonData = XLSX.utils.sheet_to_json(sheet, {
            range: headerRowIndex,
            defval: "",
          });
          console.log("HEADER ROW INDEX:", headerRowIndex);
          console.log("FIRST ROW:", jsonData[0]);
          console.log("TOTAL ROWS:", jsonData.length);

          const uid = auth.currentUser?.uid;
          if (!uid) throw new Error("User not authenticated");

          const formattedData = jsonData
            .map((row: any) => {
              const dateRaw = row["Date"];
              const narration = row["Narration"];

              // skip masked or summary rows
              if (
                !dateRaw ||
                String(dateRaw).includes("*") ||
                !narration ||
                narration.includes("*") ||
                narration.toLowerCase().includes("statement")
              ) {
                return null;
              }

              const debit = row["Withdrawal Amt."] || "";
              const credit = row["Deposit Amt."] || "";

              let amount = 0;
              let type: "expense" | "credit" = "expense";

              if (credit) {
                amount = parseFloat(String(credit).replace(/,/g, ""));
                type = "credit";
              } else if (debit) {
                amount = parseFloat(String(debit).replace(/,/g, ""));
                type = "expense";
              }

              if (!amount || isNaN(amount)) return null;

              // parse dd/mm/yy
              const parts = String(dateRaw).split("/");
              if (parts.length !== 3) return null;

              const parsedDate = new Date(
                2000 + Number(parts[2]),
                Number(parts[1]) - 1,
                Number(parts[0])
              )
                .toISOString()
                .slice(0, 10);

              const title = cleanNarration(narration);

              return {
                title,
                amount,
                type,
                mode: "digital",
                category: "Imported",
                date: parsedDate,
                description: "",
                hash: createHash(title, amount, parsedDate),
              };
            })
            .filter(Boolean);

          console.log("FORMATTED DATA SAMPLE:", formattedData.slice(0, 5));
          console.log("FORMATTED LENGTH:", formattedData.length);

          const newTransactions: any[] = [];

          for (const tx of formattedData) {
            const q = query(
              collection(db, "transactions"),
              where("uid", "==", uid),
              where("hash", "==", tx.hash)
            );

            const existing = await getDocs(q);

            if (existing.empty) {
              newTransactions.push(tx);
            }
          }

          await Promise.all(
            newTransactions.map((item) =>
              addDoc(collection(db, "transactions"), {
                ...item,
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
