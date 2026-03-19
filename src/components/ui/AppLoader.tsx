import { motion } from "motion/react";

export default function AppLoader() {
  return (
    <div className="fixed inset-0 z-200 bg-background flex items-center justify-center overflow-hidden">
      {/* Subtle radial focus */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.12),transparent_60%)]" />

      <div className="relative flex flex-col items-center gap-10">
        {/* Logo with magnetic glow */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          {/* breathing glow */}
          <motion.div
            className="absolute inset-0 w-28 h-28 bg-emerald-500/20 rounded-3xl blur-2xl"
            animate={{
              scale: [1, 1.25, 1],
              opacity: [0.4, 0.8, 0.4],
            }}
            transition={{
              duration: 2.5,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* logo container */}
          <div className="relative w-24 h-24 rounded-3xl bg-card border border-border flex items-center justify-center shadow-xl">
            <img src="/logo.svg" className="w-14 h-14" />
          </div>
        </motion.div>

        {/* Brand */}
        <motion.h1
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-2xl font-black tracking-tight"
        >
          Xpense<span className="text-emerald-500">Flow</span>
        </motion.h1>

        {/* Premium loader line */}
        <div className="relative w-64 h-0.5 bg-muted overflow-hidden rounded-full">
          <motion.div
            className="absolute inset-0 bg-linear-to-r from-transparent via-emerald-500 to-transparent"
            animate={{ x: ["-100%", "100%"] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Minimal text */}
        <motion.p
          className="text-xs text-muted-foreground tracking-wide"
          animate={{ opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 1.8, repeat: Infinity }}
        >
          Preparing your workspace
        </motion.p>
      </div>
    </div>
  );
}
