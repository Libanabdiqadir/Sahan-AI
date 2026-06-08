import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { ProjectEntry, CertificationEntry } from "../../types";

const SPRING = { type: "spring" as const, damping: 28, stiffness: 320 };

// ─── Quick-Add Project Modal ────────────────────────────────────────────────────
interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  newProject: ProjectEntry;
  setNewProject: React.Dispatch<React.SetStateAction<ProjectEntry>>;
  onSave: () => void;
}

export function QuickAddProjectModal({ isOpen, onClose, newProject, setNewProject, onSave }: ProjectModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={SPRING}
            className="bg-white rounded-2xl p-6 w-full max-w-[500px] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[16px] text-slate-900">Add Project</h3>
              <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-slate-400"><X size={15} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs mr-2">Project Title *</label>
                  <input
                    className="form-input"
                    value={newProject.title}
                    onChange={e => setNewProject(p => ({ ...p, title: e.target.value }))}
                    placeholder="e.g. Analytics Dashboard"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label-xs mr-2">Your Role</label>
                  <input
                    className="form-input"
                    value={newProject.role_title}
                    onChange={e => setNewProject(p => ({ ...p, role_title: e.target.value }))}
                    placeholder="e.g. Lead Developer"
                  />
                </div>
              </div>
              <div>
                <label className="label-xs mr-2">Description</label>
                <textarea
                  className="form-input resize-none w-full min-h-[72px]"
                  value={newProject.description}
                  onChange={e => setNewProject(p => ({ ...p, description: e.target.value }))}
                  placeholder="Brief description of impact..."
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs mr-2">Link</label>
                  <input
                    className="form-input"
                    value={newProject.link}
                    onChange={e => setNewProject(p => ({ ...p, link: e.target.value }))}
                    placeholder="github.com/you/project"
                  />
                </div>
                <div>
                  <label className="label-xs mr-2">Dates</label>
                  <input
                    className="form-input"
                    value={newProject.dates}
                    onChange={e => setNewProject(p => ({ ...p, dates: e.target.value }))}
                    placeholder="Jan 2023 – Mar 2024"
                  />
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={onClose} className="flex-1 font-sans text-[13px] font-semibold text-slate-500 border border-stone-200 py-2.5 rounded-xl hover:bg-stone-50">Cancel</button>
              <button
                onClick={onSave}
                disabled={!newProject.title.trim()}
                className="flex-1 font-sans text-[13px] font-semibold bg-slate-900 hover:bg-blue-600 disabled:opacity-40 text-white py-2.5 rounded-xl transition-colors"
              >
                Save Project
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─── Quick-Add Certification Modal ─────────────────────────────────────────────
interface CertModalProps {
  isOpen: boolean;
  onClose: () => void;
  newCert: CertificationEntry;
  setNewCert: React.Dispatch<React.SetStateAction<CertificationEntry>>;
  onSave: () => void;
}

export function QuickAddCertModal({ isOpen, onClose, newCert, setNewCert, onSave }: CertModalProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 12 }}
            transition={SPRING}
            className="bg-white rounded-2xl p-6 w-full max-w-[460px] shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-[16px] text-slate-900">Add Certification</h3>
              <button onClick={onClose} className="w-7 h-7 rounded-full hover:bg-stone-100 flex items-center justify-center text-slate-400"><X size={15} /></button>
            </div>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label-xs mr-2">Certification Name *</label>
                  <input
                    className="form-input"
                    value={newCert.name}
                    onChange={e => setNewCert(p => ({ ...p, name: e.target.value }))}
                    placeholder="e.g. AWS Solutions Architect"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="label-xs mr-2">Issuing Organization *</label>
                  <input
                    className="form-input"
                    value={newCert.issuer}
                    onChange={e => setNewCert(p => ({ ...p, issuer: e.target.value }))}
                    placeholder="e.g. Amazon"
                  />
                </div>
              </div>
              <div>
                <label className="label-xs mr-2">Issue Date</label>
                <input
                  className="form-input w-full"
                  value={newCert.issue_date}
                  onChange={e => setNewCert(p => ({ ...p, issue_date: e.target.value }))}
                  placeholder="e.g. March 2024"
                />
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={onClose} className="flex-1 font-sans text-[13px] font-semibold text-slate-500 border border-stone-200 py-2.5 rounded-xl hover:bg-stone-50">Cancel</button>
              <button
                onClick={onSave}
                disabled={!newCert.name.trim() || !newCert.issuer.trim()}
                className="flex-1 font-sans text-[13px] font-semibold bg-slate-900 hover:bg-blue-600 disabled:opacity-40 text-white py-2.5 rounded-xl transition-colors"
              >
                Save Certification
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
