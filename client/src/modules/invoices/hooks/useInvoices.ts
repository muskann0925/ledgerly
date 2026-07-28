import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { invoicesApi } from "../api/invoices.api";
import type {
  InvoiceQueryParams,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  InvoiceStatus,
  MarkPaidPayload,
  MarkPartialPayload,
} from "../types/invoice.types";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export const INVOICES_QUERY_KEY = "invoices";
export const INVOICE_DETAILS_QUERY_KEY = "invoice-details";
export const INVOICE_DASHBOARD_QUERY_KEY = "invoice-dashboard";

/**
 * Helper to extract backend error message
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
 * Hook to fetch paginated invoices with search, filters & sorting
 */
export const useInvoicesQuery = (params?: InvoiceQueryParams) => {
  return useQuery({
    queryKey: [INVOICES_QUERY_KEY, params],
    queryFn: () => invoicesApi.getInvoices(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
};

/**
 * Hook to fetch single invoice details by ID
 */
export const useInvoiceDetailsQuery = (id: string | null) => {
  return useQuery({
    queryKey: [INVOICE_DETAILS_QUERY_KEY, id],
    queryFn: () => invoicesApi.getInvoiceById(id!),
    enabled: !!id,
    staleTime: 5000,
  });
};

/**
 * Hook to fetch invoice dashboard summary metrics
 */
export const useInvoiceDashboardQuery = () => {
  return useQuery({
    queryKey: [INVOICE_DASHBOARD_QUERY_KEY],
    queryFn: () => invoicesApi.getDashboardSummary(),
    staleTime: 10000,
  });
};

/**
 * Mutation: Create Invoice
 */
export const useCreateInvoiceMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateInvoicePayload) => invoicesApi.createInvoice(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INVOICE_DASHBOARD_QUERY_KEY] });
      toast.success(`Invoice ${data.number} created successfully`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create invoice"));
    },
  });
};

/**
 * Mutation: Update Invoice
 */
export const useUpdateInvoiceMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateInvoicePayload }) =>
      invoicesApi.updateInvoice(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INVOICE_DETAILS_QUERY_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: [INVOICE_DASHBOARD_QUERY_KEY] });
      toast.success(`Invoice ${data.number} updated successfully`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update invoice"));
    },
  });
};

/**
 * Mutation: Soft Delete Invoice
 */
export const useDeleteInvoiceMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.deleteInvoice(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INVOICE_DETAILS_QUERY_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: [INVOICE_DASHBOARD_QUERY_KEY] });
      toast.success(`Invoice ${data.number} deleted successfully`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete invoice"));
    },
  });
};

/**
 * Mutation: Restore Soft-Deleted Invoice
 */
export const useRestoreInvoiceMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.restoreInvoice(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INVOICE_DETAILS_QUERY_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: [INVOICE_DASHBOARD_QUERY_KEY] });
      toast.success(`Invoice ${data.number} restored successfully`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to restore invoice"));
    },
  });
};

/**
 * Mutation: Duplicate Invoice
 */
export const useDuplicateInvoiceMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoicesApi.duplicateInvoice(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INVOICE_DASHBOARD_QUERY_KEY] });
      toast.success(`Invoice duplicated as ${data.number}`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to duplicate invoice"));
    },
  });
};

/**
 * Mutation: Update Invoice Status
 */
export const useUpdateStatusMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: InvoiceStatus }) =>
      invoicesApi.updateStatus(id, status),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INVOICE_DETAILS_QUERY_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: [INVOICE_DASHBOARD_QUERY_KEY] });
      toast.success(`Status for ${data.number} updated to ${data.status}`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update invoice status"));
    },
  });
};

/**
 * Mutation: Mark Fully Paid
 */
export const useMarkPaidMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MarkPaidPayload }) =>
      invoicesApi.markPaid(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INVOICE_DETAILS_QUERY_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: [INVOICE_DASHBOARD_QUERY_KEY] });
      toast.success(`Invoice ${data.number} marked as fully paid`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to mark invoice as paid"));
    },
  });
};

/**
 * Mutation: Mark Partial Payment
 */
export const useMarkPartialMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: MarkPartialPayload }) =>
      invoicesApi.markPartial(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INVOICE_DETAILS_QUERY_KEY, data.id] });
      queryClient.invalidateQueries({ queryKey: [INVOICE_DASHBOARD_QUERY_KEY] });
      toast.success(`Partial payment recorded for ${data.number}`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to record partial payment"));
    },
  });
};

/**
 * Mutation: Send Invoice Email
 */
export const useSendInvoiceEmailMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { recipientEmail: string; subject: string; message: string };
    }) => invoicesApi.sendEmail(id, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: [INVOICES_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [INVOICE_DETAILS_QUERY_KEY, data?.id] });
      toast.success(`Invoice emailed successfully`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to email invoice"));
    },
  });
};
