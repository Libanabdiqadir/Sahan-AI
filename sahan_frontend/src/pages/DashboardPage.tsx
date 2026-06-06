import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  User,
  CheckCircle2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { resumeApi, profileApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type { ResumeHistory, UserProfile } from "../types";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: "easeOut" as const },
});


export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeHistory[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    resumeApi.list().then(setResumes).catch(() => {});
    profileApi.get().then(setProfile).catch(() => {});
  }, []);

  const completed = resumes.filter((r) => r.status === "completed").length;
  const firstName = user?.first_name?.trim() || "User";
  console.log("[DashboardPage] user from context →", { first_name: user?.first_name, last_name: user?.last_name, resolved_firstName: firstName });

  // ── Profile Strength scoring engine ──────────────────────────────────────
  const expCount    = profile?.work_experience?.length ?? 0;
  const techCount   = profile?.master_data?.tech_skills?.length ?? 0;
  const softCount   = profile?.master_data?.soft_skills?.length ?? 0;
  const certCount   = profile?.certifications?.length ?? 0;
  const projCount   = profile?.projects?.length ?? 0;
  const eduCount    = profile?.education_history?.length ?? 0;

  const score = !profile ? 0 : [
    profile.contact_email ? 5 : 0,
    profile.phone_number  ? 5 : 0,
    profile.location      ? 5 : 0,
    profile.linkedin_url  ? 5 : 0,
    expCount >= 1         ? 10 : 0,
    expCount >= 2         ? 10 : 0,
    eduCount  >= 1        ? 15 : 0,
    projCount >= 1        ? 10 : 0,
    certCount >= 1        ? 15 : 0,
    techCount >= 4        ? 10 : 0,
    softCount >= 3        ? 10 : 0,
  ].reduce((a, b) => a + b, 0);

  const ringColor   = score >= 80 ? "#10b981" : score >= 50 ? "#3b82f6" : score >= 30 ? "#f59e0b" : "#ef4444";
  const statusLabel = score >= 80 ? "ATS Ready 🎉" : score >= 50 ? "Good Progress" : "Needs Work";
  const statusCls   = score >= 80
    ? "bg-emerald-50 text-emerald-700"
    : score >= 50
    ? "bg-blue-50 text-blue-700"
    : "bg-amber-50 text-amber-700";

  const CIRC = 326.7; // 2π × 52

  const tips = [
    { label: "Add contact email",        done: !!profile?.contact_email,               tab: "info",   pts: 5  },
    { label: "Add phone number",         done: !!profile?.phone_number,                tab: "info",   pts: 5  },
    { label: "Add your location",        done: !!profile?.location,                    tab: "info",   pts: 5  },
    { label: "Add LinkedIn profile",     done: !!profile?.linkedin_url,                tab: "info",   pts: 5  },
    { label: "Add first work experience",done: expCount >= 1,                          tab: "career", pts: 10 },
    { label: "Add second experience",    done: expCount >= 2,                          tab: "career", pts: 10 },
    { label: "Add education record",     done: eduCount  >= 1,                         tab: "career", pts: 15 },
    { label: "Add a project",            done: projCount >= 1,                         tab: "career", pts: 10 },
    { label: "Add a certification",      done: certCount >= 1,                         tab: "career", pts: 15 },
    { label: "Add 4+ technical skills",  done: techCount >= 4,                         tab: "career", pts: 10 },
    { label: "Add 3+ soft skills",       done: softCount >= 3,                         tab: "career", pts: 10 },
  ].sort((a, b) => Number(a.done) - Number(b.done));

  const doneCount = tips.filter(t => t.done).length;

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
        <p className="font-sans text-[14px] text-slate-400 mt-1">
          Here's your application activity at a glance.
        </p>
      </motion.div>

      {/* Stats */}
      <motion.div
        {...fade(0.08)}
        className="grid grid-cols-4 gap-4 mb-8"
      >
        {[
          { label: "Resumes Generated", value: resumes.length, change: "Total all time", accent: true },
          { label: "Completed", value: completed, change: `${resumes.length ? Math.round((completed / resumes.length) * 100) : 0}% success rate` },
          { label: "Cover Letters", value: completed, change: "Auto-generated with CV" },
          { label: "This Month", value: resumes.filter(r => new Date(r.created_at).getMonth() === new Date().getMonth()).length, change: "Plan resets monthly" },
        ].map(({ label, value, change, accent }) => (
          <div
            key={label}
            className={`bg-white rounded-xl p-5 border ${accent ? "border-t-[3px] border-t-blue-600 border-x-stone-200 border-b-stone-200" : "border-stone-200"}`}
          >
            <p className="font-sans text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-2">
              {label}
            </p>
            <p className="text-[30px] font-bold text-slate-900 tracking-tighter leading-none">
              {value}
            </p>
            <p className="font-sans text-[11px] text-slate-400 mt-2">{change}</p>
          </div>
        ))}
      </motion.div>

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
            <p className="font-sans text-[12px] text-slate-400 mt-0.5">
              Paste a job description, let Gemini AI work
            </p>
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
            <p className="font-sans text-[12px] text-slate-400 mt-0.5">
              Keep your career data current and complete
            </p>
          </div>
          <ArrowRight size={16} className="ml-auto text-slate-300 group-hover:text-slate-500 transition-colors" />
        </button>
      </motion.div>

      {/* Profile Strength */}
      <motion.div {...fade(0.16)}>
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={16} className="text-blue-600" />
          <h2 className="text-[15px] font-bold text-slate-900">Resume Performance &amp; Profile Strength</h2>
        </div>

        <div className="grid grid-cols-[35%_1fr] gap-4 max-[700px]:grid-cols-1">

          {/* ── Left: Radial Progress ── */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
            {!profile ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-[140px] h-[140px] rounded-full bg-stone-100 animate-pulse" />
                <div className="h-4 w-24 bg-stone-100 rounded animate-pulse" />
              </div>
            ) : (
              <>
                {/* SVG ring */}
                <div className="relative w-[140px] h-[140px]">
                  <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
                    {/* Track */}
                    <circle cx="70" cy="70" r="52" fill="none" stroke="#f1f5f9" strokeWidth="11" />
                    {/* Progress */}
                    <circle
                      cx="70" cy="70" r="52" fill="none"
                      stroke={ringColor}
                      strokeWidth="11"
                      strokeLinecap="round"
                      strokeDasharray={CIRC}
                      strokeDashoffset={CIRC * (1 - score / 100)}
                      style={{ transition: "stroke-dashoffset 0.9s cubic-bezier(.4,0,.2,1)" }}
                    />
                  </svg>
                  {/* Centered text overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="font-bold text-[32px] leading-none" style={{ color: ringColor }}>
                      {score}
                    </span>
                    <span className="font-sans text-[11px] text-slate-400 font-semibold mt-0.5">/ 100</span>
                  </div>
                </div>

                {/* Status chip */}
                <span className={`font-sans text-[12px] font-bold px-3 py-1 rounded-full ${statusCls}`}>
                  {statusLabel}
                </span>

                {/* Description */}
                <p className="font-sans text-[12px] text-slate-400 text-center leading-relaxed">
                  {score >= 80
                    ? "Your profile is complete and ATS-optimised."
                    : score >= 50
                    ? "A few more additions will significantly boost your score."
                    : "Complete the checklist to make your profile recruiter-ready."}
                </p>

                <button
                  onClick={() => navigate("/profile")}
                  className="w-full font-sans text-[12px] font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 py-2 rounded-xl transition-colors"
                >
                  Open Profile →
                </button>
              </>
            )}
          </div>

          {/* ── Right: Tips checklist ── */}
          <div className="bg-white border border-stone-200 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-[14px] text-slate-900">Improve Your Score</h3>
                <p className="font-sans text-[12px] text-slate-400 mt-0.5">
                  {doneCount} / {tips.length} tasks complete
                </p>
              </div>
              {/* Mini progress bar */}
              <div className="w-28 h-2 bg-stone-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${(doneCount / tips.length) * 100}%`,
                    backgroundColor: ringColor,
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              {tips.map((tip, i) => (
                <div
                  key={i}
                  onClick={() => !tip.done && navigate(`/profile?tab=${tip.tab}`)}
                  className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all select-none ${
                    tip.done
                      ? "bg-emerald-50/60"
                      : "bg-white border border-stone-200 hover:border-blue-400 hover:bg-blue-50/30 cursor-pointer hover:scale-[1.01] active:scale-[0.99]"
                  }`}
                >
                  {tip.done ? (
                    <CheckCircle2 size={15} className="text-emerald-500 shrink-0" />
                  ) : (
                    <div className="w-[15px] h-[15px] rounded-full border-2 border-slate-300 shrink-0" />
                  )}
                  <span className={`font-sans text-[13px] flex-1 ${tip.done ? "text-slate-400 line-through decoration-slate-300" : "text-slate-700 font-medium"}`}>
                    {tip.label}
                  </span>
                  <span className={`font-sans text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    tip.done ? "bg-emerald-100 text-emerald-600" : "bg-slate-100 text-slate-400"
                  }`}>
                    +{tip.pts} pts
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}