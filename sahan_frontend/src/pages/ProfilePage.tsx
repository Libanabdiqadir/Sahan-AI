import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, User, Briefcase, FileText } from "lucide-react";
import { useProfileData } from "../hooks/useProfileData";
import { useSubscription } from "../hooks/useSubscription";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { PersonalInfoTab } from "../components/profile/PersonalInfoTab";
import { CareerDataTab } from "../components/profile/CareerDataTab";
import { ResumeVaultTab } from "../components/profile/ResumeVaultTab";
import { LimitModal } from "../components/LimitModal";
import { AlreadyProModal } from "../components/AlreadyProModal";

type Tab = "info" | "career" | "vault";

const TABS: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "info",   label: "Personal Info",  icon: User      },
  { id: "career", label: "Career Data",    icon: Briefcase },
  { id: "vault",  label: "Resume History", icon: FileText  },
];

export default function ProfilePage() {
  const [searchParams] = useSearchParams();
  const [tab, setTab] = useState<Tab>(() => {
    const p = searchParams.get("tab");
    return (p === "career" || p === "vault") ? p : "info";
  });

  const data         = useProfileData();
  const subscription = useSubscription();

  const [upgradeOpen,    setUpgradeOpen]    = useState(false);
  const [alreadyProOpen, setAlreadyProOpen] = useState(false);

  const isPro = (subscription?.plan ?? "free").toLowerCase() !== "free";

  const handleUpgradeClick = () => {
    if (isPro) setAlreadyProOpen(true);
    else        setUpgradeOpen(true);
  };

  const initials =
    `${data.user?.first_name?.[0] || ""}${data.user?.last_name?.[0] || ""}` ||
    data.user?.email?.[0]?.toUpperCase() ||
    "U";

  if (data.loadingProfile) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 size={24} className="animate-spin text-slate-300" />
      </div>
    );
  }

  return (
    <div className="max-w-[900px] mx-auto px-4 sm:px-6 py-6 sm:py-10">
      <ProfileHeader
        user={data.user}
        localUser={data.localUser}
        profile={data.profile}
        initials={initials}
        uploadingPic={data.uploadingPic}
        onProfilePictureChange={data.handleProfilePictureChange}
        subscription={subscription}
        onUpgradeClick={handleUpgradeClick}
      />

      {/* Tab bar — scrollable on narrow screens */}
      <div className="flex border-b border-stone-200 mb-6 overflow-x-auto scrollbar-none">
        {TABS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`flex items-center gap-2 font-sans text-[13px] font-medium px-4 sm:px-5 py-3 border-b-2 -mb-px transition-all whitespace-nowrap shrink-0 ${
              tab === id
                ? "text-slate-900 border-blue-600 font-semibold"
                : "text-slate-400 border-transparent hover:text-slate-700"
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === "info" && (
        <PersonalInfoTab
          editMode={data.editMode}
          setEditMode={data.setEditMode}
          nameDraft={data.nameDraft}
          setNameDraft={data.setNameDraft}
          draft={data.draft}
          setDraft={data.setDraft}
          profile={data.profile}
          user={data.user}
          saving={data.saving}
          saveProfile={data.saveProfile}
        />
      )}

      {tab === "career" && (
        <CareerDataTab
          draft={data.draft}
          setDraft={data.setDraft}

          hardSkills={data.hardSkills}
          setHardSkills={data.setHardSkills}
          softSkills={data.softSkills}
          setSoftSkills={data.setSoftSkills}
          handleAddSkill={data.handleAddSkill}
          removeSkill={data.removeSkill}

          languageInput={data.languageInput}
          setLanguageInput={data.setLanguageInput}
          handleAddLanguage={data.handleAddLanguage}

          showExpForm={data.showExpForm}
          setShowExpForm={data.setShowExpForm}
          newExp={data.newExp}
          setNewExp={data.setNewExp}
          handleAddExperience={data.handleAddExperience}
          handleDeleteExperience={data.handleDeleteExperience}

          showEduForm={data.showEduForm}
          setShowEduForm={data.setShowEduForm}
          newEdu={data.newEdu}
          setNewEdu={data.setNewEdu}
          handleAddEducation={data.handleAddEducation}
          handleDeleteEducation={data.handleDeleteEducation}

          showProjectForm={data.showProjectForm}
          setShowProjectForm={data.setShowProjectForm}
          newProject={data.newProject}
          setNewProject={data.setNewProject}
          handleAddProject={data.handleAddProject}
          handleDeleteProject={data.handleDeleteProject}

          showCertForm={data.showCertForm}
          setShowCertForm={data.setShowCertForm}
          newCert={data.newCert}
          setNewCert={data.setNewCert}
          handleAddCertification={data.handleAddCertification}
          handleDeleteCertification={data.handleDeleteCertification}
        />
      )}

      {tab === "vault" && <ResumeVaultTab profile={data.profile} />}

      {/* Free-user: payment details modal */}
      <LimitModal
        isOpen={upgradeOpen}
        plan={subscription?.plan ?? "free"}
        limit={subscription?.limit ?? 2}
        onClose={() => setUpgradeOpen(false)}
      />

      {/* Pro/Elite-user: already-subscribed confirmation modal */}
      <AlreadyProModal
        isOpen={alreadyProOpen}
        plan={subscription?.plan ?? "free"}
        limit={subscription?.limit ?? 2}
        onClose={() => setAlreadyProOpen(false)}
      />
    </div>
  );
}
