import type { UserProfile, ResumeHistory } from "../../types";

type Tailored = NonNullable<ResumeHistory["tailored_data"]>;

// ─── Harvard CV Preview ─────────────────────────────────────────────────────────
export function HarvardPreview({ profile, tailored }: { profile: UserProfile; tailored: Tailored }) {
  const contact = [profile.contact_email, profile.phone_number, profile.location, profile.linkedin_url].filter(Boolean).join("  ·  ");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects: any[] = tailored.projects?.length ? tailored.projects : (profile.projects ?? []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const certifications: any[] = tailored.certifications?.length ? tailored.certifications : (profile.certifications ?? []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const experience: any[] = tailored.experience?.length ? tailored.experience : (profile.work_experience ?? []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const education: any[] = tailored.education?.length ? tailored.education : (profile.education_history ?? []);
  const techSkills: string[] = tailored.tech_skills?.length ? tailored.tech_skills : (profile.master_data?.tech_skills ?? []);
  const softSkills: string[] = tailored.soft_skills?.length ? tailored.soft_skills : (profile.master_data?.soft_skills ?? []);
  const languages: string[] = tailored.languages?.length ? tailored.languages : (profile.languages ?? []);
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
      {experience.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "0.5px solid #e5e7eb", paddingBottom: "4px", marginBottom: "10px" }}>Professional Experience</p>
          {experience.map((exp, i) => (
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
      {education.length > 0 && (
        <div style={{ marginBottom: "16px" }}>
          <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "0.5px solid #e5e7eb", paddingBottom: "4px", marginBottom: "10px" }}>Education</p>
          {education.map((edu, i) => (
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
      {(techSkills.length > 0 || softSkills.length > 0 || languages.length > 0) && (
        <div>
          <p style={{ fontSize: "11px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", borderBottom: "0.5px solid #e5e7eb", paddingBottom: "4px", marginBottom: "10px" }}>Skills &amp; Languages</p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "12px" }}>
            {techSkills.length > 0 && <div><span style={{ fontWeight: "700" }}>Technical: </span><span style={{ color: "#374151" }}>{techSkills.join(", ")}</span></div>}
            {softSkills.length > 0 && <div><span style={{ fontWeight: "700" }}>Soft Skills: </span><span style={{ color: "#374151" }}>{softSkills.join(", ")}</span></div>}
            {languages.length > 0 && <div><span style={{ fontWeight: "700" }}>Languages: </span><span style={{ color: "#374151" }}>{languages.join(", ")}</span></div>}
          </div>
        </div>
      )}
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
export function HarvardCoverLetterPreview({ profile, tailored, jobTitle, companyName }: { profile: UserProfile; tailored: Tailored; jobTitle: string; companyName: string }) {
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

// ─── Executive CV Preview ───────────────────────────────────────────────────────
export function ExecutivePreview({ profile, tailored }: { profile: UserProfile; tailored: Tailored }) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects: any[] = tailored.projects?.length ? tailored.projects : (profile.projects ?? []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const certifications: any[] = tailored.certifications?.length ? tailored.certifications : (profile.certifications ?? []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const experience: any[] = tailored.experience?.length ? tailored.experience : (profile.work_experience ?? []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const education: any[] = tailored.education?.length ? tailored.education : (profile.education_history ?? []);
  const techSkills: string[] = tailored.tech_skills?.length ? tailored.tech_skills : (profile.master_data?.tech_skills ?? []);
  const softSkills: string[] = tailored.soft_skills?.length ? tailored.soft_skills : (profile.master_data?.soft_skills ?? []);
  const languages: string[] = tailored.languages?.length ? tailored.languages : (profile.languages ?? []);
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
          {techSkills.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "5px", marginBottom: "12px" }}>Technical Skills</div>
              {techSkills.map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "7px" }}><div style={{ width: "7px", height: "7px", borderRadius: "50%", background: GOLD, flexShrink: 0 }} /><span style={{ fontSize: "11px" }}>{s}</span></div>)}
            </div>
          )}
          {softSkills.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "5px", marginBottom: "12px" }}>Core Competencies</div>
              {softSkills.map((s, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "7px" }}><div style={{ width: "7px", height: "7px", borderRadius: "50%", background: NAVY, flexShrink: 0 }} /><span style={{ fontSize: "11px" }}>{s}</span></div>)}
            </div>
          )}
          {education.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "5px", marginBottom: "12px" }}>Education</div>
              {education.map((edu, i) => <div key={i} style={{ marginBottom: "12px" }}><p style={{ fontWeight: "700", fontSize: "11px", color: NAVY }}>{edu.degree}</p><p style={{ fontSize: "10.5px", color: "#4a5568", fontStyle: "italic" }}>{edu.university}</p><p style={{ fontSize: "10.5px", color: "#718096" }}>{edu.graduation_year}</p></div>)}
            </div>
          )}
          {languages.length > 0 && (
            <div style={{ marginBottom: "24px" }}>
              <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "5px", marginBottom: "12px" }}>Languages</div>
              {languages.map((l, i) => <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "7px" }}><div style={{ width: "7px", height: "7px", borderRadius: "50%", background: GOLD, flexShrink: 0 }} /><span style={{ fontSize: "11px" }}>{l}</span></div>)}
            </div>
          )}
          {certifications.length > 0 && (
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "5px", marginBottom: "12px" }}>Certifications</div>
              {certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <p style={{ fontWeight: "700", fontSize: "11px", color: NAVY }}>{c.name || ""}</p>
                  <p style={{ fontSize: "10.5px", color: "#718096" }}>{[c.issuer || c.organization, c.issue_date || c.year || c.date].filter(Boolean).join("  ·  ")}</p>
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
          {experience.length > 0 && (
            <div>
              <div style={{ fontSize: "10px", fontWeight: "700", textTransform: "uppercase", letterSpacing: "1.5px", color: NAVY, borderBottom: `2px solid ${GOLD}`, paddingBottom: "5px", marginBottom: "14px" }}>Professional Experience</div>
              {experience.map((exp, i) => (
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
export function ExecutiveCoverLetterPreview({ profile, tailored, jobTitle, companyName }: { profile: UserProfile; tailored: Tailored; jobTitle: string; companyName: string }) {
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

