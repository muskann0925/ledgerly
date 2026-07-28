import type { AppliedTaxSnapshot } from "../../../shared/utils/taxCalculator";

export type InvoiceStatus =
  | "DRAFT"
  | "PENDING"
  | "SENT"
  | "VIEWED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "OVERDUE"
  | "CANCELLED"
  | "REFUNDED";

export interface InvoiceClientSummary {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber?: string | null;
  panNumber?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  state?: string | null;
}

export interface InvoiceItem {
  id?: string;
  invoiceId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  lineAmount?: number;
  taxRate?: number;
  taxIds?: string[];
  appliedTaxes?: AppliedTaxSnapshot[];
  discount?: number;
  total: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Payment {
  id: string;
  invoiceId: string;
  amount: number;
  paymentMethod: string;
  createdAt: string;
}

export interface Invoice {
  id: string;
  number: string;
  clientId: string;
  client: InvoiceClientSummary;
  issueDate: string;
  dueDate: string;
  status: InvoiceStatus;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  totalAdditiveTax: number;
  totalDeductionTax: number;
  grandTotal: number;
  netPayable: number;
  total: number;
  amountPaid: number;
  balanceDue: number;
  notes?: string | null;
  terms?: string | null;
  createdBy?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
  payments?: Payment[];
}

export interface CreateInvoiceItemPayload {
  description: string;
  quantity: number;
  unitPrice: number;
  taxIds?: string[];
  discount?: number;
}

export interface CreateInvoicePayload {
  clientId: string;
  issueDate?: string;
  dueDate: string;
  currency?: string;
  notes?: string;
  terms?: string;
  items: CreateInvoiceItemPayload[];
}

export interface UpdateInvoicePayload {
  clientId?: string;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  notes?: string;
  terms?: string;
  items?: CreateInvoiceItemPayload[];
}

export interface UpdateStatusPayload {
  status: InvoiceStatus;
}

export interface MarkPaidPayload {
  paymentMethod?: string;
  notes?: string;
}

export interface MarkPartialPayload {
  amount: number;
  paymentMethod?: string;
  notes?: string;
}

export interface InvoiceQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: InvoiceStatus | "ALL";
  clientId?: string;
  startDate?: string;
  endDate?: string;
  dueStartDate?: string;
  dueEndDate?: string;
  isDeleted?: boolean;
  sortBy?: "number" | "issueDate" | "dueDate" | "createdAt" | "total" | "status";
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedInvoicesResponse {
  invoices: Invoice[];
  meta: PaginationMeta;
}

export interface InvoiceDashboardSummary {
  totalInvoices: number;
  totalRevenue: number;
  outstandingAmount: number;
  overdueAmount: number;
  recentInvoices: Invoice[];
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
