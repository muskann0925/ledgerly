import { apiClient } from "../../../lib/axios";
import type {
  Expense,
  ExpenseCategory,
  Vendor,
  PaginatedApiResponse,
  SingleApiResponse,
  ExpenseQueryFilters,
  CategoryQueryFilters,
  VendorQueryFilters,
  ReportFilters,
  ExpenseTotalReport,
  CategoryExpenseReport,
  VendorExpenseReport,
  MonthlyTrendReport,
  TaxSummaryReport,
  DashboardSummaryReport,
  CreateCategoryPayload,
  CreateVendorPayload,
} from "../types/expense.types";

export const expenseApi = {
  // ==========================================
  // Categories APIs
  // ==========================================
  getCategories: async (filters: CategoryQueryFilters = {}): Promise<PaginatedApiResponse<ExpenseCategory>> => {
    const response = await apiClient.get("/expenses/categories", { params: filters });
    return response.data;
  },

  getCategoryById: async (id: string): Promise<SingleApiResponse<ExpenseCategory>> => {
    const response = await apiClient.get(`/expenses/categories/${id}`);
    return response.data;
  },

  createCategory: async (payload: CreateCategoryPayload): Promise<SingleApiResponse<ExpenseCategory>> => {
    const response = await apiClient.post("/expenses/categories", payload);
    return response.data;
  },

  updateCategory: async (id: string, payload: Partial<CreateCategoryPayload>): Promise<SingleApiResponse<ExpenseCategory>> => {
    const response = await apiClient.put(`/expenses/categories/${id}`, payload);
    return response.data;
  },

  deleteCategory: async (id: string): Promise<SingleApiResponse<ExpenseCategory>> => {
    const response = await apiClient.delete(`/expenses/categories/${id}`);
    return response.data;
  },

  restoreCategory: async (id: string): Promise<SingleApiResponse<ExpenseCategory>> => {
    const response = await apiClient.patch(`/expenses/categories/${id}/restore`);
    return response.data;
  },

  // ==========================================
  // Vendors APIs
  // ==========================================
  getVendors: async (filters: VendorQueryFilters = {}): Promise<PaginatedApiResponse<Vendor>> => {
    const response = await apiClient.get("/expenses/vendors", { params: filters });
    return response.data;
  },

  getVendorById: async (id: string): Promise<SingleApiResponse<Vendor>> => {
    const response = await apiClient.get(`/expenses/vendors/${id}`);
    return response.data;
  },

  createVendor: async (payload: CreateVendorPayload): Promise<SingleApiResponse<Vendor>> => {
    const response = await apiClient.post("/expenses/vendors", payload);
    return response.data;
  },

  updateVendor: async (id: string, payload: Partial<CreateVendorPayload>): Promise<SingleApiResponse<Vendor>> => {
    const response = await apiClient.put(`/expenses/vendors/${id}`, payload);
    return response.data;
  },

  deleteVendor: async (id: string): Promise<SingleApiResponse<Vendor>> => {
    const response = await apiClient.delete(`/expenses/vendors/${id}`);
    return response.data;
  },

  restoreVendor: async (id: string): Promise<SingleApiResponse<Vendor>> => {
    const response = await apiClient.patch(`/expenses/vendors/${id}/restore`);
    return response.data;
  },

  // ==========================================
  // Expenses CRUD APIs
  // ==========================================
  getExpenses: async (filters: ExpenseQueryFilters = {}): Promise<PaginatedApiResponse<Expense>> => {
    const response = await apiClient.get("/expenses", { params: filters });
    return response.data;
  },

  getExpenseById: async (id: string): Promise<SingleApiResponse<Expense>> => {
    const response = await apiClient.get(`/expenses/${id}`);
    return response.data;
  },

  createExpense: async (formData: FormData): Promise<SingleApiResponse<Expense>> => {
    const response = await apiClient.post("/expenses", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateExpense: async (id: string, formData: FormData): Promise<SingleApiResponse<Expense>> => {
    const response = await apiClient.put(`/expenses/${id}`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return response.data;
  },

  updateExpenseStatus: async (
    id: string,
    status: string,
    paidAt?: string
  ): Promise<SingleApiResponse<Expense>> => {
    const response = await apiClient.patch(`/expenses/${id}/status`, { status, paidAt });
    return response.data;
  },

  deleteExpense: async (id: string): Promise<SingleApiResponse<Expense>> => {
    const response = await apiClient.delete(`/expenses/${id}`);
    return response.data;
  },

  restoreExpense: async (id: string): Promise<SingleApiResponse<Expense>> => {
    const response = await apiClient.patch(`/expenses/${id}/restore`);
    return response.data;
  },

  removeReceipt: async (id: string): Promise<SingleApiResponse<Expense>> => {
    const response = await apiClient.delete(`/expenses/${id}/receipt`);
    return response.data;
  },

  getReceiptViewUrl: (id: string): string => {
    return `/api/expenses/${id}/receipt/view`;
  },

  downloadReceipt: async (id: string): Promise<Blob> => {
    const response = await apiClient.get(`/expenses/${id}/receipt/download`, {
      responseType: "blob",
    });
    return response.data;
  },

  // ==========================================
  // Reports & Analytics APIs
  // ==========================================
  getReportsTotal: async (filters: ReportFilters = {}): Promise<SingleApiResponse<ExpenseTotalReport>> => {
    const response = await apiClient.get("/expenses/reports/total", { params: filters });
    return response.data;
  },

  getReportsByCategory: async (filters: ReportFilters = {}): Promise<SingleApiResponse<CategoryExpenseReport[]>> => {
    const response = await apiClient.get("/expenses/reports/by-category", { params: filters });
    return response.data;
  },

  getReportsByVendor: async (filters: ReportFilters = {}): Promise<SingleApiResponse<VendorExpenseReport[]>> => {
    const response = await apiClient.get("/expenses/reports/by-vendor", { params: filters });
    return response.data;
  },

  getReportsMonthlyTrend: async (filters: ReportFilters = {}): Promise<SingleApiResponse<MonthlyTrendReport[]>> => {
    const response = await apiClient.get("/expenses/reports/monthly-trend", { params: filters });
    return response.data;
  },

  getReportsTaxSummary: async (filters: ReportFilters = {}): Promise<SingleApiResponse<TaxSummaryReport>> => {
    const response = await apiClient.get("/expenses/reports/tax-summary", { params: filters });
    return response.data;
  },

  getReportsDateRange: async (filters: ReportFilters = {}): Promise<SingleApiResponse<any>> => {
    const response = await apiClient.get("/expenses/reports/date-range", { params: filters });
    return response.data;
  },

  getDashboardSummary: async (): Promise<SingleApiResponse<DashboardSummaryReport>> => {
    const response = await apiClient.get("/expenses/reports/dashboard");
    return response.data;
  },
};
