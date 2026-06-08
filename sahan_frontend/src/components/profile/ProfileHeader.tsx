import { motion } from "framer-motion";
import { Loader2, Camera } from "lucide-react";
import type { User, UserProfile } from "../../types";

interface Props {
  user: User | null | undefined;
  localUser: User | null | undefined;
  profile: UserProfile | null;
  initials: string;
  uploadingPic: boolean;
  onProfilePictureChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProfileHeader({ user, localUser, profile, initials, uploadingPic, onProfilePictureChange }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-stone-200 rounded-2xl p-6 mb-6 flex items-center gap-6"
    >
      <div className="relative group cursor-pointer" onClick={() => document.getElementById("pic-upload")?.click()}>
        <div className="w-[72px] h-[72px] rounded-full bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center text-white text-2xl font-bold font-sans shrink-0 overflow-hidden">
          {localUser?.profile_picture
            ? <img src={localUser.profile_picture} alt="avatar" className="w-full h-full object-cover" />
            : initials}
        </div>
        <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          {uploadingPic ? <Loader2 size={18} className="text-white animate-spin" /> : <Camera size={18} className="text-white" />}
        </div>
        <input
          id="pic-upload"
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={onProfilePictureChange}
        />
      </div>

      <div className="flex-1">
        <h1 className="text-[22px] font-bold text-slate-900 tracking-tight">
          {profile?.full_name || `${user?.first_name} ${user?.last_name}`.trim() || user?.email}
        </h1>
        <p className="font-sans text-[13px] text-slate-400 mt-0.5">
          {user?.email} · {profile?.location || "Location not set"}
        </p>
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
  );
}
