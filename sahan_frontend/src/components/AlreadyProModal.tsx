import { motion, AnimatePresence } from "framer-motion";
import { X, CheckCircle2, Star } from "lucide-react";

interface Props {
  isOpen: boolean;
  plan:   string;
  limit:  number;
  onClose: () => void;
}

export function AlreadyProModal({ isOpen, plan, limit, onClose }: Props) {
  const isElite     = plan.toLowerCase() === "elite";
  const displayPlan = plan.charAt(0).toUpperCase() + plan.slice(1).toLowerCase();
  const limitText   = isElite ? "unlimited" : `${limit} per month`;

  const perks = isElite
    ? ["Unlimited AI-tailored resumes", "All premium PDF templates", "Priority generation queue"]
    : [
        `${limit} resumes & cover letters per 30-day cycle (no rollover)`,
        "All premium PDF templates",
        "Priority generation queue",
      ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="already-pro-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            key="already-pro-card"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={   { opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative w-full max-w-[400px] bg-white border border-stone-200 rounded-2xl shadow-2xl font-serif overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Accent bar */}
            <div className={`h-1.5 w-full ${isElite ? "bg-gradient-to-r from-purple-400 via-blue-400 to-indigo-400" : "bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400"}`} />

            <div className="px-7 py-6">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-slate-300 hover:text-slate-500 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Icon badge */}
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 ${isElite ? "bg-purple-50" : "bg-blue-50"}`}>
                {isElite
                  ? <Star size={22} className="text-purple-500" fill="currentColor" />
                  : <CheckCircle2 size={22} className="text-blue-500" />}
              </div>

              {/* Heading */}
              <p className={`font-sans text-[11px] font-bold uppercase tracking-widest mb-1 ${isElite ? "text-purple-500" : "text-blue-500"}`}>
                Active subscription
              </p>
              <h2 className="text-[20px] font-bold text-slate-900 tracking-tight leading-snug mb-1">
                You're already on the{" "}
                <span className={isElite ? "text-purple-600" : "text-blue-600"}>
                  {displayPlan} plan
                </span>
                !
              </h2>
              {!isElite && (
                <p className={`font-sans text-[12px] font-bold mb-2 ${isElite ? "text-purple-500" : "text-blue-500"}`}>
                  $4 / month
                </p>
              )}
              <p className="font-sans text-[13px] text-slate-500 leading-relaxed mb-5">
                Your account is fully active with access to{" "}
                <span className="font-semibold text-slate-700">{limitText}</span>{" "}
                AI-tailored resumes per 30-day billing cycle. You're all set to keep applying.
              </p>

              {/* Perks list */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-5 space-y-2.5">
                {perks.map(perk => (
                  <div key={perk} className="flex items-center gap-2.5">
                    <CheckCircle2 size={13} className={isElite ? "text-purple-400 shrink-0" : "text-blue-400 shrink-0"} />
                    <span className="font-sans text-[13px] text-slate-700">{perk}</span>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <button
                onClick={onClose}
                className={`w-full py-3 rounded-xl font-sans font-bold text-[14px] text-white transition-colors ${
                  isElite
                    ? "bg-purple-600 hover:bg-purple-700"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                Got it — keep tailoring
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
