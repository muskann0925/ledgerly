export type AuditStatus = "SUCCESS" | "FAILED";

export interface AuditLogItem {
  id: string;
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
  status: AuditStatus;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    role: string;
    profileImage?: string | null;
  } | null;
}

export interface AuditLogPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface AuditLogApiResponse {
  success: boolean;
  data: AuditLogItem[];
  pagination: AuditLogPagination;
}

export interface AuditLogFilters {
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
