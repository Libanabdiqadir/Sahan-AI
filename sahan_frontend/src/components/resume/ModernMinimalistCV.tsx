import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { UserProfile, TailoredData } from "../../types";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  accent:   "#334155",  // slate-700  — single accent used sparingly
  mid:      "#475569",  // slate-600  — section titles, icons
  body:     "#1e293b",  // slate-800  — primary body text (not pure black)
  muted:    "#64748b",  // slate-500  — secondary text / bullets
  subtle:   "#94a3b8",  // slate-400  — dates, tertiary labels
  sidebar:  "#f8fafc",  // slate-50   — sidebar background
  border:   "#e2e8f0",  // slate-200  — all dividers / borders
  chipBg:   "#f1f5f9",  // slate-100  — skill chip bg
  chipText: "#334155",  // slate-700  — skill chip label
  softBg:   "#f0fdf4",  // green-50   — soft-skill chip bg
  softText: "#15803d",  // green-700  — soft-skill chip label
  white:    "#ffffff",
};

const PH = 40;  // main panel horizontal padding
const PV = 40;  // vertical padding

const S = StyleSheet.create({
  // ── Page ─────────────────────────────────────────────────────────────
  page: {
    flexDirection: "column",
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: C.body,
    backgroundColor: C.white,
  },

  // Hairline accent strip across the full top
  strip: {
    height: 3,
    backgroundColor: C.accent,
  },

  // ── Full-width header ─────────────────────────────────────────────────
  header: {
    paddingTop: 20,
    paddingBottom: 14,
    paddingLeft: PH,
    paddingRight: PH,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
  },
  name: {
    fontFamily: "Helvetica-Bold",
    fontSize: 24,
    color: C.body,
    letterSpacing: 0.2,
    marginBottom: 3,
  },
  roleLabel: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 12,
    color: C.muted,
  },

  // ── Two-column body ───────────────────────────────────────────────────
  bodyRow: {
    flexDirection: "row",
    flex: 1,
  },

  // ── Sidebar (29%) ─────────────────────────────────────────────────────
  sidebar: {
    width: "29%",
    backgroundColor: C.sidebar,
    borderRightWidth: 1,
    borderRightColor: C.border,
    paddingTop: 20,
    paddingBottom: PV,
    paddingLeft: 16,
    paddingRight: 14,
  },
  sideSection: { marginBottom: 16 },
  sideTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: C.mid,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    paddingBottom: 4,
    marginBottom: 8,
  },

  // Contact rows
  contactRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 6,
    marginBottom: 6,
  },
  contactIcon: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: C.accent,
    width: 12,
  },
  contactText: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: C.muted,
    flex: 1,
    lineHeight: 1.55,
  },

  // Skill chips
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  chip: {
    backgroundColor: C.chipBg,
    paddingTop: 3,    paddingBottom: 3,
    paddingLeft: 7,   paddingRight: 7,
    borderRadius: 4,
  },
  chipLabel: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: C.chipText,
  },
  softChip: {
    backgroundColor: C.softBg,
    paddingTop: 3,    paddingBottom: 3,
    paddingLeft: 7,   paddingRight: 7,
    borderRadius: 4,
  },
  softChipLabel: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: C.softText,
  },

  // Sidebar vertical list (skills + languages share this style)
  sideItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    marginBottom: 9,
  },
  sideDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.mid,
  },
  sideItemText: {
    fontFamily: "Helvetica",
    fontSize: 12,
    color: C.muted,
    flex: 1,
    lineHeight: 1.5,
  },

  // ── Main panel (71%) ──────────────────────────────────────────────────
  main: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: PV,
    paddingLeft: 22,
    paddingRight: PH,
  },
  section: { marginBottom: 13 },
  sectionHead: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9.5,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: C.mid,
  },
  sectionRule: {
    flex: 1,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    marginTop: 1,
  },

  // Summary
  summaryText: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: C.muted,
    lineHeight: 1.7,
  },

  // Experience
  expBlock: { marginBottom: 11 },
  expTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  expCompany: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12.5,
    color: C.body,
  },
  expBadge: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: C.subtle,
    backgroundColor: C.chipBg,
    paddingTop: 2,    paddingBottom: 2,
    paddingLeft: 8,   paddingRight: 8,
    borderRadius: 3,
  },
  expRole: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 11,
    color: C.mid,
    marginBottom: 5,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3,
    paddingLeft: 2,
  },
  bulletMark: {
    fontFamily: "Helvetica",
    fontSize: 12,
    color: C.mid,
    width: 11,
    lineHeight: 1.4,
  },
  bulletText: {
    flex: 1,
    fontFamily: "Helvetica",
    fontSize: 11,
    color: C.muted,
    lineHeight: 1.65,
  },

  // Education
  eduBlock: { marginBottom: 9 },
  eduTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  eduDegree: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: C.body,
  },
  eduYear: {
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: C.subtle,
  },
  eduSchool: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 11,
    color: C.muted,
  },

  // ── Cover Letter page ─────────────────────────────────────────────────
  clSidebar: {
    width: "29%",
    backgroundColor: C.sidebar,
    borderRightWidth: 1,
    borderRightColor: C.border,
    paddingTop: 20,
    paddingBottom: PV,
    paddingLeft: 16,
    paddingRight: 14,
  },
  clMain: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: PV,
    paddingLeft: 22,
    paddingRight: PH,
  },
  clMetaBlock: { marginBottom: 15 },
  clMetaLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8.5,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: C.mid,
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    paddingBottom: 3,
    marginBottom: 5,
  },
  clMetaValue: {
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: C.muted,
    lineHeight: 1.55,
  },
  clDivider: {
    borderBottomWidth: 0.5,
    borderBottomColor: C.border,
    marginBottom: 15,
  },
  clDate: {
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: C.subtle,
    marginBottom: 16,
  },
  clRecipient: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12,
    color: C.body,
    marginBottom: 2,
  },
  clCompany: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: C.muted,
    marginBottom: 15,
  },
  clSubjectBox: {
    backgroundColor: C.chipBg,
    borderLeftWidth: 2,
    borderLeftColor: C.accent,
    paddingTop: 8,    paddingBottom: 8,
    paddingLeft: 12,  paddingRight: 12,
    borderRadius: 3,
    marginBottom: 16,
  },
  clSubjectText: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: C.accent,
  },
  clGreeting: {
    fontFamily: "Helvetica",
    fontSize: 12,
    color: C.body,
    marginBottom: 12,
  },
  clBodyPara: {
    fontFamily: "Helvetica",
    fontSize: 11.5,
    color: C.muted,
    lineHeight: 1.78,
    marginBottom: 11,
  },
  clSignoffWrap: {
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 0.5,
    borderTopColor: C.border,
  },
  clSignoff: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: C.muted,
    marginBottom: 22,
  },
  clSignName: {
    fontFamily: "Helvetica-Bold",
    fontSize: 13,
    color: C.body,
    marginBottom: 4,
  },
  clSignDetail: {
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: C.subtle,
  },
});

// ─── Internal Section Header ────────────────────────────────────────────────────
function SH({ title }: { title: string }) {
  return (
    <View style={S.sectionHead}>
      <Text style={S.sectionTitle}>{title}</Text>
      <View style={S.sectionRule} />
    </View>
  );
}

// ─── Props ──────────────────────────────────────────────────────────────────────
interface Props {
  profile: UserProfile;
  tailored: TailoredData;
  jobTitle: string;
  companyName: string;
}

// ─── PDF Document ───────────────────────────────────────────────────────────────
export function ModernMinimalistCV({ profile, tailored, jobTitle, companyName }: Props) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects: any[] = tailored.projects?.length ? tailored.projects : (profile.projects ?? []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const certifications: any[] = tailored.certifications?.length ? tailored.certifications : (profile.certifications ?? []);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const contacts = [
    { icon: "✉", value: profile.contact_email },
    { icon: "✆", value: profile.phone_number },
    { icon: "⊙", value: profile.location },
    { icon: "in", value: profile.linkedin_url },
  ].filter((c) => c.value);

  return (
    <Document title={`${profile.full_name} — ${jobTitle}`}>

      {/* ════════════════════════════════════════════════════════════
          CV PAGE
      ════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>
        <View style={S.strip} />

        {/* Header */}
        <View style={S.header}>
          <Text style={S.name}>{profile.full_name}</Text>
          {!!jobTitle && <Text style={S.roleLabel}>{jobTitle}</Text>}
        </View>

        {/* Body */}
        <View style={S.bodyRow}>

          {/* ── Sidebar ── */}
          <View style={S.sidebar}>

            <View style={S.sideSection}>
              <Text style={S.sideTitle}>Contact</Text>
              {contacts.map((c, i) => (
                <View key={i} style={S.contactRow}>
                  <Text style={S.contactIcon}>{c.icon}</Text>
                  <Text style={S.contactText}>{c.value}</Text>
                </View>
              ))}
            </View>

            {tailored.tech_skills?.length > 0 && (
              <View style={S.sideSection}>
                <Text style={S.sideTitle}>Technical Skills</Text>
                {tailored.tech_skills.map((s, i) => (
                  <View key={i} style={S.sideItem}>
                    <View style={S.sideDot} />
                    <Text style={S.sideItemText}>{s}</Text>
                  </View>
                ))}
              </View>
            )}

            {tailored.soft_skills?.length > 0 && (
              <View style={S.sideSection}>
                <Text style={S.sideTitle}>Core Competencies</Text>
                {tailored.soft_skills.map((s, i) => (
                  <View key={i} style={S.sideItem}>
                    <View style={{ ...S.sideDot, backgroundColor: C.softText }} />
                    <Text style={{ ...S.sideItemText, color: C.softText }}>{s}</Text>
                  </View>
                ))}
              </View>
            )}

            {tailored.languages?.length > 0 && (
              <View style={S.sideSection}>
                <Text style={S.sideTitle}>Languages</Text>
                {tailored.languages.map((l, i) => (
                  <View key={i} style={S.sideItem}>
                    <View style={S.sideDot} />
                    <Text style={S.sideItemText}>{l}</Text>
                  </View>
                ))}
              </View>
            )}

            {certifications.length > 0 && (
              <View style={S.sideSection}>
                <Text style={S.sideTitle}>Certifications</Text>
                {certifications.map((c, i) => (
                  <View key={i} style={{ marginBottom: 8 }}>
                    <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9, color: C.body }}>{c.name || ""}</Text>
                    <Text style={{ fontFamily: "Helvetica", fontSize: 8, color: C.subtle }}>
                      {[c.issuer || c.organization, c.issue_date || c.year || c.date].filter(Boolean).join("  ·  ")}
                    </Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* ── Main ── */}
          <View style={S.main}>

            {tailored.summary && (
              <View style={S.section}>
                <SH title="Professional Summary" />
                <Text style={S.summaryText}>{tailored.summary}</Text>
              </View>
            )}

            {tailored.experience?.length > 0 && (
              <View style={S.section}>
                <SH title="Work Experience" />
                {tailored.experience.map((exp, i) => (
                  <View key={i} style={S.expBlock}>
                    <View style={S.expTopRow}>
                      <Text style={S.expCompany}>{exp.company}</Text>
                      <Text style={S.expBadge}>{exp.duration}</Text>
                    </View>
                    <Text style={S.expRole}>{exp.role}</Text>
                    {exp.responsibilities?.map((r, j) => (
                      <View key={j} style={S.bulletRow}>
                        <Text style={S.bulletMark}>·</Text>
                        <Text style={S.bulletText}>{r}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {projects.length > 0 && (
              <View style={S.section}>
                <SH title="Projects" />
                {projects.map((p, i) => (
                  <View key={i} style={S.expBlock}>
                    <View style={S.expTopRow}>
                      <Text style={S.expCompany}>{p.name || p.title || ""}</Text>
                      <Text style={S.expBadge}>{p.dates || p.duration || ""}</Text>
                    </View>
                    {!!(p.role_title) && <Text style={S.expRole}>{p.role_title}</Text>}
                    {!!(p.link || p.url) && (
                      <Text style={{ fontFamily: "Helvetica", fontSize: 8, color: C.subtle, marginBottom: 4 }}>
                        {p.link || p.url}
                      </Text>
                    )}
                    {!!(p.description) && (
                      <View style={S.bulletRow}>
                        <Text style={S.bulletMark}>·</Text>
                        <Text style={S.bulletText}>{p.description}</Text>
                      </View>
                    )}
                    {(p.highlights || []).map((h: string, j: number) => (
                      <View key={j} style={S.bulletRow}>
                        <Text style={S.bulletMark}>·</Text>
                        <Text style={S.bulletText}>{h}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {tailored.education?.length > 0 && (
              <View style={S.section}>
                <SH title="Education" />
                {tailored.education.map((edu, i) => (
                  <View key={i} style={S.eduBlock}>
                    <View style={S.eduTopRow}>
                      <Text style={S.eduDegree}>{edu.degree}</Text>
                      <Text style={S.eduYear}>{edu.graduation_year}</Text>
                    </View>
                    <Text style={S.eduSchool}>{edu.university}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>

      {/* ════════════════════════════════════════════════════════════
          COVER LETTER PAGE
      ════════════════════════════════════════════════════════════ */}
      {tailored.cover_letter && (
        <Page size="A4" style={S.page}>
          <View style={S.strip} />

          {/* Header — same typographic treatment as CV */}
          <View style={S.header}>
            <Text style={S.name}>{profile.full_name}</Text>
            <Text style={S.roleLabel}>Cover Letter</Text>
          </View>

          <View style={S.bodyRow}>

            {/* ── CL Sidebar ── */}
            <View style={S.clSidebar}>
              <View style={S.clMetaBlock}>
                <Text style={S.clMetaLabel}>Applying For</Text>
                <Text style={S.clMetaValue}>{jobTitle}</Text>
              </View>
              <View style={S.clMetaBlock}>
                <Text style={S.clMetaLabel}>Company</Text>
                <Text style={S.clMetaValue}>{companyName}</Text>
              </View>
              <View style={S.clMetaBlock}>
                <Text style={S.clMetaLabel}>Date</Text>
                <Text style={S.clMetaValue}>{today}</Text>
              </View>
              <View style={S.clDivider} />
              <View style={S.clMetaBlock}>
                <Text style={S.clMetaLabel}>Contact</Text>
                {contacts.map((c, i) => (
                  <Text key={i} style={[S.clMetaValue, { marginBottom: 3 }]}>
                    {c.icon}  {c.value}
                  </Text>
                ))}
              </View>
              {tailored.tech_skills?.length > 0 && (
                <View style={S.clMetaBlock}>
                  <Text style={S.clMetaLabel}>Key Skills</Text>
                  {tailored.tech_skills.slice(0, 5).map((s, i) => (
                    <View key={i} style={S.sideItem}>
                      <View style={S.sideDot} />
                      <Text style={S.sideItemText}>{s}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* ── CL Main ── */}
            <View style={S.clMain}>
              <Text style={S.clDate}>{today}</Text>
              <Text style={S.clRecipient}>Hiring Manager</Text>
              <Text style={S.clCompany}>{companyName}</Text>
              <View style={S.clSubjectBox}>
                <Text style={S.clSubjectText}>Re: Application for {jobTitle}</Text>
              </View>
              <Text style={S.clGreeting}>Dear Hiring Manager,</Text>
              {tailored.cover_letter.split("\n\n").map((para, i) => (
                <Text key={i} style={S.clBodyPara}>{para.trim()}</Text>
              ))}
              <View style={S.clSignoffWrap}>
                <Text style={S.clSignoff}>Sincerely,</Text>
                <Text style={S.clSignName}>{profile.full_name}</Text>
                {profile.contact_email && <Text style={S.clSignDetail}>{profile.contact_email}</Text>}
                {profile.phone_number && <Text style={S.clSignDetail}>{profile.phone_number}</Text>}
              </View>
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
}

// ─── Browser CV Preview ─────────────────────────────────────────────────────────
export function ModernMinimalistPreview({
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

  const FONT     = '"Inter", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';
  const ACCENT   = "#334155";
  const MID      = "#475569";
  const BODY     = "#1e293b";
  const MUTED    = "#64748b";
  const SUBTLE   = "#94a3b8";
  const SIDEBAR  = "#f8fafc";
  const BORDER   = "#e2e8f0";
  const CHIP_BG  = "#f1f5f9";
  const CHIP_TXT = "#334155";
  const SOFT_BG  = "#f0fdf4";
  const SOFT_TXT = "#15803d";

  const contacts = [
    { icon: "✉", value: profile.contact_email },
    { icon: "✆", value: profile.phone_number },
    { icon: "⊙", value: profile.location },
    { icon: "in", value: profile.linkedin_url },
  ].filter((c) => c.value);

  return (
    <div style={{
      background: "white", width: "210mm", minHeight: "297mm", margin: "0 auto",
      fontFamily: FONT, fontSize: "11.5px", lineHeight: 1.55, color: BODY,
      border: `1px solid ${BORDER}`, borderRadius: "8px", overflow: "hidden",
      boxSizing: "border-box",
    }}>
      {/* Accent strip */}
      <div style={{ height: "3px", background: ACCENT }} />

      {/* Header */}
      <div style={{ padding: "20px 40px 14px", borderBottom: `1px solid ${BORDER}` }}>
        <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: "24px", color: BODY, letterSpacing: "0.2px", marginBottom: "3px" }}>
          {profile.full_name}
        </p>
        {jobTitle && (
          <p style={{ fontFamily: FONT, fontStyle: "italic", fontSize: "12px", color: MUTED }}>
            {jobTitle}
          </p>
        )}
      </div>

      {/* Body */}
      <div style={{ display: "flex", minHeight: "250mm" }}>

        {/* Sidebar */}
        <div style={{ width: "29%", background: SIDEBAR, borderRight: `1px solid ${BORDER}`, padding: "20px 14px 40px 16px", flexShrink: 0 }}>

          {/* Contact */}
          <div style={{ marginBottom: "18px" }}>
            <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: "8.5px", textTransform: "uppercase", letterSpacing: "1.5px", color: MID, borderBottom: `0.5px solid ${BORDER}`, paddingBottom: "4px", marginBottom: "8px" }}>
              Contact
            </p>
            {contacts.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "6px" }}>
                <span style={{ fontSize: "9.5px", color: ACCENT, width: "12px", flexShrink: 0 }}>{c.icon}</span>
                <span style={{ fontFamily: FONT, fontSize: "10px", color: MUTED, wordBreak: "break-all", lineHeight: "1.55" }}>{c.value}</span>
              </div>
            ))}
          </div>

          {/* Technical Skills — vertical dot list */}
          {tailored.tech_skills?.length > 0 && (
            <div style={{ marginBottom: "18px" }}>
              <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: "8.5px", textTransform: "uppercase", letterSpacing: "1.5px", color: MID, borderBottom: `0.5px solid ${BORDER}`, paddingBottom: "4px", marginBottom: "8px" }}>
                Technical Skills
              </p>
              {tailored.tech_skills.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "9px" }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
                  <span style={{ fontFamily: FONT, fontSize: "12px", color: MUTED }}>{s}</span>
                </div>
              ))}
            </div>
          )}

          {/* Core Competencies — vertical dot list */}
          {tailored.soft_skills?.length > 0 && (
            <div style={{ marginBottom: "18px" }}>
              <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: "8.5px", textTransform: "uppercase", letterSpacing: "1.5px", color: MID, borderBottom: `0.5px solid ${BORDER}`, paddingBottom: "4px", marginBottom: "8px" }}>
                Core Competencies
              </p>
              {tailored.soft_skills.map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "9px" }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: SOFT_TXT, flexShrink: 0 }} />
                  <span style={{ fontFamily: FONT, fontSize: "12px", color: SOFT_TXT }}>{s}</span>
                </div>
              ))}
            </div>
          )}

          {/* Languages */}
          {tailored.languages?.length > 0 && (
            <div style={{ marginBottom: "18px" }}>
              <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: "8.5px", textTransform: "uppercase", letterSpacing: "1.5px", color: MID, borderBottom: `0.5px solid ${BORDER}`, paddingBottom: "4px", marginBottom: "8px" }}>
                Languages
              </p>
              {tailored.languages.map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "9px" }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: MID, flexShrink: 0 }} />
                  <span style={{ fontFamily: FONT, fontSize: "12px", color: MUTED }}>{l}</span>
                </div>
              ))}
            </div>
          )}

          {/* Certifications */}
          {certifications.length > 0 && (
            <div>
              <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: "8.5px", textTransform: "uppercase", letterSpacing: "1.5px", color: MID, borderBottom: `0.5px solid ${BORDER}`, paddingBottom: "4px", marginBottom: "8px" }}>
                Certifications
              </p>
              {certifications.map((c, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: "11px", color: BODY }}>{c.name || ""}</p>
                  <p style={{ fontFamily: FONT, fontSize: "9.5px", color: SUBTLE }}>
                    {[c.issuer || c.organization, c.issue_date || c.year || c.date].filter(Boolean).join("  ·  ")}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "20px 40px 40px 22px" }}>

          {/* Summary */}
          {tailored.summary && (
            <div style={{ marginBottom: "13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "2px", color: MID, whiteSpace: "nowrap" }}>
                  Professional Summary
                </span>
                <div style={{ flex: 1, borderBottom: `0.5px solid ${BORDER}` }} />
              </div>
              <p style={{ fontFamily: FONT, fontSize: "11px", color: MUTED, lineHeight: 1.7 }}>
                {tailored.summary}
              </p>
            </div>
          )}

          {/* Experience */}
          {tailored.experience?.length > 0 && (
            <div style={{ marginBottom: "13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "2px", color: MID, whiteSpace: "nowrap" }}>
                  Work Experience
                </span>
                <div style={{ flex: 1, borderBottom: `0.5px solid ${BORDER}` }} />
              </div>
              {tailored.experience.map((exp, i) => (
                <div key={i} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
                    <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: "12.5px", color: BODY }}>{exp.company}</span>
                    <span style={{ fontFamily: FONT, fontSize: "9.5px", color: SUBTLE, background: CHIP_BG, padding: "2px 8px", borderRadius: "3px", flexShrink: 0, marginLeft: "8px" }}>
                      {exp.duration}
                    </span>
                  </div>
                  <p style={{ fontFamily: FONT, fontStyle: "italic", fontSize: "11px", color: MID, marginBottom: "5px" }}>
                    {exp.role}
                  </p>
                  {exp.responsibilities?.map((r, j) => (
                    <div key={j} style={{ display: "flex", marginBottom: "3px" }}>
                      <span style={{ color: MID, marginRight: "6px", fontSize: "14px", lineHeight: "1.35", flexShrink: 0 }}>·</span>
                      <span style={{ fontFamily: FONT, fontSize: "11px", color: MUTED, lineHeight: 1.65 }}>{r}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Projects */}
          {projects.length > 0 && (
            <div style={{ marginBottom: "13px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "2px", color: MID, whiteSpace: "nowrap" }}>
                  Projects
                </span>
                <div style={{ flex: 1, borderBottom: `0.5px solid ${BORDER}` }} />
              </div>
              {projects.map((p, i) => (
                <div key={i} style={{ marginBottom: "12px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
                    <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: "12.5px", color: BODY }}>{p.name || p.title || ""}</span>
                    <span style={{ fontFamily: FONT, fontSize: "9.5px", color: SUBTLE, background: CHIP_BG, padding: "2px 8px", borderRadius: "3px", flexShrink: 0, marginLeft: "8px" }}>
                      {p.dates || p.duration || ""}
                    </span>
                  </div>
                  {!!(p.role_title) && <p style={{ fontFamily: FONT, fontStyle: "italic", fontSize: "11px", color: MID, marginBottom: "4px" }}>{p.role_title}</p>}
                  {!!(p.link || p.url) && <p style={{ fontFamily: FONT, fontSize: "9.5px", color: SUBTLE, marginBottom: "4px" }}>{p.link || p.url}</p>}
                  {!!(p.description) && (
                    <div style={{ display: "flex", marginBottom: "3px" }}>
                      <span style={{ color: MID, marginRight: "6px", fontSize: "14px", lineHeight: "1.35", flexShrink: 0 }}>·</span>
                      <span style={{ fontFamily: FONT, fontSize: "11px", color: MUTED, lineHeight: 1.65 }}>{p.description}</span>
                    </div>
                  )}
                  {(p.highlights || []).map((h: string, j: number) => (
                    <div key={j} style={{ display: "flex", marginBottom: "3px" }}>
                      <span style={{ color: MID, marginRight: "6px", fontSize: "14px", lineHeight: "1.35", flexShrink: 0 }}>·</span>
                      <span style={{ fontFamily: FONT, fontSize: "11px", color: MUTED, lineHeight: 1.65 }}>{h}</span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}

          {/* Education */}
          {tailored.education?.length > 0 && (
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: "9.5px", textTransform: "uppercase", letterSpacing: "2px", color: MID, whiteSpace: "nowrap" }}>
                  Education
                </span>
                <div style={{ flex: 1, borderBottom: `0.5px solid ${BORDER}` }} />
              </div>
              {tailored.education.map((edu, i) => (
                <div key={i} style={{ marginBottom: "10px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1px" }}>
                    <span style={{ fontFamily: FONT, fontWeight: 700, fontSize: "12px", color: BODY }}>{edu.degree}</span>
                    <span style={{ fontFamily: FONT, fontSize: "10.5px", color: SUBTLE }}>{edu.graduation_year}</span>
                  </div>
                  <p style={{ fontFamily: FONT, fontStyle: "italic", fontSize: "11px", color: MUTED }}>{edu.university}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Browser Cover Letter Preview ───────────────────────────────────────────────
// Same palette, header strip, and typographic rhythm as ModernMinimalistPreview
// so the CV and cover letter form a unified application package.
export function ModernMinimalistCoverLetterPreview({
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
  const FONT     = '"Inter", system-ui, -apple-system, "Helvetica Neue", Arial, sans-serif';
  const ACCENT   = "#334155";
  const MID      = "#475569";
  const BODY     = "#1e293b";
  const MUTED    = "#64748b";
  const SUBTLE   = "#94a3b8";
  const SIDEBAR  = "#f8fafc";
  const BORDER   = "#e2e8f0";
  const CHIP_BG  = "#f1f5f9";
  const CHIP_TXT = "#334155";

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const contacts = [
    { icon: "✉", value: profile.contact_email },
    { icon: "✆", value: profile.phone_number },
    { icon: "⊙", value: profile.location },
    { icon: "in", value: profile.linkedin_url },
  ].filter((c) => c.value);

  const sideLabelStyle: React.CSSProperties = {
    fontFamily: FONT,
    fontWeight: 700,
    fontSize: "7px",
    textTransform: "uppercase",
    letterSpacing: "1.5px",
    color: MID,
    borderBottom: `0.5px solid ${BORDER}`,
    paddingBottom: "3px",
    marginBottom: "5px",
  };

  return (
    <div style={{
      background: "white", width: "210mm", minHeight: "297mm", margin: "0 auto",
      fontFamily: FONT, fontSize: "11px", lineHeight: 1.5, color: BODY,
      border: `1px solid ${BORDER}`, borderRadius: "8px", overflow: "hidden",
      boxSizing: "border-box",
    }}>
      {/* Accent strip — identical to CV */}
      <div style={{ height: "3px", background: ACCENT }} />

      {/* Header — mirrors CV header */}
      <div style={{ padding: "20px 40px 14px", borderBottom: `1px solid ${BORDER}` }}>
        <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: "22px", color: BODY, letterSpacing: "0.2px", marginBottom: "3px" }}>
          {profile.full_name}
        </p>
        <p style={{ fontFamily: FONT, fontStyle: "italic", fontSize: "11px", color: MUTED }}>
          Cover Letter
        </p>
      </div>

      {/* Body */}
      <div style={{ display: "flex", minHeight: "250mm" }}>

        {/* Sidebar */}
        <div style={{ width: "29%", background: SIDEBAR, borderRight: `1px solid ${BORDER}`, padding: "20px 14px 40px 16px", flexShrink: 0 }}>
          {[
            { label: "Applying For", value: jobTitle },
            { label: "Company",      value: companyName },
            { label: "Date",         value: today },
          ].map((m, i) => (
            <div key={i} style={{ marginBottom: "16px" }}>
              <p style={sideLabelStyle}>{m.label}</p>
              <p style={{ fontFamily: FONT, fontSize: "9px", color: MUTED }}>{m.value}</p>
            </div>
          ))}

          <div style={{ borderBottom: `0.5px solid ${BORDER}`, marginBottom: "16px" }} />

          <div style={{ marginBottom: "16px" }}>
            <p style={sideLabelStyle}>Contact</p>
            {contacts.map((c, i) => (
              <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "5px" }}>
                <span style={{ fontSize: "8.5px", color: ACCENT, width: "12px", flexShrink: 0 }}>{c.icon}</span>
                <span style={{ fontFamily: FONT, fontSize: "8.5px", color: MUTED, wordBreak: "break-all" }}>{c.value}</span>
              </div>
            ))}
          </div>

          {tailored.tech_skills?.length > 0 && (
            <div>
              <p style={sideLabelStyle}>Key Skills</p>
              {tailored.tech_skills.slice(0, 5).map((s, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
                  <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: ACCENT, flexShrink: 0 }} />
                  <span style={{ fontFamily: FONT, fontSize: "10.5px", color: MUTED }}>{s}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main */}
        <div style={{ flex: 1, padding: "20px 40px 40px 22px" }}>
          <p style={{ fontFamily: FONT, fontSize: "9px", color: SUBTLE, marginBottom: "18px" }}>{today}</p>

          <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: "10.5px", color: BODY, marginBottom: "2px" }}>
            Hiring Manager
          </p>
          <p style={{ fontFamily: FONT, fontSize: "10px", color: MUTED, marginBottom: "16px" }}>{companyName}</p>

          <div style={{ background: CHIP_BG, borderLeft: `2px solid ${ACCENT}`, padding: "8px 14px", borderRadius: "3px", marginBottom: "18px" }}>
            <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: "9.5px", color: ACCENT, margin: 0 }}>
              Re: Application for {jobTitle}
            </p>
          </div>

          <p style={{ fontFamily: FONT, fontSize: "10.5px", color: BODY, marginBottom: "12px" }}>
            Dear Hiring Manager,
          </p>

          {tailored.cover_letter?.split("\n\n").map((para, i) => (
            <p key={i} style={{ fontFamily: FONT, fontSize: "10px", color: MUTED, lineHeight: 1.75, marginBottom: "11px" }}>
              {para.trim()}
            </p>
          ))}

          <div style={{ marginTop: "20px", paddingTop: "14px", borderTop: `0.5px solid ${BORDER}` }}>
            <p style={{ fontFamily: FONT, fontSize: "10px", color: MUTED, marginBottom: "24px" }}>Sincerely,</p>
            <p style={{ fontFamily: FONT, fontWeight: 700, fontSize: "12px", color: BODY, marginBottom: "4px" }}>
              {profile.full_name}
            </p>
            {profile.contact_email && (
              <p style={{ fontFamily: FONT, fontSize: "9px", color: SUBTLE }}>{profile.contact_email}</p>
            )}
            {profile.phone_number && (
              <p style={{ fontFamily: FONT, fontSize: "9px", color: SUBTLE }}>{profile.phone_number}</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
