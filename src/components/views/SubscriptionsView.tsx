import Calculator from "../Calculator";
import { Stats } from "../../types";
import { motion } from "motion/react";
import { Plus } from "lucide-react";
import { useState } from "react";

type Props = {
  stats: Stats | null;
  currentBalance: number;

  filterMode: "day" | "month" | "year" | "custom";
  filterDate: Date;
  customRange: { start: Date; end: Date };
};

export default function SubscriptionsView({
  stats,
  currentBalance,
  filterMode,
  filterDate,
  customRange,
}: Props) {
  const [subCount, setSubCount] = useState(0);
  return (
    <motion.div
      id="tour-planning-view"
      key="planning"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3, ease: "easeOut" }}
      className="space-y-8 md:space-y-12"
    >
      {/* HEADER */}
      <div
        id="tour-planning-header"
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
            Subscriptions
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track and project your recurring expenses.
          </p>
        </div>

        {/* ACTIONS */}
        <div className="flex items-center gap-3">
          <button
            id="tour-add-subscription"
            onClick={() => window.dispatchEvent(new Event("add-subscription"))}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Subscription
          </button>

          {/* <div className="bg-emerald-500/5 border border-emerald-500/10 px-6 py-3 rounded-2xl text-right">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
              Projected Net
            </p>
            <p className="text-xl font-bold tracking-tighter text-foreground">
              ₹{currentBalance.toLocaleString()}
            </p>
          </div> */}
        </div>
      </div>
      <div
        id="tour-planning-stats"
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-6">
          <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">
            Projected Net
          </p>
          <p className="text-2xl font-bold tracking-tighter text-foreground">
            ₹{currentBalance.toLocaleString()}
          </p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            Planning Scope
          </p>
          <p className="text-sm font-bold">{filterMode.toUpperCase()}</p>
        </div>

        <div className="bg-card border border-border rounded-2xl p-6">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">
            Active Subscriptions
          </p>
          <p className="text-2xl font-bold">{subCount}</p>
        </div>
      </div>

      {/* CONTENT */}
      <div id="tour-planning-calculator">
        <Calculator
          stats={stats}
          currentBalance={currentBalance}
          filterMode={filterMode}
          filterDate={filterDate}
          customRange={customRange}
          onCountChange={setSubCount}
        />
      </div>
    </motion.div>
  );
}
