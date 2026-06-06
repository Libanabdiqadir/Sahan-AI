import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Link,
} from "@react-pdf/renderer";
import type { UserProfile, TailoredData } from "../../types";

// ─── Design Tokens ─────────────────────────────────────────────────────────────
const C = {
  ink:    "#0f172a",   // slate-900 — all primary text
  gray:   "#64748b",   // slate-500 — dates, locations, secondary
  rule:   "#0f172a",   // divider lines
  border: "#e2e8f0",   // slate-200 — inactive dots, subtle borders
  white:  "#ffffff",
};

const INCH = 72;
const PH   = INCH * 0.78;   // generous horizontal margins ≈ 56 pt
const PV   = INCH * 0.50;   // vertical   margins ≈ 36 pt

const S = StyleSheet.create({
  // ── Page ──────────────────────────────────────────────────────────────────
  page: {
    flexDirection: "column",
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: C.ink,
    backgroundColor: C.white,
    paddingTop: PV,
    paddingBottom: PV,
    paddingLeft: PH,
    paddingRight: PH,
  },

  // ── Header ────────────────────────────────────────────────────────────────
  candidateName: {
    fontFamily: "Times-Bold",
    fontSize: 28,
    color: C.ink,
    textAlign: "center",
    letterSpacing: 0.5,
    marginBottom: 5,
  },
  jobTitleLine: {
    fontFamily: "Helvetica-Bold",
    fontSize: 12.5,
    color: C.ink,
    textAlign: "center",
    marginBottom: 4,
  },
  subtitleRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    flexWrap: "wrap",
    marginBottom: 8,
  },
  subtitlePiece: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: C.gray,
  },
  subtitleDot: {
    fontFamily: "Helvetica",
    fontSize: 10.5,
    color: "#94a3b8",
    marginLeft: 5,
    marginRight: 5,
  },
  headRule: {
    borderBottomWidth: 1.5,
    borderBottomColor: C.rule,
    marginBottom: 12,
  },

  // ── Section block ─────────────────────────────────────────────────────────
  section: { marginBottom: 10 },
  secTitle: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 2.5,
    color: C.ink,
    textAlign: "center",
    marginBottom: 5,
  },
  secRule: {
    borderBottomWidth: 1,
    borderBottomColor: C.rule,
    marginBottom: 6,
  },

  // ── Summary ───────────────────────────────────────────────────────────────
  summaryText: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.ink,
    lineHeight: 1.35,
  },

  // ── Experience / Education entries ────────────────────────────────────────
  entryBlock: { marginBottom: 8 },
  entryHeadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 1,
  },
  entryOrg: {
    fontFamily: "Times-Bold",
    fontSize: 10,
    color: C.ink,
    flex: 1,
  },
  entryMeta: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: C.gray,
    textAlign: "right",
  },
  entrySubRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 3,
    marginTop: 1,
  },
  entryRole: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 9.5,
    color: C.ink,
    flex: 1,
  },
  entryDate: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: C.gray,
  },
  bulletRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 3,
    paddingLeft: 4,
  },
  bulletMark: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.gray,
    width: 12,
    lineHeight: 1.35,
  },
  bulletText: {
    flex: 1,
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.ink,
    lineHeight: 1.35,
  },

  // ── Languages ─────────────────────────────────────────────────────────────
  langRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 22,
    justifyContent: "center",
  },
  langBlock: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
  },
  langName: {
    fontFamily: "Times-Bold",
    fontSize: 12,
    color: C.ink,
  },
  dotsRow: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 3,
    gap: 2,
  },
  dotOn: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: C.ink,
  },
  dotOff: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: C.border,
  },

  // ── Skills ────────────────────────────────────────────────────────────────
  skillsText: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: C.ink,
    lineHeight: 1.35,
    textAlign: "center",
  },

  // ── Cover Letter ──────────────────────────────────────────────────────────
  clDate: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: C.gray,
    marginBottom: 18,
  },
  clRecipientWrap: { marginBottom: 18 },
  clRecipientLine: {
    fontFamily: "Helvetica",
    fontSize: 11,
    color: C.ink,
    lineHeight: 1.65,
  },
  clSubject: {
    fontFamily: "Times-Bold",
    fontSize: 12.5,
    color: C.ink,
    textAlign: "center",
    marginBottom: 18,
  },
  clHRule: {
    borderBottomWidth: 1,
    borderBottomColor: C.rule,
    marginBottom: 18,
  },
  clGreeting: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: C.ink,
    marginBottom: 13,
  },
  clPara: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: C.ink,
    lineHeight: 1.5,
    marginBottom: 13,
  },
  clSignoff: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: C.ink,
    marginTop: 18,
    marginBottom: 26,
  },
  clSignName: {
    fontFamily: "Times-Bold",
    fontSize: 11,
    color: C.ink,
    marginBottom: 2,
  },
  clSignRole: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 10,
    color: C.gray,
  },
});

// ─── Proficiency → filled dot count ────────────────────────────────────────────
function dotsFor(lang: string): number {
  const l = lang.toLowerCase();
  if (l.includes("native") || l.includes("c2") || l.includes("fluent"))          return 5;
  if (l.includes("advanced") || l.includes("c1") || l.includes("upper"))         return 4;
  if (l.includes("intermediate") || l.includes("b1") || l.includes("b2"))        return 3;
  if (l.includes("elementary") || l.includes("a2"))                               return 2;
  if (l.includes("beginner") || l.includes("basic") || l.includes("a1"))         return 1;
  return 5;
}

// ─── Helpers ───────────────────────────────────────────────────────────────────
function Sec({ title }: { title: string }) {
  return (
    <View>
      <Text style={S.secTitle}>{title}</Text>
      <View style={S.secRule} />
    </View>
  );
}

type ContactItem = { kind: "text" | "email" | "link"; val: string };

function HeaderContactRow({ items }: { items: ContactItem[] }) {
  return (
    <View style={S.subtitleRow}>
      {items.map((item, i) => (
        <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
          {i > 0 && <Text style={S.subtitleDot}>  •  </Text>}
          {item.kind === "link" ? (
            <Link src={item.val} style={[S.subtitlePiece, { color: "#2563eb" }]}>LinkedIn</Link>
          ) : item.kind === "email" ? (
            <Link src={`mailto:${item.val}`} style={[S.subtitlePiece, { color: "#2563eb" }]}>{item.val}</Link>
          ) : (
            <Text style={S.subtitlePiece}>{item.val}</Text>
          )}
        </View>
      ))}
    </View>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PDF Document  (CV page + Cover Letter page in one Document)
// ─────────────────────────────────────────────────────────────────────────────
export function BoldChronologicalCV({
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
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const contactParts: ContactItem[] = [
    profile.contact_email ? { kind: "email", val: profile.contact_email } : null,
    profile.linkedin_url  ? { kind: "link",  val: profile.linkedin_url } : null,
    profile.location      ? { kind: "text",  val: profile.location } : null,
    profile.phone_number  ? { kind: "text",  val: profile.phone_number } : null,
  ].filter((x): x is ContactItem => x !== null);

  const allSkills = [
    ...(tailored.tech_skills ?? []),
    ...(tailored.soft_skills ?? []),
  ];

  return (
    <Document title={`${profile.full_name} — ${jobTitle}`}>

      {/* ═══════════════════════════════════════════════════════════════
          CV PAGE
      ═══════════════════════════════════════════════════════════════ */}
      <Page size="A4" style={S.page}>

        {/* Header */}
        <Text style={S.candidateName}>{profile.full_name}</Text>
        {!!jobTitle && <Text style={S.jobTitleLine}>{jobTitle}</Text>}
        <HeaderContactRow items={contactParts} />
        <View style={S.headRule} />

        {/* Summary */}
        {tailored.summary && (
          <View style={S.section}>
            <Sec title="Summary" />
            <Text style={S.summaryText}>{tailored.summary}</Text>
          </View>
        )}

        {/* Experience */}
        {tailored.experience?.length > 0 && (
          <View style={S.section}>
            <Sec title="Experience" />
            {tailored.experience.map((exp, i) => (
              <View key={i} style={S.entryBlock}>
                <View style={S.entryHeadRow}>
                  <Text style={S.entryOrg}>{exp.company}</Text>
                </View>
                <View style={S.entrySubRow}>
                  <Text style={S.entryRole}>{exp.role}</Text>
                  <Text style={S.entryDate}>{exp.duration}</Text>
                </View>
                {exp.responsibilities?.map((r, j) => (
                  <View key={j} style={S.bulletRow}>
                    <Text style={S.bulletMark}>•</Text>
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
            <Sec title="Education" />
            {tailored.education.map((edu, i) => (
              <View key={i} style={S.entryBlock}>
                <View style={S.entryHeadRow}>
                  <Text style={S.entryOrg}>{edu.university}</Text>
                </View>
                <View style={S.entrySubRow}>
                  <Text style={S.entryRole}>{edu.degree}</Text>
                  <Text style={S.entryDate}>{edu.graduation_year}</Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Languages */}
        {tailored.languages?.length > 0 && (
          <View style={S.section}>
            <Sec title="Languages" />
            <View style={S.langRow}>
              {tailored.languages.map((lang, i) => {
                const filled   = dotsFor(lang);
                const cleanName = lang.replace(/\s*[\(\[].*?[\)\]]/g, "").replace(/\s*[-–].*$/, "").trim();
                return (
                  <View key={i} style={S.langBlock}>
                    <Text style={S.langName}>{cleanName}</Text>
                    <View style={S.dotsRow}>
                      {[1,2,3,4,5].map(n => (
                        <View key={n} style={n <= filled ? S.dotOn : S.dotOff} />
                      ))}
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        )}

        {/* Skills */}
        {allSkills.length > 0 && (
          <View style={S.section}>
            <Sec title="Skills" />
            <Text style={S.skillsText}>{allSkills.join("   •   ")}</Text>
          </View>
        )}
      </Page>

      {/* ═══════════════════════════════════════════════════════════════
          COVER LETTER PAGE
      ═══════════════════════════════════════════════════════════════ */}
      {tailored.cover_letter && (
        <Page size="A4" style={S.page}>

          {/* Same header as CV */}
          <Text style={S.candidateName}>{profile.full_name}</Text>
          <HeaderContactRow items={contactParts} />
          <View style={S.headRule} />

          {/* Date */}
          <Text style={S.clDate}>{today}</Text>

          {/* Recipient */}
          <View style={S.clRecipientWrap}>
            <Text style={S.clRecipientLine}>Hiring Manager</Text>
            <Text style={S.clRecipientLine}>{companyName}</Text>
          </View>

          {/* Centered subject */}
          <Text style={S.clSubject}>Re: Application for {jobTitle}</Text>
          <View style={S.clHRule} />

          {/* Salutation */}
          <Text style={S.clGreeting}>Dear Hiring Manager,</Text>

          {/* Body */}
          {tailored.cover_letter.split("\n\n").map((para, i) => (
            <Text key={i} style={S.clPara}>{para.trim()}</Text>
          ))}

          {/* Sign-off */}
          <Text style={S.clSignoff}>Sincerely,</Text>
          <Text style={S.clSignName}>{profile.full_name}</Text>
          {!!jobTitle && <Text style={S.clSignRole}>{jobTitle}</Text>}
        </Page>
      )}
    </Document>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Browser CV Preview  (mirrors PDF layout in HTML/inline-styles)
// ─────────────────────────────────────────────────────────────────────────────
export function BoldChronologicalPreview({
  profile,
  tailored,
  jobTitle,
}: {
  profile: UserProfile;
  tailored: TailoredData;
  jobTitle: string;
}) {
  const SERIF = '"Georgia", "Palatino Linotype", Palatino, serif';
  const SANS  = '"Helvetica Neue", Helvetica, Arial, sans-serif';
  const INK   = "#0f172a";
  const GRAY  = "#64748b";
  const RULE  = "#0f172a";
  const BDOT  = "#e2e8f0";

  const contactParts = [
    profile.contact_email ? { kind: "email" as const, val: profile.contact_email } : null,
    profile.linkedin_url  ? { kind: "link"  as const, val: profile.linkedin_url } : null,
    profile.location      ? { kind: "text"  as const, val: profile.location } : null,
    profile.phone_number  ? { kind: "text"  as const, val: profile.phone_number } : null,
  ].filter((x): x is NonNullable<typeof x> => x !== null);

  const allSkills = [
    ...(tailored.tech_skills ?? []),
    ...(tailored.soft_skills ?? []),
  ];

  const SectionHead = ({ title }: { title: string }) => (
    <div style={{ textAlign: "center", marginBottom: "12px" }}>
      <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "2.5px", color: INK, marginBottom: "6px" }}>
        {title}
      </p>
      <div style={{ borderBottom: `1px solid ${RULE}` }} />
    </div>
  );

  const LangDots = ({ lang }: { lang: string }) => {
    const filled    = dotsFor(lang);
    const cleanName = lang.replace(/\s*[\(\[].*?[\)\]]/g, "").replace(/\s*[-–].*$/, "").trim();
    return (
      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
        <span style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "12px", color: INK }}>{cleanName}</span>
        <div style={{ display: "flex", gap: "3px", alignItems: "center" }}>
          {[1,2,3,4,5].map(n => (
            <div key={n} style={{ width: "7px", height: "7px", borderRadius: "50%", background: n <= filled ? INK : BDOT }} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div style={{ background: "white", width: "210mm", minHeight: "297mm", margin: "0 auto", fontFamily: SANS, fontSize: "11.5px", lineHeight: 1.65, color: INK, border: `1px solid ${BDOT}`, borderRadius: "8px", boxSizing: "border-box", padding: "50px 56px" }}>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "29px", color: INK, letterSpacing: "0.5px", marginBottom: "5px" }}>
          {profile.full_name}
        </h1>
        {jobTitle && (
          <p style={{ fontFamily: SANS, fontWeight: 700, fontSize: "12.5px", color: INK, marginBottom: "5px" }}>
            {jobTitle}
          </p>
        )}
        <p style={{ fontFamily: SANS, fontSize: "11px", color: GRAY, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px" }}>
          {contactParts.map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
              {i > 0 && <span style={{ margin: "0 6px" }}>•</span>}
              {item.kind === "link" ? (
                <a href={item.val} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>LinkedIn</a>
              ) : item.kind === "email" ? (
                <a href={`mailto:${item.val}`} style={{ color: "#2563eb" }}>{item.val}</a>
              ) : (
                <span>{item.val}</span>
              )}
            </span>
          ))}
        </p>
      </div>
      <div style={{ borderBottom: `1.5px solid ${RULE}`, marginBottom: "18px" }} />

      {/* Summary */}
      {tailored.summary && (
        <div style={{ marginBottom: "15px" }}>
          <SectionHead title="Summary" />
          <p style={{ fontFamily: SANS, fontSize: "10px", color: INK, lineHeight: 1.5 }}>
            {tailored.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {tailored.experience?.length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <SectionHead title="Experience" />
          {tailored.experience.map((exp, i) => (
            <div key={i} style={{ marginBottom: "13px" }}>
              <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "11px", color: INK, marginBottom: "1px" }}>
                {exp.company}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "5px" }}>
                <span style={{ fontFamily: SANS, fontStyle: "italic", fontSize: "10.5px", color: INK }}>{exp.role}</span>
                <span style={{ fontFamily: SANS, fontSize: "10px", color: GRAY, flexShrink: 0, marginLeft: "10px" }}>{exp.duration}</span>
              </div>
              {exp.responsibilities?.map((r, j) => (
                <div key={j} style={{ display: "flex", gap: "6px", marginBottom: "3px", paddingLeft: "4px" }}>
                  <span style={{ color: GRAY, fontSize: "9.5px", lineHeight: "1.4", flexShrink: 0 }}>•</span>
                  <span style={{ fontFamily: SANS, fontSize: "10px", color: INK, lineHeight: 1.5 }}>{r}</span>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {tailored.education?.length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <SectionHead title="Education" />
          {tailored.education.map((edu, i) => (
            <div key={i} style={{ marginBottom: "10px" }}>
              <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "11px", color: INK, marginBottom: "1px" }}>
                {edu.university}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <span style={{ fontFamily: SANS, fontStyle: "italic", fontSize: "10.5px", color: INK }}>{edu.degree}</span>
                <span style={{ fontFamily: SANS, fontSize: "10px", color: GRAY }}>{edu.graduation_year}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Languages */}
      {tailored.languages?.length > 0 && (
        <div style={{ marginBottom: "15px" }}>
          <SectionHead title="Languages" />
          <div style={{ display: "flex", flexWrap: "wrap", gap: "22px", justifyContent: "center" }}>
            {tailored.languages.map((lang, i) => <LangDots key={i} lang={lang} />)}
          </div>
        </div>
      )}

      {/* Skills */}
      {allSkills.length > 0 && (
        <div>
          <SectionHead title="Skills" />
          <p style={{ fontFamily: SANS, fontSize: "10px", color: INK, lineHeight: 1.5, textAlign: "center" }}>
            {allSkills.join("   •   ")}
          </p>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Browser Cover Letter Preview  (identical header, same typographic rhythm)
// ─────────────────────────────────────────────────────────────────────────────
export function BoldChronologicalCoverLetterPreview({
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
  const SERIF = '"Georgia", "Palatino Linotype", Palatino, serif';
  const SANS  = '"Helvetica Neue", Helvetica, Arial, sans-serif';
  const INK   = "#0f172a";
  const GRAY  = "#64748b";
  const RULE  = "#0f172a";
  const BDOT  = "#e2e8f0";

  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric", month: "long", day: "numeric",
  });

  const contactParts = [
    profile.contact_email ? { kind: "email" as const, val: profile.contact_email } : null,
    profile.linkedin_url  ? { kind: "link"  as const, val: profile.linkedin_url } : null,
    profile.location      ? { kind: "text"  as const, val: profile.location } : null,
    profile.phone_number  ? { kind: "text"  as const, val: profile.phone_number } : null,
  ].filter((x): x is NonNullable<typeof x> => x !== null);

  return (
    <div style={{ background: "white", width: "210mm", minHeight: "297mm", margin: "0 auto", fontFamily: SANS, fontSize: "10.5px", lineHeight: 1.7, color: INK, border: `1px solid ${BDOT}`, borderRadius: "8px", boxSizing: "border-box", padding: "50px 56px" }}>

      {/* Header — identical to CV */}
      <div style={{ textAlign: "center", marginBottom: "12px" }}>
        <h1 style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "28px", color: INK, letterSpacing: "0.5px", marginBottom: "5px" }}>
          {profile.full_name}
        </h1>
        <p style={{ fontFamily: SANS, fontSize: "9.5px", color: GRAY, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "4px" }}>
          {contactParts.map((item, i) => (
            <span key={i} style={{ display: "inline-flex", alignItems: "center" }}>
              {i > 0 && <span style={{ margin: "0 6px" }}>•</span>}
              {item.kind === "link" ? (
                <a href={item.val} target="_blank" rel="noopener noreferrer" style={{ color: "#2563eb", textDecoration: "underline" }}>LinkedIn</a>
              ) : item.kind === "email" ? (
                <a href={`mailto:${item.val}`} style={{ color: "#2563eb" }}>{item.val}</a>
              ) : (
                <span>{item.val}</span>
              )}
            </span>
          ))}
        </p>
      </div>
      <div style={{ borderBottom: `1.5px solid ${RULE}`, marginBottom: "22px" }} />

      {/* Date */}
      <p style={{ fontFamily: SANS, fontSize: "10px", color: GRAY, marginBottom: "18px" }}>{today}</p>

      {/* Recipient */}
      <div style={{ marginBottom: "20px" }}>
        <p style={{ fontFamily: SANS, fontSize: "10px", color: INK, lineHeight: 1.65 }}>Hiring Manager</p>
        <p style={{ fontFamily: SANS, fontSize: "10px", color: INK, lineHeight: 1.65 }}>{companyName}</p>
      </div>

      {/* Centered subject in serif */}
      <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "11px", color: INK, textAlign: "center", marginBottom: "18px" }}>
        Re: Application for {jobTitle}
      </p>
      <div style={{ borderBottom: `1px solid ${RULE}`, marginBottom: "20px" }} />

      {/* Greeting */}
      <p style={{ fontFamily: SANS, fontSize: "10.5px", color: INK, marginBottom: "14px" }}>
        Dear Hiring Manager,
      </p>

      {/* Body */}
      {tailored.cover_letter?.split("\n\n").map((para, i) => (
        <p key={i} style={{ fontFamily: SANS, fontSize: "10.5px", color: INK, lineHeight: 1.78, marginBottom: "14px" }}>
          {para.trim()}
        </p>
      ))}

      {/* Sign-off */}
      <div style={{ marginTop: "20px" }}>
        <p style={{ fontFamily: SANS, fontSize: "10.5px", color: INK, marginBottom: "28px" }}>Sincerely,</p>
        <p style={{ fontFamily: SERIF, fontWeight: 700, fontSize: "14px", color: INK, marginBottom: "3px" }}>
          {profile.full_name}
        </p>
        {jobTitle && (
          <p style={{ fontFamily: SANS, fontStyle: "italic", fontSize: "10px", color: GRAY }}>
            {jobTitle}
          </p>
        )}
      </div>
    </div>
  );
}
