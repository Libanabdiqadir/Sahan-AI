import { useState } from "react";
import { resumeApi } from "../services/api";
import type { ResumeHistory } from "../types";

export function useTailorForm() {
  const [jobTitle,       setJobTitle]       = useState("");
  const [companyName,    setCompanyName]    = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [loading,        setLoading]        = useState(false);
  const [error,          setError]          = useState("");
  const [result,         setResult]         = useState<ResumeHistory | null>(null);
  const [limitInfo,      setLimitInfo]      = useState<{ plan: string; limit: number } | null>(null);

  const handleTailor = async () => {
    if (!jobDescription.trim()) { setError("Please paste a job description first."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const resume = await resumeApi.tailor({
        job_description: jobDescription,
        job_title:       jobTitle,
        company_name:    companyName,
      });
      setResult(resume);
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      if (e.code === "limit_reached") {
        setLimitInfo({ plan: (e.plan as string) || "free", limit: (e.limit as number) || 2 });
      } else {
        setError((e.error as string) || (e.detail as string) || "AI generation failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    jobTitle, setJobTitle,
    companyName, setCompanyName,
    jobDescription, setJobDescription,
    loading, error, result, limitInfo, setLimitInfo,
    handleTailor,
  };
}
