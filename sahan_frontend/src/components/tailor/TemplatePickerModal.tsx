import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import type { Template } from "../../types";
import {
  ModernMiniPreview, ExecutiveMiniPreview, MinimalistMiniPreview,
  HarvardMiniPreview, BoldChronologicalMiniPreview,
} from "./TemplateThumbnails";

export const TEMPLATES: { id: Template; label: string; desc: string; badge?: string }[] = [
  { id: "modern",            label: "Modern Professional",   desc: "Two-column, skill chips, ATS-friendly",    badge: "⭐ Recommended" },
  { id: "minimalist",        label: "Modern Minimalist",     desc: "Clean SaaS design, slate palette",         badge: "✨ New"          },
  { id: "boldChronological", label: "Bold Chronological",    desc: "Editorial B&W, single-column serif",       badge: "✦ New"          },
  { id: "executive",         label: "Executive Navy",        desc: "Navy banner, gold accents, two-column"                              },
  { id: "harvard",           label: "Harvard Classic",       desc: "Traditional centered header, clean layout"                         },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
  setTemplate: (t: Template) => void;
}

export function TemplatePickerModal({ isOpen, onClose, template, setTemplate }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="bg-white rounded-2xl p-4 sm:p-5 w-full max-w-3xl shadow-2xl max-h-[85vh] flex flex-col"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-5">
              <div>
                <h3 className="font-bold text-[16px] text-slate-900 tracking-tight">Choose a Template</h3>
                <p className="font-sans text-[12px] text-slate-400 mt-0.5">Select a layout for your resume and cover letter</p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full hover:bg-stone-100 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div className="overflow-y-auto flex-1 -mr-1 pr-1">
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                {TEMPLATES.map(({ id, label, desc, badge }) => (
                  <motion.button
                    key={id}
                    type="button"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => { setTemplate(id); onClose(); }}
                    className={`relative rounded-xl border-2 p-2 text-left transition-colors ${
                      template === id ? "border-blue-600 bg-blue-50/60" : "border-stone-200 hover:border-blue-300 bg-white"
                    }`}
                  >
                    {badge && (
                      <span className="absolute top-1.5 right-1.5 font-sans text-[8px] font-bold text-blue-600 bg-blue-100 px-1.5 py-0.5 rounded-full z-10">
                        {badge}
                      </span>
                    )}
                    {id === "modern"            && <ModernMiniPreview />}
                    {id === "minimalist"        && <MinimalistMiniPreview />}
                    {id === "boldChronological" && <BoldChronologicalMiniPreview />}
                    {id === "executive"         && <ExecutiveMiniPreview />}
                    {id === "harvard"           && <HarvardMiniPreview />}
                    <div className="mt-1.5 flex items-start gap-1">
                      <div className={`w-2.5 h-2.5 mt-0.5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        template === id ? "border-blue-600" : "border-slate-300"
                      }`}>
                        {template === id && <div className="w-1 h-1 rounded-full bg-blue-600" />}
                      </div>
                      <div>
                        <p className="font-sans font-semibold text-[10.5px] text-slate-900 leading-tight">{label}</p>
                        <p className="font-sans text-[8.5px] text-slate-400 mt-0.5 leading-snug">{desc}</p>
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
