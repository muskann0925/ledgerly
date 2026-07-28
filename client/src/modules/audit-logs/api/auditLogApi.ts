import { apiClient } from "../../../lib/axios";
import type { AuditLogApiResponse, AuditLogFilters, AuditLogItem } from "../types/auditLog.types";

export const auditLogApi = {
  /**
   * Fetch paginated list of audit logs with search, filters, sorting
   */
  getAuditLogs: async (params: AuditLogFilters): Promise<AuditLogApiResponse> => {
    const response = await apiClient.get<AuditLogApiResponse>("/audit-logs", { params });
    return response.data;
  },

  /**
   * Fetch single audit log by ID
   */
  getAuditLogById: async (id: string): Promise<{ success: boolean; data: AuditLogItem }> => {
    const response = await apiClient.get<{ success: boolean; data: AuditLogItem }>(`/audit-logs/${id}`);
    return response.data;
  },

  /**
   * Fetch entity history trail
   */
  getEntityHistory: async (
    entityType: string,
    entityId: string
  ): Promise<{ success: boolean; data: AuditLogItem[] }> => {
    const response = await apiClient.get<{ success: boolean; data: AuditLogItem[] }>(
      `/audit-logs/entity/${entityType}/${entityId}`
    );
    return response.data;
  },

  /**
   * Export audit logs to CSV
   */
  exportAuditLogs: async (params: AuditLogFilters): Promise<Blob> => {
    const response = await apiClient.get("/audit-logs/export", {
      params,
      responseType: "blob",
    });
    return response.data;
  },
};
