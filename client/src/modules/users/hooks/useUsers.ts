import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi } from "../api/users.api";
import type {
  UserQueryFilter,
  CreateUserPayload,
  UpdateUserPayload,
  UserRole,
} from "../types/users.types";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export const USERS_QUERY_KEY = "users-list";

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

export const useUsersQuery = (filters: UserQueryFilter) => {
  return useQuery({
    queryKey: [USERS_QUERY_KEY, filters],
    queryFn: () => usersApi.getUsers(filters),
    staleTime: 30000,
  });
};

export const useCreateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload) => usersApi.createUser(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success(data.message || "User account created successfully", toastStyle);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create user account"), toastStyle);
    },
  });
};

export const useUpdateUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateUserPayload }) =>
      usersApi.updateUser(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success(data.message || "User details updated successfully", toastStyle);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update user details"), toastStyle);
    },
  });
};

export const useChangeUserRoleMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) =>
      usersApi.changeRole(id, role),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success(data.message || "User role updated successfully", toastStyle);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to change user role"), toastStyle);
    },
  });
};

export const useChangeUserStatusMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      usersApi.changeStatus(id, isActive),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success(data.message || "User status updated successfully", toastStyle);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update user status"), toastStyle);
    },
  });
};

export const useToggleUser2FaMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, twoFactorEnabled }: { id: string; twoFactorEnabled: boolean }) =>
      usersApi.toggle2FA(id, twoFactorEnabled),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success(data.message || "User 2FA setting updated successfully", toastStyle);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update 2FA setting"), toastStyle);
    },
  });
};

export const useResetUserPasswordMutation = () => {
  return useMutation({
    mutationFn: ({ id, newPassword }: { id: string; newPassword: string }) =>
      usersApi.resetPassword(id, newPassword),
    onSuccess: (data) => {
      toast.success(data.message || "User password reset successfully", toastStyle);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to reset user password"), toastStyle);
    },
  });
};

export const useDeleteUserMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => usersApi.deleteUser(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [USERS_QUERY_KEY] });
      toast.success(data.message || "User account deleted successfully", toastStyle);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete user account"), toastStyle);
    },
  });
};
