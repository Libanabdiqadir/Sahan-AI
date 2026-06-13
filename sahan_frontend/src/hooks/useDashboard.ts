import { useState, useEffect } from "react";
import { resumeApi, profileApi } from "../services/api";
import { useSubscription } from "./useSubscription";
import type { ResumeHistory, UserProfile } from "../types";

export type { SubscriptionStatus } from "./useSubscription";

export function useDashboard() {
  const [resumes,  setResumes]  = useState<ResumeHistory[]>([]);
  const [profile,  setProfile]  = useState<UserProfile | null>(null);
  const subscription = useSubscription();

  useEffect(() => {
    resumeApi.list().then(setResumes).catch(() => {});
    profileApi.get().then(setProfile).catch(() => {});
  }, []);

  return { resumes, profile, subscription };
}
