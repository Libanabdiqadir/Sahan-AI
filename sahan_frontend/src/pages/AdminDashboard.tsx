import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Crown,
  FileText,
  Loader2,
  RefreshCw,
  Search,
  ShieldOff,
  ShieldCheck,
  Trash2,
  TrendingUp,
  Users,
  Wifi,
  XCircle,
  X,
} from "lucide-react";
import { adminApi } from "../services/api";
import type { AdminUser, AnalyticsData, PlanChoice } from "../types";

// ─── Motion presets ───────────────────────────────────────────────────────────
const fade = (delay = 0) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.26, delay, ease: "easeOut" as const },
});

// ─── Shared primitives ────────────────────────────────────────────────────────

function SectionHeader({ title, count }: { title: string; count?: number }) {
  return (
    <div className="flex items-baseline gap-2 mb-3">
      <h2 className="font-sans text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        {title}
      </h2>
      {count !== undefined && (
        <span className="font-sans text-[11px] text-slate-400">({count})</span>
      )}
    </div>
  );
}

function StatCard({
  label, value, icon: Icon, accent = "blue", delay = 0,
}: {
  label: string; value: number | string; icon: React.ElementType;
  accent?: "blue" | "green" | "amber" | "violet" | "slate"; delay?: number;
}) {
  const cls: Record<string, string> = {
    blue:   "bg-blue-50 text-blue-600",
    green:  "bg-emerald-50 text-emerald-600",
    amber:  "bg-amber-50 text-amber-600",
    violet: "bg-violet-50 text-violet-600",
    slate:  "bg-slate-100 text-slate-500",
  };
  return (
    <motion.div {...fade(delay)} className="bg-white rounded-xl border border-stone-200 p-5 flex items-center gap-4">
      <div className={`p-2.5 rounded-lg ${cls[accent]}`}><Icon size={18} /></div>
      <div>
        <p className="font-sans text-[11px] uppercase tracking-widest text-slate-400">{label}</p>
        <p className="font-sans text-2xl font-semibold text-slate-800 leading-tight">{value}</p>
      </div>
    </motion.div>
  );
}

function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    completed:  "bg-emerald-50 text-emerald-700",
    failed:     "bg-red-50 text-red-600",
    processing: "bg-amber-50 text-amber-700",
  };
  const Icon = status === "completed" ? CheckCircle2 : status === "failed" ? XCircle : Loader2;
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-sans font-medium ${map[status] ?? "bg-slate-100 text-slate-500"}`}>
      <Icon size={11} />{status}
    </span>
  );
}

function PlanBadge({ plan }: { plan: PlanChoice }) {
  const cls: Record<PlanChoice, string> = {
    free:  "bg-slate-100 text-slate-500",
    Pro:   "bg-blue-50 text-blue-700",
    elite: "bg-violet-50 text-violet-700",
  };
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-sans font-semibold uppercase tracking-wide ${cls[plan]}`}>
      {plan === "Pro" && <Crown size={10} />}{plan}
    </span>
  );
}

// ─── Ban toggle switch ────────────────────────────────────────────────────────
function BanToggle({
  isActive, pending, onToggle,
}: { isActive: boolean; pending: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      disabled={pending}
      title={isActive ? "Click to ban" : "Click to unban"}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 focus:outline-none disabled:opacity-40 ${isActive ? "bg-emerald-500" : "bg-red-400"}`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform duration-200 ${isActive ? "translate-x-4" : "translate-x-0"}`}
      />
    </button>
  );
}

// ─── Delete confirmation modal ────────────────────────────────────────────────
function DeleteModal({
  user, loading, onConfirm, onCancel,
}: { user: AdminUser; loading: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <motion.div
      key="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4"
      onClick={onCancel}
    >
      <motion.div
        key="modal"
        initial={{ opacity: 0, scale: 0.92, y: 16 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 16 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-2xl border border-stone-200 shadow-xl w-full max-w-sm p-6"
      >
        <div className="flex items-start gap-4 mb-5">
          <div className="p-2.5 rounded-lg bg-red-50 shrink-0">
            <AlertTriangle size={20} className="text-red-500" />
          </div>
          <div>
            <h3 className="font-sans font-semibold text-slate-900 text-[15px] mb-1">
              Delete account permanently?
            </h3>
            <p className="font-sans text-[13px] text-slate-500 leading-relaxed">
              This will delete <span className="font-semibold text-slate-700">{user.email}</span> and
              all their resumes, documents, and data. This action cannot be undone.
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 font-sans text-[13px] font-medium text-slate-600 bg-stone-100 hover:bg-stone-200 rounded-lg py-2.5 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 font-sans text-[13px] font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg py-2.5 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
            {loading ? "Deleting…" : "Delete account"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Error toast ──────────────────────────────────────────────────────────────
function ErrorToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex items-center justify-between gap-3 bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 font-sans text-[13px] mb-4"
    >
      <span>{message}</span>
      <button onClick={onDismiss}><X size={14} /></button>
    </motion.div>
  );
}

// ─── Analytics tab ────────────────────────────────────────────────────────────
function AnalyticsTab({ data }: { data: AnalyticsData }) {
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  const fmtTime = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

  return (
    <>
      {/* Traffic */}
      <motion.section {...fade(0.04)} className="mb-8">
        <SectionHeader title="Traffic — Unique Authenticated Visitors" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {([
            { label: "Today",      value: data.traffic.today,      accent: "blue"   },
            { label: "Yesterday",  value: data.traffic.yesterday,  accent: "slate"  },
            { label: "This Week",  value: data.traffic.this_week,  accent: "green"  },
            { label: "Last Week",  value: data.traffic.last_week,  accent: "slate"  },
            { label: "This Month", value: data.traffic.this_month, accent: "amber"  },
            { label: "Last Month", value: data.traffic.last_month, accent: "slate"  },
            { label: "This Year",  value: data.traffic.this_year,  accent: "violet" },
          ] as const).map(({ label, value, accent }, i) => (
            <motion.div key={label} {...fade(0.04 + i * 0.03)}
              className="bg-white rounded-xl border border-stone-200 p-4 text-center">
              <p className="font-sans text-[10px] uppercase tracking-widest text-slate-400 mb-1">{label}</p>
              <p className={`font-sans text-3xl font-bold ${accent === "slate" ? "text-slate-400" : "text-slate-800"}`}>{value}</p>
            </motion.div>
          ))}
        </div>
      </motion.section>

      {/* User KPIs */}
      <motion.section {...fade(0.1)} className="mb-8">
        <SectionHeader title="User Statistics" />
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <StatCard label="Total Users"     value={data.users.total}  icon={Users}      accent="blue"   delay={0.10} />
          <StatCard label="Online (30 min)" value={data.users.online} icon={Wifi}       accent="green"  delay={0.13} />
          <StatCard label="Free Plan"       value={data.users.free}   icon={Activity}   accent="slate"  delay={0.16} />
          <StatCard label="Pro Plan"        value={data.users.pro}    icon={Crown}      accent="amber"  delay={0.19} />
          <StatCard label="Elite Plan"      value={data.users.elite}  icon={TrendingUp} accent="violet" delay={0.22} />
        </div>
      </motion.section>

      {/* Pro users */}
      <motion.section {...fade(0.18)} className="mb-8">
        <SectionHeader title="Pro Plan Users" count={data.pro_users.length} />
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {data.pro_users.length === 0
            ? <p className="font-sans text-[13px] text-slate-400 p-6 text-center">No Pro users yet.</p>
            : (
              <table className="w-full text-left">
                <thead><tr className="border-b border-stone-100">
                  <th className="font-sans text-[11px] uppercase tracking-widest text-slate-400 px-5 py-3">Name</th>
                  <th className="font-sans text-[11px] uppercase tracking-widest text-slate-400 px-5 py-3">Email</th>
                  <th className="font-sans text-[11px] uppercase tracking-widest text-slate-400 px-5 py-3 hidden md:table-cell">Joined</th>
                </tr></thead>
                <tbody>
                  {data.pro_users.map((u, i) => (
                    <tr key={u.id} className={`border-b border-stone-50 hover:bg-stone-50 transition-colors ${i === data.pro_users.length - 1 ? "border-none" : ""}`}>
                      <td className="font-sans text-[13px] text-slate-800 px-5 py-3">
                        <span className="flex items-center gap-2">
                          <Crown size={12} className="text-amber-400 shrink-0" />
                          {[u.first_name, u.last_name].filter(Boolean).join(" ") || "—"}
                        </span>
                      </td>
                      <td className="font-sans text-[13px] text-slate-500 px-5 py-3">{u.email}</td>
                      <td className="font-sans text-[13px] text-slate-400 px-5 py-3 hidden md:table-cell">
                        <span className="flex items-center gap-1.5"><Calendar size={11} />{fmt(u.date_joined)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </motion.section>

      {/* Recent generations */}
      <motion.section {...fade(0.22)} className="mb-8">
        <SectionHeader title="Recent Resume Generations" count={data.recent_generations.length} />
        <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
          {data.recent_generations.length === 0
            ? <p className="font-sans text-[13px] text-slate-400 p-6 text-center">No generations yet.</p>
            : (
              <table className="w-full text-left">
                <thead><tr className="border-b border-stone-100">
                  <th className="font-sans text-[11px] uppercase tracking-widest text-slate-400 px-5 py-3">User</th>
                  <th className="font-sans text-[11px] uppercase tracking-widest text-slate-400 px-5 py-3 hidden sm:table-cell">Role / Company</th>
                  <th className="font-sans text-[11px] uppercase tracking-widest text-slate-400 px-5 py-3">Status</th>
                  <th className="font-sans text-[11px] uppercase tracking-widest text-slate-400 px-5 py-3 hidden lg:table-cell">When</th>
                </tr></thead>
                <tbody>
                  {data.recent_generations.map((r, i) => (
                    <tr key={i} className={`border-b border-stone-50 hover:bg-stone-50 transition-colors ${i === data.recent_generations.length - 1 ? "border-none" : ""}`}>
                      <td className="font-sans text-[13px] text-slate-700 px-5 py-3">{r.user__email}</td>
                      <td className="font-sans text-[13px] text-slate-500 px-5 py-3 hidden sm:table-cell">
                        <span className="flex items-center gap-1.5">
                          <FileText size={11} className="text-slate-300 shrink-0" />
                          {[r.job_title, r.company_name].filter(Boolean).join(" · ") || "—"}
                        </span>
                      </td>
                      <td className="px-5 py-3"><StatusPill status={r.status} /></td>
                      <td className="font-sans text-[12px] text-slate-400 px-5 py-3 hidden lg:table-cell">{fmtTime(r.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
        </div>
      </motion.section>
    </>
  );
}

// ─── User Management tab ──────────────────────────────────────────────────────
function UserManagementTab() {
  const [users, setUsers]             = useState<AdminUser[]>([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");
  const [pendingIds, setPendingIds]   = useState<Set<number>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<AdminUser | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    adminApi.listUsers()
      .then(setUsers)
      .catch(() => setActionError("Failed to load users. Please refresh."))
      .finally(() => setLoading(false));
  }, []);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const setPending = (id: number, on: boolean) =>
    setPendingIds(prev => { const s = new Set(prev); on ? s.add(id) : s.delete(id); return s; });

  const replaceUser = (updated: AdminUser) =>
    setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleToggleBan = async (user: AdminUser) => {
    if (pendingIds.has(user.id)) return;
    // Optimistic update
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, is_active: !u.is_active } : u));
    setPending(user.id, true);
    try {
      const updated = await adminApi.toggleBan(user.id);
      replaceUser(updated);
    } catch {
      // Revert on failure
      setUsers(prev => prev.map(u => u.id === user.id ? user : u));
      setActionError(`Failed to ${user.is_active ? "ban" : "unban"} ${user.email}.`);
    } finally {
      setPending(user.id, false);
    }
  };

  const handlePlanChange = async (user: AdminUser, plan: PlanChoice) => {
    if (plan === user.plan || pendingIds.has(user.id)) return;
    const prev_plan = user.plan;
    // Optimistic update
    setUsers(prev => prev.map(u => u.id === user.id ? { ...u, plan } : u));
    setPending(user.id, true);
    try {
      const updated = await adminApi.updateSubscription(user.id, plan);
      replaceUser(updated);
    } catch {
      setUsers(prev => prev.map(u => u.id === user.id ? { ...u, plan: prev_plan } : u));
      setActionError(`Failed to update plan for ${user.email}.`);
    } finally {
      setPending(user.id, false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteUser(deleteTarget.id);
      setUsers(prev => prev.filter(u => u.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch {
      setActionError(`Failed to delete ${deleteTarget.email}. Please try again.`);
      setDeleteTarget(null);
    } finally {
      setDeleteLoading(false);
    }
  };

  // ── Filtered list ──────────────────────────────────────────────────────────
  const q = search.trim().toLowerCase();
  const filtered = q
    ? users.filter(u =>
        u.email.toLowerCase().includes(q) ||
        u.first_name.toLowerCase().includes(q) ||
        u.last_name.toLowerCase().includes(q)
      )
    : users;

  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

  return (
    <motion.div {...fade(0.04)}>
      {/* Error banner */}
      <AnimatePresence>
        {actionError && (
          <ErrorToast message={actionError} onDismiss={() => setActionError(null)} />
        )}
      </AnimatePresence>

      {/* Search bar */}
      <div className="relative mb-4">
        <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
        <input
          ref={searchRef}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name or email…"
          className="w-full pl-9 pr-4 py-2.5 font-sans text-[13px] bg-white border border-stone-200 rounded-xl text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400 transition"
        />
        {search && (
          <button
            onClick={() => { setSearch(""); searchRef.current?.focus(); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* Count line */}
      <p className="font-sans text-[12px] text-slate-400 mb-3">
        {loading ? "Loading…" : `${filtered.length} of ${users.length} users`}
        {search && ` matching "${search}"`}
      </p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        {loading ? (
          <div className="divide-y divide-stone-50">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex gap-4 px-5 py-4 animate-pulse">
                <div className="h-4 bg-stone-100 rounded w-32" />
                <div className="h-4 bg-stone-100 rounded w-48" />
                <div className="h-4 bg-stone-100 rounded w-16 ml-auto" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <p className="font-sans text-[13px] text-slate-400 p-8 text-center">No users found.</p>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/60">
                <th className="font-sans text-[11px] uppercase tracking-widest text-slate-400 px-5 py-3">User</th>
                <th className="font-sans text-[11px] uppercase tracking-widest text-slate-400 px-5 py-3 hidden sm:table-cell">Joined</th>
                <th className="font-sans text-[11px] uppercase tracking-widest text-slate-400 px-5 py-3 hidden md:table-cell">Resumes</th>
                <th className="font-sans text-[11px] uppercase tracking-widest text-slate-400 px-5 py-3">Plan</th>
                <th className="font-sans text-[11px] uppercase tracking-widest text-slate-400 px-5 py-3">Active</th>
                <th className="font-sans text-[11px] uppercase tracking-widest text-slate-400 px-5 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-50">
              {filtered.map(user => {
                const isPending = pendingIds.has(user.id);
                const fullName  = [user.first_name, user.last_name].filter(Boolean).join(" ") || "—";
                return (
                  <motion.tr
                    key={user.id}
                    layout
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className={`hover:bg-stone-50/80 transition-colors ${!user.is_active ? "opacity-60" : ""}`}
                  >
                    {/* Name + email */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-400 to-violet-500 flex items-center justify-center shrink-0">
                          <span className="font-sans text-[10px] font-bold text-white">
                            {(user.first_name?.[0] ?? user.email[0]).toUpperCase()}
                          </span>
                        </div>
                        <div>
                          <p className="font-sans text-[13px] font-medium text-slate-800 leading-tight">{fullName}</p>
                          <p className="font-sans text-[11px] text-slate-400 leading-tight">{user.email}</p>
                        </div>
                        {user.is_staff && (
                          <span title="Staff account">
                            <ShieldCheck size={12} className="text-blue-400 shrink-0" />
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Joined */}
                    <td className="px-5 py-3.5 hidden sm:table-cell">
                      <span className="font-sans text-[12px] text-slate-400 flex items-center gap-1">
                        <Calendar size={11} />{fmt(user.date_joined)}
                      </span>
                    </td>

                    {/* Resume count */}
                    <td className="px-5 py-3.5 hidden md:table-cell">
                      <span className="font-sans text-[12px] text-slate-500">
                        {user.resume_count} completed
                      </span>
                    </td>

                    {/* Plan dropdown */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <PlanBadge plan={user.plan} />
                        <select
                          value={user.plan}
                          disabled={isPending}
                          onChange={e => handlePlanChange(user, e.target.value as PlanChoice)}
                          className="font-sans text-[11px] text-slate-600 bg-stone-50 border border-stone-200 rounded-lg px-1.5 py-1 cursor-pointer disabled:opacity-40 focus:outline-none focus:ring-1 focus:ring-blue-400 transition"
                        >
                          <option value="free">Free</option>
                          <option value="Pro">Pro</option>
                          <option value="elite">Elite</option>
                        </select>
                      </div>
                    </td>

                    {/* Ban toggle */}
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-2">
                        <BanToggle
                          isActive={user.is_active}
                          pending={isPending}
                          onToggle={() => handleToggleBan(user)}
                        />
                        <span className={`font-sans text-[11px] ${user.is_active ? "text-emerald-600" : "text-red-500"}`}>
                          {user.is_active
                            ? <span className="flex items-center gap-1"><ShieldCheck size={11} />Active</span>
                            : <span className="flex items-center gap-1"><ShieldOff size={11} />Banned</span>
                          }
                        </span>
                      </div>
                    </td>

                    {/* Delete */}
                    <td className="px-5 py-3.5 text-right">
                      <button
                        onClick={() => setDeleteTarget(user)}
                        disabled={isPending || user.is_staff}
                        title={user.is_staff ? "Staff accounts cannot be deleted here" : "Delete account"}
                        className="p-1.5 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            user={deleteTarget}
            loading={deleteLoading}
            onConfirm={handleDelete}
            onCancel={() => !deleteLoading && setDeleteTarget(null)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Root page ────────────────────────────────────────────────────────────────
type Tab = "analytics" | "users";

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<Tab>("analytics");
  const [analytics, setAnalytics]   = useState<AnalyticsData | null>(null);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState<string | null>(null);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  const loadAnalytics = async () => {
    setLoading(true);
    setError(null);
    try {
      setAnalytics(await adminApi.getAnalytics());
      setLastRefresh(new Date());
    } catch {
      setError("Could not load analytics. Make sure you have staff access.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadAnalytics(); }, []);

  const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "analytics", label: "Analytics",       icon: TrendingUp },
    { id: "users",     label: "User Management", icon: Users      },
  ];

  return (
    <div className="min-h-screen bg-stone-50 px-6 py-8 max-w-7xl mx-auto">

      {/* ── Page header ───────────────────────────────────────────────────── */}
      <motion.div {...fade(0)} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-slate-900">Admin Dashboard</h1>
          <p className="font-sans text-[13px] text-slate-400 mt-0.5">
            Last refreshed: {lastRefresh.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Tab switcher */}
          <div className="flex items-center bg-white border border-stone-200 rounded-xl p-1 gap-1">
            {TABS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`flex items-center gap-1.5 font-sans text-[12px] font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  activeTab === id
                    ? "bg-slate-900 text-white shadow-sm"
                    : "text-slate-500 hover:text-slate-800"
                }`}
              >
                <Icon size={12} />{label}
              </button>
            ))}
          </div>
          {activeTab === "analytics" && (
            <button
              onClick={loadAnalytics}
              disabled={loading}
              className="flex items-center gap-2 font-sans text-[13px] text-slate-500 hover:text-slate-800 border border-stone-200 bg-white rounded-xl px-3 py-2 transition-colors disabled:opacity-40"
            >
              <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          )}
        </div>
      </motion.div>

      {/* ── Global error (analytics only) ─────────────────────────────────── */}
      <AnimatePresence>
        {error && (
          <motion.div {...fade(0)}
            className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-sans text-[13px] mb-6">
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Analytics loading skeleton ─────────────────────────────────────── */}
      {activeTab === "analytics" && loading && !analytics && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl border border-stone-200 h-20 animate-pulse" />
          ))}
        </div>
      )}

      {/* ── Tab content ───────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {activeTab === "analytics" && analytics && (
          <motion.div key="analytics" {...fade(0.02)}>
            <AnalyticsTab data={analytics} />
          </motion.div>
        )}
        {activeTab === "users" && (
          <motion.div key="users" {...fade(0.02)}>
            <UserManagementTab />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
