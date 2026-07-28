import type { QuotationStatus, Quotation, QuotationItem } from "@prisma/client";

export interface CreateQuotationItemDto {
  description: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discount?: number;
}

export interface CreateQuotationDto {
  clientId: string;
  issueDate?: string | Date;
  expiryDate: string | Date;
  status?: QuotationStatus;
  currency?: string;
  notes?: string | null;
  terms?: string | null;
  items: CreateQuotationItemDto[];
}

export interface UpdateQuotationDto {
  clientId?: string;
  issueDate?: string | Date;
  expiryDate?: string | Date;
  status?: QuotationStatus;
  currency?: string;
  notes?: string | null;
  terms?: string | null;
  items?: CreateQuotationItemDto[];
}

export interface RejectQuotationDto {
  rejectionReason?: string;
}

export interface QuotationQueryOptions {
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

export interface PaginatedQuotationsResult<T> {
  quotations: T[];
  pagination: {
    page: number;
    limit: number;
    pageSize: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export type { QuotationStatus, Quotation, QuotationItem };
