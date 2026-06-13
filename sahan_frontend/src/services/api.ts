import type {
  AdminUser,
  AnalyticsData,
  AuthTokens,
  GenerationMode,
  LoginCredentials,
  PlanChoice,
  RegisterCredentials,
  User,
  UserProfile,
  ResumeHistory,
  TailoredData,
} from "../types";

const BASE_URL: string = import.meta.env.VITE_API_URL;

// ─── Token Management ─────────────────────────────────────────────────────────
// Access token lives in memory so it is never written to localStorage and cannot
// be stolen by XSS. It is lost on page reload, but refreshAccessToken() recovers
// it silently using the refresh token (which stays in localStorage for persistence).
let _accessToken: string | null = null;

export const tokenStorage = {
  get:        ()               => _accessToken,
  getRefresh: ()               => localStorage.getItem("sahan_refresh"),
  setAccess:  (t: string)      => { _accessToken = t; },
  set: (tokens: AuthTokens) => {
    _accessToken = tokens.access;
    localStorage.setItem("sahan_refresh", tokens.refresh);
  },
  clear: () => {
    _accessToken = null;
    localStorage.removeItem("sahan_refresh");
  },
};

// ─── Profile Picture Upload (multipart — cannot use apiFetch) ────────────────
export const userApi = {
  updateProfilePicture: async (file: File): Promise<{ profile_picture: string }> => {
    const token = tokenStorage.get();
    if (!token) throw new Error("Not authenticated");
    const formData = new FormData();
    formData.append("profile_picture", file);
    const res = await fetch(`${BASE_URL}/upload-picture/`, {
      method: "PATCH",
      headers: { Authorization: `Bearer ${token}` },
      body: formData,
    });
    if (!res.ok) throw await res.json().catch(() => ({ detail: "Upload failed" }));
    return res.json();
  },
};

// ─── Error parsing ───────────────────────────────────────────────────────────
// Extracts the most relevant human-readable message from any DRF / djoser
// error shape: {detail}, {non_field_errors}, or any field-level array.
export function parseApiError(
  err: unknown,
  fallback = "Something went wrong. Please try again."
): string {
  if (!err || typeof err !== "object") return fallback;
  const e = err as Record<string, unknown>;

  // {detail: "..."} or {detail: ["..."]}
  if (typeof e.detail === "string") return e.detail;
  if (Array.isArray(e.detail) && typeof e.detail[0] === "string") return e.detail[0];

  // {non_field_errors: ["..."]}
  const nfe = e.non_field_errors;
  if (Array.isArray(nfe) && typeof nfe[0] === "string") return nfe[0];

  // Any field-level error, e.g. {email: [...], password: [...]}
  for (const value of Object.values(e)) {
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];
    if (typeof value === "string") return value;
  }

  return fallback;
}

// ─── Core Fetch Wrapper ───────────────────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  authenticated = true
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (authenticated) {
    const token = tokenStorage.get();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401 && authenticated) {
    const refreshed = await refreshAccessToken();
    if (refreshed) {
      headers["Authorization"] = `Bearer ${tokenStorage.get()}`;
      const retried = await fetch(`${BASE_URL}${path}`, { ...options, headers });
      if (!retried.ok) {
        const b = await retried.text().catch(() => "");
        let p: unknown; try { p = JSON.parse(b); } catch { p = null; }
        throw p ?? { detail: "Server error — please try again." };
      }
      const t = await retried.text().catch(() => "");
      if (!t) return undefined as T;
      try { return JSON.parse(t) as T; } catch { return undefined as T; }
    }
    tokenStorage.clear();
    window.location.href = "/login";
    throw new Error("Session expired");
  }

  if (!res.ok) {
    // Try to parse a structured JSON error; fall back to a user-friendly message
    // if the server returned HTML (e.g. a 500 debug page) or an empty body.
    const body = await res.text().catch(() => "");
    let parsed: unknown;
    try { parsed = JSON.parse(body); } catch { parsed = null; }
    throw parsed ?? { detail: "Server error — please try again." };
  }

  // Gracefully handle 204 and any 2xx with an empty or non-JSON body.
  if (res.status === 204) return undefined as T;
  const text = await res.text().catch(() => "");
  if (!text) return undefined as T;
  try { return JSON.parse(text) as T; } catch { return undefined as T; }
}

async function refreshAccessToken(): Promise<boolean> {
  const refresh = tokenStorage.getRefresh();
  if (!refresh) return false;
  try {
    const res = await fetch(`${BASE_URL}/auth/jwt/refresh/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    tokenStorage.setAccess(data.access);
    return true;
  } catch {
    return false;
  }
}

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (creds: LoginCredentials): Promise<void> => {
    const tokens = await apiFetch<AuthTokens>("/auth/jwt/create/", {
      method: "POST",
      body: JSON.stringify(creds),
    }, false);
    tokenStorage.set(tokens);
  },

  register: async (creds: RegisterCredentials): Promise<User> =>
    apiFetch<User>("/auth/users/", {
      method: "POST",
      body: JSON.stringify(creds),
    }, false),

  logout: () => tokenStorage.clear(),

  me: async (): Promise<User> => apiFetch<User>("/auth/users/me/"),

  updateName: (id: number, payload: { first_name: string; last_name: string }): Promise<User> =>
    apiFetch<User>(`/users/${id}/`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  // ── Email verification ─────────────────────────────────────────────────────
  activate: (uid: string, token: string): Promise<void> =>
    apiFetch<void>("/auth/users/activation/", {
      method: "POST",
      body: JSON.stringify({ uid, token }),
    }, false),

  resendActivation: (email: string): Promise<void> =>
    apiFetch<void>("/auth/users/resend_activation/", {
      method: "POST",
      body: JSON.stringify({ email }),
    }, false),

  // ── Google OAuth two-step flow ─────────────────────────────────────────────
  // Step 1: verify Google token. Returns JWTs for known users, or
  //         { new_user: true, email } for first-time Google sign-ins.
  googleCheck: (accessToken: string) =>
    apiFetch<
      | { access: string; refresh: string; new_user?: undefined }
      | { new_user: true; email: string; access?: undefined }
    >("/auth/google/check/", {
      method: "POST",
      body: JSON.stringify({ access_token: accessToken }),
    }, false),

  // Step 2 (new users only): create account with name + password, get JWTs.
  googleRegister: async (payload: {
    access_token: string;
    first_name: string;
    last_name: string;
    password: string;
  }): Promise<void> => {
    const tokens = await apiFetch<AuthTokens>("/auth/google/register/", {
      method: "POST",
      body: JSON.stringify(payload),
    }, false);
    tokenStorage.set(tokens);
  },
};

// ─── Profile API ──────────────────────────────────────────────────────────────
export const profileApi = {
  get: (): Promise<UserProfile> => apiFetch<UserProfile>("/profiles/me/"),
  update: (data: Partial<UserProfile>): Promise<UserProfile> =>
    apiFetch<UserProfile>("/profiles/me/", {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
};

// ─── Resume API ───────────────────────────────────────────────────────────────

/**
 * Poll a resume record until the Celery worker finishes (status leaves 'processing').
 * Throws a structured error object on failure or timeout so useTailorForm can
 * surface it the same way as any other API error.
 */
async function pollResume(
  id: number,
  intervalMs = 2500,
  timeoutMs  = 120_000,
): Promise<ResumeHistory> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, intervalMs));
    const resume = await apiFetch<ResumeHistory>(`/resumes/${id}/`);
    if (resume.status === "failed") {
      throw {
        error: resume.error_message || "AI generation failed. Please try again.",
        code:  "generation_failed",
      };
    }
    if (resume.status === "completed") return resume;
  }
  throw { error: "Generation timed out. Please try again in a moment.", code: "timeout" };
}

export const resumeApi = {
  list: (): Promise<ResumeHistory[]> => apiFetch<ResumeHistory[]>("/resumes/"),
  get:  (id: number): Promise<ResumeHistory> => apiFetch<ResumeHistory>(`/resumes/${id}/`),

  tailor: async (payload: {
    job_description: string;
    company_name?: string;
    job_title?: string;
    generation_mode?: GenerationMode;
  }): Promise<ResumeHistory> => {
    // Each click gets a fresh idempotency key so rapid double-clicks return the
    // same in-flight record instead of creating a duplicate + consuming quota.
    const idempotency_key = crypto.randomUUID();
    const result = await apiFetch<ResumeHistory>("/resumes/tailor/", {
      method: "POST",
      body: JSON.stringify({ ...payload, idempotency_key }),
    });
    // Sync path (status already 'completed'): return immediately.
    // Async path (Celery worker, status='processing'): poll until done.
    if (result.status !== "processing") return result;
    return pollResume(result.id);
  },

  delete: (id: number): Promise<void> =>
    apiFetch<void>(`/resumes/${id}/`, { method: "DELETE" }),
};

// ─── Subscription API ─────────────────────────────────────────────────────────
export const subscriptionApi = {
  getStatus: (): Promise<{ plan: string; limit: number; used: number; remaining: number; reset_date: string }> =>
    apiFetch("/subscription/status/"),
};

// ─── PDF API ──────────────────────────────────────────────────────────────────
async function downloadBlob(endpoint: string, payload: object, filename: string) {
  const token = tokenStorage.get();
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("PDF generation failed");
  const url = URL.createObjectURL(await res.blob());
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Admin / Analytics API ────────────────────────────────────────────────────
export const adminApi = {
  /** Record today's visit (idempotent — safe to call on every app mount). */
  trackVisit: (): Promise<void> =>
    apiFetch<void>('/analytics/track/', { method: 'POST' }),

  /** Fetch the full analytics payload. 404s for non-staff users. */
  getAnalytics: (): Promise<AnalyticsData> =>
    apiFetch<AnalyticsData>('/analytics/'),

  // ── User management (staff only) ────────────────────────────────────────────

  /** List every user with their subscription plan and resume count. */
  listUsers: (): Promise<AdminUser[]> =>
    apiFetch<AdminUser[]>('/admin/users/'),

  /**
   * Toggle is_active for a user.
   * Returns the updated AdminUser so the caller can replace the row in state.
   */
  toggleBan: (id: number): Promise<AdminUser> =>
    apiFetch<AdminUser>(`/admin/users/${id}/toggle_ban/`, { method: 'POST' }),

  /** Hard-delete a user account. Returns void on 204. */
  deleteUser: (id: number): Promise<void> =>
    apiFetch<void>(`/admin/users/${id}/delete/`, { method: 'DELETE' }),

  /**
   * Change a user's subscription plan.
   * Returns the updated AdminUser so the caller can replace the row in state.
   */
  updateSubscription: (id: number, plan: PlanChoice): Promise<AdminUser> =>
    apiFetch<AdminUser>(`/admin/users/${id}/update_subscription/`, {
      method: 'PATCH',
      body: JSON.stringify({ plan }),
    }),
};

export const pdfApi = {
  downloadCV: (payload: {
    profile: UserProfile;
    tailored: TailoredData;
    job_title: string;
    company_name: string;
  }) =>
    downloadBlob(
      "/generate-cv-pdf/",
      payload,
      `${payload.profile.full_name?.replace(/\s/g, "_") ?? "CV"}_CV.pdf`
    ),

  downloadCoverLetter: (payload: {
    profile: UserProfile;
    tailored: TailoredData;
    job_title: string;
    company_name: string;
  }) =>
    downloadBlob(
      "/generate-cover-letter-pdf/",
      payload,
      `${payload.profile.full_name?.replace(/\s/g, "_") ?? "Cover_Letter"}_Cover_Letter.pdf`
    ),
};
