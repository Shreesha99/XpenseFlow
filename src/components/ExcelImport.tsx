import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import * as XLSX from "xlsx";
import { FileUp, AlertCircle, CheckCircle2 } from "lucide-react";
import { db, auth, collection, addDoc } from "../firebase";

interface ExcelImportProps {
  onImport: () => void;
  accountId: string;
}

export default function ExcelImport({ onImport, accountId }: ExcelImportProps) {
  const [status, setStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', message?: string }>({ type: 'idle' });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    if (!auth.currentUser) {
      setStatus({ type: 'error', message: "You must be signed in to import data." });
      return;
    }

    setStatus({ type: 'loading' });

    const reader = new FileReader();
    reader.onload = async (e: ProgressEvent<FileReader>) => {
      try {
        const data = e.target?.result;
        if (!data) return;
        const workbook = XLSX.read(data, { type: "binary" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(sheet);

        const uid = auth.currentUser?.uid;
        if (!uid) throw new Error("User not authenticated");

        // Map Excel columns to our format
        // Expecting columns: Title, Amount, Category, Date, Description
        const formattedData = jsonData.map((row: any) => ({
          title: row.Title || row.title || "Imported Entry",
          amount: parseFloat(row.Amount || row.amount || 0),
          type: (row.Type || row.type || "expense").toLowerCase(),
          mode: (row.Mode || row.mode || "digital").toLowerCase(),
          category: row.Category || row.category || "Other",
          date: row.Date || row.date || new Date().toISOString().split("T")[0],
          description: row.Description || row.description || "",
          account_id: accountId,
          created_at: new Date().toISOString(),
          uid: uid
        }));

        await Promise.all(formattedData.map(item => addDoc(collection(db, "transactions"), item)));

        setStatus({ type: 'success', message: `Successfully imported ${formattedData.length} expenses!` });
        onImport();
      } catch (error) {
        console.error("Import error:", error);
        setStatus({ type: 'error', message: "Failed to parse Excel file or upload to Firestore." });
      }
    };
    reader.readAsBinaryString(file);
  }, [onImport, accountId]);

  // @ts-ignore
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
      'text/csv': ['.csv']
    }
  });

  return (
    <div className="space-y-4" id="excel-import">
      <div
        {...getRootProps()}
        className={`
          p-8 border-2 border-dashed rounded-2xl transition-all cursor-pointer text-center
          ${isDragActive ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'}
        `}
      >
        <input {...getInputProps()} />
        <FileUp className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
        <p className="text-sm font-medium">
          {isDragActive ? "Drop the file here" : "Drag & drop Excel/CSV file, or click to select"}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Expected columns: Title, Amount, Category, Date
        </p>
      </div>

      {status.type !== 'idle' && (
        <div className={`
          flex items-center gap-3 p-4 rounded-xl border
          ${status.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-600' : 
            status.type === 'error' ? 'bg-destructive/10 border-destructive/20 text-destructive' : 
            'bg-secondary text-secondary-foreground'}
        `}>
          {status.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : 
           status.type === 'error' ? <AlertCircle className="w-5 h-5" /> : 
           <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />}
          <span className="text-sm font-medium">{status.message || (status.type === 'loading' ? "Processing file..." : "")}</span>
        </div>
      )}
    </div>
  );
}
