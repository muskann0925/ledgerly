import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { expenseApi } from "../api/expenseApi";
import { toast } from "sonner";
import type {
  ExpenseQueryFilters,
  CategoryQueryFilters,
  VendorQueryFilters,
  ReportFilters,
  CreateCategoryPayload,
  CreateVendorPayload,
} from "../types/expense.types";

export const EXPENSE_KEYS = {
  all: ["expenses"] as const,
  lists: () => [...EXPENSE_KEYS.all, "list"] as const,
  list: (filters: ExpenseQueryFilters) => [...EXPENSE_KEYS.lists(), filters] as const,
  details: () => [...EXPENSE_KEYS.all, "detail"] as const,
  detail: (id: string) => [...EXPENSE_KEYS.details(), id] as const,

  categoriesAll: ["expense-categories"] as const,
  categoriesList: (filters: CategoryQueryFilters) => [...EXPENSE_KEYS.categoriesAll, filters] as const,

  vendorsAll: ["vendors"] as const,
  vendorsList: (filters: VendorQueryFilters) => [...EXPENSE_KEYS.vendorsAll, filters] as const,

  reportsAll: ["expense-reports"] as const,
  reports: (filters: ReportFilters) => [...EXPENSE_KEYS.reportsAll, filters] as const,
  dashboard: () => [...EXPENSE_KEYS.all, "dashboard"] as const,
};

// ==========================================
// Category Hooks
// ==========================================
export const useExpenseCategories = (filters: CategoryQueryFilters = {}) => {
  return useQuery({
    queryKey: EXPENSE_KEYS.categoriesList(filters),
    queryFn: () => expenseApi.getCategories(filters),
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateCategoryPayload) => expenseApi.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.categoriesAll });
      toast.success("Expense category created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create category");
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateCategoryPayload> }) =>
      expenseApi.updateCategory(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.categoriesAll });
      toast.success("Expense category updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update category");
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseApi.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.categoriesAll });
      toast.success("Expense category deleted");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete category");
    },
  });
};

export const useRestoreCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseApi.restoreCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.categoriesAll });
      toast.success("Expense category restored");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to restore category");
    },
  });
};

// ==========================================
// Vendor Hooks
// ==========================================
export const useVendors = (filters: VendorQueryFilters = {}) => {
  return useQuery({
    queryKey: EXPENSE_KEYS.vendorsList(filters),
    queryFn: () => expenseApi.getVendors(filters),
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateVendorPayload) => expenseApi.createVendor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.vendorsAll });
      toast.success("Vendor created successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to create vendor");
    },
  });
};

export const useUpdateVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<CreateVendorPayload> }) =>
      expenseApi.updateVendor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.vendorsAll });
      toast.success("Vendor updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update vendor");
    },
  });
};

export const useDeleteVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseApi.deleteVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.vendorsAll });
      toast.success("Vendor deleted");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete vendor");
    },
  });
};

export const useRestoreVendor = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseApi.restoreVendor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.vendorsAll });
      toast.success("Vendor restored");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to restore vendor");
    },
  });
};

// ==========================================
// Expense Hooks
// ==========================================
export const useExpenses = (filters: ExpenseQueryFilters = {}) => {
  return useQuery({
    queryKey: EXPENSE_KEYS.list(filters),
    queryFn: () => expenseApi.getExpenses(filters),
  });
};

export const useExpenseDetails = (id: string | null) => {
  return useQuery({
    queryKey: EXPENSE_KEYS.detail(id || ""),
    queryFn: () => expenseApi.getExpenseById(id || ""),
    enabled: Boolean(id),
  });
};

export const useCreateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => expenseApi.createExpense(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all });
      toast.success("Expense added successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add expense");
    },
  });
};

export const useUpdateExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: FormData }) =>
      expenseApi.updateExpense(id, formData),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.detail(variables.id) });
      toast.success("Expense updated successfully");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update expense");
    },
  });
};

export const useUpdateExpenseStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, paidAt }: { id: string; status: string; paidAt?: string }) =>
      expenseApi.updateExpenseStatus(id, status, paidAt),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.detail(variables.id) });
      toast.success(`Expense marked as ${variables.status.toLowerCase()}`);
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to update expense status");
    },
  });
};

export const useDeleteExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseApi.deleteExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all });
      toast.success("Expense soft-deleted");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to delete expense");
    },
  });
};

export const useRestoreExpense = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseApi.restoreExpense(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all });
      toast.success("Expense restored");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to restore expense");
    },
  });
};

export const useRemoveReceipt = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => expenseApi.removeReceipt(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.all });
      queryClient.invalidateQueries({ queryKey: EXPENSE_KEYS.detail(id) });
      toast.success("Receipt attachment removed");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to remove receipt");
    },
  });
};

// ==========================================
// Report Hooks
// ==========================================
export const useExpenseDashboard = () => {
  return useQuery({
    queryKey: EXPENSE_KEYS.dashboard(),
    queryFn: () => expenseApi.getDashboardSummary(),
  });
};

export const useExpenseReports = (filters: ReportFilters = {}) => {
  const totals = useQuery({
    queryKey: [...EXPENSE_KEYS.reports(filters), "totals"],
    queryFn: () => expenseApi.getReportsTotal(filters),
  });

  const byCategory = useQuery({
    queryKey: [...EXPENSE_KEYS.reports(filters), "by-category"],
    queryFn: () => expenseApi.getReportsByCategory(filters),
  });

  const byVendor = useQuery({
    queryKey: [...EXPENSE_KEYS.reports(filters), "by-vendor"],
    queryFn: () => expenseApi.getReportsByVendor(filters),
  });

  const monthlyTrend = useQuery({
    queryKey: [...EXPENSE_KEYS.reports(filters), "monthly-trend"],
    queryFn: () => expenseApi.getReportsMonthlyTrend(filters),
  });

  const taxSummary = useQuery({
    queryKey: [...EXPENSE_KEYS.reports(filters), "tax-summary"],
    queryFn: () => expenseApi.getReportsTaxSummary(filters),
  });

  return {
    totals,
    byCategory,
    byVendor,
    monthlyTrend,
    taxSummary,
    isLoading:
      totals.isLoading ||
      byCategory.isLoading ||
      byVendor.isLoading ||
      monthlyTrend.isLoading ||
      taxSummary.isLoading,
  };
};
