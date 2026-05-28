import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { UserProfile, TailoredData } from "../../types";


const INCH = 72;

const styles = StyleSheet.create({
  page: {
    fontFamily: "Times-Roman",
    fontSize: 10,
    color: "#1a1a2e",
    paddingTop: INCH * 0.7,
    paddingBottom: INCH * 0.7,
    paddingLeft: INCH,
    paddingRight: INCH,
    lineHeight: 1.3,
  },
  name: {
    fontSize: 16,
    fontFamily: "Times-Bold",
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 2,
    marginBottom: 3,
  },
  contactLine: {
    fontSize: 8.5,
    fontFamily: "Times-Roman",
    textAlign: "center",
    color: "#4b5563",
    marginBottom: 6,
  },
  headerDivider: {
    borderBottomWidth: 1,
    borderBottomColor: "#1a1a2e",
    marginBottom: 6,
  },
  section: {
    marginBottom: 7,
  },
  sectionTitle: {
    fontSize: 9,
    fontFamily: "Times-Bold",
    textTransform: "uppercase",
    letterSpacing: 1.5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#d1d5db",
    paddingBottom: 2,
    marginBottom: 4,
  },
  summary: {
    fontSize: 9.5,
    fontFamily: "Times-Italic",
    color: "#374151",
    lineHeight: 1.4,
  },
  expHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  expTitle: {
    fontSize: 9.5,
    fontFamily: "Times-Bold",
  },
  expDate: {
    fontSize: 8.5,
    fontFamily: "Times-Roman",
    color: "#6b7280",
  },
  expCompany: {
    fontSize: 9,
    fontFamily: "Times-Italic",
    color: "#374151",
    marginBottom: 2,
  },
  bullet: {
    flexDirection: "row",
    marginBottom: 1,
    paddingLeft: 8,
  },
  bulletDot: {
    width: 8,
    fontSize: 9,
    fontFamily: "Times-Roman",
  },
  bulletText: {
    flex: 1,
    fontSize: 9,
    fontFamily: "Times-Roman",
    lineHeight: 1.3,
  },
  expBlock: {
    marginBottom: 5,
  },
  eduRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  eduDegree: {
    fontSize: 9.5,
    fontFamily: "Times-Bold",
  },
  eduSchool: {
    fontSize: 9,
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
    fontSize: 8.5,
    fontFamily: "Times-Bold",
    marginBottom: 1,
  },
  skillText: {
    fontSize: 8.5,
    fontFamily: "Times-Roman",
    color: "#374151",
    lineHeight: 1.4,
  },
  coverLetterBody: {
    fontSize: 10,
    fontFamily: "Times-Roman",
    lineHeight: 1.6,
    color: "#1a1a2e",
  },
  coverLetterParagraph: {
    marginBottom: 8,
  },
});

interface HarvardCVProps {
  profile: UserProfile;
  tailored: TailoredData;
  jobTitle: string;
  companyName: string;
}

export function HarvardCV({ profile, tailored, jobTitle, companyName }: HarvardCVProps) {
  const contactParts = [
    profile.contact_email,
    profile.phone_number,
    profile.location,
    profile.linkedin_url,
  ].filter(Boolean);

  return (
    <Document title={`${profile.full_name} — ${jobTitle} @ ${companyName}`}>
      {/* ── CV PAGE ──────────────────────────────────────────────────────── */}
      <Page size="LETTER" style={styles.page}>
        {/* Header */}
        <Text style={styles.name}>{profile.full_name}</Text>
        <Text style={styles.contactLine}>{contactParts.join("  ·  ")}</Text>
        <View style={styles.headerDivider} />

        {/* Summary */}
        {tailored.summary && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.summary}>{tailored.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {tailored.experience?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Experience</Text>
            {tailored.experience.map((exp, i) => (
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

        {/* Education */}
        {tailored.education?.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Education</Text>
            {tailored.education.map((edu, i) => (
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

        {/* Skills */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Skills & Languages</Text>
          <View style={styles.skillsGrid}>
            {tailored.tech_skills?.length > 0 && (
              <View style={styles.skillsCol}>
                <Text style={styles.skillCategory}>Technical Skills</Text>
                <Text style={styles.skillText}>{tailored.tech_skills.join(", ")}</Text>
              </View>
            )}
            <View style={styles.skillsCol}>
              {tailored.soft_skills?.length > 0 && (
                <>
                  <Text style={styles.skillCategory}>Soft Skills</Text>
                  <Text style={styles.skillText}>{tailored.soft_skills.join(", ")}</Text>
                </>
              )}
              {tailored.languages?.length > 0 && (
                <>
                  <Text style={[styles.skillCategory, { marginTop: 4 }]}>Languages</Text>
                  <Text style={styles.skillText}>{tailored.languages.join(", ")}</Text>
                </>
              )}
            </View>
          </View>
        </View>
      </Page>

      {/* ── COVER LETTER PAGE ─────────────────────────────────────────────── */}
      {tailored.cover_letter && (
        <Page size="LETTER" style={styles.page}>
          <Text style={styles.name}>{profile.full_name}</Text>
          <Text style={styles.contactLine}>{contactParts.join("  ·  ")}</Text>
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
        </Page>
      )}
    </Document>
  );
}