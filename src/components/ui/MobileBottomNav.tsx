import { ReactNode } from "react";
import {
  LayoutDashboard,
  Landmark,
  BookOpen,
  Repeat,
  Tags,
  Settings,
  Plus,
} from "lucide-react";

type View =
  | "dashboard"
  | "transactions"
  | "planning"
  | "categories"
  | "settings"
  | "accounts";

export default function MobileBottomNav({
  activeView,
  setActiveView,
  setShowForm,
}: {
  activeView: View;
  setActiveView: (v: View) => void;
  setShowForm: (v: boolean) => void;
}) {
  return (
    <div className="md:hidden fixed bottom-6 left-1/2 -translate-x-1/2 w-[95%] max-w-lg z-100">
      <nav className="bg-card/90 backdrop-blur-2xl border border-border h-16 rounded-2xl flex items-center justify-between px-2 shadow-2xl shadow-black/50">
        <MobileNavItem
          icon={<LayoutDashboard className="w-5 h-5" />}
          active={activeView === "dashboard"}
          onClick={() => setActiveView("dashboard")}
        />
        <MobileNavItem
          icon={<Landmark className="w-5 h-5" />}
          active={activeView === "accounts"}
          onClick={() => setActiveView("accounts")}
        />
        <MobileNavItem
          icon={<BookOpen className="w-5 h-5" />}
          active={activeView === "transactions"}
          onClick={() => setActiveView("transactions")}
        />

        <button
          onClick={() => setShowForm(true)}
          className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white -translate-y-6 shadow-xl shadow-emerald-500/40 active:scale-90 transition-transform shrink-0"
        >
          <Plus className="w-6 h-6" />
        </button>

        <MobileNavItem
          icon={<Repeat className="w-5 h-5" />}
          active={activeView === "planning"}
          onClick={() => setActiveView("planning")}
        />
        <MobileNavItem
          icon={<Tags className="w-5 h-5" />}
          active={activeView === "categories"}
          onClick={() => setActiveView("categories")}
        />
        <MobileNavItem
          icon={<Settings className="w-5 h-5" />}
          active={activeView === "settings"}
          onClick={() => setActiveView("settings")}
        />
      </nav>
    </div>
  );
}

function MobileNavItem({
  icon,
  active,
  onClick,
}: {
  icon: ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`p-2.5 rounded-xl transition-all duration-300 ${
        active
          ? "text-emerald-500 bg-emerald-500/10 scale-110"
          : "text-muted-foreground"
      }`}
    >
      {icon}
    </button>
  );
}
