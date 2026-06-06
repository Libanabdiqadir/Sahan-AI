import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Sparkles,
  User,
  LogOut,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import sahanLogo from "../../assets/sahan_ai_logo.png";

const NAV_ITEMS = [
  { path: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { path: "/tailor", label: "Tailor Resume", icon: Sparkles },
  { path: "/profile", label: "Profile", icon: User },
];

export function AppLayout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-stone-50 font-serif">
      {/* Top Nav */}
      <header className="sticky top-0 z-50 bg-white border-b border-stone-200 h-[60px] flex items-center justify-between px-6">
        <Link to="/dashboard" className="flex items-center gap-2.5">
          <img src={sahanLogo} alt="Sahan AI" className="h-16 w-auto" />
        </Link>

        <nav className="flex items-center gap-6">
          {NAV_ITEMS.map(({ path, label, icon: Icon }) => {
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

        <div className="flex items-center gap-3">
          <span className="font-sans text-[13px] text-slate-500">
            {[user?.first_name, user?.last_name].filter(Boolean).join(" ") || "User"}
          </span>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 font-sans text-[13px] text-slate-400 hover:text-red-500 transition-colors"
          >
            <LogOut size={14} />
            Sign out
          </button>
        </div>
      </header>

      {/* Page Content */}
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