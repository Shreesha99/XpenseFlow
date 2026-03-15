import { useState, useMemo } from 'react';
import { Stats } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { CreditCard, CheckCircle2, Circle, AlertCircle, Plus, Trash2 } from 'lucide-react';

interface DeductionItem {
  id: string;
  name: string;
  amount: number;
  deducted: boolean;
}

interface CalculatorProps {
  stats: Stats | null;
  compact?: boolean;
  totalNetWorth?: number;
}

export default function Calculator({ stats, compact, totalNetWorth }: CalculatorProps) {
  const [items, setItems] = useState<DeductionItem[]>([
    { id: '1', name: 'Rent', amount: 0, deducted: false },
    { id: '2', name: 'Electricity', amount: 0, deducted: false },
    { id: '3', name: 'Internet', amount: 0, deducted: false },
    { id: '4', name: 'Netflix', amount: 0, deducted: false },
    { id: '5', name: 'Spotify', amount: 0, deducted: false },
    { id: '6', name: 'Gym', amount: 0, deducted: false },
  ]);

  const actualBalance = totalNetWorth || 0;

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
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Projected Balance</span>
          <span className="text-sm font-bold text-emerald-500">₹{projectedBalance.toLocaleString()}</span>
        </div>
        <div className="space-y-2">
          {items.filter(i => !i.deducted).slice(0, 2).map(item => (
            <div key={item.id} className="flex justify-between text-[10px] text-muted-foreground">
              <span>{item.name}</span>
              <span>₹{item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter">Subscriptions</h2>
          <p className="text-sm text-muted-foreground mt-1">Track and project your upcoming recurring expenses.</p>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/10 px-8 py-4 rounded-3xl text-right">
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">Projected Net</p>
          <p className="text-3xl font-bold tracking-tighter">₹{projectedBalance.toLocaleString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {items.map(item => (
              <div 
                key={item.id}
                className={`p-6 rounded-3xl border transition-all duration-300 group ${
                  item.deducted 
                    ? 'bg-muted/30 border-border opacity-60' 
                    : 'bg-card border-border hover:border-emerald-500/30 shadow-sm'
                }`}
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl ${item.deducted ? 'bg-muted' : 'bg-emerald-500/10 text-emerald-500'}`}>
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <button 
                    onClick={() => toggleDeducted(item.id)}
                    className={`p-2 rounded-xl transition-all ${
                      item.deducted 
                        ? 'text-emerald-500 bg-emerald-500/10' 
                        : 'text-muted-foreground hover:bg-muted'
                    }`}
                  >
                    {item.deducted ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-bold text-foreground">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                      {item.deducted ? 'Deducted' : 'Pending'}
                    </p>
                  </div>
                  
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">₹</span>
                    <input 
                      type="number"
                      value={item.amount || ''}
                      onChange={(e) => updateAmount(item.id, e.target.value)}
                      className="w-full bg-muted/50 border border-border rounded-xl py-2 pl-7 pr-3 text-sm font-bold focus:outline-none focus:border-emerald-500/50 transition-all"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-8 sticky top-8">
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">Projection</h3>
              <p className="text-xs text-muted-foreground">How your balance looks after all commitments.</p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Current Liquidity</span>
                <span className="text-sm font-bold">₹{actualBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Total Pending</span>
                <span className="text-sm font-bold text-amber-500">- ₹{yetToDeduct.toLocaleString()}</span>
              </div>
              <div className="h-px bg-border" />
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Projected Final</span>
                <span className="text-2xl font-bold text-emerald-500 tracking-tighter">₹{projectedBalance.toLocaleString()}</span>
              </div>
            </div>

            <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4 items-start">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider leading-relaxed">
                Ensure you have enough liquidity in your primary accounts to cover these pending commitments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
