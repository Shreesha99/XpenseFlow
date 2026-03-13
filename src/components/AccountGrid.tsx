import { Transaction, Stats } from "../types";
import { format } from "date-fns";
import { Trash2, History } from "lucide-react";

interface AccountGridProps {
  transactions: Transaction[];
  stats: Stats | null;
  onDelete: (id: number) => void;
  compact?: boolean;
}

export default function AccountGrid({ transactions, stats, onDelete, compact }: AccountGridProps) {
  const summary = stats?.summary || {
    digital_credits: 0,
    in_hand_credits: 0,
    digital_expenses: 0,
    in_hand_expenses: 0
  };

  const totalBalance = (summary.digital_credits || 0) + (summary.in_hand_credits || 0) - (summary.digital_expenses || 0) - (summary.in_hand_expenses || 0);

  return (
    <div className="space-y-6" id="account-grid">
      {!compact && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-xl">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Total Credits</p>
            <p className="text-2xl font-bold text-foreground">
              ₹{((summary.digital_credits || 0) + (summary.in_hand_credits || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-4 bg-rose-500/5 border border-rose-500/10 rounded-xl">
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-1">Total Expenses</p>
            <p className="text-2xl font-bold text-foreground">
              ₹{((summary.digital_expenses || 0) + (summary.in_hand_expenses || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1">Net Balance</p>
            <p className="text-2xl font-bold text-foreground">
              ₹{(totalBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-xs text-foreground border-collapse">
          <thead>
            <tr className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold border-b border-border bg-muted/30">
              <th className="p-5 text-left font-bold">Date</th>
              <th className="p-5 text-left font-bold">Credits</th>
              <th className="p-5 text-right font-bold">Amount</th>
              <th className="p-5 text-left font-bold">Expenses</th>
              <th className="p-5 text-right font-bold">Amount</th>
              <th className="p-5 text-left font-bold">Category</th>
              <th className="p-5 text-center font-bold w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((t) => (
              <tr key={t.id} className="group hover:bg-emerald-500/[0.02] transition-colors">
                <td className="p-5 text-muted-foreground font-mono">{format(new Date(t.date), "dd.MM.yy")}</td>
                <td className="p-5">
                  {t.type === 'credit' ? (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]" />
                      <span className="text-foreground font-semibold tracking-tight">{t.title}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full border ${t.mode === 'digital' ? 'border-blue-500/20 bg-blue-500/5 text-blue-400' : 'border-amber-500/20 bg-amber-500/5 text-amber-400'} uppercase font-bold tracking-widest`}>
                        {t.mode === 'digital' ? 'Digital' : 'Cash'}
                      </span>
                    </div>
                  ) : <span className="text-muted-foreground/10">—</span>}
                </td>
                <td className="p-5 text-right font-mono font-medium text-emerald-500">
                  {t.type === 'credit' ? `₹${(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : ''}
                </td>
                <td className="p-5">
                  {t.type === 'expense' ? (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                      <span className="text-foreground font-semibold tracking-tight">{t.title}</span>
                      <span className={`text-[8px] px-1.5 py-0.5 rounded-full border ${t.mode === 'digital' ? 'border-blue-500/20 bg-blue-500/5 text-blue-400' : 'border-amber-500/20 bg-amber-500/5 text-amber-400'} uppercase font-bold tracking-widest`}>
                        {t.mode === 'digital' ? 'Digital' : 'Cash'}
                      </span>
                    </div>
                  ) : <span className="text-muted-foreground/10">—</span>}
                </td>
                <td className="p-5 text-right font-mono font-medium text-rose-500">
                  {t.type === 'expense' ? `₹${(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}` : ''}
                </td>
                <td className="p-5">
                  <span className="px-3 py-1 rounded-full bg-muted border border-border text-[9px] font-bold text-muted-foreground uppercase tracking-widest group-hover:border-emerald-500/20 transition-colors">
                    {t.category}
                  </span>
                </td>
                <td className="p-5 text-center">
                  <button 
                    onClick={() => onDelete(t.id)}
                    className="p-2 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan={7} className="p-12 text-center">
                  <div className="flex flex-col items-center gap-2 text-muted-foreground">
                    <History className="w-8 h-8 opacity-20" />
                    <p className="text-sm italic">No transactions recorded yet.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
