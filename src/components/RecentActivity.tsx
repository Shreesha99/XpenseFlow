import { Account, Transaction } from "../types";
import { format, parseISO } from "date-fns";
import {
  ArrowUpRight,
  ArrowDownRight,
  Smartphone,
  Banknote,
  Trash2,
} from "lucide-react";
import { motion } from "motion/react";

interface RecentActivityProps {
  transactions: Transaction[];
  accounts: Account[];
  onDelete: (id: string) => void;
}

export default function RecentActivity({
  transactions,
  onDelete,
  accounts,
}: RecentActivityProps) {
  if (transactions.length === 0) {
    return (
      <div className="p-12 text-center bg-muted/20 rounded-[2.5rem] border border-dashed border-border">
        <p className="text-sm text-muted-foreground italic">
          No recent activity found.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {transactions.map((t, index) => {
        const accountName =
          accounts.find((a) => a.id === t.account_id)?.name || "Unknown";

        return (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="group flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/[0.02] transition-all"
          >
            <div className="flex items-center gap-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  t.type === "credit"
                    ? "bg-emerald-500/10 text-emerald-500"
                    : "bg-rose-500/10 text-rose-500"
                }`}
              >
                {t.type === "credit" ? (
                  <ArrowDownRight className="w-5 h-5" />
                ) : (
                  <ArrowUpRight className="w-5 h-5" />
                )}
              </div>

              <div className="space-y-0.5">
                <p className="text-sm font-bold tracking-tight text-foreground">
                  {t.title}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    {t.category}
                  </span>
                  <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                  <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                    {format(parseISO(String(t.date)), "dd MMM")}
                  </span>
                  <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
                  <div className="flex items-center gap-1">
                    {t.mode === "digital" ? (
                      <Smartphone className="w-2.5 h-2.5 opacity-50" />
                    ) : (
                      <Banknote className="w-2.5 h-2.5 opacity-50" />
                    )}
                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest">
                      {t.mode === "in_hand" ? "Cash" : "Digital"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p
                  className={`text-sm font-bold tracking-tight ${
                    t.type === "credit" ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {t.type === "credit" ? "+" : "-"} ₹{t.amount.toLocaleString()}
                </p>
                <p className="text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                  {accountName}
                </p>
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(t.id);
                }}
                className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
