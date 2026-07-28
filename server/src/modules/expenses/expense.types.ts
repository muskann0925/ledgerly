import { ExpenseStatus, ExpensePaymentMethod } from "@prisma/client";

// ==========================================
// Category DTOs & Types
// ==========================================

export interface CreateCategoryDto {
  name: string;
  description?: string;
  color?: string;
}

export interface UpdateCategoryDto {
  name?: string;
  description?: string;
  color?: string;
}

export interface CategoryQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  includeDeleted?: boolean;
}

// ==========================================
// Vendor DTOs & Types
// ==========================================

export interface CreateVendorDto {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  panNumber?: string;
  notes?: string;
}

export interface UpdateVendorDto {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  panNumber?: string;
  notes?: string;
}

export interface VendorQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  includeDeleted?: boolean;
}

// ==========================================
// Expense DTOs & Types
// ==========================================

export interface CreateExpenseDto {
  title: string;
  categoryId: string;
  vendorId?: string;
  amount: number;
  taxRate?: number;
  isTaxInclusive?: boolean;
  paymentMethod?: ExpensePaymentMethod;
  status?: ExpenseStatus;
  expenseDate?: string | Date;
  dueDate?: string | Date;
  referenceNumber?: string;
  notes?: string;
}

export interface UpdateExpenseDto {
  title?: string;
  categoryId?: string;
  vendorId?: string | null;
  amount?: number;
  taxRate?: number;
  isTaxInclusive?: boolean;
  paymentMethod?: ExpensePaymentMethod;
  status?: ExpenseStatus;
  expenseDate?: string | Date;
  dueDate?: string | Date | null;
  paidAt?: string | Date | null;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface UpdateExpenseStatusDto {
  status: ExpenseStatus;
  paidAt?: string | Date;
}

export interface ExpenseQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  vendorId?: string;
  status?: ExpenseStatus;
  paymentMethod?: ExpensePaymentMethod;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: "expenseDate" | "totalAmount" | "title" | "createdAt";
  sortOrder?: "asc" | "desc";
  includeDeleted?: boolean;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  startRecord: number;
  endRecord: number;
}

export interface PaginatedResult<T> {
  data: T[];
  meta: PaginationMeta;
}

// ==========================================
// Report Types & Interfaces
// ==========================================

export interface ReportDateFilter {
  startDate?: string;
  endDate?: string;
  categoryId?: string;
  vendorId?: string;
}

export interface ExpenseTotalReport {
  totalAmount: number;
  paidAmount: number;
  pendingAmount: number;
  cancelledAmount: number;
  totalTaxAmount: number;
  totalCount: number;
  averageAmount: number;
}

export interface CategoryExpenseReport {
  categoryId: string;
  categoryName: string;
  categoryColor?: string | null;
  totalAmount: number;
  count: number;
  percentage: number;
}

export interface VendorExpenseReport {
  vendorId: string | null;
  vendorName: string;
  totalAmount: number;
  count: number;
  percentage: number;
}

export interface MonthlyTrendReport {
  yearMonth: string; // e.g. "2026-07"
  monthName: string; // e.g. "July 2026"
  totalAmount: number;
  taxAmount: number;
  count: number;
}

export interface TaxSummaryReport {
  totalTaxPaid: number;
  inclusiveTaxAmount: number;
  exclusiveTaxAmount: number;
  taxByRate: {
    taxRate: number;
    taxAmount: number;
    totalExpenseAmount: number;
    count: number;
  }[];
}

export interface DashboardSummaryReport {
  currentMonth: {
    totalAmount: number;
    count: number;
    percentageChangeFromLastMonth: number;
  };
  pendingExpenses: {
    count: number;
    totalAmount: number;
  };
  paidExpenses: {
    count: number;
    totalAmount: number;
  };
  topCategories: CategoryExpenseReport[];
  topVendors: VendorExpenseReport[];
  recentExpenses: any[];
}
