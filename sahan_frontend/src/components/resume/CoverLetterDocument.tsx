import { Document, Page, Text, View, Link } from "@react-pdf/renderer";
import type { UserProfile, TailoredData, Template } from "../../types";

interface Props {
  profile: UserProfile;
  tailored: TailoredData;
  jobTitle?: string;
  companyName?: string;
  template?: Template;
}

const today = new Date().toLocaleDateString("en-US", {
  year: "numeric",
  month: "long",
  day: "numeric",
});

// Cap at 4 paragraphs — prevents overflow for any AI output length
function getParagraphs(text: string): string[] {
  return (text || "").split("\n\n").filter((p) => p.trim()).slice(0, 4);
}

function shortUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
}

function safeUrl(url: string): string {
  return url.startsWith("http") ? url : `https://${url}`;
}

type ContactItem = { label: string; value: string; href: string | null };

function buildContacts(profile: UserProfile): ContactItem[] {
  const items: ContactItem[] = [];
  if (profile.contact_email) items.push({ label: "Email",    value: profile.contact_email,               href: null });
  if (profile.phone_number)  items.push({ label: "Phone",    value: profile.phone_number,                href: null });
  if (profile.location)      items.push({ label: "Location", value: profile.location,                    href: null });
  if (profile.linkedin_url)  items.push({ label: "LinkedIn", value: shortUrl(profile.linkedin_url),      href: safeUrl(profile.linkedin_url) });
  return items;
}

// ─── Harvard Classic ─────────────────────────────────────────────────────────
function HarvardCL({ profile, tailored, jobTitle, companyName }: Props) {
  const INCH = 72;
  const baseContact = [profile.contact_email, profile.phone_number, profile.location].filter(Boolean) as string[];
  const paragraphs = getParagraphs(tailored.cover_letter);

  return (
    <Document>
      <Page
        size="A4"
        style={{
          fontFamily: "Times-Roman",
          fontSize: 10.5,
          color: "#1a1a2e",
          paddingTop: INCH * 0.65,
          paddingBottom: INCH * 0.65,
          paddingLeft: INCH * 0.75,
          paddingRight: INCH * 0.75,
          lineHeight: 1.5,
        }}
      >
        <Text
          style={{
            fontFamily: "Times-Bold",
            fontSize: 18,
            textAlign: "center",
            textTransform: "uppercase",
            letterSpacing: 2,
            marginBottom: 5,
          }}
        >
          {profile.full_name}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 8,
          }}
        >
          {baseContact.map((c, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
              {i > 0 && (
                <Text style={{ fontSize: 9, color: "#9ca3af", marginLeft: 5, marginRight: 5 }}>
                  {"·"}
                </Text>
              )}
              <Text style={{ fontSize: 10, color: "#4b5563", fontFamily: "Times-Roman" }}>{c}</Text>
            </View>
          ))}
          {!!profile.linkedin_url && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 9, color: "#9ca3af", marginLeft: 5, marginRight: 5 }}>
                {"·"}
              </Text>
              <Link src={safeUrl(profile.linkedin_url)}>
                <Text style={{ fontSize: 10, color: "#1a56db", fontFamily: "Times-Roman" }}>
                  {shortUrl(profile.linkedin_url)}
                </Text>
              </Link>
            </View>
          )}
        </View>

        <View style={{ borderBottomWidth: 1.5, borderBottomColor: "#1a1a2e", marginBottom: 18 }} />

        <Text style={{ fontSize: 10.5, marginBottom: 12 }}>{today}</Text>
        <Text style={{ fontFamily: "Times-Bold", fontSize: 11, marginBottom: 3 }}>Hiring Manager</Text>
        {!!companyName && (
          <Text style={{ fontSize: 10.5, marginBottom: 12 }}>{companyName}</Text>
        )}
        <Text style={{ fontFamily: "Times-Bold", fontSize: 11, marginBottom: 14 }}>
          Re: Application for {jobTitle}
        </Text>

        {paragraphs.map((para, i) => (
          <Text
            key={i}
            style={{ fontSize: 10.5, lineHeight: 1.65, marginBottom: 10, textAlign: "justify" }}
          >
            {para}
          </Text>
        ))}

        <View wrap={false} style={{ marginTop: 22 }}>
          <Text style={{ fontSize: 10.5, marginBottom: 24 }}>Sincerely,</Text>
          <Text style={{ fontFamily: "Times-Bold", fontSize: 12, marginBottom: 3 }}>
            {profile.full_name}
          </Text>
          {!!profile.contact_email && (
            <Text style={{ fontSize: 10, color: "#4b5563", marginTop: 3 }}>
              {profile.contact_email}
            </Text>
          )}
          {!!profile.phone_number && (
            <Text style={{ fontSize: 10, color: "#4b5563" }}>{profile.phone_number}</Text>
          )}
        </View>
      </Page>
    </Document>
  );
}

// ─── Executive Navy ───────────────────────────────────────────────────────────
function ExecutiveCL({ profile, tailored, jobTitle, companyName }: Props) {
  const NAVY = "#1e2d4a";
  const GOLD = "#b8972e";
  const paragraphs = getParagraphs(tailored.cover_letter);
  const contacts = buildContacts(profile);

  return (
    <Document>
      <Page
        size="A4"
        style={{ fontFamily: "Times-Roman", fontSize: 10.5, color: "#2d3748", lineHeight: 1.5 }}
      >
        <View
          style={{
            backgroundColor: NAVY,
            paddingTop: 20,
            paddingBottom: 14,
            paddingLeft: 36,
            paddingRight: 36,
          }}
        >
          <Text
            style={{
              fontFamily: "Times-Bold",
              fontSize: 22,
              color: "white",
              textTransform: "uppercase",
              letterSpacing: 2.5,
              marginBottom: 6,
            }}
          >
            {profile.full_name}
          </Text>
          <View style={{ width: 48, height: 2.5, backgroundColor: GOLD, marginBottom: 8 }} />
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 16 }}>
            {contacts.map((c, i) =>
              c.href ? (
                <Link key={i} src={c.href}>
                  <Text style={{ fontSize: 9.5, color: "#93c5fd" }}>{c.value}</Text>
                </Link>
              ) : (
                <Text key={i} style={{ fontSize: 9.5, color: "#cbd5e0" }}>{c.value}</Text>
              )
            )}
          </View>
        </View>

        <View
          style={{
            paddingTop: 22,
            paddingBottom: 22,
            paddingLeft: 40,
            paddingRight: 40,
          }}
        >
          <Text style={{ fontSize: 10.5, color: "#718096", marginBottom: 14 }}>{today}</Text>
          <View style={{ width: 40, height: 2, backgroundColor: GOLD, marginBottom: 8 }} />
          <Text style={{ fontFamily: "Times-Bold", fontSize: 12, color: NAVY, marginBottom: 3 }}>
            Hiring Manager
          </Text>
          {!!companyName && (
            <Text style={{ fontSize: 10.5, color: "#4a5568", marginBottom: 14 }}>{companyName}</Text>
          )}

          <View
            style={{
              backgroundColor: NAVY,
              paddingTop: 8,
              paddingBottom: 8,
              paddingLeft: 14,
              paddingRight: 14,
              borderRadius: 5,
              marginBottom: 18,
              borderLeftWidth: 4,
              borderLeftColor: GOLD,
            }}
          >
            <Text style={{ fontFamily: "Times-Bold", fontSize: 11, color: "white" }}>
              Re: Application for {jobTitle}
            </Text>
          </View>

          {paragraphs.map((para, i) => (
            <Text
              key={i}
              style={{ fontSize: 10.5, lineHeight: 1.65, marginBottom: 12, color: "#374151" }}
            >
              {para}
            </Text>
          ))}

          <View
            wrap={false}
            style={{ marginTop: 20, paddingTop: 16, borderTopWidth: 2, borderTopColor: GOLD }}
          >
            <Text style={{ fontSize: 10.5, color: "#4a5568", marginBottom: 22 }}>Sincerely,</Text>
            <Text style={{ fontFamily: "Times-Bold", fontSize: 14, color: NAVY, marginBottom: 4 }}>
              {profile.full_name}
            </Text>
            {!!profile.contact_email && (
              <Text style={{ fontSize: 10, color: "#718096" }}>{profile.contact_email}</Text>
            )}
            {!!profile.phone_number && (
              <Text style={{ fontSize: 10, color: "#718096" }}>{profile.phone_number}</Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ─── Modern Professional ──────────────────────────────────────────────────────
const MP = {
  blue:      "#1a56db",
  sidebarBg: "#f0f4ff",
  muted:     "#5c6b80",
  light:     "#8898aa",
  border:    "#dde3ed",
  chipBg:    "#e4eaf8",
  text:      "#1e2939",
};

function ModernProfessionalCL({ profile, tailored, jobTitle, companyName }: Props) {
  const paragraphs = getParagraphs(tailored.cover_letter);
  const contacts = buildContacts(profile);

  return (
    <Document>
      <Page
        size="A4"
        style={{
          fontFamily: "Helvetica",
          fontSize: 10.5,
          color: MP.text,
          lineHeight: 1.5,
          flexDirection: "row",
        }}
      >
        {/* Left sidebar */}
        <View
          style={{
            width: "31%",
            backgroundColor: MP.sidebarBg,
            paddingTop: 26,
            paddingBottom: 26,
            paddingLeft: 16,
            paddingRight: 12,
            borderRightWidth: 1,
            borderRightColor: MP.border,
          }}
        >
          {[
            { label: "APPLYING FOR", value: jobTitle   },
            { label: "COMPANY",      value: companyName },
            { label: "DATE",         value: today       },
          ].map((m, i) => (
            <View key={i} style={{ marginBottom: 14 }}>
              <Text
                style={{
                  fontFamily: "Helvetica-Bold",
                  fontSize: 7,
                  textTransform: "uppercase",
                  letterSpacing: 1.5,
                  color: MP.blue,
                  marginBottom: 3,
                }}
              >
                {m.label}
              </Text>
              <Text style={{ fontSize: 8.5, color: MP.muted }}>{m.value}</Text>
            </View>
          ))}

          <View style={{ borderBottomWidth: 1, borderBottomColor: MP.border, marginBottom: 14 }} />

          <View style={{ marginBottom: 16 }}>
            <Text
              style={{
                fontFamily: "Helvetica-Bold",
                fontSize: 7,
                textTransform: "uppercase",
                letterSpacing: 1.5,
                color: MP.blue,
                marginBottom: 7,
              }}
            >
              CONTACT
            </Text>
            {contacts.map((c, i) => (
              <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 5 }}>
                <Text style={{ fontSize: 8.5, color: MP.blue, width: 10 }}>{"•"}</Text>
                {c.href ? (
                  <Link src={c.href}>
                    <Text style={{ fontSize: 8, color: MP.blue, flex: 1 }}>{c.value}</Text>
                  </Link>
                ) : (
                  <Text style={{ fontSize: 8, color: MP.muted, flex: 1 }}>{c.value}</Text>
                )}
              </View>
            ))}
          </View>

          {tailored.tech_skills?.slice(0, 6).map((s, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 6 }}>
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 3,
                  backgroundColor: MP.blue,
                  marginRight: 7,
                }}
              />
              <Text style={{ fontSize: 9, color: MP.muted }}>{s}</Text>
            </View>
          ))}
        </View>

        {/* Main content */}
        <View
          style={{
            flex: 1,
            paddingTop: 24,
            paddingBottom: 24,
            paddingLeft: 20,
            paddingRight: 24,
          }}
        >
          <Text
            style={{
              fontFamily: "Helvetica-Bold",
              fontSize: 20,
              color: MP.text,
              letterSpacing: 0.5,
              marginBottom: 8,
            }}
          >
            {profile.full_name}
          </Text>
          <Text
            style={{
              fontFamily: "Helvetica-Oblique",
              fontSize: 11,
              color: MP.blue,
              marginBottom: 12,
            }}
          >
            Cover Letter
          </Text>
          <View style={{ borderBottomWidth: 2, borderBottomColor: MP.blue, marginBottom: 14 }} />

          <Text style={{ fontSize: 9, color: MP.light, marginBottom: 14 }}>{today}</Text>
          <Text
            style={{ fontFamily: "Helvetica-Bold", fontSize: 10.5, color: MP.text, marginBottom: 2 }}
          >
            Hiring Manager
          </Text>
          {!!companyName && (
            <Text style={{ fontSize: 10, color: MP.muted, marginBottom: 12 }}>{companyName}</Text>
          )}

          <View
            style={{
              backgroundColor: MP.chipBg,
              borderLeftWidth: 3,
              borderLeftColor: MP.blue,
              paddingTop: 7,
              paddingBottom: 7,
              paddingLeft: 10,
              paddingRight: 10,
              borderRadius: 4,
              marginBottom: 14,
            }}
          >
            <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 9, color: MP.blue }}>
              Re: Application for {jobTitle}
            </Text>
          </View>

          <Text style={{ fontSize: 10.5, color: MP.text, marginBottom: 10 }}>Dear Hiring Manager,</Text>

          {paragraphs.map((para, i) => (
            <Text
              key={i}
              style={{ fontSize: 9.5, color: MP.muted, lineHeight: 1.55, marginBottom: 7 }}
            >
              {para}
            </Text>
          ))}

          <View
            wrap={false}
            style={{ marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: MP.border }}
          >
            <Text style={{ fontSize: 10, color: MP.muted, marginBottom: 16 }}>Sincerely,</Text>
            <Text
              style={{ fontFamily: "Helvetica-Bold", fontSize: 13, color: MP.text, marginBottom: 3 }}
            >
              {profile.full_name}
            </Text>
            {!!profile.contact_email && (
              <Text style={{ fontSize: 8.5, color: MP.light }}>{profile.contact_email}</Text>
            )}
            {!!profile.phone_number && (
              <Text style={{ fontSize: 8.5, color: MP.light }}>{profile.phone_number}</Text>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ─── Modern Minimalist ────────────────────────────────────────────────────────
const MM = {
  accent:   "#334155",
  mid:      "#475569",
  body:     "#1e293b",
  muted:    "#64748b",
  subtle:   "#94a3b8",
  sidebar:  "#f8fafc",
  border:   "#e2e8f0",
  chipBg:   "#f1f5f9",
  chipText: "#334155",
};

function ModernMinimalistCL({ profile, tailored, jobTitle, companyName }: Props) {
  const paragraphs = getParagraphs(tailored.cover_letter);
  const contacts = buildContacts(profile);

  const sideLabel = {
    fontFamily: "Helvetica-Bold" as const,
    fontSize: 7,
    textTransform: "uppercase" as const,
    letterSpacing: 1.5,
    color: MM.mid,
    borderBottomWidth: 0.5,
    borderBottomColor: MM.border,
    paddingBottom: 3,
    marginBottom: 4,
  };

  return (
    <Document>
      <Page
        size="A4"
        style={{
          fontFamily: "Helvetica",
          fontSize: 10.5,
          color: MM.body,
          lineHeight: 1.5,
          flexDirection: "column",
        }}
      >
        <View style={{ height: 3, backgroundColor: MM.accent }} />

        <View
          style={{
            paddingTop: 16,
            paddingBottom: 14,
            paddingLeft: 38,
            paddingRight: 38,
            borderBottomWidth: 1,
            borderBottomColor: MM.border,
          }}
        >
          <Text
            style={{
              fontFamily: "Helvetica-Bold",
              fontSize: 22,
              color: MM.body,
              letterSpacing: 0.2,
              marginBottom: 10,
            }}
          >
            {profile.full_name}
          </Text>
          <Text style={{ fontFamily: "Helvetica-Oblique", fontSize: 10, color: MM.muted, marginBottom: 4 }}>
            Cover Letter
          </Text>
        </View>

        <View style={{ flexDirection: "row", flex: 1 }}>
          {/* Sidebar */}
          <View
            style={{
              width: "29%",
              backgroundColor: MM.sidebar,
              borderRightWidth: 1,
              borderRightColor: MM.border,
              paddingTop: 18,
              paddingBottom: 18,
              paddingLeft: 14,
              paddingRight: 12,
            }}
          >
            {[
              { label: "Applying For", value: jobTitle   },
              { label: "Company",      value: companyName },
              { label: "Date",         value: today       },
            ].map((m, i) => (
              <View key={i} style={{ marginBottom: 12 }}>
                <Text style={sideLabel}>{m.label}</Text>
                <Text style={{ fontSize: 8, color: MM.muted }}>{m.value}</Text>
              </View>
            ))}

            <View style={{ borderBottomWidth: 0.5, borderBottomColor: MM.border, marginBottom: 12 }} />

            <View style={{ marginBottom: 12 }}>
              <Text style={sideLabel}>Contact</Text>
              {contacts.map((c, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 4 }}>
                  <Text style={{ fontSize: 8, color: MM.accent, width: 10 }}>{"•"}</Text>
                  {c.href ? (
                    <Link src={c.href}>
                      <Text style={{ fontSize: 7.5, color: MM.accent, flex: 1 }}>{c.value}</Text>
                    </Link>
                  ) : (
                    <Text style={{ fontSize: 7.5, color: MM.muted, flex: 1 }}>{c.value}</Text>
                  )}
                </View>
              ))}
            </View>

            {tailored.tech_skills?.length > 0 && (
              <View>
                <Text style={sideLabel}>Key Skills</Text>
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 3 }}>
                  {tailored.tech_skills.slice(0, 8).map((s, i) => (
                    <View
                      key={i}
                      style={{
                        backgroundColor: MM.chipBg,
                        paddingTop: 2,
                        paddingBottom: 2,
                        paddingLeft: 6,
                        paddingRight: 6,
                        borderRadius: 4,
                        marginBottom: 3,
                      }}
                    >
                      <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 7.5, color: MM.chipText }}>
                        {s}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>

          {/* Main */}
          <View
            style={{
              flex: 1,
              paddingTop: 18,
              paddingBottom: 18,
              paddingLeft: 20,
              paddingRight: 22,
            }}
          >
            <Text style={{ fontSize: 8.5, color: MM.subtle, marginBottom: 12 }}>{today}</Text>
            <Text
              style={{ fontFamily: "Helvetica-Bold", fontSize: 10.5, color: MM.body, marginBottom: 2 }}
            >
              Hiring Manager
            </Text>
            {!!companyName && (
              <Text style={{ fontSize: 10, color: MM.muted, marginBottom: 10 }}>{companyName}</Text>
            )}

            <View
              style={{
                backgroundColor: MM.chipBg,
                paddingTop: 6,
                paddingBottom: 6,
                paddingLeft: 10,
                paddingRight: 10,
                borderRadius: 4,
                marginBottom: 12,
                borderLeftWidth: 3,
                borderLeftColor: MM.accent,
              }}
            >
              <Text style={{ fontFamily: "Helvetica-Bold", fontSize: 8.5, color: MM.accent }}>
                Re: Application for {jobTitle}
              </Text>
            </View>

            <Text style={{ fontSize: 10.5, color: MM.body, marginBottom: 9 }}>Dear Hiring Manager,</Text>

            {paragraphs.map((para, i) => (
              <Text
                key={i}
                style={{ fontSize: 9.5, color: MM.muted, lineHeight: 1.65, marginBottom: 9 }}
              >
                {para}
              </Text>
            ))}

            <View
              wrap={false}
              style={{ marginTop: 16, paddingTop: 10, borderTopWidth: 1, borderTopColor: MM.border }}
            >
              <Text style={{ fontSize: 10, color: MM.muted, marginBottom: 16 }}>Sincerely,</Text>
              <Text
                style={{ fontFamily: "Helvetica-Bold", fontSize: 13, color: MM.body, marginBottom: 3 }}
              >
                {profile.full_name}
              </Text>
              {!!profile.contact_email && (
                <Text style={{ fontSize: 8.5, color: MM.subtle }}>{profile.contact_email}</Text>
              )}
              {!!profile.phone_number && (
                <Text style={{ fontSize: 8.5, color: MM.subtle }}>{profile.phone_number}</Text>
              )}
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}

// ─── Bold Chronological ───────────────────────────────────────────────────────
function BoldChronologicalCL({ profile, tailored, jobTitle, companyName }: Props) {
  const INCH = 72;
  const INK  = "#0f172a";
  const GRAY = "#64748b";
  const paragraphs = getParagraphs(tailored.cover_letter);
  const baseContact = [profile.contact_email, profile.phone_number, profile.location].filter(Boolean) as string[];

  return (
    <Document>
      <Page
        size="A4"
        style={{
          fontFamily: "Helvetica",
          fontSize: 10.5,
          color: INK,
          paddingTop: INCH * 0.5,
          paddingBottom: INCH * 0.5,
          paddingLeft: INCH * 0.78,
          paddingRight: INCH * 0.78,
          lineHeight: 1.65,
        }}
      >
        <Text
          style={{
            fontFamily: "Times-Bold",
            fontSize: 26,
            color: INK,
            textAlign: "center",
            letterSpacing: 0.5,
            marginBottom: 18,
          }}
        >
          {profile.full_name}
        </Text>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "center",
            flexWrap: "wrap",
            marginBottom: 14,
          }}
        >
          {baseContact.map((c, i) => (
            <View key={i} style={{ flexDirection: "row", alignItems: "center" }}>
              {i > 0 && (
                <Text style={{ fontSize: 9, color: "#94a3b8", marginLeft: 5, marginRight: 5 }}>
                  {"•"}
                </Text>
              )}
              <Text style={{ fontSize: 9.5, color: GRAY }}>{c}</Text>
            </View>
          ))}
          {!!profile.linkedin_url && (
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={{ fontSize: 9, color: "#94a3b8", marginLeft: 5, marginRight: 5 }}>
                {"•"}
              </Text>
              <Link src={safeUrl(profile.linkedin_url)}>
                <Text style={{ fontSize: 9.5, color: "#3b82f6" }}>
                  {shortUrl(profile.linkedin_url)}
                </Text>
              </Link>
            </View>
          )}
        </View>

        <View style={{ borderBottomWidth: 1.5, borderBottomColor: INK, marginBottom: 16 }} />

        <Text style={{ fontSize: 10, color: GRAY, marginBottom: 12 }}>{today}</Text>

        <View style={{ marginBottom: 14 }}>
          <Text style={{ fontSize: 10, color: INK, lineHeight: 1.5 }}>Hiring Manager</Text>
          {!!companyName && (
            <Text style={{ fontSize: 10, color: INK, lineHeight: 1.5 }}>{companyName}</Text>
          )}
        </View>

        <Text
          style={{
            fontFamily: "Times-Bold",
            fontSize: 11,
            color: INK,
            textAlign: "center",
            marginBottom: 12,
          }}
        >
          Re: Application for {jobTitle}
        </Text>
        <View style={{ borderBottomWidth: 1, borderBottomColor: INK, marginBottom: 14 }} />

        <Text style={{ fontSize: 10.5, color: INK, marginBottom: 8 }}>Dear Hiring Manager,</Text>

        {paragraphs.map((para, i) => (
          <Text key={i} style={{ fontSize: 10.5, color: INK, lineHeight: 1.65, marginBottom: 10 }}>
            {para}
          </Text>
        ))}

        <View wrap={false} style={{ marginTop: 14 }}>
          <Text style={{ fontSize: 10.5, color: INK, marginBottom: 18 }}>Sincerely,</Text>
          <Text style={{ fontFamily: "Times-Bold", fontSize: 13, color: INK, marginBottom: 3 }}>
            {profile.full_name}
          </Text>
          {!!jobTitle && (
            <Text style={{ fontFamily: "Helvetica-Oblique", fontSize: 10, color: GRAY }}>
              {jobTitle}
            </Text>
          )}
        </View>
      </Page>
    </Document>
  );
}

// ─── Public export — template-aware dispatcher ────────────────────────────────
export function CoverLetterDocument({ profile, tailored, jobTitle, companyName, template }: Props) {
  switch (template) {
    case "executive":
      return <ExecutiveCL profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />;
    case "modern":
      return <ModernProfessionalCL profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />;
    case "minimalist":
      return <ModernMinimalistCL profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />;
    case "boldChronological":
      return <BoldChronologicalCL profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />;
    default:
      return <HarvardCL profile={profile} tailored={tailored} jobTitle={jobTitle} companyName={companyName} />;
  }
}
