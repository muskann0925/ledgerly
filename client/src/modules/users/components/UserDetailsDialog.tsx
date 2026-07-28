import React from "react";
import type { User } from "../types/users.types";
import {
  X,
  Mail,
  Phone,
  Building,
  ShieldCheck,
  Clock,
  Calendar,
  CheckCircle,
  XCircle,
} from "lucide-react";

interface UserDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  if (!isOpen || !user) return null;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "OWNER":
        return "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border-purple-200 dark:border-purple-900/40";
      case "ADMIN":
        return "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-900/40";
      case "FINANCE":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/40";
      case "SALES":
        return "bg-orange-100 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-900/40";
      default:
        return "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
        {/* Header Banner */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 text-white relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/80 transition-all"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-4">
            {user.profileImage ? (
              <img
                src={user.profileImage}
                alt={user.name}
                className="w-16 h-16 rounded-2xl object-cover border-2 border-white/20 shadow-md"
              />
            ) : (
              <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white font-extrabold text-xl flex items-center justify-center border-2 border-white/20 shadow-md">
                {user.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <h2 className="text-lg font-bold">{user.name}</h2>
              <p className="text-xs text-slate-300 flex items-center gap-1 mt-0.5">
                <Mail className="w-3.5 h-3.5" />
                <span>{user.email}</span>
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border uppercase tracking-wider ${getRoleBadge(
                    user.role
                  )}`}
                >
                  {user.role}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${
                    user.isActive
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {user.isActive ? (
                    <>
                      <CheckCircle className="w-3 h-3 text-emerald-400" />
                      <span>Active</span>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-3 h-3 text-rose-400" />
                      <span>Inactive</span>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Body Details */}
        <div className="p-6 space-y-4 text-xs text-slate-700 dark:text-slate-300">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#182235] border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Phone className="w-3 h-3" /> Phone Number
              </span>
              <p className="font-bold text-slate-900 dark:text-white">
                {user.phone || "Not specified"}
              </p>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-[#182235] border border-slate-100 dark:border-slate-800 space-y-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                <Building className="w-3 h-3" /> Department
              </span>
              <p className="font-bold text-slate-900 dark:text-white">
                {user.department || "General"}
              </p>
            </div>
          </div>

          <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-3">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" /> Last Login Activity
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : "Never logged in"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" /> Account Created Date
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> Email Verified
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {user.emailVerified ? "Yes" : "No"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-slate-400" /> 2FA Authentication
              </span>
              <span
                className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                  user.twoFactorEnabled
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300"
                    : "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                }`}
              >
                {user.twoFactorEnabled ? "Enabled" : "Disabled"}
              </span>
            </div>
          </div>

          {/* Footer Action */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold transition-all"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
