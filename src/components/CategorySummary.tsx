import { Stats } from "../types";
import { motion } from "motion/react";

interface CategorySummaryProps {
  stats: Stats | null;
}

export default function CategorySummary({ stats }: CategorySummaryProps) {
  const categoryData = stats?.categoryStats || [];

  return (
    <div className="space-y-4" id="category-summary">
      {categoryData.length === 0 && (
        <div className="p-12 text-center border border-dashed border-border rounded-3xl">
          <p className="text-[10px] text-muted-foreground italic uppercase tracking-widest">No category data for this period</p>
        </div>
      )}
      {categoryData.map((stat, index) => {
        const net = stat.total_credit - stat.total_expense;
        const totalVolume = stat.total_credit + stat.total_expense;
        const maxVolume = Math.max(...categoryData.map(s => s.total_credit + s.total_expense), 1);
        const percentage = (totalVolume / maxVolume) * 100;

        return (
          <motion.div 
            key={stat.category}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-4 bg-card border border-border rounded-2xl group hover:border-emerald-500/30 transition-all"
          >
            <div className="flex justify-between items-start mb-3">
              <div className="space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">{stat.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">₹{totalVolume.toLocaleString()}</span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Volume</span>
                </div>
              </div>
              <div className="text-right">
                <span className={`text-xs font-bold ${net >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {net >= 0 ? '+' : ''}₹{net.toLocaleString()}
                </span>
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">Net Flow</p>
              </div>
            </div>
            
            <div className="relative h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                className={`h-full rounded-full ${net >= 0 ? 'bg-emerald-500' : 'bg-rose-500'}`}
              />
            </div>

            <div className="flex justify-between mt-2 text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
              <span className="flex items-center gap-1">
                <div className="w-1 h-1 bg-emerald-500 rounded-full" />
                CR: ₹{stat.total_credit.toLocaleString()}
              </span>
              <span className="flex items-center gap-1">
                <div className="w-1 h-1 bg-rose-500 rounded-full" />
                EX: ₹{stat.total_expense.toLocaleString()}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
