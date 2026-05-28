import type {
  AuthTokens,
  LoginCredentials,
  RegisterCredentials,
  User,
  UserProfile,
  ResumeHistory,
} from "../types";

const BASE_URL = `${import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000'}`;

// ─── Token Management ─────────────────────────────────────────────────────────
export const tokenStorage = {
  get: () => localStorage.getItem("sahan_access"),
  getRefresh: () => localStorage.getItem("sahan_refresh"),
  set: (tokens: AuthTokens) => {
    localStorage.setItem("sahan_access", tokens.access);
    localStorage.setItem("sahan_refresh", tokens.refresh);
  },
  clear: () => {
    localStorage.removeItem("sahan_access");
    localStorage.removeItem("sahan_refresh");
  },
};

export const userApi = {
  updateProfilePicture: async (file: File): Promise<{ profile_picture: string }> => {
    const token = tokenStorage.get();
    if (!token) throw new Error("Not authenticated");

    const formData = new FormData();
    formData.append("profile_picture", file);

    const res = await fetch(`${BASE_URL}/upload-picture/`, {  // ← new endpoint
      method: "PATCH",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Upload failed" }));
      throw err;
    }
    return res.json();
  },
};

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
      if (!retried.ok) throw await retried.json();
      return retried.json() as Promise<T>;
    } else {
      tokenStorage.clear();
      window.location.href = "/login";
    }
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Request failed" }));
    throw err;
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
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
    localStorage.setItem("sahan_access", data.access);
    return true;
  } catch {
    return false;
  }
}

// ─── Auth API ────────────────────────────────────────────────────────────────
export const authApi = {
  login: async (creds: LoginCredentials): Promise<AuthTokens> => {
    const tokens = await apiFetch<AuthTokens>("/auth/jwt/create/", {
      method: "POST",
      body: JSON.stringify(creds),
    }, false);
    tokenStorage.set(tokens);
    return tokens;
  },

  register: async (creds: RegisterCredentials): Promise<User> => {
    return apiFetch<User>("/auth/users/", {
      method: "POST",
      body: JSON.stringify(creds),
    }, false);
  },

  logout: () => {
    tokenStorage.clear();
  },

  me: (): Promise<User> => apiFetch<User>("/auth/users/me/"),
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
export const resumeApi = {
  list: (): Promise<ResumeHistory[]> => apiFetch<ResumeHistory[]>("/resumes/"),

  get: (id: number): Promise<ResumeHistory> =>
    apiFetch<ResumeHistory>(`/resumes/${id}/`),

  tailor: (payload: {
    job_description: string;
    company_name?: string;
    job_title?: string;
  }): Promise<ResumeHistory> =>
    apiFetch<ResumeHistory>("/resumes/tailor/", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  delete: (id: number): Promise<void> =>
    apiFetch<void>(`/resumes/${id}/`, { method: "DELETE" }),
};

export const pdfApi = {
  downloadCV: async (payload: {
    profile: UserProfile;
    tailored: TailoredData;
    job_title: string;
    company_name: string;
  }) => {
    const token = tokenStorage.get();
    const res = await fetch(`${BASE_URL}/generate-cv-pdf/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('PDF generation failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${payload.profile.full_name?.replace(/\s/g, '_')}_Harvard_CV.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },

  downloadCoverLetter: async (payload: {
    profile: UserProfile;
    tailored: TailoredData;
    job_title: string;
    company_name: string;
  }) => {
    const token = tokenStorage.get();
    const res = await fetch(`${BASE_URL}/generate-cover-letter-pdf/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error('PDF generation failed');
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${payload.profile.full_name?.replace(/\s/g, '_')}_Cover_Letter.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  },
};