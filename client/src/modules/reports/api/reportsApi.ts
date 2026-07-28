import { apiClient } from "../../../lib/axios";
import type {
  ReportFilterQuery,
  ExportReportQuery,
  DashboardMetricsReport,
  FullRevenueReport,
  FullInvoiceReport,
  FullTaxReport,
  ProfitAndLossReport,
  ClientPerformanceReport,
} from "../types/reports.types";

export interface ApiResponse<T> {
  success: boolean;
  data: T;
}

export const reportsApi = {
  getDashboardSummary: async (filters: ReportFilterQuery = {}): Promise<ApiResponse<DashboardMetricsReport>> => {
    const response = await apiClient.get("/reports/dashboard", { params: filters });
    return response.data;
  },

  getRevenueReport: async (filters: ReportFilterQuery = {}): Promise<ApiResponse<FullRevenueReport>> => {
    const response = await apiClient.get("/reports/revenue", { params: filters });
    return response.data;
  },

  getInvoiceReport: async (filters: ReportFilterQuery = {}): Promise<ApiResponse<FullInvoiceReport>> => {
    const response = await apiClient.get("/reports/invoices", { params: filters });
    return response.data;
  },

  getTaxReport: async (filters: ReportFilterQuery = {}): Promise<ApiResponse<FullTaxReport>> => {
    const response = await apiClient.get("/reports/tax", { params: filters });
    return response.data;
  },

  getProfitAndLossReport: async (filters: ReportFilterQuery = {}): Promise<ApiResponse<ProfitAndLossReport>> => {
    const response = await apiClient.get("/reports/profit-loss", { params: filters });
    return response.data;
  },

  getClientPerformanceReport: async (filters: ReportFilterQuery = {}): Promise<ApiResponse<ClientPerformanceReport>> => {
    const response = await apiClient.get("/reports/clients", { params: filters });
    return response.data;
  },

  downloadExportReportBlob: async (query: ExportReportQuery): Promise<{ blob: Blob; fileName: string }> => {
    const response = await apiClient.get(`/reports/export/${query.reportType}`, {
      params: { ...query, format: query.format },
      responseType: "blob",
    });

    const contentDisposition = response.headers["content-disposition"];
    let fileName = `${query.reportType}_report.${query.format === "excel" ? "xlsx" : query.format}`;

    if (contentDisposition) {
      const match = contentDisposition.match(/filename="?([^"]+)"?/);
      if (match && match[1]) {
        fileName = match[1];
      }
    }

    return {
      blob: response.data,
      fileName,
    };
  },
};
