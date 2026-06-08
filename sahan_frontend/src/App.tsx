import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { AppLayout } from "./components/layout/AppLayout";
import AuthPage from "./pages/Authpage";
import DashboardPage from "./pages/DashboardPage";
import TailorPage from "./pages/TailorPage";
import ProfilePage from "./pages/ProfilePage";
import LandingPage from "./pages/LandingPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import AdminDashboard from "./pages/AdminDashboard";

const Spinner = () => (
  <div className="min-h-screen flex items-center justify-center bg-stone-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-2 border-stone-200 border-t-blue-600 rounded-full animate-spin" />
      <p className="font-sans text-[13px] text-slate-400">Loading Sahan AI...</p>
    </div>
  </div>
);

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <Spinner />;
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
}

/** Same as ProtectedRoute but also requires is_staff.
 *  Redirects non-staff authenticated users to /dashboard (not /login). */
function StaffRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  if (isLoading) return <Spinner />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!user?.is_staff) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}

function AppRoutes() {
  return (
    <AnimatePresence mode="wait">
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <AppLayout>
                <DashboardPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/tailor"
          element={
            <ProtectedRoute>
              <AppLayout>
                <TailorPage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <AppLayout>
                <ProfilePage />
              </AppLayout>
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <StaffRoute>
              <AppLayout>
                <AdminDashboard />
              </AppLayout>
            </StaffRoute>
          }
        />
        <Route path="/verify-email/:uid/:token" element={<VerifyEmailPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}