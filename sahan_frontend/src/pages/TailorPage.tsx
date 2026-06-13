import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { SlidersHorizontal } from "lucide-react";
import { profileApi } from "../services/api";
import { LimitModal } from "../components/LimitModal";
import { useTailorForm } from "../hooks/useTailorForm";
import { useResumeDownload } from "../hooks/useResumeDownload";
import { useQuickAddProfile } from "../hooks/useQuickAddProfile";
import { ProfileSidebar } from "../components/tailor/ProfileSidebar";
import { TailorForm } from "../components/tailor/TailorForm";
import { ResumePreviewCard, ResumeErrorCard } from "../components/tailor/ResumePreviewCard";
import { TemplatePickerModal } from "../components/tailor/TemplatePickerModal";
import { GenerationChoiceModal } from "../components/tailor/GenerationChoiceModal";
import { QuickAddProjectModal, QuickAddCertModal } from "../components/tailor/QuickAddModals";
import type { UserProfile, Template, GenerationMode } from "../types";

export default function TailorPage() {
  const [profile, setProfile]             = useState<UserProfile | null>(null);
  const [template, setTemplate]           = useState<Template>("modern");
  const [modalOpen, setModalOpen]         = useState(false);
  const [coverOpen, setCoverOpen]         = useState(false);
  const [choiceOpen, setChoiceOpen]       = useState(false);
  const [selectedMode, setSelectedMode]   = useState<GenerationMode>("both");
  const [sidebarOpen, setSidebarOpen]     = useState(false);

  const form     = useTailorForm();
  const quickAdd = useQuickAddProfile(profile, p => setProfile(p));
  const download = useResumeDownload(
    profile,
    form.result?.tailored_data,
    form.jobTitle,
    form.companyName,
    template,
  );

  useEffect(() => {
    profileApi.get().then(setProfile).catch(() => {});
  }, []);

  const tailored = form.result?.tailored_data;

  return (
    <>
      <LimitModal
        isOpen={!!form.limitInfo}
        plan={form.limitInfo?.plan ?? "free"}
        limit={form.limitInfo?.limit ?? 2}
        onClose={() => form.setLimitInfo(null)}
      />

      <GenerationChoiceModal
        isOpen={choiceOpen}
        selected={selectedMode}
        onSelectMode={setSelectedMode}
        onClose={() => setChoiceOpen(false)}
        onConfirm={mode => {
          setSelectedMode(mode);
          setChoiceOpen(false);
          // Generation is triggered only by the main Generate button
        }}
      />

      <div className="flex h-[calc(100vh-60px)] overflow-hidden">
        <ProfileSidebar
          profile={profile}
          onAddProject={() => quickAdd.setProjectModalOpen(true)}
          onAddCert={() => quickAdd.setCertModalOpen(true)}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto bg-stone-50 p-4 sm:p-6">
          {/* Mobile: Profile panel toggle */}
          <div className="md:hidden mb-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex items-center gap-2 font-sans text-[13px] font-semibold text-slate-600 bg-white border border-stone-200 px-4 py-2.5 rounded-xl hover:border-blue-300 hover:text-blue-600 transition-colors"
            >
              <SlidersHorizontal size={14} />
              View Master Profile
            </button>
          </div>
          <TailorForm
            jobTitle={form.jobTitle}
            setJobTitle={form.setJobTitle}
            companyName={form.companyName}
            setCompanyName={form.setCompanyName}
            jobDescription={form.jobDescription}
            setJobDescription={form.setJobDescription}
            loading={form.loading}
            error={form.error}
            template={template}
            selectedMode={selectedMode}
            onOpenTemplateModal={() => setModalOpen(true)}
            onGenerate={async () => {
              await form.handleTailor(selectedMode);
              setSelectedMode("both");
            }}
            onOpenChoiceModal={() => setChoiceOpen(true)}
          />

          <AnimatePresence>
            {form.result && tailored && !tailored.error && profile && (
              <ResumePreviewCard
                result={form.result}
                tailored={tailored}
                profile={profile}
                template={template}
                jobTitle={form.jobTitle}
                companyName={form.companyName}
                coverOpen={coverOpen}
                onToggleCover={() => setCoverOpen(o => !o)}
                onDownloadCV={download.handleDownloadCV}
                onDownloadCoverLetter={download.handleDownloadCoverLetter}
                cvLoading={download.cvLoading}
                clLoading={download.clLoading}
                generationMode={form.generationMode}
              />
            )}
            {form.result && tailored?.error && (
              <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ResumeErrorCard error={tailored.error} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <TemplatePickerModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        template={template}
        setTemplate={setTemplate}
      />

      <QuickAddProjectModal
        isOpen={quickAdd.projectModalOpen}
        onClose={() => quickAdd.setProjectModalOpen(false)}
        newProject={quickAdd.newProject}
        setNewProject={quickAdd.setNewProject}
        onSave={quickAdd.handleQuickAddProject}
      />

      <QuickAddCertModal
        isOpen={quickAdd.certModalOpen}
        onClose={() => quickAdd.setCertModalOpen(false)}
        newCert={quickAdd.newCert}
        setNewCert={quickAdd.setNewCert}
        onSave={quickAdd.handleQuickAddCert}
      />
    </>
  );
}
