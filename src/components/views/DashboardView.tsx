import { motion } from "motion/react";
import {
  LayoutDashboard,
  PieChart,
  Calculator as CalcIcon,
} from "lucide-react";
import BankLogo from "../ui/BankLogo";
import DashboardInsights from "../ui/DashboardInsights";
import RecentActivity from "../RecentActivity";
import CategorySummary from "../CategorySummary";
import Calculator from "../Calculator";
import { Transaction, Account, Stats } from "../../types";

interface DashboardViewProps {
  actualCurrentBalance: number;
  totalCredits: number;
  totalExpenses: number;
  selectedAccountId: string;
  filteredAccountBalances: Account[];
  transactions: Transaction[];
  filteredTransactions: Transaction[];
  accounts: Account[];
  stats: Stats | null;
  handleDelete: (id: string) => void;
  setActiveView: (view: any) => void;
}

export default function DashboardView({
  actualCurrentBalance,
  totalCredits,
  totalExpenses,
  selectedAccountId,
  filteredAccountBalances,
  transactions,
  filteredTransactions,
  accounts,
  stats,
  handleDelete,
  setActiveView,
}: DashboardViewProps) {
  return (
    <motion.div
      key="dashboard"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
      className="space-y-12"
    >
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-8 md:p-12">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 md:gap-12">
            <div className="space-y-4 md:space-y-6">
              <p className="font-display italic text-4xl sm:text-5xl md:text-6xl lg:text-7xl text-foreground leading-[0.9] tracking-tighter">
                Financial <br />
                <span className="text-emerald-500">Intelligence.</span>
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground max-w-md leading-relaxed">
                Your personal command center for wealth management. Track,
                analyze, and optimize your financial journey with real-time
                precision.
              </p>
            </div>

            <div
              id="tour-balance"
              className="flex flex-col sm:flex-row items-start sm:items-center gap-6 sm:gap-8 md:gap-12 bg-background/40 backdrop-blur-sm border border-emerald-500/10 p-6 sm:p-8 rounded-4xl w-full lg:w-auto overflow-hidden"
            >
              <div className="space-y-1 min-w-0">
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                  Total Liquidity
                </p>
                <p className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tighter text-foreground break-all sm:break-normal">
                  ₹
                  {actualCurrentBalance.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                  })}
                </p>
              </div>

              <div className="hidden sm:block w-px h-12 bg-emerald-500/20 shrink-0" />

              <div className="flex gap-8 sm:gap-12 shrink-0">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em]">
                    Inflow
                  </p>
                  <p className="text-xl sm:text-2xl font-bold tracking-tighter text-emerald-500">
                    ₹{totalCredits.toLocaleString()}
                  </p>
                </div>

                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-rose-500 uppercase tracking-[0.2em]">
                    Outflow
                  </p>
                  <p className="text-xl sm:text-2xl font-bold tracking-tighter text-rose-500">
                    ₹{totalExpenses.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bank Breakdown */}
          {selectedAccountId === "all" &&
            filteredAccountBalances.length > 0 && (
              <div className="mt-8 sm:mt-12 pt-8 sm:pt-12 border-t border-emerald-500/10">
                <div className="flex items-center justify-between mb-6 sm:mb-8">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">
                    Bank Breakdown
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {filteredAccountBalances.map((acc) => (
                    <div
                      key={acc.id}
                      className="p-4 sm:p-6 bg-background/50 border border-emerald-500/10 rounded-2xl sm:rounded-3xl"
                    >
                      <div className="flex items-center gap-3 mb-3 sm:mb-4">
                        <BankLogo
                          url={acc.logo_url}
                          name={acc.name}
                          className="w-6 h-6 sm:w-8 sm:h-8"
                        />
                        <p className="text-[10px] font-bold text-foreground truncate uppercase tracking-widest">
                          {acc.name}
                        </p>
                      </div>

                      <p
                        className={`text-base sm:text-lg font-bold tracking-tighter ${
                          acc.balance >= 0 ? "text-foreground" : "text-rose-500"
                        }`}
                      >
                        ₹
                        {acc.balance.toLocaleString(undefined, {
                          minimumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      </section>

      {/* Insights */}
      <section id="tour-insights" className="space-y-8">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Financial Insights
          </h2>
          <p className="text-xs text-muted-foreground">
            Real-time analytics and spending patterns.
          </p>
        </div>

        <DashboardInsights transactions={transactions} />
      </section>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
        <div className="xl:col-span-8 space-y-8">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h2 className="text-2xl font-bold tracking-tight">
                Recent Activity
              </h2>
              <p className="text-xs text-muted-foreground">
                Your latest financial movements.
              </p>
            </div>

            <button
              onClick={() => setActiveView("transactions")}
              className="text-[10px] font-bold uppercase tracking-widest text-emerald-500"
            >
              View Full Ledger
            </button>
          </div>

          <RecentActivity
            transactions={filteredTransactions.slice(0, 6)}
            accounts={accounts}
            onDelete={handleDelete}
          />
        </div>

        <div className="xl:col-span-4 space-y-12">
          <CategorySummary stats={stats} />

          <div className="bg-card border border-border rounded-3xl p-6">
            <Calculator stats={stats} compact />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
