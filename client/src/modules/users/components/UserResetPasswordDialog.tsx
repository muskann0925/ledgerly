import React, { useState } from "react";
import type { User } from "../types/users.types";
import { useResetUserPasswordMutation } from "../hooks/useUsers";
import { X, KeyRound, Save, Loader2 } from "lucide-react";

interface UserResetPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const UserResetPasswordDialog: React.FC<UserResetPasswordDialogProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const [newPassword, setNewPassword] = useState("");
  const resetPasswordMutation = useResetUserPasswordMutation();

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) return;

    resetPasswordMutation.mutate(
      { id: user.id, newPassword },
      {
        onSuccess: () => {
          setNewPassword("");
          onClose();
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 flex items-center justify-center">
              <KeyRound className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Reset User Password</h2>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">{user.name}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              New Account Password *
            </label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#182235] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={newPassword.length < 6 || resetPasswordMutation.isPending}
              className="px-4 py-2 rounded-xl bg-[#F97316] text-white hover:bg-orange-600 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {resetPasswordMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Reset Password</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
