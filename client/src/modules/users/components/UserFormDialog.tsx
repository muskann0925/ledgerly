import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { User, UserRole } from "../types/users.types";
import {
  useCreateUserMutation,
  useUpdateUserMutation,
} from "../hooks/useUsers";
import { X, UserPlus, Save, Loader2 } from "lucide-react";

const userFormSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().optional(),
  phone: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),
  role: z.enum(["OWNER", "ADMIN", "SALES", "FINANCE", "VIEWER"]),
  department: z.string().nullable().optional(),
  isActive: z.boolean(),
  twoFactorEnabled: z.boolean(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

interface UserFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  userToEdit?: User | null;
  actorRole?: UserRole;
}

export const UserFormDialog: React.FC<UserFormDialogProps> = ({
  isOpen,
  onClose,
  userToEdit,
  actorRole = "OWNER",
}) => {
  const isEditing = !!userToEdit;
  const createUserMutation = useCreateUserMutation();
  const updateUserMutation = useUpdateUserMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(
      isEditing
        ? userFormSchema
        : userFormSchema.extend({
            password: z.string().min(6, "Password must be at least 6 characters"),
          })
    ),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      phone: "",
      profileImage: "",
      role: "SALES",
      department: "",
      isActive: true,
      twoFactorEnabled: false,
    },
  });

  useEffect(() => {
    if (userToEdit) {
      reset({
        name: userToEdit.name,
        email: userToEdit.email,
        password: "",
        phone: userToEdit.phone || "",
        profileImage: userToEdit.profileImage || "",
        role: userToEdit.role,
        department: userToEdit.department || "",
        isActive: userToEdit.isActive,
        twoFactorEnabled: !!userToEdit.twoFactorEnabled,
      });
    } else {
      reset({
        name: "",
        email: "",
        password: "",
        phone: "",
        profileImage: "",
        role: "SALES",
        department: "",
        isActive: true,
        twoFactorEnabled: false,
      });
    }
  }, [userToEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data: UserFormValues) => {
    if (isEditing && userToEdit) {
      updateUserMutation.mutate(
        {
          id: userToEdit.id,
          payload: {
            name: data.name,
            email: data.email,
            phone: data.phone || null,
            profileImage: data.profileImage || null,
            department: data.department || null,
            isActive: data.isActive,
            twoFactorEnabled: data.twoFactorEnabled,
          },
        },
        {
          onSuccess: () => onClose(),
        }
      );
    } else {
      createUserMutation.mutate(
        {
          name: data.name,
          email: data.email,
          password: data.password!,
          phone: data.phone || null,
          profileImage: data.profileImage || null,
          role: data.role as UserRole,
          department: data.department || null,
          isActive: data.isActive,
          twoFactorEnabled: data.twoFactorEnabled,
        },
        {
          onSuccess: () => onClose(),
        }
      );
    }
  };

  const isPending = createUserMutation.isPending || updateUserMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#F97316] flex items-center justify-center">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                {isEditing ? "Edit User Account" : "Create New User"}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {isEditing
                  ? "Update staff details and profile preferences"
                  : "Provision a new staff account with RBAC privileges"}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              {...register("name")}
              placeholder="e.g. Sarah Jenkins"
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#182235] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            {errors.name && (
              <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                {errors.name.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Work Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              {...register("email")}
              placeholder="s.jenkins@company.com"
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#182235] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            {errors.email && (
              <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                {errors.email.message}
              </span>
            )}
          </div>

          {!isEditing && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Account Password <span className="text-rose-500">*</span>
              </label>
              <input
                type="password"
                {...register("password")}
                placeholder="At least 6 characters"
                className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#182235] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
              {errors.password && (
                <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                  {errors.password.message}
                </span>
              )}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Phone Number
              </label>
              <input
                type="text"
                {...register("phone")}
                placeholder="+1 555 019 2831"
                className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#182235] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                Department
              </label>
              <input
                type="text"
                {...register("department")}
                placeholder="e.g. Accounts Receivable"
                className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#182235] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>
          </div>

          {!isEditing && (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                RBAC Access Role <span className="text-rose-500">*</span>
              </label>
              <select
                {...register("role")}
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
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Profile Image URL
            </label>
            <input
              type="text"
              {...register("profileImage")}
              placeholder="https://example.com/avatar.jpg"
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#182235] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#182235] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block">
                Account Status
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Active users can log in and access system resources
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register("isActive")}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-slate-600 peer-checked:bg-[#F97316]" />
            </label>
          </div>

          <div className="p-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#182235] flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-900 dark:text-white block flex items-center gap-1.5">
                Two-Factor Authentication (2FA)
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Require 6-digit email OTP verification when logging into this account
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                {...register("twoFactorEnabled")}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all dark:after:border-slate-600 peer-checked:bg-[#F97316]" />
            </label>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="px-5 py-2.5 rounded-xl bg-[#F97316] text-white hover:bg-orange-600 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{isEditing ? "Save User Details" : "Create Account"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
