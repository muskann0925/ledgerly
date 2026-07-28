import { apiClient } from "../../../lib/axios";
import type {
  GetNotificationsApiResponse,
  GetUnreadCountApiResponse,
  NotificationQueryParams,
} from "../types/notification.types";

export const notificationsApi = {
  getNotifications: async (params?: NotificationQueryParams): Promise<GetNotificationsApiResponse> => {
    const response = await apiClient.get<GetNotificationsApiResponse>("/notifications", {
      params,
    });
    return response.data;
  },

  getUnreadCount: async (): Promise<GetUnreadCountApiResponse> => {
    const response = await apiClient.get<GetUnreadCountApiResponse>("/notifications/unread-count");
    return response.data;
  },

  markAsRead: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch<{ success: boolean; message: string }>(`/notifications/${id}/read`);
    return response.data;
  },

  markAllAsRead: async (): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch<{ success: boolean; message: string }>("/notifications/read-all");
    return response.data;
  },

  deleteNotification: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/notifications/${id}`);
    return response.data;
  },
};
