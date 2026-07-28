export type ClientType = "INDIVIDUAL" | "BUSINESS";
export type ClientStatus = "ACTIVE" | "INACTIVE";

export interface InvoiceSummary {
  id: string;
  number: string;
  amount?: number;
  total?: number;
  amountPaid?: number;
  balanceDue?: number;
  currency?: string;
  status: string;
  createdAt: string;
  dueDate?: string;
}

export interface ClientDocumentSummary {
  id: string;
  title: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  createdAt: string;
}

export interface ClientActivitySummary {
  id: string;
  action: string;
  description: string;
  performedBy: string;
  createdAt: string;
}

export interface Client {
  id: string;
  companyName: string;
  clientType: ClientType;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber?: string | null;
  panNumber?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  state?: string | null;
  status: ClientStatus;
  notes?: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  invoices?: InvoiceSummary[];
  documents?: ClientDocumentSummary[];
  activities?: ClientActivitySummary[];
}

export interface CreateClientPayload {
  companyName: string;
  clientType?: ClientType;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber?: string | null;
  panNumber?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  state?: string | null;
  status?: ClientStatus;
  notes?: string | null;
}

export type UpdateClientPayload = Partial<CreateClientPayload>;

export interface ClientQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClientStatus;
  clientType?: ClientType;
  isDeleted?: boolean;
  sortBy?: "companyName" | "createdAt" | "status" | "email";
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface PaginatedClientsResponse {
  clients: Client[];
  pagination: PaginationMeta;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors?: Record<string, string[]>;
}
