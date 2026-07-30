import { apiClient } from "../../../lib/axios";
import type {
  Payment,
  CreatePaymentPayload,
  UpdatePaymentPayload,
  PaymentQueryParams,
  PaginatedPaymentsResponse,
  ApiResponse,
} from "../types/payment.types";

export const paymentsApi = {
  /**
   * Fetch paginated payments with search, method filters, date range & sorting
   */
  getPayments: async (params?: PaymentQueryParams): Promise<PaginatedPaymentsResponse> => {
    const response = await apiClient.get<ApiResponse<PaginatedPaymentsResponse>>("/payments", {
      params,
    });
    return response.data.data;
  },

  /**
   * Fetch single payment details by ID
   */
  getPaymentById: async (id: string): Promise<Payment> => {
    const response = await apiClient.get<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data;
  },

  /**
   * Fetch all payments for a specific invoice
   */
  getPaymentsByInvoiceId: async (invoiceId: string): Promise<Payment[]> => {
    const response = await apiClient.get<ApiResponse<Payment[]>>(`/payments/invoice/${invoiceId}`);
    return response.data.data;
  },

  /**
   * Create a new payment record
   */
  createPayment: async (payload: CreatePaymentPayload): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<Payment>>("/payments", payload);
    return response.data.data;
  },

  /**
   * Update an existing payment by ID
   */
  updatePayment: async (id: string, payload: UpdatePaymentPayload): Promise<Payment> => {
    const response = await apiClient.put<ApiResponse<Payment>>(`/payments/${id}`, payload);
    return response.data.data;
  },

  /**
   * Soft delete payment by ID
   */
  deletePayment: async (id: string): Promise<Payment> => {
    const response = await apiClient.delete<ApiResponse<Payment>>(`/payments/${id}`);
    return response.data.data;
  },

  /**
   * Restore soft-deleted payment by ID
   */
  restorePayment: async (id: string): Promise<Payment> => {
    const response = await apiClient.patch<ApiResponse<Payment>>(`/payments/${id}/restore`);
    return response.data.data;
  },

  /**
   * Fetch PDF blob for payment receipt
   */
  getReceiptPdfBlob: async (id: string): Promise<Blob> => {
    const response = await apiClient.get<Blob>(`/payments/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Email payment receipt to recipient
   */
  sendEmail: async (
    id: string,
    payload: { recipientEmail: string; subject: string; message: string }
  ): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<Payment>>(`/payments/${id}/send-email`, payload);
    return response.data.data;
  },

  /**
   * Retry or update payment status
   */
  retryPayment: async (
    id: string,
    payload: { status: "SUCCESS" | "FAILED" | "PENDING"; failureReason?: string }
  ): Promise<Payment> => {
    const response = await apiClient.post<ApiResponse<Payment>>(`/payments/${id}/retry`, payload);
    return response.data.data;
  },
};
