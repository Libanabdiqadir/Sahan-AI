import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
  Svg,
  Path,
  Rect,
  Circle,
} from "@react-pdf/renderer";
import type { UserProfile, TailoredData } from "../../types";
import { paginate, type ContentPage } from "./paginationUtils";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  primary:     "#1a56db",
  primaryDark: "#1239a5",
  sidebar:     "#f0f4ff",
  white:       "#ffffff",
  text:        "#1e2939",
  muted:       "#5c6b80",
  light:       "#8898aa",
  border:      "#dde3ed",
  chip:        "#e4eaf8",
  chipText:    "#2d4db5",
};

const INCH          = 72;
const PAGE_MARGIN_H = INCH * 0.55;   // ≈ 39.6 pt
const PAGE_MARGIN_V = INCH * 0.45;   // ≈ 32.4 pt
const SIDEBAR_W     = "31%";

// ── Page 1 main-panel usable height (pt) ─────────────────────────────────────
// A4(841.89) - paddingTop(24.3) - nameBlock(35.8) - headerRule(14) - paddingBottom(32.4)
const FIRST_PAGE_H = 735;

// ── Continuation page usable height (pt) ─────────────────────────────────────
// A4(841.89) - paddingTop(32.4) - pageNumRow(16) - paddingBottom(32.4)
const CONT_PAGE_H = 761;

// ── Average characters per line in the main column ───────────────────────────
// Main width ~347 pt, bullet text ~335 pt, 9 pt Times-Roman ≈ 4.9 pt/char → ~68 chars.
// CPL is kept slightly conservative at 64 to absorb short-word wrapping variance.
const CPL = 64;

const S = StyleSheet.create({
  // ── Page ────────────────────────────────────────────────────────────
  page: {
    flexDirection: "row",
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    color: C.text,
    backgroundColor: C.white,
  },

  // ── Sidebar ──────────────────────────────────────────────────────────
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
  sidebarSection: { marginBottom: 12 },
  sidebarTitle: {
    fontFamily: "Times-Bold",
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    color: C.primary,
    marginBottom: 8,
    paddingBottom: 4,
    borderBottomWidth: 1.5,
    borderBottomColor: C.primary,
  },
  contactRow: { flexDirection: "row", alignItems: "flex-start", marginBottom: 4, gap: 5 },
  contactIcon: { fontSize: 9, color: C.primary, width: 12, fontFamily: "Times-Roman" },
  contactText: { fontSize: 8, color: C.muted, flex: 1, fontFamily: "Times-Roman", lineHeight: 1.4 },
  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 4 },
  chip: {
    backgroundColor: C.chip,
    paddingTop: 3, paddingBottom: 3, paddingLeft: 7, paddingRight: 7, borderRadius: 12,
  },
  chipText: { fontSize: 9.5, color: C.chipText, fontFamily: "Times-Bold" },
  sidebarItem: { flexDirection: "row", alignItems: "center", marginBottom: 7, gap: 6 },
  sidebarDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: C.primary },
  sidebarItemText: { fontSize: 8.5, color: C.muted, fontFamily: "Times-Roman", flex: 1, lineHeight: 1.3 },

  // ── Main panel ───────────────────────────────────────────────────────
  main: {
    flex: 1,
    paddingTop: PAGE_MARGIN_V * 0.75,
    paddingBottom: PAGE_MARGIN_V,
    paddingLeft: 24,
    paddingRight: PAGE_MARGIN_H,
  },
  nameBlock: { marginBottom: 4 },
  name: {
    fontFamily: "Times-Bold",
    fontSize: 24,
    color: C.text,
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  headerRule: {
    borderBottomWidth: 2, borderBottomColor: C.primary, marginBottom: 12,
  },

  // ── Sections ─────────────────────────────────────────────────────────
  section: { marginBottom: 8 },
  sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 8 },
  sectionTitle: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 1.8,
    color: C.primary,
  },
  sectionLine: { flex: 1, borderBottomWidth: 1, borderBottomColor: C.border, marginTop: 1 },
  summaryText: { fontFamily: "Times-Roman", fontSize: 9, color: C.muted, lineHeight: 1.35 },

  expBlock: { marginBottom: 5, breakInside: "avoid" },
  expTopRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 1,
  },
  expCompany: { fontFamily: "Times-Bold", fontSize: 10.5, color: C.text },
  expDate: {
    fontFamily: "Times-Roman", fontSize: 9, color: C.light,
    backgroundColor: C.chip,
    paddingTop: 2, paddingBottom: 2, paddingLeft: 7, paddingRight: 7, borderRadius: 10,
  },
  expRole: { fontFamily: "Times-Italic", fontSize: 9.5, color: C.primary, marginBottom: 5 },
  bulletRow: { flexDirection: "row", marginBottom: 3, paddingLeft: 2 },
  bulletDot: { width: 10, fontSize: 13, color: C.primary, fontFamily: "Times-Roman", lineHeight: 1.4 },
  bulletText: { flex: 1, fontFamily: "Times-Roman", fontSize: 9, color: C.muted, lineHeight: 1.35 },

  eduBlock: { marginBottom: 6 },
  eduTopRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 1,
  },
  eduDegree: { fontFamily: "Times-Bold", fontSize: 10.5, color: C.text },
  eduYear: { fontFamily: "Times-Roman", fontSize: 9, color: C.light },
  eduSchool: { fontFamily: "Times-Italic", fontSize: 9.5, color: C.muted },

  // ── Continuation page ────────────────────────────────────────────────
  contPage: {
    flexDirection: "column",
    fontFamily: "Times-Roman",
    fontSize: 10.5,
    color: C.text,
    backgroundColor: C.white,
  },
  contPageNum: {
    fontFamily: "Times-Roman", fontSize: 8.5, color: C.light, textAlign: "right", marginBottom: 8,
  },
  contBody: {
    flex: 1,
    paddingTop: PAGE_MARGIN_V,
    paddingBottom: PAGE_MARGIN_V,
    paddingLeft: PAGE_MARGIN_H,
    paddingRight: PAGE_MARGIN_H,
  },

  // ── Cover letter ──────────────────────────────────────────────────────
  clPage: {
    flexDirection: "row",
    fontFamily: "Times-Roman",
    fontSize: 10.5,
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
  clDate: { fontFamily: "Times-Roman", fontSize: 9.5, color: C.light, marginBottom: 18 },
  clRecipientLabel: { fontFamily: "Times-Bold", fontSize: 10.5, color: C.text, marginBottom: 2 },
  clRecipientCompany: { fontFamily: "Times-Roman", fontSize: 10, color: C.muted, marginBottom: 16 },
  clSubjectBox: {
    backgroundColor: C.chip,
    borderLeftWidth: 3, borderLeftColor: C.primary,
    paddingTop: 8, paddingBottom: 8, paddingLeft: 12, paddingRight: 12,
    borderRadius: 4, marginBottom: 18,
  },
  clSubjectText: { fontFamily: "Times-Bold", fontSize: 10, color: C.primary },
  clGreeting: { fontFamily: "Times-Roman", fontSize: 10.5, color: C.text, marginBottom: 13 },
  clBodyPara: { fontFamily: "Times-Roman", fontSize: 9.5, color: C.muted, lineHeight: 1.5, marginBottom: 11 },
  clSignoffWrap: {
    marginTop: 22, paddingTop: 14, borderTopWidth: 1, borderTopColor: C.border,
  },
  clSignoff: { fontFamily: "Times-Roman", fontSize: 10, color: C.muted, marginBottom: 26 },
  clSignName: { fontFamily: "Times-Bold", fontSize: 11, color: C.text, marginBottom: 4 },
  clSignDetail: { fontFamily: "Times-Roman", fontSize: 10.5, color: C.light },
  clSidebarMeta: { marginBottom: 18 },
  clSidebarMetaLabel: {
    fontFamily: "Times-Bold", fontSize: 9, textTransform: "uppercase",
    letterSpacing: 1.5, color: C.primary, marginBottom: 4,
  },
  clSidebarMetaValue: { fontFamily: "Times-Roman", fontSize: 9.5, color: C.muted, lineHeight: 1.4 },
});

// ─── SVG Contact Icons ──────────────────────────────────────────────────────
type IconKind = "email" | "phone" | "location" | "linkedin";

function ContactIcon({ kind, color = C.primary, size = 9 }: { kind: IconKind; color?: string; size?: number }) {
  if (kind === "email") {
    return (
      <Svg width={size * 1.3} height={size} viewBox="0 0 13 10">
        <Path d="M0.5,0.5 L12.5,0.5 L12.5,9.5 L0.5,9.5 Z M0.5,0.5 L6.5,6 L12.5,0.5"
          fill="none" stroke={color} strokeWidth="1" />
      </Svg>
    );
  }
  if (kind === "phone") {
    return (
      <Svg width={size * 0.8} height={size} viewBox="0 0 8 10">
        <Rect x="0.5" y="0.5" width="7" height="9" rx="1.5" fill="none" stroke={color} strokeWidth="1" />
        <Rect x="2.5" y="1.5" width="3" height="0.7" rx="0.35" fill={color} />
      </Svg>
    );
  }
  if (kind === "location") {
    return (
      <Svg width={size * 0.8} height={size * 1.15} viewBox="0 0 8 11">
        <Path d="M4,0.5 C2,0.5 0.5,2 0.5,4 C0.5,7 4,10.5 4,10.5 C4,10.5 7.5,7 7.5,4 C7.5,2 6,0.5 4,0.5 Z" fill={color} />
        <Circle cx="4" cy="4" r="1.4" fill="white" />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 10 10">
      <Rect x="0" y="0" width="10" height="10" rx="2" fill={color} />
      <Circle cx="2.3" cy="2.8" r="1" fill="white" />
      <Rect x="1.4" y="4.3" width="1.8" height="5.2" fill="white" />
      <Path d="M4.6,4.3 L6.2,4.3 L6.2,5.1 C6.5,4.5 7.2,4.2 7.9,4.2 C9.3,4.2 9.8,5.1 9.8,6.4 L9.8,9.5 L8.2,9.5 L8.2,6.8 C8.2,6.1 7.8,5.7 7.2,5.7 C6.6,5.7 6.2,6.1 6.2,6.8 L6.2,9.5 L4.6,9.5 Z" fill="white" />
    </Svg>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <View style={S.sectionHeader}>
      <Text style={S.sectionTitle}>{title}</Text>
      <View style={S.sectionLine} />
    </View>
  );
}

// ─── Shared section renderer ──────────────────────────────────────────────────
function PageSections({ pg, tailored, isFirstPage }: { pg: ContentPage; tailored: TailoredData; isFirstPage?: boolean }) {
  return (
    <>
      {(isFirstPage || pg.hasSummary) && tailored.summary && (
        <View style={S.section}>
          <SectionHeader title="Professional Summary" />
          <Text style={S.summaryText}>{tailored.summary}</Text>
        </View>
      )}

      {pg.expItems.length > 0 && (
        <View style={S.section}>
          {pg.showExpHeader && <SectionHeader title="Work Experience" />}
          {pg.expItems.map((exp, i) => (
            <View key={i} style={S.expBlock} wrap={false}>
              <View style={S.expTopRow}>
                <Text style={S.expCompany}>{exp.company}</Text>
                <Text style={S.expDate}>{exp.duration}</Text>
              </View>
              <Text style={S.expRole}>{exp.role}</Text>
              {(exp.responsibilities ?? []).map((r: string, j: number) => (
                <View key={j} style={S.bulletRow}>
                  <Text style={S.bulletDot}>•</Text>
                  <Text style={S.bulletText}>{r}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {pg.projItems.length > 0 && (
        <View style={S.section}>
          {pg.showProjHeader && <SectionHeader title="Projects" />}
          {pg.projItems.map((p, i) => (
            <View key={i} style={S.expBlock} wrap={false}>
              <View style={S.expTopRow}>
                <Text style={S.expCompany}>{p.name || p.title || ""}</Text>
                <Text style={S.expDate}>{p.dates || p.duration || ""}</Text>
              </View>
              {!!p.role_title && <Text style={S.expRole}>{p.role_title}</Text>}
              {!!(p.link || p.url) && (
                <Text style={{ fontFamily: "Times-Roman", fontSize: 8.5, color: C.light, marginBottom: 4 }}>
                  {p.link || p.url}
                </Text>
              )}
              {!!p.description && (
                <View style={S.bulletRow}>
                  <Text style={S.bulletDot}>•</Text>
                  <Text style={S.bulletText}>{p.description}</Text>
                </View>
              )}
              {(p.highlights ?? []).map((h: string, j: number) => (
                <View key={j} style={S.bulletRow}>
                  <Text style={S.bulletDot}>•</Text>
                  <Text style={S.bulletText}>{h}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      )}

      {pg.eduItems.length > 0 && (
        <View style={S.section}>
          {pg.showEduHeader && <SectionHeader title="Education" />}
          {pg.eduItems.map((edu, i) => (
            <View key={i} style={S.eduBlock} wrap={false}>
              <View style={S.eduTopRow}>
                <Text style={S.eduDegree}>{edu.degree}</Text>
                <Text style={S.eduYear}>{edu.graduation_year}</Text>
              </View>
              <Text style={S.eduSchool}>{edu.university}</Text>
            </View>
          ))}
        </View>
      )}
    </>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects: any[] = tailored.projects?.length ? tailored.projects : (profile.projects ?? []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const certifications: any[] = tailored.certifications?.length
    ? tailored.certifications
    : (profile.certifications ?? []);

  // Fallback to profile data when the AI returns empty arrays (e.g. partial generation).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const experience: any[] = tailored.experience?.length ? tailored.experience : (profile.work_experience ?? []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const education: any[]  = tailored.education?.length  ? tailored.education  : (profile.education_history ?? []);
  const techSkills: string[] = tailored.tech_skills?.length ? tailored.tech_skills : (profile.master_data?.tech_skills ?? []);
  const softSkills: string[] = tailored.soft_skills?.length ? tailored.soft_skills : (profile.master_data?.soft_skills ?? []);
  const languages: string[]  = tailored.languages?.length  ? tailored.languages  : (profile.languages ?? []);

  // ── PDF sidebar caps ──────────────────────────────────────────────────────
  // The sidebar is rendered only on page 1 and is not part of the paginator's
  // height budget. @react-pdf/renderer clips rather than scrolls, so an
  // unbounded list silently cuts off items at the page bottom.  These limits
  // reflect the maximum that fits at the current font sizes before overflow.
  const sidebarTechSkills    = techSkills.slice(0, 15);
  const sidebarSoftSkills    = softSkills.slice(0, 10);
  const sidebarLanguages     = languages.slice(0, 10);
  const sidebarCertifications = certifications.slice(0, 6);

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const contactParts: Array<{ kind: IconKind; value: string }> = [
    profile.contact_email ? { kind: "email",    value: profile.contact_email } : null,
    profile.phone_number  ? { kind: "phone",    value: profile.phone_number } : null,
    profile.location      ? { kind: "location", value: profile.location } : null,
    profile.linkedin_url  ? { kind: "linkedin", value: profile.linkedin_url } : null,
  ].filter((x): x is { kind: IconKind; value: string } => x !== null);

  // ── Pre-paginate main content ─────────────────────────────────────────
  const pages = paginate(
    {
      summary:    tailored.summary,
      experience,
      projects,
      education,
    },
    FIRST_PAGE_H,
    CONT_PAGE_H,
    CPL,
  );
  const totalPages = pages.length;

  return (
    <Document title={`${profile.full_name} — ${jobTitle}`} hyphenationCallback={(w: string) => [w]}>

      {/* ══════════════════════════════════════════════════════════
          PAGE 1 — two-column (sidebar + main)
      ══════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>

        {/* ── LEFT SIDEBAR ── */}
        <View style={S.sidebar}>
          <View style={S.sidebarSection}>
            <Text style={S.sidebarTitle}>Contact</Text>
            {contactParts.map((c, i) => (
              <View key={i} style={S.contactRow}>
                <View style={{ marginTop: 2, marginRight: 5 }}>
                  <ContactIcon kind={c.kind} color={C.primary} size={9} />
                </View>
                {c.kind === "linkedin" ? (
                  <Link src={c.value} style={[S.contactText, { color: C.primary }]}>LinkedIn</Link>
                ) : c.kind === "email" ? (
                  <Link src={`mailto:${c.value}`} style={[S.contactText, { color: C.primary }]}>{c.value}</Link>
                ) : (
                  <Text style={S.contactText}>{c.value}</Text>
                )}
              </View>
            ))}
          </View>

          {sidebarTechSkills.length > 0 && (
            <View style={S.sidebarSection}>
              <Text style={S.sidebarTitle}>Technical Skills</Text>
              {sidebarTechSkills.map((s, i) => (
                <View key={i} style={S.sidebarItem}>
                  <View style={S.sidebarDot} />
                  <Text style={S.sidebarItemText}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          {sidebarSoftSkills.length > 0 && (
            <View style={S.sidebarSection}>
              <Text style={S.sidebarTitle}>Core Skills</Text>
              {sidebarSoftSkills.map((s, i) => (
                <View key={i} style={S.sidebarItem}>
                  <View style={S.sidebarDot} />
                  <Text style={S.sidebarItemText}>{s}</Text>
                </View>
              ))}
            </View>
          )}

          {sidebarLanguages.length > 0 && (
            <View style={S.sidebarSection}>
              <Text style={S.sidebarTitle}>Languages</Text>
              {sidebarLanguages.map((l, i) => (
                <View key={i} style={S.sidebarItem}>
                  <View style={S.sidebarDot} />
                  <Text style={S.sidebarItemText}>{l}</Text>
                </View>
              ))}
            </View>
          )}

          {sidebarCertifications.length > 0 && (
            <View style={S.sidebarSection}>
              <Text style={S.sidebarTitle}>Certifications</Text>
              {sidebarCertifications.map((c, i) => (
                <View key={i} style={{ marginBottom: 8 }}>
                  <Text style={{ fontFamily: "Times-Bold", fontSize: 9.5, color: C.text }}>{c.name || ""}</Text>
                  <Text style={{ fontFamily: "Times-Roman", fontSize: 8.5, color: C.light }}>
                    {[c.issuer || c.organization, c.issue_date || c.year || c.date].filter(Boolean).join("  ·  ")}
                  </Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* ── MAIN — page 1 content ── */}
        <View style={S.main}>
          <View style={S.nameBlock}>
            <Text style={S.name}>{profile.full_name}</Text>
          </View>
          <View style={S.headerRule} />
          <PageSections pg={pages[0]} tailored={{ ...tailored, projects }} isFirstPage />
        </View>
      </Page>

      {/* ══════════════════════════════════════════════════════════
          PAGES 2+ — same two-column frame; empty sidebar keeps
          the column widths identical to page 1 so Projects/Edu
          never stretch corner-to-corner.
      ══════════════════════════════════════════════════════════ */}
      {pages.slice(1).map((pg, i) => (
        <Page key={i + 1} size="A4" style={S.page}>
          <View style={S.sidebar} />
          <View style={S.main}>
            <Text style={S.contPageNum}>Page {i + 2} of {totalPages}</Text>
            <PageSections pg={pg} tailored={{ ...tailored, projects }} />
          </View>
        </Page>
      ))}

      {/* ══════════════════════════════════════════════════════════
          COVER LETTER
      ══════════════════════════════════════════════════════════ */}
      {tailored.cover_letter && (
        <Page size="A4" style={S.clPage}>

          <View style={S.clSidebar}>
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
            <View style={{ borderBottomWidth: 1, borderBottomColor: C.border, marginBottom: 20 }} />
            <View style={S.clSidebarMeta}>
              <Text style={S.clSidebarMetaLabel}>Contact</Text>
              {contactParts.map((c, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 4 }}>
                  <View style={{ marginTop: 1, marginRight: 5 }}>
                    <ContactIcon kind={c.kind} color={C.primary} size={8} />
                  </View>
                  {c.kind === "linkedin" ? (
                    <Link src={c.value} style={[S.clSidebarMetaValue, { color: C.primary }]}>LinkedIn</Link>
                  ) : c.kind === "email" ? (
                    <Link src={`mailto:${c.value}`} style={[S.clSidebarMetaValue, { color: C.primary }]}>{c.value}</Link>
                  ) : (
                    <Text style={S.clSidebarMetaValue}>{c.value}</Text>
                  )}
                </View>
              ))}
            </View>
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

          <View style={S.clMain}>
            <View style={S.nameBlock}>
              <Text style={S.name}>{profile.full_name}</Text>
              <Text style={{ fontFamily: "Times-Italic", fontSize: 13, color: C.primary, marginBottom: 10 }}>
                Cover Letter
              </Text>
            </View>
            <View style={S.headerRule} />
            <Text style={S.clDate}>{today}</Text>
            <Text style={S.clRecipientLabel}>Hiring Manager</Text>
            <Text style={S.clRecipientCompany}>{companyName}</Text>
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
              {profile.phone_number  && <Text style={S.clSignDetail}>{profile.phone_number}</Text>}
            </View>
          </View>
        </Page>
      )}
    </Document>
  );
}

// ─── Browser Preview Components ──────────────────────────────────────────────

export function ModernProfessionalPreview({
  profile,
  tailored,
}: {
  profile: UserProfile;
  tailored: TailoredData;
  jobTitle?: string;
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const projects: any[] = tailored.projects?.length ? tailored.projects : (profile.projects ?? []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const certifications: any[] = tailored.certifications?.length ? tailored.certifications : (profile.certifications ?? []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const experience: any[]    = tailored.experience?.length   ? tailored.experience   : (profile.work_experience ?? []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const education: any[]     = tailored.education?.length    ? tailored.education    : (profile.education_history ?? []);
  const techSkills: string[] = tailored.tech_skills?.length  ? tailored.tech_skills  : (profile.master_data?.tech_skills ?? []);
  const softSkills: string[] = tailored.soft_skills?.length  ? tailored.soft_skills  : (profile.master_data?.soft_skills ?? []);
  const languages: string[]  = tailored.languages?.length    ? tailored.languages    : (profile.languages ?? []);

  const BLUE      = "#1a56db";
  const SIDEBAR_BG = "#f0f4ff";
  const MUTED     = "#5c6b80";
  const LIGHT     = "#8898aa";
  const CHIP_BG   = "#e4eaf8";
  const BORDER    = "#dde3ed";

  const contacts = [
    { icon: "✉", value: profile.contact_email },
    { icon: "✆", value: profile.phone_number },
    { icon: "⊙", value: profile.location },
    { icon: "in", value: profile.linkedin_url },
  ].filter((c) => c.value);

  return (
    <div style={{ background: "white", width: "210mm", minHeight: "297mm", margin: "0 auto", display: "flex", fontFamily: "Arial, sans-serif", fontSize: "11.5px", lineHeight: "1.55", color: "#1e2939", border: "1px solid #e8e6e0", borderRadius: "8px", overflow: "hidden", boxSizing: "border-box" }}>

      {/* LEFT SIDEBAR */}
      <div style={{ width: "31%", background: SIDEBAR_BG, padding: "28px 18px", borderRight: `1px solid ${BORDER}`, flexShrink: 0 }}>
        <div style={{ marginBottom: "20px" }}>
          <p style={{ fontWeight: "700", fontSize: "9px", textTransform: "uppercase", letterSpacing: "1.8px", color: BLUE, borderBottom: `1.5px solid ${BLUE}`, paddingBottom: "4px", marginBottom: "10px" }}>Contact</p>
          {contacts.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: "5px", marginBottom: "5px" }}>
              <span style={{ fontSize: "9px", color: BLUE, width: "12px", flexShrink: 0 }}>{c.icon}</span>
              {c.icon === "in" ? (
                <a href={c.value!} target="_blank" rel="noopener noreferrer" style={{ fontSize: "9px", color: BLUE, lineHeight: "1.4", textDecoration: "underline" }}>LinkedIn</a>
              ) : c.icon === "✉" ? (
                <a href={`mailto:${c.value}`} style={{ fontSize: "9px", color: BLUE, lineHeight: "1.4", hyphens: "none", wordBreak: "break-all" }}>{c.value}</a>
              ) : (
                <span style={{ fontSize: "9px", color: MUTED, hyphens: "none", wordBreak: "break-all", lineHeight: "1.4" }}>{c.value}</span>
              )}
            </div>
          ))}
        </div>

        {techSkills.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontWeight: "700", fontSize: "9px", textTransform: "uppercase", letterSpacing: "1.8px", color: BLUE, borderBottom: `1.5px solid ${BLUE}`, paddingBottom: "4px", marginBottom: "10px" }}>Technical Skills</p>
            {techSkills.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "7px" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: BLUE, flexShrink: 0 }} />
                <span style={{ fontSize: "9px", color: MUTED }}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {softSkills.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontWeight: "700", fontSize: "9px", textTransform: "uppercase", letterSpacing: "1.8px", color: BLUE, borderBottom: `1.5px solid ${BLUE}`, paddingBottom: "4px", marginBottom: "10px" }}>Core Skills</p>
            {softSkills.map((s, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "7px" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: MUTED, flexShrink: 0 }} />
                <span style={{ fontSize: "9px", color: MUTED }}>{s}</span>
              </div>
            ))}
          </div>
        )}

        {languages.length > 0 && (
          <div style={{ marginBottom: "20px" }}>
            <p style={{ fontWeight: "700", fontSize: "9px", textTransform: "uppercase", letterSpacing: "1.8px", color: BLUE, borderBottom: `1.5px solid ${BLUE}`, paddingBottom: "4px", marginBottom: "10px" }}>Languages</p>
            {languages.map((l, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "7px" }}>
                <div style={{ width: "4px", height: "4px", borderRadius: "50%", background: BLUE, flexShrink: 0 }} />
                <span style={{ fontSize: "9px", color: MUTED }}>{l}</span>
              </div>
            ))}
          </div>
        )}

        {certifications.length > 0 && (
          <div>
            <p style={{ fontWeight: "700", fontSize: "9px", textTransform: "uppercase", letterSpacing: "1.8px", color: BLUE, borderBottom: `1.5px solid ${BLUE}`, paddingBottom: "4px", marginBottom: "10px" }}>Certifications</p>
            {certifications.map((c, i) => (
              <div key={i} style={{ marginBottom: "10px" }}>
                <p style={{ fontWeight: "700", fontSize: "11px", color: "#1e2939" }}>{c.name || ""}</p>
                <p style={{ fontSize: "10px", color: LIGHT, lineHeight: "1.5" }}>
                  {[c.issuer || c.organization, c.issue_date || c.year || c.date].filter(Boolean).join("  ·  ")}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: "22px 28px 28px 22px" }}>
        <p style={{ fontSize: "24px", fontWeight: "700", color: "#1e2939", letterSpacing: "0.5px", marginBottom: "10px" }}>{profile.full_name}</p>
        <hr style={{ border: "none", borderTop: `2px solid ${BLUE}`, marginBottom: "12px" }} />

        {tailored.summary && (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
              <span style={{ fontWeight: "700", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.8px", color: BLUE }}>Professional Summary</span>
              <div style={{ flex: 1, borderBottom: `1px solid ${BORDER}` }} />
            </div>
            <p style={{ fontSize: "10px", color: MUTED, lineHeight: "1.5" }}>{tailored.summary}</p>
          </div>
        )}

        {experience.length > 0 && (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontWeight: "700", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.8px", color: BLUE }}>Work Experience</span>
              <div style={{ flex: 1, borderBottom: `1px solid ${BORDER}` }} />
            </div>
            {experience.map((exp, i) => (
              <div key={i} style={{ marginBottom: "12px", breakInside: "avoid", pageBreakInside: "avoid" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
                  <span style={{ fontWeight: "700", fontSize: "11.5px", color: "#1e2939" }}>{exp.company}</span>
                  <span style={{ fontSize: "9.5px", color: LIGHT, background: CHIP_BG, padding: "2px 8px", borderRadius: "10px" }}>{exp.duration}</span>
                </div>
                <p style={{ fontStyle: "italic", fontSize: "10.5px", color: BLUE, marginBottom: "6px" }}>{exp.role}</p>
                {exp.responsibilities?.map((r: string, j: number) => (
                  <div key={j} style={{ display: "flex", marginBottom: "3px" }}>
                    <span style={{ color: BLUE, marginRight: "6px", fontSize: "14px", lineHeight: "1.3" }}>•</span>
                    <span style={{ fontSize: "10px", color: MUTED, lineHeight: "1.5" }}>{r}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {projects.length > 0 && (
          <div style={{ marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontWeight: "700", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.8px", color: BLUE }}>Projects</span>
              <div style={{ flex: 1, borderBottom: `1px solid ${BORDER}` }} />
            </div>
            {projects.map((p, i) => (
              <div key={i} style={{ marginBottom: "12px", breakInside: "avoid", pageBreakInside: "avoid" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2px" }}>
                  <span style={{ fontWeight: "700", fontSize: "12.5px", color: "#1e2939" }}>{p.name || p.title || ""}</span>
                  <span style={{ fontSize: "10.5px", color: LIGHT, background: CHIP_BG, padding: "2px 8px", borderRadius: "10px" }}>{p.dates || p.duration || ""}</span>
                </div>
                {!!p.role_title && <p style={{ fontStyle: "italic", fontSize: "11.5px", color: BLUE, marginBottom: "4px" }}>{p.role_title}</p>}
                {!!(p.link || p.url) && <p style={{ fontSize: "10px", color: LIGHT, marginBottom: "4px" }}>{p.link || p.url}</p>}
                {!!p.description && (
                  <div style={{ display: "flex", marginBottom: "3px" }}>
                    <span style={{ color: BLUE, marginRight: "6px", fontSize: "14px", lineHeight: "1.3" }}>•</span>
                    <span style={{ fontSize: "11px", color: MUTED, lineHeight: "1.6" }}>{p.description}</span>
                  </div>
                )}
                {(p.highlights ?? []).map((h: string, j: number) => (
                  <div key={j} style={{ display: "flex", marginBottom: "3px" }}>
                    <span style={{ color: BLUE, marginRight: "6px", fontSize: "14px", lineHeight: "1.3" }}>•</span>
                    <span style={{ fontSize: "11px", color: MUTED, lineHeight: "1.6" }}>{h}</span>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {education.length > 0 && (
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <span style={{ fontWeight: "700", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1.8px", color: BLUE }}>Education</span>
              <div style={{ flex: 1, borderBottom: `1px solid ${BORDER}` }} />
            </div>
            {education.map((edu, i) => (
              <div key={i} style={{ marginBottom: "10px", breakInside: "avoid", pageBreakInside: "avoid" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontWeight: "700", fontSize: "11px", color: "#1e2939" }}>{edu.degree}</span>
                  <span style={{ fontSize: "9.5px", color: LIGHT }}>{edu.graduation_year}</span>
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
  const BLUE      = "#1a56db";
  const SIDEBAR_BG = "#f0f4ff";
  const MUTED     = "#5c6b80";
  const LIGHT     = "#8898aa";
  const CHIP_BG   = "#e4eaf8";
  const BORDER    = "#dde3ed";

  const today = new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

  const contacts = [
    { icon: "✉", value: profile.contact_email },
    { icon: "✆", value: profile.phone_number },
    { icon: "⊙", value: profile.location },
    { icon: "in", value: profile.linkedin_url },
  ].filter((c) => c.value);

  return (
    <div style={{ background: "white", width: "210mm", minHeight: "297mm", margin: "0 auto", display: "flex", fontFamily: "Arial, sans-serif", fontSize: "11px", lineHeight: "1.5", color: "#1e2939", border: "1px solid #e8e6e0", borderRadius: "8px", overflow: "hidden", boxSizing: "border-box" }}>

      <div style={{ width: "31%", background: SIDEBAR_BG, padding: "28px 18px", borderRight: `1px solid ${BORDER}`, flexShrink: 0 }}>
        {[{ label: "Applying For", value: jobTitle }, { label: "Company", value: companyName }, { label: "Date", value: today }].map((m, i) => (
          <div key={i} style={{ marginBottom: "18px" }}>
            <p style={{ fontWeight: "700", fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.5px", color: BLUE, marginBottom: "4px" }}>{m.label}</p>
            <p style={{ fontSize: "9.5px", color: MUTED }}>{m.value}</p>
          </div>
        ))}
        <hr style={{ border: "none", borderTop: `1px solid ${BORDER}`, marginBottom: "18px" }} />
        <div style={{ marginBottom: "18px" }}>
          <p style={{ fontWeight: "700", fontSize: "8px", textTransform: "uppercase", letterSpacing: "1.5px", color: BLUE, marginBottom: "8px" }}>Contact</p>
          {contacts.map((c, i) => (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: "4px", marginBottom: "4px" }}>
              <span style={{ fontSize: "9px", color: MUTED }}>{c.icon}</span>
              {c.icon === "in" ? (
                <a href={c.value!} target="_blank" rel="noopener noreferrer" style={{ fontSize: "9px", color: BLUE, textDecoration: "underline" }}>LinkedIn</a>
              ) : c.icon === "✉" ? (
                <a href={`mailto:${c.value}`} style={{ fontSize: "9px", color: BLUE }}>{c.value}</a>
              ) : (
                <span style={{ fontSize: "9px", color: MUTED }}>{c.value}</span>
              )}
            </div>
          ))}
        </div>
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

      <div style={{ flex: 1, padding: "22px 28px 28px 22px" }}>
        <p style={{ fontSize: "22px", fontWeight: "700", color: "#1e2939", letterSpacing: "0.5px", marginBottom: "3px" }}>{profile.full_name}</p>
        <p style={{ fontSize: "12px", fontStyle: "italic", color: BLUE, marginBottom: "10px" }}>Cover Letter</p>
        <hr style={{ border: "none", borderTop: `2px solid ${BLUE}`, marginBottom: "20px" }} />
        <p style={{ fontSize: "10px", color: LIGHT, marginBottom: "20px" }}>{today}</p>
        <p style={{ fontWeight: "700", fontSize: "11px", color: "#1e2939", marginBottom: "2px" }}>Hiring Manager</p>
        <p style={{ fontSize: "10px", color: MUTED, marginBottom: "18px" }}>{companyName}</p>
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
          {profile.phone_number  && <p style={{ fontSize: "9.5px", color: LIGHT }}>{profile.phone_number}</p>}
        </div>
      </div>
    </div>
  );
}
