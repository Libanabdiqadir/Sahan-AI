import { motion, AnimatePresence } from "framer-motion";
import { X, MessageCircle, CreditCard } from "lucide-react";

// ─── Payment constants — edit here to change displayed details ───────────────
const PAYMENT = {
  zaad:      "0634081104",
  edahab:    "0654081104",
  whatsapp:  "https://wa.me/252634081104?text=I%20have%20paid%20for%20a%20Pro%20subscription",
} as const;

interface Props {
  isOpen:  boolean;
  plan:    string;
  limit:   number;
  onClose: () => void;
}

export function LimitModal({ isOpen, plan, limit, onClose }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        /* ── Backdrop ── */
        <motion.div
          key="limit-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
          onClick={onClose}
        >
          {/* ── Modal card ── */}
          <motion.div
            key="limit-card"
            initial={{ opacity: 0, scale: 0.92, y: 24 }}
            animate={{ opacity: 1, scale: 1,    y: 0  }}
            exit={   { opacity: 0, scale: 0.92, y: 24 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="relative w-full max-w-[min(420px,90vw)] bg-white border border-stone-200 rounded-2xl shadow-2xl font-serif overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Accent bar */}
            <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-400 to-red-400" />

            <div className="px-5 py-5 sm:px-8 sm:py-7">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 text-slate-300 hover:text-slate-500 transition-colors"
                aria-label="Close"
              >
                <X size={18} />
              </button>

              {/* Heading */}
              <div className="mb-5">
                <p className="font-sans text-[11px] font-bold text-orange-500 uppercase tracking-widest mb-1">
                  Usage limit reached
                </p>
                <h2 className="text-[20px] font-bold text-slate-900 tracking-tight leading-snug">
                  Billing Cycle Limit Reached
                </h2>
                <p className="font-sans text-[13px] text-slate-500 mt-1.5 leading-relaxed">
                  You've used all <span className="font-semibold text-slate-700">{limit}</span>{" "}
                  generation{limit !== 1 ? "s" : ""} included in your{" "}
                  <span className="font-semibold capitalize text-slate-700">{plan}</span> plan this billing period.{" "}
                  {plan.toLowerCase() === "free" && (
                    <>
                      Upgrade to{" "}
                      <span className="font-semibold text-blue-600">Pro — $4/month</span>{" "}
                      for{" "}
                      <span className="font-semibold">50 resumes &amp; cover letters per 30-day cycle</span>.{" "}
                      Unused generations do not roll over.
                    </>
                  )}
                </p>
              </div>

              {/* Payment methods */}
              <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 mb-5 space-y-3">
                <div className="flex items-center gap-2 mb-1">
                  <CreditCard size={13} className="text-slate-400" />
                  <p className="font-sans text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                    Payment details
                  </p>
                </div>

                {[
                  { label: "ZAAD",    number: PAYMENT.zaad },
                  { label: "eDahab",  number: PAYMENT.edahab },
                ].map(({ label, number }) => (
                  <div
                    key={label}
                    className="flex items-center justify-between bg-white border border-stone-200 rounded-lg px-4 py-2.5"
                  >
                    <span className="font-sans text-[13px] font-semibold text-slate-700">
                      {label}
                    </span>
                    <span className="font-sans text-[15px] font-bold text-slate-900 tracking-wide">
                      {number}
                    </span>
                  </div>
                ))}
              </div>

              {/* WhatsApp CTA */}
              <a
                href={PAYMENT.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-xl bg-[#25D366] hover:bg-[#1fba58] text-white font-sans font-bold text-[14px] transition-colors shadow-sm"
              >
                <MessageCircle size={18} />
                Contact me on WhatsApp to confirm payment
              </a>

              <p className="mt-3 text-center font-sans text-[11px] text-slate-400">
                Limit resets every 30 days from your subscription date. Unused generations do not roll over.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
