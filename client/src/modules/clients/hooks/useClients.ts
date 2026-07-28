import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { clientsApi } from "../api/clients.api";
import type {
  ClientQueryParams,
  CreateClientPayload,
  UpdateClientPayload,
} from "../types/client.types";
import type { AxiosError } from "axios";

export const CLIENTS_QUERY_KEY = "clients";
export const CLIENT_DETAILS_QUERY_KEY = "client-details";

interface ApiErrorResponse {
  message?: string;
  errors?: Record<string, string[]>;
}

export const getErrorMessage = (error: unknown, fallback: string): string => {
  const axiosError = error as AxiosError<ApiErrorResponse>;
  if (axiosError.response?.data?.message) {
    return axiosError.response.data.message;
  }
  if (axiosError.message) {
    return axiosError.message;
  }
  return fallback;
};

/**
 * Hook to fetch paginated list of clients
 */
export const useClientsQuery = (params: ClientQueryParams) => {
  return useQuery({
    queryKey: [CLIENTS_QUERY_KEY, params],
    queryFn: () => clientsApi.getClients(params),
    staleTime: 1000 * 30, // 30 seconds
  });
};

/**
 * Hook to fetch single client details
 */
export const useClientDetailsQuery = (id: string | null) => {
  return useQuery({
    queryKey: [CLIENT_DETAILS_QUERY_KEY, id],
    queryFn: () => (id ? clientsApi.getClientById(id) : null),
    enabled: !!id,
  });
};

/**
 * Mutation hook to create client
 */
export const useCreateClientMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateClientPayload) => clientsApi.createClient(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] });
      toast.success("Client Created Successfully", {
        description: `${data.companyName} profile has been registered in the database.`,
      });
      onSuccessCallback?.();
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Failed to create client.");
      toast.error("Creation Failed", { description: message });
    },
  });
};

/**
 * Mutation hook to update client
 */
export const useUpdateClientMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateClientPayload }) =>
      clientsApi.updateClient(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLIENT_DETAILS_QUERY_KEY, data.id] });
      toast.success("Client Updated Successfully", {
        description: `${data.companyName} details updated.`,
      });
      onSuccessCallback?.();
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Failed to update client.");
      toast.error("Update Failed", { description: message });
    },
  });
};

/**
 * Mutation hook to soft delete client
 */
export const useDeleteClientMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.deleteClient(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLIENT_DETAILS_QUERY_KEY, data.id] });
      toast.success("Client Soft-Deleted", {
        description: `${data.companyName} marked as inactive. You can restore this client anytime.`,
      });
      onSuccessCallback?.();
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Failed to delete client.");
      toast.error("Deletion Failed", { description: message });
    },
  });
};

/**
 * Mutation hook to restore client
 */
export const useRestoreClientMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => clientsApi.restoreClient(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLIENT_DETAILS_QUERY_KEY, data.id] });
      toast.success("Client Restored", {
        description: `${data.companyName} profile restored and activated.`,
      });
      onSuccessCallback?.();
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Failed to restore client.");
      toast.error("Restore Failed", { description: message });
    },
  });
};

/**
 * Mutation: Send Client Email / Statement
 */
export const useSendClientEmailMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { recipientEmail: string; subject: string; message: string };
    }) => clientsApi.sendEmail(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [CLIENTS_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [CLIENT_DETAILS_QUERY_KEY, data?.id] });
      toast.success("Email Sent", {
        description: `Statement/message successfully sent to ${data?.email || "client"}.`,
      });
      onSuccessCallback?.();
    },
    onError: (error) => {
      const message = getErrorMessage(error, "Failed to send email to client.");
      toast.error("Email Delivery Failed", { description: message });
    },
  });
};
