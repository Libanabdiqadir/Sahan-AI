import type { UserProfile } from "../types";

export interface ProfileTip {
  label: string;
  done: boolean;
  tab: "info" | "career";
  pts: number;
}

export interface ProfileStrength {
  score: number;
  ringColor: string;
  statusLabel: string;
  statusCls: string;
  tips: ProfileTip[];
  doneCount: number;
  CIRC: number;
}

export function useProfileStrength(profile: UserProfile | null): ProfileStrength {
  const CIRC = 326.7; // 2π × 52

  const expCount  = profile?.work_experience?.length ?? 0;
  const techCount = profile?.master_data?.tech_skills?.length ?? 0;
  const softCount = profile?.master_data?.soft_skills?.length ?? 0;
  const certCount = profile?.certifications?.length ?? 0;
  const projCount = profile?.projects?.length ?? 0;
  const eduCount  = profile?.education_history?.length ?? 0;

  const score = !profile ? 0 : [
    profile.contact_email ? 5 : 0,
    profile.phone_number  ? 5 : 0,
    profile.location      ? 5 : 0,
    profile.linkedin_url  ? 5 : 0,
    expCount >= 1         ? 10 : 0,
    expCount >= 2         ? 10 : 0,
    eduCount  >= 1        ? 15 : 0,
    projCount >= 1        ? 10 : 0,
    certCount >= 1        ? 15 : 0,
    techCount >= 4        ? 10 : 0,
    softCount >= 3        ? 10 : 0,
  ].reduce((a, b) => a + b, 0);

  const ringColor   = score >= 80 ? "#10b981" : score >= 50 ? "#3b82f6" : score >= 30 ? "#f59e0b" : "#ef4444";
  const statusLabel = score >= 80 ? "ATS Ready 🎉" : score >= 50 ? "Good Progress" : "Needs Work";
  const statusCls   = score >= 80
    ? "bg-emerald-50 text-emerald-700"
    : score >= 50
    ? "bg-blue-50 text-blue-700"
    : "bg-amber-50 text-amber-700";

  const tips: ProfileTip[] = [
    { label: "Add contact email",         done: !!profile?.contact_email, tab: "info",   pts: 5  },
    { label: "Add phone number",          done: !!profile?.phone_number,  tab: "info",   pts: 5  },
    { label: "Add your location",         done: !!profile?.location,      tab: "info",   pts: 5  },
    { label: "Add LinkedIn profile",      done: !!profile?.linkedin_url,  tab: "info",   pts: 5  },
    { label: "Add first work experience", done: expCount >= 1,            tab: "career", pts: 10 },
    { label: "Add second experience",     done: expCount >= 2,            tab: "career", pts: 10 },
    { label: "Add education record",      done: eduCount  >= 1,           tab: "career", pts: 15 },
    { label: "Add a project",             done: projCount >= 1,           tab: "career", pts: 10 },
    { label: "Add a certification",       done: certCount >= 1,           tab: "career", pts: 15 },
    { label: "Add 4+ technical skills",   done: techCount >= 4,           tab: "career", pts: 10 },
    { label: "Add 3+ soft skills",        done: softCount >= 3,           tab: "career", pts: 10 },
  ].sort((a, b) => Number(a.done) - Number(b.done));

  const doneCount = tips.filter(t => t.done).length;

  return { score, ringColor, statusLabel, statusCls, tips, doneCount, CIRC };
}
