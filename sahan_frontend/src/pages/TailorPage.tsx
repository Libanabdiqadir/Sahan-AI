import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles,
  Download,
  Plus,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Mail,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { resumeApi, profileApi } from "../services/api";
import type { UserProfile, ResumeHistory } from "../types";
import { HarvardCV } from "../components/resume/HarvardCV";
import { ExecutiveCV } from "../components/resume/ExecutiveCV";

type Template = "harvard" | "executive";

// ─── Sidebar helpers ────────────────────────────────────────────────────────────
function SidebarSection({ title, children, onAdd }: { title: string; children: React.ReactNode; onAdd?: () => void }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="font-sans text-[11px] font-bold text-slate-400 uppercase tracking-[0.8px]">{title}</p>
        {onAdd && (
          <button onClick={onAdd} className="font-sans text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
            <Plus size={12} /> Add
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function MiniCard({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 mb-2">
      <p className="font-semibold text-[13px] text-slate-900">{title}</p>
      <p className="font-sans text-[11px] text-slate-400 mt-0.5">{sub}</p>
    </div>
  );
}

function SkillTag({ label, variant = "blue" }: { label: string; variant?: "blue" | "green" | "purple" }) {
  const cls = {
    blue: "bg-blue-50 text-blue-700 border-blue-200",
    green: "bg-green-50 text-green-700 border-green-200",
    purple: "bg-violet-50 text-violet-700 border-violet-200",
  }[variant];
  return <span className={`font-sans text-[11px] font-medium px-2.5 py-1 rounded-full border ${cls}`}>{label}</span>;
}

// ─── Harvard CV Browser Preview ─────────────────────────────────────────────────
function HarvardPreview({ profile, tailored }: { profile: UserProfile; tailored: NonNullable<ResumeHistory["tailored_data"]> }) {
  const contact = [profile.contact_email, profile.phone_number, profile.location, profile.linkedin_url].filter(Boolean).join("  ·  ");
  return (
    <div style={{ background: "white", width: "210mm", minHeight: "297mm", margin: "0 auto", padding: "25.4mm", fontFamily: "Arial, sans-serif", fontSize: "12px", lineHeight: "1.5", color: "#1a1a2e", border: "1px solid #e8e6e0", borderRadius: "8px", boxSizing: "border-box" }}>
      <h1 style={{ fontSize: "20px", fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: "5px" }}>{profile.full_name}</h1>
      <p style={{ fontSize: "11px", textAlign: "center", color: "#4b5563", marginBottom: "10px" }}>{contact}</p>
      <hr style={{ border: "none", borderTop: "1.5px solid #1a1a2e", marginBottom: "12px" }} />

      {tailored.summary && (
        <div style={{ marginBottom: "14px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "0.5px solid #e5e7eb", paddingBottom: "3px", marginBottom: "7px" }}>Professional Summary</p>
          <p style={{ fontSize: "12px", fontStyle: "italic", color: "#374151", lineHeight: "1.6" }}>{tailored.summary}</p>
        </div>
      )}

      {tailored.experience?.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "0.5px solid #e5e7eb", paddingBottom: "3px", marginBottom: "7px" }}>Professional Experience</p>
          {tailored.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: "700", fontSize: "12px" }}>{exp.role}</span>
                <span style={{ fontSize: "11px", color: "#6b7280" }}>{exp.duration}</span>
              </div>
              <p style={{ fontStyle: "italic", fontSize: "11px", color: "#374151", marginBottom: "4px" }}>{exp.company}</p>
              <ul style={{ marginLeft: "14px", marginTop: "3px" }}>
                {exp.responsibilities?.map((r, j) => <li key={j} style={{ fontSize: "11px", lineHeight: "1.5", marginBottom: "2px" }}>{r}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}

      {tailored.education?.length > 0 && (
        <div style={{ marginBottom: "14px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "0.5px solid #e5e7eb", paddingBottom: "3px", marginBottom: "7px" }}>Education</p>
          {tailored.education.map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <div>
                <p style={{ fontWeight: "700", fontSize: "12px" }}>{edu.degree}</p>
                <p style={{ fontStyle: "italic", fontSize: "11px", color: "#374151" }}>{edu.university}</p>
              </div>
              <span style={{ fontSize: "11px", color: "#6b7280" }}>{edu.graduation_year}</span>
            </div>
          ))}
        </div>
      )}

      <div>
        <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "0.5px solid #e5e7eb", paddingBottom: "3px", marginBottom: "7px" }}>Skills & Languages</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", fontSize: "11px" }}>
          {tailored.tech_skills?.length > 0 && <div><span style={{ fontWeight: "700" }}>Technical: </span><span style={{ color: "#374151" }}>{tailored.tech_skills.join(", ")}</span></div>}
          {tailored.soft_skills?.length > 0 && <div><span style={{ fontWeight: "700" }}>Soft Skills: </span><span style={{ color: "#374151" }}>{tailored.soft_skills.join(", ")}</span></div>}
          {tailored.languages?.length > 0 && <div><span style={{ fontWeight: "700" }}>Languages: </span><span style={{ color: "#374151" }}>{tailored.languages.join(", ")}</span></div>}
        </div>
      </div>
    </div>
  );
}

// ─── Executive CV Browser Preview ───────────────────────────────────────────────
function ExecutivePreview({ profile, tailored }: { profile: UserProfile; tailored: NonNullable<ResumeHistory["tailored_data"]> }) {
  const NAVY = "#1e2d4a";
  const GOLD = "#b8972e";
  const LIGHT = "#f4f6f9";
  return (
    <div style={{ background: "white", width: "210mm", minHeight: "297mm", margin: "0 auto", fontFamily: "Arial, sans-serif", fontSize: "11px", lineHeight: "1.5", color: "#2d3748", border: "1px solid #e8e6e0", borderRadius: "8px", boxSizing: "border-box", overflow: "hidden" }}>
      {/* Navy Header */}
      <div style={{ background: NAVY, padding: "28px 32px 20px", color: "white" }}>
        <h1 style={{ fontSize: "24px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "6px", color: "white" }}>{profile.full_name}</h1>
        <div style={{ width: "48px", height: "3px", background: GOLD, marginBottom: "10px" }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "10px", color: "#cbd5e0" }}>
          {profile.contact_email && <span>✉ {profile.contact_email}</span>}
          {profile.phone_number && <span>✆ {profile.phone_number}</span>}
          {profile.location && <span>⊙ {profile.location}</span>}
          {profile.linkedin_url && <span>in {profile.linkedin_url}</span>}
        </div>
      </div>
      {/* Two columns */}
      <div style={{ display: "flex" }}>
        {/* Left sidebar */}
        <div style={{ width: "33%", background: LIGHT, padding: "24px 20px", borderRight: `3px solid ${NAVY}` }}>
          {tailored.tech_skills?.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "4px", marginBottom: "10px" }}>Technical Skills</div>
              {tailored.tech_skills.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: GOLD, flexShrink: 0 }} />
                  <span style={{ fontSize: "10px" }}>{s}</span>
                </div>
              ))}
            </div>
          )}
          {tailored.soft_skills?.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "4px", marginBottom: "10px" }}>Core Competencies</div>
              {tailored.soft_skills.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: NAVY, flexShrink: 0 }} />
                  <span style={{ fontSize: "10px" }}>{s}</span>
                </div>
              ))}
            </div>
          )}
          {tailored.education?.length > 0 && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "4px", marginBottom: "10px" }}>Education</div>
              {tailored.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <p style={{ fontWeight: "700", fontSize: "10px", color: NAVY }}>{edu.degree}</p>
                  <p style={{ fontSize: "10px", color: "#4a5568", fontStyle: "italic" }}>{edu.university}</p>
                  <p style={{ fontSize: "9px", color: "#718096" }}>{edu.graduation_year}</p>
                </div>
              ))}
            </div>
          )}
          {tailored.languages?.length > 0 && (
            <div>
              <div style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "4px", marginBottom: "10px" }}>Languages</div>
              {tailored.languages.map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "5px" }}>
                  <div style={{ width: "6px", height: "6px", borderRadius: "50%", background: GOLD, flexShrink: 0 }} />
                  <span style={{ fontSize: "10px" }}>{l}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {/* Right main */}
        <div style={{ flex: 1, padding: "24px 28px" }}>
          {tailored.summary && (
            <div style={{ marginBottom: "20px" }}>
              <div style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "4px", marginBottom: "10px" }}>Executive Summary</div>
              <p style={{ fontSize: "11px", color: "#4a5568", lineHeight: "1.7", fontStyle: "italic" }}>{tailored.summary}</p>
            </div>
          )}
          {tailored.experience?.length > 0 && (
            <div>
              <div style={{ fontSize: "9px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "4px", marginBottom: "12px" }}>Professional Experience</div>
              {tailored.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: "14px", paddingLeft: "10px", borderLeft: `3px solid ${GOLD}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
                    <p style={{ fontWeight: "700", fontSize: "12px", color: NAVY }}>{exp.role}</p>
                    <span style={{ fontSize: "9px", color: "white", background: NAVY, padding: "2px 8px", borderRadius: "20px", whiteSpace: "nowrap", marginLeft: "8px", flexShrink: 0 }}>{exp.duration}</span>
                  </div>
                  <p style={{ fontSize: "10px", color: GOLD, fontWeight: "600", marginBottom: "6px" }}>{exp.company}</p>
                  <ul style={{ marginLeft: "2px" }}>
                    {exp.responsibilities?.map((r, j) => (
                      <li key={j} style={{ fontSize: "10px", lineHeight: "1.5", marginBottom: "3px", color: "#4a5568", listStyle: "none", paddingLeft: "10px", position: "relative" }}>
                        <span style={{ position: "absolute", left: 0, color: GOLD }}>›</span>{r}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Cover Letter Browser Preview ───────────────────────────────────────────────
function CoverLetterPreview({ profile, tailored, jobTitle, companyName }: { profile: UserProfile; tailored: NonNullable<ResumeHistory["tailored_data"]>; jobTitle: string; companyName: string }) {
  const contact = [profile.contact_email, profile.phone_number, profile.location, profile.linkedin_url].filter(Boolean).join("  ·  ");
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div style={{ background: "white", width: "210mm", minHeight: "297mm", margin: "0 auto", padding: "25.4mm", fontFamily: "Arial, sans-serif", fontSize: "12px", lineHeight: "1.7", color: "#1a1a2e", border: "1px solid #e8e6e0", borderRadius: "8px", boxSizing: "border-box" }}>
      <h1 style={{ fontSize: "20px", fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: "5px" }}>{profile.full_name}</h1>
      <p style={{ fontSize: "11px", textAlign: "center", color: "#4b5563", marginBottom: "10px" }}>{contact}</p>
      <hr style={{ border: "none", borderTop: "1.5px solid #1a1a2e", marginBottom: "20px" }} />
      <p style={{ fontSize: "12px", marginBottom: "16px" }}>{today}</p>
      <p style={{ fontSize: "12px", marginBottom: "16px", lineHeight: "1.6" }}><strong>Hiring Manager</strong><br />{companyName}</p>
      <p style={{ fontSize: "12px", fontWeight: "700", marginBottom: "20px" }}>Re: Application for {jobTitle}</p>
      {tailored.cover_letter?.split("\n\n").map((para, i) => (
        <p key={i} style={{ fontSize: "12px", lineHeight: "1.7", marginBottom: "14px", color: "#1a1a2e" }}>{para.trim()}</p>
      ))}
      <div style={{ marginTop: "32px", fontSize: "12px" }}>
        <p style={{ marginBottom: "40px" }}>Sincerely,</p>
        <p style={{ fontWeight: "700" }}>{profile.full_name}</p>
        {profile.contact_email && <p style={{ fontSize: "11px", color: "#4b5563" }}>{profile.contact_email}</p>}
        {profile.phone_number && <p style={{ fontSize: "11px", color: "#4b5563" }}>{profile.phone_number}</p>}
      </div>
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────────
export default function TailorPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [result, setResult] = useState<ResumeHistory | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [coverOpen, setCoverOpen] = useState(false);
  const [jobTitle, setJobTitle] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [cvLoading, setCvLoading] = useState(false);
  const [clLoading, setClLoading] = useState(false);
  const [template, setTemplate] = useState<Template>("harvard");

  useEffect(() => {
    profileApi.get().then(setProfile).catch(() => {});
  }, []);

  const handleTailor = async () => {
    if (!jobDescription.trim()) { setError("Please paste a job description first."); return; }
    setError(""); setLoading(true); setResult(null);
    try {
      const resume = await resumeApi.tailor({ job_description: jobDescription, job_title: jobTitle, company_name: companyName });
      setResult(resume);
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      const msg = (e.error as string) || (e.detail as string) || "AI generation failed. Please try again.";
      if (msg.includes("limit")) setError("Monthly limit reached. Upgrade to Pro for unlimited resumes.");
      else setError(msg);
    } finally { setLoading(false); }
  };

  const handleDownloadCV = async () => {
  if (!profile || !tailored) return;
  setCvLoading(true);
  try {
    const { pdf } = await import("@react-pdf/renderer");
    const doc = template === "executive"
      ? <ExecutiveCV profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />
      : <HarvardCV profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />;

    const blob = await pdf(doc).toBlob();
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${profile.full_name?.replace(/\s/g, "_")}_${template === "executive" ? "Executive" : "Harvard"}_CV.pdf`;
    link.setAttribute("type", "application/pdf");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
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
      const doc = template === "executive"
        ? <ExecutiveCV profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />
        : <HarvardCV profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />;
      const blob = await pdf(doc).toBlob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${profile.full_name?.replace(/\s/g, "_")}_Cover_Letter.pdf`;
      link.setAttribute("type", "application/pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      alert("Cover letter download failed: " + String(err));
    } finally { setClLoading(false); }
  };

  const tailored = result?.tailored_data;

  return (
    <div className="flex h-[calc(100vh-60px)] overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[320px] shrink-0 bg-white border-r border-stone-200 overflow-y-auto p-5">
        <h2 className="font-bold text-[14px] text-slate-900 mb-1">Master Profile</h2>
        <p className="font-sans text-[12px] text-slate-400 mb-5 leading-relaxed">Your career data is stored once and used for every tailored resume.</p>
        {profile ? (
          <>
            <SidebarSection title="Work Experience">
              {profile.work_experience?.length > 0 ? profile.work_experience.map((exp, i) => <MiniCard key={i} title={exp.role} sub={`${exp.company} · ${exp.duration}`} />) : <p className="font-sans text-[12px] text-slate-300 italic">No experience added yet</p>}
            </SidebarSection>
            <SidebarSection title="Education">
              {profile.education_history?.length > 0 ? profile.education_history.map((edu, i) => <MiniCard key={i} title={edu.degree} sub={`${edu.university} · ${edu.graduation_year}`} />) : <p className="font-sans text-[12px] text-slate-300 italic">No education added yet</p>}
            </SidebarSection>
            <SidebarSection title="Technical Skills">
              <div className="flex flex-wrap gap-1.5">
                {(profile.master_data?.tech_skills || []).map((s) => <SkillTag key={s} label={s} variant="blue" />)}
                {!profile.master_data?.tech_skills?.length && <p className="font-sans text-[12px] text-slate-300 italic">None added</p>}
              </div>
            </SidebarSection>
            <SidebarSection title="Soft Skills">
              <div className="flex flex-wrap gap-1.5">
                {(profile.master_data?.soft_skills || []).map((s) => <SkillTag key={s} label={s} variant="green" />)}
                {!profile.master_data?.soft_skills?.length && <p className="font-sans text-[12px] text-slate-300 italic">None added</p>}
              </div>
            </SidebarSection>
            <SidebarSection title="Languages">
              <div className="flex flex-wrap gap-1.5">
                {(profile.languages || []).map((l) => <SkillTag key={l} label={l} variant="purple" />)}
                {!profile.languages?.length && <p className="font-sans text-[12px] text-slate-300 italic">None added</p>}
              </div>
            </SidebarSection>
          </>
        ) : (
          <div className="space-y-2">{[80, 60, 70, 50].map((w, i) => <div key={i} className="h-10 bg-stone-100 rounded-lg animate-pulse" style={{ width: `${w}%` }} />)}</div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-stone-50 p-6">
        {/* Form */}
        <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-5">
          <h2 className="text-[18px] font-bold text-slate-900 tracking-tight mb-1">AI Resume Tailoring</h2>
          <p className="font-sans text-[13px] text-slate-400 mb-5">Enter the job details below. Gemini AI will craft a tailored resume and cover letter matched to this specific role.</p>

          {/* Template Selector */}
          <div className="mb-5">
            <label className="label-xs mb-3 block">Choose Template</label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setTemplate("harvard")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${template === "harvard" ? "border-blue-600 bg-blue-50" : "border-stone-200 hover:border-stone-300 bg-white"}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${template === "harvard" ? "border-blue-600" : "border-stone-300"}`}>
                    {template === "harvard" && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                  <p className="font-sans font-semibold text-[13px] text-slate-900">Harvard Classic</p>
                </div>
                <p className="font-sans text-[11px] text-slate-400 ml-6">Traditional centered header · Clean serif layout</p>
              </button>
              <button
                onClick={() => setTemplate("executive")}
                className={`p-4 rounded-xl border-2 text-left transition-all ${template === "executive" ? "border-blue-600 bg-blue-50" : "border-stone-200 hover:border-stone-300 bg-white"}`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${template === "executive" ? "border-blue-600" : "border-stone-300"}`}>
                    {template === "executive" && <div className="w-2 h-2 rounded-full bg-blue-600" />}
                  </div>
                  <p className="font-sans font-semibold text-[13px] text-slate-900">Executive Navy</p>
                </div>
                <p className="font-sans text-[11px] text-slate-400 ml-6">Navy header · Two-column · Gold accents</p>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label-xs">Job Title</label>
              <input className="form-input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Senior Product Designer" />
            </div>
            <div>
              <label className="label-xs">Company Name</label>
              <input className="form-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Stripe" />
            </div>
          </div>

          <div className="mb-5">
            <label className="label-xs">Job Description</label>
            <textarea className="form-input min-h-[140px] resize-y w-full" value={jobDescription} onChange={(e) => setJobDescription(e.target.value)} placeholder="Paste the full job description here..." />
          </div>

          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg font-sans text-[13px] text-red-600 flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </motion.div>
            )}
          </AnimatePresence>

          <button onClick={handleTailor} disabled={loading} className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:opacity-60 text-white font-sans font-semibold text-[14px] px-6 py-3 rounded-xl flex items-center gap-2 transition-all">
            {loading ? (<><Loader2 size={15} className="animate-spin" />Gemini AI is tailoring your resume...</>) : (<><Sparkles size={15} />Generate with Gemini AI</>)}
          </button>
        </div>

        {/* Result */}
        <AnimatePresence>
          {result && tailored && !tailored.error && profile && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="bg-white border border-stone-200 rounded-2xl p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-[18px] font-bold text-slate-900 tracking-tight">{jobTitle || "Tailored Resume"}</h3>
                  <p className="font-sans text-[13px] text-slate-400">{companyName} · Generated just now</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleDownloadCoverLetter} disabled={clLoading} className="flex items-center gap-1.5 font-sans text-[13px] font-semibold px-4 py-2 border border-stone-200 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all disabled:opacity-50">
                    {clLoading ? <Loader2 size={13} className="animate-spin" /> : <Mail size={13} />} Cover Letter
                  </button>
                  <button onClick={handleDownloadCV} disabled={cvLoading} className="flex items-center gap-1.5 font-sans text-[13px] font-semibold px-4 py-2 bg-slate-900 hover:bg-blue-600 disabled:opacity-50 text-white rounded-lg transition-colors">
                    {cvLoading ? <Loader2 size={13} className="animate-spin" /> : <Download size={13} />} Download CV (PDF)
                  </button>
                </div>
              </div>

              <div className="flex gap-2 mb-6">
                <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700"><CheckCircle2 size={10} /> AI Tailored</span>
                <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700">
                  <FileText size={10} /> {template === "harvard" ? "Harvard Classic" : "Executive Navy"}
                </span>
              </div>

              {/* Live preview switches with template */}
              {template === "harvard"
                ? <HarvardPreview profile={profile} tailored={tailored} />
                : <ExecutivePreview profile={profile} tailored={tailored} />
              }

              {/* Cover Letter Toggle */}
              {tailored.cover_letter && (
                <div className="mt-6">
                  <button onClick={() => setCoverOpen(!coverOpen)} className="flex items-center gap-2 font-sans text-[13px] font-semibold text-slate-600 hover:text-slate-900 transition-colors mb-4">
                    {coverOpen ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
                    {coverOpen ? "Hide" : "View"} Cover Letter
                  </button>
                  <AnimatePresence>
                    {coverOpen && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <CoverLetterPreview profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}
            </motion.div>
          )}

          {result && tailored?.error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-50 border border-red-200 rounded-2xl p-5 font-sans text-[13px] text-red-600 flex items-center gap-2">
              <AlertCircle size={16} /> {tailored.error}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}