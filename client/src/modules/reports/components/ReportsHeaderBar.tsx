import React from "react";
import {
  Filter,
  FileSpreadsheet,
  FileText,
  Download,
  RotateCcw,
} from "lucide-react";
import type { ReportFilterQuery, ReportPeriod } from "../types/reports.types";

interface ReportsHeaderBarProps {
  filters: ReportFilterQuery;
  onFilterChange: (updated: Partial<ReportFilterQuery>) => void;
  onResetFilters: () => void;
  onExport: (format: "pdf" | "excel" | "csv") => void;
  isExporting?: boolean;
}

export const ReportsHeaderBar: React.FC<ReportsHeaderBarProps> = ({
  filters,
  onFilterChange,
  onResetFilters,
  onExport,
  isExporting = false,
}) => {
  const hasActiveFilters = Boolean(
    filters.startDate ||
      filters.endDate ||
      filters.clientId ||
      filters.status ||
      filters.paymentMethod
  );

  return (
    <div className="sticky top-0 z-20 bg-white/95 dark:bg-[#111827]/95 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 mb-6 shadow-md space-y-3 transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Left: Period Selector */}
        <div className="flex items-center gap-1.5 flex-wrap text-xs">
          <span className="font-bold text-slate-500 dark:text-slate-400 mr-1 flex items-center gap-1">
            <Filter className="w-3.5 h-3.5 text-orange-500" /> Filter:
          </span>
          {(["daily", "weekly", "monthly", "quarterly", "yearly", "custom"] as ReportPeriod[]).map(
            (p) => (
              <button
                key={p}
                type="button"
                onClick={() => onFilterChange({ period: p })}
                className={`px-3 py-1 rounded-xl font-extrabold uppercase tracking-wider text-[10px] transition-all ${
                  filters.period === p
                    ? "bg-[#F97316] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                {p}
              </button>
            )
          )}
        </div>

        {/* Right: Quick Export Buttons */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={isExporting}
            onClick={() => onExport("pdf")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 hover:bg-orange-100 transition-colors border border-orange-200 dark:border-orange-900/50"
          >
            <FileText className="w-3.5 h-3.5" /> PDF
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={() => onExport("excel")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 transition-colors border border-emerald-200 dark:border-emerald-900/50"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" /> Excel
          </button>
          <button
            type="button"
            disabled={isExporting}
            onClick={() => onExport("csv")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </div>

      {/* Secondary Custom Date Range Controls */}
      {filters.period === "custom" && (
        <div className="flex items-center gap-3 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">From:</span>
            <input
              type="date"
              value={filters.startDate || ""}
              onChange={(e) => onFilterChange({ startDate: e.target.value || undefined })}
              className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-500">To:</span>
            <input
              type="date"
              value={filters.endDate || ""}
              onChange={(e) => onFilterChange({ endDate: e.target.value || undefined })}
              className="text-xs rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-1 focus:outline-none"
            />
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="flex items-center gap-1 text-xs font-bold text-rose-500 hover:underline ml-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Reset
            </button>
          )}
        </div>
      )}
    </div>
  );
};
