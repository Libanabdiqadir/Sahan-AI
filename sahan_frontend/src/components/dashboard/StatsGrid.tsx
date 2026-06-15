import { motion } from "framer-motion";
import type { ResumeHistory } from "../../types";

const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.3, delay, ease: "easeOut" as const },
});

interface Props {
  resumes: ResumeHistory[];
}

export function StatsGrid({ resumes }: Props) {
  const completed = resumes.filter(r => r.status === "completed").length;

  const stats = [
    { label: "Resumes Generated", value: resumes.length,   change: "Total all time",              accent: true  },
    { label: "Completed",         value: completed,         change: `${resumes.length ? Math.round((completed / resumes.length) * 100) : 0}% success rate` },
    { label: "Cover Letters",     value: completed,         change: "Auto-generated with CV"                     },
    { label: "This Month",        value: resumes.filter(r => new Date(r.created_at).getMonth() === new Date().getMonth()).length, change: "Plan resets monthly" },
  ];

  return (
    <motion.div {...fade(0.08)} className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
      {stats.map(({ label, value, change, accent }) => (
        <div
          key={label}
          className={`bg-white rounded-xl p-3 sm:p-5 border min-w-0 flex flex-col justify-between ${accent ? "border-t-[3px] border-t-blue-600 border-x-stone-200 border-b-stone-200" : "border-stone-200"}`}
        >
          <p className="font-sans text-[10px] sm:text-[11px] font-semibold text-slate-400 uppercase tracking-[0.4px] sm:tracking-wide leading-tight mb-2">{label}</p>
          <p className="text-[26px] sm:text-[30px] font-bold text-slate-900 tracking-tighter leading-none my-1">{value}</p>
          <p className="font-sans text-[10px] sm:text-[11px] text-slate-400 leading-tight mt-1">{change}</p>
        </div>
      ))}
    </motion.div>
  );
}
