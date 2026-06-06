import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, Loader2, Lock, X } from "lucide-react";
import { authApi, parseApiError } from "../../services/api";
import type { AuthTokens } from "../../types";

interface Props {
  email: string;
  googleAccessToken: string;
  onSuccess: (tokens: AuthTokens) => void;
  onClose: () => void;
}

function FieldError({ msg }: { msg?: string }) {
  if (!msg) return null;
  return (
    <p className="mt-1 text-[12px] font-sans text-red-500 flex items-center gap-1">
      <AlertCircle size={11} /> {msg}
    </p>
  );
}

export function GoogleRegisterModal({ email, googleAccessToken, onSuccess, onClose }: Props) {
  const [fields, setFields] = useState({
    first_name: "",
    last_name:  "",
    password:   "",
    re_password:"",
  });
  const [error,   setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof fields) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      setFields(f => ({ ...f, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (fields.password !== fields.re_password) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authApi.googleRegister({
        access_token: googleAccessToken,
        first_name:   fields.first_name,
        last_name:    fields.last_name,
        password:     fields.password,
      });
      // Collect the tokens that googleRegister stored and hand them up.
      // We import tokenStorage here just to read what was just written.
      const { tokenStorage } = await import("../../services/api");
      const access  = tokenStorage.get()    ?? "";
      const refresh = tokenStorage.getRefresh() ?? "";
      onSuccess({ access, refresh });
    } catch (err: unknown) {
      setError(parseApiError(err, "Registration failed. Please try again."));
    } finally {
      setLoading(false);
    }
  };

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1,    y: 0  }}
          exit={   { opacity: 0, scale: 0.95, y: 12 }}
          transition={{ duration: 0.22, ease: "easeOut" }}
          className="w-full max-w-[420px] bg-white border border-stone-200 rounded-2xl shadow-xl font-serif"
        >
          {/* Header */}
          <div className="flex items-start justify-between px-8 pt-7 pb-0">
            <div>
              <h2 className="text-[17px] font-bold text-slate-900 tracking-tight">
                Complete your account
              </h2>
              <p className="font-sans text-[13px] text-slate-400 mt-0.5">
                Add your name and choose a password to finish signing up.
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-slate-300 hover:text-slate-500 transition-colors mt-0.5"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>

          <div className="px-8 pt-5 pb-7">
            {/* Pre-filled email (read-only) */}
            <div className="mb-4">
              <label className="label-xs mr-2">Email address</label>
              <div className="relative">
                <input
                  type="email"
                  readOnly
                  value={email}
                  className="form-input pr-9 bg-stone-50 text-slate-400 cursor-not-allowed"
                />
                <Lock
                  size={13}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300"
                />
              </div>
              <p className="mt-1 font-sans text-[11px] text-slate-400">
                Verified by Google — cannot be changed.
              </p>
            </div>

            {/* Error banner */}
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={   { opacity: 0, height: 0 }}
                  className="mb-4 px-4 py-3 bg-red-50 border border-red-200 rounded-lg font-sans text-[13px] text-red-600 flex items-center gap-2"
                >
                  <AlertCircle size={14} /> {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name row */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs mr-2">First name</label>
                  <input
                    className="form-input"
                    value={fields.first_name}
                    onChange={set("first_name")}
                    placeholder="Ahmed"
                    required
                  />
                </div>
                <div>
                  <label className="label-xs mr-2">Last name</label>
                  <input
                    className="form-input"
                    value={fields.last_name}
                    onChange={set("last_name")}
                    placeholder="Hassan"
                    required
                  />
                </div>
              </div>

              {/* Password */}
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
                <FieldError msg={fields.password.length > 0 && fields.password.length < 8 ? "Minimum 8 characters" : undefined} />
              </div>

              {/* Confirm password */}
              <div>
                <label className="label-xs mr-2">Confirm password</label>
                <input
                  type="password"
                  className="form-input"
                  value={fields.re_password}
                  onChange={set("re_password")}
                  placeholder="••••••••"
                  required
                />
                <FieldError
                  msg={
                    fields.re_password.length > 0 && fields.password !== fields.re_password
                      ? "Passwords do not match"
                      : undefined
                  }
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-slate-900 hover:bg-blue-600 disabled:opacity-60 text-white font-sans font-semibold text-[14px] py-3 rounded-xl transition-colors flex items-center justify-center gap-2 mt-2"
              >
                {loading && <Loader2 size={15} className="animate-spin" />}
                Create account →
              </button>
            </form>
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
