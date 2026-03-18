import { Tag } from "lucide-react";
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
        <div className="relative overflow-hidden p-10 md:p-14 rounded-[2.5rem] border border-border bg-linear-to-b from-card to-muted/20 text-center">
          {/* glow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 w-65 h-65 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/10 blur-3xl rounded-full" />
          </div>

          <div className="relative flex flex-col items-center gap-5">
            {/* icon */}
            <div className="w-14 h-14 rounded-2xl bg-background/60 backdrop-blur border border-border flex items-center justify-center">
              {/* You can swap icon if needed */}
              <Tag className="w-6 h-6 text-emerald-500" />
            </div>

            {/* text */}
            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                No category insights
              </p>
              <p className="text-xs text-muted-foreground">
                Once transactions are categorized, insights will appear here
              </p>
            </div>
          </div>
        </div>
      )}
      {categoryData.map((stat, index) => {
        const net = stat.total_credit - stat.total_expense;
        const totalVolume = stat.total_credit + stat.total_expense;
        const maxVolume = Math.max(
          ...categoryData.map((s) => s.total_credit + s.total_expense),
          1
        );
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
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground group-hover:text-foreground transition-colors">
                  {stat.category}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold">
                    ₹{totalVolume.toLocaleString()}
                  </span>
                  <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                    Volume
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-bold ${
                    net >= 0 ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {net >= 0 ? "+" : ""}₹{net.toLocaleString()}
                </span>
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                  Net Flow
                </p>
              </div>
            </div>

            <div className="relative h-1.5 w-full bg-muted/50 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
                className={`h-full rounded-full ${
                  net >= 0 ? "bg-emerald-500" : "bg-rose-500"
                }`}
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
