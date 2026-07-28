import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SystemSettings } from "../types/settings.types";
import {
  useUpdateCompanyMutation,
  useResetSectionMutation,
} from "../hooks/useSettings";
import { Building2, RotateCcw, Save } from "lucide-react";

const companySchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters"),
  businessEmail: z.string().email("Invalid email format"),
  phone: z.string().min(5, "Invalid phone format"),
  website: z.string().nullable().optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  gstNumber: z.string().nullable().optional(),
  panNumber: z.string().nullable().optional(),
});

type CompanyFormValues = z.infer<typeof companySchema>;

interface CompanyTabProps {
  settings: SystemSettings;
  canEdit: boolean;
}

export const CompanyTab: React.FC<CompanyTabProps> = ({ settings, canEdit }) => {
  const updateCompanyMutation = useUpdateCompanyMutation();
  const resetSectionMutation = useResetSectionMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<CompanyFormValues>({
    resolver: zodResolver(companySchema),
    defaultValues: {
      companyName: settings.companyName,
      businessEmail: settings.businessEmail,
      phone: settings.phone,
      website: settings.website || "",
      address: settings.address || "",
      city: settings.city || "",
      state: settings.state || "",
      country: settings.country || "",
      postalCode: settings.postalCode || "",
      gstNumber: settings.gstNumber || "",
      panNumber: settings.panNumber || "",
    },
  });

  useEffect(() => {
    reset({
      companyName: settings.companyName,
      businessEmail: settings.businessEmail,
      phone: settings.phone,
      website: settings.website || "",
      address: settings.address || "",
      city: settings.city || "",
      state: settings.state || "",
      country: settings.country || "",
      postalCode: settings.postalCode || "",
      gstNumber: settings.gstNumber || "",
      panNumber: settings.panNumber || "",
    });
  }, [settings, reset]);

  const onSubmit = (data: CompanyFormValues) => {
    updateCompanyMutation.mutate(data);
  };

  const handleResetSection = () => {
    resetSectionMutation.mutate("company");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-[#F97316]" />
            <span>Company Profile & Branding</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Manage your organization's legal name, contact details, and tax registration info.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetSection}
              disabled={resetSectionMutation.isPending}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="submit"
              disabled={!isDirty || updateCompanyMutation.isPending}
              className="px-4 py-2 rounded-xl bg-[#F97316] text-white hover:bg-orange-600 disabled:opacity-50 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {/* Company Details Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Company Legal Name *
            </label>
            <input
              type="text"
              {...register("companyName")}
              disabled={!canEdit}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            {errors.companyName && (
              <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                {errors.companyName.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Business Email *
            </label>
            <input
              type="email"
              {...register("businessEmail")}
              disabled={!canEdit}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            {errors.businessEmail && (
              <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                {errors.businessEmail.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Phone Number *
            </label>
            <input
              type="text"
              {...register("phone")}
              disabled={!canEdit}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            {errors.phone && (
              <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                {errors.phone.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Website URL
            </label>
            <input
              type="text"
              {...register("website")}
              disabled={!canEdit}
              placeholder="https://yourcompany.com"
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Billing Address
            </label>
            <textarea
              rows={2}
              {...register("address")}
              disabled={!canEdit}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              City
            </label>
            <input
              type="text"
              {...register("city")}
              disabled={!canEdit}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              State / Province
            </label>
            <input
              type="text"
              {...register("state")}
              disabled={!canEdit}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Country
            </label>
            <input
              type="text"
              {...register("country")}
              disabled={!canEdit}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Postal Code / PIN
            </label>
            <input
              type="text"
              {...register("postalCode")}
              disabled={!canEdit}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            GSTIN / Tax ID Number
          </label>
          <input
            type="text"
            {...register("gstNumber")}
            disabled={!canEdit}
            placeholder="e.g. 29AAAAA0000A1Z5"
            className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            PAN Number
          </label>
          <input
            type="text"
            {...register("panNumber")}
            disabled={!canEdit}
            placeholder="e.g. AAAAA0000A"
            className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
        </div>
      </div>
    </form>
  );
};
