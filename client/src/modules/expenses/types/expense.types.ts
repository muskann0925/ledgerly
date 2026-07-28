export type ExpenseStatus = "PENDING" | "PAID" | "CANCELLED";

export type ExpensePaymentMethod =
  | "CASH"
  | "UPI"
  | "BANK_TRANSFER"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "CHEQUE"
  | "OTHER";

export interface ExpenseCategory {
  id: string;
  name: string;
  description?: string | null;
  color?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    expenses: number;
  };
}

export interface Vendor {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  gstNumber?: string | null;
  panNumber?: string | null;
  notes?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  _count?: {
    expenses: number;
  };
}

export interface ExpenseAuditLog {
  id: string;
  expenseId: string;
  action: string;
  details: string;
  performedBy?: string | null;
  userRole?: string | null;
  createdAt: string;
}

export interface Expense {
  id: string;
  expenseNumber: string;
  title: string;
  categoryId: string;
  category: {
    id: string;
    name: string;
    color?: string | null;
  };
  vendorId?: string | null;
  vendor?: {
    id: string;
    name: string;
    email?: string | null;
    phone?: string | null;
    gstNumber?: string | null;
  } | null;
  amount: number;
  taxRate: number;
  taxAmount: number;
  isTaxInclusive: boolean;
  totalAmount: number;
  paymentMethod: ExpensePaymentMethod;
  status: ExpenseStatus;
  expenseDate: string;
  dueDate?: string | null;
  paidAt?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
  receiptUrl?: string | null;
  receiptPublicId?: string | null;
  receiptOriginalName?: string | null;
  receiptMimeType?: string | null;
  receiptSize?: number | null;
  createdBy?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  auditLogs?: ExpenseAuditLog[];
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  startRecord: number;
  endRecord: number;
}

export interface PaginatedApiResponse<T> {
  success: boolean;
  data: T[];
  meta: PaginationMeta;
}

export interface SingleApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface ExpenseQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  vendorId?: string;
  status?: ExpenseStatus;
  paymentMethod?: ExpensePaymentMethod;
  isTaxInclusive?: boolean;
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  sortBy?: "expenseDate" | "totalAmount" | "title" | "createdAt";
  sortOrder?: "asc" | "desc";
  includeDeleted?: boolean;
}

export interface CategoryQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  includeDeleted?: boolean;
}

export interface VendorQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  includeDeleted?: boolean;
}

export interface ReportFilters {
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
  yearMonth: string;
  monthName: string;
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
  recentExpenses: Expense[];
}

export interface CreateCategoryPayload {
  name: string;
  description?: string;
  color?: string;
}

export interface CreateVendorPayload {
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  gstNumber?: string;
  panNumber?: string;
  notes?: string;
}

export interface CreateExpensePayload {
  title: string;
  categoryId: string;
  vendorId?: string;
  amount: number;
  taxRate?: number;
  isTaxInclusive?: boolean;
  paymentMethod?: ExpensePaymentMethod;
  status?: ExpenseStatus;
  expenseDate?: string;
  dueDate?: string;
  referenceNumber?: string;
  notes?: string;
  receipt?: File | null;
}
