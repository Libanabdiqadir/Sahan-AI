import { motion, AnimatePresence } from "framer-motion";
import { Download, Mail, Loader2, CheckCircle2, FileText, ChevronDown, ChevronUp, AlertCircle, Info } from "lucide-react";
import type { Template, UserProfile, ResumeHistory, GenerationMode } from "../../types";
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
  generationMode?: GenerationMode;
}

export function ResumePreviewCard({
  tailored, profile, template,
  jobTitle, companyName,
  coverOpen, onToggleCover,
  onDownloadCV, onDownloadCoverLetter,
  cvLoading, clLoading,
  generationMode = "both",
}: Props) {
  const coverLetterOnly = generationMode === "cover_letter_only";
  const cvOnly          = generationMode === "cv_only";
  const selectedLabel = TEMPLATES.find(t => t.id === template)?.label ?? "";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="bg-white border border-stone-200 rounded-2xl p-6"
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div className="min-w-0">
          <h3 className="text-[18px] font-bold text-slate-900 tracking-tight truncate">{jobTitle || "Tailored Resume"}</h3>
          <p className="font-sans text-[13px] text-slate-400">{companyName} · Generated just now</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 shrink-0">
          {!coverLetterOnly && (
            <button
              onClick={onDownloadCoverLetter}
              disabled={clLoading || !tailored.cover_letter}
              className="flex items-center justify-center gap-1.5 font-sans text-[13px] font-semibold px-4 py-2.5 border border-stone-200 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all disabled:opacity-50"
            >
              {clLoading ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />} Download Letter
            </button>
          )}
          {coverLetterOnly ? (
            <button
              onClick={onDownloadCoverLetter}
              disabled={clLoading}
              className="flex items-center justify-center gap-1.5 font-sans text-[13px] font-semibold px-4 py-2.5 bg-slate-900 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {clLoading ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />} Download Letter
            </button>
          ) : (
            <button
              onClick={onDownloadCV}
              disabled={cvLoading}
              className="flex items-center justify-center gap-1.5 font-sans text-[13px] font-semibold px-4 py-2.5 bg-slate-900 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors"
            >
              {cvLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} Download CV
            </button>
          )}
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
      {coverLetterOnly ? (
        <div className="flex items-start gap-2 font-sans text-[13px] text-slate-500 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 mb-2">
          <Info size={15} className="mt-0.5 shrink-0 text-blue-400" />
          <span>You generated a <strong>Cover Letter Only</strong>. Click <strong>Generate</strong> again to create a full resume.</span>
        </div>
      ) : (
        <>
          {template === "harvard"           && <HarvardPreview profile={profile} tailored={tailored} />}
          {template === "executive"         && <ExecutivePreview profile={profile} tailored={tailored} />}
          {template === "modern"            && <ModernProfessionalPreview profile={profile} tailored={tailored} jobTitle={jobTitle} />}
          {template === "minimalist"        && <ModernMinimalistPreview profile={profile} tailored={tailored} jobTitle={jobTitle} />}
          {template === "boldChronological" && <BoldChronologicalPreview profile={profile} tailored={tailored} jobTitle={jobTitle} />}
        </>
      )}

      {/* Cover letter — always show the section; indicate when absent */}
      <div className="mt-6">
        {tailored.cover_letter ? (
          <>
            {!coverLetterOnly && (
              <button
                onClick={onToggleCover}
                className="flex items-center gap-2 font-sans text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-4"
              >
                {coverOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                {coverOpen ? "Hide" : "View"} Cover Letter
              </button>
            )}
            <AnimatePresence>
              {(coverLetterOnly || coverOpen) && (
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
          </>
        ) : (
          <div className="flex items-start gap-2 font-sans text-[13px] text-slate-400 bg-stone-50 border border-stone-200 rounded-xl px-4 py-3">
            <Info size={15} className="mt-0.5 shrink-0" />
            {cvOnly ? (
              <span>No cover letter generated — you chose <strong>CV Only</strong> mode. Re-generate with <strong>Both Documents</strong> mode to include one.</span>
            ) : (
              <span>No cover letter was generated. Re-generate with <strong>Both Documents</strong> mode to include one.</span>
            )}
          </div>
        )}
      </div>
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
