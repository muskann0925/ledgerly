import { apiClient } from "../../../lib/axios";
import type {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
  ClientQueryParams,
  PaginatedClientsResponse,
  ApiResponse,
} from "../types/client.types";

export const clientsApi = {
  /**
   * Fetch paginated clients with search, status filters, and sorting
   */
  getClients: async (params?: ClientQueryParams): Promise<PaginatedClientsResponse> => {
    const response = await apiClient.get<ApiResponse<PaginatedClientsResponse>>("/clients", {
      params,
    });
    return response.data.data;
  },

  /**
   * Fetch single client details by ID
   */
  getClientById: async (id: string): Promise<Client> => {
    const response = await apiClient.get<ApiResponse<Client>>(`/clients/${id}`);
    return response.data.data;
  },

  /**
   * Create a new client
   */
  createClient: async (payload: CreateClientPayload): Promise<Client> => {
    const response = await apiClient.post<ApiResponse<Client>>("/clients", payload);
    return response.data.data;
  },

  /**
   * Update an existing client by ID
   */
  updateClient: async (id: string, payload: UpdateClientPayload): Promise<Client> => {
    const response = await apiClient.patch<ApiResponse<Client>>(`/clients/${id}`, payload);
    return response.data.data;
  },

  /**
   * Soft delete client by ID
   */
  deleteClient: async (id: string): Promise<Client> => {
    const response = await apiClient.delete<ApiResponse<Client>>(`/clients/${id}`);
    return response.data.data;
  },

  /**
   * Restore soft-deleted client by ID
   */
  restoreClient: async (id: string): Promise<Client> => {
    const response = await apiClient.patch<ApiResponse<Client>>(`/clients/${id}/restore`);
    return response.data.data;
  },

  /**
   * Fetch PDF blob for client account statement
   */
  getStatementPdfBlob: async (id: string, startDate?: string, endDate?: string): Promise<Blob> => {
    const response = await apiClient.get<Blob>(`/clients/${id}/statement/pdf`, {
      params: { startDate, endDate },
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Email client statement or message
   */
  sendEmail: async (
    id: string,
    payload: { recipientEmail: string; subject: string; message: string }
  ): Promise<Client> => {
    const response = await apiClient.post<ApiResponse<Client>>(`/clients/${id}/send-email`, payload);
    return response.data.data;
  },
};
