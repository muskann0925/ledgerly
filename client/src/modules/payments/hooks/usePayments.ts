import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { paymentsApi } from "../api/payments.api";
import type {
  PaymentQueryParams,
  CreatePaymentPayload,
  UpdatePaymentPayload,
} from "../types/payment.types";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export const PAYMENTS_QUERY_KEY = "payments";
export const PAYMENT_DETAILS_QUERY_KEY = "payment-details";
export const PAYMENTS_BY_INVOICE_QUERY_KEY = "payments-by-invoice";

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
 * Hook to fetch paginated payments with search, filters & sorting
 */
export const usePaymentsQuery = (params?: PaymentQueryParams) => {
  return useQuery({
    queryKey: [PAYMENTS_QUERY_KEY, params],
    queryFn: () => paymentsApi.getPayments(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
};

/**
 * Hook to fetch single payment details by ID
 */
export const usePaymentDetailsQuery = (id: string | null) => {
  return useQuery({
    queryKey: [PAYMENT_DETAILS_QUERY_KEY, id],
    queryFn: () => paymentsApi.getPaymentById(id!),
    enabled: !!id,
    staleTime: 5000,
  });
};

/**
 * Hook to fetch payments for a specific invoice
 */
export const usePaymentsByInvoiceQuery = (invoiceId: string | null) => {
  return useQuery({
    queryKey: [PAYMENTS_BY_INVOICE_QUERY_KEY, invoiceId],
    queryFn: () => paymentsApi.getPaymentsByInvoiceId(invoiceId!),
    enabled: !!invoiceId,
    staleTime: 5000,
  });
};

/**
 * Helper to invalidate all related queries (Payments, Invoices, Clients)
 */
const invalidateRelatedQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: [PAYMENTS_QUERY_KEY] });
  queryClient.invalidateQueries({ queryKey: [PAYMENTS_BY_INVOICE_QUERY_KEY] });
  queryClient.invalidateQueries({ queryKey: ["invoices"] });
  queryClient.invalidateQueries({ queryKey: ["invoice-details"] });
  queryClient.invalidateQueries({ queryKey: ["invoice-dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["clients"] });
};

/**
 * Mutation: Create Payment
 */
export const useCreatePaymentMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePaymentPayload) => paymentsApi.createPayment(payload),
    onSuccess: (data) => {
      invalidateRelatedQueries(queryClient);
      toast.success(`Payment of ₹${data.amount.toLocaleString("en-IN")} recorded successfully`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to record payment"));
    },
  });
};

/**
 * Mutation: Update Payment
 */
export const useUpdatePaymentMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdatePaymentPayload }) =>
      paymentsApi.updatePayment(id, payload),
    onSuccess: (data) => {
      invalidateRelatedQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: [PAYMENT_DETAILS_QUERY_KEY, data.id] });
      toast.success("Payment details updated successfully");
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update payment"));
    },
  });
};

/**
 * Mutation: Soft Delete Payment
 */
export const useDeletePaymentMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentsApi.deletePayment(id),
    onSuccess: (data) => {
      invalidateRelatedQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: [PAYMENT_DETAILS_QUERY_KEY, data.id] });
      toast.success("Payment record soft deleted successfully");
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete payment record"));
    },
  });
};

/**
 * Mutation: Restore Soft-Deleted Payment
 */
export const useRestorePaymentMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => paymentsApi.restorePayment(id),
    onSuccess: (data) => {
      invalidateRelatedQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: [PAYMENT_DETAILS_QUERY_KEY, data.id] });
      toast.success("Payment record restored successfully");
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to restore payment record"));
    },
  });
};

/**
 * Mutation: Send Payment Receipt Email
 */
export const useSendPaymentEmailMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { recipientEmail: string; subject: string; message: string };
    }) => paymentsApi.sendEmail(id, payload),
    onSuccess: (data) => {
      invalidateRelatedQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: [PAYMENT_DETAILS_QUERY_KEY, data?.id] });
      toast.success(`Payment receipt emailed successfully`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to email payment receipt"));
    },
  });
};

/**
 * Mutation: Retry Payment / Update Status
 */
export const useRetryPaymentMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { status: "SUCCESS" | "FAILED" | "PENDING"; failureReason?: string };
    }) => paymentsApi.retryPayment(id, payload),
    onSuccess: (data) => {
      invalidateRelatedQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: [PAYMENT_DETAILS_QUERY_KEY, data.id] });
      if (data.status === "SUCCESS") {
        toast.success(`Payment of ₹${data.amount.toLocaleString("en-IN")} completed successfully!`);
      } else if (data.status === "FAILED") {
        toast.error(`Payment marked as failed: ${data.failureReason || "Transaction failed"}`);
      } else {
        toast.info("Payment status set to Pending");
      }
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update payment status"));
    },
  });
};
