import { motion } from "motion/react";
import {
  Landmark,
  Trash2,
  FileUp,
  Lock,
  ShieldCheck,
  User as UserIcon,
  LogOut,
} from "lucide-react";

import ExcelImport from "../ExcelImport";

type Props = {
  user: any;
  accounts: any[];
  selectedAccountId: string;
  handleDeleteAccount: (id: string) => void;
  logOut: () => void;
  setActiveView: (
    view:
      | "dashboard"
      | "transactions"
      | "planning"
      | "categories"
      | "settings"
      | "accounts"
  ) => void; // ✅
  setShowAddAccount: (val: boolean) => void; // ✅
};

export default function SettingsView({
  user,
  accounts,
  selectedAccountId,
  handleDeleteAccount,
  logOut,
  setActiveView,
  setShowAddAccount,
}: Props) {
  return (
    <motion.div
      key="settings"
      id="tour-settings-view"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="max-w-5xl mx-auto space-y-8 pb-20"
    >
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h2 className="text-5xl font-black tracking-tighter text-foreground">
            Settings
          </h2>
          <p className="text-sm text-muted-foreground mt-2 font-medium">
            Configure your financial workspace and preferences.
          </p>
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold text-muted-foreground uppercase tracking-[0.2em] bg-muted/30 px-4 py-2 rounded-full border border-border/50">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          System Operational
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Account Management */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm overflow-hidden relative group">
            <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
              <Landmark className="w-32 h-32" />
            </div>

            <div className="relative space-y-8">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-2xl font-bold tracking-tight">
                    Financial Accounts
                  </h3>
                  <p className="text-xs text-muted-foreground font-medium">
                    Manage your banks, wallets, and digital assets.
                  </p>
                </div>
              </div>

              <div className="space-y-3 overflow-y-auto max-h-100 pr-2 no-scrollbar">
                <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-4">
                  Existing Accounts
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {accounts.length === 0 ? (
                    <div className="col-span-full relative overflow-hidden p-12 md:p-16 rounded-[2.5rem] border border-dashed border-border bg-linear-to-b from-card to-muted/20 text-center">
                      {/* glow */}
                      <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-1/2 left-1/2 w-75 h-75 -translate-x-1/2 -translate-y-1/2 bg-emerald-500/10 blur-3xl rounded-full" />
                      </div>

                      <div className="relative flex flex-col items-center gap-6">
                        {/* icon */}
                        <div className="w-16 h-16 rounded-2xl bg-background/60 backdrop-blur border border-border flex items-center justify-center">
                          <Landmark className="w-7 h-7 text-emerald-500" />
                        </div>

                        {/* text */}
                        <div className="space-y-2">
                          <p className="text-xl font-bold tracking-tight text-foreground">
                            No accounts yet
                          </p>
                          <p className="text-sm text-muted-foreground max-w-sm">
                            Add your first account to start managing your
                            finances.
                          </p>
                        </div>

                        {/* CTA */}
                        <button
                          onClick={() => {
                            setActiveView("accounts");
                            setShowAddAccount(true);

                            setTimeout(() => {
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }, 50);
                          }}
                          className="mt-2 px-5 py-2.5 text-sm font-semibold rounded-xl bg-emerald-500 text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition active:scale-95"
                        >
                          Add Account
                        </button>

                        {/* hint */}
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                          Manage your finances better
                        </p>
                      </div>
                    </div>
                  ) : (
                    accounts.map((acc) => (
                      <div
                        key={acc.id}
                        className="flex items-center justify-between p-4 bg-background border border-border rounded-2xl hover:border-emerald-500/30 transition-all group"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center border border-border">
                            <Landmark className="w-4 h-4 text-muted-foreground" />
                          </div>

                          <div>
                            <p className="text-sm font-bold">{acc.name}</p>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                              {acc.type || "Account"}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={() => handleDeleteAccount(acc.id)}
                          className="p-2 rounded-xl text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-3 bg-blue-500/10 rounded-2xl">
                <FileUp className="w-6 h-6 text-blue-500" />
              </div>
              <div>
                <h3 className="text-2xl font-bold tracking-tight">
                  Bulk Data Import
                </h3>
                <p className="text-xs text-muted-foreground font-medium">
                  Sync your external statements with XpenseFlow.
                </p>
              </div>
            </div>
            <div className="bg-muted/20 p-6 rounded-3xl border border-border/50">
              <ExcelImport onImport={() => {}} accounts={accounts} />
            </div>
          </div>
        </div>

        {/* Sidebar Settings */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm space-y-8">
            <div className="space-y-1">
              <h3 className="text-xl font-bold tracking-tight">Preferences</h3>
              <p className="text-xs text-muted-foreground font-medium">
                Personalize your workspace.
              </p>
            </div>

            <div className="space-y-4">
              <div className="p-5 bg-muted/20 rounded-3xl border border-border/50 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-background rounded-lg flex items-center justify-center border border-border">
                      <span className="text-xs font-bold">₹</span>
                    </div>
                    <span className="text-sm font-bold">Currency</span>
                  </div>
                  <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                    INR
                  </span>
                </div>
                <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                  <p className="text-[10px] text-amber-600 font-bold leading-relaxed">
                    Currency selection is currently locked to INR. Future
                    support for multi-currency workspaces will be added soon.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-emerald-600 rounded-[2.5rem] p-8 text-white shadow-xl shadow-emerald-500/20 relative overflow-hidden group">
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
              <ShieldCheck className="w-32 h-32" />
            </div>
            <div className="relative space-y-4">
              <h3 className="text-xl font-bold">Security & Privacy</h3>
              <p className="text-xs text-emerald-100 leading-relaxed">
                Your data is encrypted and stored securely in our cloud
                infrastructure. We never share your financial information.
              </p>
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-bold uppercase tracking-widest">
                  <Lock className="w-3 h-3" /> End-to-End Encrypted
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-[2.5rem] p-8 shadow-sm">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-muted rounded-xl flex items-center justify-center">
                  <UserIcon className="w-5 h-5 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-sm font-bold">
                    {user?.displayName || "User"}
                  </p>
                  <p className="text-[10px] text-muted-foreground truncate max-w-37.5">
                    {user?.email}
                  </p>
                </div>
              </div>
              <button
                onClick={logOut}
                className="w-full flex items-center justify-center gap-2 py-3 bg-rose-500/10 text-rose-500 rounded-xl text-xs font-bold hover:bg-rose-500 hover:text-white transition-all"
              >
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
