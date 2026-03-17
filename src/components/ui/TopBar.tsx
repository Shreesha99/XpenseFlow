import { AnimatePresence } from "motion/react";
import {
  Search,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  HelpCircle,
  LogOut,
} from "lucide-react";
import {
  format,
  addMonths,
  subMonths,
  addDays,
  subDays,
  addYears,
  subYears,
} from "date-fns";
import ThemeToggle from "../ThemeToggle";
import SearchResults from "../SearchResults";
import ReportExport from "../ReportExport";
import { parseISO } from "date-fns";
import { Account, Transaction } from "../../types";

type Props = {
  user: any;
  accounts: Account[];
  filterMode: "day" | "month" | "year" | "custom";
  setFilterMode: (mode: "day" | "month" | "year" | "custom") => void;
  filterDate: Date;
  setFilterDate: (date: Date) => void;
  customRange: { start: Date; end: Date };
  setCustomRange: (range: { start: Date; end: Date }) => void;
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  showSearchResults: boolean;
  setShowSearchResults: (v: boolean) => void;
  searchResults: Transaction[];
  setActiveView: (v: any) => void;
  setShowForm: (v: boolean) => void;
  logOut: () => void;
  runTour: boolean;
  setRunTour: (v: boolean) => void;
  filteredTransactions: Transaction[];
  showForm: boolean;
};

export default function TopBar({
  user,
  accounts,
  filterMode,
  setFilterMode,
  filterDate,
  setFilterDate,
  customRange,
  setCustomRange,
  selectedAccountId,
  setSelectedAccountId,
  searchQuery,
  setSearchQuery,
  showSearchResults,
  setShowSearchResults,
  searchResults,
  setActiveView,
  setShowForm,
  logOut,
  setRunTour,
  filteredTransactions,
  showForm,
}: Props) {
  return (
    <header className="min-h-0 lg:min-h-16 border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-40 py-1.5 lg:py-3 px-4 md:px-8">
      <div className="max-w-400 mx-auto flex flex-col lg:flex-row items-center gap-1.5 lg:gap-4">
        {/* Mobile Header Top Row - Isolated to Mobile */}
        <div className="flex items-center justify-between w-full lg:hidden">
          <div className="flex items-center gap-2">
            <img src="/logo.svg" alt="logo" className="w-10 h-10" />
            <h1 className="text-xs font-bold tracking-tight text-foreground">
              XpenseFlow
            </h1>
          </div>
          <div className="flex items-center gap-1.5">
            <ThemeToggle />
            {user && (
              <div className="flex items-center gap-1.5">
                <img
                  src={
                    user.photoURL ||
                    `https://ui-avatars.com/api/?name=${
                      user.displayName || user.email
                    }&background=10b981&color=fff`
                  }
                  alt="Profile"
                  className="w-6 h-6 rounded-full border border-border"
                  referrerPolicy="no-referrer"
                />
                <button
                  onClick={logOut}
                  className="p-1 text-muted-foreground hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/10"
                  title="Logout"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Header Elements */}
        <div className="hidden lg:flex items-center gap-3 w-full lg:w-auto">
          <div
            id="tour-filters"
            className="flex items-center gap-1 bg-muted/50 border border-border rounded-xl p-0.5"
          >
            {(["day", "month", "year", "custom"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setFilterMode(mode)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                  filterMode === mode
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                }`}
              >
                {mode}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl p-1">
            {filterMode !== "custom" ? (
              <>
                <button
                  onClick={() => {
                    if (filterMode === "day")
                      setFilterDate(subDays(filterDate, 1));
                    if (filterMode === "month")
                      setFilterDate(subMonths(filterDate, 1));
                    if (filterMode === "year")
                      setFilterDate(subYears(filterDate, 1));
                  }}
                  className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-sm font-bold text-foreground min-w-30 text-center tracking-tight truncate">
                  {filterMode === "day" && format(filterDate, "dd MMM yy")}
                  {filterMode === "month" && format(filterDate, "MMM yyyy")}
                  {filterMode === "year" && format(filterDate, "yyyy")}
                </span>

                <button
                  onClick={() => {
                    if (filterMode === "day")
                      setFilterDate(addDays(filterDate, 1));
                    if (filterMode === "month")
                      setFilterDate(addMonths(filterDate, 1));
                    if (filterMode === "year")
                      setFilterDate(addYears(filterDate, 1));
                  }}
                  className="p-1.5 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 px-3 py-2">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Range
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="date"
                    value={format(customRange.start, "yyyy-MM-dd")}
                    onChange={(e) =>
                      setCustomRange({
                        ...customRange,
                        start: new Date(e.target.value),
                      })
                    }
                    className="bg-transparent border-none text-[10px] font-bold text-foreground focus:outline-none w-24"
                  />
                  <span className="text-muted-foreground text-[10px]">-</span>
                  <input
                    type="date"
                    value={format(customRange.end, "yyyy-MM-dd")}
                    onChange={(e) =>
                      setCustomRange({
                        ...customRange,
                        end: new Date(e.target.value),
                      })
                    }
                    className="bg-transparent border-none text-[10px] font-bold text-foreground focus:outline-none w-24"
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile Header Elements */}
        <div className="flex lg:hidden flex-col items-center gap-1.5 w-full">
          <div className="w-full overflow-x-auto no-scrollbar">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setSelectedAccountId("all")}
                className={`px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                  selectedAccountId === "all"
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20"
                    : "bg-muted/50 text-muted-foreground border-border hover:text-foreground"
                }`}
              >
                All Accounts
              </button>

              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => setSelectedAccountId(acc.id)}
                  className={`px-2.5 py-1 rounded-lg text-[8px] font-bold uppercase tracking-widest transition-all whitespace-nowrap border ${
                    selectedAccountId === acc.id
                      ? "bg-emerald-600 text-white border-emerald-600 shadow-lg shadow-emerald-500/20"
                      : "bg-muted/50 text-muted-foreground border-border hover:text-foreground"
                  }`}
                >
                  {acc.name}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-1.5 w-full">
            <div className="flex items-center gap-0.5 bg-muted/50 border border-border rounded-lg p-0.5 overflow-x-auto no-scrollbar flex-1">
              {(["day", "month", "year", "custom"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilterMode(mode)}
                  className={`px-2 py-0.5 rounded-md text-[8px] font-bold uppercase tracking-widest transition-all whitespace-nowrap ${
                    filterMode === mode
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-0.5 bg-muted/50 border border-border rounded-lg p-0.5 flex-1 justify-between">
              {filterMode !== "custom" ? (
                <>
                  <button
                    onClick={() => {
                      if (filterMode === "day")
                        setFilterDate(subDays(filterDate, 1));
                      if (filterMode === "month")
                        setFilterDate(subMonths(filterDate, 1));
                      if (filterMode === "year")
                        setFilterDate(subYears(filterDate, 1));
                    }}
                    className="p-0.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <ChevronLeft className="w-3 h-3" />
                  </button>

                  <span className="text-[9px] font-bold text-foreground min-w-15 text-center tracking-tight truncate">
                    {filterMode === "day" && format(filterDate, "dd MMM yy")}
                    {filterMode === "month" && format(filterDate, "MMM yyyy")}
                    {filterMode === "year" && format(filterDate, "yyyy")}
                  </span>

                  <button
                    onClick={() => {
                      if (filterMode === "day")
                        setFilterDate(addDays(filterDate, 1));
                      if (filterMode === "month")
                        setFilterDate(addMonths(filterDate, 1));
                      if (filterMode === "year")
                        setFilterDate(addYears(filterDate, 1));
                    }}
                    className="p-0.5 hover:bg-accent rounded-md transition-colors text-muted-foreground hover:text-foreground"
                  >
                    <ChevronRight className="w-3 h-3" />
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1 px-1.5 py-0.5">
                  <input
                    type="date"
                    value={format(customRange.start, "yyyy-MM-dd")}
                    onChange={(e) =>
                      setCustomRange({
                        ...customRange,
                        start: new Date(e.target.value),
                      })
                    }
                    className="bg-transparent border-none text-[8px] font-bold text-foreground focus:outline-none w-16"
                  />
                  <span className="text-muted-foreground text-[8px]">→</span>
                  <input
                    type="date"
                    value={format(customRange.end, "yyyy-MM-dd")}
                    onChange={(e) =>
                      setCustomRange({
                        ...customRange,
                        end: new Date(e.target.value),
                      })
                    }
                    className="bg-transparent border-none text-[8px] font-bold text-foreground focus:outline-none w-16"
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Search + Actions */}
        <div className="flex items-center gap-3 w-full lg:flex-1">
          <div className="relative flex-1" id="tour-search">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search transactions, categories, amounts (>100)..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchResults(true);
              }}
              onFocus={() => setShowSearchResults(true)}
              className="w-full bg-muted/50 border border-border rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
            />

            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setShowSearchResults(false);
                }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            <AnimatePresence>
              {showSearchResults && searchQuery && (
                <div className="absolute top-full left-0 w-full mt-2 z-150">
                  <div
                    className="fixed inset-0 z-[-1]"
                    onClick={() => setShowSearchResults(false)}
                  />
                  <SearchResults
                    results={searchResults}
                    accounts={accounts}
                    searchQuery={searchQuery}
                    onClose={() => setShowSearchResults(false)}
                    onSelect={(t) => {
                      const date = parseISO(String(t.date));
                      setFilterDate(date);
                      setFilterMode("month");
                      setSelectedAccountId("all");
                      setActiveView("transactions");
                      setShowSearchResults(false);
                      setSearchQuery("");
                    }}
                  />
                </div>
              )}
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setRunTour(true)}
              className="p-2 rounded-full hover:bg-muted text-muted-foreground hover:text-emerald-500 transition-all"
              title="Take the tour"
            >
              <HelpCircle className="w-5 h-5" />
            </button>

            <ReportExport transactions={filteredTransactions} />

            <button
              id="tour-new-entry"
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95 whitespace-nowrap"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Entry</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
