import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quotationsApi } from "../api/quotations.api";
import type {
  QuotationQueryParams,
  CreateQuotationPayload,
  UpdateQuotationPayload,
} from "../types/quotation.types";
import { toast } from "sonner";
import type { AxiosError } from "axios";

export const QUOTATIONS_QUERY_KEY = "quotations";
export const QUOTATION_DETAILS_QUERY_KEY = "quotation-details";

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
 * Hook to fetch paginated quotations
 */
export const useQuotationsQuery = (params?: QuotationQueryParams) => {
  return useQuery({
    queryKey: [QUOTATIONS_QUERY_KEY, params],
    queryFn: () => quotationsApi.getQuotations(params),
    placeholderData: (previousData) => previousData,
    staleTime: 5000,
  });
};

/**
 * Hook to fetch single quotation details
 */
export const useQuotationDetailsQuery = (id: string | null) => {
  return useQuery({
    queryKey: [QUOTATION_DETAILS_QUERY_KEY, id],
    queryFn: () => quotationsApi.getQuotationById(id!),
    enabled: !!id,
    staleTime: 5000,
  });
};

const invalidateRelatedQueries = (queryClient: ReturnType<typeof useQueryClient>) => {
  queryClient.invalidateQueries({ queryKey: [QUOTATIONS_QUERY_KEY] });
  queryClient.invalidateQueries({ queryKey: ["invoices"] });
  queryClient.invalidateQueries({ queryKey: ["invoice-dashboard"] });
  queryClient.invalidateQueries({ queryKey: ["clients"] });
};

/**
 * Mutation: Create Quotation
 */
export const useCreateQuotationMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreateQuotationPayload) => quotationsApi.createQuotation(payload),
    onSuccess: (data) => {
      invalidateRelatedQueries(queryClient);
      toast.success(`Quotation ${data.quotationNumber} created successfully`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to create quotation"));
    },
  });
};

/**
 * Mutation: Update Quotation
 */
export const useUpdateQuotationMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateQuotationPayload }) =>
      quotationsApi.updateQuotation(id, payload),
    onSuccess: (data) => {
      invalidateRelatedQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DETAILS_QUERY_KEY, data.id] });
      toast.success(`Quotation ${data.quotationNumber} updated successfully`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to update quotation"));
    },
  });
};

/**
 * Mutation: Soft Delete Quotation
 */
export const useDeleteQuotationMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationsApi.deleteQuotation(id),
    onSuccess: (data) => {
      invalidateRelatedQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DETAILS_QUERY_KEY, data.id] });
      toast.success(`Quotation ${data.quotationNumber} soft deleted`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to delete quotation"));
    },
  });
};

/**
 * Mutation: Restore Soft-Deleted Quotation
 */
export const useRestoreQuotationMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationsApi.restoreQuotation(id),
    onSuccess: (data) => {
      invalidateRelatedQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DETAILS_QUERY_KEY, data.id] });
      toast.success(`Quotation ${data.quotationNumber} restored`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to restore quotation"));
    },
  });
};

/**
 * Mutation: Duplicate Quotation
 */
export const useDuplicateQuotationMutation = (onSuccessCallback?: (newQuotation: any) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationsApi.duplicateQuotation(id),
    onSuccess: (data) => {
      invalidateRelatedQueries(queryClient);
      toast.success(`Quotation cloned as ${data.quotationNumber} (DRAFT)`);
      if (onSuccessCallback) onSuccessCallback(data);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to duplicate quotation"));
    },
  });
};

/**
 * Mutation: Approve Quotation
 */
export const useApproveQuotationMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationsApi.approveQuotation(id),
    onSuccess: (data) => {
      invalidateRelatedQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DETAILS_QUERY_KEY, data.id] });
      toast.success(`Quotation ${data.quotationNumber} marked APPROVED`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to approve quotation"));
    },
  });
};

/**
 * Mutation: Reject Quotation
 */
export const useRejectQuotationMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      quotationsApi.rejectQuotation(id, reason),
    onSuccess: (data) => {
      invalidateRelatedQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DETAILS_QUERY_KEY, data.id] });
      toast.success(`Quotation ${data.quotationNumber} marked REJECTED`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to reject quotation"));
    },
  });
};

/**
 * Mutation: Convert Quotation to Invoice
 */
export const useConvertQuotationMutation = (onSuccessCallback?: (result: { invoice: any; quotation: any }) => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => quotationsApi.convertToInvoice(id),
    onSuccess: (result) => {
      invalidateRelatedQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DETAILS_QUERY_KEY, result.quotation.id] });
      toast.success(`Quotation converted to Invoice ${result.invoice.number}!`);
      if (onSuccessCallback) onSuccessCallback(result);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to convert quotation to invoice"));
    },
  });
};

/**
 * Mutation: Send Quotation Email
 */
export const useSendQuotationEmailMutation = (onSuccessCallback?: () => void) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: { recipientEmail: string; subject: string; message: string };
    }) => quotationsApi.sendEmail(id, payload),
    onSuccess: (data) => {
      invalidateRelatedQueries(queryClient);
      queryClient.invalidateQueries({ queryKey: [QUOTATION_DETAILS_QUERY_KEY, data?.id] });
      toast.success(`Quotation emailed successfully`);
      if (onSuccessCallback) onSuccessCallback();
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Failed to email quotation"));
    },
  });
};
