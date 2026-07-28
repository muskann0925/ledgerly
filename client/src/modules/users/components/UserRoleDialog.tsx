import React, { useState } from "react";
import type { User, UserRole } from "../types/users.types";
import { useChangeUserRoleMutation } from "../hooks/useUsers";
import { X, ShieldCheck, Save, Loader2 } from "lucide-react";

interface UserRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  actorRole?: UserRole;
}

export const UserRoleDialog: React.FC<UserRoleDialogProps> = ({
  isOpen,
  onClose,
  user,
  actorRole = "OWNER",
}) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>("SALES");
  const changeRoleMutation = useChangeUserRoleMutation();

  React.useEffect(() => {
    if (user) {
      setSelectedRole(user.role);
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    changeRoleMutation.mutate(
      { id: user.id, role: selectedRole },
      { onSuccess: () => onClose() }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">Change User Role</h2>
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
              Select Role
            </label>
            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value as UserRole)}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#182235] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            >
              <option value="SALES">Sales Agent (Invoices, Quotations, Clients)</option>
              <option value="FINANCE">Finance Manager (Payments, Expenses, Taxes)</option>
              <option value="ADMIN">Administrator (Full operational access)</option>
              {actorRole === "OWNER" && (
                <option value="OWNER">Owner (Full system control)</option>
              )}
              <option value="VIEWER">Viewer (Read-only access)</option>
            </select>
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
              disabled={changeRoleMutation.isPending}
              className="px-4 py-2 rounded-xl bg-[#F97316] text-white hover:bg-orange-600 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {changeRoleMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Save className="w-3.5 h-3.5" />
              )}
              <span>Update Role</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
