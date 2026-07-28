export type PaymentMethod =
  | "CASH"
  | "UPI"
  | "BANK_TRANSFER"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "CHEQUE"
  | "OTHER";

export interface PaymentClientSummary {
  id: string;
  companyName: string;
  contactPerson: string;
  email?: string;
}

export interface PaymentInvoiceSummary {
  id: string;
  number: string;
  status: string;
  currency: string;
  total: number;
  amountPaid?: number;
  balanceDue?: number;
  dueDate?: string;
  client?: PaymentClientSummary;
}

export interface Payment {
  id: string;
  invoiceId: string;
  invoice?: PaymentInvoiceSummary;
  amount: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string | null;
  notes?: string | null;
  createdBy?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentPayload {
  invoiceId: string;
  amount: number;
  paymentDate?: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface UpdatePaymentPayload {
  amount?: number;
  paymentDate?: string;
  paymentMethod?: PaymentMethod;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  paymentMethod?: PaymentMethod | "ALL";
  startDate?: string;
  endDate?: string;
  isDeleted?: boolean;
  sortBy?: "paymentDate" | "amount" | "createdAt";
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

export interface PaginatedPaymentsResponse {
  payments: Payment[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
