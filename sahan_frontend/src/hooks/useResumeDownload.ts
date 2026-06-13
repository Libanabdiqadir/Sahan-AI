import { useState, createElement } from "react";
import { HarvardCV } from "../components/resume/HarvardCV";
import { ExecutiveCV } from "../components/resume/ExecutiveCV";
import { ModernProfessionalCV } from "../components/resume/ModernProfessionalCV";
import { ModernMinimalistCV } from "../components/resume/ModernMinimalistCV";
import { BoldChronologicalCV } from "../components/resume/BoldChronologicalCV";
import { CoverLetterDocument } from "../components/resume/CoverLetterDocument";
import type { Template, UserProfile, ResumeHistory } from "../types";

export function useResumeDownload(
  profile: UserProfile | null,
  tailored: ResumeHistory["tailored_data"] | undefined,
  jobTitle: string,
  companyName: string,
  template: Template,
) {
  const [cvLoading, setCvLoading] = useState(false);
  const [clLoading, setClLoading] = useState(false);

  // CV-only: pass cover_letter as empty so the PDF excludes that section
  const buildCvDoc = () => {
    const props = {
      profile: profile!,
      tailored: { ...tailored!, cover_letter: "" },
      jobTitle,
      companyName,
    };
    switch (template) {
      case "executive":         return createElement(ExecutiveCV, props);
      case "modern":            return createElement(ModernProfessionalCV, props);
      case "minimalist":        return createElement(ModernMinimalistCV, props);
      case "boldChronological": return createElement(BoldChronologicalCV, props);
      default:                  return createElement(HarvardCV, props);
    }
  };

  const buildCoverLetterDoc = () =>
    createElement(CoverLetterDocument, {
      profile: profile!,
      tailored: tailored!,
      jobTitle,
      companyName,
      template,
    });

  const triggerDownload = (blob: Blob, filename: string) => {
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.setAttribute("type", "application/pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadCV = async () => {
    if (!profile || !tailored) return;
    setCvLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      // Cast needed: our wrapper components satisfy react-pdf's runtime contract
      // but TypeScript can't verify prop-type compatibility statically.
      type PdfArg = Parameters<typeof pdf>[0];
      const blob = await pdf(buildCvDoc() as unknown as PdfArg).toBlob();
      triggerDownload(blob, `${profile.full_name?.replace(/\s/g, "_")}_CV.pdf`);
    } catch (err) {
      alert("CV download failed: " + String(err));
    } finally {
      setCvLoading(false);
    }
  };

  const handleDownloadCoverLetter = async () => {
    if (!profile || !tailored) return;
    setClLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      type PdfArg = Parameters<typeof pdf>[0];
      const blob = await pdf(buildCoverLetterDoc() as unknown as PdfArg).toBlob();
      triggerDownload(blob, `${profile.full_name?.replace(/\s/g, "_")}_Cover_Letter.pdf`);
    } catch (err) {
      alert("Cover letter download failed: " + String(err));
    } finally {
      setClLoading(false);
    }
  };

  return { handleDownloadCV, cvLoading, handleDownloadCoverLetter, clLoading };
}
