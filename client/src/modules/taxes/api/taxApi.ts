import { apiClient } from "../../../lib/axios";
import type {
  Tax,
  CreateTaxInput,
  UpdateTaxInput,
  TaxQueryFilters,
  TaxListResponse,
} from "../types/tax.types";

export const taxApi = {
  getTaxes: async (filters: TaxQueryFilters = {}): Promise<TaxListResponse> => {
    const params: Record<string, any> = {};
    if (filters.page) params.page = filters.page;
    if (filters.limit) params.limit = filters.limit;
    if (filters.search) params.search = filters.search;
    if (filters.type) params.type = filters.type;
    if (filters.calculationType) params.calculationType = filters.calculationType;
    if (filters.isActive !== undefined) params.isActive = filters.isActive;
    if (filters.module) params.module = filters.module;
    if (filters.country) params.country = filters.country;
    if (filters.state) params.state = filters.state;
    if (filters.sortBy) params.sortBy = filters.sortBy;
    if (filters.sortOrder) params.sortOrder = filters.sortOrder;

    const response = await apiClient.get("/taxes", { params });
    return response.data.data;
  },

  getActiveTaxes: async (): Promise<Tax[]> => {
    const response = await apiClient.get("/taxes/active");
    return response.data.data;
  },

  getTaxById: async (id: string): Promise<Tax> => {
    const response = await apiClient.get(`/taxes/${id}`);
    return response.data.data;
  },

  createTax: async (data: CreateTaxInput): Promise<Tax> => {
    const response = await apiClient.post("/taxes", data);
    return response.data.data;
  },

  updateTax: async (id: string, data: UpdateTaxInput): Promise<Tax> => {
    const response = await apiClient.put(`/taxes/${id}`, data);
    return response.data.data;
  },

  toggleTaxStatus: async (id: string, isActive: boolean): Promise<Tax> => {
    const response = await apiClient.patch(`/taxes/${id}/status`, { isActive });
    return response.data.data;
  },

  softDeleteTax: async (id: string): Promise<void> => {
    await apiClient.delete(`/taxes/${id}`);
  },

  calculateTaxes: async (payload: any): Promise<any> => {
    const response = await apiClient.post("/taxes/calculate", payload);
    return response.data.data;
  },
};
