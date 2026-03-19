import { Transaction, Stats, Account } from "../types";
import { format } from "date-fns";
import {
  Trash2,
  Smartphone,
  Banknote,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { useMemo, useState } from "react";
import CustomSelect from "./shared/CustomSelect";
import { AnimatePresence, motion } from "motion/react";

interface AccountGridProps {
  transactions: Transaction[];
  stats: Stats | null;
  onDelete: (id: string) => void;
  compact?: boolean;
  actualBalances?: { id: string; name: string; balance: number }[];
  totalNetWorth?: number;
  accounts: Account[];
}

export default function AccountGrid({
  transactions,
  stats,
  onDelete,
  compact,
  actualBalances,
  totalNetWorth,
  accounts,
}: AccountGridProps) {
  const summary = stats?.summary || {
    digital_credits: 0,
    in_hand_credits: 0,
    digital_expenses: 0,
    in_hand_expenses: 0,
  };
  const accountMap = useMemo(() => {
    const map: Record<string, Account> = {};
    accounts.forEach((acc) => {
      map[String(acc.id)] = acc;
    });
    return map;
  }, [accounts]);
  const [showFilters, setShowFilters] = useState(false);
  const [sortKey, setSortKey] = useState<"date" | "amount" | "type">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const [filterType, setFilterType] = useState<"all" | "credit" | "expense">(
    "all"
  );
  const [filterMode, setFilterMode] = useState<"all" | "digital" | "cash">(
    "all"
  );
  const [filterAccount, setFilterAccount] = useState<string>("all");

  const netChange =
    (Number(summary.digital_credits) || 0) +
    (Number(summary.in_hand_credits) || 0) -
    (Number(summary.digital_expenses) || 0) -
    (Number(summary.in_hand_expenses) || 0);
  const displayTotalBalance =
    totalNetWorth !== undefined
      ? totalNetWorth
      : actualBalances?.reduce((sum, acc) => sum + acc.balance, 0) || 0;

  const BankLogo = ({
    url,
    name,
    className = "w-4 h-4",
  }: {
    url?: string;
    name: string;
    className?: string;
  }) => {
    const [error, setError] = useState(false);
    if (!url || error) {
      return (
        <div
          className={`${className} bg-emerald-500/10 text-emerald-500 flex items-center justify-center text-[8px] font-bold rounded-full border border-emerald-500/20`}
        >
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

  const typeOptions = [
    { id: "all", name: "All Types" },
    { id: "credit", name: "Credits", icon: <Smartphone className="w-3 h-3" /> },
    { id: "expense", name: "Expenses", icon: <Banknote className="w-3 h-3" /> },
  ];

  const modeOptions = [
    { id: "all", name: "All Modes" },
    {
      id: "digital",
      name: "Digital",
      icon: <Smartphone className="w-3 h-3" />,
    },
    {
      id: "cash",
      name: "Cash",
      icon: <Banknote className="w-3 h-3" />,
    },
  ];

  const accountOptions = [
    { id: "all", name: "All Accounts" },
    ...accounts.map((acc) => ({
      id: String(acc.id),
      name: acc.name,
      icon: <BankLogo url={acc.logo_url} name={acc.name} className="w-4 h-4" />,
    })),
  ];

  const processedTransactions = useMemo(() => {
    let data = [...transactions];

    // FILTERING
    data = data.filter((t) => {
      if (filterType !== "all" && t.type !== filterType) return false;
      if (filterMode !== "all" && t.mode !== filterMode) return false;
      if (filterAccount !== "all" && String(t.account_id) !== filterAccount)
        return false;
      return true;
    });

    data.sort((a, b) => {
      let result = 0;

      if (sortKey === "date") {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        result = timeA - timeB;
      } else if (sortKey === "amount") {
        result = (a.amount || 0) - (b.amount || 0);
      } else if (sortKey === "type") {
        const order = { credit: 1, expense: 2 };
        result = order[a.type] - order[b.type];
      }

      // ✅ fallback tie-breaker (VERY IMPORTANT)
      if (result === 0) {
        const timeA = a.date ? new Date(a.date).getTime() : 0;
        const timeB = b.date ? new Date(b.date).getTime() : 0;
        result = timeB - timeA; // latest first
      }

      return sortOrder === "asc" ? result : -result;
    });

    return data;
  }, [transactions, sortKey, sortOrder, filterType, filterMode, filterAccount]);

  return (
    <div className="space-y-6" id="account-grid">
      {!compact && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div className="p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-3xl">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-2">
              Total Income
            </p>
            <p className="text-3xl font-bold text-foreground tracking-tighter">
              ₹
              {(
                (summary.digital_credits || 0) + (summary.in_hand_credits || 0)
              ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-6 bg-rose-500/5 border border-rose-500/10 rounded-3xl">
            <p className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-2">
              Total Outflow
            </p>
            <p className="text-3xl font-bold text-foreground tracking-tighter">
              ₹
              {(
                (summary.digital_expenses || 0) +
                (summary.in_hand_expenses || 0)
              ).toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </p>
          </div>
          <div className="p-6 bg-blue-500/5 border border-blue-500/10 rounded-3xl sm:col-span-2 lg:col-span-1">
            <p className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-2">
              Current Balance (Actual)
            </p>
            <p className="text-3xl font-bold text-foreground tracking-tighter">
              ₹
              {(displayTotalBalance || 0).toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
            <p
              className={`text-[10px] font-bold mt-2 ${
                netChange >= 0 ? "text-emerald-500" : "text-rose-500"
              }`}
            >
              {netChange >= 0 ? "+" : ""}₹{netChange.toLocaleString()} this
              period
            </p>
          </div>
        </div>
      )}
      <div className="hidden md:flex flex-wrap items-center gap-3 p-4 border border-border rounded-3xl bg-linear-to-b from-card to-card/50 mb-4 shadow-sm">
        {/* LEFT SIDE */}
        <div className="flex flex-wrap items-center gap-3 flex-1">
          <CustomSelect
            options={typeOptions}
            value={filterType}
            onChange={(v) => setFilterType(v as any)}
            className="min-w-35 flex-1"
            showDefaultIcon={false}
          />

          <CustomSelect
            options={modeOptions}
            value={filterMode}
            onChange={(v) => setFilterMode(v as any)}
            className="min-w-35 flex-1"
          />

          <CustomSelect
            options={accountOptions}
            value={filterAccount}
            onChange={(v) => setFilterAccount(v)}
            className="min-w-40 flex-1"
          />
        </div>

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted/50 p-1 rounded-xl border border-border">
            {[
              { key: "date", label: "Date" },
              { key: "amount", label: "Amount" },
              { key: "type", label: "Type" },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => {
                  if (sortKey === key) {
                    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
                  } else {
                    setSortKey(key as any);
                    setSortOrder("desc");
                  }
                }}
                className={`px-3 py-1.5 text-xs rounded-lg font-semibold transition-all ${
                  sortKey === key
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Sort direction toggle */}
          <button
            onClick={() =>
              setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))
            }
            className="px-3 py-1.5 text-xs rounded-xl border border-border bg-muted/40 text-muted-foreground hover:text-foreground transition"
          >
            {sortOrder === "asc" ? "↑ Asc" : "↓ Desc"}
          </button>
        </div>
      </div>
      {/* Desktop Table View */}
      <div className="hidden md:block rounded-3xl border border-border bg-card/50 overflow-hidden">
        {/* HEADER */}
        <div className="overflow-x-auto">
          <table className="w-full table-fixed text-xs border-collapse">
            <thead className="bg-muted/30 text-muted-foreground uppercase tracking-[0.2em] text-[10px] font-bold border-b border-border">
              <tr>
                <th className="p-5 text-left w-30">Date</th>
                <th className="p-5 text-left">Credits</th>
                <th className="p-5 text-right w-30">Amount</th>
                <th className="p-5 text-left">Expenses</th>
                <th className="p-5 text-right w-30">Amount</th>
                <th className="p-5 text-left w-35">Bank</th>
                <th className="p-5 text-left w-35">Category</th>
                <th className="p-5 text-center w-15"></th>
              </tr>
            </thead>
          </table>
        </div>

        {/* BODY */}
        <div className="max-h-125 overflow-y-auto overflow-x-auto">
          <table className="w-full table-fixed text-xs border-collapse">
            <tbody className="divide-y divide-border">
              {processedTransactions.map((t) => {
                const account = accountMap[String(t.account_id)];

                return (
                  <tr
                    key={t.id}
                    className="group hover:bg-emerald-500/2 transition-colors"
                  >
                    <td className="p-5 text-muted-foreground font-mono w-30">
                      {t.date ? format(new Date(t.date), "dd.MM.yy") : "--"}
                    </td>

                    <td className="p-5">
                      {t.type === "credit" ? (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-emerald-500" />
                          <span className="font-semibold">{t.title}</span>
                        </div>
                      ) : (
                        <span className="opacity-10">--</span>
                      )}
                    </td>

                    <td className="p-5 text-right font-mono text-emerald-500 w-30">
                      {t.type === "credit"
                        ? `₹${t.amount?.toLocaleString()}`
                        : ""}
                    </td>

                    <td className="p-5">
                      {t.type === "expense" ? (
                        <div className="flex items-center gap-3">
                          <div className="w-2 h-2 rounded-full bg-rose-500" />
                          <span className="font-semibold">{t.title}</span>
                        </div>
                      ) : (
                        <span className="opacity-10">--</span>
                      )}
                    </td>

                    <td className="p-5 text-right font-mono text-rose-500 w-30">
                      {t.type === "expense"
                        ? `₹${t.amount?.toLocaleString()}`
                        : ""}
                    </td>

                    <td className="p-5 w-35">
                      <span className="text-[10px] font-bold uppercase">
                        {account?.name || "Main"}
                      </span>
                    </td>

                    <td className="p-5 w-35">
                      <span className="text-[10px] font-bold uppercase">
                        {t.category || "Uncategorized"}
                      </span>
                    </td>

                    <td className="p-5 text-center w-15">
                      <button
                        onClick={() => onDelete(t.id)}
                        className="p-2 hover:text-rose-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      <div className="md:hidden w-full">
        <button
          onClick={() => setShowFilters((v) => !v)}
          className="w-full flex items-center justify-between px-4 py-2 rounded-xl bg-muted/50 border border-border text-sm font-semibold"
        >
          Filters
          <ChevronDown
            className={`w-4 h-4 transition-transform ${
              showFilters ? "rotate-180" : ""
            }`}
          />
        </button>
      </div>
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden w-full overflow-visible"
          >
            <div className="mt-2 p-3 rounded-xl border border-border bg-muted/40 flex flex-col gap-3">
              {/* Type */}
              <CustomSelect
                options={typeOptions}
                value={filterType}
                onChange={(v) => setFilterType(v as any)}
              />

              {/* Mode */}
              <CustomSelect
                options={modeOptions}
                value={filterMode}
                onChange={(v) => setFilterMode(v as any)}
              />

              {/* Account */}
              <CustomSelect
                options={accountOptions}
                value={filterAccount}
                onChange={(v) => setFilterAccount(v)}
              />

              {/* Actions */}
              <div className="flex gap-2 pt-1">
                <button
                  onClick={() => {
                    setFilterType("all");
                    setFilterMode("all");
                    setFilterAccount("all");
                  }}
                  className="flex-1 py-2 text-xs rounded-xl border border-border text-muted-foreground hover:text-foreground"
                >
                  Reset
                </button>

                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-2 text-xs rounded-xl bg-emerald-500 text-white"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Mobile Card View */}
      <div className="md:hidden space-y-4">
        {processedTransactions.map((t) => {
          const account = accountMap[String(t.account_id)];

          return (
            <div
              key={t.id}
              className="p-6 bg-card border border-border rounded-3xl space-y-4"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      t.type === "credit" ? "bg-emerald-500" : "bg-rose-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-bold text-foreground">
                      {t.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono">
                      {t.date ? format(new Date(t.date), "dd MMM yyyy") : "—"}
                    </p>
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
                    <BankLogo
                      url={account?.logo_url}
                      name={account?.name || "Main"}
                    />

                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      {account?.name || "Main"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-muted border border-border text-[8px] font-bold text-muted-foreground uppercase tracking-widest">
                      {t.category}
                    </span>
                    <span
                      className={`text-[8px] px-2 py-0.5 rounded-full border ${
                        t.mode === "digital"
                          ? "border-blue-500/20 bg-blue-500/5 text-blue-400"
                          : "border-amber-500/20 bg-amber-500/5 text-amber-400"
                      } uppercase font-bold tracking-widest`}
                    >
                      {t.mode === "digital" ? "Digital" : "Cash"}
                    </span>
                  </div>
                </div>
                <p
                  className={`text-xl font-bold tracking-tighter ${
                    t.type === "credit" ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {t.type === "credit" ? "+" : "-"} ₹
                  {(t.amount || 0).toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {processedTransactions.length === 0 ? (
        <div className="relative overflow-hidden p-10 md:p-14 rounded-3xl border border-border bg-linear-to-b from-card to-muted/20 text-center">
          <div className="absolute inset-0 opacity-40 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 w-75 h-75 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/10 blur-3xl rounded-full" />
          </div>

          <div className="relative flex flex-col items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-muted border border-border flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-muted-foreground opacity-60" />
            </div>

            <div className="space-y-1">
              <p className="text-base font-semibold text-foreground">
                No transactions found
              </p>
              <p className="text-xs text-muted-foreground">
                {transactions.length === 0
                  ? "Start by adding your first transaction"
                  : "Try adjusting your filters"}
              </p>
            </div>

            {transactions.length > 0 && (
              <button
                onClick={() => {
                  setFilterType("all");
                  setFilterMode("all");
                  setFilterAccount("all");
                }}
                className="mt-2 px-4 py-2 text-xs rounded-xl border border-border bg-muted/40 text-muted-foreground hover:text-foreground hover:bg-muted transition"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
