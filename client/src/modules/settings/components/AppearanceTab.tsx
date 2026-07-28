import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SystemSettings } from "../types/settings.types";
import {
  useUpdateAppearanceMutation,
  useResetSectionMutation,
} from "../hooks/useSettings";
import { useTheme } from "../../../components/theme-provider";
import { Palette, RotateCcw, Save, Sun, Moon, Monitor } from "lucide-react";

const appearanceSchema = z.object({
  theme: z.enum(["light", "dark", "system"]),
});

type AppearanceFormValues = z.infer<typeof appearanceSchema>;

interface AppearanceTabProps {
  settings: SystemSettings;
  canEdit: boolean;
}

export const AppearanceTab: React.FC<AppearanceTabProps> = ({ settings, canEdit }) => {
  const updateAppearanceMutation = useUpdateAppearanceMutation();
  const resetSectionMutation = useResetSectionMutation();
  const { theme: currentGlobalTheme, setTheme } = useTheme();

  const {
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { isDirty },
  } = useForm<AppearanceFormValues>({
    resolver: zodResolver(appearanceSchema),
    defaultValues: {
      theme: currentGlobalTheme || settings.theme || "system",
    },
  });

  useEffect(() => {
    reset({
      theme: currentGlobalTheme || settings.theme || "system",
    });
  }, [settings, currentGlobalTheme, reset]);

  const selectedTheme = watch("theme");

  const onSubmit = (data: AppearanceFormValues) => {
    setTheme(data.theme);
    updateAppearanceMutation.mutate(data);
  };

  const handleResetSection = () => {
    resetSectionMutation.mutate("appearance");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Palette className="w-4 h-4 text-[#F97316]" />
            <span>Appearance & Interface Preferences</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Customize visual theme, default data grid page size, and landing view options.
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
              disabled={!isDirty || updateAppearanceMutation.isPending}
              className="px-4 py-2 rounded-xl bg-[#F97316] text-white hover:bg-orange-600 disabled:opacity-50 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {/* Theme Selection Radio Cards */}
      <div className="space-y-3">
        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
          Color Theme Preference
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            type="button"
            disabled={!canEdit}
            onClick={() => {
              setValue("theme", "light", { shouldDirty: true });
              setTheme("light");
            }}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all ${
              selectedTheme === "light"
                ? "border-[#F97316] bg-orange-50/50 dark:bg-orange-950/20 text-[#F97316] shadow-xs"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-[#111827]"
            }`}
          >
            <Sun className="w-6 h-6" />
            <span className="text-xs font-bold">Light Theme</span>
          </button>

          <button
            type="button"
            disabled={!canEdit}
            onClick={() => {
              setValue("theme", "dark", { shouldDirty: true });
              setTheme("dark");
            }}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all ${
              selectedTheme === "dark"
                ? "border-[#F97316] bg-orange-50/50 dark:bg-orange-950/20 text-[#F97316] shadow-xs"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-[#111827]"
            }`}
          >
            <Moon className="w-6 h-6" />
            <span className="text-xs font-bold">Dark Theme</span>
          </button>

          <button
            type="button"
            disabled={!canEdit}
            onClick={() => {
              setValue("theme", "system", { shouldDirty: true });
              setTheme("system");
            }}
            className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2.5 transition-all ${
              selectedTheme === "system"
                ? "border-[#F97316] bg-orange-50/50 dark:bg-orange-950/20 text-[#F97316] shadow-xs"
                : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-[#111827]"
            }`}
          >
            <Monitor className="w-6 h-6" />
            <span className="text-xs font-bold">System Default</span>
          </button>
        </div>
      </div>
    </form>
  );
};
