import { useState } from "react";
import { profileApi } from "../services/api";
import type { UserProfile, ProjectEntry, CertificationEntry } from "../types";

export function useQuickAddProfile(
  profile: UserProfile | null,
  setProfile: (p: UserProfile) => void,
) {
  const [projectModalOpen, setProjectModalOpen] = useState(false);
  const [newProject, setNewProject] = useState<ProjectEntry>({
    title: "", role_title: "", description: "", link: "", dates: "",
  });
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [newCert, setNewCert] = useState<CertificationEntry>({
    name: "", issuer: "", issue_date: "",
  });

  const handleQuickAddProject = async () => {
    if (!newProject.title.trim() || !profile) return;
    const updated: UserProfile = { ...profile, projects: [...(profile.projects ?? []), newProject] };
    await profileApi.update({ projects: updated.projects });
    setProfile(updated);
    setNewProject({ title: "", role_title: "", description: "", link: "", dates: "" });
    setProjectModalOpen(false);
  };

  const handleQuickAddCert = async () => {
    if (!newCert.name.trim() || !newCert.issuer.trim() || !profile) return;
    const updated: UserProfile = { ...profile, certifications: [...(profile.certifications ?? []), newCert] };
    await profileApi.update({ certifications: updated.certifications });
    setProfile(updated);
    setNewCert({ name: "", issuer: "", issue_date: "" });
    setCertModalOpen(false);
  };

  return {
    projectModalOpen, setProjectModalOpen,
    newProject, setNewProject,
    handleQuickAddProject,
    certModalOpen, setCertModalOpen,
    newCert, setNewCert,
    handleQuickAddCert,
  };
}
