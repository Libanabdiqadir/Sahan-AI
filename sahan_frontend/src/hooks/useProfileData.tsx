import { useState, useEffect } from "react";
import { profileApi, userApi } from "../services/api";
import { useAuth } from "./useAuth";
import type {
  UserProfile, EducationEntry, ExperienceEntry,
  ProjectEntry, CertificationEntry,
} from "../types";

export function useProfileData() {
  const { user, updateUser } = useAuth();

  const [localUser, setLocalUser] = useState(user);
  const [nameDraft, setNameDraft] = useState({
    first_name: user?.first_name || "",
    last_name:  user?.last_name  || "",
  });
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<Partial<UserProfile>>({});
  const [uploadingPic, setUploadingPic] = useState(false);

  const [hardSkills, setHardSkills] = useState("");
  const [softSkills, setSoftSkills] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [showExpForm, setShowExpForm] = useState(false);
  const [newExp, setNewExp] = useState<ExperienceEntry>({ role: "", company: "", duration: "", responsibilities: [] });
  const [showEduForm, setShowEduForm] = useState(false);
  const [newEdu, setNewEdu] = useState<EducationEntry>({ degree: "", university: "", graduation_year: "" });
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState<ProjectEntry>({ title: "", role_title: "", description: "", link: "", dates: "", highlights: [] });
  const [showCertForm, setShowCertForm] = useState(false);
  const [newCert, setNewCert] = useState<CertificationEntry>({ name: "", issuer: "", issue_date: "", expiration_date: "", credential_id: "", credential_url: "" });

  useEffect(() => {
    profileApi.get()
      .then(p => {
        setProfile(p);
        setDraft(p);
        const savedPicUrl = p.master_data?.profile_picture_url;
        if (savedPicUrl && user) {
          setLocalUser({ ...user, profile_picture: savedPicUrl });
        } else {
          setLocalUser(user);
        }
      })
      .finally(() => setLoadingProfile(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildPayload = (d: Partial<UserProfile>) => ({
    full_name:         d.full_name,
    contact_email:     d.contact_email,
    linkedin_url:      d.linkedin_url,
    phone_number:      d.phone_number,
    location:          d.location,
    education_history: d.education_history,
    work_experience:   d.work_experience,
    projects:          d.projects,
    certifications:    d.certifications,
    languages:         d.languages,
    master_data:       d.master_data,
  });

  const saveCareerData = async (updatedDraft: Partial<UserProfile>) => {
    try {
      const updated = await profileApi.update(buildPayload(updatedDraft));
      setProfile(updated);
      setDraft(updated);
    } catch (err) {
      alert("Auto-save failed: " + JSON.stringify(err));
    }
  };

  const saveProfile = async () => {
    setSaving(true);
    try {
      const updated = await profileApi.update(buildPayload(draft));
      setProfile(updated);
      setDraft(updated);
      const nameChanged =
        nameDraft.first_name !== (user?.first_name || "") ||
        nameDraft.last_name  !== (user?.last_name  || "");
      if (nameChanged) await updateUser(nameDraft);
      setEditMode(false);
    } catch (err: unknown) {
      alert("Save Failed: " + JSON.stringify(err));
    } finally {
      setSaving(false);
    }
  };

  const handleProfilePictureChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingPic(true);
    try {
      const data = await userApi.updateProfilePicture(file);
      setLocalUser(prev => prev ? { ...prev, profile_picture: data.profile_picture } : prev);
    } catch (err: unknown) {
      alert("Upload failed: " + JSON.stringify(err));
    } finally {
      setUploadingPic(false);
    }
  };

  const handleAddExperience = () => {
    if (!newExp.role.trim() || !newExp.company.trim()) return;
    setDraft(prev => {
      const updated = { ...prev, work_experience: [...(prev.work_experience ?? []), newExp] };
      saveCareerData(updated);
      return updated;
    });
    setProfile(prev => prev ? { ...prev, work_experience: [...(prev.work_experience ?? []), newExp] } : prev);
    setNewExp({ role: "", company: "", duration: "", responsibilities: [] });
    setShowExpForm(false);
  };

  const handleDeleteExperience = (idx: number) => {
    const updated = [...(draft.work_experience ?? [])];
    updated.splice(idx, 1);
    setDraft(p => ({ ...p, work_experience: updated }));
    setProfile(p => p ? { ...p, work_experience: updated } : p);
  };

  const handleAddEducation = () => {
    if (!newEdu.degree.trim() || !newEdu.university.trim()) return;
    setDraft(prev => {
      const updated = { ...prev, education_history: [...(prev.education_history ?? []), newEdu] };
      saveCareerData(updated);
      return updated;
    });
    setProfile(prev => prev ? { ...prev, education_history: [...(prev.education_history ?? []), newEdu] } : prev);
    setNewEdu({ degree: "", university: "", graduation_year: "" });
    setShowEduForm(false);
  };

  const handleDeleteEducation = (idx: number) => {
    const updated = [...(draft.education_history ?? [])];
    updated.splice(idx, 1);
    setDraft(p => ({ ...p, education_history: updated }));
    setProfile(p => p ? { ...p, education_history: updated } : p);
    saveCareerData({ ...draft, education_history: updated });
  };

  const handleAddProject = () => {
    if (!newProject.title.trim()) return;
    setDraft(prev => {
      const updated = { ...prev, projects: [...(prev.projects ?? []), newProject] };
      saveCareerData(updated);
      return updated;
    });
    setProfile(prev => prev ? { ...prev, projects: [...(prev.projects ?? []), newProject] } : prev);
    setNewProject({ title: "", role_title: "", description: "", link: "", dates: "", highlights: [] });
    setShowProjectForm(false);
  };

  const handleDeleteProject = (idx: number) => {
    setDraft(prev => {
      const updated = { ...prev, projects: (prev.projects ?? []).filter((_, i) => i !== idx) };
      saveCareerData(updated);
      return updated;
    });
    setProfile(prev => prev ? { ...prev, projects: (prev.projects ?? []).filter((_, i) => i !== idx) } : prev);
  };

  const handleAddCertification = () => {
    if (!newCert.name.trim() || !newCert.issuer.trim()) return;
    const cleaned: CertificationEntry = {
      name:      newCert.name,
      issuer:    newCert.issuer,
      issue_date: newCert.issue_date,
      ...(newCert.expiration_date?.trim() ? { expiration_date: newCert.expiration_date } : {}),
      ...(newCert.credential_id?.trim()   ? { credential_id:   newCert.credential_id }   : {}),
      ...(newCert.credential_url?.trim()  ? { credential_url:  newCert.credential_url }  : {}),
    };
    setDraft(prev => {
      const updated = { ...prev, certifications: [...(prev.certifications ?? []), cleaned] };
      saveCareerData(updated);
      return updated;
    });
    setProfile(prev => prev ? { ...prev, certifications: [...(prev.certifications ?? []), cleaned] } : prev);
    setNewCert({ name: "", issuer: "", issue_date: "", expiration_date: "", credential_id: "", credential_url: "" });
    setShowCertForm(false);
  };

  const handleDeleteCertification = (idx: number) => {
    setDraft(prev => {
      const updated = { ...prev, certifications: (prev.certifications ?? []).filter((_, i) => i !== idx) };
      saveCareerData(updated);
      return updated;
    });
    setProfile(prev => prev ? { ...prev, certifications: (prev.certifications ?? []).filter((_, i) => i !== idx) } : prev);
  };

  const handleAddSkill = (category: "skills" | "soft_skills") => {
    const textToAdd = category === "skills" ? hardSkills : softSkills;
    if (!textToAdd.trim()) return;
    const field = category === "skills" ? "tech_skills" : "soft_skills";
    setDraft(prev => {
      const currentList = [...(prev.master_data?.[field] ?? [])];
      const updated = {
        ...prev,
        master_data: {
          tech_skills: [],
          soft_skills: [],
          ...prev.master_data,
          [field]: [...currentList, textToAdd.trim()],
        },
      };
      saveCareerData(updated);
      return updated;
    });
    if (category === "skills") setHardSkills("");
    else setSoftSkills("");
  };

  const removeSkill = (type: "tech_skills" | "soft_skills", idx: number) => {
    setDraft(prev => {
      const current = [...(prev.master_data?.[type] ?? [])];
      current.splice(idx, 1);
      const updated = {
        ...prev,
        master_data: {
          tech_skills: [],
          soft_skills: [],
          ...prev.master_data,
          [type]: current,
        },
      };
      saveCareerData(updated);
      return updated;
    });
  };

  const handleAddLanguage = () => {
    if (!languageInput.trim()) return;
    setDraft(prev => {
      const updated = { ...prev, languages: [...(prev.languages ?? []), languageInput.trim()] };
      saveCareerData(updated);
      return updated;
    });
    setLanguageInput("");
  };

  return {
    user, localUser, nameDraft, setNameDraft,
    profile, setProfile,
    draft, setDraft,
    loadingProfile, saving, editMode, setEditMode, uploadingPic,

    hardSkills, setHardSkills,
    softSkills, setSoftSkills,
    languageInput, setLanguageInput,
    showExpForm, setShowExpForm, newExp, setNewExp,
    showEduForm, setShowEduForm, newEdu, setNewEdu,
    showProjectForm, setShowProjectForm, newProject, setNewProject,
    showCertForm, setShowCertForm, newCert, setNewCert,

    saveProfile, saveCareerData,
    handleProfilePictureChange,
    handleAddExperience, handleDeleteExperience,
    handleAddEducation, handleDeleteEducation,
    handleAddProject, handleDeleteProject,
    handleAddCertification, handleDeleteCertification,
    handleAddSkill, removeSkill,
    handleAddLanguage,
  };
}
