import { useState, useEffect } from "react";
import { resumeApi, profileApi } from "../services/api";
import type { ResumeHistory, UserProfile } from "../types";

export function useDashboard() {
  const [resumes, setResumes] = useState<ResumeHistory[]>([]);
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    resumeApi.list().then(setResumes).catch(() => {});
    profileApi.get().then(setProfile).catch(() => {});
  }, []);

  return { resumes, profile };
}
