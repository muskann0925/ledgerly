import { apiClient } from "../../../lib/axios";
import type {
  Quotation,
  CreateQuotationPayload,
  UpdateQuotationPayload,
  QuotationQueryParams,
  PaginatedQuotationsResponse,
  ApiResponse,
} from "../types/quotation.types";

export const quotationsApi = {
  /**
   * Fetch paginated quotations list
   */
  getQuotations: async (params?: QuotationQueryParams): Promise<PaginatedQuotationsResponse> => {
    const response = await apiClient.get<ApiResponse<PaginatedQuotationsResponse>>("/quotations", {
      params,
    });
    return response.data.data;
  },

  /**
   * Fetch single quotation details
   */
  getQuotationById: async (id: string): Promise<Quotation> => {
    const response = await apiClient.get<ApiResponse<Quotation>>(`/quotations/${id}`);
    return response.data.data;
  },

  /**
   * Create a new quotation
   */
  createQuotation: async (payload: CreateQuotationPayload): Promise<Quotation> => {
    const response = await apiClient.post<ApiResponse<Quotation>>("/quotations", payload);
    return response.data.data;
  },

  /**
   * Update an existing quotation
   */
  updateQuotation: async (id: string, payload: UpdateQuotationPayload): Promise<Quotation> => {
    const response = await apiClient.put<ApiResponse<Quotation>>(`/quotations/${id}`, payload);
    return response.data.data;
  },

  /**
   * Soft delete quotation
   */
  deleteQuotation: async (id: string): Promise<Quotation> => {
    const response = await apiClient.delete<ApiResponse<Quotation>>(`/quotations/${id}`);
    return response.data.data;
  },

  /**
   * Restore soft-deleted quotation
   */
  restoreQuotation: async (id: string): Promise<Quotation> => {
    const response = await apiClient.patch<ApiResponse<Quotation>>(`/quotations/${id}/restore`);
    return response.data.data;
  },

  /**
   * Duplicate quotation as a new DRAFT
   */
  duplicateQuotation: async (id: string): Promise<Quotation> => {
    const response = await apiClient.post<ApiResponse<Quotation>>(`/quotations/${id}/duplicate`);
    return response.data.data;
  },

  /**
   * Approve quotation
   */
  approveQuotation: async (id: string): Promise<Quotation> => {
    const response = await apiClient.patch<ApiResponse<Quotation>>(`/quotations/${id}/approve`);
    return response.data.data;
  },

  /**
   * Reject quotation with reason
   */
  rejectQuotation: async (id: string, rejectionReason?: string): Promise<Quotation> => {
    const response = await apiClient.patch<ApiResponse<Quotation>>(`/quotations/${id}/reject`, {
      rejectionReason,
    });
    return response.data.data;
  },

  /**
   * Convert quotation into a live Invoice
   */
  convertToInvoice: async (id: string): Promise<{ invoice: any; quotation: Quotation }> => {
    const response = await apiClient.post<ApiResponse<{ invoice: any; quotation: Quotation }>>(
      `/quotations/${id}/convert`
    );
    return response.data.data;
  },

  /**
   * Download Quotation PDF Blob
   */
  downloadPdf: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/quotations/${id}/pdf`, {
      responseType: "blob",
    });
    return response.data;
  },

  /**
   * Email quotation to recipient
   */
  sendEmail: async (
    id: string,
    payload: { recipientEmail: string; subject: string; message: string }
  ): Promise<Quotation> => {
    const response = await apiClient.post<ApiResponse<Quotation>>(`/quotations/${id}/send-email`, payload);
    return response.data.data;
  },
};
