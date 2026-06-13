import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle, Loader2, RefreshCw } from "lucide-react";
import { authApi } from "../services/api";
import sahanLogo from "../assets/sahan-logo.png";

type State = "loading" | "success" | "already-active" | "expired" | "invalid";

export default function VerifyEmailPage() {
  const { uid, token } = useParams<{ uid: string; token: string }>();
  const [state, setState]   = useState<State>("loading");
  const [email, setEmail]   = useState("");
  const [resendBusy, setResendBusy] = useState(false);
  const [resendSent, setResendSent] = useState(false);

  useEffect(() => {
    if (!uid || !token) { setState("invalid"); return; }

    authApi.activate(uid, token)
      .then(() => setState("success"))
      .catch((err: Record<string, unknown>) => {
        const detail = (err.detail as string) ?? "";
        const nonField = (err.non_field_errors as string[]) ?? [];
        const msg = [detail, ...nonField].join(" ").toLowerCase();

        if (msg.includes("already") || msg.includes("stale")) {
          setState("already-active");
        } else if (msg.includes("expired") || msg.includes("invalid")) {
          setState("expired");
        } else {
          setState("invalid");
        }
      });
  }, [uid, token]);

  const handleResend = async () => {
    if (!email) return;
    setResendBusy(true);
    try {
      await authApi.resendActivation(email);
      setResendSent(true);
    } catch {
      setResendSent(true);
    } finally {
      setResendBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 font-serif">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="w-full max-w-[420px]"
      >
        <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm text-center">
          <Link to="/login" className="flex justify-center mb-6">
            <img src={sahanLogo} alt="Sahan AI" className="h-10 w-auto" />
          </Link>

          {/* ── Loading ── */}
          {state === "loading" && (
            <>
              <Loader2 size={36} className="animate-spin text-blue-600 mx-auto mb-4" />
              <p className="font-sans text-[14px] text-slate-500">Verifying your email…</p>
            </>
          )}

          {/* ── Success ── */}
          {state === "success" && (
            <>
              <div className="flex items-center justify-center w-14 h-14 bg-emerald-50 rounded-full mx-auto mb-5">
                <CheckCircle2 size={28} className="text-emerald-500" />
              </div>
              <h1 className="text-[18px] font-bold text-slate-900 mb-2">Email verified!</h1>
              <p className="font-sans text-[13px] text-slate-500 mb-6">
                Your account is now active. You can sign in and start building your resume.
              </p>
              <Link
                to="/login"
                className="block w-full bg-slate-900 hover:bg-blue-600 text-white font-sans font-semibold text-[14px] py-3 rounded-xl transition-colors"
              >
                Sign in to Sahan AI →
              </Link>
            </>
          )}

          {/* ── Already active ── */}
          {state === "already-active" && (
            <>
              <div className="flex items-center justify-center w-14 h-14 bg-blue-50 rounded-full mx-auto mb-5">
                <CheckCircle2 size={28} className="text-blue-500" />
              </div>
              <h1 className="text-[18px] font-bold text-slate-900 mb-2">
                Already verified
              </h1>
              <p className="font-sans text-[13px] text-slate-500 mb-6">
                This link has already been used. Your account is active — just sign in.
              </p>
              <Link
                to="/login"
                className="block w-full bg-slate-900 hover:bg-blue-600 text-white font-sans font-semibold text-[14px] py-3 rounded-xl transition-colors"
              >
                Sign in →
              </Link>
            </>
          )}

          {/* ── Expired / Invalid ── */}
          {(state === "expired" || state === "invalid") && (
            <>
              <div className="flex items-center justify-center w-14 h-14 bg-red-50 rounded-full mx-auto mb-5">
                <XCircle size={28} className="text-red-400" />
              </div>
              <h1 className="text-[18px] font-bold text-slate-900 mb-2">
                {state === "expired" ? "Link expired" : "Invalid link"}
              </h1>
              <p className="font-sans text-[13px] text-slate-500 mb-5">
                {state === "expired"
                  ? "Verification links expire after 24 hours. Enter your email to get a new one."
                  : "This link is not valid. It may have already been used or been corrupted."}
              </p>

              {!resendSent ? (
                <div className="space-y-2">
                  <input
                    type="email"
                    className="form-input"
                    placeholder="your@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                  <button
                    onClick={handleResend}
                    disabled={resendBusy || !email}
                    className="w-full border border-stone-200 hover:border-stone-300 hover:bg-stone-50 disabled:opacity-60 text-slate-700 font-sans font-semibold text-[13px] py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                  >
                    {resendBusy
                      ? <Loader2 size={13} className="animate-spin" />
                      : <RefreshCw size={13} />
                    }
                    Send new verification email
                  </button>
                </div>
              ) : (
                <p className="font-sans text-[13px] text-emerald-600 flex items-center justify-center gap-1.5 mb-4">
                  <CheckCircle2 size={14} /> New verification email sent — check your inbox.
                </p>
              )}

              <Link
                to="/login"
                className="block mt-3 font-sans text-[12px] text-slate-400 hover:text-blue-600 transition-colors"
              >
                Back to sign in
              </Link>
            </>
          )}
        </div>

        <p className="text-center font-sans text-[11px] text-slate-300 mt-4">
          AI-Powered Resume Builder · Sahan AI © 2026
        </p>
      </motion.div>
    </div>
  );
}
