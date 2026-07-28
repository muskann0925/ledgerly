import { AuditStatus } from "@prisma/client";

export interface CreateAuditLogInput {
  userId?: string | null;
  userName?: string | null;
  userEmail?: string | null;
  role?: string | null;
  action: string;
  module: string;
  entityType?: string | null;
  entityId?: string | null;
  entityName?: string | null;
  description: string;
  oldValue?: Record<string, any> | null;
  newValue?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  status?: AuditStatus;
}

export interface AuditLogQueryFilters {
  page?: number;
  limit?: number;
  search?: string;
  module?: string;
  action?: string;
  userId?: string;
  entityType?: string;
  entityId?: string;
  status?: AuditStatus;
  startDate?: string;
  endDate?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
