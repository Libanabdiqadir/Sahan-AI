import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Loader2, AlertCircle, FileText, ChevronDown } from "lucide-react";
import type { Template } from "../../types";
import { TEMPLATES } from "./TemplatePickerModal";

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
  onOpenTemplateModal: () => void;
  handleTailor: () => void;
}

export function TailorForm({
  jobTitle, setJobTitle,
  companyName, setCompanyName,
  jobDescription, setJobDescription,
  loading, error,
  template, onOpenTemplateModal,
  handleTailor,
}: Props) {
  const selectedLabel = TEMPLATES.find(t => t.id === template)?.label ?? "";

  return (
    <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-5">
      <h2 className="text-[18px] font-bold text-slate-900 tracking-tight mb-1">AI Resume Tailoring</h2>
      <p className="font-sans text-[13px] text-slate-400 mb-5">
        Enter the job details below. Gemini 2.5 Flash will craft a tailored resume and cover letter matched to this specific role.
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

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <label className="label-xs mr-2">Job Title</label>
          <input className="form-input" value={jobTitle} onChange={e => setJobTitle(e.target.value)} placeholder="e.g. Senior Product Designer" />
        </div>
        <div>
          <label className="label-xs mr-2">Company Name</label>
          <input className="form-input" value={companyName} onChange={e => setCompanyName(e.target.value)} placeholder="e.g. Stripe" />
        </div>
      </div>

      <div className="mb-5">
        <label className="label-xs mr-2">Job Description</label>
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
      </AnimatePresence>

      <button
        onClick={handleTailor}
        disabled={loading}
        className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 text-white font-sans font-semibold text-[14px] px-6 py-3 rounded-xl flex items-center gap-2 transition-all"
      >
        {loading
          ? <><Loader2 size={15} className="animate-spin" />Gemini AI is tailoring your resume...</>
          : <><Sparkles size={15} />Generate with Gemini AI</>}
      </button>
    </div>
  );
}
