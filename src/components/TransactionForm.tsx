import { useState, FormEvent, useEffect } from "react";
import { Account, Category } from "../types";
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, Smartphone, Banknote, X, AlertCircle, Tags, CreditCard, Info } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { db, auth, collection, addDoc } from "../firebase";

interface TransactionFormProps {
  onSuccess: () => void;
  categories: Category[];
  accounts: Account[];
  selectedAccountId: string;
}

export default function TransactionForm({ onSuccess, categories, accounts, selectedAccountId }: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showInstructions, setShowInstructions] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense" as "credit" | "expense",
    mode: "digital" as "digital" | "in_hand",
    category: "",
    account_id: selectedAccountId,
    date: new Date().toISOString().slice(0, 10),
    description: "",
  });

  useEffect(() => {
    if (categories.length > 0 && !formData.category) {
      setFormData(prev => ({ ...prev, category: categories[0].name }));
    }
  }, [categories]);

  useEffect(() => {
    setFormData(prev => ({ ...prev, account_id: selectedAccountId }));
  }, [selectedAccountId]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(formData.amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError("Please enter a valid amount greater than 0.");
      return;
    }

    if (!formData.title.trim()) {
      setError("Please enter a title for the transaction.");
      return;
    }

    setLoading(true);
    try {
      if (!auth.currentUser) {
        setError("You must be signed in to add a transaction.");
        return;
      }

      const payload = {
        ...formData,
        amount: amountNum,
        created_at: new Date().toISOString(),
        uid: auth.currentUser.uid
      };
      
      console.log("Submitting transaction to Firestore:", payload);

      await addDoc(collection(db, "transactions"), payload);

      console.log("Transaction saved successfully to Firestore");
      setFormData({
        title: "",
        amount: "",
        type: "expense",
        mode: "digital",
        category: categories[0]?.name || "",
        account_id: selectedAccountId,
        date: new Date().toISOString().slice(0, 10),
        description: "",
      });
      onSuccess();
    } catch (error) {
      console.error("Error adding transaction to Firestore:", error);
      setError("Failed to save transaction. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 md:space-y-6" id="transaction-form">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl md:text-3xl font-bold tracking-tighter text-foreground">New Entry</h2>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Record your financial movement</p>
          </div>
          <button 
            type="button"
            onClick={() => setShowInstructions(!showInstructions)}
            className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-emerald-500"
            title="Show instructions"
          >
            <Info className="w-5 h-5" />
          </button>
        </div>
        
        <AnimatePresence>
          {showInstructions && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-emerald-50 border border-emerald-200 dark:bg-emerald-900/40 dark:border-emerald-800 rounded-2xl p-4 space-y-3">
                <div className="flex items-center gap-2 text-emerald-500">
                  <Info className="w-4 h-4" />
                  <span className="text-[10px] font-bold uppercase tracking-wider">Quick Guide</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-foreground">Transaction Types</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      <span className="text-emerald-500 font-bold">Credit:</span> Money coming in (Salary, Refunds).<br/>
                      <span className="text-rose-500 font-bold">Expense:</span> Money going out (Food, Rent).
                    </p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[11px] font-bold text-foreground">Payment Modes</p>
                    <p className="text-[10px] text-muted-foreground leading-relaxed">
                      <span className="text-blue-500 font-bold">Digital:</span> UPI, Card, Net Banking.<br/>
                      <span className="text-amber-500 font-bold">Cash:</span> Physical currency notes/coins.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-destructive/10 border border-destructive/20 p-3 rounded-xl flex items-center gap-3 text-destructive text-[10px] font-bold"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Transaction Type</label>
          </div>
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'credit' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${formData.type === 'credit' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800'}`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Credit
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${formData.type === 'expense' ? 'bg-rose-600 text-white shadow-lg shadow-rose-500/20 scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800'}`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              Expense
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Payment Mode</label>
          </div>
          <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, mode: 'digital' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${formData.mode === 'digital' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800'}`}
            >
              <Smartphone className="w-4 h-4" />
              Digital
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, mode: 'in_hand' })}
              className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all duration-300 ${formData.mode === 'in_hand' ? 'bg-amber-600 text-white shadow-lg shadow-amber-500/20 scale-[1.02]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white dark:hover:bg-slate-800'}`}
            >
              <Banknote className="w-4 h-4" />
              Cash
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Title / Payee</label>
          <input
            required
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
            placeholder="e.g. Monthly Salary"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Amount (INR)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-bold text-sm">₹</span>
            <input
              required
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full p-4 pl-10 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Category</label>
          <div className="relative">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name} className="bg-card">
                  {cat.name}
                </option>
              ))}
            </select>
            <Tags className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Account</label>
          <div className="relative">
            <select
              value={formData.account_id}
              onChange={(e) => setFormData({ ...formData, account_id: e.target.value })}
              className="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all appearance-none cursor-pointer"
            >
              {accounts.map((acc) => (
                <option key={acc.id} value={acc.id} className="bg-card">
                  {acc.name}
                </option>
              ))}
            </select>
            <CreditCard className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Date</label>
          <input
            required
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
          />
        </div>
        <div className="space-y-2">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] px-1">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-4 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-slate-300 dark:placeholder:text-slate-700"
            placeholder="Add context..."
          />
        </div>
      </div>
      
      <button
        disabled={loading}
        type="submit"
        className="w-full flex items-center justify-center gap-3 bg-emerald-600 text-white p-5 rounded-2xl font-bold hover:bg-emerald-500 transition-all disabled:opacity-50 shadow-xl shadow-emerald-500/20 active:scale-[0.98] group"
        id="add-transaction-btn"
      >
        <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-500" />
        {loading ? "Synchronizing..." : "Authorize Transaction"}
      </button>
    </form>
  );
}
