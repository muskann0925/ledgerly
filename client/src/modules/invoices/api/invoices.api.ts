import { apiClient } from "../../../lib/axios";
import type {
  Invoice,
  CreateInvoicePayload,
  UpdateInvoicePayload,
  InvoiceQueryParams,
  PaginatedInvoicesResponse,
  InvoiceDashboardSummary,
  ApiResponse,
  InvoiceStatus,
  MarkPaidPayload,
  MarkPartialPayload,
} from "../types/invoice.types";

export const invoicesApi = {
  /**
   * Fetch paginated invoices with search, status, client, date range, sorting
   */
  getInvoices: async (params?: InvoiceQueryParams): Promise<PaginatedInvoicesResponse> => {
    const response = await apiClient.get<ApiResponse<PaginatedInvoicesResponse>>("/invoices", {
      params,
    });
    return response.data.data;
  },

  /**
   * Fetch single invoice details by ID
   */
  getInvoiceById: async (id: string): Promise<Invoice> => {
    const response = await apiClient.get<ApiResponse<Invoice>>(`/invoices/${id}`);
    return response.data.data;
  },

  /**
   * Fetch dashboard summary metrics
   */
  getDashboardSummary: async (): Promise<InvoiceDashboardSummary> => {
    const response = await apiClient.get<ApiResponse<InvoiceDashboardSummary>>("/invoices/dashboard");
    return response.data.data;
  },

  /**
   * Create a new invoice
   */
  createInvoice: async (payload: CreateInvoicePayload): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>("/invoices", payload);
    return response.data.data;
  },

  /**
   * Update an existing invoice by ID
   */
  updateInvoice: async (id: string, payload: UpdateInvoicePayload): Promise<Invoice> => {
    const response = await apiClient.put<ApiResponse<Invoice>>(`/invoices/${id}`, payload);
    return response.data.data;
  },

  /**
   * Soft delete invoice by ID
   */
  deleteInvoice: async (id: string): Promise<Invoice> => {
    const response = await apiClient.delete<ApiResponse<Invoice>>(`/invoices/${id}`);
    return response.data.data;
  },

  /**
   * Restore soft-deleted invoice by ID
   */
  restoreInvoice: async (id: string): Promise<Invoice> => {
    const response = await apiClient.patch<ApiResponse<Invoice>>(`/invoices/${id}/restore`);
    return response.data.data;
  },

  /**
   * Duplicate invoice by ID
   */
  duplicateInvoice: async (id: string): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(`/invoices/${id}/duplicate`);
    return response.data.data;
  },

  /**
   * Update invoice status
   */
  updateStatus: async (id: string, status: InvoiceStatus): Promise<Invoice> => {
    const response = await apiClient.patch<ApiResponse<Invoice>>(`/invoices/${id}/status`, { status });
    return response.data.data;
  },

  /**
   * Mark invoice as fully paid
   */
  markPaid: async (id: string, payload: MarkPaidPayload): Promise<Invoice> => {
    const response = await apiClient.patch<ApiResponse<Invoice>>(`/invoices/${id}/mark-paid`, payload);
    return response.data.data;
  },

  /**
   * Record partial payment for invoice
   */
  markPartial: async (id: string, payload: MarkPartialPayload): Promise<Invoice> => {
    const response = await apiClient.patch<ApiResponse<Invoice>>(`/invoices/${id}/mark-partial`, payload);
    return response.data.data;
  },

  /**
   * Download or fetch PDF Blob for an invoice
   */
  getInvoicePdfBlob: async (id: string): Promise<Blob> => {
    const response = await apiClient.get<Blob>(`/invoices/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Email invoice to recipient
   */
  sendEmail: async (
    id: string,
    payload: { recipientEmail: string; subject: string; message: string }
  ): Promise<Invoice> => {
    const response = await apiClient.post<ApiResponse<Invoice>>(`/invoices/${id}/send-email`, payload);
    return response.data.data;
  },
};
