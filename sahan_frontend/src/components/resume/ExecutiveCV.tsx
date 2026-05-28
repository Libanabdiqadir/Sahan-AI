import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { UserProfile, TailoredData } from "../../types";

const INCH = 72;
const NAVY = "#1e2d4a";
const GOLD = "#b8972e";
const LIGHT_BG = "#f4f6f9";
const BODY_TEXT = "#2d3748";
const MUTED = "#718096";

const styles = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: BODY_TEXT,
    lineHeight: 1.4,
  },

  // ── Header Banner ──────────────────────────────────────────────
  header: {
    backgroundColor: NAVY,
    paddingTop: 24,
    paddingBottom: 18,
    paddingLeft: 32,
    paddingRight: 32,
  },
  headerName: {
    fontFamily: "Times-Bold",
    fontSize: 22,
    color: "white",
    textTransform: "uppercase",
    letterSpacing: 3,
    marginBottom: 5,
  },
  headerGoldBar: {
    width: 48,
    height: 2.5,
    backgroundColor: GOLD,
    marginBottom: 8,
  },
  headerContactRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  headerContactItem: {
    fontSize: 9,
    color: "#cbd5e0",
    fontFamily: "Times-Roman",
  },

  // ── Two-column body ────────────────────────────────────────────
  body: {
    flexDirection: "row",
    flex: 1,
  },

  // ── Left sidebar ───────────────────────────────────────────────
  sidebar: {
    width: "33%",
    backgroundColor: LIGHT_BG,
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 16,
    paddingRight: 14,
    borderRightWidth: 2.5,
    borderRightColor: NAVY,
  },
  sidebarSectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 8.5,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: NAVY,
    borderBottomWidth: 1.5,
    borderBottomColor: GOLD,
    paddingBottom: 3,
    marginBottom: 8,
  },
  sidebarSection: {
    marginBottom: 16,
  },
  skillRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    gap: 6,
  },
  skillDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: GOLD,
  },
  skillDotNavy: {
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: NAVY,
  },
  skillLabel: {
    fontFamily: "Times-Roman",
    fontSize: 9.5,
    color: BODY_TEXT,
    flex: 1,
  },
  eduDegree: {
    fontFamily: "Times-Bold",
    fontSize: 9.5,
    color: NAVY,
    marginBottom: 1,
  },
  eduSchool: {
    fontFamily: "Times-Italic",
    fontSize: 9,
    color: "#4a5568",
    marginBottom: 1,
  },
  eduYear: {
    fontFamily: "Times-Roman",
    fontSize: 9,
    color: MUTED,
    marginBottom: 8,
  },

  // ── Right main content ─────────────────────────────────────────
  main: {
    flex: 1,
    paddingTop: 20,
    paddingBottom: 20,
    paddingLeft: 22,
    paddingRight: 28,
  },
  mainSectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 8.5,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    color: NAVY,
    borderBottomWidth: 1.5,
    borderBottomColor: GOLD,
    paddingBottom: 3,
    marginBottom: 10,
  },
  mainSection: {
    marginBottom: 16,
  },

  // ── Summary ────────────────────────────────────────────────────
  summaryText: {
    fontFamily: "Times-Italic",
    fontSize: 10,
    color: "#4a5568",
    lineHeight: 1.6,
  },

  // ── Experience ─────────────────────────────────────────────────
  expBlock: {
    marginBottom: 12,
    paddingLeft: 10,
    borderLeftWidth: 2.5,
    borderLeftColor: GOLD,
  },
  expHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 2,
  },
  expRole: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
    color: NAVY,
    flex: 1,
  },
  expDateBadge: {
    backgroundColor: NAVY,
    color: "white",
    fontFamily: "Times-Roman",
    fontSize: 8,
    paddingTop: 2,
    paddingBottom: 2,
    paddingLeft: 7,
    paddingRight: 7,
    borderRadius: 10,
    marginLeft: 6,
  },
  expCompany: {
    fontFamily: "Times-Bold",
    fontSize: 9.5,
    color: GOLD,
    marginBottom: 5,
  },
  bulletRow: {
    flexDirection: "row",
    marginBottom: 3,
    paddingLeft: 4,
  },
  bulletArrow: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: GOLD,
    width: 10,
    marginTop: 0.5,
  },
  bulletText: {
    fontFamily: "Times-Roman",
    fontSize: 9.5,
    color: BODY_TEXT,
    flex: 1,
    lineHeight: 1.4,
  },

  // ── Cover letter page ──────────────────────────────────────────
  coverPage: {
    fontFamily: "Times-Roman",
    fontSize: 11,
    color: BODY_TEXT,
    paddingTop: INCH,
    paddingBottom: INCH,
    paddingLeft: INCH,
    paddingRight: INCH,
    lineHeight: 1.6,
  },
  coverName: {
    fontFamily: "Times-Bold",
    fontSize: 18,
    textTransform: "uppercase",
    letterSpacing: 2,
    color: NAVY,
    marginBottom: 4,
    textAlign: "center",
  },
  coverContact: {
    fontFamily: "Times-Roman",
    fontSize: 9,
    color: MUTED,
    textAlign: "center",
    marginBottom: 6,
  },
  coverDivider: {
    borderBottomWidth: 1.5,
    borderBottomColor: NAVY,
    marginBottom: 18,
  },
  coverGoldBar: {
    width: 48,
    height: 2,
    backgroundColor: GOLD,
    marginBottom: 18,
    alignSelf: "center",
  },
  coverDate: {
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    marginBottom: 14,
  },
  coverRecipientBold: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
    marginBottom: 2,
  },
  coverRecipient: {
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    marginBottom: 14,
  },
  coverSubject: {
    fontFamily: "Times-Bold",
    fontSize: 10.5,
    color: NAVY,
    marginBottom: 16,
  },
  coverBody: {
    fontFamily: "Times-Roman",
    fontSize: 11,
    lineHeight: 1.7,
    marginBottom: 12,
  },
  coverSignoff: {
    fontFamily: "Times-Roman",
    fontSize: 11,
    marginBottom: 32,
    marginTop: 18,
  },
  coverSignName: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    color: NAVY,
    marginBottom: 2,
  },
  coverSignDetail: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: MUTED,
  },
});

interface ExecutiveCVProps {
  profile: UserProfile;
  tailored: TailoredData;
  jobTitle: string;
  companyName: string;
}

export function ExecutiveCV({ profile, tailored, jobTitle, companyName }: ExecutiveCVProps) {
  const contactParts = [
    profile.contact_email,
    profile.phone_number,
    profile.location,
    profile.linkedin_url,
  ].filter(Boolean);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  return (
    <Document title={`${profile.full_name} — ${jobTitle} @ ${companyName}`}>
      {/* ── CV PAGE ─────────────────────────────────────────────── */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerName}>{profile.full_name}</Text>
          <View style={styles.headerGoldBar} />
          <View style={styles.headerContactRow}>
            {contactParts.map((c, i) => (
              <Text key={i} style={styles.headerContactItem}>{c}</Text>
            ))}
          </View>
        </View>

        {/* Two-column body */}
        <View style={styles.body}>
          {/* LEFT SIDEBAR */}
          <View style={styles.sidebar}>
            {/* Technical Skills */}
            {tailored.tech_skills?.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>Technical Skills</Text>
                {tailored.tech_skills.map((s, i) => (
                  <View key={i} style={styles.skillRow}>
                    <View style={styles.skillDot} />
                    <Text style={styles.skillLabel}>{s}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Soft Skills */}
            {tailored.soft_skills?.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>Core Competencies</Text>
                {tailored.soft_skills.map((s, i) => (
                  <View key={i} style={styles.skillRow}>
                    <View style={styles.skillDotNavy} />
                    <Text style={styles.skillLabel}>{s}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Education */}
            {tailored.education?.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>Education</Text>
                {tailored.education.map((edu, i) => (
                  <View key={i}>
                    <Text style={styles.eduDegree}>{edu.degree}</Text>
                    <Text style={styles.eduSchool}>{edu.university}</Text>
                    <Text style={styles.eduYear}>{edu.graduation_year}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Languages */}
            {tailored.languages?.length > 0 && (
              <View style={styles.sidebarSection}>
                <Text style={styles.sidebarSectionTitle}>Languages</Text>
                {tailored.languages.map((l, i) => (
                  <View key={i} style={styles.skillRow}>
                    <View style={styles.skillDot} />
                    <Text style={styles.skillLabel}>{l}</Text>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* RIGHT MAIN */}
          <View style={styles.main}>
            {/* Executive Summary */}
            {tailored.summary && (
              <View style={styles.mainSection}>
                <Text style={styles.mainSectionTitle}>Executive Summary</Text>
                <Text style={styles.summaryText}>{tailored.summary}</Text>
              </View>
            )}

            {/* Experience */}
            {tailored.experience?.length > 0 && (
              <View style={styles.mainSection}>
                <Text style={styles.mainSectionTitle}>Professional Experience</Text>
                {tailored.experience.map((exp, i) => (
                  <View key={i} style={styles.expBlock}>
                    <View style={styles.expHeaderRow}>
                      <Text style={styles.expRole}>{exp.role}</Text>
                      <Text style={styles.expDateBadge}>{exp.duration}</Text>
                    </View>
                    <Text style={styles.expCompany}>{exp.company}</Text>
                    {exp.responsibilities?.map((r, j) => (
                      <View key={j} style={styles.bulletRow}>
                        <Text style={styles.bulletArrow}>›</Text>
                        <Text style={styles.bulletText}>{r}</Text>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </Page>

      {/* ── COVER LETTER PAGE ───────────────────────────────────── */}
      {tailored.cover_letter && (
        <Page size="A4" style={styles.coverPage}>
          <Text style={styles.coverName}>{profile.full_name}</Text>
          <Text style={styles.coverContact}>{contactParts.join("  ·  ")}</Text>
          <View style={styles.coverGoldBar} />
          <View style={styles.coverDivider} />

          <Text style={styles.coverDate}>{today}</Text>
          <Text style={styles.coverRecipientBold}>Hiring Manager</Text>
          <Text style={styles.coverRecipient}>{companyName}</Text>
          <Text style={styles.coverSubject}>Re: Application for {jobTitle}</Text>

          {tailored.cover_letter.split("\n\n").map((para, i) => (
            <Text key={i} style={styles.coverBody}>{para.trim()}</Text>
          ))}

          <Text style={styles.coverSignoff}>Sincerely,</Text>
          <Text style={styles.coverSignName}>{profile.full_name}</Text>
          {profile.contact_email && <Text style={styles.coverSignDetail}>{profile.contact_email}</Text>}
          {profile.phone_number && <Text style={styles.coverSignDetail}>{profile.phone_number}</Text>}
        </Page>
      )}
    </Document>
  );
}