import { Account, Transaction } from "../types";
import { format, parseISO } from "date-fns";
import {
  ArrowUpRight,
  ArrowDownRight,
  Smartphone,
  Banknote,
  Trash2,
  Sheet,
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
      <div className="relative overflow-hidden p-10 md:p-14 rounded-[2.5rem] border border-border bg-linear-to-b from-card to-muted/20 text-center">
        {/* glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 w-65 h-65 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/10 blur-3xl rounded-full" />
        </div>

        <div className="relative flex flex-col items-center gap-5">
          {/* icon */}
          <div className="w-14 h-14 rounded-2xl bg-background/60 backdrop-blur border border-border flex items-center justify-center">
            <Sheet className="w-6 h-6 text-emerald-500" />
          </div>

          {/* text */}
          <div className="space-y-1">
            <p className="text-base font-semibold text-foreground">
              No recent activity
            </p>
            <p className="text-xs text-muted-foreground">
              Your transactions will appear here once you start tracking
            </p>
          </div>
        </div>
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
            className="group flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-emerald-500/30 hover:shadow-lg hover:shadow-emerald-500/2 transition-all"
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
                className="
    p-2.5 md:p-2
    text-muted-foreground 
    hover:text-rose-500 hover:bg-rose-500/10 
    rounded-lg transition-all

    opacity-100 md:opacity-0 md:group-hover:opacity-100
  "
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
