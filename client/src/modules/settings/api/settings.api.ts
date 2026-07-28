import { apiClient } from "../../../lib/axios";
import type {
  GetSettingsApiResponse,
  UpdateSettingsApiResponse,
  SettingsSection,
} from "../types/settings.types";

export const settingsApi = {
  getSettings: async (): Promise<GetSettingsApiResponse> => {
    const response = await apiClient.get<GetSettingsApiResponse>("/settings");
    return response.data;
  },

  updateCompany: async (payload: any): Promise<UpdateSettingsApiResponse> => {
    const response = await apiClient.put<UpdateSettingsApiResponse>("/settings/company", payload);
    return response.data;
  },

  updateInvoice: async (payload: any): Promise<UpdateSettingsApiResponse> => {
    const response = await apiClient.put<UpdateSettingsApiResponse>("/settings/invoice", payload);
    return response.data;
  },

  updateEmail: async (payload: any): Promise<UpdateSettingsApiResponse> => {
    const response = await apiClient.put<UpdateSettingsApiResponse>("/settings/email", payload);
    return response.data;
  },

  updateReminders: async (payload: any): Promise<UpdateSettingsApiResponse> => {
    const response = await apiClient.put<UpdateSettingsApiResponse>("/settings/reminders", payload);
    return response.data;
  },

  updateAppearance: async (payload: any): Promise<UpdateSettingsApiResponse> => {
    const response = await apiClient.put<UpdateSettingsApiResponse>("/settings/appearance", payload);
    return response.data;
  },

  resetSection: async (section: SettingsSection): Promise<UpdateSettingsApiResponse> => {
    const response = await apiClient.post<UpdateSettingsApiResponse>(`/settings/reset/${section}`);
    return response.data;
  },

  testEmail: async (email?: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.post<{ success: boolean; message: string }>("/settings/test-email", {
      email,
    });
    return response.data;
  },
};
