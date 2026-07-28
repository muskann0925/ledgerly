import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { auditLogApi } from "../api/auditLogApi";
import type { AuditLogFilters, AuditLogItem } from "../types/auditLog.types";
import { toast } from "sonner";

export function useAuditLogs(initialFilters: AuditLogFilters = {}) {
  const [filters, setFilters] = useState<AuditLogFilters>({
    page: 1,
    limit: 10,
    sortBy: "createdAt",
    sortOrder: "desc",
    ...initialFilters,
  });

  const [selectedLog, setSelectedLog] = useState<AuditLogItem | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const queryKey = ["audit-logs", filters];

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey,
    queryFn: () => auditLogApi.getAuditLogs(filters),
    placeholderData: (previousData) => previousData,
    staleTime: 10000,
  });

  const handleFilterChange = useCallback((newFilters: Partial<AuditLogFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      // Reset to page 1 if search/module/status/action filters changed without explicit page
      page: newFilters.page !== undefined ? newFilters.page : 1,
    }));
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({
      page: 1,
      limit: 10,
      search: "",
      module: undefined,
      action: undefined,
      status: undefined,
      userId: undefined,
      startDate: undefined,
      endDate: undefined,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  }, []);

  const handleExportCSV = async () => {
    try {
      setIsExporting(true);
      const blob = await auditLogApi.exportAuditLogs(filters);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Audit_Logs_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
      toast.success("Audit Logs exported successfully as CSV", {
        className: "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl dark:shadow-2xl",
      });
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export audit logs", {
        className: "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xl dark:shadow-2xl",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return {
    logs: data?.data || [],
    pagination: data?.pagination || { page: 1, limit: 10, total: 0, totalPages: 1 },
    isLoading,
    isFetching,
    error,
    filters,
    selectedLog,
    isDetailsOpen,
    isExporting,
    setSelectedLog,
    setIsDetailsOpen,
    handleFilterChange,
    handleResetFilters,
    handleExportCSV,
    refetch,
  };
}
