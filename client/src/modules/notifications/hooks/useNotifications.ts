import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi } from "../api/notifications.api";
import type { NotificationQueryParams } from "../types/notification.types";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { useAuthStore } from "../../auth/auth.store";

export const NOTIFICATIONS_QUERY_KEY = "notifications";
export const UNREAD_COUNT_QUERY_KEY = "notifications-unread-count";

/**
 * Extract backend error message
 */
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

/**
 * Hook to fetch paginated notifications
 */
export const useNotificationsQuery = (params?: NotificationQueryParams) => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const enabled = Boolean(isAuthenticated && accessToken);

  return useQuery({
    queryKey: [NOTIFICATIONS_QUERY_KEY, params],
    queryFn: () => notificationsApi.getNotifications(params),
    enabled,
    placeholderData: (previousData) => previousData,
    staleTime: 3000,
    refetchInterval: enabled ? 15000 : false,
    retry: (failureCount, error) =>
      (error as AxiosError)?.response?.status === 401 ? false : failureCount < 2,
  });
};

/**
 * Hook to fetch unread notification count
 */
export const useUnreadCountQuery = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const accessToken = useAuthStore((state) => state.accessToken);
  const enabled = Boolean(isAuthenticated && accessToken);

  return useQuery({
    queryKey: [UNREAD_COUNT_QUERY_KEY],
    queryFn: () => notificationsApi.getUnreadCount(),
    enabled,
    staleTime: 3000,
    refetchInterval: enabled ? 15000 : false,
    retry: (failureCount, error) =>
      (error as AxiosError)?.response?.status === 401 ? false : failureCount < 2,
  });
};

/**
 * Hook to mark a single notification as read
 */
export const useMarkAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to mark notification as read"), {
        className: "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl dark:shadow-2xl rounded-xl",
      });
    },
  });
};

/**
 * Hook to mark all notifications as read
 */
export const useMarkAllAsReadMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
      toast.success("All notifications marked as read", {
        className: "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl dark:shadow-2xl rounded-xl",
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to mark all as read"), {
        className: "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl dark:shadow-2xl rounded-xl",
      });
    },
  });
};

/**
 * Hook to delete a notification
 */
export const useDeleteNotificationMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notificationsApi.deleteNotification(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATIONS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
      toast.success("Notification deleted", {
        className: "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl dark:shadow-2xl rounded-xl",
      });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete notification"), {
        className: "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl dark:shadow-2xl rounded-xl",
      });
    },
  });
};
