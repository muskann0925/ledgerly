import React from "react";
import { Search, RotateCcw, Download, RefreshCw } from "lucide-react";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type { AuditLogFilters, AuditStatus } from "../types/auditLog.types";

interface AuditLogFiltersBarProps {
  filters: AuditLogFilters;
  onFilterChange: (newFilters: Partial<AuditLogFilters>) => void;
  onResetFilters: () => void;
  onRefresh: () => void;
  onExport: () => void;
  isFetching?: boolean;
  isExporting?: boolean;
}

export const MODULE_OPTIONS = [
  "ALL",
  "AUTH",
  "USERS",
  "CLIENTS",
  "INVOICES",
  "QUOTATIONS",
  "PAYMENTS",
  "EXPENSES",
  "TAXES",
  "SETTINGS",
  "SYSTEM",
];

export const AuditLogFiltersBar: React.FC<AuditLogFiltersBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onRefresh,
  onExport,
  isFetching = false,
  isExporting = false,
}) => {
  const isFiltered = Boolean(
    filters.search ||
      (filters.module && filters.module !== "ALL") ||
      filters.status ||
      filters.startDate ||
      filters.endDate
  );

  return (
    <div className="bg-white dark:bg-[#111827] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[240px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={filters.search || ""}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            placeholder="Search description, user, action, entity name or ID..."
            className="w-full h-10 pl-10 pr-4 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
        </div>

        {/* Dropdown Filters & Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Module Filter */}
          <Select
            value={filters.module || "ALL"}
            onValueChange={(val) =>
              onFilterChange({ module: val === "ALL" ? undefined : val })
            }
          >
            <SelectTrigger className="h-10 w-36 text-xs rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              {MODULE_OPTIONS.map((mod) => (
                <SelectItem key={mod} value={mod}>
                  {mod === "ALL" ? "All Modules" : mod}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Status Filter */}
          <Select
            value={filters.status || "ALL"}
            onValueChange={(val) =>
              onFilterChange({ status: val === "ALL" ? undefined : (val as AuditStatus) })
            }
          >
            <SelectTrigger className="h-10 w-32 text-xs rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Status</SelectItem>
              <SelectItem value="SUCCESS">Success Only</SelectItem>
              <SelectItem value="FAILED">Failed Only</SelectItem>
            </SelectContent>
          </Select>

          {/* Start Date */}
          <input
            type="date"
            value={filters.startDate || ""}
            onChange={(e) => onFilterChange({ startDate: e.target.value })}
            className="h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            title="Start Date"
          />

          {/* End Date */}
          <input
            type="date"
            value={filters.endDate || ""}
            onChange={(e) => onFilterChange({ endDate: e.target.value })}
            className="h-10 px-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            title="End Date"
          />

          {/* Reset Button */}
          {isFiltered && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onResetFilters}
              className="h-10 text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1" /> Reset
            </Button>
          )}

          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isFetching}
            className="h-10 text-xs rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800"
          >
            <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
            Refresh
          </Button>

          {/* Export CSV Button */}
          <Button
            size="sm"
            onClick={onExport}
            disabled={isExporting}
            className="h-10 text-xs rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-semibold shadow-xs"
          >
            <Download className="w-3.5 h-3.5 mr-1.5" />
            {isExporting ? "Exporting..." : "Export CSV"}
          </Button>
        </div>
      </div>
    </div>
  );
};
