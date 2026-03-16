import * as XLSX from "xlsx";

export async function parseBankStatement(file: File) {
  const data = await file.arrayBuffer();

  const workbook = XLSX.read(data);

  const sheet = workbook.Sheets[workbook.SheetNames[0]];

  const rows = XLSX.utils.sheet_to_json<any>(sheet);

  const transactions = rows.map((row) => {
    const date =
      row["Date"] ||
      row["Txn Date"] ||
      row["Transaction Date"] ||
      row["Tran Date"];

    const description =
      row["Description"] ||
      row["Narration"] ||
      row["Particulars"] ||
      row["Remarks"];

    const debit = row["Debit"] || row["Withdrawal"] || row["DR"];

    const credit = row["Credit"] || row["Deposit"] || row["CR"];

    const amount = credit ? Number(credit) : Number(debit || 0);

    const type = credit ? "credit" : "expense";

    return {
      date,
      title: description,
      amount,
      type,
    };
  });

  return transactions;
}
