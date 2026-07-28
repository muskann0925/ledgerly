import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShieldCheck,
  ShieldAlert,
  Eye,
  Clock,
  Inbox,
} from "lucide-react";
import { Button } from "../../../components/ui/button";
import type { AuditLogItem, AuditLogPagination } from "../types/auditLog.types";

interface AuditLogTableProps {
  logs: AuditLogItem[];
  pagination: AuditLogPagination;
  isLoading: boolean;
  onPageChange: (page: number) => void;
  onViewDetails: (log: AuditLogItem) => void;
}

export const AuditLogTable: React.FC<AuditLogTableProps> = ({
  logs,
  pagination,
  isLoading,
  onPageChange,
  onViewDetails,
}) => {
  const { page, limit, total, totalPages } = pagination;
  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-xl w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-12 text-center shadow-xs">
        <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#F97316] flex items-center justify-center mx-auto mb-3">
          <Inbox className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-white">No Audit Logs Found</h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
          No user or system activities match the selected filter criteria. Try clearing or expanding your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="py-3.5 px-4">Time</th>
              <th className="py-3.5 px-4">User</th>
              <th className="py-3.5 px-4">Role</th>
              <th className="py-3.5 px-4">Module</th>
              <th className="py-3.5 px-4">Action</th>
              <th className="py-3.5 px-4">Entity</th>
              <th className="py-3.5 px-4">Description</th>
              <th className="py-3.5 px-4 text-center">Status</th>
              <th className="py-3.5 px-4 text-right">View</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
            {logs.map((log) => {
              const isSuccess = log.status === "SUCCESS";
              const dateStr = new Date(log.createdAt).toLocaleString("en-IN", {
                dateStyle: "short",
                timeStyle: "short",
              });

              return (
                <tr
                  key={log.id}
                  onClick={() => onViewDetails(log)}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 cursor-pointer transition-colors"
                >
                  {/* Time */}
                  <td className="py-3 px-4 whitespace-nowrap text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{dateStr}</span>
                    </div>
                  </td>

                  {/* User */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-bold text-slate-900 dark:text-slate-100">
                      {log.userName || log.user?.name || "System"}
                    </div>
                    {log.userEmail && (
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">
                        {log.userEmail}
                      </div>
                    )}
                  </td>

                  {/* Role */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-block text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {log.role || "SYSTEM"}
                    </span>
                  </td>

                  {/* Module */}
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="inline-block text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-md bg-orange-100 dark:bg-orange-950/60 text-[#F97316]">
                      {log.module}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-3 px-4 whitespace-nowrap font-bold text-slate-800 dark:text-slate-200">
                    {log.action}
                  </td>

                  {/* Entity */}
                  <td className="py-3 px-4 whitespace-nowrap max-w-[150px] truncate text-slate-600 dark:text-slate-400">
                    {log.entityName ? (
                      <span className="font-semibold text-slate-800 dark:text-slate-200" title={log.entityName}>
                        {log.entityName}
                      </span>
                    ) : log.entityType ? (
                      <span className="text-slate-500 font-mono text-[11px]">{log.entityType}</span>
                    ) : (
                      <span className="text-slate-400">—</span>
                    )}
                  </td>

                  {/* Description */}
                  <td className="py-3 px-4 max-w-xs truncate text-slate-600 dark:text-slate-300" title={log.description}>
                    {log.description}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 whitespace-nowrap text-center">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        isSuccess
                          ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300"
                          : "bg-rose-100 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300"
                      }`}
                    >
                      {isSuccess ? <ShieldCheck className="w-3 h-3" /> : <ShieldAlert className="w-3 h-3" />}
                      {log.status}
                    </span>
                  </td>

                  {/* View Details Action */}
                  <td className="py-3 px-4 whitespace-nowrap text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={(e) => {
                        e.stopPropagation();
                        onViewDetails(log);
                      }}
                      className="h-7 w-7 p-0 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Standard Pagination Component Pattern (AGENTS.md rule compliant) */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {/* Left Side: Showing X–Y of Z */}
        <div className="text-slate-500 dark:text-slate-400 font-medium">
          Showing <span className="font-bold text-slate-900 dark:text-white">{startRecord}</span>–
          <span className="font-bold text-slate-900 dark:text-white">{endRecord}</span> of{" "}
          <span className="font-bold text-slate-900 dark:text-white">{total}</span>
        </div>

        {/* Right Side: Pagination Controls */}
        <div className="flex items-center gap-2">
          {/* First Page Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page <= 1}
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 p-0 flex items-center justify-center"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </Button>

          {/* Previous Page Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 p-0 flex items-center justify-center"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </Button>

          {/* Page Counter */}
          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-2">
            Page {page} of {totalPages}
          </span>

          {/* Next Page Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 p-0 flex items-center justify-center"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </Button>

          {/* Last Page Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 p-0 flex items-center justify-center"
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4 text-slate-600 dark:text-slate-300" />
          </Button>
        </div>
      </div>
    </div>
  );
};
