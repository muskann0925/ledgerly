export type QuotationStatus =
  | "DRAFT"
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "CONVERTED"
  | "EXPIRED";

export interface QuotationClientSummary {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone?: string;
  gstNumber?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
}

export interface QuotationItem {
  id?: string;
  quotationId?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount: number;
  total: number;
}

export interface Quotation {
  id: string;
  quotationNumber: string;
  clientId: string;
  client?: QuotationClientSummary;
  issueDate: string;
  expiryDate: string;
  status: QuotationStatus;
  currency: string;
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  notes?: string | null;
  terms?: string | null;
  approvedAt?: string | null;
  approvedBy?: string | null;
  rejectedAt?: string | null;
  rejectionReason?: string | null;
  convertedInvoiceId?: string | null;
  createdBy?: string | null;
  isDeleted: boolean;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  items: QuotationItem[];
}

export interface CreateQuotationItemPayload {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
}

export interface CreateQuotationPayload {
  clientId: string;
  issueDate?: string;
  expiryDate: string;
  status?: QuotationStatus;
  currency?: string;
  notes?: string | null;
  terms?: string | null;
  items: CreateQuotationItemPayload[];
}

export interface UpdateQuotationPayload {
  clientId?: string;
  issueDate?: string;
  expiryDate?: string;
  status?: QuotationStatus;
  currency?: string;
  notes?: string | null;
  terms?: string | null;
  items?: CreateQuotationItemPayload[];
}

export interface QuotationQueryParams {
  page?: number;
  limit?: number;
  pageSize?: number;
  search?: string;
  status?: QuotationStatus | "ALL";
  clientId?: string;
  startDate?: string;
  endDate?: string;
  isExpired?: boolean;
  isDeleted?: boolean;
  sortBy?: "quotationNumber" | "issueDate" | "expiryDate" | "total" | "status" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
  pageSize: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedQuotationsResponse {
  quotations: Quotation[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}
