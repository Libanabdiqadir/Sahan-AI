import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, User, ArrowRight, TrendingUp, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../hooks/useDashboard";
import { useProfileStrength } from "../hooks/useProfileStrength";
import { StatsGrid } from "../components/dashboard/StatsGrid";
import { ProfileStrengthPanel } from "../components/dashboard/ProfileStrengthPanel";
import { LimitModal } from "../components/LimitModal";
import { AlreadyProModal } from "../components/AlreadyProModal";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: "easeOut" as const },
});

const DOTS = [
  { size: 90,  top: "8%",  right: "18%", dur: 3.2, delay: 0 },
  { size: 60,  top: "55%", right: "6%",  dur: 2.8, delay: 0.5 },
  { size: 130, top: "20%", right: "5%",  dur: 4.1, delay: 0.9 },
  { size: 50,  top: "70%", right: "28%", dur: 3.6, delay: 0.3 },
  { size: 75,  top: "40%", right: "38%", dur: 2.5, delay: 1.1 },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { resumes, profile, subscription } = useDashboard();
  const strength = useProfileStrength(profile);
  const firstName = user?.first_name?.trim() || "there";
  const [upgradeOpen,    setUpgradeOpen]    = useState(false);
  const [alreadyProOpen, setAlreadyProOpen] = useState(false);

  const plan      = subscription?.plan      ?? "free";
  const limit     = subscription?.limit     ?? 2;
  const used      = subscription?.used      ?? 0;
  const remaining = subscription?.remaining ?? Math.max(0, 2 - resumes.length);
  const isPro     = plan.toLowerCase() !== "free";
  const isElite   = plan.toLowerCase() === "elite";
  const pct       = limit > 0 && limit < 9999 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const barColor  = pct >= 90 ? "bg-red-400" : pct >= 65 ? "bg-amber-400" : "bg-blue-500";

  const handlePlanButtonClick = () => {
    if (isPro) setAlreadyProOpen(true);
    else        setUpgradeOpen(true);
  };

  return (
    <div className="max-w-[1100px] mx-auto px-4 sm:px-6 py-6 sm:py-10">

      {/* ── Task 1: Animated Hero Welcome ───────────────────────────────────── */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 px-5 sm:px-8 py-7 sm:py-9"
      >
        {/* Floating ambient circles */}
        {DOTS.map((d, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full bg-blue-400/10 pointer-events-none"
            style={{ width: d.size, height: d.size, top: d.top, right: d.right }}
            animate={{ scale: [1, 1.12, 1], opacity: [0.25, 0.55, 0.25] }}
            transition={{ duration: d.dur, repeat: Infinity, delay: d.delay, ease: "easeInOut" }}
          />
        ))}

        <div className="relative z-10">
          <motion.p
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.12 }}
            className="font-sans text-[11px] font-bold text-blue-400 uppercase tracking-[0.18em] mb-3"
          >
            Welcome back
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.18 }}
            className="text-[32px] font-bold text-white tracking-tight leading-tight mb-3"
          >
            Hello, {firstName}. 👋
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.26 }}
            className="font-sans text-[14px] text-blue-200/75 max-w-lg leading-relaxed"
          >
            Every great career starts with a single, well-crafted resume. You're one
            tailored application away from landing your dream job — let's make it count.
          </motion.p>
        </div>
      </motion.div>

      {/* ── Task 3: Fixed Plan Banner ────────────────────────────────────────── */}
      <motion.div
        {...fade(0.06)}
        className="mb-8 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-800 p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0"
      >
        <div className="flex-1 min-w-0">
          <h3 className="text-[15px] font-bold text-white mb-1">
            {isElite
              ? `You're on the Elite plan — unlimited generations`
              : isPro
              ? `You're on the Pro plan — ${used}/${limit} generations used this month`
              : `You're on the Free plan — ${used}/${limit} resumes used this month`}
          </h3>
          <p className="font-sans text-[12px] text-blue-200">
            {isElite
              ? "Enjoy unlimited AI tailoring with priority generation."
              : isPro
              ? `${remaining} generation${remaining !== 1 ? "s" : ""} remaining this month.`
              : "Upgrade to Pro for 50 AI tailoring credits, all PDF templates, and priority generation."}
          </p>
        </div>
        <button
          onClick={handlePlanButtonClick}
          className="sm:ml-6 shrink-0 bg-white text-slate-900 font-sans font-bold text-[13px] px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors w-full sm:w-auto"
        >
          {isPro ? "View Plan →" : "Upgrade to Pro →"}
        </button>
      </motion.div>

      <StatsGrid resumes={resumes} />

      {/* ── Task 2: Generation Usage Tracker ────────────────────────────────── */}
      <motion.div
        {...fade(0.1)}
        className="mb-6 bg-white border border-stone-200 rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
              <TrendingUp size={15} className="text-blue-600" />
            </div>
            <span className="font-semibold text-[14px] text-slate-800">Monthly Generation Usage</span>
          </div>
          <span className={`font-sans text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
            isElite ? "bg-purple-50 text-purple-700" :
            isPro   ? "bg-blue-50 text-blue-700"     :
                      "bg-stone-100 text-stone-500"
          }`}>
            {plan} plan
          </span>
        </div>

        {/* Three stat tiles */}
        <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-4">
          {[
            { label: "Used",      value: used,                                         color: "text-slate-900"  },
            { label: "Limit",     value: isElite ? "∞" : limit,                        color: "text-slate-400"  },
            { label: "Remaining", value: isElite ? "∞" : remaining,
              color: remaining === 0 && !isElite ? "text-red-500" : "text-emerald-600" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-stone-50 rounded-xl p-3 text-center">
              <p className={`text-[24px] font-bold leading-none ${color}`}>{value}</p>
              <p className="font-sans text-[11px] text-slate-400 mt-1.5">{label}</p>
            </div>
          ))}
        </div>

        {/* Animated progress bar (hidden for elite/unlimited) */}
        {!isElite && (
          <div>
            <div className="flex justify-between mb-1.5">
              <span className="font-sans text-[11px] text-slate-400">{pct}% used</span>
              <span className="font-sans text-[11px] text-slate-400">{used} / {limit}</span>
            </div>
            <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.85, delay: 0.35, ease: "easeOut" }}
                className={`h-full rounded-full ${barColor}`}
              />
            </div>
            {remaining === 0 && (
              <p className="mt-2 font-sans text-[11px] text-red-500 flex items-center gap-1">
                <Zap size={10} /> Monthly limit reached.{" "}
                <button
                  onClick={handlePlanButtonClick}
                  className="underline font-semibold"
                >
                  Upgrade to Pro
                </button>
                {" "}for 50 generations/month.
              </p>
            )}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div {...fade(0.14)} className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => navigate("/tailor")}
          className="bg-white border border-stone-200 rounded-xl p-5 flex items-center gap-4 text-left hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
            <Sparkles size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-[14px] text-slate-900">Tailor a New Resume</p>
            <p className="font-sans text-[12px] text-slate-400 mt-0.5">Paste a job description, let the AI engine work</p>
          </div>
          <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-blue-500 transition-colors" />
        </button>
        <button
          onClick={() => navigate("/profile")}
          className="bg-white border border-stone-200 rounded-xl p-5 flex items-center gap-4 text-left hover:border-slate-400 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center shrink-0">
            <User size={18} className="text-slate-500" />
          </div>
          <div>
            <p className="font-semibold text-[14px] text-slate-900">Update Master Profile</p>
            <p className="font-sans text-[12px] text-slate-400 mt-0.5">Keep your career data current and complete</p>
          </div>
          <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-slate-500 transition-colors" />
        </button>
      </motion.div>

      {/* ── Bottom section — NOT TOUCHED ────────────────────────────────────── */}
      <ProfileStrengthPanel profile={profile} {...strength} />

      {/* Free-user: payment details modal */}
      <LimitModal
        isOpen={upgradeOpen}
        plan={plan}
        limit={limit}
        onClose={() => setUpgradeOpen(false)}
      />

      {/* Pro/Elite-user: already-subscribed confirmation modal */}
      <AlreadyProModal
        isOpen={alreadyProOpen}
        plan={plan}
        limit={limit}
        onClose={() => setAlreadyProOpen(false)}
      />
    </div>
  );
}
