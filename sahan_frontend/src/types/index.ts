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
  is_staff: boolean;
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
  highlights?: string[];
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
export type ResumeStatus = "processing" | "completed" | "failed";

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
  error_message?: string;
  created_at: string;
  documents: Document[];
}

// ─── Template ─────────────────────────────────────────────────────────────────
export type Template = "harvard" | "executive" | "modern" | "minimalist" | "boldChronological";

// ─── Generation Mode ──────────────────────────────────────────────────────────
export type GenerationMode = "cv_only" | "cover_letter_only" | "both";

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

// ─── Admin User Management ────────────────────────────────────────────────────
export type PlanChoice = 'free' | 'Pro' | 'elite';

export interface AdminUser {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  is_active: boolean;
  is_staff: boolean;
  date_joined: string;
  plan: PlanChoice;
  resume_count: number;
}

// ─── Admin Analytics ──────────────────────────────────────────────────────────
export interface TrafficStats {
  today: number;
  yesterday: number;
  this_week: number;
  last_week: number;
  this_month: number;
  last_month: number;
  this_year: number;
}

export interface UserStats {
  total: number;
  online: number;
  free: number;
  pro: number;
  elite: number;
}

export interface ProUserEntry {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  date_joined: string;
}

export interface RecentGeneration {
  user__email: string;
  job_title: string;
  company_name: string;
  status: ResumeStatus;
  created_at: string;
}

export interface AnalyticsData {
  traffic: TrafficStats;
  users: UserStats;
  pro_users: ProUserEntry[];
  recent_generations: RecentGeneration[];
}
