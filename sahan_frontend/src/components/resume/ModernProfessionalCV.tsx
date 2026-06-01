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
  primary:    "#1a56db",
  primaryDark:"#1239a5",
  sidebar:    "#f0f4ff",
  white:      "#ffffff",
  text:       "#1e2939",
  muted:      "#5c6b80",
  light:      "#8898aa",
  border:     "#dde3ed",
  chip:       "#e4eaf8",
  chipText:   "#2d4db5",   
};

const INCH = 72;
const PAGE_MARGIN_H = INCH * 0.55;
const PAGE_MARGIN_V = INCH * 0.6;
const SIDEBAR_W = "31%";

const S = StyleSheet.create({
  // Page
  page: {
    flexDirection: "row",
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: C.text,
    backgroundColor: C.white,
  },

  // ── Sidebar ──────────────────────────────────────────────────
  sidebar: {
    width: SIDEBAR_W,
    backgroundColor: C.sidebar,
    paddingTop: PAGE_MARGIN_V,
    paddingBottom: PAGE_MARGIN_V,
    paddingLeft: 18,
    paddingRight: 18,
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  sidebarSection: { marginBottom: 18 },
  sidebarTitle: {
    fontFamily: "Times-Bold",
    fontSize: 7.5,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    color: C.primary,
    marginBottom: 7,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: C.primary,
  },

  // Contact
  contactRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 5, gap: 6 },
  contactIcon: { fontSize: 9, color: C.primary, width: 12, fontFamily: "Times-Roman" },
  contactText: { fontSize: 9, color: C.muted, flex: 1, fontFamily: "Times-Roman", lineHeight: 1.4 },

  // Skills chips
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  chip: {
    backgroundColor: C.chip,
    paddingTop: 3,
    paddingBottom: 3,
    paddingLeft: 7,
    paddingRight: 7,
    borderRadius: 12,
  },
  chipText: { fontSize: 8.5, color: C.chipText, fontFamily: "Times-Bold" },

  // Sidebar plain list
  sidebarItem: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 7 },
  sidebarDot: {
    width: 5, height: 5, borderRadius: 3,
    backgroundColor: C.primary,
  },
  sidebarItemText: { fontSize: 10.5, color: C.muted, fontFamily: "Times-Roman", flex: 1, lineHeight: 1.4 },

  // ── Main ─────────────────────────────────────────────────────
  main: {
    flex: 1,
    paddingTop: PAGE_MARGIN_V * 0.75,
    paddingBottom: PAGE_MARGIN_V,
    paddingLeft: 24,
    paddingRight: PAGE_MARGIN_H,
  },

  // Header
  nameBlock: { marginBottom: 4 },
  name: {
    fontFamily: "Times-Bold",
    fontSize: 22,
    color: C.text,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  title: {
    fontFamily: "Times-Italic",
    fontSize: 12,
    color: C.primary,
    marginBottom: 10,
  },
  headerRule: {
    borderBottomWidth: 2,
    borderBottomColor: C.primary,
    marginBottom: 14,
  },

  // Section
  section: { marginBottom: 16 },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 9,
    gap: 8,
  },
  sectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    color: C.primary,
  },
  sectionLine: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    marginTop: 1,
  },

  // Summary
  summaryText: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: C.muted,
    lineHeight: 1.65,
  },

  // Experience
  expBlock: { marginBottom: 13 },
  expTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  expCompany: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    color: C.text,
  },
  expDate: {
    fontFamily: "Times-Roman",
    fontSize: 9,
    color: C.light,
    backgroundColor: C.chip,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 7,
    paddingRight: 7,
    borderRadius: 10,
  },
  expRole: {
    fontFamily: "Times-Italic",
    fontSize: 10,
    color: C.primary,
    marginBottom: 5,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 2,
  },
  bulletDot: {
    width: 10,
    fontSize: 12,
    color: C.primary,
    fontFamily: "Times-Roman",
    lineHeight: 1.3,
  },
  bulletText: {
    flex: 1,
    fontFamily: "Times-Roman",
    fontSize: 9.5,
    color: C.muted,
    lineHeight: 1.5,
  },

  // Education
  eduBlock: { marginBottom: 10 },
  eduTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  eduDegree: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
    color: C.text,
  },
  eduYear: {
    fontFamily: "Times-Roman",
    fontSize: 9,
    color: C.light,
  },
  eduSchool: {
    fontFamily: "Times-Italic",
    fontSize: 9.5,
    color: C.muted,
  },

  // Achievements
  achieveBlock: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 5,
    gap: 8,
    backgroundColor: "#f8faff",
    padding: 7,
    borderRadius: 5,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
  },
  achieveText: {
    fontFamily: "Times-Roman",
    fontSize: 9.5,
    color: C.muted,
    flex: 1,
    lineHeight: 1.5,
  },

  // ── Cover Letter ──────────────────────────────────────────────
  clPage: {
    flexDirection: "row",
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: C.text,
    backgroundColor: C.white,
  },
  clSidebar: {
    width: SIDEBAR_W,
    backgroundColor: C.sidebar,
    paddingTop: PAGE_MARGIN_V,
    paddingBottom: PAGE_MARGIN_V,
    paddingLeft: 18,
    paddingRight: 18,
    borderRightWidth: 1,
    borderRightColor: C.border,
  },
  clMain: {
    flex: 1,
    paddingTop: PAGE_MARGIN_V * 0.75,
    paddingBottom: PAGE_MARGIN_V,
    paddingLeft: 24,
    paddingRight: PAGE_MARGIN_H,
  },
  clDate: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: C.light,
    marginBottom: 20,
  },
  clRecipientLabel: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
    color: C.text,
    marginBottom: 2,
  },
  clRecipientCompany: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: C.muted,
    marginBottom: 18,
  },
  clSubjectBox: {
    backgroundColor: C.chip,
    borderLeftWidth: 3,
    borderLeftColor: C.primary,
    paddingTop: 8,
    paddingBottom: 8,
    paddingLeft: 12,
    paddingRight: 12,
    borderRadius: 4,
    marginBottom: 20,
  },
  clSubjectText: {
    fontFamily: "Times-Bold",
    fontSize: 10,
    color: C.primary,
  },
  clGreeting: {
    fontFamily: "Times-Roman",
    fontSize: 11,
    color: C.text,
    marginBottom: 14,
  },
  clBodyPara: {
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    color: C.muted,
    lineHeight: 1.75,
    marginBottom: 12,
  },
  clSignoffWrap: {
    marginTop: 24,
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: C.border,
  },
  clSignoff: {
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    color: C.muted,
    marginBottom: 28,
  },
  clSignName: {
    fontFamily: "Times-Bold",
    fontSize: 13,
    color: C.text,
    marginBottom: 4,
  },
  clSignDetail: {
    fontFamily: "Times-Roman",
    fontSize: 9.5,
    color: C.light,
  },
  // Sidebar meta items for cover letter
  clSidebarMeta: {
    marginBottom: 20,
  },
  clSidebarMetaLabel: {
    fontFamily: "Times-Bold",
    fontSize: 7.5,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: C.primary,
    marginBottom: 4,
  },
  clSidebarMetaValue: {
    fontFamily: "Times-Roman",
    fontSize: 9.5,
    color: C.muted,
    lineHeight: 1.5,
  },
});

// ─── Helper: Section Header ─────────────────────────────────────────────────
function SectionHeader({ title }: { title: string }) {
  return (
    <View style={S.sectionHeader}>
      <Text style={S.sectionTitle}>{title}</Text>
      <View style={S.sectionLine} />
    </View>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────
interface ModernProfessionalCVProps {
  profile: UserProfile;
  tailored: TailoredData;
  jobTitle: string;
  companyName: string;
}

export function ModernProfessionalCV({
  profile,
  tailored,
  jobTitle,
  companyName,
}: ModernProfessionalCVProps) {
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const contactParts = [
    { icon: "✉", value: profile.contact_email },
    { icon: "✆", value: profile.phone_number },
    { icon: "⊙", value: profile.location },
    { icon: "in", value: profile.linkedin_url },
  ].filter((c) => c.value);

  return (
    <Document title={`${profile.full_name} — ${jobTitle}`}>
      {/* ══════════════════════════════════════════════════════════
          CV PAGE
      ══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>

        {/* ── LEFT SIDEBAR ── */}
        <View style={S.sidebar}>

          {/* Contact */}
          <View style={S.sidebarSection}>
            <Text style={S.sidebarTitle}>Contact</Text>
            {contactParts.map((c, i) => (
              <View key={i} style={S.contactRow}>
                <Text style={S.contactIcon}>{c.icon}</Text>
                <Text style={S.contactText}>{c.value}</Text>
              </View>
            ))}
          </View>

          {/* Technical Skills — vertical dot list */}
          {tailored.tech_skills?.length > 0 && (
            <View style={S.sidebarSection}>
              <Text style={S.sidebarTitle}>Technical Skills</Text>
              {tailored.tech_skills.map((s, i) => (
                <View key={i} style={S.sidebarItem}>
                  <View style={S.sidebarDot} />
                  <Text style={S.sidebarItemText}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Core Skills — vertical dot list */}
          {tailored.soft_skills?.length > 0 && (
            <View style={S.sidebarSection}>
              <Text style={S.sidebarTitle}>Core Skills</Text>
              {tailored.soft_skills.map((s, i) => (
                <View key={i} style={S.sidebarItem}>
                  <View style={{ ...S.sidebarDot, backgroundColor: "#2e7d32" }} />
                  <Text style={{ ...S.sidebarItemText, color: "#2e7d32" }}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          {/* Languages */}
          {tailored.languages?.length > 0 && (
            <View style={S.sidebarSection}>
              <Text style={S.sidebarTitle}>Languages</Text>
              {tailored.languages.map((l, i) => (
                <View key={i} style={S.sidebarItem}>
                  <View style={S.sidebarDot} />
                  <Text style={S.sidebarItemText}>{l}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── MAIN CONTENT ── */}
        <View style={S.main}>

          {/* Name + Title */}
          <View style={S.nameBlock}>
            <Text style={S.name}>{profile.full_name}</Text>
            <Text style={S.title}>{jobTitle || "Professional"}</Text>
          </View>
          <View style={S.headerRule} />

          {/* Summary */}
          {tailored.summary && (
            <View style={S.section}>
              <SectionHeader title="Professional Summary" />
              <Text style={S.summaryText}>{tailored.summary}</Text>
            </View>
          )}

          {/* Experience */}
          {tailored.experience?.length > 0 && (
            <View style={S.section}>
              <SectionHeader title="Work Experience" />
              {tailored.experience.map((exp, i) => (
                <View key={i} style={S.expBlock}>
                  <View style={S.expTopRow}>
                    <Text style={S.expCompany}>{exp.company}</Text>
                    <Text style={S.expDate}>{exp.duration}</Text>
                  </View>
                  <Text style={S.expRole}>{exp.role}</Text>
                  {exp.responsibilities?.map((r, j) => (
                    <View key={j} style={S.bulletRow}>
                      <Text style={S.bulletDot}>•</Text>
                      <Text style={S.bulletText}>{r}</Text>
                    </View>
                  ))}
                </View>
              ))}
            </View>
          )}

          {/* Education */}
          {tailored.education?.length > 0 && (
            <View style={S.section}>
              <SectionHeader title="Education" />
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
      </Page>

      {/* ══════════════════════════════════════════════════════════
          COVER LETTER PAGE
      ══════════════════════════════════════════════════════════ */}
      {tailored.cover_letter && (
        <Page size="A4" style={S.clPage}>

          {/* ── COVER LETTER SIDEBAR ── */}
          <View style={S.clSidebar}>
            {/* Meta info */}
            <View style={S.clSidebarMeta}>
              <Text style={S.clSidebarMetaLabel}>Applying For</Text>
              <Text style={S.clSidebarMetaValue}>{jobTitle}</Text>
            </View>
            <View style={S.clSidebarMeta}>
              <Text style={S.clSidebarMetaLabel}>Company</Text>
              <Text style={S.clSidebarMetaValue}>{companyName}</Text>
            </View>
            <View style={S.clSidebarMeta}>
              <Text style={S.clSidebarMetaLabel}>Date</Text>
              <Text style={S.clSidebarMetaValue}>{today}</Text>
            </View>
            {/* Divider */}
            <View style={{ borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 20 }} />
            {/* Contact */}
            <View style={S.clSidebarMeta}>
              <Text style={S.clSidebarMetaLabel}>Contact</Text>
              {contactParts.map((c, i) => (
                <Text key={i} style={[S.clSidebarMetaValue, { marginBottom: 3 }]}>{c.icon}  {c.value}</Text>
              ))}
            </View>
            {/* Skills summary — vertical dot list */}
            {tailored.tech_skills?.length > 0 && (
              <View style={S.clSidebarMeta}>
                <Text style={S.clSidebarMetaLabel}>Key Skills</Text>
                {tailored.tech_skills.slice(0, 6).map((s, i) => (
                  <View key={i} style={S.sidebarItem}>
                    <View style={S.sidebarDot} />
                    <Text style={S.sidebarItemText}>{s}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* ── COVER LETTER MAIN ── */}
          <View style={S.clMain}>
            {/* Name header — matches CV */}
            <View style={S.nameBlock}>
              <Text style={S.name}>{profile.full_name}</Text>
              <Text style={S.title}>Cover Letter</Text>
            </View>
            <View style={S.headerRule} />

            {/* Date */}
            <Text style={S.clDate}>{today}</Text>

            {/* Recipient */}
            <Text style={S.clRecipientLabel}>Hiring Manager</Text>
            <Text style={S.clRecipientCompany}>{companyName}</Text>

            {/* Subject */}
            <View style={S.clSubjectBox}>
              <Text style={S.clSubjectText}>Re: Application for {jobTitle}</Text>
            </View>

            {/* Greeting */}
            <Text style={S.clGreeting}>Dear Hiring Manager,</Text>

            {/* Body */}
            {tailored.cover_letter.split("\n\n").map((para, i) => (
              <Text key={i} style={S.clBodyPara}>{para.trim()}</Text>
            ))}

            {/* Sign off */}
            <View style={S.clSignoffWrap}>
              <Text style={S.clSignoff}>Sincerely,</Text>
              <Text style={S.clSignName}>{profile.full_name}</Text>
              {profile.contact_email && <Text style={S.clSignDetail}>{profile.contact_email}</Text>}
              {profile.phone_number && <Text style={S.clSignDetail}>{profile.phone_number}</Text>}
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
}

// ─── Browser Preview Components ────────────────────────────────────────────────
// These mirror the PDF layout using HTML/CSS for the in-browser preview

export function ModernProfessionalPreview({
  profile,
  tailored,
  jobTitle,
}: {
  profile: UserProfile;
  tailored: TailoredData;
  jobTitle: string;
}) {
  const BLUE = "#1a56db";
  const SIDEBAR_BG = "#f0f4ff";
  const MUTED = "#5c6b80";
  const LIGHT = "#8898aa";
  const CHIP_BG = "#e4eaf8";
  const CHIP_TEXT = "#2d4db5";
  const BORDER = "#dde3ed";

  const contacts = [
    { icon: "✉", value: profile.contact_email },
    { icon: "✆", value: profile.phone_number },
    { icon: "⊙", value: profile.location },
    { icon: "in", value: profile.linkedin_url },
  ].filter((c) => c.value);

  return (
    <div style={{ background: "white", width: "210mm", minHeight: "297mm", margin: "0 auto", display: "flex", fontFamily: "Arial, sans-serif", fontSize: "11px", lineHeight: "1.5", color: "#1e2939", border: "1px solid #e8e6e0", borderRadius: "8px", overflow: "hidden", boxSizing: "border-box" }}>

      {/* LEFT SIDEBAR */}
      <div style={{ width: "31%", background: SIDEBAR_BG, padding: "28px 18px", borderRight: `1px solid ${BORDER}`, flexShrink: 0 }}>

        {/* Contact */}
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontWeight: "700", fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.8px", color: BLUE, borderBottom: `1.5px solid ${BLUE}`, paddingBottom: "4px", marginBottom: "10px" }}>Contact</p>
          {contacts.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "6px", marginBottom: "6px" }}>
              <span style={{ fontSize: "10px", color: BLUE, width: "14px", flexShrink: 0 }}>{c.icon}</span>
              <span style={{ fontSize: "9.5px", color: MUTED, wordBreak: "break-all" }}>{c.value}</span>
            </div>
          ))}
        </div>

        {/* Tech Skills — vertical dot list */}
        {tailored.tech_skills?.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontWeight: "700", fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.8px", color: BLUE, borderBottom: `1.5px solid ${BLUE}`, paddingBottom: "4px", marginBottom: "10px" }}>Technical Skills</p>
            {tailored.tech_skills.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: BLUE, flexShrink: 0 }} />
                <span style={{ fontSize: "10.5px", color: MUTED }}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {/* Soft Skills — vertical dot list */}
        {tailored.soft_skills?.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontWeight: "700", fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.8px", color: BLUE, borderBottom: `1.5px solid ${BLUE}`, paddingBottom: "4px", marginBottom: "10px" }}>Core Skills</p>
            {tailored.soft_skills.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#2e7d32", flexShrink: 0 }} />
                <span style={{ fontSize: "10.5px", color: "#2e7d32" }}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {/* Languages */}
        {tailored.languages?.length > 0 && (
          <div>
            <p style={{ fontWeight: "700", fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.8px", color: BLUE, borderBottom: `1.5px solid ${BLUE}`, paddingBottom: "4px", marginBottom: "10px" }}>Languages</p>
            {tailored.languages.map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: BLUE, flexShrink: 0 }} />
                <span style={{ fontSize: "10.5px", color: MUTED }}>{l}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: "22px 28px 28px 22px" }}>
        {/* Name + Title */}
        <p style={{ fontSize: "22px", fontWeight: "700", color: "#1e2939", letterSpacing: "0.5px", marginBottom: "3px" }}>{profile.full_name}</p>
        <p style={{ fontSize: "12px", fontStyle: "italic", color: BLUE, marginBottom: "10px" }}>{jobTitle || "Professional"}</p>
        <hr style={{ border: "none", borderTop: `2px solid ${BLUE}`, marginBottom: "14px" }} />

        {/* Summary */}
        {tailored.summary && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontWeight: "700", fontSize: "9px", textTransform: "uppercase", letterSpacing: "1.8px", color: BLUE }}>Professional Summary</span>
              <div style={{ flex: 1, borderBottom: `1px solid ${BORDER}` }} />
            </div>
            <p style={{ fontSize: "10px", color: MUTED, lineHeight: "1.65" }}>{tailored.summary}</p>
          </div>
        )}

        {/* Experience */}
        {tailored.experience?.length > 0 && (
          <div style={{ marginBottom: "16px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontWeight: "700", fontSize: "9px", textTransform: "uppercase", letterSpacing: "1.8px", color: BLUE }}>Work Experience</span>
              <div style={{ flex: 1, borderBottom: `1px solid ${BORDER}` }} />
            </div>
            {tailored.experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
                  <span style={{ fontWeight: "700", fontSize: "11.5px", color: "#1e2939" }}>{exp.company}</span>
                  <span style={{ fontSize: "9px", color: LIGHT, background: CHIP_BG, padding: "2px 8px", borderRadius: "10px" }}>{exp.duration}</span>
                </div>
                <p style={{ fontStyle: "italic", fontSize: "10px", color: BLUE, marginBottom: "6px" }}>{exp.role}</p>
                {exp.responsibilities?.map((r, j) => (
                  <div key={j} style={{ display: "flex", marginBottom: "3px" }}>
                    <span style={{ color: BLUE, marginRight: "6px", fontSize: "14px", lineHeight: "1.2" }}>•</span>
                    <span style={{ fontSize: "9.5px", color: MUTED, lineHeight: "1.5" }}>{r}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* Education */}
        {tailored.education?.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontWeight: "700", fontSize: "9px", textTransform: "uppercase", letterSpacing: "1.8px", color: BLUE }}>Education</span>
              <div style={{ flex: 1, borderBottom: `1px solid ${BORDER}` }} />
            </div>
            {tailored.education.map((edu, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontWeight: "700", fontSize: "11px", color: "#1e2939" }}>{edu.degree}</span>
                  <span style={{ fontSize: "9px", color: LIGHT }}>{edu.graduation_year}</span>
                </div>
                <p style={{ fontStyle: "italic", fontSize: "10px", color: MUTED }}>{edu.university}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export function ModernProfessionalCoverLetterPreview({
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
  const BLUE = "#1a56db";
  const SIDEBAR_BG = "#f0f4ff";
  const MUTED = "#5c6b80";
  const LIGHT = "#8898aa";
  const CHIP_BG = "#e4eaf8";
  const CHIP_TEXT = "#2d4db5";
  const BORDER = "#dde3ed";

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const contacts = [
    { icon: "✉", value: profile.contact_email },
    { icon: "✆", value: profile.phone_number },
    { icon: "⊙", value: profile.location },
    { icon: "in", value: profile.linkedin_url },
  ].filter((c) => c.value);

  return (
    <div style={{ background: "white", width: "210mm", minHeight: "297mm", margin: "0 auto", display: "flex", fontFamily: "Arial, sans-serif", fontSize: "11px", lineHeight: "1.5", color: "#1e2939", border: "1px solid #e8e6e0", borderRadius: "8px", overflow: "hidden", boxSizing: "border-box" }}>

      {/* LEFT SIDEBAR */}
      <div style={{ width: "31%", background: SIDEBAR_BG, padding: "28px 18px", borderRight: `1px solid ${BORDER}`, flexShrink: 0 }}>
        {/* Meta */}
        {[{ label: "Applying For", value: jobTitle }, { label: "Company", value: companyName }, { label: "Date", value: today }].map((m, i) => (
          <div key={i} style={{ marginBottom: "18px" }}>
            <p style={{ fontWeight: "700", fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.5px", color: BLUE, marginBottom: "4px" }}>{m.label}</p>
            <p style={{ fontSize: "9.5px", color: MUTED }}>{m.value}</p>
          </div>
        ))}
        <hr style={{ border: "none", borderTop: `1px solid ${BORDER}`, marginBottom: "18px" }} />
        {/* Contact */}
        <div style={{ marginBottom: "18px" }}>
          <p style={{ fontWeight: "700", fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.5px", color: BLUE, marginBottom: "8px" }}>Contact</p>
          {contacts.map((c, i) => (
            <p key={i} style={{ fontSize: "9px", color: MUTED, marginBottom: "4px" }}>{c.icon}  {c.value}</p>
          ))}
        </div>
        {/* Key skills — vertical dot list */}
        {tailored.tech_skills?.length > 0 && (
          <div>
            <p style={{ fontWeight: "700", fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.5px", color: BLUE, marginBottom: "8px" }}>Key Skills</p>
            {tailored.tech_skills.slice(0, 6).map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "7px", marginBottom: "8px" }}>
                <div style={{ width: "5px", height: "5px", borderRadius: "50%", background: BLUE, flexShrink: 0 }} />
                <span style={{ fontSize: "10.5px", color: MUTED }}>{s}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAIN */}
      <div style={{ flex: 1, padding: "22px 28px 28px 22px" }}>
        <p style={{ fontSize: "22px", fontWeight: "700", color: "#1e2939", letterSpacing: "0.5px", marginBottom: "3px" }}>{profile.full_name}</p>
        <p style={{ fontSize: "12px", fontStyle: "italic", color: BLUE, marginBottom: "10px" }}>Cover Letter</p>
        <hr style={{ border: "none", borderTop: `2px solid ${BLUE}`, marginBottom: "20px" }} />

        <p style={{ fontSize: "10px", color: LIGHT, marginBottom: "20px" }}>{today}</p>

        <p style={{ fontWeight: "700", fontSize: "11px", color: "#1e2939", marginBottom: "2px" }}>Hiring Manager</p>
        <p style={{ fontSize: "10px", color: MUTED, marginBottom: "18px" }}>{companyName}</p>

        {/* Subject box */}
        <div style={{ background: CHIP_BG, borderLeft: `3px solid ${BLUE}`, padding: "9px 14px", borderRadius: "4px", marginBottom: "20px" }}>
          <p style={{ fontWeight: "700", fontSize: "10px", color: BLUE, margin: 0 }}>Re: Application for {jobTitle}</p>
        </div>

        <p style={{ fontSize: "11px", color: "#1e2939", marginBottom: "14px" }}>Dear Hiring Manager,</p>

        {tailored.cover_letter?.split("\n\n").map((para, i) => (
          <p key={i} style={{ fontSize: "10.5px", color: MUTED, lineHeight: "1.75", marginBottom: "12px" }}>{para.trim()}</p>
        ))}

        <div style={{ marginTop: "24px", paddingTop: "16px", borderTop: `1px solid ${BORDER}` }}>
          <p style={{ fontSize: "10.5px", color: MUTED, marginBottom: "28px" }}>Sincerely,</p>
          <p style={{ fontWeight: "700", fontSize: "14px", color: "#1e2939", marginBottom: "4px" }}>{profile.full_name}</p>
          {profile.contact_email && <p style={{ fontSize: "9.5px", color: LIGHT }}>{profile.contact_email}</p>}
          {profile.phone_number && <p style={{ fontSize: "9.5px", color: LIGHT }}>{profile.phone_number}</p>}
        </div>
      </div>
    </div>
  );
}