import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Sparkles,
  User,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { resumeApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type { ResumeHistory } from "../types";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: "easeOut" },
});

function StatusBadge({ status }: { status: ResumeHistory["status"] }) {
  if (status === "completed")
    return (
      <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
        <CheckCircle2 size={10} /> Completed
      </span>
    );
  if (status === "pending")
    return (
      <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700">
        <Loader2 size={10} className="animate-spin" /> Processing
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600">
      <XCircle size={10} /> Failed
    </span>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState<ResumeHistory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    resumeApi
      .list()
      .then(setResumes)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const completed = resumes.filter((r) => r.status === "completed").length;
  const recent = resumes.slice(0, 6);
  const firstName = user?.first_name || user?.email?.split("@")[0] || "there";

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

      {/* Recent Docs */}
      <motion.div {...fade(0.16)}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15px] font-bold text-slate-900">Recent Documents</h2>
          <Link
            to="/profile"
            className="font-sans text-[13px] text-blue-600 hover:underline"
          >
            View Document Vault →
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-3 gap-4">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-white border border-stone-200 rounded-xl p-5 animate-pulse">
                <div className="w-8 h-8 bg-stone-100 rounded-lg mb-4" />
                <div className="h-3 bg-stone-100 rounded mb-2 w-3/4" />
                <div className="h-3 bg-stone-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : recent.length === 0 ? (
          <div className="bg-white border border-dashed border-stone-300 rounded-xl p-12 text-center">
            <FileText size={32} className="text-stone-300 mx-auto mb-3" />
            <p className="font-sans text-[14px] text-slate-400 mb-4">
              No resumes generated yet
            </p>
            <button
              onClick={() => navigate("/tailor")}
              className="font-sans text-[13px] font-semibold text-blue-600 hover:underline"
            >
              Generate your first tailored resume →
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {recent.map((r, i) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate("/tailor")}
                className="bg-white border border-stone-200 rounded-xl p-5 cursor-pointer hover:border-blue-400 hover:shadow-[0_4px_16px_rgba(37,99,235,0.08)] transition-all"
              >
                <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <FileText size={16} className="text-blue-600" />
                </div>
                <p className="font-semibold text-[14px] text-slate-900 mb-1 line-clamp-1">
                  {r.job_title || "Untitled Role"}
                </p>
                <p className="font-sans text-[12px] text-slate-400 mb-4">
                  {r.company_name || "No company"}
                </p>
                <div className="flex items-center justify-between">
                  <StatusBadge status={r.status} />
                  <span className="font-sans text-[11px] text-slate-300">
                    {new Date(r.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}