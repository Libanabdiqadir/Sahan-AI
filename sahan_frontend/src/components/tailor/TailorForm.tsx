import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, AlertCircle, FileText, ChevronDown, SlidersHorizontal, TriangleAlert } from "lucide-react";
import type { Template, GenerationMode } from "../../types";
import { TEMPLATES } from "./TemplatePickerModal";

const MODE_LABELS: Record<GenerationMode, string> = {
  both:              "Both Documents",
  cv_only:           "Resume Only",
  cover_letter_only: "Cover Letter Only",
};

interface Props {
  jobTitle: string;
  setJobTitle: (v: string) => void;
  companyName: string;
  setCompanyName: (v: string) => void;
  jobDescription: string;
  setJobDescription: (v: string) => void;
  loading: boolean;
  error: string;
  template: Template;
  selectedMode: GenerationMode;
  onOpenTemplateModal: () => void;
  onGenerate: () => void;
  onOpenChoiceModal: () => void;
}

export function TailorForm({
  jobTitle, setJobTitle,
  companyName, setCompanyName,
  jobDescription, setJobDescription,
  loading, error,
  template, selectedMode, onOpenTemplateModal,
  onGenerate, onOpenChoiceModal,
}: Props) {
  const selectedLabel = TEMPLATES.find(t => t.id === template)?.label ?? "";
  const modeLabel     = MODE_LABELS[selectedMode];

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 mb-5">
      <h2 className="text-[18px] font-bold text-slate-900 tracking-tight mb-1">AI Resume Tailoring</h2>
      <p className="font-sans text-[13px] text-slate-400 mb-5">
        Enter the job details below. Our AI engine will craft a tailored resume and cover letter matched to this specific role.
      </p>

      {/* Template picker trigger */}
      <div className="mb-5">
        <label className="label-xs mb-3 block">Choose Template</label>
        <button
          type="button"
          onClick={onOpenTemplateModal}
          className="flex items-center justify-between w-full px-4 py-3 border-2 border-stone-200 hover:border-blue-400 rounded-xl bg-white transition-all group"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
              <FileText size={16} className="text-blue-600" />
            </div>
            <div className="text-left">
              <p className="font-sans font-semibold text-[13px] text-slate-900">Choose Template</p>
              <p className="font-sans text-[11px] text-slate-400 mt-0.5">
                Selected: <span className="text-blue-600 font-semibold">{selectedLabel}</span>
              </p>
            </div>
          </div>
          <ChevronDown size={15} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="label-xs mb-1 block">Job Title</label>
          <input className="form-input w-full" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Senior Product Designer" />
        </div>
        <div>
          <label className="label-xs mb-1 block">Company Name</label>
          <input className="form-input w-full" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Stripe" />
        </div>
      </div>

      <div className="mb-5">
        <label className="label-xs mb-1 block">Job Description</label>
        <textarea
          className="form-input min-h-[140px] resize-y w-full"
          value={jobDescription}
          onChange={e => setJobDescription(e.target.value)}
          placeholder="Paste the full job description here..."
        />
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg font-sans text-[13px] text-red-600 flex items-center gap-2"
          >
            <AlertCircle size={14} /> {error}
          </motion.div>
        )}
        {selectedMode === "cover_letter_only" && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="mb-4 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl font-sans text-[13px] text-amber-800 flex items-start gap-2"
          >
            <TriangleAlert size={15} className="mt-0.5 shrink-0 text-amber-500" />
            <span>
              <strong>Cover Letter Only mode is active.</strong> Generating now will produce an empty resume.
              {" "}<button onClick={onOpenChoiceModal} className="underline font-semibold hover:text-amber-900">Switch to Both Documents</button> to get a full resume and cover letter.
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Primary: immediate generation with current mode */}
        <button
          onClick={onGenerate}
          disabled={loading || !jobDescription.trim()}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 text-white font-sans font-semibold text-[14px] px-6 py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
        >
          {loading
            ? <><Loader2 size={15} className="animate-spin" /> Generating…</>
            : <><Sparkles size={15} /> Generate</>}
        </button>

        {/* Secondary: open format picker modal — shows current mode so user always knows what will generate */}
        <button
          onClick={onOpenChoiceModal}
          disabled={loading}
          className="w-full sm:w-auto flex flex-col items-center sm:items-start font-sans px-5 py-2.5 rounded-xl border-2 border-stone-200 text-slate-600 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/40 disabled:opacity-50 transition-all"
        >
          <span className="flex items-center gap-1.5 font-semibold text-[13px]">
            <SlidersHorizontal size={13} /> Choose Type
          </span>
          <span className="text-[11px] text-slate-400 mt-0.5">
            Mode: <span className={`font-semibold ${selectedMode === "cover_letter_only" ? "text-amber-500" : "text-blue-600"}`}>{modeLabel}</span>
          </span>
        </button>
      </div>
    </div>
  );
}
