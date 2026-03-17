import { motion } from "motion/react";
import AccountGrid from "../AccountGrid";
import { Stats, Transaction, Account } from "../../types";

type Props = {
  transactions: Transaction[];
  stats: Stats | null;
  accounts: Account[];
  ledgerFilter: "all" | "income" | "expense";
  setLedgerFilter: (val: "all" | "income" | "expense") => void;
  onDelete: (id: string) => void;
  actualBalances: { id: string; name: string; balance: number }[];
  totalNetWorth: number;
};

export default function TransactionsView({
  transactions,
  stats,
  ledgerFilter,
  setLedgerFilter,
  onDelete,
  actualBalances,
  totalNetWorth,
}: Props) {
  const filtered = transactions.filter((t) => {
    if (ledgerFilter === "all") return true;
    if (ledgerFilter === "income") return t.type === "credit";
    if (ledgerFilter === "expense") return t.type === "expense";
    return true;
  });

  return (
    <motion.div
      key="transactions"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-8"
    >
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter">
            Financial Ledger
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Detailed history of your income and expenditures.
          </p>
        </div>

        {/* Filters */}
        <div className="flex bg-muted/50 p-1 rounded-xl border border-border">
          {(["all", "income", "expense"] as const).map((type) => (
            <button
              key={type}
              onClick={() => setLedgerFilter(type)}
              className={`px-6 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${
                ledgerFilter === type
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <AccountGrid
        transactions={filtered}
        stats={stats}
        onDelete={onDelete}
        actualBalances={actualBalances}
        totalNetWorth={totalNetWorth}
      />
    </motion.div>
  );
}
