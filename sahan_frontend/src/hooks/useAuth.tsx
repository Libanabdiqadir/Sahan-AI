import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { adminApi, authApi, tokenStorage } from "../services/api";
import type { AuthTokens, User, LoginCredentials, RegisterCredentials } from "../types";

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login:          (creds: LoginCredentials)    => Promise<void>;
  register:       (creds: RegisterCredentials) => Promise<void>;
  loginWithTokens:(tokens: AuthTokens)         => Promise<void>;
  updateUser:     (payload: { first_name: string; last_name: string }) => Promise<void>;
  logout:         ()                           => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user:            null,
    isLoading:       true,
    isAuthenticated: false,
  });

  const fetchUser = useCallback(async () => {
    // If neither an in-memory access token nor a stored refresh token exists,
    // the user is definitely not authenticated — skip the network round-trip.
    if (!tokenStorage.get() && !tokenStorage.getRefresh()) {
      setState({ user: null, isLoading: false, isAuthenticated: false });
      return;
    }
    // apiFetch handles the 401 → refresh flow automatically, so we just call me().
    try {
      const user = await authApi.me();
      console.log("[useAuth.fetchUser] storing in state →", { first_name: user.first_name, last_name: user.last_name });
      setState({ user, isLoading: false, isAuthenticated: true });
      // Fire-and-forget: record today's unique visit, ignore failures silently
      adminApi.trackVisit().catch(() => {});
    } catch {
      tokenStorage.clear();
      setState({ user: null, isLoading: false, isAuthenticated: false });
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const login = async (creds: LoginCredentials) => {
    await authApi.login(creds);
    await fetchUser();
  };

  const register = async (creds: RegisterCredentials): Promise<void> => {
    console.log("[useAuth.register] creds passed to API →", { ...creds, password: "***", re_password: "***" });
    await authApi.register(creds);
    // Do NOT auto-login — the account is inactive until the user clicks the
    // verification link in their email. The caller shows the "check inbox" UI.
  };

  const updateUser = async (payload: { first_name: string; last_name: string }) => {
    if (!state.user) return;
    await authApi.updateName(state.user.id, payload);
    await fetchUser();
  };

  // Used by the Google OAuth flow after tokens are already stored in tokenStorage.
  const loginWithTokens = async (tokens: AuthTokens) => {
    tokenStorage.set(tokens);
    await fetchUser();
  };

  const logout = () => {
    authApi.logout();
    setState({ user: null, isLoading: false, isAuthenticated: false });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, register, loginWithTokens, updateUser, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
