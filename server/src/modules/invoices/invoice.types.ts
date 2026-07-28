import type { InvoiceStatus } from "@prisma/client";
import type { AppliedTaxSnapshot } from "../../shared/utils/taxCalculator";

export interface InvoiceItemPayload {
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
  items: InvoiceItemPayload[];
}

export interface UpdateInvoicePayload {
  clientId?: string;
  issueDate?: string;
  dueDate?: string;
  currency?: string;
  notes?: string;
  terms?: string;
  items?: InvoiceItemPayload[];
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

export interface UpdateInvoiceStatusPayload {
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

export interface InvoiceCalculatedItem {
  description: string;
  quantity: number;
  unitPrice: number;
  lineAmount: number;
  appliedTaxes: AppliedTaxSnapshot[];
  total: number;
}

export interface InvoiceTotals {
  subtotal: number;
  totalAdditiveTax: number;
  totalDeductionTax: number;
  grandTotal: number;
  netPayable: number;
  total: number;
  balanceDue: number;
}
