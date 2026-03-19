import { motion } from "motion/react";
import { LogIn, Loader2 } from "lucide-react";
import { useState } from "react";
import { UserCredential } from "firebase/auth";

export default function LoginScreen({
  signIn,
}: {
  signIn: () => Promise<UserCredential>;
}) {
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (loading) return;

    try {
      setLoading(true);
      await signIn();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6 font-sans selection:bg-emerald-500/30 overflow-hidden relative">
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.05),transparent_70%)] pointer-events-none" />
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />
      <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl animate-pulse" />

      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-md w-full space-y-8 text-center relative z-10"
      >
        <div className="w-20 h-20 rounded-4xl flex items-center justify-center mx-auto mb-8">
          <img src="/logo.svg" alt="logo" className="w-20 h-20" />
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-black tracking-tighter leading-none">
            Xpense<span className="text-emerald-500"> Flow</span>
          </h1>
          <p className="text-muted-foreground text-sm font-medium leading-relaxed">
            The ultimate financial command center. Track your wealth, analyze
            spending, and master your money with real-time precision.
          </p>
        </div>

        <div className="bg-card/50 backdrop-blur-xl border border-border p-8 rounded-[2.5rem] shadow-2xl space-y-6">
          <div className="space-y-2">
            <h3 className="text-xl font-bold tracking-tight">
              Access Command Center
            </h3>
            <p className="text-xs text-muted-foreground">
              Sign in to unlock full financial tracking and analytics.
            </p>
          </div>

          <button
            onClick={handleSignIn}
            disabled={loading}
            className={`w-full px-8 py-4 rounded-2xl font-bold transition-all shadow-lg flex items-center justify-center gap-3
              ${
                loading
                  ? "bg-emerald-500/70 cursor-not-allowed"
                  : "bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] shadow-emerald-500/20 text-white"
              }`}
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Signing you in...
              </>
            ) : (
              <>
                <LogIn className="w-5 h-5" />
                Sign in with Google
              </>
            )}
          </button>

          <div className="pt-4 border-t border-border/50">
            <p className="text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-bold">
              Secure Cloud Infrastructure
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
