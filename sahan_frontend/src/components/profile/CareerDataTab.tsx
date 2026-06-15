import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase, FileText, Plus, Trash2, XCircle, CheckCircle2, X, Eye,
} from "lucide-react";
import type {
  UserProfile, EducationEntry, ExperienceEntry, ProjectEntry, CertificationEntry,
} from "../../types";

function SkillChip({ label, onRemove }: { label: string; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1.5 font-sans text-[12px] font-medium px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
      {label}
      <button onClick={onRemove} className="text-blue-400 hover:text-red-400 transition-all">
        <XCircle size={11} />
      </button>
    </span>
  );
}

export interface CareerDataTabProps {
  draft: Partial<UserProfile>;
  setDraft: React.Dispatch<React.SetStateAction<Partial<UserProfile>>>;

  hardSkills: string;
  setHardSkills: (v: string) => void;
  softSkills: string;
  setSoftSkills: (v: string) => void;
  handleAddSkill: (category: "skills" | "soft_skills") => void;
  removeSkill: (type: "tech_skills" | "soft_skills", idx: number) => void;

  languageInput: string;
  setLanguageInput: (v: string) => void;
  handleAddLanguage: () => void;

  showExpForm: boolean;
  setShowExpForm: (v: boolean) => void;
  newExp: ExperienceEntry;
  setNewExp: React.Dispatch<React.SetStateAction<ExperienceEntry>>;
  handleAddExperience: () => void;
  handleDeleteExperience: (idx: number) => void;

  showEduForm: boolean;
  setShowEduForm: (v: boolean) => void;
  newEdu: EducationEntry;
  setNewEdu: React.Dispatch<React.SetStateAction<EducationEntry>>;
  handleAddEducation: () => void;
  handleDeleteEducation: (idx: number) => void;

  showProjectForm: boolean;
  setShowProjectForm: (v: boolean) => void;
  newProject: ProjectEntry;
  setNewProject: React.Dispatch<React.SetStateAction<ProjectEntry>>;
  handleAddProject: () => void;
  handleDeleteProject: (idx: number) => void;

  showCertForm: boolean;
  setShowCertForm: (v: boolean) => void;
  newCert: CertificationEntry;
  setNewCert: React.Dispatch<React.SetStateAction<CertificationEntry>>;
  handleAddCertification: () => void;
  handleDeleteCertification: (idx: number) => void;
}

type DetailItem =
  | { type: "exp"; data: ExperienceEntry }
  | { type: "project"; data: ProjectEntry };

export function CareerDataTab(props: CareerDataTabProps) {
  const {
    draft, setDraft,
    hardSkills, setHardSkills, softSkills, setSoftSkills, handleAddSkill, removeSkill,
    languageInput, setLanguageInput, handleAddLanguage,
    showExpForm, setShowExpForm, newExp, setNewExp, handleAddExperience, handleDeleteExperience,
    showEduForm, setShowEduForm, newEdu, setNewEdu, handleAddEducation, handleDeleteEducation,
    showProjectForm, setShowProjectForm, newProject, setNewProject, handleAddProject, handleDeleteProject,
    showCertForm, setShowCertForm, newCert, setNewCert, handleAddCertification, handleDeleteCertification,
  } = props;

  const [expRespInput,       setExpRespInput]       = useState("");
  const [projHighlightInput, setProjHighlightInput] = useState("");
  const [detailItem,         setDetailItem]         = useState<DetailItem | null>(null);

  useEffect(() => { if (!showExpForm)     setExpRespInput(""); },       [showExpForm]);
  useEffect(() => { if (!showProjectForm) setProjHighlightInput(""); }, [showProjectForm]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

      {/* ── Work Experience ──────────────────────────────────────────── */}
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[15px] text-slate-900">Work Experience</h2>
          <button onClick={() => setShowExpForm(true)} className="font-sans text-[13px] font-semibold text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-1.5">
            <Plus size={12} /> Add
          </button>
        </div>
        {(draft.work_experience ?? []).length > 0 ? (
          (draft.work_experience ?? []).map((exp, i) => (
            <div
              key={i}
              onClick={() => setDetailItem({ type: "exp", data: exp })}
              className="flex items-start justify-between p-4 border border-stone-100 rounded-xl mb-3 group cursor-pointer hover:border-blue-200 hover:bg-blue-50/20 transition-all"
            >
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center shrink-0 mt-0.5">
                  <Briefcase size={15} className="text-blue-600" />
                </div>
                <div>
                  <p className="font-semibold text-[14px] text-slate-900">{exp.role}</p>
                  <p className="font-sans text-[12px] text-slate-400 mt-0.5">{exp.company} · {exp.duration}</p>
                  {exp.responsibilities.length > 0 && (
                    <p className="font-sans text-[11px] text-slate-300 mt-1">
                      {exp.responsibilities.length} responsibilit{exp.responsibilities.length === 1 ? "y" : "ies"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1 shrink-0">
                <Eye size={12} className="text-blue-300 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={e => { e.stopPropagation(); handleDeleteExperience(i); }}
                  className="p-1.5 text-slate-300 hover:text-red-400 transition-all rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="font-sans text-[13px] text-slate-300 italic">No work experience added yet.</p>
        )}

        {showExpForm && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 w-full max-w-[480px] shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[16px] text-slate-900">Add Work Experience</h3>
                <button onClick={() => setShowExpForm(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-stone-100 rounded-lg transition-colors"><XCircle size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label-xs mr-3">Job Title</label>
                  <input className="form-input" value={newExp.role} onChange={e => setNewExp(p => ({ ...p, role: e.target.value }))} placeholder="e.g. Senior Frontend Developer" autoFocus />
                </div>
                <div>
                  <label className="label-xs mr-3">Company</label>
                  <input className="form-input" value={newExp.company} onChange={e => setNewExp(p => ({ ...p, company: e.target.value }))} placeholder="e.g. Stripe" />
                </div>
                <div>
                  <label className="label-xs mr-3">Duration</label>
                  <input className="form-input" value={newExp.duration} onChange={e => setNewExp(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. Jan 2022 – Present" />
                </div>
                <div>
                  <label className="label-xs block mb-2">Key Responsibilities</label>
                  <input
                    className="form-input w-full"
                    value={expRespInput}
                    onChange={e => setExpRespInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && expRespInput.trim()) {
                        e.preventDefault();
                        setNewExp(p => ({ ...p, responsibilities: [...p.responsibilities, expRespInput.trim()] }));
                        setExpRespInput("");
                      }
                    }}
                    placeholder="Type a responsibility and press Enter ↵"
                  />
                  {newExp.responsibilities.length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {newExp.responsibilities.map((r, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[13px] text-slate-700 bg-stone-50 rounded-lg px-3 py-2 group/bullet">
                          <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-[5px] shrink-0" />
                          <span className="flex-1 leading-snug">{r}</span>
                          <button
                            onClick={() => setNewExp(p => ({ ...p, responsibilities: p.responsibilities.filter((_, ri) => ri !== idx) }))}
                            className="text-slate-300 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover/bullet:opacity-100"
                          >
                            <X size={11} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowExpForm(false)} className="flex-1 font-sans text-[13px] font-semibold text-slate-500 border border-stone-200 py-2.5 rounded-xl hover:bg-stone-50 transition-colors">Cancel</button>
                <button onClick={handleAddExperience} disabled={!newExp.role.trim() || !newExp.company.trim()} className="flex-1 font-sans text-[13px] font-semibold bg-slate-900 hover:bg-blue-600 disabled:opacity-40 text-white py-2.5 rounded-xl transition-colors">Save Experience</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* ── Education ────────────────────────────────────────────────── */}
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[15px] text-slate-900">Education</h2>
          <button onClick={() => setShowEduForm(true)} className="font-sans text-[13px] font-semibold text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-1.5">
            <Plus size={12} /> Add
          </button>
        </div>
        {(draft.education_history ?? []).length > 0 ? (
          (draft.education_history ?? []).map((edu, i) => (
            <div key={i} className="flex items-start justify-between p-4 border border-stone-100 rounded-xl mb-3 group">
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-lg bg-violet-50 flex items-center justify-center shrink-0 mt-0.5"><FileText size={15} className="text-violet-600" /></div>
                <div>
                  <p className="font-semibold text-[14px] text-slate-900">{edu.degree}</p>
                  <p className="font-sans text-[12px] text-slate-400 mt-0.5">{edu.university} · {edu.graduation_year}</p>
                </div>
              </div>
              <button onClick={() => handleDeleteEducation(i)} className="p-1.5 text-slate-300 hover:text-red-400 transition-all mt-0.5 rounded-lg hover:bg-red-50 shrink-0"><Trash2 size={13} /></button>
            </div>
          ))
        ) : (
          <p className="font-sans text-[13px] text-slate-300 italic">No education added yet.</p>
        )}
        {showEduForm && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 w-full max-w-[440px] shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[16px] text-slate-900">Add Education</h3>
                <button onClick={() => setShowEduForm(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-stone-100 rounded-lg transition-colors"><XCircle size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="label-xs mr-3">Degree / Qualification</label>
                  <input className="form-input" value={newEdu.degree} onChange={e => setNewEdu(p => ({ ...p, degree: e.target.value }))} placeholder="e.g. B.Sc. Computer Science" autoFocus />
                </div>
                <div>
                  <label className="label-xs mr-3">University / Institution</label>
                  <input className="form-input" value={newEdu.university} onChange={e => setNewEdu(p => ({ ...p, university: e.target.value }))} placeholder="e.g. University of Hargeisa" />
                </div>
                <div>
                  <label className="label-xs mr-3">Graduation Year</label>
                  <input className="form-input" value={newEdu.graduation_year} onChange={e => setNewEdu(p => ({ ...p, graduation_year: e.target.value }))} placeholder="e.g. 2023" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowEduForm(false)} className="flex-1 font-sans text-[13px] font-semibold text-slate-500 border border-stone-200 py-2.5 rounded-xl hover:bg-stone-50 transition-colors">Cancel</button>
                <button onClick={handleAddEducation} disabled={!newEdu.degree.trim() || !newEdu.university.trim()} className="flex-1 font-sans text-[13px] font-semibold bg-slate-900 hover:bg-blue-600 disabled:opacity-40 text-white py-2.5 rounded-xl transition-colors">Save Education</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* ── Projects ─────────────────────────────────────────────────── */}
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[15px] text-slate-900">Projects</h2>
          <button onClick={() => setShowProjectForm(true)} className="font-sans text-[13px] font-semibold text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-1.5">
            <Plus size={12} /> Add
          </button>
        </div>
        {(draft.projects ?? []).length > 0 ? (
          (draft.projects ?? []).map((proj, i) => (
            <div
              key={i}
              onClick={() => setDetailItem({ type: "project", data: proj })}
              className="flex items-start justify-between p-4 border border-stone-100 rounded-xl mb-3 group cursor-pointer hover:border-emerald-200 hover:bg-emerald-50/20 transition-all"
            >
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-lg bg-emerald-50 flex items-center justify-center shrink-0 mt-0.5">
                  <FileText size={15} className="text-emerald-600" />
                </div>
                <div>
                  <p className="font-semibold text-[14px] text-slate-900">{proj.title}</p>
                  <p className="font-sans text-[12px] text-slate-400 mt-0.5">{proj.role_title}{proj.dates ? ` · ${proj.dates}` : ""}</p>
                  {proj.link && <p className="font-sans text-[11px] text-blue-500 mt-0.5 truncate max-w-xs">{proj.link}</p>}
                  {(proj.highlights ?? []).length > 0 && (
                    <p className="font-sans text-[11px] text-slate-300 mt-1">
                      {proj.highlights!.length} highlight{proj.highlights!.length === 1 ? "" : "s"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 mt-1 shrink-0">
                <Eye size={12} className="text-emerald-300 hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity" />
                <button
                  onClick={e => { e.stopPropagation(); handleDeleteProject(i); }}
                  className="p-1.5 text-slate-300 hover:text-red-400 transition-all rounded-lg hover:bg-red-50"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))
        ) : (
          <p className="font-sans text-[13px] text-slate-300 italic">No projects added yet.</p>
        )}

        {showProjectForm && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 w-full max-w-[520px] shadow-xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[16px] text-slate-900">Add Project</h3>
                <button onClick={() => setShowProjectForm(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-stone-100 rounded-lg transition-colors"><XCircle size={18} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-xs mr-3">Project Title *</label>
                    <input className="form-input" value={newProject.title} onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))} placeholder="e.g. E-Commerce Platform" autoFocus />
                  </div>
                  <div>
                    <label className="label-xs mr-3">Your Role</label>
                    <input className="form-input" value={newProject.role_title} onChange={e => setNewProject(p => ({ ...p, role_title: e.target.value }))} placeholder="e.g. Lead Developer" />
                  </div>
                </div>
                <div>
                  <label className="label-xs mr-3">Description</label>
                  <textarea className="form-input min-h-[80px] resize-none w-full" value={newProject.description} onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))} placeholder="Brief description of the project and your impact..." />
                </div>
                <div>
                  <label className="label-xs block mb-2">Key Highlights</label>
                  <input
                    className="form-input w-full"
                    value={projHighlightInput}
                    onChange={e => setProjHighlightInput(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Enter" && projHighlightInput.trim()) {
                        e.preventDefault();
                        setNewProject(p => ({ ...p, highlights: [...(p.highlights ?? []), projHighlightInput.trim()] }));
                        setProjHighlightInput("");
                      }
                    }}
                    placeholder="Type a highlight and press Enter ↵"
                  />
                  {(newProject.highlights ?? []).length > 0 && (
                    <ul className="mt-3 space-y-1.5">
                      {(newProject.highlights ?? []).map((h, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-[13px] text-slate-700 bg-stone-50 rounded-lg px-3 py-2 group/bullet">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-[5px] shrink-0" />
                          <span className="flex-1 leading-snug">{h}</span>
                          <button
                            onClick={() => setNewProject(p => ({ ...p, highlights: (p.highlights ?? []).filter((_, hi) => hi !== idx) }))}
                            className="text-slate-300 hover:text-red-400 transition-colors shrink-0 opacity-0 group-hover/bullet:opacity-100"
                          >
                            <X size={11} />
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-xs mr-3">Link / URL</label>
                    <input className="form-input" value={newProject.link} onChange={e => setNewProject(p => ({ ...p, link: e.target.value }))} placeholder="github.com/you/project" />
                  </div>
                  <div>
                    <label className="label-xs mr-3">Dates</label>
                    <input className="form-input" value={newProject.dates} onChange={e => setNewProject(p => ({ ...p, dates: e.target.value }))} placeholder="e.g. Jan 2023 – Mar 2024" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowProjectForm(false)} className="flex-1 font-sans text-[13px] font-semibold text-slate-500 border border-stone-200 py-2.5 rounded-xl hover:bg-stone-50 transition-colors">Cancel</button>
                <button onClick={handleAddProject} disabled={!newProject.title.trim()} className="flex-1 font-sans text-[13px] font-semibold bg-slate-900 hover:bg-blue-600 disabled:opacity-40 text-white py-2.5 rounded-xl transition-colors">Save Project</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* ── Technical Skills ─────────────────────────────────────────── */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-6">
        <h2 className="font-bold text-[15px] text-slate-900 mb-4">Technical Skills</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {(draft.master_data?.tech_skills ?? []).map((s, i) => (
            <SkillChip key={i} label={s} onRemove={() => removeSkill("tech_skills", i)} />
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input className="form-input w-full sm:flex-1" value={hardSkills} onChange={e => setHardSkills(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddSkill("skills")} placeholder="Type a skill and press Enter" />
          <button onClick={() => handleAddSkill("skills")} className="w-full sm:w-auto font-sans text-[13px] font-semibold px-4 py-2.5 border border-blue-200 text-blue-600 rounded-lg hover:bg-blue-50 flex items-center justify-center gap-1.5 transition-colors shrink-0">
            <Plus size={13} /> Add Hard Skill
          </button>
        </div>
      </div>

      {/* ── Soft Skills ──────────────────────────────────────────────── */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-6">
        <h2 className="font-bold text-[15px] text-slate-900 mb-4">Soft Skills</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {(draft.master_data?.soft_skills ?? []).map((s, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 font-sans text-[12px] font-medium px-3 py-1 rounded-full bg-green-50 text-green-700 border border-green-200">
              {s}
              <button onClick={() => removeSkill("soft_skills", i)} className="hover:text-red-400 transition-all"><XCircle size={11} /></button>
            </span>
          ))}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input className="form-input w-full sm:flex-1" value={softSkills} onChange={e => setSoftSkills(e.target.value)} onKeyDown={e => e.key === "Enter" && handleAddSkill("soft_skills")} placeholder="Type a skill and press Enter" />
          <button onClick={() => handleAddSkill("soft_skills")} className="w-full sm:w-auto font-sans text-[13px] font-semibold px-4 py-2.5 border border-green-200 text-green-600 rounded-lg hover:bg-green-50 flex items-center justify-center gap-1.5 transition-colors shrink-0">
            <Plus size={13} /> Add Soft Skill
          </button>
        </div>
      </div>

      {/* ── Languages ───────────────────────────────────────────────── */}
      <div className="bg-white border border-stone-200 rounded-xl p-4 sm:p-6">
        <h2 className="font-bold text-[15px] text-slate-900 mb-4">Languages</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {(draft.languages ?? []).map((l, i) => (
            <span key={i} className="inline-flex items-center gap-1.5 font-sans text-[12px] font-medium px-3 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-200">
              {l}
              <button
                onClick={() => {
                  const updated = [...(draft.languages ?? [])];
                  updated.splice(i, 1);
                  setDraft(p => ({ ...p, languages: updated }));
                }}
                className="hover:text-red-400 transition-all"
              >
                <XCircle size={11} />
              </button>
            </span>
          ))}
          {!(draft.languages ?? []).length && <p className="font-sans text-[13px] text-slate-300 italic">No languages added yet.</p>}
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <input className="form-input w-full sm:flex-1" value={languageInput} onChange={e => setLanguageInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") handleAddLanguage(); }} placeholder="Add languages you speak" />
          <button onClick={handleAddLanguage} className="w-full sm:w-auto font-sans text-[13px] font-semibold px-4 py-2.5 border border-violet-200 text-violet-600 rounded-lg hover:bg-violet-50 flex items-center justify-center gap-1.5 transition-colors shrink-0">
            <Plus size={13} /> Add Language
          </button>
        </div>
      </div>

      {/* ── Certifications ──────────────────────────────────────────── */}
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-bold text-[15px] text-slate-900">Certifications</h2>
          <button onClick={() => setShowCertForm(true)} className="font-sans text-[13px] font-semibold text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-1.5">
            <Plus size={12} /> Add
          </button>
        </div>
        {(draft.certifications ?? []).length > 0 ? (
          (draft.certifications ?? []).map((cert, i) => (
            <div key={i} className="flex items-start justify-between p-4 border border-stone-100 rounded-xl mb-3 group">
              <div className="flex gap-3 items-start">
                <div className="w-9 h-9 rounded-lg bg-amber-50 flex items-center justify-center shrink-0 mt-0.5"><CheckCircle2 size={15} className="text-amber-600" /></div>
                <div>
                  <p className="font-semibold text-[14px] text-slate-900">{cert.name}</p>
                  <p className="font-sans text-[12px] text-slate-400 mt-0.5">
                    {cert.issuer}{cert.issue_date ? ` · ${cert.issue_date}` : ""}{cert.expiration_date ? ` – ${cert.expiration_date}` : ""}
                  </p>
                  {cert.credential_url && <p className="font-sans text-[11px] text-blue-500 mt-0.5 truncate max-w-xs">{cert.credential_url}</p>}
                </div>
              </div>
              <button onClick={() => handleDeleteCertification(i)} className="p-1.5 text-slate-300 hover:text-red-400 transition-all mt-0.5 rounded-lg hover:bg-red-50 shrink-0"><Trash2 size={13} /></button>
            </div>
          ))
        ) : (
          <p className="font-sans text-[13px] text-slate-300 italic">No certifications added yet.</p>
        )}
        {showCertForm && (
          <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div initial={{ opacity: 0, scale: 0.96, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="bg-white rounded-2xl border border-stone-200 p-4 sm:p-6 w-full max-w-[520px] shadow-xl">
              <div className="flex items-center justify-between mb-5">
                <h3 className="font-bold text-[16px] text-slate-900">Add Certification</h3>
                <button onClick={() => setShowCertForm(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-stone-100 rounded-lg transition-colors"><XCircle size={18} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-xs mr-3">Certification Name *</label>
                    <input className="form-input" value={newCert.name} onChange={e => setNewCert(p => ({ ...p, name: e.target.value }))} placeholder="e.g. AWS Solutions Architect" autoFocus />
                  </div>
                  <div>
                    <label className="label-xs mr-3">Issuing Organization *</label>
                    <input className="form-input" value={newCert.issuer} onChange={e => setNewCert(p => ({ ...p, issuer: e.target.value }))} placeholder="e.g. Amazon Web Services" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-xs mr-3">Issue Date</label>
                    <input className="form-input" value={newCert.issue_date} onChange={e => setNewCert(p => ({ ...p, issue_date: e.target.value }))} placeholder="e.g. March 2024" />
                  </div>
                  <div>
                    <label className="label-xs mr-3">Expiration Date</label>
                    <input className="form-input" value={newCert.expiration_date} onChange={e => setNewCert(p => ({ ...p, expiration_date: e.target.value }))} placeholder="e.g. March 2027" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="label-xs mr-3">Credential ID</label>
                    <input className="form-input" value={newCert.credential_id} onChange={e => setNewCert(p => ({ ...p, credential_id: e.target.value }))} placeholder="Optional credential ID" />
                  </div>
                  <div>
                    <label className="label-xs mr-3">Credential URL</label>
                    <input className="form-input" value={newCert.credential_url} onChange={e => setNewCert(p => ({ ...p, credential_url: e.target.value }))} placeholder="Optional verification link" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCertForm(false)} className="flex-1 font-sans text-[13px] font-semibold text-slate-500 border border-stone-200 py-2.5 rounded-xl hover:bg-stone-50 transition-colors">Cancel</button>
                <button onClick={handleAddCertification} disabled={!newCert.name.trim() || !newCert.issuer.trim()} className="flex-1 font-sans text-[13px] font-semibold bg-slate-900 hover:bg-blue-600 disabled:opacity-40 text-white py-2.5 rounded-xl transition-colors">Save Certification</button>
              </div>
            </motion.div>
          </div>
        )}
      </div>

      {/* ── Detail Pop-up Modal ──────────────────────────────────────── */}
      <AnimatePresence>
        {detailItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
            onClick={() => setDetailItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 24 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", damping: 28, stiffness: 320 }}
              className="bg-white rounded-2xl p-6 w-full max-w-lg shadow-2xl max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              {detailItem.type === "exp" ? (
                <>
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Briefcase size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[17px] text-slate-900 leading-tight">{detailItem.data.role}</h3>
                        <p className="font-sans text-[13px] text-slate-400 mt-0.5">{detailItem.data.company}</p>
                      </div>
                    </div>
                    <button onClick={() => setDetailItem(null)} className="text-slate-300 hover:text-slate-600 transition-colors ml-4 shrink-0 mt-0.5">
                      <X size={18} />
                    </button>
                  </div>
                  {detailItem.data.duration && (
                    <div className="mb-5">
                      <span className="font-sans text-[12px] font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-600">
                        {detailItem.data.duration}
                      </span>
                    </div>
                  )}
                  {detailItem.data.responsibilities.length > 0 ? (
                    <div>
                      <p className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider mb-3">Responsibilities</p>
                      <ul className="space-y-2.5">
                        {detailItem.data.responsibilities.map((r, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-[5px] shrink-0" />
                            <span className="text-[13px] text-slate-700 leading-snug">{r}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : (
                    <p className="font-sans text-[13px] text-slate-300 italic">No responsibilities recorded.</p>
                  )}
                </>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex gap-3 items-start">
                      <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
                        <FileText size={18} className="text-emerald-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[17px] text-slate-900 leading-tight">{detailItem.data.title}</h3>
                        <p className="font-sans text-[13px] text-slate-400 mt-0.5">{detailItem.data.role_title}</p>
                      </div>
                    </div>
                    <button onClick={() => setDetailItem(null)} className="text-slate-300 hover:text-slate-600 transition-colors ml-4 shrink-0 mt-0.5">
                      <X size={18} />
                    </button>
                  </div>
                  {detailItem.data.dates && (
                    <div className="mb-5">
                      <span className="font-sans text-[12px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600">
                        {detailItem.data.dates}
                      </span>
                    </div>
                  )}
                  {detailItem.data.description && (
                    <div className="mb-5">
                      <p className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider mb-2">Description</p>
                      <p className="text-[13px] text-slate-700 leading-relaxed">{detailItem.data.description}</p>
                    </div>
                  )}
                  {(detailItem.data.highlights ?? []).length > 0 && (
                    <div className="mb-5">
                      <p className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider mb-3">Highlights</p>
                      <ul className="space-y-2.5">
                        {(detailItem.data.highlights ?? []).map((h, i) => (
                          <li key={i} className="flex items-start gap-2.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-[5px] shrink-0" />
                            <span className="text-[13px] text-slate-700 leading-snug">{h}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {detailItem.data.link && (
                    <div>
                      <p className="font-semibold text-[11px] text-slate-400 uppercase tracking-wider mb-2">Link</p>
                      <p className="font-sans text-[13px] text-blue-500 break-all">{detailItem.data.link}</p>
                    </div>
                  )}
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}
