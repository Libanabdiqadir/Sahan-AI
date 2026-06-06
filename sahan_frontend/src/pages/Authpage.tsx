import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle, Mail, CheckCircle2, RefreshCw } from "lucide-react";
import { useGoogleLogin } from "@react-oauth/google";
import { useAuth } from "../hooks/useAuth";
import { authApi, parseApiError } from "../services/api";
import { GoogleRegisterModal } from "../components/auth/GoogleRegisterModal";
import type { AuthTokens } from "../types";
import sahanLogo from "../assets/sahan_ai_logo.png";

type Mode = "login" | "register" | "verify-pending";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-[12px] font-sans text-red-500 flex items-center gap-1">
      <AlertCircle size={11} /> {msg}
    </p>
  );
}

export default function AuthPage() {
  const [mode, setMode]       = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  // Set to true after a failed login so the user can try resending verification.
  const [showResend,  setShowResend]  = useState(false);
  const [resendSent,  setResendSent]  = useState(false);
  const [resendBusy,  setResendBusy]  = useState(false);
  const [pendingEmail, setPendingEmail] = useState("");

  const [fields, setFields] = useState({
    email: "", password: "", re_password: "", first_name: "", last_name: "",
  });

  const { login, register, loginWithTokens } = useAuth();
  const navigate = useNavigate();

  const [googlePending, setGooglePending] = useState<{
    email: string; accessToken: string;
  } | null>(null);

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields(f => ({ ...f, [k]: e.target.value }));

  // ── Google OAuth ───────────────────────────────────────────────────────────
  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      setLoading(true);
      setError("");
      try {
        const result = await authApi.googleCheck(tokenResponse.access_token);
        if (result.new_user) {
          setGooglePending({ email: result.email, accessToken: tokenResponse.access_token });
        } else {
          const { access, refresh } = result as { access: string; refresh: string };
          await loginWithTokens({ access, refresh });
          navigate("/dashboard");
        }
      } catch {
        setError("Google sign-in failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    onError: () => setError("Google sign-in was cancelled or closed. Please try again."),
  });

  const handleGoogleRegisterSuccess = async (tokens: AuthTokens) => {
    setGooglePending(null);
    await loginWithTokens(tokens);
    navigate("/dashboard");
  };

  // ── Email / password form ──────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setShowResend(false);

    if (mode === "register" && fields.password !== fields.re_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email: fields.email, password: fields.password });
        navigate("/dashboard");
      } else {
        console.log("[AuthPage] registration payload →", {
          email: fields.email,
          first_name: fields.first_name,
          last_name: fields.last_name,
          password: fields.password ? "***" : "(empty)",
          re_password: fields.re_password ? "***" : "(empty)",
        });
        await register(fields);
        // Registration succeeded — account is inactive until email is verified.
        setPendingEmail(fields.email);
        setMode("verify-pending");
      }
    } catch (err: unknown) {
      setError(parseApiError(err));
      if (mode === "login") setShowResend(true);
    } finally {
      setLoading(false);
    }
  };

  // ── Resend verification email ──────────────────────────────────────────────
  const handleResend = async () => {
    const email = fields.email || pendingEmail;
    if (!email) return;
    setResendBusy(true);
    setResendSent(false);
    try {
      await authApi.resendActivation(email);
      setResendSent(true);
    } catch {
      // djoser returns 400 if the user is already active — treat that gracefully.
      setResendSent(true);
    } finally {
      setResendBusy(false);
    }
  };

  // ── "Check your email" screen ──────────────────────────────────────────────
  if (mode === "verify-pending") {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 font-serif">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-[420px]"
        >
          <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm text-center">
            <div className="flex items-center justify-center w-14 h-14 bg-blue-50 rounded-full mx-auto mb-5">
              <Mail size={26} className="text-blue-600" />
            </div>
            <h1 className="text-[18px] font-bold text-slate-900 tracking-tight mb-2">
              Check your inbox
            </h1>
            <p className="font-sans text-[13px] text-slate-500 leading-relaxed">
              We've sent a verification link to{" "}
              <span className="font-semibold text-slate-700">{pendingEmail}</span>.
              Click the link to activate your account.
            </p>
            <p className="font-sans text-[12px] text-slate-400 mt-2">
              Can't find it? Check your spam folder.
            </p>

            <div className="mt-6 space-y-3">
              {resendSent ? (
                <p className="font-sans text-[13px] text-emerald-600 flex items-center justify-center gap-1.5">
                  <CheckCircle2 size={14} /> Verification email resent!
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  disabled={resendBusy}
                  className="w-full border border-stone-200 hover:border-stone-300 hover:bg-stone-50 disabled:opacity-60 text-slate-700 font-sans font-semibold text-[13px] py-2.5 rounded-xl transition-colors flex items-center justify-center gap-2"
                >
                  {resendBusy
                    ? <Loader2 size={13} className="animate-spin" />
                    : <RefreshCw size={13} />
                  }
                  Resend verification email
                </button>
              )}

              <button
                onClick={() => { setMode("login"); setError(""); }}
                className="w-full font-sans text-[13px] text-slate-400 hover:text-blue-600 transition-colors py-1"
              >
                Back to sign in
              </button>
            </div>
          </div>

          <p className="text-center font-sans text-[11px] text-slate-300 mt-4">
            AI-Powered Resume Builder · Sahan AI © 2026
          </p>
        </motion.div>
      </div>
    );
  }

  // ── Login / Register screen ────────────────────────────────────────────────
  return (
    <>
      {googlePending && (
        <GoogleRegisterModal
          email={googlePending.email}
          googleAccessToken={googlePending.accessToken}
          onSuccess={handleGoogleRegisterSuccess}
          onClose={() => setGooglePending(null)}
        />
      )}
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 font-serif">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="w-full max-w-[420px]"
        >
          <div className="bg-white border border-stone-200 rounded-2xl p-8 shadow-sm">
            {/* Logo */}
            <div className="flex flex-col items-center mb-6">
              <img src={sahanLogo} alt="Sahan AI" className="h-12 w-auto mb-3" />
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {mode === "login" ? "Welcome back" : "Create your account"}
              </h1>
              <p className="font-sans text-[13px] text-slate-400 mt-1">
                {mode === "login"
                  ? "Sign in to your Sahan AI account"
                  : "Start building tailored resumes for free"}
              </p>
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-4 space-y-2"
                >
                  <div className="px-4 py-3 bg-red-50 border border-red-200 rounded-lg font-sans text-[13px] text-red-600 flex items-center gap-2">
                    <AlertCircle size={14} /> {error}
                  </div>
                  {/* Offer resend after login failure in case the account is unverified */}
                  {showResend && !resendSent && (
                    <button
                      onClick={handleResend}
                      disabled={resendBusy}
                      className="w-full font-sans text-[12px] text-slate-500 hover:text-blue-600 transition-colors flex items-center justify-center gap-1.5 py-1"
                    >
                      {resendBusy
                        ? <Loader2 size={12} className="animate-spin" />
                        : <RefreshCw size={12} />
                      }
                      Just registered? Resend verification email
                    </button>
                  )}
                  {showResend && resendSent && (
                    <p className="font-sans text-[12px] text-emerald-600 flex items-center justify-center gap-1.5">
                      <CheckCircle2 size={12} /> Verification email sent — check your inbox.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Register extra fields */}
              <AnimatePresence>
                {mode === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-2 gap-3 overflow-hidden"
                  >
                    <div>
                      <label className="label-xs mr-2">First name</label>
                      <input className="form-input" value={fields.first_name}
                        onChange={set("first_name")} placeholder="Ahmed" required />
                    </div>
                    <div>
                      <label className="label-xs mr-2">Last name</label>
                      <input className="form-input" value={fields.last_name}
                        onChange={set("last_name")} placeholder="Hassan" required />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div>
                <label className="label-xs mr-2">Email address</label>
                <input type="email" className="form-input" value={fields.email}
                  onChange={set("email")} placeholder="you@company.com" required />
              </div>

              <div>
                <label className="label-xs mr-2">Password</label>
                <input type="password" className="form-input" value={fields.password}
                  onChange={set("password")} placeholder="••••••••" required minLength={8} />
              </div>

              <AnimatePresence>
                {mode === "register" && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <label className="label-xs mr-2">Confirm password</label>
                    <input type="password" className="form-input" value={fields.re_password}
                      onChange={set("re_password")} placeholder="••••••••" />
                    <FieldError msg={
                      fields.re_password.length > 0 && fields.password !== fields.re_password
                        ? "Passwords do not match" : undefined
                    } />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-blue-600 disabled:opacity-60 text-white font-sans font-semibold text-[14px] py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                {mode === "login" ? "Sign in to Sahan AI →" : "Create free account →"}
              </button>
            </form>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-stone-200" />
              <span className="font-sans text-[12px] text-slate-400">or</span>
              <div className="flex-1 h-px bg-stone-200" />
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => handleGoogleLogin()}
              className="w-full border border-stone-200 hover:border-stone-300 hover:bg-stone-50 disabled:opacity-60 text-slate-700 font-sans font-semibold text-[14px] py-3 rounded-xl transition-colors flex items-center justify-center gap-3"
            >
              <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
                <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z" fill="#4285F4"/>
                <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z" fill="#34A853"/>
                <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332Z" fill="#FBBC05"/>
                <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.166 6.656 3.58 9 3.58Z" fill="#EA4335"/>
              </svg>
              {mode === "login" ? "Sign in with Google" : "Sign up with Google"}
            </button>

            <div className="mt-5 text-center font-sans text-[13px] text-slate-400">
              {mode === "login" ? (
                <>
                  Don't have an account?{" "}
                  <button onClick={() => { setMode("register"); setError(""); setShowResend(false); }}
                    className="text-blue-600 font-medium hover:underline">
                    Create one free →
                  </button>
                </>
              ) : (
                <>
                  Already have an account?{" "}
                  <button onClick={() => { setMode("login"); setError(""); setShowResend(false); }}
                    className="text-blue-600 font-medium hover:underline">
                    Sign in →
                  </button>
                </>
              )}
            </div>
          </div>

          <p className="text-center font-sans text-[11px] text-slate-300 mt-4">
            AI-Powered Resume Builder · Sahan AI © 2026
          </p>
        </motion.div>
      </div>
    </>
  );
}
