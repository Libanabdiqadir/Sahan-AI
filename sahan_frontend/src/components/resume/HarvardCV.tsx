import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import type { UserProfile, TailoredData } from "../../types";


const INCH = 72;

const styles = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    color: "#1a1a2e",
    paddingTop: INCH * 0.28,
    paddingBottom: INCH * 0.28,
    paddingLeft: INCH * 0.55,
    paddingRight: INCH * 0.55,
    lineHeight: 1.3,
  },
  name: {
    fontSize: 18,
    fontFamily: "Times-Bold",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 5,
  },
  // Unified contact-row styles — no textAlign/marginBottom that break inline baseline
  contactRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginTop: 2,
    marginBottom: 5,
  },
  contactItem: {
    fontSize: 10,
    fontFamily: "Times-Roman",
    color: "#4b5563",
    lineHeight: 1,
  },
  contactItemLink: {
    fontSize: 10,
    fontFamily: "Times-Roman",
    color: "#2563eb",
    lineHeight: 1,
  },
  contactSep: {
    fontSize: 9,
    fontFamily: "Times-Roman",
    color: "#9ca3af",
    marginLeft: 5,
    marginRight: 5,
    lineHeight: 1,
  },
  // Cover-letter sign-off
  clSignoff: {
    fontSize: 10,
    fontFamily: "Times-Roman",
    color: "#4b5563",
    marginTop: 18,
    marginBottom: 12,
  },
  clSignName: {
    fontSize: 11,
    fontFamily: "Times-Bold",
    color: "#1a1a2e",
    marginBottom: 2,
  },
  clSignRole: {
    fontSize: 9.5,
    fontFamily: "Times-Italic",
    color: "#6b7280",
  },
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a2e",
    marginBottom: 2,
  },
  section: {
    marginBottom: 2,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#d1d5db",
    paddingBottom: 2,
    marginBottom: 3,
  },
  summary: {
    fontSize: 9,
    fontFamily: "Times-Roman",
    color: "#374151",
    lineHeight: 1.35,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  expTitle: {
    fontSize: 10,
    fontFamily: "Times-Bold",
  },
  expDate: {
    fontSize: 9,
    fontFamily: "Times-Roman",
    color: "#6b7280",
  },
  expCompany: {
    fontSize: 9.5,
    fontFamily: "Times-Italic",
    color: "#374151",
    marginBottom: 1,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 2,
    paddingLeft: 10,
  },
  bulletDot: {
    width: 10,
    fontSize: 10.5,
    fontFamily: "Times-Roman",
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Times-Roman",
    lineHeight: 1.35,
  },
  expBlock: {
    marginBottom: 3,
  },
  eduRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 3,
  },
  eduDegree: {
    fontSize: 10,
    fontFamily: "Times-Bold",
  },
  eduSchool: {
    fontSize: 9.5,
    fontFamily: "Times-Italic",
    color: "#374151",
  },
  skillsGrid: {
    flexDirection: "row",
    gap: 14,
  },
  skillsCol: {
    flex: 1,
  },
  skillCategory: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    marginBottom: 2,
  },
  skillText: {
    fontSize: 9,
    fontFamily: "Times-Roman",
    color: "#374151",
    lineHeight: 1.35,
  },
  coverLetterBody: {
    fontSize: 9.5,
    fontFamily: "Times-Roman",
    lineHeight: 1.45,
    color: "#1a1a2e",
  },
  coverLetterParagraph: {
    marginBottom: 9,
  },
  projBlock: { marginBottom: 3 },
  projHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 1 },
  projTitle: { fontSize: 10, fontFamily: "Times-Bold" },
  projRole: { fontSize: 9.5, fontFamily: "Times-Italic", color: "#374151", marginBottom: 1 },
  projLink: { fontSize: 9, fontFamily: "Times-Roman", color: "#6b7280", marginBottom: 1 },
  certRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 },
  certName: { fontSize: 10, fontFamily: "Times-Bold" },
  certSub: { fontSize: 9, fontFamily: "Times-Italic", color: "#6b7280" },
  // kept for any legacy callers
  clickableLink: { fontSize: 10, fontFamily: "Times-Roman", color: "#2563eb", lineHeight: 1 },
});

interface HarvardCVProps {
  profile: UserProfile;
  tailored: TailoredData;
  jobTitle: string;
  companyName: string;
}

// ─── Shared palette & helpers (browser previews) ────────────────────────────
const H = {
  dark:   "#1a1a2e",
  body:   "#374151",
  muted:  "#4b5563",
  light:  "#6b7280",
  border: "#d1d5db",
  accent: "#2563eb",
  serif:  '"Georgia", "Times New Roman", Times, serif',
};

function HSectionTitle({ title }: { title: string }) {
  return (
    <div style={{ marginBottom: "4px" }}>
      <p style={{ fontFamily: H.serif, fontWeight: 700, fontSize: "8.5px", textTransform: "uppercase" as const, letterSpacing: "1.5px", color: H.dark, marginBottom: "2px" }}>
        {title}
      </p>
      <div style={{ borderBottom: `0.5px solid ${H.border}` }} />
    </div>
  );
}

type HContactItem = { kind: "email" | "text" | "link"; val: string };

function HContactRow({ items }: { items: HContactItem[] }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", flexWrap: "wrap" as const, marginTop: "2px", marginBottom: "5px" }}>
      {items.map((item, i) => (
        <span key={i} style={{ display: "inline-flex", alignItems: "center", fontSize: "9.5px", color: H.muted }}>
          {i > 0 && <span style={{ margin: "0 5px", color: "#9ca3af" }}>·</span>}
          {item.kind === "link" ? (
            <a href={item.val} target="_blank" rel="noopener noreferrer" style={{ color: H.accent, textDecoration: "none" }}>LinkedIn</a>
          ) : item.kind === "email" ? (
            <a href={`mailto:${item.val}`} style={{ color: H.accent, textDecoration: "none" }}>{item.val}</a>
          ) : (
            <span>{item.val}</span>
          )}
        </span>
      ))}
    </div>
  );
}

export function HarvardCV({ profile, tailored, jobTitle, companyName }: HarvardCVProps) {
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

  const contactItems = [
    profile.contact_email ? { kind: "email" as const, val: profile.contact_email } : null,
    profile.phone_number  ? { kind: "text"  as const, val: profile.phone_number } : null,
    profile.location      ? { kind: "text"  as const, val: profile.location } : null,
    profile.linkedin_url  ? { kind: "link"  as const, val: profile.linkedin_url } : null,
  ].filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <Document title={`${profile.full_name} — ${jobTitle} @ ${companyName}`}>
      {/* ── CV PAGE ──────────────────────────────────────────────────────── */}
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <Text style={styles.name}>{profile.full_name}</Text>
        <View style={styles.contactRow}>
          {contactItems.map((item, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
              {i > 0 && <Text style={styles.contactSep}>·</Text>}
              {item.kind === "link" ? (
                <Link src={item.val} style={styles.contactItemLink}>LinkedIn</Link>
              ) : item.kind === "email" ? (
                <Link src={`mailto:${item.val}`} style={styles.contactItemLink}>{item.val}</Link>
              ) : (
                <Text style={styles.contactItem}>{item.val}</Text>
              )}
            </View>
          ))}
        </View>
        <View style={styles.headerDivider} />

        {/* Summary */}
        {tailored.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{tailored.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {experience.map((exp, i) => (
              <View key={i} style={styles.expBlock}>
                <View style={styles.expHeader}>
                  <Text style={styles.expTitle}>{exp.role}</Text>
                  <Text style={styles.expDate}>{exp.duration}</Text>
                </View>
                <Text style={styles.expCompany}>{exp.company}</Text>
                {exp.responsibilities?.map((r, j) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{r}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Projects */}
        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Projects</Text>
            {projects.map((p, i) => (
              <View key={i} style={styles.projBlock}>
                <View style={styles.projHeader}>
                  <Text style={styles.projTitle}>{p.name || p.title || ""}</Text>
                  <Text style={styles.expDate}>{p.dates || p.duration || ""}</Text>
                </View>
                {!!(p.role_title) && <Text style={styles.projRole}>{p.role_title}</Text>}
                {!!(p.link || p.url) && <Text style={styles.projLink}>{p.link || p.url}</Text>}
                {!!(p.description) && (
                  <View style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{p.description}</Text>
                  </View>
                )}
                {(p.highlights || []).map((h: string, j: number) => (
                  <View key={j} style={styles.bullet}>
                    <Text style={styles.bulletDot}>•</Text>
                    <Text style={styles.bulletText}>{h}</Text>
                  </View>
                ))}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {education.map((edu, i) => (
              <View key={i} style={styles.eduRow}>
                <View>
                  <Text style={styles.eduDegree}>{edu.degree}</Text>
                  <Text style={styles.eduSchool}>{edu.university}</Text>
                </View>
                <Text style={styles.expDate}>{edu.graduation_year}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Skills — wrap={false} prevents the 2-column grid from splitting across pages */}
        {(techSkills.length > 0 || softSkills.length > 0 || languages.length > 0) && (
        <View style={styles.section} wrap={false}>
          <Text style={styles.sectionTitle}>Skills & Languages</Text>
          <View style={styles.skillsGrid}>
            {techSkills.length > 0 && (
              <View style={styles.skillsCol}>
                <Text style={styles.skillCategory}>Technical Skills</Text>
                <Text style={styles.skillText}>{techSkills.join(", ")}</Text>
              </View>
            )}
            <View style={styles.skillsCol}>
              {softSkills.length > 0 && (
                <>
                  <Text style={styles.skillCategory}>Soft Skills</Text>
                  <Text style={styles.skillText}>{softSkills.join(", ")}</Text>
                </>
              )}
              {languages.length > 0 && (
                <>
                  <Text style={[styles.skillCategory, { marginTop: 4 }]}>Languages</Text>
                  <Text style={styles.skillText}>{languages.join(", ")}</Text>
                </>
              )}
            </View>
          </View>
        </View>
        )}
        {/* Certifications */}
        {certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Certifications</Text>
            {certifications.map((c, i) => (
              <View key={i} style={styles.certRow}>
                <Text style={styles.certName}>{c.name || ""}</Text>
                <Text style={styles.certSub}>
                  {[c.issuer || c.organization, c.issue_date || c.year || c.date].filter(Boolean).join("  ·  ")}
                </Text>
              </View>
            ))}
          </View>
        )}
      </Page>

      {/* ── COVER LETTER PAGE ─────────────────────────────────────────────── */}
      {tailored.cover_letter && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.name}>{profile.full_name}</Text>
          <View style={styles.contactRow}>
            {contactItems.map((item, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
                {i > 0 && <Text style={styles.contactSep}>·</Text>}
                {item.kind === "link" ? (
                  <Link src={item.val} style={styles.contactItemLink}>LinkedIn</Link>
                ) : item.kind === "email" ? (
                  <Link src={`mailto:${item.val}`} style={styles.contactItemLink}>{item.val}</Link>
                ) : (
                  <Text style={styles.contactItem}>{item.val}</Text>
                )}
              </View>
            ))}
          </View>
          <View style={styles.headerDivider} />
          <View style={{ marginBottom: 20 }}>
            <Text style={styles.sectionTitle}>Cover Letter</Text>
            <Text style={[styles.expDate, { marginBottom: 14 }]}>
              {companyName} — {jobTitle}
            </Text>
          </View>
          {tailored.cover_letter.split("\n\n").map((para, i) => (
            <Text key={i} style={[styles.coverLetterBody, styles.coverLetterParagraph]}>
              {para.trim()}
            </Text>
          ))}
          {/* Sign-off */}
          <Text style={styles.clSignoff}>Sincerely,</Text>
          <Text style={styles.clSignName}>{profile.full_name}</Text>
          {!!jobTitle && <Text style={styles.clSignRole}>{jobTitle}</Text>}
        </Page>
      )}
    </Document>
  );
}

// ─── Browser CV Preview ─────────────────────────────────────────────────────────
export function HarvardPreview({
  profile,
  tailored,
  jobTitle,
}: {
  profile: UserProfile;
  tailored: TailoredData;
  jobTitle: string;
}) {
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

  const contactItems: HContactItem[] = [
    profile.contact_email ? { kind: "email", val: profile.contact_email } : null,
    profile.phone_number  ? { kind: "text",  val: profile.phone_number } : null,
    profile.location      ? { kind: "text",  val: profile.location } : null,
    profile.linkedin_url  ? { kind: "link",  val: profile.linkedin_url } : null,
  ].filter((x): x is HContactItem => x !== null);

  return (
    <div style={{ background: "white", width: "216mm", minHeight: "279mm", margin: "0 auto", fontFamily: H.serif, fontSize: "10.5px", lineHeight: 1.3, color: H.dark, border: "1px solid #e8e6e0", borderRadius: "8px", overflow: "hidden", boxSizing: "border-box", padding: "20px 40px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "5px" }}>
        <h1 style={{ fontFamily: H.serif, fontWeight: 700, fontSize: "18px", textTransform: "uppercase", letterSpacing: "2px", color: H.dark, marginBottom: "5px" }}>
          {profile.full_name}
        </h1>
        <HContactRow items={contactItems} />
        <div style={{ borderBottom: `1px solid ${H.dark}`, marginBottom: "6px" }} />
      </div>

      {/* Summary */}
      {tailored.summary && (
        <div style={{ marginBottom: "8px" }}>
          <HSectionTitle title="Professional Summary" />
          <p style={{ fontSize: "9px", color: H.body, lineHeight: 1.35 }}>{tailored.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && (
        <div style={{ marginBottom: "8px" }}>
          <HSectionTitle title="Professional Experience" />
          {experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1px" }}>
                <span style={{ fontWeight: 700, fontSize: "10px", color: H.dark }}>{exp.role}</span>
                <span style={{ fontSize: "9px", color: H.light }}>{exp.duration}</span>
              </div>
              <p style={{ fontStyle: "italic", fontSize: "9.5px", color: H.body, marginBottom: "2px" }}>{exp.company}</p>
              {exp.responsibilities?.map((r, j) => (
                <div key={j} style={{ display: "flex", gap: "4px", marginBottom: "2px", paddingLeft: "10px" }}>
                  <span style={{ flexShrink: 0 }}>•</span>
                  <span style={{ fontSize: "9px", color: H.body, lineHeight: 1.35 }}>{r}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div style={{ marginBottom: "8px" }}>
          <HSectionTitle title="Projects" />
          {projects.map((p, i) => (
            <div key={i} style={{ marginBottom: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "1px" }}>
                <span style={{ fontWeight: 700, fontSize: "10px", color: H.dark }}>{p.name || p.title || ""}</span>
                <span style={{ fontSize: "9px", color: H.light }}>{p.dates || p.duration || ""}</span>
              </div>
              {!!p.role_title && <p style={{ fontStyle: "italic", fontSize: "9.5px", color: H.body, marginBottom: "1px" }}>{p.role_title}</p>}
              {!!(p.link || p.url) && <p style={{ fontSize: "9px", color: H.light, marginBottom: "1px" }}>{p.link || p.url}</p>}
              {!!p.description && (
                <div style={{ display: "flex", gap: "4px", marginBottom: "2px", paddingLeft: "10px" }}>
                  <span style={{ flexShrink: 0 }}>•</span>
                  <span style={{ fontSize: "9px", color: H.body, lineHeight: 1.35 }}>{p.description}</span>
                </div>
              )}
              {(p.highlights || []).map((h: string, j: number) => (
                <div key={j} style={{ display: "flex", gap: "4px", marginBottom: "2px", paddingLeft: "10px" }}>
                  <span style={{ flexShrink: 0 }}>•</span>
                  <span style={{ fontSize: "9px", color: H.body, lineHeight: 1.35 }}>{h}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && (
        <div style={{ marginBottom: "8px" }}>
          <HSectionTitle title="Education" />
          {education.map((edu, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <div>
                <p style={{ fontWeight: 700, fontSize: "10px", color: H.dark }}>{edu.degree}</p>
                <p style={{ fontStyle: "italic", fontSize: "9.5px", color: H.body }}>{edu.university}</p>
              </div>
              <span style={{ fontSize: "9px", color: H.light }}>{edu.graduation_year}</span>
            </div>
          ))}
        </div>
      )}

      {/* Skills & Languages */}
      {(techSkills.length > 0 || softSkills.length > 0 || languages.length > 0) && (
      <div style={{ marginBottom: "8px" }}>
        <HSectionTitle title="Skills & Languages" />
        <div style={{ display: "flex", gap: "14px" }}>
          {techSkills.length > 0 && (
            <div style={{ flex: 1 }}>
              <p style={{ fontWeight: 700, fontSize: "9px", color: H.dark, marginBottom: "2px" }}>Technical Skills</p>
              <p style={{ fontSize: "9px", color: H.body, lineHeight: 1.35 }}>{techSkills.join(", ")}</p>
            </div>
          )}
          <div style={{ flex: 1 }}>
            {softSkills.length > 0 && (
              <>
                <p style={{ fontWeight: 700, fontSize: "9px", color: H.dark, marginBottom: "2px" }}>Soft Skills</p>
                <p style={{ fontSize: "9px", color: H.body, lineHeight: 1.35, marginBottom: "4px" }}>{softSkills.join(", ")}</p>
              </>
            )}
            {languages.length > 0 && (
              <>
                <p style={{ fontWeight: 700, fontSize: "9px", color: H.dark, marginBottom: "2px" }}>Languages</p>
                <p style={{ fontSize: "9px", color: H.body, lineHeight: 1.35 }}>{languages.join(", ")}</p>
              </>
            )}
          </div>
        </div>
      </div>
      )}

      {/* Certifications */}
      {certifications.length > 0 && (
        <div>
          <HSectionTitle title="Certifications" />
          {certifications.map((c, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
              <span style={{ fontWeight: 700, fontSize: "10px", color: H.dark }}>{c.name || ""}</span>
              <span style={{ fontStyle: "italic", fontSize: "9px", color: H.light }}>
                {[c.issuer || c.organization, c.issue_date || c.year || c.date].filter(Boolean).join("  ·  ")}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Browser Cover Letter Preview ───────────────────────────────────────────────
export function HarvardCoverLetterPreview({
  profile,
  tailored,
  jobTitle,
  companyName,
}: {
  profile: UserProfile;
  tailored: TailoredData;
  jobTitle: string;
  companyName: string;
}) {
  const contactItems: HContactItem[] = [
    profile.contact_email ? { kind: "email", val: profile.contact_email } : null,
    profile.phone_number  ? { kind: "text",  val: profile.phone_number } : null,
    profile.location      ? { kind: "text",  val: profile.location } : null,
    profile.linkedin_url  ? { kind: "link",  val: profile.linkedin_url } : null,
  ].filter((x): x is HContactItem => x !== null);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <div style={{ background: "white", width: "216mm", minHeight: "279mm", margin: "0 auto", fontFamily: H.serif, fontSize: "10.5px", lineHeight: 1.3, color: H.dark, border: "1px solid #e8e6e0", borderRadius: "8px", overflow: "hidden", boxSizing: "border-box", padding: "20px 40px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "5px" }}>
        <h1 style={{ fontFamily: H.serif, fontWeight: 700, fontSize: "18px", textTransform: "uppercase", letterSpacing: "2px", color: H.dark, marginBottom: "5px" }}>
          {profile.full_name}
        </h1>
        <HContactRow items={contactItems} />
        <div style={{ borderBottom: `1px solid ${H.dark}`, marginBottom: "10px" }} />
      </div>

      {/* Cover Letter label */}
      <div style={{ marginBottom: "14px" }}>
        <p style={{ fontWeight: 700, fontSize: "8.5px", textTransform: "uppercase", letterSpacing: "1.5px", color: H.dark, marginBottom: "2px" }}>Cover Letter</p>
        <div style={{ borderBottom: `0.5px solid ${H.border}`, marginBottom: "5px" }} />
        <p style={{ fontSize: "9px", color: H.light }}>{companyName} — {jobTitle}</p>
      </div>

      {/* Date */}
      <p style={{ fontSize: "9.5px", color: H.light, marginBottom: "14px" }}>{today}</p>

      {/* Greeting */}
      <p style={{ fontSize: "9.5px", color: H.dark, marginBottom: "13px" }}>Dear Hiring Manager,</p>

      {/* Body */}
      {tailored.cover_letter?.split("\n\n").map((para, i) => (
        <p key={i} style={{ fontSize: "9.5px", color: H.dark, lineHeight: 1.45, marginBottom: "9px" }}>{para.trim()}</p>
      ))}

      {/* Sign-off */}
      <p style={{ fontSize: "10px", color: H.muted, marginTop: "18px", marginBottom: "12px" }}>Sincerely,</p>
      <p style={{ fontWeight: 700, fontSize: "11px", color: H.dark, marginBottom: "2px" }}>{profile.full_name}</p>
      {!!jobTitle && <p style={{ fontStyle: "italic", fontSize: "9.5px", color: H.light }}>{jobTitle}</p>}
    </div>
  );
}