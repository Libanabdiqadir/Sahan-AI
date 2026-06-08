import { motion } from "framer-motion";
import { Edit3, Save, Loader2 } from "lucide-react";
import type { User, UserProfile } from "../../types";

interface Props {
  editMode: boolean;
  setEditMode: (v: boolean) => void;
  nameDraft: { first_name: string; last_name: string };
  setNameDraft: React.Dispatch<React.SetStateAction<{ first_name: string; last_name: string }>>;
  draft: Partial<UserProfile>;
  setDraft: React.Dispatch<React.SetStateAction<Partial<UserProfile>>>;
  profile: UserProfile | null;
  user: User | null | undefined;
  saving: boolean;
  saveProfile: () => void;
}

export function PersonalInfoTab({
  editMode, setEditMode,
  nameDraft, setNameDraft,
  draft, setDraft,
  profile, user,
  saving, saveProfile,
}: Props) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <div className="bg-white border border-stone-200 rounded-xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-bold text-[15px] text-slate-900">Contact Information</h2>
          {editMode ? (
            <div className="flex gap-2">
              <button
                onClick={() => setEditMode(false)}
                className="font-sans text-[12px] font-semibold text-slate-400 hover:text-slate-600 px-3 py-1.5 border border-stone-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={saveProfile}
                disabled={saving}
                className="font-sans text-[12px] font-semibold text-white bg-slate-900 hover:bg-blue-600 px-4 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Save
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditMode(true)}
              className="font-sans text-[12px] font-semibold text-blue-600 px-3 py-1.5 border border-blue-200 rounded-lg hover:bg-blue-50 flex items-center gap-1.5"
            >
              <Edit3 size={12} /> Edit
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(["first_name", "last_name"] as const).map(k => (
            <div key={k}>
              <label className="label-xs mr-2">{k === "first_name" ? "First Name" : "Last Name"}</label>
              {editMode ? (
                <input
                  className="form-input"
                  value={nameDraft[k]}
                  onChange={e => setNameDraft(d => ({ ...d, [k]: e.target.value }))}
                  placeholder={k === "first_name" ? "Ahmed" : "Hassan"}
                />
              ) : (
                <p className="font-sans text-[14px] text-slate-900 py-2">
                  {user?.[k] || <span className="text-slate-300 italic text-[13px]">Not set</span>}
                </p>
              )}
            </div>
          ))}

          {[
            { label: "Full Name",      key: "full_name"      as const, placeholder: "Your full name"      },
            { label: "Contact Email",  key: "contact_email"  as const, placeholder: "contact@email.com"   },
            { label: "Phone Number",   key: "phone_number"   as const, placeholder: "+1 234 567 8900"     },
            { label: "Location",       key: "location"       as const, placeholder: "City, Country"       },
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
  );
}
