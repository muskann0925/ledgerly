import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { settingsApi } from "../api/settings.api";
import type { SettingsSection } from "../types/settings.types";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export const SETTINGS_QUERY_KEY = "system-settings";

const getErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<{ message?: string; error?: string }>;
  if (axiosError?.response?.data?.message) {
    return axiosError.response.data.message;
  }
  if (axiosError?.response?.data?.error) {
    return axiosError.response.data.error;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return fallback;
};

const toastStyle = {
  className: "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl dark:shadow-2xl rounded-xl",
};

export const useSettingsQuery = () => {
  return useQuery({
    queryKey: [SETTINGS_QUERY_KEY],
    queryFn: async () => {
      const res = await settingsApi.getSettings();
      if (res.data?.defaultDashboardPage) {
        localStorage.setItem("defaultDashboardPage", res.data.defaultDashboardPage);
      }
      return res;
    },
    staleTime: 60000,
  });
};

export const useUpdateCompanyMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => settingsApi.updateCompany(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      toast.success(data.message || "Company settings saved successfully", toastStyle);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update company settings"), toastStyle);
    },
  });
};

export const useUpdateInvoiceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => settingsApi.updateInvoice(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      toast.success(data.message || "Invoice preferences saved successfully", toastStyle);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update invoice preferences"), toastStyle);
    },
  });
};

export const useUpdateEmailMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => settingsApi.updateEmail(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      toast.success(data.message || "Email preferences saved successfully", toastStyle);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update email preferences"), toastStyle);
    },
  });
};

export const useUpdateRemindersMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => settingsApi.updateReminders(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      toast.success(data.message || "Reminder preferences saved successfully", toastStyle);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update reminder preferences"), toastStyle);
    },
  });
};

export const useUpdateAppearanceMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => settingsApi.updateAppearance(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      toast.success(data.message || "Appearance preferences saved successfully", toastStyle);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update appearance preferences"), toastStyle);
    },
  });
};

export const useResetSectionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (section: SettingsSection) => settingsApi.resetSection(section),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [SETTINGS_QUERY_KEY] });
      toast.success(data.message || "Section reset to default settings", toastStyle);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to reset settings section"), toastStyle);
    },
  });
};

export const useTestEmailMutation = () => {
  return useMutation({
    mutationFn: (email?: string) => settingsApi.testEmail(email),
    onSuccess: (data) => {
      toast.success(data.message || "Test email sent successfully!", toastStyle);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to send test email. Check SMTP settings."), toastStyle);
    },
  });
};
