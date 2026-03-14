import { useState, useMemo } from 'react';
import { Stats } from '../types';
import { motion } from 'motion/react';

interface DeductionItem {
  id: string;
  name: string;
  amount: number;
  deducted: boolean;
}

interface CalculatorProps {
  stats: Stats | null;
  compact?: boolean;
}

export default function Calculator({ stats, compact }: CalculatorProps) {
  const [items, setItems] = useState<DeductionItem[]>([
    { id: '1', name: 'Rent', amount: 0, deducted: false },
    { id: '2', name: 'Electricity', amount: 0, deducted: false },
    { id: '3', name: 'Internet', amount: 0, deducted: false },
    { id: '4', name: 'Netflix', amount: 0, deducted: false },
    { id: '5', name: 'Spotify', amount: 0, deducted: false },
    { id: '6', name: 'Gym', amount: 0, deducted: false },
  ]);

  const summary = stats?.summary || {
    digital_credits: 0,
    in_hand_credits: 0,
    digital_expenses: 0,
    in_hand_expenses: 0
  };

  const actualBalance = (summary.digital_credits || 0) + (summary.in_hand_credits || 0) - (summary.digital_expenses || 0) - (summary.in_hand_expenses || 0);

  const yetToDeduct = useMemo(() => {
    return items
      .filter(item => !item.deducted)
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [items]);

  const projectedBalance = actualBalance - yetToDeduct;

  const updateAmount = (id: string, amount: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, amount: parseFloat(amount) || 0 } : item
    ));
  };

  const toggleDeducted = (id: string) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, deducted: !item.deducted } : item
    ));
  };

  if (compact) {
    return (
      <div className="space-y-6" id="calculator-compact">
        <div className="space-y-3">
          {items.slice(0, 3).map(item => (
            <div key={item.id} className="flex items-center justify-between group">
              <div className="flex items-center gap-3">
                <div className={`w-1.5 h-1.5 rounded-full ${item.deducted ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`} />
                <span className="text-xs font-semibold text-foreground tracking-tight">{item.name}</span>
              </div>
              <span className="text-xs font-mono font-bold text-foreground">₹{(item.amount || 0).toLocaleString()}</span>
            </div>
          ))}
        </div>
        <div className="pt-4 border-t border-border flex justify-between items-center">
          <div className="space-y-0.5">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Projected</span>
            <p className="text-xs text-muted-foreground/50 leading-none">After deductions</p>
          </div>
          <span className="text-xl font-bold font-mono text-emerald-500 tracking-tighter">₹{(projectedBalance || 0).toLocaleString()}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12" id="calculator-view">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter">Subscriptions</h2>
          <p className="text-sm text-muted-foreground mt-1">Manage your recurring financial commitments.</p>
        </div>
        <div className="flex gap-4">
          <div className="px-6 py-3 bg-card border border-border rounded-2xl shadow-sm">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Projected Balance</p>
            <p className="text-2xl font-bold font-mono text-emerald-500 tracking-tighter">₹{(projectedBalance || 0).toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8">
          <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
            <table className="w-full border-collapse text-xs">
              <thead>
                <tr className="bg-muted/30 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] border-b border-border">
                  <th className="p-6 text-left">Service / Item</th>
                  <th className="p-6 text-right">Amount (₹)</th>
                  <th className="p-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map(item => (
                  <tr key={item.id} className="group hover:bg-emerald-500/[0.02] transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-2 h-2 rounded-full ${item.deducted ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]' : 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.4)]'}`} />
                        <span className="text-sm font-bold tracking-tight text-foreground">{item.name}</span>
                      </div>
                    </td>
                    <td className="p-6 text-right">
                      <input 
                        type="number" 
                        value={item.amount || ''} 
                        onChange={(e) => updateAmount(item.id, e.target.value)}
                        className="bg-muted/50 border border-border rounded-xl p-3 text-right text-sm font-mono font-bold outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all w-32"
                        placeholder="0"
                      />
                    </td>
                    <td className="p-6 text-center">
                      <button 
                        onClick={() => toggleDeducted(item.id)}
                        className={`px-6 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all border ${
                          item.deducted 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' 
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}
                      >
                        {item.deducted ? 'Authorized' : 'Pending'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
            <div className="space-y-2">
              <h3 className="text-lg font-bold tracking-tight">Summary</h3>
              <p className="text-xs text-muted-foreground">Monthly recurring expenditure breakdown.</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Actual Liquidity</span>
                <span className="text-sm font-mono font-bold">₹{(actualBalance || 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Yet To Deduct</span>
                <span className="text-sm font-mono font-bold text-amber-500">₹{(yetToDeduct || 0).toLocaleString()}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Projected Net</span>
                <span className="text-lg font-mono font-bold text-emerald-500">₹{(projectedBalance || 0).toLocaleString()}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                <span>Liquidity Ratio</span>
                <span>{Math.round((projectedBalance / (actualBalance || 1)) * 100)}%</span>
              </div>
              <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(Math.max((projectedBalance / (actualBalance || 1)) * 100, 0), 100)}%` }}
                  transition={{ duration: 1.5, ease: [0.23, 1, 0.32, 1] }}
                  className="h-full bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                />
              </div>
            </div>
          </div>

          <div className="p-8 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
            <p className="text-xs text-emerald-500/60 leading-relaxed italic">
              "Financial freedom is available to those who learn about it and work for it."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
