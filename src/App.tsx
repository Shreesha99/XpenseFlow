import { useEffect, useState, ReactNode } from "react";
import { Wallet, Plus, Calculator as CalcIcon, Tags, LayoutDashboard, History, PieChart, Settings, Search, Filter, ChevronLeft, ChevronRight, CreditCard, Trash2, RotateCcw, X, ArrowRightLeft } from "lucide-react";
import { Transaction, Stats, Account, Category } from "./types";
import TransactionForm from "./components/TransactionForm";
import AccountGrid from "./components/AccountGrid";
import CategorySummary from "./components/CategorySummary";
import Calculator from "./components/Calculator";
import ReportExport from "./components/ReportExport";
import ThemeToggle from "./components/ThemeToggle";
import FloatingCalculator from "./components/FloatingCalculator";
import { motion, AnimatePresence } from "motion/react";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart as RePie, Pie, Cell } from 'recharts';

type View = 'dashboard' | 'transactions' | 'planning' | 'categories' | 'settings' | 'accounts';

const INDIAN_BANKS = [
  { name: "State Bank of India", logo: "https://logo.clearbit.com/sbi.co.in" },
  { name: "HDFC Bank", logo: "https://logo.clearbit.com/hdfcbank.com" },
  { name: "ICICI Bank", logo: "https://logo.clearbit.com/icicibank.com" },
  { name: "Axis Bank", logo: "https://logo.clearbit.com/axisbank.com" },
  { name: "Kotak Mahindra Bank", logo: "https://logo.clearbit.com/kotak.com" },
  { name: "IndusInd Bank", logo: "https://logo.clearbit.com/indusind.com" },
  { name: "Yes Bank", logo: "https://logo.clearbit.com/yesbank.in" },
  { name: "Punjab National Bank", logo: "https://logo.clearbit.com/pnbindia.in" },
  { name: "Bank of Baroda", logo: "https://logo.clearbit.com/bankofbaroda.in" },
  { name: "Canara Bank", logo: "https://logo.clearbit.com/canarabank.com" },
  { name: "Paytm Payments Bank", logo: "https://logo.clearbit.com/paytmbank.com" },
  { name: "PhonePe / Wallet", logo: "https://logo.clearbit.com/phonepe.com" },
  { name: "Google Pay / GPay", logo: "https://logo.clearbit.com/google.com" },
  { name: "Amazon Pay", logo: "https://logo.clearbit.com/amazon.in" },
  { name: "Other / Cash", logo: "" }
];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [accountBalances, setAccountBalances] = useState<{id: number, name: string, balance: number}[]>([]);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const [selectedAccountId, setSelectedAccountId] = useState<number>(0);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [transferData, setTransferData] = useState({
    from: "",
    to: "",
    amount: "",
    description: ""
  });

  const BankLogo = ({ url, name, className = "w-10 h-10" }: { url?: string, name: string, className?: string }) => {
    const [error, setError] = useState(false);
    const firstLetter = name.charAt(0).toUpperCase();

    if (!url || error) {
      return (
        <div className={`${className} bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold rounded-xl border border-emerald-500/20`}>
          {firstLetter}
        </div>
      );
    }

    return (
      <img 
        src={url} 
        alt={name} 
        className={`${className} object-contain bg-white p-1 rounded-xl border border-border`}
        referrerPolicy="no-referrer"
        onError={() => setError(true)}
      />
    );
  };

  const fetchData = async () => {
    try {
      const monthStr = format(currentMonth, "yyyy-MM");
      const [transRes, statsRes, accRes, catRes, balRes] = await Promise.all([
        fetch(`/api/transactions?account_id=${selectedAccountId}&month=${monthStr}`),
        fetch(`/api/stats?account_id=${selectedAccountId}&month=${monthStr}`),
        fetch("/api/accounts"),
        fetch("/api/categories"),
        fetch("/api/accounts/balances")
      ]);
      
      const [transData, statsData, accData, catData, balData] = await Promise.all([
        transRes.json(),
        statsRes.json(),
        accRes.json(),
        catRes.json(),
        balRes.json()
      ]);
 
      setTransactions(Array.isArray(transData) ? transData : []);
      setStats(statsData);
      setAccounts(Array.isArray(accData) ? accData : []);
      setCategories(Array.isArray(catData) ? catData : []);
      setAccountBalances(Array.isArray(balData) ? balData : []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [selectedAccountId, currentMonth]);

  useEffect(() => {
    if (activeView === 'accounts') {
      fetchData();
    }
  }, [activeView]);

  const handleDelete = async (id: number) => {
    try {
      const response = await fetch(`/api/transactions/${id}`, { method: "DELETE" });
      if (response.ok) {
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete transaction:", error);
    }
  };

  const handleAddCategory = async (name: string) => {
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to add category:", error);
    }
  };

  const handleEditCategory = async (id: number, name: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const handleAddAccount = async (name: string, logo_url: string = "") => {
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, logo_url })
      });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to add account:", error);
    }
  };

  const handleTransfer = async () => {
    if (!transferData.from || !transferData.to || !transferData.amount) {
      alert("Please fill all transfer details.");
      return;
    }
    if (transferData.from === transferData.to) {
      alert("Source and destination accounts must be different.");
      return;
    }

    try {
      const res = await fetch("/api/transfer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from_account_id: parseInt(transferData.from),
          to_account_id: parseInt(transferData.to),
          amount: parseFloat(transferData.amount),
          date: new Date().toISOString().split("T")[0],
          description: transferData.description
        })
      });

      if (res.ok) {
        setShowTransfer(false);
        setTransferData({ from: "", to: "", amount: "", description: "" });
        fetchData();
      }
    } catch (error) {
      console.error("Transfer failed:", error);
    }
  };

  const handleDeleteAccount = async (id: number) => {
    if (id === 1) {
      alert("Cannot delete the primary account.");
      return;
    }
    if (!confirm("Are you sure? This will delete all transactions for this bank.")) return;
    try {
      const res = await fetch(`/api/accounts/${id}`, { method: "DELETE" });
      if (res.ok) {
        if (selectedAccountId === id) setSelectedAccountId(0);
        fetchData();
      }
    } catch (error) {
      console.error("Failed to delete account:", error);
    }
  };

  const summary = stats?.summary || {
    digital_credits: 0,
    in_hand_credits: 0,
    digital_expenses: 0,
    in_hand_expenses: 0
  };

  const totalCredits = (Number(summary.digital_credits) || 0) + (Number(summary.in_hand_credits) || 0);
  const totalExpenses = (Number(summary.digital_expenses) || 0) + (Number(summary.in_hand_expenses) || 0);
  const totalBalance = totalCredits - totalExpenses;

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-emerald-500/30">
      {/* Sidebar Navigation - Pro Rail */}
      <aside className="w-20 lg:w-64 border-r border-border bg-card flex flex-col sticky top-0 h-screen z-50 transition-all duration-300">
        <div className="p-4 lg:p-6 flex flex-col h-full">
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div className="hidden lg:block overflow-hidden">
              <h1 className="text-sm font-bold tracking-tight text-foreground whitespace-nowrap">XpenseFlow</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold whitespace-nowrap">Command Center</p>
            </div>
          </div>

          <nav className="space-y-2">
            <NavItem 
              icon={<LayoutDashboard className="w-5 h-5" />} 
              label="Dashboard" 
              active={activeView === 'dashboard'} 
              onClick={() => setActiveView('dashboard')} 
            />
            <NavItem 
              icon={<CreditCard className="w-5 h-5" />} 
              label="Banks" 
              active={activeView === 'accounts'} 
              onClick={() => setActiveView('accounts')} 
            />
            <NavItem 
              icon={<History className="w-5 h-5" />} 
              label="Ledger" 
              active={activeView === 'transactions'} 
              onClick={() => setActiveView('transactions')} 
            />
            <NavItem 
              icon={<CalcIcon className="w-5 h-5" />} 
              label="Subscriptions" 
              active={activeView === 'planning'} 
              onClick={() => setActiveView('planning')} 
            />
            <NavItem 
              icon={<Tags className="w-5 h-5" />} 
              label="Categories" 
              active={activeView === 'categories'} 
              onClick={() => setActiveView('categories')} 
            />
            <NavItem 
              icon={<Settings className="w-5 h-5" />} 
              label="Settings" 
              active={activeView === 'settings'} 
              onClick={() => setActiveView('settings')} 
            />
          </nav>

          <div className="mt-10 hidden lg:block">
            <div className="flex items-center justify-between mb-4 px-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Accounts</p>
              <button onClick={() => {
                const name = prompt("Enter account name:");
                if (name) handleAddAccount(name);
              }} className="text-emerald-500 hover:text-emerald-400 p-1 hover:bg-emerald-500/10 rounded-md transition-colors">
                <Plus className="w-3 h-3" />
              </button>
            </div>
            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedAccountId(0);
                  setActiveView('dashboard');
                }}
                className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-xs font-medium transition-all ${
                  selectedAccountId === 0 
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span className="truncate">All Accounts</span>
              </button>
              {accounts.map(acc => (
                <button
                  key={acc.id}
                  onClick={() => {
                    setSelectedAccountId(acc.id);
                    if (activeView === 'accounts') setActiveView('dashboard');
                  }}
                  className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-xs font-medium transition-all ${
                    selectedAccountId === acc.id 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent'
                  }`}
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  <span className="truncate">{acc.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-auto pt-6 border-t border-border">
            <div className="flex items-center justify-between mb-6 px-2 hidden lg:flex">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Theme</span>
              <ThemeToggle />
            </div>
            <button className="flex items-center justify-center lg:justify-start gap-3 w-full p-3 text-muted-foreground hover:text-foreground transition-colors text-sm rounded-xl hover:bg-muted">
              <Settings className="w-5 h-5" />
              <span className="hidden lg:block">Settings</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 border-b border-border bg-background/80 backdrop-blur-xl flex items-center justify-between px-8 sticky top-0 z-40">
          <div className="flex items-center gap-8 flex-1">
            <div className="flex items-center gap-2 bg-muted/50 border border-border rounded-xl p-1">
              <button 
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm font-bold text-foreground min-w-[120px] text-center tracking-tight">
                {format(currentMonth, "MMMM yyyy")}
              </span>
              <button 
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-2 hover:bg-accent rounded-lg transition-colors text-muted-foreground hover:text-foreground"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="relative max-w-md w-full hidden md:block">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search transactions, categories..." 
                className="w-full bg-muted/50 border border-border rounded-xl py-2.5 pl-12 pr-4 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <ReportExport transactions={transactions} />
            <button 
              onClick={() => setShowForm(!showForm)}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              New Entry
            </button>
          </div>
        </header>

        <main className="flex-1 overflow-auto p-8 lg:p-12">
          <AnimatePresence mode="wait">
            {activeView === 'dashboard' && (
              <motion.div
                key="dashboard"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
                className="space-y-12"
              >
                {/* Hero Section - Editorial Style */}
                <section className="relative overflow-hidden">
                  <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
                  <div className="relative">
                    <p className="font-display italic text-5xl md:text-6xl lg:text-8xl text-foreground leading-none mb-6 tracking-tighter">
                      Financial <br /> 
                      <span className="text-emerald-500">Intelligence.</span>
                    </p>
                    <div className="flex flex-wrap gap-8 md:gap-12 mt-12">
                      <div className="space-y-1 flex items-center gap-4">
                        {selectedAccountId !== 0 && accountBalances.find(a => a.id === selectedAccountId) && (
                          <BankLogo 
                            url={accountBalances.find(a => a.id === selectedAccountId)?.logo_url} 
                            name={accountBalances.find(a => a.id === selectedAccountId)?.name || ""} 
                            className="w-12 h-12 md:w-16 md:h-16"
                          />
                        )}
                        <div>
                          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Current Balance</p>
                          <p className="text-3xl md:text-4xl font-bold tracking-tighter">₹{totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                        </div>
                      </div>
                      <div className="w-px h-12 bg-border hidden sm:block" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Total Income</p>
                        <p className="text-2xl font-bold tracking-tighter text-emerald-500">₹{totalCredits.toLocaleString()}</p>
                      </div>
                      <div className="w-px h-12 bg-border hidden sm:block" />
                      <div className="space-y-1">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Total Outflow</p>
                        <p className="text-2xl font-bold tracking-tighter text-rose-500">₹{totalExpenses.toLocaleString()}</p>
                      </div>
                    </div>

                    {/* Bank Balances Widget */}
                    {selectedAccountId === 0 && accountBalances.length > 0 && (
                      <div className="mt-12 pt-12 border-t border-border">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-6">Bank Breakdown</p>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                          {accountBalances.map(acc => (
                            <div key={acc.id} className="p-4 bg-card border border-border rounded-2xl hover:border-emerald-500/30 transition-all group">
                              <div className="flex items-center gap-2 mb-2">
                                <CreditCard className="w-3 h-3 text-emerald-500" />
                                <p className="text-[10px] font-bold text-foreground truncate">{acc.name}</p>
                              </div>
                              <p className={`text-sm font-bold tracking-tight ${acc.balance >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                                ₹{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </section>

                <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                  <div className="xl:col-span-8 space-y-8">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <h2 className="text-2xl font-bold tracking-tight">Recent Activity</h2>
                        <p className="text-xs text-muted-foreground">Your latest financial movements across all modes.</p>
                      </div>
                      <button 
                        onClick={() => setActiveView('transactions')} 
                        className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors border-b border-emerald-500/20 pb-1"
                      >
                        View Full Ledger
                      </button>
                    </div>
                    <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                      <AccountGrid transactions={transactions.slice(0, 8)} stats={stats} onDelete={handleDelete} compact />
                    </div>
                  </div>

                  <div className="xl:col-span-4 space-y-12">
                    <section>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Allocation</h2>
                        <PieChart className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <CategorySummary stats={stats} />
                    </section>
                    
                    <section>
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Forecast</h2>
                        <CalcIcon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="bg-card border border-border rounded-3xl p-6 shadow-sm">
                        <Calculator stats={stats} compact />
                      </div>
                    </section>
                  </div>
                </div>
              </motion.div>
            )}

            {activeView === 'accounts' && (
              <motion.div
                key="accounts"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-8 md:space-y-12"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h2 className="text-3xl md:text-4xl font-bold tracking-tighter">My Banks & Wallets</h2>
                    <p className="text-sm text-muted-foreground mt-1">See how much money you have in each bank or wallet.</p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <button 
                      onClick={() => fetchData()}
                      className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-xl hover:bg-accent transition-all text-sm font-medium"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Refresh
                    </button>
                    <button 
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
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex flex-col md:flex-row gap-4 bg-card p-6 rounded-3xl border border-border shadow-xl"
                  >
                    <div className="flex-1 space-y-2">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Select Bank</label>
                      <select 
                        autoFocus
                        onChange={(e) => {
                          const bank = INDIAN_BANKS.find(b => b.name === e.target.value);
                          if (bank) {
                            handleAddAccount(bank.name, bank.logo);
                            setShowAddAccount(false);
                          }
                        }}
                        className="w-full bg-muted border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors"
                      >
                        <option value="">Select Indian Bank...</option>
                        {INDIAN_BANKS.map(bank => (
                          <option key={bank.name} value={bank.name} className="bg-card">{bank.name}</option>
                        ))}
                      </select>
                    </div>
                    <button 
                      onClick={() => setShowAddAccount(false)}
                      className="self-end p-3 text-muted-foreground hover:text-foreground bg-muted rounded-xl border border-border"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </motion.div>
                )}

                {/* Bank Insights Section */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  <div className="lg:col-span-8 space-y-8">
                    <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
                      <div className="flex items-center justify-between mb-8">
                        <div>
                          <h3 className="text-xl font-bold tracking-tight">Where is my money?</h3>
                          <p className="text-xs text-muted-foreground">A breakdown of your savings across different places.</p>
                        </div>
                        <PieChart className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={accountBalances}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                            <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fontWeight: 600, fill: 'currentColor', opacity: 0.5 }}
                            />
                            <YAxis 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fontSize: 10, fontWeight: 600, fill: 'currentColor', opacity: 0.5 }}
                              tickFormatter={(value) => `₹${value / 1000}k`}
                            />
                            <Tooltip 
                              cursor={{ fill: 'rgba(16,185,129,0.05)' }}
                              contentStyle={{ 
                                backgroundColor: 'var(--card)', 
                                border: '1px solid var(--border)', 
                                borderRadius: '16px',
                                fontSize: '12px',
                                fontWeight: 'bold'
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
                      <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mb-4">Total Cash</p>
                      <p className="text-5xl font-bold tracking-tighter text-foreground mb-4">
                        ₹{accountBalances.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </p>
                      <div className="h-px bg-emerald-500/10 w-full my-6" />
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Total Accounts</span>
                          <span className="text-sm font-bold">{accountBalances.length}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Average per Account</span>
                          <span className="text-sm font-bold">₹{Math.round(accountBalances.reduce((sum, acc) => sum + acc.balance, 0) / (accountBalances.length || 1)).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {accountBalances.map(acc => (
                    <div 
                      key={acc.id} 
                      onClick={() => {
                        setSelectedAccountId(acc.id);
                        setActiveView('dashboard');
                      }}
                      className="p-8 bg-card border border-border rounded-[2.5rem] hover:border-emerald-500/50 transition-all hover:shadow-2xl hover:shadow-emerald-500/5 group cursor-pointer relative overflow-hidden"
                    >
                      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-16 translate-x-16 blur-3xl group-hover:bg-emerald-500/10 transition-colors" />
                      
                      <div className="flex justify-between items-start mb-8 relative">
                        <div className="w-14 h-14 flex items-center justify-center group-hover:scale-110 transition-all duration-500">
                          <BankLogo url={acc.logo_url} name={acc.name} className="w-14 h-14" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className="text-right">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-1">Status</p>
                            <div className="flex items-center gap-1.5 justify-end">
                              <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                              <span className="text-[10px] font-bold text-foreground uppercase tracking-widest">Active</span>
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
                        <h3 className="text-xl font-bold tracking-tight text-foreground">{acc.name}</h3>
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Bank / Wallet</p>
                      </div>

                      <div className="mt-8 pt-8 border-t border-border/50 relative">
                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-2">Balance</p>
                        <p className={`text-3xl font-bold tracking-tighter ${acc.balance >= 0 ? 'text-foreground' : 'text-rose-500'}`}>
                          ₹{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}

                  <div 
                    onClick={() => {
                      setShowAddAccount(true);
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="p-8 bg-muted/30 border border-dashed border-border rounded-[2.5rem] flex flex-col items-center justify-center gap-4 hover:bg-muted/50 hover:border-emerald-500/50 transition-all group cursor-pointer"
                  >
                    <div className="w-14 h-14 rounded-full bg-background border border-border flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Plus className="w-6 h-6 text-muted-foreground group-hover:text-emerald-500" />
                    </div>
                    <p className="text-sm font-bold text-muted-foreground group-hover:text-foreground">Add New Bank</p>
                  </div>
                </div>

                <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-[2.5rem] p-12 text-center">
                  <h3 className="text-2xl font-bold tracking-tighter mb-4">Total Savings</h3>
                  <p className="text-6xl font-bold tracking-tighter text-emerald-500">
                    ₹{accountBalances.reduce((sum, acc) => sum + acc.balance, 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
                    This is the total amount of money you have in all your accounts combined.
                  </p>
                </div>
              </motion.div>
            )}

            {activeView === 'transactions' && (
              <motion.div
                key="transactions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-4xl font-bold tracking-tighter">Financial Ledger</h2>
                    <p className="text-sm text-muted-foreground mt-1">Detailed history of your income and expenditures.</p>
                  </div>
                  <div className="flex gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 bg-muted border border-border rounded-xl hover:bg-accent transition-all text-sm font-medium">
                      <Filter className="w-4 h-4" />
                      Filter
                    </button>
                  </div>
                </div>
                <div className="bg-card border border-border rounded-3xl overflow-hidden shadow-sm">
                  <AccountGrid transactions={transactions} stats={stats} onDelete={handleDelete} />
                </div>
              </motion.div>
            )}

            {activeView === 'planning' && (
              <motion.div
                key="planning"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
              >
                <Calculator stats={stats} />
              </motion.div>
            )}

            {activeView === 'categories' && (
              <motion.div
                key="categories"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-6xl mx-auto"
              >
                <div className="flex items-center justify-between mb-12">
                  <div>
                    <h2 className="text-4xl font-bold tracking-tighter">Categories</h2>
                    <p className="text-sm text-muted-foreground mt-1">Organize your finances with custom categories.</p>
                  </div>
                  <button 
                    onClick={() => {
                      const name = prompt("Enter new category name:");
                      if (name) handleAddCategory(name);
                    }}
                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-emerald-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    New Category
                  </button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
                  {categories.map(cat => (
                    <div key={cat.id} className="p-6 bg-card border border-border rounded-3xl hover:border-emerald-500/50 transition-all hover:shadow-xl hover:shadow-emerald-500/5 group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full -translate-y-12 translate-x-12 blur-2xl group-hover:bg-emerald-500/10 transition-colors" />
                      <div className="flex justify-between items-start mb-6 relative">
                        <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:text-emerald-500 transition-all duration-500">
                          <Tags className="w-6 h-6" />
                        </div>
                        <button 
                          onClick={() => {
                            const name = prompt("Edit category name:", cat.name);
                            if (name) handleEditCategory(cat.id, name);
                          }}
                          className="p-2 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-all hover:bg-muted rounded-lg"
                        >
                          <Settings className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-sm font-bold tracking-tight text-foreground relative">{cat.name}</p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1 relative">System Category</p>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeView === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-4xl mx-auto space-y-12"
              >
                <div>
                  <h2 className="text-4xl font-bold tracking-tighter">Settings</h2>
                  <p className="text-sm text-muted-foreground mt-1">Configure your financial workspace.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold tracking-tight">Financial Accounts</h3>
                      <p className="text-xs text-muted-foreground">Manage your banks and digital wallets.</p>
                    </div>

                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          id="new-account-input-settings"
                          placeholder="Bank name..."
                          className="flex-1 bg-muted/50 border border-border rounded-xl p-3 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20"
                        />
                        <button 
                          onClick={() => {
                            const input = document.getElementById('new-account-input-settings') as HTMLInputElement;
                            if (input.value) {
                              handleAddAccount(input.value);
                              input.value = '';
                            }
                          }}
                          className="bg-emerald-600 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-500/10"
                        >
                          Add
                        </button>
                      </div>
                      
                      <div className="space-y-2">
                        {accounts.map(acc => (
                          <div key={acc.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50 group hover:border-emerald-500/30 transition-colors">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-emerald-500/10 rounded-lg group-hover:bg-emerald-500/20 transition-colors">
                                <CreditCard className="w-4 h-4 text-emerald-500" />
                              </div>
                              <span className="text-sm font-bold">{acc.name}</span>
                            </div>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                              {acc.id === 1 ? 'Primary' : 'Secondary'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="bg-card border border-border rounded-3xl p-8 shadow-sm space-y-8">
                    <div className="space-y-2">
                      <h3 className="text-lg font-bold tracking-tight">Preferences</h3>
                      <p className="text-xs text-muted-foreground">Personalize your dashboard experience.</p>
                    </div>

                    <div className="space-y-6">
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                        <div>
                          <p className="text-sm font-bold">Display Theme</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Light / Dark Mode</p>
                        </div>
                        <ThemeToggle />
                      </div>
                      
                      <div className="flex items-center justify-between p-4 bg-muted/30 rounded-2xl border border-border/50">
                        <div>
                          <p className="text-sm font-bold">Currency Symbol</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Default: INR</p>
                        </div>
                        <span className="px-3 py-1 bg-muted rounded-lg font-mono font-bold text-xs">₹</span>
                      </div>

                      <div className="pt-6 border-t border-border">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                          System Status: Operational
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          XpenseFlow v2.1.0 - Technical Dashboard Edition
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Navigation - Floating Island Style */}
      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-md z-[100]">
        <nav className="bg-card/80 backdrop-blur-2xl border border-border h-16 rounded-2xl flex items-center justify-around px-4 shadow-2xl shadow-black/50">
          <MobileNavItem icon={<LayoutDashboard className="w-5 h-5" />} active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} />
          <MobileNavItem icon={<CreditCard className="w-5 h-5" />} active={activeView === 'accounts'} onClick={() => setActiveView('accounts')} />
          <button 
            onClick={() => setShowForm(true)}
            className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white -translate-y-8 shadow-xl shadow-emerald-500/40 active:scale-90 transition-transform"
          >
            <Plus className="w-6 h-6" />
          </button>
          <MobileNavItem icon={<CalcIcon className="w-5 h-5" />} active={activeView === 'planning'} onClick={() => setActiveView('planning')} />
          <MobileNavItem icon={<Tags className="w-5 h-5" />} active={activeView === 'categories'} onClick={() => setActiveView('categories')} />
        </nav>
      </div>

      <FloatingCalculator />

      {/* Transaction Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <TransactionForm 
                  onSuccess={() => { fetchData(); setShowForm(false); }} 
                  categories={categories}
                  accounts={accounts}
                  selectedAccountId={selectedAccountId}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Transfer Modal */}
      <AnimatePresence>
        {showTransfer && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTransfer(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border rounded-3xl shadow-2xl overflow-hidden p-6 md:p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-xl md:text-2xl font-bold tracking-tighter text-foreground">Transfer Money</h3>
                <button onClick={() => setShowTransfer(false)} className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">From Account</label>
                  <select 
                    value={transferData.from}
                    onChange={(e) => setTransferData({ ...transferData, from: e.target.value })}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-foreground"
                  >
                    <option value="" className="bg-card">Select Source...</option>
                    {accountBalances.map(acc => (
                      <option key={acc.id} value={acc.id} className="bg-card">{acc.name} (₹{acc.balance.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div className="flex justify-center">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                    <ArrowRightLeft className="w-5 h-5 text-emerald-500 rotate-90" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">To Account</label>
                  <select 
                    value={transferData.to}
                    onChange={(e) => setTransferData({ ...transferData, to: e.target.value })}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-foreground"
                  >
                    <option value="" className="bg-card">Select Destination...</option>
                    {accountBalances.map(acc => (
                      <option key={acc.id} value={acc.id} className="bg-card">{acc.name} (₹{acc.balance.toLocaleString()})</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Amount</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₹</span>
                    <input 
                      type="number" 
                      placeholder="0.00"
                      value={transferData.amount}
                      onChange={(e) => setTransferData({ ...transferData, amount: e.target.value })}
                      className="w-full bg-muted/50 border border-border rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors font-mono text-foreground"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Note (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="What's this for?"
                    value={transferData.description}
                    onChange={(e) => setTransferData({ ...transferData, description: e.target.value })}
                    className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-foreground"
                  />
                </div>

                <button 
                  onClick={handleTransfer}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-500/20 mt-4"
                >
                  Confirm Transfer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {loading && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-[200] flex items-center justify-center">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-emerald-500/20 rounded-full" />
              <div className="absolute inset-0 w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            </div>
            <div className="text-center">
              <p className="text-sm font-bold tracking-[0.2em] text-emerald-500 uppercase mb-2">Synchronizing</p>
              <p className="text-[10px] text-muted-foreground font-medium">Accessing secure financial records...</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NavItem({ icon, label, active, onClick }: { icon: ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold transition-all duration-300 group relative ${
        active 
          ? 'bg-emerald-500/10 text-emerald-500 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.1)]' 
          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
      }`}
    >
      <div className={`transition-transform duration-500 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
        {icon}
      </div>
      <span className="hidden lg:block tracking-tight">{label}</span>
      {active && (
        <motion.div 
          layoutId="nav-active"
          className="absolute left-0 w-1 h-5 bg-emerald-500 rounded-r-full"
        />
      )}
    </button>
  );
}

function MobileNavItem({ icon, active, onClick }: { icon: ReactNode, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`p-3 rounded-xl transition-all duration-300 ${active ? 'text-emerald-500 bg-emerald-500/10 scale-110' : 'text-muted-foreground'}`}
    >
      {icon}
    </button>
  );
}

function BalanceCard({ label, amount, color, subLabel, highlight }: { label: string, amount: number, color: string, subLabel: string, highlight?: boolean }) {
  return (
    <div className={`p-8 rounded-[2rem] border transition-all duration-500 group relative overflow-hidden ${
      highlight 
        ? 'bg-emerald-500/5 border-emerald-500/20 shadow-2xl shadow-emerald-500/10' 
        : 'bg-card border-border hover:border-emerald-500/30'
    }`}>
      {highlight && (
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -translate-y-16 translate-x-16 blur-3xl" />
      )}
      <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] mb-4">{label}</p>
      <div className="flex items-baseline gap-2 relative">
        <span className={`text-4xl font-bold tracking-tighter ${color}`}>
          ₹{amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground mt-4 font-bold uppercase tracking-widest opacity-60 relative">{subLabel}</p>
    </div>
  );
}
