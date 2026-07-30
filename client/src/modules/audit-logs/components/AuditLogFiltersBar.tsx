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
    <div className="bg-white dark:bg-[#111827] p-3 sm:p-3.5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-2.5 overflow-x-auto scrollbar-none w-full select-none">
      {/* Search Input */}
      <div className="relative w-64 sm:w-72 shrink-0">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input
          type="text"
          value={filters.search || ""}
          onChange={(e) => onFilterChange({ search: e.target.value })}
          placeholder="Search description, user, action..."
          className="w-full h-9 pl-9 pr-3 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#182235] text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
        />
      </div>

      {/* Module Filter */}
      <Select
        value={filters.module || "ALL"}
        onValueChange={(val) =>
          onFilterChange({ module: val === "ALL" ? undefined : val })
        }
      >
        <SelectTrigger className="h-9 w-36 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-[#182235] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shrink-0">
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
        <SelectTrigger className="h-9 w-32 text-xs font-semibold rounded-xl bg-slate-50 dark:bg-[#182235] border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shrink-0">
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
        className="h-9 w-32 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#182235] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#F97316] shrink-0"
        title="Start Date"
      />

      {/* End Date */}
      <input
        type="date"
        value={filters.endDate || ""}
        onChange={(e) => onFilterChange({ endDate: e.target.value })}
        className="h-9 w-32 px-2.5 text-xs rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#182235] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-[#F97316] shrink-0"
        title="End Date"
      />

      {/* Reset Button */}
      {isFiltered && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="h-9 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl shrink-0"
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
        className="h-9 text-xs font-semibold rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shrink-0"
      >
        <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isFetching ? "animate-spin" : ""}`} />
        Refresh
      </Button>

      {/* Export CSV Button */}
      <Button
        size="sm"
        onClick={onExport}
        disabled={isExporting}
        className="h-9 text-xs rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-semibold shadow-xs shrink-0"
      >
        <Download className="w-3.5 h-3.5 mr-1.5" />
        {isExporting ? "Exporting..." : "Export CSV"}
      </Button>
    </div>
  );
};
