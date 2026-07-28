import { useQuery, useMutation } from "@tanstack/react-query";
import { reportsApi } from "../api/reportsApi";
import { toast } from "sonner";
import type { ReportFilterQuery, ExportReportQuery } from "../types/reports.types";

export const REPORT_KEYS = {
  all: ["reports-analytics"] as const,
  dashboard: (filters: ReportFilterQuery) => [...REPORT_KEYS.all, "dashboard", filters] as const,
  revenue: (filters: ReportFilterQuery) => [...REPORT_KEYS.all, "revenue", filters] as const,
  invoices: (filters: ReportFilterQuery) => [...REPORT_KEYS.all, "invoices", filters] as const,
  tax: (filters: ReportFilterQuery) => [...REPORT_KEYS.all, "tax", filters] as const,
  profit: (filters: ReportFilterQuery) => [...REPORT_KEYS.all, "profit", filters] as const,
  clients: (filters: ReportFilterQuery) => [...REPORT_KEYS.all, "clients", filters] as const,
};

export const useDashboardReports = (filters: ReportFilterQuery = {}) => {
  return useQuery({
    queryKey: REPORT_KEYS.dashboard(filters),
    queryFn: () => reportsApi.getDashboardSummary(filters),
  });
};

export const useRevenueReport = (filters: ReportFilterQuery = {}) => {
  return useQuery({
    queryKey: REPORT_KEYS.revenue(filters),
    queryFn: () => reportsApi.getRevenueReport(filters),
  });
};

export const useInvoiceReport = (filters: ReportFilterQuery = {}) => {
  return useQuery({
    queryKey: REPORT_KEYS.invoices(filters),
    queryFn: () => reportsApi.getInvoiceReport(filters),
  });
};

export const useTaxReport = (filters: ReportFilterQuery = {}) => {
  return useQuery({
    queryKey: REPORT_KEYS.tax(filters),
    queryFn: () => reportsApi.getTaxReport(filters),
  });
};

export const useProfitLossReport = (filters: ReportFilterQuery = {}) => {
  return useQuery({
    queryKey: REPORT_KEYS.profit(filters),
    queryFn: () => reportsApi.getProfitAndLossReport(filters),
  });
};

export const useClientPerformanceReport = (filters: ReportFilterQuery = {}) => {
  return useQuery({
    queryKey: REPORT_KEYS.clients(filters),
    queryFn: () => reportsApi.getClientPerformanceReport(filters),
  });
};

export const useExportReport = () => {
  return useMutation({
    mutationFn: async (query: ExportReportQuery) => {
      toast.info(`Generating ${query.reportType.toUpperCase()} report in ${query.format.toUpperCase()} format...`);
      const { blob, fileName } = await reportsApi.downloadExportReportBlob(query);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      return fileName;
    },
    onSuccess: (fileName) => {
      toast.success(`Successfully downloaded ${fileName}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to generate report export");
    },
  });
};
