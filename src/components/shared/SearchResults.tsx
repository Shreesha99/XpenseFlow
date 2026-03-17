import { Transaction, Account } from "../../types";
import { format, parseISO } from "date-fns";
import { motion, AnimatePresence } from "motion/react";
import { Search, X, Tag, CreditCard, Calendar, ArrowRight } from "lucide-react";

interface SearchResultsProps {
  results: Transaction[];
  accounts: Account[];
  onClose: () => void;
  onSelect: (transaction: Transaction) => void;
  searchQuery: string;
}

export default function SearchResults({
  results,
  accounts,
  onClose,
  onSelect,
  searchQuery,
}: SearchResultsProps) {
  if (!searchQuery) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 5, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
      className="absolute z-150 w-full bg-card border border-border rounded-2xl shadow-2xl overflow-hidden max-h-100 flex flex-col"
    >
      <div className="p-4 border-b border-border bg-muted/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Search className="w-3 h-3 text-emerald-500" />
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Search Results ({results.length})
          </span>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-muted rounded-lg transition-colors"
        >
          <X className="w-3 h-3 text-muted-foreground" />
        </button>
      </div>

      <div className="overflow-y-auto no-scrollbar flex-1">
        {results.length === 0 ? (
          <div className="p-8 text-center space-y-2">
            <p className="text-sm font-medium text-foreground">
              No transactions found
            </p>
            <p className="text-xs text-muted-foreground">
              Try searching for a different title, category, or amount.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {results.map((t) => {
              const account = accounts.find((a) => a.id === t.account_id);
              return (
                <button
                  key={t.id}
                  onClick={() => onSelect(t)}
                  className="w-full p-4 text-left hover:bg-emerald-500/3 transition-colors group flex items-center justify-between gap-4"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-1.5 h-1.5 rounded-full ${
                          t.type === "credit"
                            ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)]"
                            : "bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]"
                        }`}
                      />
                      <p className="text-sm font-bold text-foreground truncate group-hover:text-emerald-500 transition-colors">
                        {t.title}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 opacity-50" />
                        {format(parseISO(String(t.date)), "dd MMM yyyy")}
                      </div>
                      <div className="flex items-center gap-1">
                        <Tag className="w-3 h-3 opacity-50" />
                        {t.category}
                      </div>
                      <div className="flex items-center gap-1">
                        <CreditCard className="w-3 h-3 opacity-50" />
                        {account?.name || "Unknown"}
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p
                      className={`text-sm font-bold tracking-tight ${
                        t.type === "credit"
                          ? "text-emerald-500"
                          : "text-rose-500"
                      }`}
                    >
                      {t.type === "credit" ? "+" : "-"} ₹
                      {t.amount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                      })}
                    </p>
                    <div className="flex items-center justify-end gap-1 text-[8px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500">
                      View Details <ArrowRight className="w-2 h-2" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}
