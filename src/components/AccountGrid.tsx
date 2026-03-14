import { Transaction, Stats } from "../types";
import { format } from "date-fns";
import { Trash2, History, Smartphone, Banknote } from "lucide-react";
import { useState } from "react";

interface AccountGridProps {
  transactions: Transaction[];
  stats: Stats | null;
  onDelete: (id: string) => void;
  compact?: boolean;
}

export default function AccountGrid({ transactions, stats, onDelete, compact }: AccountGridProps) {
  const summary = stats?.summary || {
    digital_credits: 0,
    in_hand_credits: 0,
    digital_expenses: 0,
    in_hand_expenses: 0
  };

  const totalBalance = (Number(summary.digital_credits) || 0) + (Number(summary.in_hand_credits) || 0) - (Number(summary.digital_expenses) || 0) - (Number(summary.in_hand_expenses) || 0);

  const BankLogo = ({ url, name, className = "w-4 h-4" }: { url?: string, name: string, className?: string }) => {
    const [error, setError] = useState(false);
    if (!url || error) {
      return (
        <div className={`${className} bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[8px] font-bold rounded-full border border-emerald-500/20`}>
          {name.charAt(0).toUpperCase()}
        </div>
      );
    }
    return (
      <img 
        src={url} 
        alt={name} 
        className={`${className} rounded-full object-contain bg-white p-0.5 border border-border`}
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
      />
    );
  };

  return (
    <div className="space-y-6" id="account-grid">
      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">Total Income</p>
            <p className="text-3xl font-bold text-foreground tracking-tighter">
              ₹{((summary.digital_credits || 0) + (summary.in_hand_credits || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl">
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2">Total Outflow</p>
            <p className="text-3xl font-bold text-foreground tracking-tighter">
              ₹{((summary.digital_expenses || 0) + (summary.in_hand_expenses || 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl sm:col-span-2 lg:col-span-1">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">Net Change (Period)</p>
            <p className="text-3xl font-bold text-foreground tracking-tighter">
              ₹{(totalBalance || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      )}

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto rounded-3xl border border-border bg-card/50">
        <table className="w-full text-xs text-foreground border-collapse">
          <thead>
            <tr className="text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold border-b border-border bg-muted/30">
              <th className="p-5 text-left font-bold">Date</th>
              <th className="p-5 text-left font-bold">Credits</th>
              <th className="p-5 text-right font-bold">Amount</th>
              <th className="p-5 text-left font-bold">Expenses</th>
              <th className="p-5 text-right font-bold">Amount</th>
              <th className="p-5 text-left font-bold">Bank</th>
              <th className="p-5 text-left font-bold">Category</th>
              <th className="p-5 text-center font-bold w-10"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {transactions.map((t) => (
              <tr key={t.id} className="group hover:bg-emerald-500/[0.02] transition-colors">
                <td className="p-5 text-muted-foreground font-mono">{t.date ? format(new Date(t.date), "dd.MM.yy") : '—'}</td>
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
                  <div className="flex items-center gap-2">
                    <BankLogo url={t.account_logo_url} name={t.account_name || 'Main'} />
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {t.account_name || 'Main'}
                    </span>
                  </div>
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
          </tbody>
        </table>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {transactions.map((t) => (
          <div key={t.id} className="p-6 bg-card border border-border rounded-3xl space-y-4">
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full ${t.type === 'credit' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                <div>
                  <p className="text-sm font-bold text-foreground">{t.title}</p>
                  <p className="text-[10px] text-muted-foreground font-mono">{t.date ? format(new Date(t.date), "dd MMM yyyy") : '—'}</p>
                </div>
              </div>
              <button 
                onClick={() => onDelete(t.id)}
                className="p-2 text-muted-foreground hover:text-rose-500"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            <div className="flex justify-between items-end">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <BankLogo url={t.account_logo_url} name={t.account_name || 'Main'} className="w-4 h-4" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{t.account_name || 'Main'}</span>
                </div>
                <div className="flex gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-muted border border-border text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                    {t.category}
                  </span>
                  <span className={`text-[8px] px-2 py-0.5 rounded-full border ${t.mode === 'digital' ? 'border-blue-500/20 bg-blue-500/5 text-blue-400' : 'border-amber-500/20 bg-amber-500/5 text-amber-400'} uppercase font-bold tracking-widest`}>
                    {t.mode === 'digital' ? 'Digital' : 'Cash'}
                  </span>
                </div>
              </div>
              <p className={`text-xl font-bold tracking-tighter ${t.type === 'credit' ? 'text-emerald-500' : 'text-rose-500'}`}>
                {t.type === 'credit' ? '+' : '-'} ₹{(t.amount || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </p>
            </div>
          </div>
        ))}
      </div>

      {transactions.length === 0 && (
        <div className="p-12 text-center bg-muted/20 rounded-3xl border border-dashed border-border">
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <History className="w-8 h-8 opacity-20" />
            <p className="text-sm italic">No transactions recorded yet.</p>
          </div>
        </div>
      )}
    </div>
  );
}
