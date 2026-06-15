import { Plus, X } from "lucide-react";
import type { UserProfile } from "../../types";

function SidebarSection({ title, children, onAdd }: { title: string; children: React.ReactNode; onAdd?: () => void }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <p className="font-sans text-[11px] font-bold text-slate-400 uppercase tracking-[0.8px]">{title}</p>
        {onAdd && (
          <button onClick={onAdd} className="font-sans text-[11px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-0.5">
            <Plus size={12} /> Add
          </button>
        )}
      </div>
      {children}
    </div>
  );
}

function MiniCard({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="bg-stone-50 border border-stone-200 rounded-lg p-3 mb-2">
      <p className="font-semibold text-[13px] text-slate-900 break-words leading-snug">{title}</p>
      <p className="font-sans text-[11px] text-slate-400 mt-0.5 break-words leading-snug">{sub}</p>
    </div>
  );
}

function SkillTag({ label, variant = "blue" }: { label: string; variant?: "blue" | "green" | "purple" }) {
  const cls = {
    blue:   "bg-blue-50 text-blue-700 border-blue-200",
    green:  "bg-green-50 text-green-700 border-green-200",
    purple: "bg-violet-50 text-violet-700 border-violet-200",
  }[variant];
  return <span className={`font-sans text-[11px] font-medium px-2.5 py-1 rounded-full border ${cls}`}>{label}</span>;
}

interface Props {
  profile: UserProfile | null;
  onAddProject: () => void;
  onAddCert: () => void;
  isOpen?: boolean;
  onClose?: () => void;
}

export function ProfileSidebar({ profile, onAddProject, onAddCert, isOpen, onClose }: Props) {
  return (
    <>
      {/* Mobile overlay backdrop */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 z-30 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        />
      )}

      <aside className={`
        bg-white border-r border-stone-200 overflow-y-auto p-4 sm:p-5 shrink-0
        md:block md:w-[300px] lg:w-[320px] md:relative md:z-auto md:translate-x-0
        fixed inset-y-[60px] left-0 z-40 w-[min(300px,88vw)] transition-transform duration-300
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:inset-auto md:h-auto
      `}>
      <div className="flex items-center justify-between mb-1">
        <h2 className="font-bold text-[14px] text-slate-900">Master Profile</h2>
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-stone-100 transition-colors"
            aria-label="Close profile panel"
          >
            <X size={16} />
          </button>
        )}
      </div>
      <p className="font-sans text-[12px] text-slate-400 mb-5 leading-relaxed">Your career data is stored once and used for every tailored resume.</p>

      {profile ? (
        <>
          <SidebarSection title="Work Experience">
            {profile.work_experience?.length > 0
              ? profile.work_experience.map((exp, i) => <MiniCard key={i} title={exp.role} sub={`${exp.company} · ${exp.duration}`} />)
              : <p className="font-sans text-[12px] text-slate-300 italic">No experience added yet</p>}
          </SidebarSection>

          <SidebarSection title="Education">
            {profile.education_history?.length > 0
              ? profile.education_history.map((edu, i) => <MiniCard key={i} title={edu.degree} sub={`${edu.university} · ${edu.graduation_year}`} />)
              : <p className="font-sans text-[12px] text-slate-300 italic">No education added yet</p>}
          </SidebarSection>

          <SidebarSection title="Technical Skills">
            <div className="flex flex-wrap gap-1.5">
              {(profile.master_data?.tech_skills || []).map(s => <SkillTag key={s} label={s} variant="blue" />)}
              {!profile.master_data?.tech_skills?.length && <p className="font-sans text-[12px] text-slate-300 italic">None added</p>}
            </div>
          </SidebarSection>

          <SidebarSection title="Soft Skills">
            <div className="flex flex-wrap gap-1.5">
              {(profile.master_data?.soft_skills || []).map(s => <SkillTag key={s} label={s} variant="green" />)}
              {!profile.master_data?.soft_skills?.length && <p className="font-sans text-[12px] text-slate-300 italic">None added</p>}
            </div>
          </SidebarSection>

          <SidebarSection title="Languages">
            <div className="flex flex-wrap gap-1.5">
              {(profile.languages || []).map(l => <SkillTag key={l} label={l} variant="purple" />)}
              {!profile.languages?.length && <p className="font-sans text-[12px] text-slate-300 italic">None added</p>}
            </div>
          </SidebarSection>

          <SidebarSection title="Projects" onAdd={onAddProject}>
            {(profile.projects ?? []).length > 0
              ? (profile.projects ?? []).map((proj, i) => (
                  <MiniCard key={i} title={proj.title} sub={[proj.role_title, proj.dates].filter(Boolean).join(" · ")} />
                ))
              : <p className="font-sans text-[12px] text-slate-300 italic">No projects added yet</p>}
          </SidebarSection>

          <SidebarSection title="Certifications" onAdd={onAddCert}>
            {(profile.certifications ?? []).length > 0
              ? (profile.certifications ?? []).map((cert, i) => (
                  <MiniCard key={i} title={cert.name} sub={[cert.issuer, cert.issue_date].filter(Boolean).join(" · ")} />
                ))
              : <p className="font-sans text-[12px] text-slate-300 italic">No certifications added yet</p>}
          </SidebarSection>
        </>
      ) : (
        <div className="space-y-2">
          {[80, 60, 70, 50].map((w, i) => (
            <div key={i} className="h-10 bg-stone-100 rounded-lg animate-pulse" style={{ width: `${w}%` }} />
          ))}
        </div>
      )}
    </aside>
    </>
  );
}
