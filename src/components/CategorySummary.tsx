import { Stats } from "../types";
import { motion } from "motion/react";

interface CategorySummaryProps {
  stats: Stats | null;
}

export default function CategorySummary({ stats }: CategorySummaryProps) {
  const categoryData = stats?.categoryStats || [];

  return (
    <div className="space-y-8" id="category-summary">
      {categoryData.length === 0 && (
        <div className="p-12 text-center border border-dashed border-border rounded-3xl">
          <p className="text-[10px] text-muted-foreground italic uppercase tracking-widest">No category data for this period</p>
        </div>
      )}
      {categoryData.map((stat) => {
        const net = stat.total_credit - stat.total_expense;
        const maxVal = Math.max(...categoryData.map(s => Math.max(s.total_expense, s.total_credit)), 1);
        
        const expPercentage = (stat.total_expense / maxVal) * 100;
        const crPercentage = (stat.total_credit / maxVal) * 100;

        return (
          <div key={stat.category} className="space-y-3 group">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">{stat.category}</span>
                <div className="flex gap-4 text-[9px] font-mono text-muted-foreground/50">
                  <span>CR: ₹{stat.total_credit.toLocaleString()}</span>
                  <span>EX: ₹{stat.total_expense.toLocaleString()}</span>
                </div>
              </div>
              <span className={`text-xs font-mono font-bold ${net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                {net >= 0 ? '+' : ''}{net.toLocaleString()}
              </span>
            </div>
            
            <div className="space-y-1.5">
              {/* Credit Bar */}
              <div className="h-1 w-full bg-muted/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${crPercentage}%` }}
                  transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                  className="h-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)] rounded-full"
                />
              </div>
              
              {/* Expense Bar */}
              <div className="h-1 w-full bg-muted/50 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${expPercentage}%` }}
                  transition={{ duration: 1, ease: [0.23, 1, 0.32, 1], delay: 0.1 }}
                  className="h-full bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.3)] rounded-full"
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
