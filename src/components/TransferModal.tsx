import { motion, AnimatePresence } from "motion/react";
import { X, ArrowRightLeft, CheckCircle2, AlertCircle } from "lucide-react";
import CustomSelect from "./CustomSelect";
import BankLogo from "./BankLogo";
import { Account } from "../types";

type Props = {
  showTransfer: boolean;
  setShowTransfer: (val: boolean) => void;
  transferData: {
    from: string;
    to: string;
    amount: string;
    description: string;
  };
  setTransferData: (val: any) => void;
  handleTransfer: () => void;
  accountBalances: Account[];
  transferStatus: {
    type: "idle" | "loading" | "success" | "error";
    message?: string;
  };
};

export default function TransferModal({
  showTransfer,
  setShowTransfer,
  transferData,
  setTransferData,
  handleTransfer,
  accountBalances,
  transferStatus,
}: Props) {
  return (
    <AnimatePresence>
      {showTransfer && (
        <div className="fixed inset-0 z-110 flex items-center justify-center p-4">
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
              <h3 className="text-xl md:text-2xl font-bold tracking-tighter text-foreground">
                Transfer Money
              </h3>
              <button
                onClick={() => setShowTransfer(false)}
                className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-6">
              <CustomSelect
                label="From Account"
                options={accountBalances.map((acc) => ({
                  id: acc.id,
                  name: `${acc.name} (₹${acc.balance.toLocaleString()})`,
                  icon: (
                    <BankLogo
                      name={acc.name}
                      url={acc.logo_url}
                      className="w-4 h-4"
                    />
                  ),
                }))}
                value={transferData.from}
                onChange={(val) =>
                  setTransferData({ ...transferData, from: String(val) })
                }
                placeholder="Select Source..."
              />

              <div className="flex justify-center">
                <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
                  <ArrowRightLeft className="w-5 h-5 text-emerald-500 rotate-90" />
                </div>
              </div>

              <CustomSelect
                label="To Account"
                options={accountBalances.map((acc) => ({
                  id: acc.id,
                  name: `${acc.name} (₹${acc.balance.toLocaleString()})`,
                  icon: (
                    <BankLogo
                      name={acc.name}
                      url={acc.logo_url}
                      className="w-4 h-4"
                    />
                  ),
                }))}
                value={transferData.to}
                onChange={(val) =>
                  setTransferData({ ...transferData, to: String(val) })
                }
                placeholder="Select Destination..."
              />

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Amount
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">
                    ₹
                  </span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={transferData.amount}
                    onChange={(e) =>
                      setTransferData({
                        ...transferData,
                        amount: e.target.value,
                      })
                    }
                    className="w-full bg-muted/50 border border-border rounded-xl pl-8 pr-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors font-mono text-foreground"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
                  Note (Optional)
                </label>
                <input
                  type="text"
                  placeholder="What's this for?"
                  value={transferData.description}
                  onChange={(e) =>
                    setTransferData({
                      ...transferData,
                      description: e.target.value,
                    })
                  }
                  className="w-full bg-muted/50 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-emerald-500 transition-colors text-foreground"
                />
              </div>
              {transferStatus.type !== "idle" && (
                <div
                  className={`flex items-center gap-3 p-4 rounded-xl border ${
                    transferStatus.type === "success"
                      ? "bg-green-500/10 border-green-500/20 text-green-600"
                      : transferStatus.type === "error"
                      ? "bg-destructive/10 border-destructive/20 text-destructive"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {transferStatus.type === "success" ? (
                    <CheckCircle2 className="w-5 h-5" />
                  ) : transferStatus.type === "error" ? (
                    <AlertCircle className="w-5 h-5" />
                  ) : (
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent" />
                  )}

                  <span className="text-sm font-medium">
                    {transferStatus.message ||
                      (transferStatus.type === "loading"
                        ? "Processing transfer..."
                        : "")}
                  </span>
                </div>
              )}
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
  );
}
