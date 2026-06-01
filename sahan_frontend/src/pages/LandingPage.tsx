import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import sahanLogo from "../assets/sahan_ai_logo.png";

// ─── Animation ──────────────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE, delay },
});

// ─── Resume Mockup ───────────────────────────────────────────────────────────────
function ResumeMockup() {
  const skills     = ["React", "TypeScript", "Node.js", "Python", "AWS"];
  const softSkills = ["Leadership", "Strategy", "Agile"];
  const langs      = ["English", "Arabic", "French"];
  const jobs       = [
    { company: "Stripe",  role: "Senior Product Designer",  date: "2022 – Present" },
    { company: "Airbnb",  role: "Product Designer",         date: "2020 – 2022"    },
  ];

  return (
    <div className="relative select-none">
      {/* Soft radial glow behind card */}
      <div className="absolute -inset-8 bg-gradient-to-br from-slate-100/80 via-white to-slate-50 rounded-[40px] blur-3xl" />

      {/* Offset ghost card — depth illusion */}
      <div className="absolute inset-0 translate-x-3 translate-y-4 bg-slate-100 rounded-2xl border border-slate-200/70" />

      {/* Browser chrome wrapper */}
      <div className="relative bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-[0_24px_64px_rgba(15,23,42,0.14),0_0_0_1px_rgba(15,23,42,0.04)]">

        {/* Chrome bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-2.5 flex items-center gap-3">
          <div className="flex gap-1.5 shrink-0">
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
            <div className="w-2.5 h-2.5 rounded-full bg-slate-200" />
          </div>
          <div className="flex-1 bg-white border border-slate-200 rounded px-3 py-1 font-mono text-[10px] text-slate-400 tracking-tight">
            sahan-ai.app / resume.pdf
          </div>
        </div>

        {/* Resume content */}
        <div className="flex flex-col" style={{ minHeight: "380px" }}>
          {/* Accent strip */}
          <div className="h-[3px] bg-slate-700 shrink-0" />

          {/* Full-width header */}
          <div className="px-5 pt-3.5 pb-3 border-b border-slate-100 shrink-0">
            <p className="font-bold text-[13px] text-slate-800 tracking-tight">Alexandra Johnson</p>
            <p className="text-[10px] italic text-slate-400 mt-0.5">Senior Product Designer</p>
          </div>

          {/* Two-column body */}
          <div className="flex flex-1">

            {/* Sidebar — 29 % */}
            <div className="w-[29%] bg-slate-50 border-r border-slate-100 px-3 py-3 flex flex-col gap-3 shrink-0">

              <div>
                <p className="text-[6.5px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1 mb-1.5">Contact</p>
                <div className="space-y-1 text-[7.5px] text-slate-400 leading-snug">
                  <p>alex@email.com</p>
                  <p>San Francisco, CA</p>
                  <p>linkedin.com/in/alex</p>
                </div>
              </div>

              <div>
                <p className="text-[6.5px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1 mb-1.5">Technical Skills</p>
                <div className="flex flex-wrap gap-1">
                  {skills.map((s) => (
                    <span key={s} className="text-[7px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-sm">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[6.5px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1 mb-1.5">Core Skills</p>
                <div className="flex flex-wrap gap-1">
                  {softSkills.map((s) => (
                    <span key={s} className="text-[7px] bg-green-50 text-green-700 px-1.5 py-0.5 rounded-sm">{s}</span>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-[6.5px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-200 pb-1 mb-1.5">Languages</p>
                {langs.map((l) => (
                  <div key={l} className="flex items-center gap-1.5 mb-1">
                    <div className="w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                    <span className="text-[7.5px] text-slate-500">{l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Main panel — 71 % */}
            <div className="flex-1 px-4 py-3 space-y-3">

              {/* Summary */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[6.5px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Professional Summary</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="space-y-1">
                  <div className="h-[3px] w-full bg-slate-100 rounded-sm" />
                  <div className="h-[3px] w-[90%] bg-slate-100 rounded-sm" />
                  <div className="h-[3px] w-[74%] bg-slate-100 rounded-sm" />
                </div>
              </div>

              {/* Experience */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[6.5px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Work Experience</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                {jobs.map((j, i) => (
                  <div key={i} className="mb-2.5">
                    <div className="flex items-start justify-between mb-0.5">
                      <p className="text-[9px] font-bold text-slate-700">{j.company}</p>
                      <span className="text-[6.5px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded-sm shrink-0">{j.date}</span>
                    </div>
                    <p className="text-[7.5px] italic text-slate-400 mb-1">{j.role}</p>
                    <div className="space-y-0.5">
                      <div className="h-[2.5px] w-full bg-slate-100 rounded-sm" />
                      <div className="h-[2.5px] w-[86%] bg-slate-100 rounded-sm" />
                      <div className="h-[2.5px] w-[68%] bg-slate-100 rounded-sm" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Education */}
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-[6.5px] font-bold uppercase tracking-widest text-slate-400 whitespace-nowrap">Education</span>
                  <div className="flex-1 h-px bg-slate-100" />
                </div>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-[9px] font-bold text-slate-700">B.S. Computer Science</p>
                    <p className="text-[7.5px] italic text-slate-400">UC Berkeley</p>
                  </div>
                  <span className="text-[7px] text-slate-300">2020</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Floating: AI Tailored badge — top right */}
      <div className="absolute -top-3 -right-4 bg-slate-900 text-white text-[11px] font-semibold px-3 py-1.5 rounded-full shadow-xl flex items-center gap-1.5">
        <Sparkles size={10} />
        Tailored by AI
      </div>

      {/* Floating: ATS score card — bottom left */}
      <div className="absolute -bottom-5 -left-5 bg-white border border-slate-200 rounded-xl px-4 py-3 shadow-[0_8px_32px_rgba(15,23,42,0.10)]">
        <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">ATS Match Score</p>
        <div className="flex items-center gap-3">
          <span className="text-[26px] font-bold text-slate-900 leading-none">94%</span>
          <div>
            <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden mb-1">
              <div className="h-full bg-slate-800 rounded-full" style={{ width: "94%" }} />
            </div>
            <p className="text-[9px] text-emerald-600 font-semibold">Excellent match</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Features list data ─────────────────────────────────────────────────────────
const FEATURES = [
  {
    label: "AI tailoring powered by AI",
    sub:   "Paste any job description — Sahan rewrites your CV to match it precisely.",
  },
  {
    label: "ATS-optimized templates",
    sub:   "Harvard Classic, Executive Navy, Modern Professional, Modern Minimalist and Many More.",
  },
  {
    label: "One master profile, unlimited resumes",
    sub:   "Build your career profile once and tailor it endlessly for every application.",
  },
  {
    label: "Cover letter generated automatically",
    sub:   "Matching style and tone, exported as a polished PDF alongside your CV.",
  },
];

// ─── How it works steps ─────────────────────────────────────────────────────────
const STEPS = [
  {
    n:    "01",
    title: "Build your master profile",
    desc:  "Enter your career history, skills, and education once. Sahan keeps it on file for every application.",
  },
  {
    n:    "02",
    title: "Paste the job description",
    desc:  "Drop in any job posting. Sahan AI reads the requirements and matches them to your profile in real time.",
  },
  {
    n:    "03",
    title: "Download your application",
    desc:  "Your tailored CV and matching cover letter are generated and ready to download as a PDF — in seconds.",
  },
];

// ─── Page ───────────────────────────────────────────────────────────────────────
export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();

  // Authenticated users skip the landing page entirely
  useEffect(() => {
    if (!isLoading && isAuthenticated) navigate("/dashboard", { replace: true });
  }, [isAuthenticated, isLoading, navigate]);

  if (isLoading) return null;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased">

      {/* ── Navigation ──────────────────────────────────────────────────── */}
      <header className="fixed top-0 inset-x-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-6 h-[60px] flex items-center justify-between">

          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <img src={sahanLogo} alt="Sahan AI" className="h-8 w-auto" />
            <span className="font-bold text-[15px] text-slate-900 tracking-tight">Sahan AI</span>
          </div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Templates"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-[13px] text-slate-500 hover:text-slate-900 transition-colors">
                {item}
              </a>
            ))}
          </nav>

          {/* Auth CTAs */}
          <div className="flex items-center gap-3">
            <Link to="/login"
              className="text-[13px] font-medium text-slate-500 hover:text-slate-900 px-3 py-1.5 transition-colors">
              Log in
            </Link>
            <Link to="/login"
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-white bg-slate-900 hover:bg-slate-700 px-4 py-2 rounded-lg transition-colors">
              Get started <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section id="features" className="pt-[60px]">
        <div className="max-w-6xl mx-auto px-6 py-24 lg:py-32">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">

            {/* Left: copy */}
            <div className="max-w-xl">

              {/* Eyebrow */}
              <motion.div {...fadeUp(0)}
                className="inline-flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-full px-3.5 py-1.5 mb-7">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span className="text-[11.5px] font-semibold text-slate-500 tracking-wide">
                  Powered by Gemini 2.5 Flash
                </span>
              </motion.div>

              {/* H1 */}
              <motion.h1 {...fadeUp(0.07)}
                className="text-[46px] lg:text-[54px] font-bold text-slate-900 leading-[1.08] tracking-tight mb-6">
                Your resume,<br />
                <span className="text-slate-400">tailored for</span><br />
                every opportunity.
              </motion.h1>

              {/* Sub-headline */}
              <motion.p {...fadeUp(0.13)}
                className="text-[17px] text-slate-500 leading-relaxed mb-9">
                Paste a job description. Sahan AI reads it, matches your career profile,
                and generates a polished CV and cover letter in seconds — ready to download as PDF.
              </motion.p>

              {/* Feature list — clean typography, no icon boxes */}
              <motion.ul {...fadeUp(0.19)} className="space-y-5 mb-10">
                {FEATURES.map((f, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 size={15} className="text-slate-400 mt-0.5 shrink-0" />
                    <div>
                      <p className="text-[13.5px] font-semibold text-slate-800 leading-snug">{f.label}</p>
                      <p className="text-[12.5px] text-slate-400 mt-0.5 leading-relaxed">{f.sub}</p>
                    </div>
                  </li>
                ))}
              </motion.ul>

              {/* CTAs */}
              <motion.div {...fadeUp(0.24)} className="flex flex-wrap items-center gap-5">
                <Link to="/login"
                  className="inline-flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-semibold text-[14px] px-6 py-3 rounded-xl transition-colors">
                  Get started free <ArrowRight size={14} />
                </Link>
                <Link to="/login"
                  className="text-[13.5px] font-medium text-slate-400 hover:text-slate-700 transition-colors">
                  Already have an account →
                </Link>
              </motion.div>

              <motion.p {...fadeUp(0.3)}
                className="text-[11.5px] text-slate-300 mt-5">
                No credit card required · Cancel anytime
              </motion.p>
            </div>

            {/* Right: mockup */}
            <motion.div
              initial={{ opacity: 0, y: 28, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.75, ease: EASE, delay: 0.14 }}
              className="hidden lg:flex justify-end pb-8 pr-4"
            >
              <div className="w-full max-w-[480px]">
                <ResumeMockup />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Social proof ────────────────────────────────────────────────── */}
      <section className="border-t border-slate-100 bg-slate-50 py-12">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-7">
            Trusted by professionals landing roles at
          </p>
          <div className="flex flex-wrap justify-center items-center gap-10">
            {["Google", "Stripe", "Airbnb", "Notion", "Linear", "Vercel"].map((co) => (
              <span key={co}
                className="text-[16px] font-semibold text-slate-300 hover:text-slate-500 transition-colors cursor-default">
                {co}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── How it works ────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-center mb-16"
        >
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">How it works</p>
          <h2 className="text-[34px] font-bold text-slate-900 tracking-tight">Three steps to your next interview.</h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {STEPS.map(({ n, title, desc }, i) => (
            <motion.div
              key={n}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.55, ease: EASE, delay: i * 0.08 }}
              className="p-7 rounded-2xl border border-slate-100 bg-white hover:border-slate-200 hover:shadow-[0_4px_24px_rgba(15,23,42,0.06)] transition-all"
            >
              <span className="font-mono text-[11px] font-bold text-slate-300 mb-4 block">{n}</span>
              <h3 className="font-bold text-[16px] text-slate-900 mb-2.5 leading-snug">{title}</h3>
              <p className="text-[13.5px] text-slate-500 leading-relaxed">{desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── Templates teaser ────────────────────────────────────────────── */}
      <section id="templates" className="border-t border-slate-100 bg-slate-50 py-20">
        <div className="max-w-6xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
          >
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Professional Templates</p>
            <h2 className="text-[32px] font-bold text-slate-900 tracking-tight mb-4">
              Four layouts. One seamless experience.
            </h2>
            <p className="text-[15px] text-slate-400 max-w-md mx-auto mb-10 leading-relaxed">
              Every template is ATS-compatible, PDF-exportable, and paired with a matching cover letter.
            </p>

            <div className="flex flex-wrap justify-center gap-3 mb-10">
              {[
                { name: "Modern Professional", badge: "⭐ Recommended" },
                { name: "Modern Minimalist",   badge: "✨ New"          },
                { name: "Executive Navy",       badge: null              },
                { name: "Harvard Classic",      badge: null              },
              ].map((t) => (
                <div key={t.name}
                  className="flex items-center gap-2 bg-white border border-slate-200 rounded-full px-4 py-2 shadow-sm">
                  <span className="text-[13px] font-medium text-slate-700">{t.name}</span>
                  {t.badge && (
                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                      {t.badge}
                    </span>
                  )}
                </div>
              ))}
            </div>

            <Link to="/login"
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-blue-600 text-white font-semibold text-[14px] px-6 py-3 rounded-xl transition-colors">
              Browse templates <ArrowRight size={14} />
            </Link>
          </motion.div>
        </div>
      </section>

      {/* ── Final CTA ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="bg-slate-900 rounded-3xl px-10 py-16 text-center"
        >
          <h2 className="text-[32px] font-bold text-white tracking-tight mb-3">
            Ready to land your next role?
          </h2>
          <p className="text-[15px] text-slate-400 mb-9 max-w-md mx-auto leading-relaxed">
            Create your free account and tailor your first resume in under a minute.
          </p>
          <Link to="/login"
            className="inline-flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-100 font-semibold text-[14.5px] px-7 py-3.5 rounded-xl transition-colors">
            Get started — it's free <ArrowRight size={15} />
          </Link>
        </motion.div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-slate-100">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <img src={sahanLogo} alt="Sahan AI" className="h-5 w-auto opacity-40" />
            <span className="font-bold text-[13px] text-slate-400">Sahan AI</span>
          </div>
          <p className="text-[11.5px] text-slate-300">
            © {new Date().getFullYear()} Sahan AI · AI-Powered Resume Tailoring
          </p>
        </div>
      </footer>
    </div>
  );
}
