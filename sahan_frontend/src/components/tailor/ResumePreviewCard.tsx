import { motion, AnimatePresence } from "framer-motion";
import { Download, Mail, Loader2, CheckCircle2, FileText, ChevronDown, ChevronUp, AlertCircle } from "lucide-react";
import type { Template, UserProfile, ResumeHistory } from "../../types";
import { TEMPLATES } from "./TemplatePickerModal";
import { HarvardPreview, ExecutivePreview, HarvardCoverLetterPreview, ExecutiveCoverLetterPreview } from "./CVPreviews";
import {
  ModernProfessionalPreview, ModernProfessionalCoverLetterPreview,
} from "../resume/ModernProfessionalCV";
import {
  ModernMinimalistPreview, ModernMinimalistCoverLetterPreview,
} from "../resume/ModernMinimalistCV";
import {
  BoldChronologicalPreview, BoldChronologicalCoverLetterPreview,
} from "../resume/BoldChronologicalCV";

type Tailored = NonNullable<ResumeHistory["tailored_data"]>;

interface Props {
  result: ResumeHistory;
  tailored: Tailored;
  profile: UserProfile;
  template: Template;
  jobTitle: string;
  companyName: string;
  coverOpen: boolean;
  onToggleCover: () => void;
  onDownloadCV: () => void;
  onDownloadCoverLetter: () => void;
  cvLoading: boolean;
  clLoading: boolean;
}

export function ResumePreviewCard({
  tailored, profile, template,
  jobTitle, companyName,
  coverOpen, onToggleCover,
  onDownloadCV, onDownloadCoverLetter,
  cvLoading, clLoading,
}: Props) {
  const selectedLabel = TEMPLATES.find(t => t.id === template)?.label ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white border border-stone-200 rounded-2xl p-6"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[18px] font-bold text-slate-900 tracking-tight">{jobTitle || "Tailored Resume"}</h3>
          <p className="font-sans text-[13px] text-slate-400">{companyName} · Generated just now</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onDownloadCoverLetter}
            disabled={clLoading}
            className="flex items-center gap-1.5 font-sans text-[13px] font-semibold px-4 py-2 border border-stone-200 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all disabled:opacity-50"
          >
            {clLoading ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />} Cover Letter
          </button>
          <button
            onClick={onDownloadCV}
            disabled={cvLoading}
            className="flex items-center gap-1.5 font-sans text-[13px] font-semibold px-4 py-2 bg-slate-900 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors"
          >
            {cvLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} Download CV (PDF)
          </button>
        </div>
      </div>

      <div className="flex gap-2 mb-6">
        <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700">
          <CheckCircle2 size={10} /> AI Tailored
        </span>
        <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
          <FileText size={10} /> {selectedLabel}
        </span>
      </div>

      {/* CV preview */}
      {template === "harvard"           && <HarvardPreview profile={profile} tailored={tailored} />}
      {template === "executive"         && <ExecutivePreview profile={profile} tailored={tailored} />}
      {template === "modern"            && <ModernProfessionalPreview profile={profile} tailored={tailored} jobTitle={jobTitle} />}
      {template === "minimalist"        && <ModernMinimalistPreview profile={profile} tailored={tailored} jobTitle={jobTitle} />}
      {template === "boldChronological" && <BoldChronologicalPreview profile={profile} tailored={tailored} jobTitle={jobTitle} />}

      {/* Cover letter toggle */}
      {tailored.cover_letter && (
        <div className="mt-6">
          <button
            onClick={onToggleCover}
            className="flex items-center gap-2 font-sans text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-4"
          >
            {coverOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
            {coverOpen ? "Hide" : "View"} Cover Letter
          </button>
          <AnimatePresence>
            {coverOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                {template === "harvard"           && <HarvardCoverLetterPreview profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />}
                {template === "executive"         && <ExecutiveCoverLetterPreview profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />}
                {template === "modern"            && <ModernProfessionalCoverLetterPreview profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />}
                {template === "minimalist"        && <ModernMinimalistCoverLetterPreview profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />}
                {template === "boldChronological" && <BoldChronologicalCoverLetterPreview profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}

export function ResumeErrorCard({ error }: { error: string }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-red-50 border border-red-200 rounded-2xl p-5 font-sans text-[13px] text-red-600 flex items-center gap-2"
    >
      <AlertCircle size={16} /> {error}
    </motion.div>
  );
}
