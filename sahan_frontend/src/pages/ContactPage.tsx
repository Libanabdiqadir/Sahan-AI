import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { motion, useInView } from "framer-motion";
import {
  Phone, Mail, MessageCircle, Globe, ArrowRight,
  Send, CheckCircle2, AlertCircle, ArrowLeft,
} from "lucide-react";
import sahanLogo from "../assets/sahan-logo.png";


// create a form for sahancv.ai@gmail.com, then replace this ID.
const FORMSPREE_ENDPOINT = "https://formspree.io/f/xpwzgboy";

// ─── Animation helpers ────────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as const;

const fadeUp = (delay = 0, y = 20) => ({
  initial:    { opacity: 0, y },
  animate:    { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: EASE, delay },
});

const stagger = {
  animate: { transition: { staggerChildren: 0.1 } },
};

const cardVariant = {
  initial:    { opacity: 0, y: 24, scale: 0.97 },
  animate:    { opacity: 1, y: 0,  scale: 1    },
  transition: { duration: 0.55, ease: EASE },
};

// ─── Floating ambient blob ────────────────────────────────────────────────────
function Blob({ className }: { className: string }) {
  return (
    <motion.div
      className={`absolute rounded-full pointer-events-none ${className}`}
      animate={{ scale: [1, 1.15, 1], opacity: [0.35, 0.6, 0.35] }}
      transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
    />
  );
}

// ─── Individual contact method card ──────────────────────────────────────────
interface ContactCardProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  color: string;
  bgColor: string;
  borderColor: string;
  delay?: number;
}

function ContactCard({
  icon, label, value, href, color, bgColor, borderColor, delay = 0,
}: ContactCardProps) {
  return (
    <motion.a
      href={href}
      target={href.startsWith("http") ? "_blank" : undefined}
      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
      variants={cardVariant}
      whileHover={{ y: -4, scale: 1.02 }}
      whileTap={{ scale: 0.97 }}
      transition={{ type: "spring", stiffness: 380, damping: 22 }}
      className={`group flex items-center gap-4 p-5 rounded-2xl border bg-white cursor-pointer transition-shadow hover:shadow-[0_8px_32px_rgba(15,23,42,0.10)] ${borderColor}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-colors ${bgColor} group-hover:scale-110 transition-transform duration-200`}>
        <div className={color}>{icon}</div>
      </div>
      <div className="min-w-0">
        <p className="font-sans text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">{label}</p>
        <p className={`font-semibold text-[14px] ${color} truncate`}>{value}</p>
      </div>
      <ArrowRight size={14} className="ml-auto text-slate-200 group-hover:text-slate-400 transition-colors shrink-0" />
    </motion.a>
  );
}

// ─── Contact form ─────────────────────────────────────────────────────────────
type FormStatus = "idle" | "loading" | "success" | "error";

function ContactForm() {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [fields, setFields] = useState({ name: "", email: "", message: "" });
  const formRef = useRef<HTMLFormElement>(null);

  const set = (k: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setFields(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(FORMSPREE_ENDPOINT, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(fields),
      });
      if (res.ok) {
        setStatus("success");
        setFields({ name: "", email: "", message: "" });
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  };

  const inputCls =
    "w-full bg-stone-50 border border-stone-200 rounded-xl px-4 py-3 font-sans text-[14px] text-slate-800 placeholder-slate-300 focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all";

  return (
    <motion.div
      {...fadeUp(0.2)}
      className="bg-white rounded-3xl border border-stone-200 p-6 sm:p-8 shadow-[0_4px_40px_rgba(15,23,42,0.07)]"
    >
      <div className="mb-6">
        <h3 className="font-bold text-[20px] text-slate-900 tracking-tight mb-1">Send us a message</h3>
        <p className="font-sans text-[13px] text-slate-400">We'll reply within one business day.</p>
      </div>

      {status === "success" ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center justify-center gap-4 py-12 text-center"
        >
          <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-emerald-500" />
          </div>
          <div>
            <p className="font-bold text-[17px] text-slate-900 mb-1">Message sent!</p>
            <p className="font-sans text-[13px] text-slate-400">Thanks for reaching out. We'll get back to you soon.</p>
          </div>
          <button
            onClick={() => setStatus("idle")}
            className="mt-2 font-sans text-[13px] font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            Send another message
          </button>
        </motion.div>
      ) : (
        <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="font-sans text-[12px] font-semibold text-slate-500 block mb-1.5">Your name</label>
            <input
              type="text"
              name="name"
              required
              value={fields.name}
              onChange={set("name")}
              placeholder="Ahmed Abdirahman"
              className={inputCls}
            />
          </div>
          <div>
            <label className="font-sans text-[12px] font-semibold text-slate-500 block mb-1.5">Email address</label>
            <input
              type="email"
              name="email"
              required
              value={fields.email}
              onChange={set("email")}
              placeholder="ahmed@example.com"
              className={inputCls}
            />
          </div>
          <div>
            <label className="font-sans text-[12px] font-semibold text-slate-500 block mb-1.5">Message</label>
            <textarea
              name="message"
              required
              rows={5}
              value={fields.message}
              onChange={set("message")}
              placeholder="Tell us how we can help you..."
              className={`${inputCls} resize-none`}
            />
          </div>

          {status === "error" && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center gap-2 font-sans text-[13px] text-red-600 bg-red-50 border border-red-200 px-4 py-3 rounded-xl"
            >
              <AlertCircle size={14} /> Something went wrong? please try again or email us directly.
            </motion.div>
          )}

          <motion.button
            type="submit"
            disabled={status === "loading"}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-blue-600 disabled:opacity-60 text-white font-sans font-bold text-[14px] py-3.5 rounded-xl transition-colors"
          >
            {status === "loading" ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sending…
              </>
            ) : (
              <>
                <Send size={15} /> Send Message
              </>
            )}
          </motion.button>

          <p className="text-center font-sans text-[11px] text-slate-300">
            We respond within 1 business day · All messages are private
          </p>
        </form>
      )}
    </motion.div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function ContactPage() {
  const heroRef = useRef(null);
  const inView  = useInView(heroRef, { once: true });

  const CONTACT_ITEMS: ContactCardProps[] = [
    {
      icon:        <Globe size={20} />,
      label:       "Website",
      value:       "sahancv.com",
      href:        "https://sahancv.com",
      color:       "text-blue-600",
      bgColor:     "bg-blue-50",
      borderColor: "border-blue-100 hover:border-blue-300",
    },
    {
      icon:        <Phone size={20} />,
      label:       "Phone",
      value:       "0634081104",
      href:        "tel:+252634081104",
      color:       "text-slate-700",
      bgColor:     "bg-slate-100",
      borderColor: "border-stone-200 hover:border-slate-300",
    },
    {
      icon:        <MessageCircle size={20} />,
      label:       "WhatsApp",
      value:       "+252 634 081 104",
      href:        "https://wa.me/252634081104",
      color:       "text-emerald-600",
      bgColor:     "bg-emerald-50",
      borderColor: "border-emerald-100 hover:border-emerald-300",
    },
    {
      icon:        <Mail size={20} />,
      label:       "Email",
      value:       "sahancv.ai@gmail.com",
      href:        "mailto:sahancv.ai@gmail.com",
      color:       "text-violet-600",
      bgColor:     "bg-violet-50",
      borderColor: "border-violet-100 hover:border-violet-300",
    },
  ];

  return (
    <div className="min-h-screen bg-white font-sans text-slate-900 antialiased overflow-x-hidden">

      {/* ── Minimal top bar (standalone page — no AppLayout wrapper) ───── */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-[60px] flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <img src={sahanLogo} alt="Sahan AI" className="h-8 w-auto" />
            <span className="font-bold text-[15px] text-slate-900 tracking-tight">Sahan AI</span>
          </Link>
          <Link
            to="/"
            className="flex items-center gap-1.5 font-sans text-[13px] font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={14} /> Back to home
          </Link>
        </div>
      </header>

      {/* ── Hero ────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 overflow-hidden"
      >
        {/* Ambient blobs */}
        <Blob className="w-[480px] h-[480px] bg-blue-500/10 -top-40 -left-32" />
        <Blob className="w-[360px] h-[360px] bg-violet-500/10 bottom-0 right-0" />
        <Blob className="w-[200px] h-[200px] bg-emerald-400/10 top-1/2 left-1/2" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-28 text-center">
          <motion.div
            animate={inView ? "animate" : "initial"}
            variants={stagger}
          >
            <motion.div
              variants={cardVariant}
              className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6"
            >
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span className="font-sans text-[12px] font-semibold text-white/70 tracking-wide">
                We're here to help
              </span>
            </motion.div>

            <motion.h1
              variants={cardVariant}
              className="text-[32px] sm:text-[44px] md:text-[54px] font-bold text-white leading-[1.08] tracking-tight mb-5"
            >
              Get in touch<br />
              <span className="text-blue-300">with our team</span>
            </motion.h1>

            <motion.p
              variants={cardVariant}
              className="font-sans text-[15px] sm:text-[17px] text-blue-200/70 max-w-lg mx-auto leading-relaxed"
            >
              Questions about your subscription, resume generation, or anything else?
              Reach out. we respond fast.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ── Main content ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-start">

          {/* ── Left: contact info ──────────────────────────────────────── */}
          <div>
            <motion.div {...fadeUp(0)} className="mb-8">
              <p className="font-sans text-[11px] font-bold text-blue-600 uppercase tracking-widest mb-2">
                Contact information
              </p>
              <h2 className="text-[24px] sm:text-[28px] font-bold text-slate-900 tracking-tight mb-3">
                Multiple ways to reach us
              </h2>
              <p className="font-sans text-[14px] text-slate-500 leading-relaxed">
                Whether you prefer email, phone, or a quick WhatsApp message. we're available and happy to help.
              </p>
            </motion.div>

            <motion.div
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: "-40px" }}
              variants={stagger}
              className="space-y-3"
            >
              {CONTACT_ITEMS.map((item, i) => (
                <ContactCard key={item.label} {...item} delay={i * 60} />
              ))}
            </motion.div>

            {/* WhatsApp CTA highlight */}
            <motion.a
              {...fadeUp(0.4)}
              href="https://wa.me/252634081104?text=Hi%2C%20I%20have%20a%20question%20about%20Sahan%20AI"
              target="_blank"
              rel="noopener noreferrer"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              className="mt-6 flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#1fba58] text-white font-bold text-[14px] transition-colors shadow-[0_4px_20px_rgba(37,211,102,0.3)] hover:shadow-[0_6px_28px_rgba(37,211,102,0.45)]"
            >
              <MessageCircle size={18} />
              Chat with us on WhatsApp
            </motion.a>

            {/* Response time note */}
            <motion.div
              {...fadeUp(0.5)}
              className="mt-6 flex items-start gap-3 bg-slate-50 border border-slate-100 rounded-2xl px-5 py-4"
            >
              <div className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0 animate-pulse" />
              <div>
                <p className="font-semibold text-[13px] text-slate-900">Typical response time: under 24 hours</p>
                <p className="font-sans text-[12px] text-slate-400 mt-0.5">
                  For urgent help, WhatsApp is fastest. We monitor it daily including weekends.
                </p>
              </div>
            </motion.div>
          </div>

          {/* ── Right: contact form ──────────────────────────────────────── */}
          <div>
            <ContactForm />
          </div>
        </div>
      </section>

      {/* ── Office / brand footer strip ──────────────────────────────────── */}
      <section className="border-t border-slate-100 bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, ease: EASE }}
            className="flex flex-col sm:flex-row items-center justify-between gap-6"
          >
            <div className="flex items-center gap-3">
              <img src={sahanLogo} alt="Sahan AI" className="h-7 w-auto opacity-60" />
              <div>
                <p className="font-bold text-[14px] text-slate-700">Sahan AI</p>
                <p className="font-sans text-[12px] text-slate-400">AI-powered resume tailoring</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-4 justify-center sm:justify-end">
              <Link to="/" className="font-sans text-[13px] text-slate-400 hover:text-slate-700 transition-colors">Home</Link>
              <Link to="/login" className="font-sans text-[13px] text-slate-400 hover:text-slate-700 transition-colors">Sign in</Link>
              <a href="mailto:sahancv.ai@gmail.com" className="font-sans text-[13px] text-slate-400 hover:text-slate-700 transition-colors">sahancv.ai@gmail.com</a>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
