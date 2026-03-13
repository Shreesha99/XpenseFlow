import { useState, FormEvent, useEffect } from "react";
import { Account, Category } from "../types";
import { PlusCircle, ArrowUpCircle, ArrowDownCircle, Smartphone, Banknote, X, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface TransactionFormProps {
  onSuccess: () => void;
  categories: Category[];
  accounts: Account[];
  selectedAccountId: number;
}

export default function TransactionForm({ onSuccess, categories, accounts, selectedAccountId }: TransactionFormProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    type: "expense" as "credit" | "expense",
    mode: "digital" as "digital" | "in_hand",
    category: "",
    account_id: selectedAccountId,
    date: new Date().toISOString().split("T")[0],
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
      const payload = {
        ...formData,
        amount: amountNum,
      };
      console.log("Submitting transaction:", payload);

      const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Transaction saved successfully:", result);
        setFormData({
          title: "",
          amount: "",
          type: "expense",
          mode: "digital",
          category: categories[0]?.name || "",
          account_id: selectedAccountId,
          date: new Date().toISOString().split("T")[0],
          description: "",
        });
        onSuccess();
      } else {
        const data = await response.json();
        console.error("Server error saving transaction:", data);
        setError(data.error || "Failed to save transaction. Please check your data.");
      }
    } catch (error) {
      console.error("Network error adding transaction:", error);
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8" id="transaction-form">
      <div className="space-y-1">
        <h2 className="text-3xl font-bold tracking-tighter text-foreground">New Entry</h2>
        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">Record your financial movement</p>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-destructive/10 border border-destructive/20 p-3 rounded-xl flex items-center gap-3 text-destructive text-xs font-bold"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Transaction Type</label>
          <div className="flex gap-2 p-1.5 bg-muted/50 rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'credit' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.type === 'credit' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              <ArrowUpCircle className="w-4 h-4" />
              Credit
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, type: 'expense' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.type === 'expense' ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              <ArrowDownCircle className="w-4 h-4" />
              Expense
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Payment Mode</label>
          <div className="flex gap-2 p-1.5 bg-muted/50 rounded-2xl border border-border">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, mode: 'digital' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.mode === 'digital' ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              <Smartphone className="w-4 h-4" />
              Digital
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, mode: 'in_hand' })}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${formData.mode === 'in_hand' ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' : 'text-muted-foreground hover:text-foreground hover:bg-muted'}`}
            >
              <Banknote className="w-4 h-4" />
              Cash
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Title / Payee</label>
          <input
            required
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full p-4 rounded-2xl bg-muted/50 border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-muted-foreground/30"
            placeholder="e.g. Monthly Salary"
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Amount (INR)</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-sm">₹</span>
            <input
              required
              type="number"
              step="0.01"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full p-4 pl-10 rounded-2xl bg-muted/50 border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-muted-foreground/30"
              placeholder="0.00"
            />
          </div>
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Taxonomy</label>
          <div className="relative">
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-4 rounded-2xl bg-muted/50 border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all appearance-none"
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
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Account</label>
          <div className="relative">
            <select
              value={formData.account_id}
              onChange={(e) => setFormData({ ...formData, account_id: parseInt(e.target.value) })}
              className="w-full p-4 rounded-2xl bg-muted/50 border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all appearance-none"
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
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Date</label>
          <input
            required
            type="date"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
            className="w-full p-4 rounded-2xl bg-muted/50 border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
          />
        </div>
        <div className="space-y-3">
          <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em]">Description</label>
          <input
            type="text"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full p-4 rounded-2xl bg-muted/50 border border-border text-foreground text-sm outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all placeholder:text-muted-foreground/30"
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

import { Tags, CreditCard } from "lucide-react";
