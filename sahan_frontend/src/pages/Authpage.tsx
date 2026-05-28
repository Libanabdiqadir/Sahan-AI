import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, AlertCircle } from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import sahanLogo from "../assets/sahan_ai_logo.png";

type Mode = "login" | "register";

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-[12px] font-sans text-red-500 flex items-center gap-1">
      <AlertCircle size={11} /> {msg}
    </p>
  );
}

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fields, setFields] = useState({
    email: "",
    password: "",
    re_password: "",
    first_name: "",
    last_name: "",
  });

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const set = (k: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((f) => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (mode === "register" && fields.password !== fields.re_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      if (mode === "login") {
        await login({ email: fields.email, password: fields.password });
      } else {
        await register(fields);
      }
      navigate("/dashboard");
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      setError(
        (e.detail as string) ||
          (e.email as string[])?.[0] ||
          "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
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
        {/* Card */}
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

          {/* Error Banner */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg font-sans text-[13px] text-red-600 flex items-center gap-2"
              >
                <AlertCircle size={14} /> {error}
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
                    <label className="label-xs">First name</label>
                    <input
                      className="form-input"
                      value={fields.first_name}
                      onChange={set("first_name")}
                      placeholder="Ahmed"
                      required
                    />
                  </div>
                  <div>
                    <label className="label-xs">Last name</label>
                    <input
                      className="form-input"
                      value={fields.last_name}
                      onChange={set("last_name")}
                      placeholder="Hassan"
                      required
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <label className="label-xs mr-2">Email address</label>
              <input
                type="email"
                className="form-input"
                value={fields.email}
                onChange={set("email")}
                placeholder="you@company.com"
                required
              />
            </div>

            <div>
              <label className="label-xs mr-2">Password</label>
              <input
                type="password"
                className="form-input"
                value={fields.password}
                onChange={set("password")}
                placeholder="••••••••"
                required
                minLength={8}
              />
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
                  <input
                    type="password"
                    className="form-input"
                    value={fields.re_password}
                    onChange={set("re_password")}
                    placeholder="••••••••"
                  />
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

          <div className="mt-5 text-center font-sans text-[13px] text-slate-400">
            {mode === "login" ? (
              <>
                Don't have an account?{" "}
                <button
                  onClick={() => { setMode("register"); setError(""); }}
                  className="text-blue-600 font-medium hover:underline"
                >
                  Create one free →
                </button>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <button
                  onClick={() => { setMode("login"); setError(""); }}
                  className="text-blue-600 font-medium hover:underline"
                >
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
  );
}