import { motion } from "framer-motion";
import { TrendingUp, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "../../types";
import type { ProfileStrength } from "../../hooks/useProfileStrength";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: "easeOut" as const },
});

interface Props extends ProfileStrength {
  profile: UserProfile | null;
}

export function ProfileStrengthPanel({ profile, score, ringColor, statusLabel, statusCls, tips, doneCount, CIRC }: Props) {
  const navigate = useNavigate();

  return (
    <motion.div {...fade(0.16)}>
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-blue-600" />
        <h2 className="text-[15px] font-bold text-slate-900">Resume Performance &amp; Profile Strength</h2>
      </div>

      <div className="grid grid-cols-[35%_1fr] gap-4 max-[700px]:grid-cols-1">
        {/* Radial progress ring */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 flex flex-col items-center justify-center gap-4">
          {!profile ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-[140px] h-[140px] rounded-full bg-stone-100 animate-pulse" />
              <div className="h-4 w-24 bg-stone-100 rounded animate-pulse" />
            </div>
          ) : (
            <>
              <div className="relative w-[140px] h-[140px]">
                <svg width="140" height="140" viewBox="0 0 140 140" className="-rotate-90">
                  <circle cx="70" cy="70" r="52" fill="none" stroke="#f1f5f9" strokeWidth="11" />
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
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-bold text-[32px] leading-none" style={{ color: ringColor }}>{score}</span>
                  <span className="font-sans text-[11px] text-slate-400 font-semibold mt-0.5">/ 100</span>
                </div>
              </div>

              <span className={`font-sans text-[12px] font-bold px-3 py-1 rounded-full ${statusCls}`}>{statusLabel}</span>

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

        {/* Tips checklist */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-[14px] text-slate-900">Improve Your Score</h3>
              <p className="font-sans text-[12px] text-slate-400 mt-0.5">{doneCount} / {tips.length} tasks complete</p>
            </div>
            <div className="w-28 h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${(doneCount / tips.length) * 100}%`, backgroundColor: ringColor }}
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
  );
}
