import { ReactNode } from "react";
import {
  Plus,
  LayoutDashboard,
  Landmark,
  BookOpen,
  Repeat,
  Tags,
  Settings,
  PieChart,
  LogIn,
  LogOut,
} from "lucide-react";
import { motion } from "motion/react";
import ThemeToggle from "../ThemeToggle";
import BankLogo from "./BankLogo";
import { User } from "../../firebase";

type View =
  | "dashboard"
  | "transactions"
  | "planning"
  | "categories"
  | "settings"
  | "accounts";

export default function Sidebar({
  activeView,
  setActiveView,
  accounts,
  selectedAccountId,
  setSelectedAccountId,
  setShowAddAccount,
  user,
  logOut,
}: {
  activeView: View;
  setActiveView: (v: View) => void;
  accounts: any[];
  selectedAccountId: string;
  setSelectedAccountId: (id: string) => void;
  setShowAddAccount: (v: boolean) => void;
  user: User | null;
  logOut: () => void;
}) {
  return (
    <aside className="hidden md:flex w-20 lg:w-64 border-r border-border bg-card flex-col sticky top-0 h-screen z-50 transition-all duration-300">
      <div className="p-4 lg:p-6 flex flex-col h-full overflow-hidden">
        {/* Top */}
        <div className="flex items-center gap-3 mb-10 shrink-0">
          <img src="/logo.svg" alt="logo" className="w-10 h-10" />
          <div className="hidden lg:block overflow-hidden">
            <h1 className="text-sm font-bold tracking-tight text-foreground whitespace-nowrap">
              XpenseFlow
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold whitespace-nowrap">
              Command Center
            </p>
          </div>
        </div>

        {/* Middle */}
        <div className="flex-1 overflow-y-auto no-scrollbar space-y-10 py-2">
          <nav className="space-y-2">
            <NavItem
              icon={<LayoutDashboard className="w-5 h-5" />}
              label="Dashboard"
              active={activeView === "dashboard"}
              onClick={() => setActiveView("dashboard")}
            />
            <NavItem
              icon={<Landmark className="w-5 h-5" />}
              label="Banks"
              active={activeView === "accounts"}
              onClick={() => setActiveView("accounts")}
            />
            <NavItem
              icon={<BookOpen className="w-5 h-5" />}
              label="Ledger"
              active={activeView === "transactions"}
              onClick={() => setActiveView("transactions")}
            />
            <NavItem
              icon={<Repeat className="w-5 h-5" />}
              label="Subscriptions"
              active={activeView === "planning"}
              onClick={() => setActiveView("planning")}
            />
            <NavItem
              icon={<Tags className="w-5 h-5" />}
              label="Categories"
              active={activeView === "categories"}
              onClick={() => setActiveView("categories")}
            />
            <NavItem
              icon={<Settings className="w-5 h-5" />}
              label="Settings"
              active={activeView === "settings"}
              onClick={() => setActiveView("settings")}
            />
          </nav>

          {/* Accounts */}
          <div className="mt-10 hidden lg:block">
            <div className="flex items-center justify-between mb-4 px-2">
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">
                Accounts
              </p>
              <button
                onClick={() => {
                  setActiveView("accounts");
                  setShowAddAccount(true);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="text-emerald-500 hover:text-emerald-400 p-1 hover:bg-emerald-500/10 rounded-md transition-colors"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            <div className="space-y-1">
              <button
                onClick={() => {
                  setSelectedAccountId("all");
                  setActiveView("dashboard");
                }}
                className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-xs font-medium transition-all ${
                  selectedAccountId === "all"
                    ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span className="truncate">All Accounts</span>
              </button>

              {accounts.map((acc) => (
                <button
                  key={acc.id}
                  onClick={() => {
                    setSelectedAccountId(acc.id);
                    if (activeView === "accounts") setActiveView("dashboard");
                  }}
                  className={`flex items-center gap-3 w-full p-2.5 rounded-xl text-xs font-medium transition-all ${
                    selectedAccountId === acc.id
                      ? "bg-emerald-500/10 text-emerald-500 border border-emerald-500/20"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted border border-transparent"
                  }`}
                >
                  <BankLogo
                    name={acc.name}
                    url={acc.logo_url}
                    className="w-4 h-4"
                  />
                  <span className="truncate">{acc.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="mt-auto pt-6 border-t border-border shrink-0">
          <div className="items-center justify-between mb-6 px-2 hidden lg:flex">
            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">
              Theme
            </span>
            <ThemeToggle />
          </div>

          {user ? (
            <div className="flex items-center justify-between gap-3 w-full p-2 rounded-xl bg-muted/30">
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src={
                    user.photoURL ||
                    `https://ui-avatars.com/api/?name=${
                      user.displayName || user.email
                    }&background=10b981&color=fff`
                  }
                  alt="Profile"
                  className="w-8 h-8 rounded-full border border-border shrink-0"
                  referrerPolicy="no-referrer"
                />
                <div className="hidden lg:block min-w-0">
                  <p className="text-[10px] font-bold text-foreground truncate">
                    {user.displayName || "User"}
                  </p>
                  <p className="text-[8px] text-muted-foreground truncate">
                    {user.email}
                  </p>
                </div>
              </div>

              <button
                onClick={logOut}
                className="p-2 text-muted-foreground hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/10"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button className="flex items-center justify-center gap-3 w-full p-3 text-emerald-500">
              <LogIn className="w-5 h-5" />
              Login
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}

function NavItem({
  icon,
  label,
  active,
  onClick,
}: {
  icon: ReactNode;
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-3 w-full p-3 rounded-xl text-sm font-bold transition-all ${
        active
          ? "bg-emerald-500/10 text-emerald-500"
          : "text-muted-foreground hover:text-foreground hover:bg-muted"
      }`}
    >
      {icon}
      <span className="hidden lg:block">{label}</span>
      {active && (
        <motion.div
          layoutId="nav-active"
          className="absolute left-0 w-1 h-5 bg-emerald-500 rounded-r-full"
        />
      )}
    </button>
  );
}
