import { motion } from "motion/react";

export default function AppLoader() {
  return (
    <div className="fixed inset-0 z-200 bg-background flex items-center justify-center overflow-hidden">
      {/* Massive background gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_30%,rgba(16,185,129,0.12),transparent_40%),radial-gradient(circle_at_70%_70%,rgba(16,185,129,0.08),transparent_50%)]" />

      {/* Noise / subtle depth */}
      <div className="absolute inset-0 opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />

      {/* Main content */}
      <div className="relative flex flex-col items-center justify-center gap-12">
        {/* LOGO SECTION (this is what was missing) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col items-center gap-6"
        >
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-0 w-28 h-28 bg-emerald-500/20 rounded-3xl blur-2xl" />

            {/* Logo container */}
            <div className="relative w-24 h-24 rounded-3xl bg-card border border-border flex items-center justify-center shadow-2xl">
              <img src="/logo.svg" className="w-14 h-14" />
            </div>
          </div>

          {/* Brand */}
          <h1 className="text-2xl font-black tracking-tight">
            Xpense<span className="text-emerald-500">Flow</span>
          </h1>
        </motion.div>

        {/* PROGRESS SYSTEM (not spinner) */}
        <div className="w-72 flex flex-col gap-4">
          {/* Progress bar */}
          <div className="h-0.75 bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-emerald-500"
              initial={{ x: "-100%" }}
              animate={{ x: "100%" }}
              transition={{
                duration: 1.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>

          {/* Status text */}
          <div className="text-center space-y-1">
            <motion.p
              className="text-[10px] tracking-[0.35em] text-emerald-500 font-bold uppercase"
              animate={{ opacity: [0.6, 1, 0.6] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
              }}
            >
              Synchronizing
            </motion.p>

            <motion.p
              className="text-xs text-muted-foreground"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
            >
              Preparing your financial dashboard...
            </motion.p>
          </div>
        </div>

        {/* Floating subtle elements */}
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-emerald-500/20 rounded-full"
              style={{
                top: `${20 + Math.random() * 60}%`,
                left: `${20 + Math.random() * 60}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 4 + i,
                repeat: Infinity,
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
