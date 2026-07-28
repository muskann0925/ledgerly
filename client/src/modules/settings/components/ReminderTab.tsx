import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SystemSettings } from "../types/settings.types";
import {
  useUpdateRemindersMutation,
  useResetSectionMutation,
} from "../hooks/useSettings";
import { BellRing, RotateCcw, Save } from "lucide-react";

const reminderSchema = z.object({
  autoReminderEnabled: z.boolean(),
  reminderBeforeDueDays: z.number().int().min(0).max(30),
  reminderAfterDueDays: z.number().int().min(0).max(30),
  reminderFrequencyDays: z.number().int().min(1).max(30),
});

type ReminderFormValues = z.infer<typeof reminderSchema>;

interface ReminderTabProps {
  settings: SystemSettings;
  canEdit: boolean;
}

export const ReminderTab: React.FC<ReminderTabProps> = ({ settings, canEdit }) => {
  const updateRemindersMutation = useUpdateRemindersMutation();
  const resetSectionMutation = useResetSectionMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<ReminderFormValues>({
    resolver: zodResolver(reminderSchema),
    defaultValues: {
      autoReminderEnabled: settings.autoReminderEnabled,
      reminderBeforeDueDays: settings.reminderBeforeDueDays,
      reminderAfterDueDays: settings.reminderAfterDueDays,
      reminderFrequencyDays: settings.reminderFrequencyDays,
    },
  });

  useEffect(() => {
    reset({
      autoReminderEnabled: settings.autoReminderEnabled,
      reminderBeforeDueDays: settings.reminderBeforeDueDays,
      reminderAfterDueDays: settings.reminderAfterDueDays,
      reminderFrequencyDays: settings.reminderFrequencyDays,
    });
  }, [settings, reset]);

  const autoReminderEnabled = watch("autoReminderEnabled");

  const onSubmit = (data: ReminderFormValues) => {
    updateRemindersMutation.mutate(data);
  };

  const handleResetSection = () => {
    resetSectionMutation.mutate("reminders");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BellRing className="w-4 h-4 text-[#F97316]" />
            <span>Automatic Payment Reminders</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure automated email notifications and recurring reminders for upcoming and overdue invoices.
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
              disabled={!isDirty || updateRemindersMutation.isPending}
              className="px-4 py-2 rounded-xl bg-[#F97316] text-white hover:bg-orange-600 disabled:opacity-50 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Toggle Switch Card */}
      <div className="p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
        <div>
          <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 block">
            Automated Reminder Service
          </span>
          <span className="text-[11px] text-slate-500 dark:text-slate-400">
            Automatically trigger email notifications before and after invoice due dates.
          </span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={autoReminderEnabled}
            disabled={!canEdit}
            onChange={(e) => setValue("autoReminderEnabled", e.target.checked, { shouldDirty: true })}
            className="sr-only peer"
          />
          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:after:border-slate-600 peer-checked:bg-[#F97316]" />
        </label>
      </div>

      {/* Days Configuration */}
      <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 transition-opacity ${!autoReminderEnabled ? "opacity-50 pointer-events-none" : ""}`}>
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Reminder Before Due (Days)
          </label>
          <input
            type="number"
            {...register("reminderBeforeDueDays", { valueAsNumber: true })}
            disabled={!canEdit || !autoReminderEnabled}
            className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
            Send polite reminder N days before invoice due date
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            First Overdue Alert (Days After Due)
          </label>
          <input
            type="number"
            {...register("reminderAfterDueDays", { valueAsNumber: true })}
            disabled={!canEdit || !autoReminderEnabled}
            className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
            Send initial overdue notice N days after due date
          </span>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Recurring Overdue Frequency (Days)
          </label>
          <input
            type="number"
            {...register("reminderFrequencyDays", { valueAsNumber: true })}
            disabled={!canEdit || !autoReminderEnabled}
            className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
          <span className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 block">
            Repeat overdue reminders every N days until paid
          </span>
        </div>
      </div>
    </form>
  );
};
