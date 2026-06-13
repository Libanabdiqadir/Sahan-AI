import { motion, AnimatePresence } from "framer-motion";
import { FileText, Mail, Sparkles, X, Check } from "lucide-react";
import { useState, useEffect } from "react";
import type { GenerationMode } from "../../types";

interface Props {
  isOpen: boolean;
  selected: GenerationMode;
  onSelectMode: (mode: GenerationMode) => void;
  onClose: () => void;
  onConfirm: (mode: GenerationMode) => void;
}

const OPTIONS: {
  id: GenerationMode;
  icon: typeof FileText;
  label: string;
  desc: string;
}[] = [
  {
    id: "cv_only",
    icon: FileText,
    label: "Resume Only",
    desc: "A tailored CV matched to the job requirements.",
  },
  {
    id: "cover_letter_only",
    icon: Mail,
    label: "Cover Letter",
    desc: "A personalised cover letter for this role.",
  },
  {
    id: "both",
    icon: Sparkles,
    label: "Both Documents",
    desc: "Full application pack — CV and cover letter.",
  },
];

export function GenerationChoiceModal({ isOpen, selected, onSelectMode, onClose, onConfirm }: Props) {
  // Use local staging state so casually browsing options never mutates the parent.
  // Only the Confirm button commits the choice.
  const [staged, setStaged] = useState<GenerationMode>(selected);

  // Sync staged state when the modal opens so it always starts from the current selection.
  useEffect(() => {
    if (isOpen) setStaged(selected);
  }, [isOpen, selected]);

  const handleClose = () => {
    // Do NOT commit staged state — just close. Parent state is unchanged.
    onClose();
  };

  const handleConfirm = () => {
    onSelectMode(staged);
    onConfirm(staged);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-sm"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 24 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="bg-white rounded-2xl p-4 sm:p-6 w-full max-w-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-[17px] font-bold text-slate-900 tracking-tight">
                  What would you like to generate?
                </h2>
                <p className="font-sans text-[12px] text-slate-400 mt-1">
                  Our AI engine will tailor your documents to this specific role.
                </p>
              </div>
              <button
                onClick={handleClose}
                className="ml-4 p-1.5 rounded-lg hover:bg-stone-100 transition-colors shrink-0"
              >
                <X size={16} className="text-slate-400" />
              </button>
            </div>

            {/* Option cards — selecting only stages locally; Confirm commits */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
              {OPTIONS.map(({ id, icon: Icon, label, desc }) => {
                const active = staged === id;
                return (
                  <button
                    key={id}
                    onClick={() => setStaged(id)}
                    className={`flex flex-col items-center text-center p-4 rounded-xl border-2 transition-all ${
                      active
                        ? "border-blue-500 bg-blue-50"
                        : "border-stone-200 hover:border-blue-300 hover:bg-blue-50/30"
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 transition-colors ${
                        active ? "bg-blue-100" : "bg-stone-100"
                      }`}
                    >
                      <Icon
                        size={18}
                        className={active ? "text-blue-600" : "text-slate-500"}
                      />
                    </div>
                    <p
                      className={`font-semibold text-[13px] mb-1.5 ${
                        active ? "text-blue-700" : "text-slate-800"
                      }`}
                    >
                      {label}
                    </p>
                    <p className="font-sans text-[11px] text-slate-400 leading-snug">
                      {desc}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Confirm — commits the staged choice to parent and closes */}
            <button
              onClick={handleConfirm}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-sans font-semibold text-[14px] py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
            >
              <Check size={15} /> Confirm Selection
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
