import { motion } from "framer-motion";
import { Sparkles, User, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { useDashboard } from "../hooks/useDashboard";
import { useProfileStrength } from "../hooks/useProfileStrength";
import { StatsGrid } from "../components/dashboard/StatsGrid";
import { ProfileStrengthPanel } from "../components/dashboard/ProfileStrengthPanel";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: "easeOut" as const },
});

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { resumes, profile } = useDashboard();
  const strength = useProfileStrength(profile);
  const firstName = user?.first_name?.trim() || "User";
  console.log("[DashboardPage] user from context →", { first_name: user?.first_name, last_name: user?.last_name, resolved_firstName: firstName });

  return (
    <div className="max-w-[1100px] mx-auto px-6 py-10">

      {/* Upgrade banner */}
      <motion.div
        {...fade(0)}
        className="mb-8 rounded-2xl bg-gradient-to-r from-slate-900 to-blue-800 p-5 flex items-center justify-between"
      >
        <div>
          <h3 className="text-[15px] font-bold text-white mb-1">
            You're on the Free plan — {resumes.length}/2 resumes used this month
          </h3>
          <p className="font-sans text-[12px] text-blue-200">
            Upgrade to Pro for unlimited AI tailoring, all PDF templates, and priority generation.
          </p>
        </div>
        <button className="ml-6 shrink-0 bg-white text-slate-900 font-sans font-bold text-[13px] px-5 py-2.5 rounded-xl hover:bg-blue-50 transition-colors">
          Upgrade to Pro →
        </button>
      </motion.div>

      {/* Greeting */}
      <motion.div {...fade(0.04)} className="mb-8">
        <h1 className="text-[26px] font-bold text-slate-900 tracking-tight">
          Welcome to our platform, {firstName}. 👋
        </h1>
        <p className="font-sans text-[14px] text-slate-400 mt-1">Here's your application activity at a glance.</p>
      </motion.div>

      <StatsGrid resumes={resumes} />

      {/* Quick Actions */}
      <motion.div {...fade(0.12)} className="grid grid-cols-2 gap-4 mb-8">
        <button
          onClick={() => navigate("/tailor")}
          className="bg-white border border-stone-200 rounded-xl p-5 flex items-center gap-4 text-left hover:border-blue-400 hover:bg-blue-50/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
            <Sparkles size={18} className="text-blue-600" />
          </div>
          <div>
            <p className="font-semibold text-[14px] text-slate-900">Tailor a New Resume</p>
            <p className="font-sans text-[12px] text-slate-400 mt-0.5">Paste a job description, let Gemini AI work</p>
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

      <ProfileStrengthPanel profile={profile} {...strength} />
    </div>
  );
}
