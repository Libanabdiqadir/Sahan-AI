import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Loader2, User, Briefcase, FileText } from "lucide-react";
import { useProfileData } from "../hooks/useProfileData";
import { ProfileHeader } from "../components/profile/ProfileHeader";
import { PersonalInfoTab } from "../components/profile/PersonalInfoTab";
import { CareerDataTab } from "../components/profile/CareerDataTab";
import { ResumeVaultTab } from "../components/profile/ResumeVaultTab";

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

  const data = useProfileData();
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
    <div className="max-w-[900px] mx-auto px-6 py-10">
      <ProfileHeader
        user={data.user}
        localUser={data.localUser}
        profile={data.profile}
        initials={initials}
        uploadingPic={data.uploadingPic}
        onProfilePictureChange={data.handleProfilePictureChange}
      />

      {/* Tab bar */}
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
    </div>
  );
}
