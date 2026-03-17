import { useEffect, useState, useMemo } from "react";
import {
  Transaction,
  Stats,
  Account,
  Category,
  CategoryStat,
  Summary,
} from "./types";
import TransactionForm from "./components/TransactionForm";
import FloatingCalculator from "./components/shared/FloatingCalculator";
import ErrorBoundary from "./components/ErrorBoundary";
import PromptModal from "./components/modals/PromptModal";
import ConfirmationModal from "./components/modals/ConfirmationModal";
import OnboardingTour from "./components/ui/OnboardingTour";
import { motion, AnimatePresence } from "motion/react";
import {
  startOfMonth,
  isSameMonth,
  parseISO,
  isSameDay,
  isSameYear,
  isWithinInterval,
  startOfDay,
  endOfDay,
  endOfMonth,
  endOfYear,
} from "date-fns";
import {
  auth,
  db,
  signIn,
  logOut,
  onAuthStateChanged,
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
  addDoc,
  deleteDoc,
  doc,
  updateDoc,
  User,
} from "./firebase";
import SettingsView from "./components/views/SettingsView";
import SubscriptionsView from "./components/views/SubscriptionsView";
import CategoriesView from "./components/views/CategoriesView";
import TransactionsView from "./components/views/TransactionsView";
import AccountsView from "./components/views/AccountsView";
import TransferModal from "./components/modals/TransferModal";
import DashboardView from "./components/views/DashboardView";
import TopBar from "./components/ui/TopBar";
import AppLoader from "./components/ui/AppLoader";
import Sidebar from "./components/ui/Sidebar";
import LoginScreen from "./components/ui/LoginScreen";
import MobileBottomNav from "./components/ui/MobileBottomNav";

type View =
  | "dashboard"
  | "transactions"
  | "planning"
  | "categories"
  | "settings"
  | "accounts";

export default function App() {
  return (
    <ErrorBoundary>
      <AppContent />
    </ErrorBoundary>
  );
}

function AppContent() {
  const [user, setUser] = useState<User | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeView, setActiveView] = useState<View>("dashboard");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);
  const [selectedAccountId, setSelectedAccountId] = useState<string>("all");
  const [transferStatus, setTransferStatus] = useState<{
    type: "idle" | "loading" | "success" | "error";
    message?: string;
  }>({ type: "idle" });

  // Date Filtering State
  const [filterMode, setFilterMode] = useState<
    "day" | "month" | "year" | "custom"
  >("month");
  const [filterDate, setFilterDate] = useState(new Date());
  const [customRange, setCustomRange] = useState<{ start: Date; end: Date }>({
    start: startOfMonth(new Date()),
    end: new Date(),
  });

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [ledgerFilter, setLedgerFilter] = useState<
    "all" | "income" | "expense"
  >("all");
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date>(new Date());
  const [runTour, setRunTour] = useState(false);
  const [addAccountData, setAddAccountData] = useState({
    bankName: "",
    initialBalance: "",
  });
  const [transferData, setTransferData] = useState({
    from: "",
    to: "",
    amount: "",
    description: "",
  });

  // Modal States
  const [promptConfig, setPromptConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    defaultValue: string;
    onConfirm: (val: string) => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    defaultValue: "",
    onConfirm: () => {},
  });

  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    confirmText?: string;
    variant?: "danger" | "warning" | "info";
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  });

  // Derived Filtered Transactions (Main View - only date/account filters)
  const filteredTransactions = useMemo(() => {
    if (!user) return [];

    return transactions.filter((t) => {
      const date = parseISO(String(t.date));
      let matchesTime = false;

      if (filterMode === "day") {
        matchesTime = isSameDay(date, filterDate);
      } else if (filterMode === "month") {
        matchesTime = isSameMonth(date, filterDate);
      } else if (filterMode === "year") {
        matchesTime = isSameYear(date, filterDate);
      } else if (filterMode === "custom") {
        matchesTime = isWithinInterval(date, {
          start: startOfDay(customRange.start),
          end: endOfDay(customRange.end),
        });
      }

      const matchesAccount =
        selectedAccountId === "all" || t.account_id === selectedAccountId;

      return matchesTime && matchesAccount;
    });
  }, [
    transactions,
    filterMode,
    filterDate,
    customRange,
    selectedAccountId,
    user,
  ]);

  // Search Results (Independent of main view filters)
  const searchResults = useMemo(() => {
    if (!user || !searchQuery.trim()) return [];

    const query = searchQuery.toLowerCase().trim();

    return transactions.filter((t) => {
      // Check for special operators
      if (
        query.startsWith(">") ||
        query.startsWith("<") ||
        query.startsWith("=")
      ) {
        const operator = query[0];
        const value = parseFloat(query.slice(1));
        if (!isNaN(value)) {
          if (operator === ">") return t.amount > value;
          if (operator === "<") return t.amount < value;
          if (operator === "=") return t.amount === value;
        }
      }

      const accountName =
        accounts.find((a) => a.id === t.account_id)?.name.toLowerCase() || "";
      return (
        t.title.toLowerCase().includes(query) ||
        t.category.toLowerCase().includes(query) ||
        t.description?.toLowerCase().includes(query) ||
        accountName.includes(query) ||
        t.amount.toString().includes(query) ||
        t.mode.toLowerCase().includes(query) ||
        t.type.toLowerCase().includes(query)
      );
    });
  }, [transactions, searchQuery, accounts, user]);

  // End of period for balance snapshot
  const endOfPeriod = useMemo(() => {
    if (filterMode === "day") return endOfDay(filterDate);
    if (filterMode === "month") return endOfMonth(filterDate);
    if (filterMode === "year") return endOfYear(filterDate);
    if (filterMode === "custom") return endOfDay(customRange.end);
    return new Date();
  }, [filterMode, filterDate, customRange]);

  // Filtered Account Balances (Snapshot at end of period)
  const filteredAccountBalances = useMemo(() => {
    return accounts.map((acc) => {
      const accTransactions = transactions.filter((t) => {
        const date = parseISO(String(t.date));
        return date <= endOfPeriod && t.account_id === acc.id;
      });
      const balance = accTransactions.reduce((sum, t) => {
        const amountStr = String(t.amount || 0).replace(/,/g, "");
        const amount = parseFloat(amountStr) || 0;
        return t.type === "credit" ? sum + amount : sum - amount;
      }, Number(acc.initial_balance) || 0);
      return { ...acc, balance };
    });
  }, [accounts, transactions, endOfPeriod]);

  // Actual Current Balances (Reflects everything in DB)
  const actualAccountBalances = useMemo(() => {
    return accounts.map((acc) => {
      const accTransactions = transactions.filter(
        (t) => t.account_id === acc.id
      );
      const balance = accTransactions.reduce((sum, t) => {
        const amountStr = String(t.amount || 0).replace(/,/g, "");
        const amount = parseFloat(amountStr) || 0;
        return t.type === "credit" ? sum + amount : sum - amount;
      }, Number(acc.initial_balance) || 0);
      return { ...acc, balance };
    });
  }, [accounts, transactions]);

  // Total Net Worth (Reflects everything in DB)
  const totalNetWorth = useMemo(() => {
    const initialBalancesSum = accounts.reduce(
      (sum, acc) => sum + (Number(acc.initial_balance) || 0),
      0
    );
    const transactionsSum = transactions.reduce((sum, t) => {
      const amountStr = String(t.amount || 0).replace(/,/g, "");
      const amount = parseFloat(amountStr) || 0;
      return t.type === "credit" ? sum + amount : sum - amount;
    }, 0);
    return initialBalancesSum + transactionsSum;
  }, [accounts, transactions]);

  const isAppLoading = authLoading || loading;

  // Derived Stats
  const stats = useMemo<Stats | null>(() => {
    if (!user) return null;

    const categoryMap = new Map<string, CategoryStat>();
    const summary: Summary = {
      digital_credits: 0,
      in_hand_credits: 0,
      digital_expenses: 0,
      in_hand_expenses: 0,
    };

    filteredTransactions.forEach((t) => {
      let catStat = categoryMap.get(t.category) || {
        category: t.category,
        digital_expense: 0,
        in_hand_expense: 0,
        total_expense: 0,
        digital_credit: 0,
        in_hand_credit: 0,
        total_credit: 0,
      };

      if (t.type === "credit") {
        if (t.mode === "digital") {
          catStat.digital_credit += t.amount;
          summary.digital_credits += t.amount;
        } else {
          catStat.in_hand_credit += t.amount;
          summary.in_hand_credits += t.amount;
        }
        catStat.total_credit += t.amount;
      } else {
        if (t.mode === "digital") {
          catStat.digital_expense += t.amount;
          summary.digital_expenses += t.amount;
        } else {
          catStat.in_hand_expense += t.amount;
          summary.in_hand_expenses += t.amount;
        }
        catStat.total_expense += t.amount;
      }

      categoryMap.set(t.category, catStat);
    });

    return {
      categoryStats: Array.from(categoryMap.values()),
      summary,
    };
  }, [filteredTransactions, user]);

  const accountBalances = useMemo(() => {
    return accounts.map((acc) => {
      const accTransactions = transactions.filter(
        (t) => t.account_id === acc.id
      );
      const balance = accTransactions.reduce((sum, t) => {
        return t.type === "credit" ? sum + t.amount : sum - t.amount;
      }, 0);
      return { ...acc, balance };
    });
  }, [accounts, transactions]);

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
      if (!u) {
        setTransactions([]);
        setAccounts([]);
        setCategories([]);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);

  // Data Listeners
  useEffect(() => {
    if (!user) return;

    setLoading(true);

    const qTransactions = query(
      collection(db, "transactions"),
      where("uid", "==", user.uid),
      orderBy("date", "desc")
    );

    const qAccounts = query(
      collection(db, "accounts"),
      where("uid", "==", user.uid)
    );

    const qCategories = query(
      collection(db, "categories"),
      where("uid", "==", user.uid)
    );

    const unsubTrans = onSnapshot(qTransactions, (snapshot) => {
      const trans = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Transaction)
      );
      setTransactions(trans);
      setLoading(false);
    });

    const unsubAcc = onSnapshot(qAccounts, (snapshot) => {
      const accs = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Account)
      );
      setAccounts(accs);
    });

    const unsubCat = onSnapshot(qCategories, (snapshot) => {
      const cats = snapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() } as Category)
      );
      setCategories(cats);
    });

    return () => {
      unsubTrans();
      unsubAcc();
      unsubCat();
    };
  }, [user]);

  const handleDelete = async (id: string) => {
    if (!user) return;
    setConfirmConfig({
      isOpen: true,
      title: "Delete Transaction",
      message:
        "Are you sure you want to delete this transaction? This action cannot be undone.",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "transactions", id));
        } catch (error) {
          console.error("Failed to delete transaction:", error);
        }
      },
    });
  };

  const handleAddCategory = async (name: string) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "categories"), {
        name,
        uid: user.uid,
      });
    } catch (error) {
      console.error("Failed to add category:", error);
    }
  };

  const handleEditCategory = async (id: string, name: string) => {
    if (!user) return;
    try {
      await updateDoc(doc(db, "categories", id), { name });
    } catch (error) {
      console.error("Failed to update category:", error);
    }
  };

  const handleRefresh = () => {
    setIsSyncing(true);
    // In a real-time app, onSnapshot handles the data,
    // but we can use this to force a state refresh and update the sync timestamp
    setTimeout(() => {
      setLastSynced(new Date());
      setIsSyncing(false);
    }, 8000); // Longer sync time to feel more substantial
  };

  const handleDeleteCategory = async (id: string) => {
    if (!user) return;
    setConfirmConfig({
      isOpen: true,
      title: "Delete Category",
      message:
        "Are you sure you want to delete this category? Transactions in this category will remain but will be uncategorized.",
      onConfirm: async () => {
        try {
          await deleteDoc(doc(db, "categories", id));
        } catch (error) {
          console.error("Failed to delete category:", error);
        }
      },
    });
  };

  const handleAddAccount = async (
    name: string,
    initialBalance: number = 0,
    logo_url: string = ""
  ) => {
    if (!user) return;
    try {
      await addDoc(collection(db, "accounts"), {
        name,
        logo_url,
        uid: user.uid,
        initial_balance: initialBalance,
        balance: initialBalance, // This is just for legacy/display, the real balance is calculated
      });
    } catch (error) {
      console.error("Failed to add account:", error);
    }
  };

  const handleTransfer = async () => {
    if (!user) return;

    setTransferStatus({ type: "idle" });

    if (!transferData.from) {
      setTransferStatus({
        type: "error",
        message: "Select a source account",
      });
      return;
    }

    if (!transferData.to) {
      setTransferStatus({
        type: "error",
        message: "Select a destination account",
      });
      return;
    }

    if (!transferData.amount) {
      setTransferStatus({
        type: "error",
        message: "Enter an amount",
      });
      return;
    }

    if (transferData.from === transferData.to) {
      setTransferStatus({
        type: "error",
        message: "Cannot transfer to the same account",
      });
      return;
    }

    const amount = parseFloat(transferData.amount);

    if (isNaN(amount) || amount <= 0) {
      setTransferStatus({
        type: "error",
        message: "Enter a valid amount",
      });
      return;
    }

    try {
      setTransferStatus({ type: "loading" });

      const date = new Date().toISOString().slice(0, 10);
      const createdAt = new Date().toISOString();

      await Promise.all([
        addDoc(collection(db, "transactions"), {
          title: `Transfer to ${
            accounts.find((a) => a.id === transferData.to)?.name
          }`,
          amount,
          type: "expense",
          mode: "digital",
          category: "Transfer",
          account_id: transferData.from,
          date,
          description: transferData.description,
          created_at: createdAt,
          uid: user.uid,
        }),
        addDoc(collection(db, "transactions"), {
          title: `Transfer from ${
            accounts.find((a) => a.id === transferData.from)?.name
          }`,
          amount,
          type: "credit",
          mode: "digital",
          category: "Transfer",
          account_id: transferData.to,
          date,
          description: transferData.description,
          created_at: createdAt,
          uid: user.uid,
        }),
      ]);

      setTransferStatus({
        type: "success",
        message: "Transfer completed successfully",
      });

      setTimeout(() => {
        setShowTransfer(false);
        setTransferStatus({ type: "idle" });
        setTransferData({ from: "", to: "", amount: "", description: "" });
      }, 800);
    } catch (error) {
      console.error(error);
      setTransferStatus({
        type: "error",
        message: "Transfer failed. Try again.",
      });
    }
  };

  const handleDeleteAccount = async (id: string) => {
    if (!user) return;
    setConfirmConfig({
      isOpen: true,
      title: "Delete Account",
      message:
        "Are you sure you want to delete this account? All associated transactions will also be deleted. This action cannot be undone.",
      onConfirm: async () => {
        try {
          // Delete transactions associated with this account
          const accTransactions = transactions.filter(
            (t) => t.account_id === id
          );
          await Promise.all(
            accTransactions.map((t) => deleteDoc(doc(db, "transactions", t.id)))
          );
          await deleteDoc(doc(db, "accounts", id));
          if (selectedAccountId === id) setSelectedAccountId("all");
        } catch (error) {
          console.error("Failed to delete account:", error);
        }
      },
    });
  };

  const summary = stats?.summary || {
    digital_credits: 0,
    in_hand_credits: 0,
    digital_expenses: 0,
    in_hand_expenses: 0,
  };

  const totalCredits =
    (Number(summary.digital_credits) || 0) +
    (Number(summary.in_hand_credits) || 0);
  const totalExpenses =
    (Number(summary.digital_expenses) || 0) +
    (Number(summary.in_hand_expenses) || 0);

  const actualCurrentBalance = useMemo(() => {
    if (selectedAccountId === "all") {
      return actualAccountBalances.reduce((sum, acc) => sum + acc.balance, 0);
    }
    return (
      actualAccountBalances.find((a) => a.id === selectedAccountId)?.balance ||
      0
    );
  }, [actualAccountBalances, selectedAccountId]);

  if (isAppLoading) {
    return <AppLoader />;
  }

  if (!user) {
    return <LoginScreen signIn={signIn} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex font-sans selection:bg-emerald-500/30">
      <OnboardingTour
        activeView={activeView}
        setActiveView={setActiveView}
        run={runTour}
        setRun={setRunTour}
      />
      {/* Sidebar Navigation - Pro Rail */}
      <Sidebar
        activeView={activeView}
        setActiveView={setActiveView}
        accounts={accounts}
        selectedAccountId={selectedAccountId}
        setSelectedAccountId={setSelectedAccountId}
        setShowAddAccount={setShowAddAccount}
        user={user}
        logOut={logOut}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar
          showForm={showForm}
          user={user}
          accounts={accounts}
          filterMode={filterMode}
          setFilterMode={setFilterMode}
          filterDate={filterDate}
          setFilterDate={setFilterDate}
          customRange={customRange}
          setCustomRange={setCustomRange}
          selectedAccountId={selectedAccountId}
          setSelectedAccountId={setSelectedAccountId}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          showSearchResults={showSearchResults}
          setShowSearchResults={setShowSearchResults}
          searchResults={searchResults}
          setActiveView={setActiveView}
          setShowForm={setShowForm}
          logOut={logOut}
          runTour={runTour}
          setRunTour={setRunTour}
          filteredTransactions={filteredTransactions}
        />

        <main className="flex-1 overflow-auto p-4 sm:p-8 lg:p-12 pb-32 md:pb-8">
          <AnimatePresence mode="wait">
            {activeView === "dashboard" && (
              <DashboardView
                actualCurrentBalance={actualCurrentBalance}
                totalCredits={totalCredits}
                totalExpenses={totalExpenses}
                selectedAccountId={selectedAccountId}
                filteredAccountBalances={filteredAccountBalances}
                transactions={transactions}
                filteredTransactions={filteredTransactions}
                accounts={accounts}
                stats={stats}
                handleDelete={handleDelete}
                setActiveView={setActiveView}
                filterMode={filterMode}
                filterDate={filterDate}
                customRange={customRange}
                currentBalance={0}
              />
            )}

            {activeView === "accounts" && (
              <AccountsView
                filteredAccountBalances={filteredAccountBalances}
                selectedAccountId={selectedAccountId}
                setSelectedAccountId={setSelectedAccountId}
                setActiveView={setActiveView}
                handleDeleteAccount={handleDeleteAccount}
                handleAddAccount={handleAddAccount}
                handleTransfer={handleTransfer}
                handleRefresh={handleRefresh}
                isSyncing={isSyncing}
                lastSynced={lastSynced}
                showAddAccount={showAddAccount}
                setShowAddAccount={setShowAddAccount}
                showTransfer={showTransfer}
                setShowTransfer={setShowTransfer}
                addAccountData={addAccountData}
                setAddAccountData={setAddAccountData}
                totalNetWorth={totalNetWorth}
                stats={stats}
              />
            )}

            {activeView === "transactions" && (
              <TransactionsView
                transactions={filteredTransactions}
                stats={stats}
                accounts={accounts}
                ledgerFilter={ledgerFilter}
                setLedgerFilter={setLedgerFilter}
                onDelete={handleDelete}
                actualBalances={actualAccountBalances}
                totalNetWorth={totalNetWorth}
              />
            )}

            {activeView === "planning" && (
              <motion.div
                key="planning"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-8"
              >
                <SubscriptionsView
                  stats={stats}
                  currentBalance={actualCurrentBalance}
                  filterMode={filterMode}
                  filterDate={filterDate}
                  customRange={customRange}
                />
              </motion.div>
            )}

            {activeView === "categories" && (
              <CategoriesView
                categories={categories}
                stats={stats}
                onAdd={() => {
                  setPromptConfig({
                    isOpen: true,
                    title: "New Category",
                    message: "Enter category name:",
                    defaultValue: "",
                    onConfirm: (name) => {
                      if (name && name.trim()) handleAddCategory(name.trim());
                    },
                  });
                }}
                onEdit={(id, name) => handleEditCategory(id, name)}
                onDelete={handleDeleteCategory}
                openPrompt={(config) =>
                  setPromptConfig({
                    isOpen: true,
                    ...config,
                  })
                }
              />
            )}

            {activeView === "settings" && (
              <SettingsView
                user={user}
                accounts={accounts}
                selectedAccountId={selectedAccountId}
                handleDeleteAccount={handleDeleteAccount}
                logOut={logOut}
                setActiveView={setActiveView} // ✅ add this
                setShowAddAccount={setShowAddAccount}
              />
            )}
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile Navigation - Floating Island Style */}
      <MobileBottomNav
        activeView={activeView}
        setActiveView={setActiveView}
        setShowForm={setShowForm}
      />

      <FloatingCalculator />

      <PromptModal
        isOpen={promptConfig.isOpen}
        onClose={() => setPromptConfig({ ...promptConfig, isOpen: false })}
        onConfirm={promptConfig.onConfirm}
        title={promptConfig.title}
        message={promptConfig.message}
        defaultValue={promptConfig.defaultValue}
      />

      <ConfirmationModal
        isOpen={confirmConfig.isOpen}
        onClose={() => setConfirmConfig({ ...confirmConfig, isOpen: false })}
        onConfirm={confirmConfig.onConfirm}
        title={confirmConfig.title}
        message={confirmConfig.message}
        confirmText={confirmConfig.confirmText}
        variant={confirmConfig.variant}
      />

      {/* Transaction Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-100 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-2xl bg-card border border-border rounded-2xl md:rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-5 md:p-8 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <TransactionForm
                  onSuccess={() => setShowForm(false)}
                  onClose={() => setShowForm(false)}
                  categories={categories}
                  accounts={accounts}
                  selectedAccountId={selectedAccountId}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <TransferModal
        transferStatus={transferStatus}
        showTransfer={showTransfer}
        setShowTransfer={setShowTransfer}
        transferData={transferData}
        setTransferData={setTransferData}
        handleTransfer={handleTransfer}
        accountBalances={accountBalances}
      />

      {loading && <AppLoader />}
    </div>
  );
}
