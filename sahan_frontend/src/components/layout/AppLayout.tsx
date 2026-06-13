import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  User,
  LogOut,
  ShieldCheck,
  Menu,
  X,
  HeadphonesIcon,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import sahanLogo from "../../assets/sahan-logo.png";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard",    icon: LayoutDashboard },
  { path: "/tailor",    label: "Tailor Resume", icon: Sparkles },
  { path: "/profile",   label: "Profile",       icon: User },
  { path: "/contact",   label: "Contact",       icon: HeadphonesIcon },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const navItems = user?.is_staff
    ? [...NAV_ITEMS, { path: "/admin", label: "Admin", icon: ShieldCheck }]
    : NAV_ITEMS;
  const location  = useLocation();
  const navigate  = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const displayName =
    [user?.first_name, user?.last_name].filter(Boolean).join(" ") || "User";

  return (
    <div className="min-h-screen bg-stone-50 font-serif">
      {/* ── Top Nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200 h-[60px] flex items-center justify-between px-4 sm:px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5 min-w-0">
          <img src={sahanLogo} alt="Sahan AI" className="h-9 w-auto shrink-0" />
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map(({ path, label, icon: Icon }) => {
            const active = location.pathname === path;
            return (
              <Link
                key={path}
                to={path}
                className={`flex items-center gap-1.5 text-[13px] font-sans font-medium transition-colors ${
                  active ? "text-slate-900" : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <Icon size={14} />
                {label}
                {active && (
                  <motion.div
                    layoutId="nav-indicator"
                    className="absolute bottom-0 h-0.5 bg-blue-600"
                    style={{ width: "100%" }}
                  />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Desktop user + logout — hidden on mobile */}
        <div className="hidden md:flex items-center gap-3">
          <span className="font-sans text-[13px] text-slate-500">{displayName}</span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 font-sans text-[13px] text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>

        {/* Mobile hamburger — hidden on desktop */}
        <button
          onClick={() => setMobileOpen(o => !o)}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-stone-100 transition-colors"
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </header>

      {/* ── Mobile Drawer ────────────────────────────────────────────────── */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="mobile-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="md:hidden fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
              onClick={() => setMobileOpen(false)}
            />
            {/* Drawer panel */}
            <motion.div
              key="mobile-drawer"
              initial={{ opacity: 0, x: "100%" }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: "100%" }}
              transition={{ type: "spring", stiffness: 340, damping: 32 }}
              className="md:hidden fixed top-[60px] right-0 bottom-0 z-50 w-72 bg-white border-l border-stone-200 flex flex-col"
            >
              {/* User identity */}
              <div className="px-5 py-4 border-b border-stone-100">
                <p className="font-semibold text-[14px] text-slate-900">{displayName}</p>
                <p className="font-sans text-[12px] text-slate-400 mt-0.5">{user?.email}</p>
              </div>

              {/* Nav links */}
              <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto">
                {navItems.map(({ path, label, icon: Icon }) => {
                  const active = location.pathname === path;
                  return (
                    <Link
                      key={path}
                      to={path}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-3 px-4 py-3 rounded-xl font-sans text-[14px] font-medium transition-colors ${
                        active
                          ? "bg-blue-50 text-blue-700"
                          : "text-slate-600 hover:bg-stone-50 hover:text-slate-900"
                      }`}
                    >
                      <Icon size={17} />
                      {label}
                    </Link>
                  );
                })}
              </nav>

              {/* Sign out */}
              <div className="px-3 py-4 border-t border-stone-100">
                <button
                  onClick={() => { setMobileOpen(false); handleLogout(); }}
                  className="flex items-center gap-3 w-full px-4 py-3 rounded-xl font-sans text-[14px] font-medium text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={17} />
                  Sign out
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── Page Content ─────────────────────────────────────────────────── */}
      <motion.main
        key={location.pathname}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.22, ease: "easeOut" }}
      >
        {children}
      </motion.main>
    </div>
  );
}
