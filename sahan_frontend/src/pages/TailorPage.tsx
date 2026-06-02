import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sparkles, Download, Plus, Loader2, AlertCircle,
  CheckCircle2, FileText, Mail, ChevronDown, ChevronUp, X,
} from "lucide-react";
import { resumeApi, profileApi } from "../services/api";
import type { UserProfile, ResumeHistory, ProjectEntry, CertificationEntry } from "../types";
import { HarvardCV } from "../components/resume/HarvardCV";
import { ExecutiveCV } from "../components/resume/ExecutiveCV";
import {
  ModernProfessionalCV,
  ModernProfessionalPreview,
  ModernProfessionalCoverLetterPreview,
} from "../components/resume/ModernProfessionalCV";
import {
  ModernMinimalistCV,
  ModernMinimalistPreview,
  ModernMinimalistCoverLetterPreview,
} from "../components/resume/ModernMinimalistCV";
import {
  BoldChronologicalCV,
  BoldChronologicalPreview,
  BoldChronologicalCoverLetterPreview,
} from "../components/resume/BoldChronologicalCV";

type Template = "harvard" | "executive" | "modern" | "minimalist" | "boldChronological";

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

// ─── Harvard CV Preview (browser) ──────────────────────────────────────────────
function HarvardPreview({ profile, tailored }: { profile: UserProfile; tailored: NonNullable<ResumeHistory["tailored_data"]> }) {
  const contact = [profile.contact_email, profile.phone_number, profile.location, profile.linkedin_url].filter(Boolean).join("  ·  ");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects: any[] = tailored.projects?.length ? tailored.projects : (profile.projects ?? []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const certifications: any[] = tailored.certifications?.length ? tailored.certifications : (profile.certifications ?? []);
  return (
    <div style={{ background: "white", width: "210mm", minHeight: "297mm", margin: "0 auto", padding: "25.4mm", fontFamily: "Arial, sans-serif", fontSize: "12px", lineHeight: "1.5", color: "#1a1a2e", border: "1px solid #e8e6e0", borderRadius: "8px", boxSizing: "border-box" }}>
      <h1 style={{ fontSize: "20px", fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: "5px" }}>{profile.full_name}</h1>
      <p style={{ fontSize: "11px", textAlign: "center", color: "#4b5563", marginBottom: "10px" }}>{contact}</p>
      <hr style={{ border: "none", borderTop: "1.5px solid #1a1a2e", marginBottom: "14px" }} />
      {tailored.summary && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "0.5px solid #e5e7eb", paddingBottom: "4px", marginBottom: "8px" }}>Professional Summary</p>
          <p style={{ fontSize: "12px", fontStyle: "italic", color: "#374151", lineHeight: "1.7" }}>{tailored.summary}</p>
        </div>
      )}
      {tailored.experience?.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "0.5px solid #e5e7eb", paddingBottom: "4px", marginBottom: "10px" }}>Professional Experience</p>
          {tailored.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: "700", fontSize: "13px" }}>{exp.role}</span>
                <span style={{ fontSize: "11px", color: "#6b7280" }}>{exp.duration}</span>
              </div>
              <p style={{ fontStyle: "italic", fontSize: "12px", color: "#374151", marginBottom: "6px", marginTop: "2px" }}>{exp.company}</p>
              <ul style={{ marginLeft: "16px" }}>
                {exp.responsibilities?.map((r, j) => <li key={j} style={{ fontSize: "12px", lineHeight: "1.6", marginBottom: "4px" }}>{r}</li>)}
              </ul>
            </div>
          ))}
        </div>
      )}
      {/* Projects */}
      {projects.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "0.5px solid #e5e7eb", paddingBottom: "4px", marginBottom: "10px" }}>Projects</p>
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontWeight: "700", fontSize: "13px" }}>{p.name || p.title || ""}</span>
                <span style={{ fontSize: "11px", color: "#6b7280" }}>{p.dates || p.duration || ""}</span>
              </div>
              {!!(p.role_title) && <p style={{ fontStyle: "italic", fontSize: "12px", color: "#374151", marginTop: "2px" }}>{p.role_title}</p>}
              {!!(p.link || p.url) && <p style={{ fontSize: "11px", color: "#6b7280", marginTop: "2px" }}>{p.link || p.url}</p>}
              {!!(p.description) && <p style={{ fontSize: "12px", lineHeight: "1.6", marginTop: "4px" }}>• {p.description}</p>}
            </div>
          ))}
        </div>
      )}
      {tailored.education?.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "0.5px solid #e5e7eb", paddingBottom: "4px", marginBottom: "10px" }}>Education</p>
          {tailored.education.map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
              <div>
                <p style={{ fontWeight: "700", fontSize: "13px" }}>{edu.degree}</p>
                <p style={{ fontStyle: "italic", fontSize: "12px", color: "#374151" }}>{edu.university}</p>
              </div>
              <span style={{ fontSize: "12px", color: "#6b7280" }}>{edu.graduation_year}</span>
            </div>
          ))}
        </div>
      )}
      <div>
        <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "0.5px solid #e5e7eb", paddingBottom: "4px", marginBottom: "10px" }}>Skills & Languages</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12px" }}>
          {tailored.tech_skills?.length > 0 && <div><span style={{ fontWeight: "700" }}>Technical: </span><span style={{ color: "#374151" }}>{tailored.tech_skills.join(", ")}</span></div>}
          {tailored.soft_skills?.length > 0 && <div><span style={{ fontWeight: "700" }}>Soft Skills: </span><span style={{ color: "#374151" }}>{tailored.soft_skills.join(", ")}</span></div>}
          {tailored.languages?.length > 0 && <div><span style={{ fontWeight: "700" }}>Languages: </span><span style={{ color: "#374151" }}>{tailored.languages.join(", ")}</span></div>}
        </div>
      </div>
      {/* Certifications */}
      {certifications.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "0.5px solid #e5e7eb", paddingBottom: "4px", marginBottom: "10px" }}>Certifications</p>
          {certifications.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "6px" }}>
              <span style={{ fontWeight: "700", fontSize: "12px" }}>{c.name || ""}</span>
              <span style={{ fontSize: "11px", color: "#6b7280" }}>
                {[c.issuer || c.organization, c.issue_date || c.year || c.date].filter(Boolean).join("  ·  ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Harvard Cover Letter Preview ──────────────────────────────────────────────
function HarvardCoverLetterPreview({ profile, tailored, jobTitle, companyName }: { profile: UserProfile; tailored: NonNullable<ResumeHistory["tailored_data"]>; jobTitle: string; companyName: string }) {
  const contact = [profile.contact_email, profile.phone_number, profile.location, profile.linkedin_url].filter(Boolean).join("  ·  ");
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  return (
    <div style={{ background: "white", width: "210mm", minHeight: "297mm", margin: "0 auto", padding: "25.4mm", fontFamily: "Arial, sans-serif", fontSize: "12px", lineHeight: "1.7", color: "#1a1a2e", border: "1px solid #e8e6e0", borderRadius: "8px", boxSizing: "border-box" }}>
      <h1 style={{ fontSize: "20px", fontWeight: "700", textAlign: "center", textTransform: "uppercase", letterSpacing: "2.5px", marginBottom: "5px" }}>{profile.full_name}</h1>
      <p style={{ fontSize: "11px", textAlign: "center", color: "#4b5563", marginBottom: "10px" }}>{contact}</p>
      <hr style={{ border: "none", borderTop: "1.5px solid #1a1a2e", marginBottom: "28px" }} />
      <p style={{ fontSize: "12px", marginBottom: "20px" }}>{today}</p>
      <p style={{ fontSize: "12px", marginBottom: "6px" }}><strong>Hiring Manager</strong></p>
      <p style={{ fontSize: "12px", marginBottom: "24px" }}>{companyName}</p>
      <p style={{ fontSize: "12px", fontWeight: "700", marginBottom: "24px" }}>Re: Application for {jobTitle}</p>
      {tailored.cover_letter?.split("\n\n").map((para, i) => (
        <p key={i} style={{ fontSize: "12px", lineHeight: "1.8", marginBottom: "16px" }}>{para.trim()}</p>
      ))}
      <div style={{ marginTop: "36px", fontSize: "12px" }}>
        <p style={{ marginBottom: "48px" }}>Sincerely,</p>
        <p style={{ fontWeight: "700", fontSize: "13px" }}>{profile.full_name}</p>
        {profile.contact_email && <p style={{ fontSize: "11px", color: "#4b5563", marginTop: "4px" }}>{profile.contact_email}</p>}
        {profile.phone_number && <p style={{ fontSize: "11px", color: "#4b5563" }}>{profile.phone_number}</p>}
      </div>
    </div>
  );
}

// ─── Executive CV Preview (browser) ────────────────────────────────────────────
function ExecutivePreview({ profile, tailored }: { profile: UserProfile; tailored: NonNullable<ResumeHistory["tailored_data"]> }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects: any[] = tailored.projects?.length ? tailored.projects : (profile.projects ?? []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const certifications: any[] = tailored.certifications?.length ? tailored.certifications : (profile.certifications ?? []);
  const NAVY = "#1e2d4a"; const GOLD = "#b8972e"; const LIGHT = "#f4f6f9";
  return (
    <div style={{ background: "white", width: "210mm", minHeight: "297mm", margin: "0 auto", fontFamily: "Arial, sans-serif", fontSize: "11px", lineHeight: "1.6", color: "#2d3748", border: "1px solid #e8e6e0", borderRadius: "8px", boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ background: NAVY, padding: "32px 36px 24px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px", color: "white" }}>{profile.full_name}</h1>
        <div style={{ width: "56px", height: "3px", background: GOLD, marginBottom: "12px" }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", fontSize: "10.5px", color: "#cbd5e0" }}>
          {profile.contact_email && <span>✉ {profile.contact_email}</span>}
          {profile.phone_number && <span>✆ {profile.phone_number}</span>}
          {profile.location && <span>⊙ {profile.location}</span>}
          {profile.linkedin_url && <span>in {profile.linkedin_url}</span>}
        </div>
      </div>
      <div style={{ display: "flex", minHeight: "calc(297mm - 120px)" }}>
        <div style={{ width: "34%", background: LIGHT, padding: "28px 22px", borderRight: `3px solid ${NAVY}` }}>
          {tailored.tech_skills?.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "5px", marginBottom: "12px" }}>Technical Skills</div>
              {tailored.tech_skills.map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "7px" }}><div style={{ width: "7px", height: "7px", borderRadius: "50%", background: GOLD, flexShrink: 0 }} /><span style={{ fontSize: "11px" }}>{s}</span></div>)}
            </div>
          )}
          {tailored.soft_skills?.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "5px", marginBottom: "12px" }}>Core Competencies</div>
              {tailored.soft_skills.map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "7px" }}><div style={{ width: "7px", height: "7px", borderRadius: "50%", background: NAVY, flexShrink: 0 }} /><span style={{ fontSize: "11px" }}>{s}</span></div>)}
            </div>
          )}
          {tailored.education?.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "5px", marginBottom: "12px" }}>Education</div>
              {tailored.education.map((edu, i) => <div key={i} style={{ marginBottom: "12px" }}><p style={{ fontWeight: "700", fontSize: "11px", color: NAVY }}>{edu.degree}</p><p style={{ fontSize: "10.5px", color: "#4a5568", fontStyle: "italic" }}>{edu.university}</p><p style={{ fontSize: "10.5px", color: "#718096" }}>{edu.graduation_year}</p></div>)}
            </div>
          )}
          {tailored.languages?.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "5px", marginBottom: "12px" }}>Languages</div>
              {tailored.languages.map((l, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "7px" }}><div style={{ width: "7px", height: "7px", borderRadius: "50%", background: GOLD, flexShrink: 0 }} /><span style={{ fontSize: "11px" }}>{l}</span></div>)}
            </div>
          )}
          {certifications.length > 0 && (
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "5px", marginBottom: "12px" }}>Certifications</div>
              {certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <p style={{ fontWeight: "700", fontSize: "11px", color: NAVY }}>{c.name || ""}</p>
                  <p style={{ fontSize: "10.5px", color: "#718096" }}>
                    {[c.issuer || c.organization, c.issue_date || c.year || c.date].filter(Boolean).join("  ·  ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ flex: 1, padding: "28px 32px" }}>
          {tailored.summary && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "5px", marginBottom: "12px" }}>Executive Summary</div>
              <p style={{ fontSize: "12px", color: "#4a5568", lineHeight: "1.8", fontStyle: "italic" }}>{tailored.summary}</p>
            </div>
          )}
          {tailored.experience?.length > 0 && (
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "5px", marginBottom: "14px" }}>Professional Experience</div>
              {tailored.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: "18px", paddingLeft: "14px", borderLeft: `3px solid ${GOLD}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3px" }}>
                    <p style={{ fontWeight: "700", fontSize: "13px", color: NAVY }}>{exp.role}</p>
                    <span style={{ fontSize: "10px", color: "white", background: NAVY, padding: "3px 10px", borderRadius: "20px", marginLeft: "10px", flexShrink: 0, whiteSpace: "nowrap" }}>{exp.duration}</span>
                  </div>
                  <p style={{ fontSize: "11px", color: GOLD, fontWeight: "700", marginBottom: "8px" }}>{exp.company}</p>
                  {exp.responsibilities?.map((r, j) => (
                    <div key={j} style={{ display: "flex", marginBottom: "5px", paddingLeft: "4px" }}>
                      <span style={{ color: GOLD, marginRight: "6px", fontSize: "13px", lineHeight: "1.5" }}>›</span>
                      <span style={{ fontSize: "11px", lineHeight: "1.6", color: "#4a5568" }}>{r}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
          {projects.length > 0 && (
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "5px", marginBottom: "14px" }}>Notable Projects</div>
              {projects.map((p, i) => (
                <div key={i} style={{ marginBottom: "18px", paddingLeft: "14px", borderLeft: `3px solid ${GOLD}` }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "3px" }}>
                    <p style={{ fontWeight: "700", fontSize: "13px", color: NAVY }}>{p.name || p.title || ""}</p>
                    <span style={{ fontSize: "10px", color: "white", background: NAVY, padding: "3px 10px", borderRadius: "20px", marginLeft: "10px", flexShrink: 0 }}>{p.dates || p.duration || ""}</span>
                  </div>
                  {!!(p.role_title) && <p style={{ fontSize: "11px", color: GOLD, fontWeight: "700", marginBottom: "5px" }}>{p.role_title}</p>}
                  {!!(p.link || p.url) && <p style={{ fontSize: "10px", color: "#718096", marginBottom: "5px", fontStyle: "italic" }}>{p.link || p.url}</p>}
                  {!!(p.description) && (
                    <div style={{ display: "flex", marginBottom: "4px" }}>
                      <span style={{ color: GOLD, marginRight: "6px", fontSize: "13px" }}>›</span>
                      <span style={{ fontSize: "11px", lineHeight: "1.6", color: "#4a5568" }}>{p.description}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Executive Cover Letter Preview ────────────────────────────────────────────
function ExecutiveCoverLetterPreview({ profile, tailored, jobTitle, companyName }: { profile: UserProfile; tailored: NonNullable<ResumeHistory["tailored_data"]>; jobTitle: string; companyName: string }) {
  const NAVY = "#1e2d4a"; const GOLD = "#b8972e";
  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
  const contact = [profile.contact_email, profile.phone_number, profile.location, profile.linkedin_url].filter(Boolean).join("  ·  ");
  return (
    <div style={{ background: "white", width: "210mm", minHeight: "297mm", margin: "0 auto", fontFamily: "Arial, sans-serif", fontSize: "12px", lineHeight: "1.7", color: "#2d3748", border: "1px solid #e8e6e0", borderRadius: "8px", boxSizing: "border-box", overflow: "hidden" }}>
      <div style={{ background: NAVY, padding: "32px 36px 24px" }}>
        <h1 style={{ fontSize: "26px", fontWeight: "700", letterSpacing: "3px", textTransform: "uppercase", marginBottom: "8px", color: "white" }}>{profile.full_name}</h1>
        <div style={{ width: "56px", height: "3px", background: GOLD, marginBottom: "12px" }} />
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", fontSize: "10.5px", color: "#cbd5e0" }}>
          {profile.contact_email && <span>✉ {profile.contact_email}</span>}
          {profile.phone_number && <span>✆ {profile.phone_number}</span>}
          {profile.location && <span>⊙ {profile.location}</span>}
          {profile.linkedin_url && <span>in {profile.linkedin_url}</span>}
        </div>
      </div>
      <div style={{ padding: "36px 40px" }}>
        <p style={{ fontSize: "12px", color: "#718096", marginBottom: "28px" }}>{today}</p>
        <div style={{ width: "40px", height: "2px", background: GOLD, marginBottom: "12px" }} />
        <p style={{ fontSize: "13px", fontWeight: "700", color: NAVY, marginBottom: "4px" }}>Hiring Manager</p>
        <p style={{ fontSize: "12px", color: "#4a5568", marginBottom: "24px" }}>{companyName}</p>
        <div style={{ background: NAVY, padding: "10px 16px", borderRadius: "6px", marginBottom: "28px", borderLeft: `4px solid ${GOLD}` }}>
          <p style={{ fontSize: "12px", fontWeight: "700", color: "white", margin: 0 }}>Re: Application for {jobTitle}</p>
        </div>
        {tailored.cover_letter?.split("\n\n").map((para, i) => (
          <p key={i} style={{ fontSize: "12px", lineHeight: "1.8", marginBottom: "18px", color: "#374151" }}>{para.trim()}</p>
        ))}
        <div style={{ marginTop: "36px", paddingTop: "24px", borderTop: `2px solid ${GOLD}` }}>
          <p style={{ fontSize: "12px", color: "#4a5568", marginBottom: "36px" }}>Sincerely,</p>
          <p style={{ fontSize: "15px", fontWeight: "700", color: NAVY, marginBottom: "6px" }}>{profile.full_name}</p>
          {profile.contact_email && <p style={{ fontSize: "11px", color: "#718096" }}>{profile.contact_email}</p>}
          {profile.phone_number && <p style={{ fontSize: "11px", color: "#718096" }}>{profile.phone_number}</p>}
        </div>
      </div>
    </div>
  );
}

// ─── Mini Template Previews ─────────────────────────────────────────────────────
function ModernMiniPreview() {
  return (
    <div className="w-full aspect-[4/5] rounded-md border border-slate-200 overflow-hidden bg-white flex flex-col">
      <div className="bg-slate-800 px-2 py-1.5 flex items-center gap-1.5 shrink-0">
        <div className="w-4 h-4 rounded-full bg-blue-400 shrink-0" />
        <div className="space-y-0.5">
          <div className="h-1.5 w-12 bg-white/80 rounded-sm" />
          <div className="h-1 w-8 bg-white/40 rounded-sm" />
        </div>
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-2/5 bg-slate-100 p-1 space-y-1 shrink-0 border-r border-slate-200">
          <div className="h-1 w-3/4 bg-blue-400 rounded-sm" />
          {[0,1,2,3].map(i => (
            <div key={i} className="flex items-center gap-0.5">
              <div className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
              <div className={`h-0.5 rounded-sm bg-slate-300 ${i % 2 === 0 ? "w-3/4" : "w-1/2"}`} />
            </div>
          ))}
          <div className="h-px bg-slate-200" />
          <div className="h-1 w-2/3 bg-blue-400 rounded-sm" />
          {[0,1,2].map(i => (
            <div key={i} className={`h-0.5 rounded-sm bg-slate-300 ${i % 2 === 0 ? "w-full" : "w-3/4"}`} />
          ))}
        </div>
        <div className="flex-1 p-1 space-y-1 overflow-hidden">
          <div className="h-1 w-2/3 bg-slate-700 rounded-sm" />
          <div className="h-0.5 w-full bg-slate-200 rounded-sm" />
          <div className="h-0.5 w-5/6 bg-slate-200 rounded-sm" />
          <div className="h-0.5 w-3/4 bg-slate-200 rounded-sm" />
          <div className="h-px bg-slate-100" />
          <div className="h-1 w-1/2 bg-slate-700 rounded-sm" />
          {[0,1,2,3].map(i => (
            <div key={i} className={`h-0.5 rounded-sm bg-slate-200 ${i % 2 === 0 ? "w-full" : "w-4/5"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function ExecutiveMiniPreview() {
  return (
    <div className="w-full aspect-[4/5] rounded-md border border-slate-200 overflow-hidden bg-white flex flex-col">
      <div className="bg-[#1e2d4a] px-2 py-2 shrink-0">
        <div className="h-2 w-14 bg-white/90 rounded-sm mb-0.5" />
        <div className="h-0.5 w-5 bg-[#b8972e] mb-1" />
        <div className="h-0.5 w-16 bg-white/30 rounded-sm" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[35%] bg-slate-100 p-1 space-y-1 shrink-0 border-r-2 border-[#1e2d4a]">
          <div className="h-0.5 w-3/4 bg-[#1e2d4a] rounded-sm" />
          {[0,1,2].map(i => (
            <div key={i} className="flex items-center gap-0.5">
              <div className="w-1 h-1 rounded-full bg-[#b8972e] shrink-0" />
              <div className={`h-0.5 bg-slate-300 rounded-sm ${i === 0 ? "w-full" : i === 1 ? "w-3/4" : "w-1/2"}`} />
            </div>
          ))}
          <div className="h-0.5 w-2/3 bg-[#1e2d4a] rounded-sm mt-1" />
          {[0,1].map(i => (
            <div key={i} className="flex items-center gap-0.5">
              <div className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
              <div className={`h-0.5 bg-slate-300 rounded-sm ${i === 0 ? "w-3/4" : "w-1/2"}`} />
            </div>
          ))}
        </div>
        <div className="flex-1 p-1 space-y-1 overflow-hidden">
          <div className="h-0.5 w-2/3 bg-[#1e2d4a] rounded-sm" />
          <div className="h-0.5 w-full bg-slate-200 rounded-sm" />
          <div className="h-0.5 w-4/5 bg-slate-200 rounded-sm" />
          {[0,1].map(i => (
            <div key={i} className="pl-1 border-l-2 border-[#b8972e] space-y-0.5 mt-0.5">
              <div className="h-1 w-3/4 bg-[#1e2d4a] rounded-sm" />
              <div className="h-0.5 w-1/2 bg-[#b8972e] rounded-sm" />
              <div className="h-0.5 w-full bg-slate-200 rounded-sm" />
              <div className="h-0.5 w-4/5 bg-slate-200 rounded-sm" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MinimalistMiniPreview() {
  return (
    <div className="w-full aspect-[4/5] rounded-md border border-slate-200 overflow-hidden bg-white flex flex-col">
      <div className="h-0.5 bg-slate-700 shrink-0" />
      <div className="px-2 py-1.5 border-b border-slate-200 shrink-0">
        <div className="h-1.5 w-3/4 bg-slate-800 rounded-sm mb-0.5" />
        <div className="h-0.5 w-1/2 bg-slate-400 rounded-sm" />
      </div>
      <div className="flex flex-1 overflow-hidden">
        <div className="w-[30%] bg-slate-50 p-1 space-y-0.5 shrink-0 border-r border-slate-200">
          <div className="h-0.5 w-3/4 bg-slate-500 rounded-sm mb-0.5" />
          {[0,1,2].map(i => (
            <div key={i} className={`h-0.5 rounded-sm bg-slate-300 ${i === 0 ? "w-full" : i === 1 ? "w-3/4" : "w-1/2"}`} />
          ))}
          <div className="h-px bg-slate-200" />
          <div className="h-0.5 w-2/3 bg-slate-500 rounded-sm mb-0.5" />
          {[0,1,2,3].map(i => (
            <div key={i} className="h-0.5 bg-slate-200 rounded-sm" style={{ width: `${60 + (i % 2) * 20}%` }} />
          ))}
        </div>
        <div className="flex-1 p-1 space-y-0.5 overflow-hidden">
          <div className="h-0.5 w-2/3 bg-slate-600 rounded-sm" />
          <div className="h-px bg-slate-200" />
          <div className="h-0.5 w-full bg-slate-200 rounded-sm" />
          <div className="h-0.5 w-5/6 bg-slate-200 rounded-sm" />
          <div className="h-px bg-slate-100" />
          <div className="h-0.5 w-1/2 bg-slate-600 rounded-sm" />
          {[0,1,2,3].map(i => (
            <div key={i} className={`h-0.5 rounded-sm bg-slate-200 ${i % 2 === 0 ? "w-full" : "w-4/5"}`} />
          ))}
        </div>
      </div>
    </div>
  );
}

function HarvardMiniPreview() {
  return (
    <div className="w-full aspect-[4/5] rounded-md border border-slate-200 overflow-hidden bg-white p-2 flex flex-col">
      <div className="flex flex-col items-center mb-1.5 shrink-0">
        <div className="h-2 w-3/4 bg-slate-800 rounded-sm mb-0.5" />
        <div className="h-0.5 w-full bg-slate-300 rounded-sm" />
      </div>
      <div className="h-px bg-slate-800 mb-1.5 shrink-0" />
      <div className="mb-1.5">
        <div className="h-0.5 w-16 bg-slate-700 rounded-sm mb-0.5" />
        <div className="h-px bg-slate-200 mb-0.5" />
        <div className="h-0.5 w-full bg-slate-200 rounded-sm mb-0.5" />
        <div className="h-0.5 w-5/6 bg-slate-200 rounded-sm mb-0.5" />
        <div className="h-0.5 w-3/4 bg-slate-200 rounded-sm" />
      </div>
      <div className="mb-1.5">
        <div className="h-0.5 w-20 bg-slate-700 rounded-sm mb-0.5" />
        <div className="h-px bg-slate-200 mb-0.5" />
        <div className="h-1 w-3/4 bg-slate-600 rounded-sm mb-0.5" />
        <div className="h-0.5 w-full bg-slate-200 rounded-sm mb-0.5" />
        <div className="h-0.5 w-5/6 bg-slate-200 rounded-sm mb-0.5" />
        <div className="h-0.5 w-4/5 bg-slate-200 rounded-sm" />
      </div>
      <div>
        <div className="h-0.5 w-14 bg-slate-700 rounded-sm mb-0.5" />
        <div className="h-px bg-slate-200 mb-0.5" />
        <div className="h-1 w-2/3 bg-slate-600 rounded-sm mb-0.5" />
        <div className="h-0.5 w-1/2 bg-slate-200 rounded-sm" />
      </div>
    </div>
  );
}

function BoldChronologicalMiniPreview() {
  return (
    <div className="w-full aspect-[4/5] rounded-md border border-slate-200 overflow-hidden bg-white p-2 flex flex-col gap-1.5">
      {/* Centered name + heavy rule */}
      <div className="flex flex-col items-center shrink-0">
        <div className="h-2.5 w-2/3 bg-slate-900 rounded-sm mb-0.5" />
        <div className="h-0.5 w-1/2 bg-slate-300 rounded-sm" />
      </div>
      <div className="h-[1.5px] bg-slate-900 shrink-0" />
      {/* Summary */}
      <div>
        <div className="h-0.5 w-1/4 bg-slate-700 rounded-sm mx-auto mb-0.5" />
        <div className="h-px bg-slate-800 mb-0.5" />
        <div className="h-0.5 w-full bg-slate-200 rounded-sm mb-0.5" />
        <div className="h-0.5 w-4/5 bg-slate-200 rounded-sm" />
      </div>
      {/* Experience */}
      <div>
        <div className="h-0.5 w-1/4 bg-slate-700 rounded-sm mx-auto mb-0.5" />
        <div className="h-px bg-slate-800 mb-0.5" />
        {[0,1].map(i => (
          <div key={i} className="mb-1">
            <div className="flex justify-between mb-0.5">
              <div className="h-1 w-1/3 bg-slate-800 rounded-sm" />
              <div className="h-0.5 w-1/5 bg-slate-400 rounded-sm" />
            </div>
            <div className="h-0.5 w-full bg-slate-200 rounded-sm mb-0.5" />
            <div className="h-0.5 w-5/6 bg-slate-200 rounded-sm mb-0.5" />
            <div className="h-0.5 w-4/5 bg-slate-200 rounded-sm" />
          </div>
        ))}
      </div>
      {/* Education */}
      <div>
        <div className="h-0.5 w-1/4 bg-slate-700 rounded-sm mx-auto mb-0.5" />
        <div className="h-px bg-slate-800 mb-0.5" />
        <div className="flex justify-between mb-0.5">
          <div className="h-1 w-1/3 bg-slate-800 rounded-sm" />
          <div className="h-0.5 w-1/5 bg-slate-400 rounded-sm" />
        </div>
        <div className="h-0.5 w-1/2 bg-slate-200 rounded-sm" />
      </div>
      {/* Skills inline */}
      <div>
        <div className="h-0.5 w-1/4 bg-slate-700 rounded-sm mx-auto mb-0.5" />
        <div className="h-px bg-slate-800 mb-0.5" />
        <div className="h-0.5 w-full bg-slate-300 rounded-sm" />
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
  const [template, setTemplate] = useState<Template>("modern");
  const [modalOpen, setModalOpen] = useState(false);
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<ProjectEntry>({
    title: "", role_title: "", description: "", link: "", dates: "",
  });
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [newCert, setNewCert] = useState<CertificationEntry>({
    name: "", issuer: "", issue_date: "",
  });

  useEffect(() => {
    profileApi.get().then(setProfile).catch(() => {});
  }, []);

  const handleQuickAddProject = async () => {
    if (!newProject.title.trim() || !profile) return;
    const updated: UserProfile = { ...profile, projects: [...(profile.projects ?? []), newProject] };
    await profileApi.update({ projects: updated.projects });
    setProfile(updated);
    setNewProject({ title: "", role_title: "", description: "", link: "", dates: "" });
    setProjectModalOpen(false);
  };

  const handleQuickAddCert = async () => {
    if (!newCert.name.trim() || !newCert.issuer.trim() || !profile) return;
    const updated: UserProfile = { ...profile, certifications: [...(profile.certifications ?? []), newCert] };
    await profileApi.update({ certifications: updated.certifications });
    setProfile(updated);
    setNewCert({ name: "", issuer: "", issue_date: "" });
    setCertModalOpen(false);
  };

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
      const doc =
        template === "executive"         ? <ExecutiveCV           profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} /> :
        template === "modern"            ? <ModernProfessionalCV  profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} /> :
        template === "minimalist"        ? <ModernMinimalistCV    profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} /> :
        template === "boldChronological" ? <BoldChronologicalCV   profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} /> :
                                           <HarvardCV             profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />;
      const blob = await pdf(doc).toBlob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${profile.full_name?.replace(/\s/g, "_")}_CV.pdf`;
      link.setAttribute("type", "application/pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) { alert("CV download failed: " + String(err)); }
    finally { setCvLoading(false); }
  };

  const handleDownloadCoverLetter = async () => {
    if (!profile || !tailored) return;
    setClLoading(true);
    try {
      const { pdf } = await import("@react-pdf/renderer");
      const doc =
        template === "executive"         ? <ExecutiveCV           profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} /> :
        template === "modern"            ? <ModernProfessionalCV  profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} /> :
        template === "minimalist"        ? <ModernMinimalistCV    profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} /> :
        template === "boldChronological" ? <BoldChronologicalCV   profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} /> :
                                           <HarvardCV             profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />;
      const blob = await pdf(doc).toBlob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `${profile.full_name?.replace(/\s/g, "_")}_Cover_Letter.pdf`;
      link.setAttribute("type", "application/pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) { alert("Cover letter download failed: " + String(err)); }
    finally { setClLoading(false); }
  };

  const tailored = result?.tailored_data;

  const TEMPLATES: { id: Template; label: string; desc: string; badge?: string }[] = [
    { id: "modern",             label: "Modern Professional",   desc: "Two-column, skill chips, ATS-friendly",    badge: "⭐ Recommended" },
    { id: "minimalist",         label: "Modern Minimalist",     desc: "Clean SaaS design, slate palette",         badge: "✨ New"          },
    { id: "boldChronological",  label: "Bold Chronological",    desc: "Editorial B&W, single-column serif",       badge: "✦ New"          },
    { id: "executive",          label: "Executive Navy",        desc: "Navy banner, gold accents, two-column"                              },
    { id: "harvard",            label: "Harvard Classic",       desc: "Traditional centered header, clean layout"                         },
  ];

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

            <SidebarSection title="Projects" onAdd={() => setProjectModalOpen(true)}>
              {(profile.projects ?? []).length > 0
                ? (profile.projects ?? []).map((proj, i) => (
                    <MiniCard
                      key={i}
                      title={proj.title}
                      sub={[proj.role_title, proj.dates].filter(Boolean).join(" · ")}
                    />
                  ))
                : <p className="font-sans text-[12px] text-slate-300 italic">No projects added yet</p>}
            </SidebarSection>

            <SidebarSection title="Certifications" onAdd={() => setCertModalOpen(true)}>
              {(profile.certifications ?? []).length > 0
                ? (profile.certifications ?? []).map((cert, i) => (
                    <MiniCard
                      key={i}
                      title={cert.name}
                      sub={[cert.issuer, cert.issue_date].filter(Boolean).join(" · ")}
                    />
                  ))
                : <p className="font-sans text-[12px] text-slate-300 italic">No certifications added yet</p>}
            </SidebarSection>
          </>
        ) : (
          <div className="space-y-2">{[80, 60, 70, 50].map((w, i) => <div key={i} className="h-10 bg-stone-100 rounded-lg animate-pulse" style={{ width: `${w}%` }} />)}</div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto bg-stone-50 p-6">
        <div className="bg-white border border-stone-200 rounded-2xl p-6 mb-5">
          <h2 className="text-[18px] font-bold text-slate-900 tracking-tight mb-1">AI Resume Tailoring</h2>
          <p className="font-sans text-[13px] text-slate-400 mb-5">Enter the job details below. Gemini 2.5 Flash will craft a tailored resume and cover letter matched to this specific role.</p>

          {/* Template Selector */}
          <div className="mb-5">
            <label className="label-xs mb-3 block">Choose Template</label>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="flex items-center justify-between w-full px-4 py-3 border-2 border-stone-200 hover:border-blue-400 rounded-xl bg-white transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                  <FileText size={16} className="text-blue-600" />
                </div>
                <div className="text-left">
                  <p className="font-sans font-semibold text-[13px] text-slate-900">Choose Template</p>
                  <p className="font-sans text-[11px] text-slate-400 mt-0.5">
                    Selected: <span className="text-blue-600 font-semibold">{TEMPLATES.find(t => t.id === template)?.label}</span>
                  </p>
                </div>
              </div>
              <ChevronDown size={15} className="text-slate-400 group-hover:text-blue-500 transition-colors" />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="label-xs mr-2">Job Title</label>
              <input className="form-input" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Senior Product Designer" />
            </div>
            <div>
              <label className="label-xs mr-2">Company Name</label>
              <input className="form-input" value={companyName} onChange={(e) => setCompanyName(e.target.value)} placeholder="e.g. Stripe" />
            </div>
          </div>

          <div className="mb-5">
            <label className="label-xs mr-2">Job Description</label>
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
                  <FileText size={10} /> {TEMPLATES.find(t => t.id === template)?.label}
                </span>
              </div>

              {/* CV Preview */}
              {template === "harvard"            && <HarvardPreview profile={profile} tailored={tailored} />}
              {template === "executive"          && <ExecutivePreview profile={profile} tailored={tailored} />}
              {template === "modern"             && <ModernProfessionalPreview profile={profile} tailored={tailored} jobTitle={jobTitle} />}
              {template === "minimalist"         && <ModernMinimalistPreview profile={profile} tailored={tailored} jobTitle={jobTitle} />}
              {template === "boldChronological"  && <BoldChronologicalPreview profile={profile} tailored={tailored} jobTitle={jobTitle} />}

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
                        {template === "harvard"            && <HarvardCoverLetterPreview profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />}
                        {template === "executive"          && <ExecutiveCoverLetterPreview profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />}
                        {template === "modern"             && <ModernProfessionalCoverLetterPreview profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />}
                        {template === "minimalist"         && <ModernMinimalistCoverLetterPreview profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />}
                        {template === "boldChronological"  && <BoldChronologicalCoverLetterPreview profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />}
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

      {/* Template Modal */}
      <AnimatePresence>
        {modalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
            onClick={() => setModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="bg-white rounded-2xl p-5 w-full max-w-3xl shadow-2xl max-h-[85vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between mb-5">
                <div>
                  <h3 className="font-bold text-[16px] text-slate-900 tracking-tight">Choose a Template</h3>
                  <p className="font-sans text-[12px] text-slate-400 mt-0.5">Select a layout for your resume and cover letter</p>
                </div>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1 -mr-1 pr-1">
                <div className="grid grid-cols-4 gap-2">
                  {TEMPLATES.map(({ id, label, desc, badge }) => (
                    <motion.button
                      key={id}
                      type="button"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      onClick={() => { setTemplate(id); setModalOpen(false); }}
                      className={`relative rounded-xl border-2 p-2 text-left transition-colors ${
                        template === id ? "border-blue-600 bg-blue-50/60" : "border-stone-200 hover:border-blue-300 bg-white"
                      }`}
                    >
                      {badge && (
                        <span className="absolute top-1.5 right-1.5 font-sans text-[8px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full z-10">
                          {badge}
                        </span>
                      )}
                      {id === "modern"            && <ModernMiniPreview />}
                      {id === "minimalist"         && <MinimalistMiniPreview />}
                      {id === "boldChronological"  && <BoldChronologicalMiniPreview />}
                      {id === "executive"          && <ExecutiveMiniPreview />}
                      {id === "harvard"            && <HarvardMiniPreview />}
                      <div className="mt-1.5 flex items-start gap-1">
                        <div className={`w-2.5 h-2.5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                          template === id ? "border-blue-600" : "border-slate-300"
                        }`}>
                          {template === id && <div className="w-1 h-1 rounded-full bg-blue-600" />}
                        </div>
                        <div>
                          <p className="font-sans font-semibold text-[10.5px] text-slate-900 leading-tight">{label}</p>
                          <p className="font-sans text-[8.5px] text-slate-400 mt-0.5 leading-snug">{desc}</p>
                        </div>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick-Add Project Modal */}
      <AnimatePresence>
        {projectModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
            onClick={() => setProjectModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="bg-white rounded-2xl p-6 w-full max-w-[500px] shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[16px] text-slate-900">Add Project</h3>
                <button onClick={() => setProjectModalOpen(false)} className="w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-slate-400"><X size={15} /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-xs mr-2">Project Title *</label>
                    <input className="form-input" value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} placeholder="e.g. Analytics Dashboard" autoFocus />
                  </div>
                  <div>
                    <label className="label-xs mr-2">Your Role</label>
                    <input className="form-input" value={newProject.role_title} onChange={e => setNewProject(p => ({ ...p, role_title: e.target.value }))} placeholder="e.g. Lead Developer" />
                  </div>
                </div>
                <div>
                  <label className="label-xs mr-2">Description</label>
                  <textarea className="form-input resize-none w-full min-h-[72px]" value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of impact..." />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-xs mr-2">Link</label>
                    <input className="form-input" value={newProject.link} onChange={e => setNewProject(p => ({ ...p, link: e.target.value }))} placeholder="github.com/you/project" />
                  </div>
                  <div>
                    <label className="label-xs mr-2">Dates</label>
                    <input className="form-input" value={newProject.dates} onChange={e => setNewProject(p => ({ ...p, dates: e.target.value }))} placeholder="Jan 2023 – Mar 2024" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setProjectModalOpen(false)} className="flex-1 font-sans text-[13px] font-semibold text-slate-500 border border-stone-200 py-2.5 rounded-xl hover:bg-stone-50">Cancel</button>
                <button onClick={handleQuickAddProject} disabled={!newProject.title.trim()} className="flex-1 font-sans text-[13px] font-semibold bg-slate-900 hover:bg-blue-600 disabled:opacity-40 text-white py-2.5 rounded-xl transition-colors">Save Project</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick-Add Certification Modal */}
      <AnimatePresence>
        {certModalOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
            onClick={() => setCertModalOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 12 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="bg-white rounded-2xl p-6 w-full max-w-[460px] shadow-2xl"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[16px] text-slate-900">Add Certification</h3>
                <button onClick={() => setCertModalOpen(false)} className="w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-slate-400"><X size={15} /></button>
              </div>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="label-xs mr-2">Certification Name *</label>
                    <input className="form-input" value={newCert.name} onChange={e => setNewCert(p => ({ ...p, name: e.target.value }))} placeholder="e.g. AWS Solutions Architect" autoFocus />
                  </div>
                  <div>
                    <label className="label-xs mr-2">Issuing Organization *</label>
                    <input className="form-input" value={newCert.issuer} onChange={e => setNewCert(p => ({ ...p, issuer: e.target.value }))} placeholder="e.g. Amazon" />
                  </div>
                </div>
                <div>
                  <label className="label-xs mr-2">Issue Date</label>
                  <input className="form-input w-full" value={newCert.issue_date} onChange={e => setNewCert(p => ({ ...p, issue_date: e.target.value }))} placeholder="e.g. March 2024" />
                </div>
              </div>
              <div className="flex gap-3 mt-5">
                <button onClick={() => setCertModalOpen(false)} className="flex-1 font-sans text-[13px] font-semibold text-slate-500 border border-stone-200 py-2.5 rounded-xl hover:bg-stone-50">Cancel</button>
                <button onClick={handleQuickAddCert} disabled={!newCert.name.trim() || !newCert.issuer.trim()} className="flex-1 font-sans text-[13px] font-semibold bg-slate-900 hover:bg-blue-600 disabled:opacity-40 text-white py-2.5 rounded-xl transition-colors">Save Certification</button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}