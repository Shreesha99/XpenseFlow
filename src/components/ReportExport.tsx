import { Download, FileText, Table } from "lucide-react";
import { Transaction } from "../types";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { format } from "date-fns";

interface ReportExportProps {
  transactions: Transaction[];
}

export default function ReportExport({ transactions }: ReportExportProps) {
  const exportPDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.text("Account Transaction Report", 14, 22);
    doc.setFontSize(11);
    doc.setTextColor(100);
    doc.text(`Generated on ${format(new Date(), "PPP")}`, 14, 30);

    const tableData = transactions.map(t => [
      format(new Date(t.date), "dd MMM yyyy"),
      t.title,
      t.type.toUpperCase(),
      t.mode.toUpperCase(),
      t.category,
      `INR ${t.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Date', 'Title', 'Type', 'Mode', 'Taxonomy', 'Amount']],
      body: tableData,
      theme: 'grid',
      headStyles: { 
        fillColor: [16, 185, 129], 
        textColor: [255, 255, 255],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: { 
        fontSize: 9,
        textColor: [50, 50, 50]
      },
      columnStyles: {
        5: { halign: 'right', fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      }
    });

    const totalCredits = transactions.filter(t => t.type === 'credit').reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
    
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Summary Statistics`, 14, finalY - 5);
    
    doc.setTextColor(0);
    doc.setFontSize(11);
    doc.text(`Total Credits:`, 14, finalY);
    doc.text(`INR ${totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 100, finalY, { align: 'right' });
    
    doc.text(`Total Expenses:`, 14, finalY + 7);
    doc.text(`INR ${totalExpenses.toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 100, finalY + 7, { align: 'right' });
    
    doc.setDrawColor(200);
    doc.line(14, finalY + 10, 100, finalY + 10);
    
    doc.setFontSize(12);
    doc.setTextColor(16, 185, 129);
    doc.text(`Net Balance:`, 14, finalY + 17);
    doc.text(`INR ${(totalCredits - totalExpenses).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 100, finalY + 17, { align: 'right' });

    doc.save(`account-report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
  };

  const exportCSV = () => {
    const headers = ["Date", "Title", "Type", "Mode", "Category", "Amount", "Description"];
    const rows = transactions.map(t => [
      t.date,
      `"${t.title}"`,
      t.type,
      t.mode,
      t.category,
      t.amount,
      `"${t.description || ""}"`
    ]);

    const csvContent = [
      headers.join(","),
      ...rows.map(row => row.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `account-data-${format(new Date(), "yyyy-MM-dd")}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex flex-wrap gap-3" id="report-export">
      <button
        onClick={exportPDF}
        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
      >
        <FileText className="w-4 h-4" />
        Export PDF
      </button>
      <button
        onClick={exportCSV}
        className="flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground border border-border rounded-lg hover:bg-accent transition-colors"
      >
        <Table className="w-4 h-4" />
        Export CSV
      </button>
    </div>
  );
}
