import { PaymentMethod, PaymentStatus, Payment } from "@prisma/client";

export interface CreatePaymentDto {
  invoiceId: string;
  amount: number;
  paymentDate?: string | Date;
  paymentMethod: PaymentMethod;
  status?: PaymentStatus;
  failureReason?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface UpdatePaymentDto {
  amount?: number;
  paymentDate?: string | Date;
  paymentMethod?: PaymentMethod;
  status?: PaymentStatus;
  failureReason?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface PaymentQueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  paymentMethod?: PaymentMethod | "ALL";
  status?: PaymentStatus | "ALL";
  startDate?: string;
  endDate?: string;
  isDeleted?: boolean;
  sortBy?: "paymentDate" | "amount" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginatedPaymentsResult<T> {
  payments: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export type { Payment, PaymentStatus };

