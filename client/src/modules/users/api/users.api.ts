import { apiClient } from "../../../lib/axios";
import type {
  GetUsersApiResponse,
  SingleUserApiResponse,
  CreateUserPayload,
  UpdateUserPayload,
  UserQueryFilter,
  UserRole,
} from "../types/users.types";

export const usersApi = {
  getUsers: async (filters: UserQueryFilter = {}): Promise<GetUsersApiResponse> => {
    const params: Record<string, any> = {};
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.search?.trim()) params.search = filters.search.trim();
    if (filters.role && filters.role !== "ALL") params.role = filters.role;
    if (filters.isActive !== undefined) params.isActive = filters.isActive;
    if (filters.department?.trim()) params.department = filters.department.trim();
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    const response = await apiClient.get<GetUsersApiResponse>("/users", { params });
    return response.data;
  },

  getUserById: async (id: string): Promise<SingleUserApiResponse> => {
    const response = await apiClient.get<SingleUserApiResponse>(`/users/${id}`);
    return response.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<SingleUserApiResponse> => {
    const response = await apiClient.post<SingleUserApiResponse>("/users", payload);
    return response.data;
  },

  updateUser: async (id: string, payload: UpdateUserPayload): Promise<SingleUserApiResponse> => {
    const response = await apiClient.put<SingleUserApiResponse>(`/users/${id}`, payload);
    return response.data;
  },

  changeRole: async (id: string, role: UserRole): Promise<SingleUserApiResponse> => {
    const response = await apiClient.patch<SingleUserApiResponse>(`/users/${id}/role`, { role });
    return response.data;
  },

  changeStatus: async (id: string, isActive: boolean): Promise<SingleUserApiResponse> => {
    const response = await apiClient.patch<SingleUserApiResponse>(`/users/${id}/status`, { isActive });
    return response.data;
  },

  toggle2FA: async (id: string, twoFactorEnabled: boolean): Promise<SingleUserApiResponse> => {
    const response = await apiClient.patch<SingleUserApiResponse>(`/users/${id}/2fa`, { twoFactorEnabled });
    return response.data;
  },

  resetPassword: async (id: string, newPassword: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.patch<{ success: boolean; message: string }>(
      `/users/${id}/reset-password`,
      { newPassword }
    );
    return response.data;
  },

  deleteUser: async (id: string): Promise<{ success: boolean; message: string }> => {
    const response = await apiClient.delete<{ success: boolean; message: string }>(`/users/${id}`);
    return response.data;
  },
};
