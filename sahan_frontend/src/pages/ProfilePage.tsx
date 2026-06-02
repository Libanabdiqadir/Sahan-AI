import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PDFDownloadLink } from "@react-pdf/renderer";
import {
  User, Briefcase, FileText, Edit3, Save, Loader2,
  Plus, Trash2, Download, RefreshCw, CheckCircle2,
  XCircle, Clock,
  Camera,
} from "lucide-react";
import { profileApi, resumeApi, userApi } from "../services/api";
import { useAuth } from "../hooks/useAuth";
import type {
  UserProfile, ResumeHistory, EducationEntry, ExperienceEntry,
  ProjectEntry, CertificationEntry,
} from "../types";
import { HarvardCV } from "../components/resume/HarvardCV";

type Tab = "info" | "career" | "vault";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "info", label: "Personal Info", icon: User },
  { id: "career", label: "Career Data", icon: Briefcase },
  { id: "vault", label: "Resume History", icon: FileText },
];

function StatusBadge({ status }: { status: ResumeHistory["status"] }) {
  if (status === "completed")
    return <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700"><CheckCircle2 size={10} /> Completed</span>;
  if (status === "pending")
    return <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700"><Clock size={10} /> Processing</span>;
  return <span className="inline-flex items-center gap-1 font-sans text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-600"><XCircle size={10} /> Failed</span>;
}

function SkillChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-sans text-[12px] font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 group">
      {label}
      <button onClick={onRemove} className="opacity-0 group-hover:opacity-100 text-blue-400 hover:text-red-400 transition-all">
        <XCircle size={11} />
      </button>
    </span>
  );
}

export default function ProfilePage() {
  const { user } = useAuth();
  const [localUser, setLocalUser] = useState(user);
  const [tab, setTab] = useState<Tab>("info");
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [resumes, setResumes] = useState<ResumeHistory[]>([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingResumes, setLoadingResumes] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [draft, setDraft] = useState<Partial<UserProfile>>({});
  const [uploadingPic, setUploadingPic] = useState(false);
  const [hardSkills, setHardSkills] = useState("");
  const [softSkills, setSoftSkills] = useState("");
  const [languageInput, setLanguageInput] = useState("");
  const [showExpForm, setShowExpForm] = useState(false);
  const [newExp, setNewExp] = useState<ExperienceEntry>({
    role: "",
    company: "",
    duration: "",
    responsibilities: [],
  })
  const [showEduForm, setShowEduForm] = useState(false);
  const [newEdu, setNewEdu] = useState<EducationEntry>({
    degree: "",
    university: "",
    graduation_year: "",
  });
  const [showProjectForm, setShowProjectForm] = useState(false);
  const [newProject, setNewProject] = useState<ProjectEntry>({
    title: "", role_title: "", description: "", link: "", dates: "",
  });
  const [showCertForm, setShowCertForm] = useState(false);
  const [newCert, setNewCert] = useState<CertificationEntry>({
    name: "", issuer: "", issue_date: "", expiration_date: "",
    credential_id: "", credential_url: "",
  });

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
}, []);

  useEffect(() => {
    if (tab === "vault") {
      setLoadingResumes(true);
      resumeApi.list().then(setResumes).finally(() => setLoadingResumes(false));
    }
  }, [tab]);

  const saveProfile = async () => {
    setSaving(true);
    try {
      const payload = {
        full_name: draft.full_name,
        contact_email: draft.contact_email,
        linkedin_url: draft.linkedin_url,
        phone_number: draft.phone_number,
        location: draft.location,
        education_history: draft.education_history,
        work_experience: draft.work_experience,
        projects: draft.projects,
        certifications: draft.certifications,
        languages: draft.languages,
        master_data: draft.master_data,
      };
      const updated = await profileApi.update(payload);
      setProfile(updated);
      setDraft(updated);
      setEditMode(false);
    } catch (err: unknown) {
      const e = err as Record<string, unknown>;
      alert('Save Failed: ' + JSON.stringify(e));
    } finally {
      setSaving(false);
    }
  }


  const saveCareerData = async (updatedDraft: Partial<UserProfile>) => {
    try {
      const payload = {
        full_name: updatedDraft.full_name,
        contact_email: updatedDraft.contact_email,
        linkedin_url: updatedDraft.linkedin_url,
        phone_number: updatedDraft.phone_number,
        location: updatedDraft.location,
        education_history: updatedDraft.education_history,
        work_experience: updatedDraft.work_experience,
        projects: updatedDraft.projects,
        certifications: updatedDraft.certifications,
        languages: updatedDraft.languages,
        master_data: updatedDraft.master_data,
      };
      const updated = await profileApi.update(payload);
      setProfile(updated);
      setDraft(updated);
    } catch (err) {
      alert("Auto-save failed: " + JSON.stringify(err));
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
    const e = err as Record<string, unknown>;
    alert("Upload failed: " + JSON.stringify(e));
  } finally {
    setUploadingPic(false);
  }
};

  const handleAddExperience = () => {
      if (!newExp.role.trim() || !newExp.company.trim()) return;
      
      setDraft((prev) => {
        const updated = {
          ...prev,
          work_experience: [...(prev.work_experience ?? []), newExp],
        };
        saveCareerData(updated); // ← save to backend immediately
        return updated;
      });

      setProfile((prev) =>
        prev ? { ...prev, work_experience: [...(prev.work_experience ?? []), newExp] } : prev
      );
      setNewExp({ role: "", company: "", duration: "", responsibilities: [] });
      setShowExpForm(false);
    };

  const handleAddEducation = () => {
    if (!newEdu.degree.trim() || !newEdu.university.trim()) return;
    setDraft((prev) => {
      const updated = {
        ...prev,
        education_history: [...(prev.education_history ?? []), newEdu],
      };
      saveCareerData(updated);
      return updated;
    });
    setProfile((prev) => 
      prev ? { ...prev, education_history: [...(prev.education_history ?? []), newEdu]} : prev
    );
    setNewEdu({ degree: "", university: "", graduation_year: "" });
    setShowEduForm(false);
  };

  const handleAddProject = () => {
    if (!newProject.title.trim()) return;
    setDraft((prev) => {
      const updated = { ...prev, projects: [...(prev.projects ?? []), newProject] };
      saveCareerData(updated);
      return updated;
    });
    setProfile((prev) => prev ? { ...prev, projects: [...(prev.projects ?? []), newProject] } : prev);
    setNewProject({ title: "", role_title: "", description: "", link: "", dates: "" });
    setShowProjectForm(false);
  };

  const handleDeleteProject = (idx: number) => {
    setDraft((prev) => {
      const updated = { ...prev, projects: (prev.projects ?? []).filter((_, i) => i !== idx) };
      saveCareerData(updated);
      return updated;
    });
    setProfile((prev) => prev ? { ...prev, projects: (prev.projects ?? []).filter((_, i) => i !== idx) } : prev);
  };

  const handleAddCertification = () => {
    if (!newCert.name.trim() || !newCert.issuer.trim()) return;
    const cleaned: CertificationEntry = {
      name: newCert.name,
      issuer: newCert.issuer,
      issue_date: newCert.issue_date,
      ...(newCert.expiration_date?.trim() ? { expiration_date: newCert.expiration_date } : {}),
      ...(newCert.credential_id?.trim()   ? { credential_id:   newCert.credential_id }   : {}),
      ...(newCert.credential_url?.trim()  ? { credential_url:  newCert.credential_url }  : {}),
    };
    setDraft((prev) => {
      const updated = { ...prev, certifications: [...(prev.certifications ?? []), cleaned] };
      saveCareerData(updated);
      return updated;
    });
    setProfile((prev) => prev ? { ...prev, certifications: [...(prev.certifications ?? []), cleaned] } : prev);
    setNewCert({ name: "", issuer: "", issue_date: "", expiration_date: "", credential_id: "", credential_url: "" });
    setShowCertForm(false);
  };

  const handleDeleteCertification = (idx: number) => {
    setDraft((prev) => {
      const updated = { ...prev, certifications: (prev.certifications ?? []).filter((_, i) => i !== idx) };
      saveCareerData(updated);
      return updated;
    });
    setProfile((prev) => prev ? { ...prev, certifications: (prev.certifications ?? []).filter((_, i) => i !== idx) } : prev);
  };

  const handleAddSkill = (category: 'skills' | 'soft_skills') => {
  const textToAdd = category === 'skills' ? hardSkills : softSkills;
  if (!textToAdd.trim()) return;
  const field = category === 'skills' ? 'tech_skills' : 'soft_skills';

  setDraft((prev) => {
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

  if (category === 'skills') setHardSkills("");
  else setSoftSkills("");
};

  const removeSkill = (type: "tech_skills" | "soft_skills", idx: number) => {
  setDraft((prev) => {
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

  const initials = `${user?.first_name?.[0] || ""}${user?.last_name?.[0] || ""}` || user?.email?.[0]?.toUpperCase() || "U";

  if (loadingProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-slate-300" />
      </div>
    );
  }

  const handleAddLanguage = () => {
  if (!languageInput.trim()) return;
  setDraft((prev) => {
    const updated = {
      ...prev,
      languages: [...(prev.languages ?? []), languageInput.trim()],
    };
    saveCareerData(updated);
    return updated;
  });
  setLanguageInput("");
};

  return (
    <div className="max-w-[900px] mx-auto px-6 py-10">
      {/* Profile Header */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border border-stone-200 rounded-2xl p-6 mb-6 flex items-center gap-6"
      >
        {/* Replace your current avatar div with this */}
          <div className="relative group cursor-pointer" onClick={() => document.getElementById('pic-upload')?.click()}>
            <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-2xl font-bold font-sans shrink-0 overflow-hidden">
              {localUser?.profile_picture ? (
                <img src={localUser.profile_picture} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                initials
              )}
            </div>

            {/* Hover overlay */}
            <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              {uploadingPic ? (
                <Loader2 size={18} className="text-white animate-spin" />
              ) : (
                <Camera size={18} className="text-white" />
              )}
            </div>

            {/* Hidden file input */}
            <input
              id="pic-upload"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleProfilePictureChange}
            />
          </div>
        <div className="flex-1">
          <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">
            {profile?.full_name || `${user?.first_name} ${user?.last_name}`.trim() || user?.email}
          </h1>
          <p className="font-sans text-[13px] text-slate-400 mt-0.5">{user?.email} · {profile?.location || "Location not set"}</p>
          <div className="flex gap-2 mt-2">
            <span className="font-sans text-[11px] font-bold px-3 py-1 rounded-full bg-amber-50 text-amber-700">
              Free Plan · 1/2 used
            </span>
            <span className="font-sans text-[11px] font-bold px-3 py-1 rounded-full bg-blue-50 text-blue-700 cursor-pointer hover:bg-blue-100 transition-colors">
              Upgrade to Pro →
            </span>
          </div>
        </div>
      </motion.div>

      {/* Tabs */}
      <div className="flex border-b border-stone-200 mb-6">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 font-sans text-[13px] font-medium px-5 py-3 border-b-2 -mb-px transition-all ${
              tab === id
                ? "text-slate-900 border-blue-600 font-semibold"
                : "text-slate-400 border-transparent hover:text-slate-700"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {/* ── Tab: Personal Info ──────────────────────────────────────── */}
      {tab === "info" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-[15px] text-slate-900">Contact Information</h2>
              {editMode ? (
                <div className="flex gap-2">
                  <button onClick={() => setEditMode(false)} className="font-sans text-[12px] font-semibold text-slate-400 hover:text-slate-600 px-3 py-1.5 border border-stone-200 rounded-lg">
                    Cancel
                  </button>
                  <button onClick={saveProfile} disabled={saving} className="font-sans text-[12px] font-semibold text-white bg-slate-900 hover:bg-blue-600 px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors">
                    {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
                  </button>
                </div>
              ) : (
                <button onClick={() => setEditMode(true)} className="font-sans text-[12px] font-semibold text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-1.5">
                  <Edit3 size={12} /> Edit
                </button>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: "Full Name", key: "full_name" as const, placeholder: "Your full name" },
                { label: "Contact Email", key: "contact_email" as const, placeholder: "contact@email.com" },
                { label: "Phone Number", key: "phone_number" as const, placeholder: "+1 234 567 8900" },
                { label: "Location", key: "location" as const, placeholder: "City, Country" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="label-xs mr-2">{label}</label>
                  {editMode ? (
                    <input
                      className="form-input"
                      value={(draft[key] as string) || ""}
                      onChange={e => setDraft(d => ({ ...d, [key]: e.target.value }))}
                      placeholder={placeholder}
                    />
                  ) : (
                    <p className="font-sans text-[14px] text-slate-900 py-2">
                      {(profile?.[key] as string) || <span className="text-slate-300 italic text-[13px]">Not set</span>}
                    </p>
                  )}
                </div>
              ))}
                <div className="col-span-2">
                  <label className="label-xs mr-2">LinkedIn URL</label>
                  {editMode ? (
                    <input
                      className="form-input"
                      value={draft.linkedin_url || ""}
                      onChange={e => setDraft(d => ({ ...d, linkedin_url: e.target.value }))}
                      placeholder="https://linkedin.com/in/yourname"
                    />
                  ) : (
                    <p className="font-sans text-[14px] text-blue-600 py-2">
                      {profile?.linkedin_url || <span className="text-slate-300 italic text-[13px]">Not set</span>}
                    </p>
                  )}
                </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Tab: Career Data ─────────────────────────────────────────── */}
      {tab === "career" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          
          {/* Work Experience */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[15px] text-slate-900">Work Experience</h2>
              <button
                onClick={() => setShowExpForm(true)}
                className="font-sans text-[13px] font-semibold text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-1.5"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            {/* Experience Cards */}
            {(draft.work_experience ?? []).length > 0 ? (
              (draft.work_experience ?? []).map((exp, i) => (
                <div key={i} className="flex items-start justify-between p-4 border border-stone-100 rounded-xl mb-3 group">
                  <div className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                      <Briefcase size={15} className="text-blue-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-[14px] text-slate-900">{exp.role}</p>
                      <p className="font-sans text-[12px] text-slate-400 mt-0.5">{exp.company} · {exp.duration}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      const updated = [...(draft.work_experience ?? [])];
                      updated.splice(i, 1);
                      setDraft(p => ({ ...p, work_experience: updated }));
                      setProfile(p => p ? { ...p, work_experience: updated } : p);
                    }}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all mt-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            ) : (
              <p className="font-sans text-[13px] text-slate-300 italic">No work experience added yet.</p>
            )}

            {/* Popup Modal Form */}
            {showExpForm && (
              <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-stone-200 p-6 w-full max-w-[480px] shadow-xl"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-[16px] text-slate-900">Add Work Experience</h3>
                    <button
                      onClick={() => setShowExpForm(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <XCircle size={18} />
                    </button>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="label-xs mr-3">Job Title</label>
                      <input
                        className="form-input"
                        value={newExp.role}
                        onChange={e => setNewExp(p => ({ ...p, role: e.target.value }))}
                        placeholder="e.g. Senior Frontend Developer"
                        autoFocus
                      />
                    </div>
                    <div>
                      <label className="label-xs mr-3">Company</label>
                      <input
                        className="form-input"
                        value={newExp.company}
                        onChange={e => setNewExp(p => ({ ...p, company: e.target.value }))}
                        placeholder="e.g. Stripe"
                      />
                    </div>
                    <div>
                      <label className="label-xs mr-3">Duration</label>
                      <input
                        className="form-input"
                        value={newExp.duration}
                        onChange={e => setNewExp(p => ({ ...p, duration: e.target.value }))}
                        placeholder="e.g. Jan 2022 – Present"
                      />
                    </div>
                    <div>
                      <label className="label-xs text-slate-700 font-medium">Key Responsibilities (one per line)</label>
                      <textarea
                        className="form-input min-h-[100px] resize-none w-full"
                        value={newExp.responsibilities.join("\n")}
                        onChange={e =>
                          setNewExp(p => ({
                            ...p,
                            responsibilities: e.target.value.split("\n").filter(Boolean),
                          }))
                        }
                        placeholder={"Built reusable React components...\nReduced load time by 40%..."}
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowExpForm(false)}
                      className="flex-1 font-sans text-[13px] font-semibold text-slate-500 border border-stone-200 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddExperience}
                      disabled={!newExp.role.trim() || !newExp.company.trim()}
                      className="flex-1 font-sans text-[13px] font-semibold bg-slate-900 hover:bg-blue-600 disabled:opacity-40 text-white py-2.5 rounded-xl transition-colors"
                    >
                      Save Experience
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>

          {/* Education */}
<div className="bg-white border border-stone-200 rounded-xl p-6">
  <div className="flex items-center justify-between mb-4">
    <h2 className="font-bold text-[15px] text-slate-900">Education</h2>
    <button
      onClick={() => setShowEduForm(true)}
      className="font-sans text-[13px] font-semibold text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-1.5"
    >
      <Plus size={12} /> Add
    </button>
  </div>

  {/* Education Cards */}
  {(draft.education_history ?? []).length > 0 ? (
    (draft.education_history ?? []).map((edu, i) => (
      <div key={i} className="flex items-start justify-between p-4 border border-stone-100 rounded-xl mb-3 group">
        <div className="flex gap-3 items-start">
          <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5">
            <FileText size={15} className="text-violet-600" />
          </div>
          <div>
            <p className="font-semibold text-[14px] text-slate-900">{edu.degree}</p>
            <p className="font-sans text-[12px] text-slate-400 mt-0.5">
              {edu.university} · {edu.graduation_year}
            </p>
          </div>
        </div>
        <button
          onClick={() => {
            const updated = [...(draft.education_history ?? [])];
            updated.splice(i, 1);
            setDraft(p => ({ ...p, education_history: updated }));
            setProfile(p => p ? { ...p, education_history: updated } : p);
            saveCareerData({ ...draft, education_history: updated });
          }}
          className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all mt-1"
        >
          <Trash2 size={13} />
        </button>
      </div>
    ))
  ) : (
    <p className="font-sans text-[13px] text-slate-300 italic">No education added yet.</p>
  )}

  {/* Education Modal */}
  {showEduForm && (
    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-2xl border border-stone-200 p-6 w-full max-w-[440px] shadow-xl"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-[16px] text-slate-900">Add Education</h3>
          <button onClick={() => setShowEduForm(false)} className="text-slate-400 hover:text-slate-600">
            <XCircle size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="label-xs mr-3">Degree / Qualification</label>
            <input
              className="form-input"
              value={newEdu.degree}
              onChange={e => setNewEdu(p => ({ ...p, degree: e.target.value }))}
              placeholder="e.g. B.Sc. Computer Science"
              autoFocus
            />
          </div>
          <div>
            <label className="label-xs mr-3">University / Institution</label>
            <input
              className="form-input"
              value={newEdu.university}
              onChange={e => setNewEdu(p => ({ ...p, university: e.target.value }))}
              placeholder="e.g. University of Hargeisa"
            />
          </div>
          <div>
            <label className="label-xs mr-3">Graduation Year</label>
            <input
              className="form-input"
              value={newEdu.graduation_year}
              onChange={e => setNewEdu(p => ({ ...p, graduation_year: e.target.value }))}
              placeholder="e.g. 2023"
            />
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={() => setShowEduForm(false)}
            className="flex-1 font-sans text-[13px] font-semibold text-slate-500 border border-stone-200 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAddEducation}
            disabled={!newEdu.degree.trim() || !newEdu.university.trim()}
            className="flex-1 font-sans text-[13px] font-semibold bg-slate-900 hover:bg-blue-600 disabled:opacity-40 text-white py-2.5 rounded-xl transition-colors"
          >
            Save Education
          </button>
        </div>
      </motion.div>
    </div>
  )}
</div>

          {/* Projects */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[15px] text-slate-900">Projects</h2>
              <button
                onClick={() => setShowProjectForm(true)}
                className="font-sans text-[13px] font-semibold text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-1.5"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            {(draft.projects ?? []).length > 0 ? (
              (draft.projects ?? []).map((proj, i) => (
                <div key={i} className="flex items-start justify-between p-4 border border-stone-100 rounded-xl mb-3 group">
                  <div className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                      <FileText size={15} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-[14px] text-slate-900">{proj.title}</p>
                      <p className="font-sans text-[12px] text-slate-400 mt-0.5">
                        {proj.role_title}{proj.dates ? ` · ${proj.dates}` : ""}
                      </p>
                      {proj.link && (
                        <p className="font-sans text-[11px] text-blue-500 mt-0.5 truncate max-w-xs">{proj.link}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteProject(i)}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all mt-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            ) : (
              <p className="font-sans text-[13px] text-slate-300 italic">No projects added yet.</p>
            )}

            {showProjectForm && (
              <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-stone-200 p-6 w-full max-w-[520px] shadow-xl"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-[16px] text-slate-900">Add Project</h3>
                    <button onClick={() => setShowProjectForm(false)} className="text-slate-400 hover:text-slate-600">
                      <XCircle size={18} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label-xs mr-3">Project Title *</label>
                        <input
                          className="form-input"
                          value={newProject.title}
                          onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))}
                          placeholder="e.g. E-Commerce Platform"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="label-xs mr-3">Your Role</label>
                        <input
                          className="form-input"
                          value={newProject.role_title}
                          onChange={e => setNewProject(p => ({ ...p, role_title: e.target.value }))}
                          placeholder="e.g. Lead Developer"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="label-xs mr-3">Description</label>
                      <textarea
                        className="form-input min-h-[80px] resize-none w-full"
                        value={newProject.description}
                        onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                        placeholder="Brief description of the project and your impact..."
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label-xs mr-3">Link / URL</label>
                        <input
                          className="form-input"
                          value={newProject.link}
                          onChange={e => setNewProject(p => ({ ...p, link: e.target.value }))}
                          placeholder="github.com/you/project"
                        />
                      </div>
                      <div>
                        <label className="label-xs mr-3">Dates</label>
                        <input
                          className="form-input"
                          value={newProject.dates}
                          onChange={e => setNewProject(p => ({ ...p, dates: e.target.value }))}
                          placeholder="e.g. Jan 2023 – Mar 2024"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowProjectForm(false)}
                      className="flex-1 font-sans text-[13px] font-semibold text-slate-500 border border-stone-200 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddProject}
                      disabled={!newProject.title.trim()}
                      className="flex-1 font-sans text-[13px] font-semibold bg-slate-900 hover:bg-blue-600 disabled:opacity-40 text-white py-2.5 rounded-xl transition-colors"
                    >
                      Save Project
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>

          {/* Technical Skills */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h2 className="font-bold text-[15px] text-slate-900 mb-4">Technical Skills</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {(draft.master_data?.tech_skills ?? []).map((s, i) => (
                <SkillChip key={i} label={s} onRemove={() => removeSkill("tech_skills", i)} />
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="form-input flex-1"
                value={hardSkills}
                onChange={e => setHardSkills(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddSkill("skills")}
                placeholder="Type a skill and press Enter"
              />
              <button
                onClick={() => handleAddSkill("skills")}
                className="font-sans text-[13px] font-semibold px-4 py-2 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center gap-1.5 transition-colors"
              >
                <Plus size={13} /> Add Hard skills
              </button>
            </div>
          </div>

          {/* Soft Skills */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h2 className="font-bold text-[15px] text-slate-900 mb-4">Soft Skills</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {(draft.master_data?.soft_skills ?? []).map((s, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 font-sans text-[12px] font-medium px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 group">
                  {s}
                  <button onClick={() => removeSkill("soft_skills", i)} className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all">
                    <XCircle size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input
                className="form-input flex-1"
                value={softSkills}
                onChange={e => setSoftSkills(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddSkill("soft_skills")}
                placeholder="Type a skill and press Enter"
              />
              <button
                onClick={() => handleAddSkill("soft_skills")}
                className="font-sans text-[13px] font-semibold px-4 py-2 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 flex items-center gap-1.5 transition-colors"
              >
                <Plus size={13} /> Add Soft skills
              </button>
            </div>
          </div>

          {/* Languages */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <h2 className="font-bold text-[15px] text-slate-900 mb-4">Languages</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {(draft.languages ?? []).map((l, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 font-sans text-[12px] font-medium px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200 group">
                  {l}
                  <button
                    onClick={() => {
                      const updated = [...(draft.languages ?? [])];
                      updated.splice(i, 1);
                      setDraft(p => ({ ...p, languages: updated }));
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-red-400 transition-all"
                  >
                    <XCircle size={11} />
                  </button>
                </span>
              ))}
              {!(draft.languages ?? []).length && (
                <p className="font-sans text-[13px] text-slate-300 italic">No languages added yet.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input
                  className="form-input flex-1"
                  value={languageInput}
                  onChange={e => setLanguageInput(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter") handleAddLanguage(); }}  // ← change this
                  placeholder="Add languages you speak"
                />
              <button
                onClick={handleAddLanguage}
                className="font-sans text-[13px] font-semibold px-4 py-2 border border-violet-200 text-violet-600 rounded-lg hover:bg-violet-50 flex items-center gap-1.5 transition-colors"
              >
                <Plus size={13} /> Add language
              </button>
            </div>
          </div>

          {/* Certifications */}
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-[15px] text-slate-900">Certifications</h2>
              <button
                onClick={() => setShowCertForm(true)}
                className="font-sans text-[13px] font-semibold text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-1.5"
              >
                <Plus size={12} /> Add
              </button>
            </div>

            {(draft.certifications ?? []).length > 0 ? (
              (draft.certifications ?? []).map((cert, i) => (
                <div key={i} className="flex items-start justify-between p-4 border border-stone-100 rounded-xl mb-3 group">
                  <div className="flex gap-3 items-start">
                    <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 size={15} className="text-amber-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-[14px] text-slate-900">{cert.name}</p>
                      <p className="font-sans text-[12px] text-slate-400 mt-0.5">
                        {cert.issuer}{cert.issue_date ? ` · ${cert.issue_date}` : ""}
                        {cert.expiration_date ? ` – ${cert.expiration_date}` : ""}
                      </p>
                      {cert.credential_url && (
                        <p className="font-sans text-[11px] text-blue-500 mt-0.5 truncate max-w-xs">{cert.credential_url}</p>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCertification(i)}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-400 transition-all mt-1"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            ) : (
              <p className="font-sans text-[13px] text-slate-300 italic">No certifications added yet.</p>
            )}

            {showCertForm && (
              <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-6">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="bg-white rounded-2xl border border-stone-200 p-6 w-full max-w-[520px] shadow-xl"
                >
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="font-bold text-[16px] text-slate-900">Add Certification</h3>
                    <button onClick={() => setShowCertForm(false)} className="text-slate-400 hover:text-slate-600">
                      <XCircle size={18} />
                    </button>
                  </div>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label-xs mr-3">Certification Name *</label>
                        <input
                          className="form-input"
                          value={newCert.name}
                          onChange={e => setNewCert(p => ({ ...p, name: e.target.value }))}
                          placeholder="e.g. AWS Solutions Architect"
                          autoFocus
                        />
                      </div>
                      <div>
                        <label className="label-xs mr-3">Issuing Organization *</label>
                        <input
                          className="form-input"
                          value={newCert.issuer}
                          onChange={e => setNewCert(p => ({ ...p, issuer: e.target.value }))}
                          placeholder="e.g. Amazon Web Services"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label-xs mr-3">Issue Date</label>
                        <input
                          className="form-input"
                          value={newCert.issue_date}
                          onChange={e => setNewCert(p => ({ ...p, issue_date: e.target.value }))}
                          placeholder="e.g. March 2024"
                        />
                      </div>
                      <div>
                        <label className="label-xs mr-3">Expiration Date</label>
                        <input
                          className="form-input"
                          value={newCert.expiration_date}
                          onChange={e => setNewCert(p => ({ ...p, expiration_date: e.target.value }))}
                          placeholder="e.g. March 2027"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="label-xs mr-3">Credential ID</label>
                        <input
                          className="form-input"
                          value={newCert.credential_id}
                          onChange={e => setNewCert(p => ({ ...p, credential_id: e.target.value }))}
                          placeholder="Optional credential ID"
                        />
                      </div>
                      <div>
                        <label className="label-xs mr-3">Credential URL</label>
                        <input
                          className="form-input"
                          value={newCert.credential_url}
                          onChange={e => setNewCert(p => ({ ...p, credential_url: e.target.value }))}
                          placeholder="Optional verification link"
                        />
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-6">
                    <button
                      onClick={() => setShowCertForm(false)}
                      className="flex-1 font-sans text-[13px] font-semibold text-slate-500 border border-stone-200 py-2.5 rounded-xl hover:bg-stone-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleAddCertification}
                      disabled={!newCert.name.trim() || !newCert.issuer.trim()}
                      className="flex-1 font-sans text-[13px] font-semibold bg-slate-900 hover:bg-blue-600 disabled:opacity-40 text-white py-2.5 rounded-xl transition-colors"
                    >
                      Save Certification
                    </button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>

        </motion.div>
      )}

      {/* ── Tab: Document Vault ──────────────────────────────────────── */}
      {tab === "vault" && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="bg-white border border-stone-200 rounded-xl p-6">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-[15px] text-slate-900">
                Generated Documents ({resumes.length})
              </h2>
              <p className="font-sans text-[12px] text-slate-400">Fetched from ResumeHistory model</p>
            </div>

            {loadingResumes ? (
              <div className="flex justify-center py-8">
                <Loader2 size={20} className="animate-spin text-slate-300" />
              </div>
            ) : resumes.length === 0 ? (
              <div className="text-center py-10">
                <FileText size={28} className="text-stone-200 mx-auto mb-3" />
                <p className="font-sans text-[13px] text-slate-400">No documents yet. Tailor your first resume.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {resumes.map((r, i) => (
                  <motion.div
                    key={r.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="flex items-center justify-between p-4 border border-stone-100 rounded-xl hover:border-blue-300 hover:bg-blue-50/20 transition-all cursor-pointer"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[14px] text-slate-900 truncate">
                        {r.job_title || "Tailored Resume"}
                      </p>
                      <p className="font-sans text-[12px] text-slate-400 mt-0.5">
                        {r.company_name || <span className="italic">General Application</span>} ·{" "}
                        {new Date(r.created_at).toLocaleDateString("en-US", {
                          month: "long", day: "numeric", year: "numeric",
                        })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 ml-4">
                      <StatusBadge status={r.status} />
                      {r.status === "completed" && profile && (
                        <>
                          <PDFDownloadLink
                            document={<HarvardCV profile={profile} tailored={r.tailored_data} jobTitle={r.job_title} companyName={r.company_name} />}
                            fileName={`${r.job_title?.replace(/\s/g, "_")}_CV.pdf`}
                          >
                            {({ loading }) => (
                              <button
                                onClick={e => e.stopPropagation()}
                                className="font-sans text-[12px] font-semibold px-3 py-1.5 border border-stone-200 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-1.5"
                              >
                                {loading ? <Loader2 size={11} className="animate-spin" /> : <Download size={11} />} CV
                              </button>
                            )}
                          </PDFDownloadLink>
                          <button
                            onClick={e => e.stopPropagation()}
                            className="font-sans text-[12px] font-semibold px-3 py-1.5 border border-stone-200 rounded-lg text-slate-600 hover:border-blue-400 hover:text-blue-600 transition-all flex items-center gap-1.5"
                          >
                            <Download size={11} /> Letter
                          </button>
                        </>
                      )}
                      {r.status === "failed" && (
                        <button className="font-sans text-[12px] font-semibold px-3 py-1.5 border border-red-200 rounded-lg text-red-500 hover:bg-red-50 flex items-center gap-1.5">
                          <RefreshCw size={11} /> Retry
                        </button>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}