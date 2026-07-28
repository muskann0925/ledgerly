import React from "react";
import type { User } from "../types/users.types";
import { useDeleteUserMutation } from "../hooks/useUsers";
import { AlertTriangle, Trash2, Loader2, X } from "lucide-react";

interface UserDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
}

export const UserDeleteDialog: React.FC<UserDeleteDialogProps> = ({
  isOpen,
  onClose,
  user,
}) => {
  const deleteUserMutation = useDeleteUserMutation();

  if (!isOpen || !user) return null;

  const handleDelete = () => {
    deleteUserMutation.mutate(user.id, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full overflow-hidden flex flex-col p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">Delete User Account?</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
            Are you sure you want to permanently delete <strong className="text-slate-900 dark:text-slate-200">{user.name}</strong> (<span className="font-mono text-[11px]">{user.email}</span>)?
            This action cannot be undone and revokes all system access immediately.
          </p>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleDelete}
            disabled={deleteUserMutation.isPending}
            className="px-4 py-2.5 rounded-xl bg-rose-600 text-white hover:bg-rose-700 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {deleteUserMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4" />
            )}
            <span>Delete User</span>
          </button>
        </div>
      </div>
    </div>
  );
};
