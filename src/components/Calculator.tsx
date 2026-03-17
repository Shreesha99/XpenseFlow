import { useState, useMemo, useEffect } from "react";
import { Stats } from "../types";
import { motion, AnimatePresence } from "motion/react";
import { CreditCard, AlertCircle, Plus, Trash2 } from "lucide-react";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import CustomSelect from "./shared/CustomSelect";

interface Subscription {
  id: string;
  name: string;
  amount: number;
  cycle: "monthly";
  dueDay: number;
  settled?: boolean;
}

interface CalculatorProps {
  stats: Stats | null;
  compact?: boolean;
  currentBalance?: number;
}

const billingDayOptions = Array.from({ length: 31 }, (_, i) => {
  const d = i + 1;

  const suffix =
    d % 10 === 1 && d !== 11
      ? "st"
      : d % 10 === 2 && d !== 12
      ? "nd"
      : d % 10 === 3 && d !== 13
      ? "rd"
      : "th";

  return {
    id: d,
    name: `${d}${suffix} of every month`,
  };
});

export default function Calculator({
  stats,
  compact,
  currentBalance,
}: CalculatorProps) {
  const [items, setItems] = useState<Subscription[]>([]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "subscriptions"), (snap) => {
      const data = snap.docs.map((d) => ({
        id: d.id,
        ...(d.data() as Omit<Subscription, "id">),
      }));
      setItems(data);
    });

    return () => unsub();
  }, []);

  const actualBalance = currentBalance || 0;
  const today = new Date().getDate();

  const yetToDeduct = useMemo(() => {
    return items
      .filter((i) => !i.settled)
      .reduce((acc, curr) => acc + (curr.amount || 0), 0);
  }, [items]);

  const projectedBalance = actualBalance - yetToDeduct;

  const updateAmount = async (id: string, amount: string) => {
    await updateDoc(doc(db, "subscriptions", id), {
      amount: parseFloat(amount) || 0,
    });
  };

  const updateName = async (id: string, name: string) => {
    await updateDoc(doc(db, "subscriptions", id), { name });
  };

  const updateDueDay = async (id: string, day: number) => {
    await updateDoc(doc(db, "subscriptions", id), { dueDay: day });
  };

  const toggleSettled = async (id: string, current?: boolean) => {
    await updateDoc(doc(db, "subscriptions", id), {
      settled: !current,
    });
  };

  const addSubscription = async () => {
    console.log("ADD CLICKED");

    await addDoc(collection(db, "subscriptions"), {
      name: "New Subscription",
      amount: 0,
      cycle: "monthly",
      dueDay: 1,
      settled: false,
      uid: auth.currentUser?.uid,
    });
  };

  const deleteSubscription = async (id: string) => {
    await deleteDoc(doc(db, "subscriptions", id));
  };

  if (compact) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
            Projected Balance
          </span>
          <span className="text-sm font-bold text-emerald-500">
            ₹{projectedBalance.toLocaleString()}
          </span>
        </div>

        <div className="space-y-2">
          {items.slice(0, 2).map((item) => (
            <div
              key={item.id}
              className="flex justify-between text-[10px] text-muted-foreground"
            >
              <span>{item.name}</span>
              <span>₹{item.amount.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-4xl font-bold tracking-tighter">Subscriptions</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Track and project your upcoming recurring expenses.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={addSubscription}
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold"
          >
            <Plus className="w-4 h-4" />
            Add
          </button>

          <div className="bg-emerald-500/5 border border-emerald-500/10 px-8 py-4 rounded-3xl text-right">
            <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-1">
              Projected Net
            </p>
            <p className="text-3xl font-bold tracking-tighter">
              ₹{projectedBalance.toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center space-y-4">
              <CreditCard className="w-10 h-10 text-muted-foreground opacity-40" />

              <p className="text-sm text-muted-foreground">
                No subscriptions yet
              </p>

              <button
                onClick={addSubscription}
                className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-sm font-bold"
              >
                <Plus className="w-4 h-4" />
                Add First Subscription
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {items.map((item) => {
                const now = new Date();

                const currentMonthDue = new Date(
                  now.getFullYear(),
                  now.getMonth(),
                  item.dueDay
                );

                const overdue = !item.settled && now.getDate() > item.dueDay;

                return (
                  <div
                    key={item.id}
                    className={`p-6 rounded-3xl border shadow-sm ${
                      item.settled
                        ? "bg-muted/30 border-border opacity-60"
                        : overdue
                        ? "bg-red-500/5 border-red-500/30"
                        : "bg-card border-border hover:border-emerald-500/30"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                          <CreditCard className="w-4 h-4" />
                        </div>

                        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                          Subscription
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleSettled(item.id, item.settled)}
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg ${
                            item.settled
                              ? "bg-emerald-500/10 text-emerald-500"
                              : overdue
                              ? "bg-red-500/10 text-red-500"
                              : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {item.settled
                            ? "Settled"
                            : overdue
                            ? "Mark Settled"
                            : "Pending"}
                        </button>

                        <button
                          onClick={() => deleteSubscription(item.id)}
                          className="p-2 rounded-lg text-muted-foreground hover:text-rose-500"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {overdue && (
                      <p className="text-[10px] text-red-500 font-bold uppercase tracking-widest">
                        Overdue
                      </p>
                    )}

                    <div className="space-y-4">
                      <input
                        value={item.name}
                        onChange={(e) => updateName(item.id, e.target.value)}
                        className="w-full bg-transparent text-sm font-bold focus:outline-none"
                      />

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-xs font-bold">
                          ₹
                        </span>

                        <input
                          type="number"
                          value={item.amount || ""}
                          onChange={(e) =>
                            updateAmount(item.id, e.target.value)
                          }
                          className="w-full bg-muted/50 border border-border rounded-xl py-2 pl-7 pr-3 text-sm font-bold focus:outline-none focus:border-emerald-500/50"
                          placeholder="0"
                        />
                      </div>

                      <CustomSelect
                        label="Billing Day"
                        value={item.dueDay}
                        options={billingDayOptions}
                        onChange={(val) => updateDueDay(item.id, Number(val))}
                        showDefaultIcon={false}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="lg:col-span-4 space-y-8">
          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-8 sticky top-8">
            <div className="space-y-2">
              <h3 className="text-xl font-bold tracking-tight">Projection</h3>
              <p className="text-xs text-muted-foreground">
                How your balance looks after all commitments.
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Current Liquidity
                </span>
                <span className="text-sm font-bold">
                  ₹{actualBalance.toLocaleString()}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">
                  Total Pending
                </span>
                <span className="text-sm font-bold text-amber-500">
                  - ₹{yetToDeduct.toLocaleString()}
                </span>
              </div>

              <div className="h-px bg-border" />

              <div className="flex justify-between items-center">
                <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">
                  Projected Final
                </span>
                <span className="text-2xl font-bold text-emerald-500 tracking-tighter">
                  ₹{projectedBalance.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="p-6 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4 items-start">
              <AlertCircle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider leading-relaxed">
                Ensure you have enough liquidity in your primary accounts to
                cover these pending commitments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
