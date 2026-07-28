import { ClientType, ClientStatus } from "@prisma/client";

export interface CreateClientDto {
  companyName: string;
  clientType?: ClientType;
  contactPerson: string;
  email: string;
  phone: string;
  gstNumber?: string | null;
  panNumber?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  status?: ClientStatus;
  notes?: string | null;
}

export interface UpdateClientDto {
  companyName?: string;
  clientType?: ClientType;
  contactPerson?: string;
  email?: string;
  phone?: string;
  gstNumber?: string | null;
  panNumber?: string | null;
  billingAddress?: string | null;
  shippingAddress?: string | null;
  status?: ClientStatus;
  notes?: string | null;
}

export interface ClientQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  status?: ClientStatus;
  clientType?: ClientType;
  isDeleted?: boolean;
  sortBy?: "companyName" | "createdAt" | "status" | "email";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedClientsResult<T> {
  clients: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}
