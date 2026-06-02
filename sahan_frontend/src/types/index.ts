// ─── Auth ───────────────────────────────────────────────────────────────────
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  email: string;
  password: string;
  re_password: string;
  first_name: string;
  last_name: string;
}

// ─── User ────────────────────────────────────────────────────────────────────
export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  profile_picture: string | null;
}

// ─── Profile  ────────────────────────────────────
export interface EducationEntry {
  degree: string;
  university: string;
  graduation_year: string;
}

export interface ExperienceEntry {
  role: string;
  company: string;
  duration: string;
  responsibilities: string[];
}

export interface ProjectEntry {
  title: string;
  role_title: string;
  description: string;
  link: string;
  dates: string;
}

export interface CertificationEntry {
  name: string;
  issuer: string;
  issue_date: string;
  expiration_date?: string;
  credential_id?: string;
  credential_url?: string;
}

export interface MasterData {
  tech_skills?: string[];
  soft_skills?: string[];
  profile_picture_url?: string;
}

export interface UserProfile {
  full_name: string;
  contact_email: string | null;
  linkedin_url: string | null;
  phone_number: string;
  location: string;
  education_history: EducationEntry[];
  work_experience: ExperienceEntry[];
  projects?: ProjectEntry[];
  certifications?: CertificationEntry[];
  languages: string[];
  master_data: MasterData;
  created_at: string;
  updated_at: string;
}

// ─── Resume ───────────────────────────────────
export type ResumeStatus = "pending" | "completed" | "failed";

export interface TailoredData {
  summary: string;
  tech_skills: string[];
  soft_skills: string[];
  experience: ExperienceEntry[];
  education: EducationEntry[];
  projects?: Array<{
    name: string;
    description?: string;
    link?: string;
    dates?: string;
    tech_stack?: string[];
    highlights?: string[];
  }>;
  certifications?: Array<{
    name: string;
    issuer?: string;
    issue_date?: string;
    year?: string;
  }>;
  languages: string[];
  cover_letter: string;
  error?: string;
}

export interface Document {
  id: number;
  pdf_file: string;
  template_name: string;
}

export interface ResumeHistory {
  id: number;
  user: number;
  user_details: User;
  company_name: string;
  job_title: string;
  job_description: string;
  tailored_data: TailoredData;
  cover_letter_text: string;
  status: ResumeStatus;
  created_at: string;
  documents: Document[];
}

// ─── Subscription ──────────────────────────
export type PlanType = "free" | "pro" | "elite";

export interface UserSubscription {
  plan: PlanType;
  is_active: boolean;
  resume_this_month: number;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
}

// ─── API helpers ──────────────────────────────────────────────────────────────
export interface ApiError {
  detail?: string;
  error?: string;
  status?: string;
  [key: string]: unknown;
}
