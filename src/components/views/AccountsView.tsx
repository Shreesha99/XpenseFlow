import { motion } from "motion/react";
import {
  RotateCcw,
  ArrowRightLeft,
  Trash2,
  Plus,
  PieChart,
  X,
  Landmark,
} from "lucide-react";
import { format } from "date-fns";
import BankLogo from "../ui/BankLogo";
import CustomSelect from "../shared/CustomSelect";
import { INDIAN_BANKS } from "../../constants/banks";
import {
  ResponsiveContainer,
  BarChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Bar,
} from "recharts";
import { Stats } from "../../types";

type Props = {
  filteredAccountBalances: any[];
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  setActiveView: (view: any) => void;

  handleDeleteAccount: (id: string) => void;
  handleAddAccount: (
    name: string,
    initialBalance: number,
    logo?: string
  ) => void;
  handleTransfer: () => void;
  handleRefresh: () => void;

  isSyncing: boolean;
  lastSynced: Date;

  showAddAccount: boolean;
  setShowAddAccount: (val: boolean) => void;

  showTransfer: boolean;
  setShowTransfer: (val: boolean) => void;

  addAccountData: { bankName: string; initialBalance: string };
  setAddAccountData: (val: any) => void;

  totalNetWorth: number;
  stats: Stats | null;
};

export default function AccountsView({
  filteredAccountBalances,
  selectedAccountId,
  setSelectedAccountId,
  setActiveView,
  handleDeleteAccount,
  handleAddAccount,
  handleTransfer,
  handleRefresh,
  isSyncing,
  lastSynced,
  showAddAccount,
  setShowAddAccount,
  showTransfer,
  setShowTransfer,
  addAccountData,
  setAddAccountData,
  totalNetWorth,
  stats,
}: Props) {
  return (
    <motion.div
      key="accounts"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8 md:space-y-12"
    >
      <div
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
        id="tour-banks-header"
      >
        <div>
          <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">
            My Banks & Wallets
          </h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-muted-foreground">
              See how much money you have in each bank or wallet.
            </p>
            <div className="w-1 h-1 bg-muted-foreground/30 rounded-full" />
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
              Last Synced: {format(lastSynced, "HH:mm:ss")}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            id="tour-banks-refresh"
            onClick={handleRefresh}
            disabled={isSyncing}
            className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-xl hover:bg-accent transition-all text-sm font-medium disabled:opacity-50"
          >
            <RotateCcw
              className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`}
            />
            {isSyncing ? "Syncing..." : "Refresh"}
          </button>
          <button
            id="tour-banks-transfer"
            onClick={() => setShowTransfer(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            <ArrowRightLeft className="w-4 h-4" />
            Transfer
          </button>
        </div>
      </div>
      {showAddAccount && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-card p-8 rounded-[2.5rem] border border-border shadow-2xl space-y-6"
        >
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight">
                Add New Account
              </h3>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Configure your bank or wallet
              </p>
            </div>
            <button
              onClick={() => setShowAddAccount(false)}
              className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const { bankName, initialBalance: initialBalanceStr } =
                addAccountData;
              const initialBalance =
                parseFloat(initialBalanceStr.replace(/,/g, "")) || 0;

              if (!bankName) return;

              const bank = INDIAN_BANKS.find((b) => b.name === bankName);
              if (bank) {
                const bank = INDIAN_BANKS.find((b) => b.name === bankName);
                if (bank) {
                  handleAddAccount(bank.name, initialBalance, bank.logo || "");
                  setShowAddAccount(false);
                  setAddAccountData({
                    bankName: "",
                    initialBalance: "",
                  });
                } else if (bankName === "Other / Cash") {
                  handleAddAccount("Other / Cash", initialBalance, "");
                  setShowAddAccount(false);
                  setAddAccountData({
                    bankName: "",
                    initialBalance: "",
                  });
                }
              }
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-6"
          >
            <CustomSelect
              label="Select Bank"
              options={INDIAN_BANKS.map((b) => ({
                id: b.name,
                name: b.name,
                icon: <BankLogo name={b.name} className="w-4 h-4" />,
              }))}
              value={addAccountData.bankName}
              onChange={(val) =>
                setAddAccountData({
                  ...addAccountData,
                  bankName: val,
                })
              }
              placeholder="Choose a bank..."
            />
            <div className="space-y-2">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">
                Initial Balance (₹)
              </label>
              <input
                name="initialBalance"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={addAccountData.initialBalance}
                onChange={(e) =>
                  setAddAccountData({
                    ...addAccountData,
                    initialBalance: e.target.value,
                  })
                }
                className="w-full bg-muted border border-border rounded-2xl px-4 py-4 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
            <button
              type="submit"
              className="md:col-span-2 w-full bg-emerald-600 text-white p-4 rounded-2xl font-bold hover:bg-emerald-500 transition-all shadow-lg shadow-emerald-500/20 active:scale-[0.98]"
            >
              Create Account
            </button>
          </form>
        </motion.div>
      )}
      {filteredAccountBalances.length === 0 ? (
        <div className="relative overflow-hidden p-12 md:p-16 rounded-[2.5rem] border border-border bg-linear-to-b from-card to-muted/20 text-center">
          {/* glow background */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 w-[320px] h-80 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/10 blur-3xl rounded-full" />
          </div>

          <div className="relative flex flex-col items-center gap-6">
            {/* icon */}
            <div className="w-16 h-16 rounded-2xl bg-background/60 backdrop-blur border border-border flex items-center justify-center shadow-sm">
              <Landmark className="w-7 h-7 text-emerald-500" />
            </div>

            {/* text */}
            <div className="space-y-2">
              <p className="text-xl font-bold tracking-tight text-foreground">
                No accounts yet
              </p>
              <p className="text-sm text-muted-foreground max-w-sm">
                Start building your financial overview by adding your first bank
                or wallet.
              </p>
            </div>

            {/* CTA */}
            <button
              onClick={() => {
                setShowAddAccount(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="mt-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition active:scale-95"
            >
              Add Your First Account
            </button>

            {/* subtle hint */}
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
              Takes less than 10 seconds
            </p>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h3 className="text-xl font-bold tracking-tight">
                      Where is my money?
                    </h3>
                    <p className="text-xs text-muted-foreground">
                      A breakdown of your savings across different places.
                    </p>
                  </div>
                  <PieChart className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="h-75 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={filteredAccountBalances}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="rgba(255,255,255,0.05)"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fontWeight: 600,
                          fill: "currentColor",
                          opacity: 0.5,
                        }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{
                          fontSize: 10,
                          fontWeight: 600,
                          fill: "currentColor",
                          opacity: 0.5,
                        }}
                        tickFormatter={(value) => `₹${value / 1000}k`}
                      />
                      <Tooltip
                        cursor={{ fill: "rgba(16,185,129,0.05)" }}
                        contentStyle={{
                          backgroundColor: "var(--card)",
                          border: "1px solid var(--border)",
                          borderRadius: "16px",
                          fontSize: "12px",
                          fontWeight: "bold",
                        }}
                      />
                      <Bar
                        dataKey="balance"
                        fill="var(--emerald-500)"
                        radius={[8, 8, 0, 0]}
                        fillOpacity={0.8}
                        className="fill-emerald-500"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 space-y-8">
              <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-8 text-center flex flex-col justify-center h-full">
                <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mb-4">
                  Total Cash (Snapshot)
                </p>
                <p className="text-5xl font-bold tracking-tighter text-foreground mb-4">
                  ₹
                  {filteredAccountBalances
                    .reduce((sum, acc) => sum + acc.balance, 0)
                    .toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                </p>
                <div className="h-px bg-emerald-500/10 w-full my-6" />
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Total Accounts
                    </span>
                    <span className="text-sm font-bold">
                      {filteredAccountBalances.length}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                      Average per Account
                    </span>
                    <span className="text-sm font-bold">
                      ₹
                      {Math.round(
                        filteredAccountBalances.reduce(
                          (sum, acc) => sum + acc.balance,
                          0
                        ) / (filteredAccountBalances.length || 1)
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            id="tour-banks-grid"
          >
            {filteredAccountBalances.map((acc) => (
              <div
                key={acc.id}
                onClick={() => {
                  setSelectedAccountId(acc.id);
                  setActiveView("dashboard");
                }}
                className="p-8 bg-card border border-border rounded-[2.5rem] hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/5 group cursor-pointer relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-emerald-500/10 transition-colors" />

                <div className="flex justify-between items-start mb-8 relative">
                  <div className="w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                    <BankLogo
                      url={acc.logo_url}
                      name={acc.name}
                      className="w-14 h-14"
                    />
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <div className="text-right">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">
                        Status
                      </p>
                      <div className="flex items-center gap-1.5 justify-end">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                        <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">
                          Active
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteAccount(acc.id);
                      }}
                      className="p-2 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1 relative">
                  <h3 className="text-xl font-bold tracking-tight text-foreground">
                    {acc.name}
                  </h3>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                    Bank / Wallet
                  </p>
                </div>

                <div className="mt-8 pt-8 border-t border-border/50 relative">
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">
                    Balance
                  </p>
                  <p
                    className={`text-3xl font-bold tracking-tighter ${
                      acc.balance >= 0 ? "text-foreground" : "text-rose-500"
                    }`}
                  >
                    ₹
                    {acc.balance.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                    })}
                  </p>
                </div>
              </div>
            ))}

            <div
              onClick={() => {
                setShowAddAccount(true);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
              className="p-8 bg-muted/30 border border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:bg-muted/50 hover:border-emerald-500/50 transition-all group cursor-pointer"
            >
              <div className="w-14 h-14 rounded-full bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="w-6 h-6 text-muted-foreground group-hover:text-emerald-500" />
              </div>
              <p className="text-sm font-bold text-muted-foreground group-hover:text-foreground">
                Add New Bank
              </p>
            </div>
          </div>

          <div
            className="bg-emerald-500/5 border border-emerald-500/10 rounded-4xl sm:rounded-[2.5rem] p-6 sm:p-12 text-center"
            id="tour-banks-networth"
          >
            <h3 className="text-xl sm:text-2xl font-bold tracking-tighter mb-4">
              Total Net Worth (Current)
            </h3>
            <p className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tighter text-emerald-500 break-all sm:break-normal">
              ₹
              {totalNetWorth.toLocaleString(undefined, {
                minimumFractionDigits: 2,
              })}
            </p>
            <p className="text-xs sm:text-sm text-muted-foreground mt-4 max-w-md mx-auto">
              This is your actual current balance across all accounts, including
              initial balances and all transactions recorded to date.
            </p>
            <div className="mt-6 sm:mt-8 pt-6 sm:pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-8">
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Period Snapshot
                </p>
                <p className="text-xl font-bold">
                  ₹
                  {filteredAccountBalances
                    .reduce((sum, acc) => sum + acc.balance, 0)
                    .toLocaleString()}
                </p>
              </div>
              <div className="w-px h-8 bg-border hidden sm:block" />
              <div>
                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">
                  Net Change
                </p>
                <p
                  className={`text-xl font-bold ${
                    (stats?.summary.digital_credits || 0) +
                      (stats?.summary.in_hand_credits || 0) -
                      (stats?.summary.digital_expenses || 0) -
                      (stats?.summary.in_hand_expenses || 0) >=
                    0
                      ? "text-emerald-500"
                      : "text-rose-500"
                  }`}
                >
                  ₹
                  {(
                    (stats?.summary.digital_credits || 0) +
                    (stats?.summary.in_hand_credits || 0) -
                    (stats?.summary.digital_expenses || 0) -
                    (stats?.summary.in_hand_expenses || 0)
                  ).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
