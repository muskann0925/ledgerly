import React from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./select";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

export interface PaginationProps {
  pagination?: PaginationMeta;
  meta?: PaginationMeta;
  onPageChange: (page: number) => void;
  onLimitChange?: (limit: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  pagination,
  meta,
  onPageChange,
  onLimitChange,
}) => {
  const metaData = pagination || meta;
  if (!metaData) return null;

  const { page, limit, total, totalPages } = metaData;
  const hasNextPage = metaData.hasNextPage ?? page < totalPages;
  const hasPrevPage = metaData.hasPrevPage ?? page > 1;

  const startRecord = total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, total);

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200/80 dark:border-slate-800/80 text-xs select-none">
      {/* Left: Record Range */}
      <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400 font-medium">
        <span>
          Showing {startRecord}–{endRecord} of {total}
        </span>

        {onLimitChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="hidden md:inline text-[11px]">Per page:</span>
            <Select
              value={String(limit)}
              onValueChange={(val) => onLimitChange(Number(val))}
            >
              <SelectTrigger className="h-7 w-[65px] text-xs font-semibold rounded-lg bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10</SelectItem>
                <SelectItem value="25">25</SelectItem>
                <SelectItem value="50">50</SelectItem>
                <SelectItem value="100">100</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Right: Icon Buttons & Page Counter */}
      <div className="flex items-center gap-1.5">
        {/* First Page Button << */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={page <= 1}
          className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs"
          title="First Page"
        >
          <ChevronsLeft className="w-4 h-4" />
        </button>

        {/* Previous Page Button < */}
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={!hasPrevPage}
          className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs"
          title="Previous Page"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Page Counter */}
        <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-2">
          Page {page} of {totalPages || 1}
        </span>

        {/* Next Page Button > */}
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={!hasNextPage}
          className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs"
          title="Next Page"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Last Page Button >> */}
        <button
          type="button"
          onClick={() => onPageChange(totalPages)}
          disabled={page >= totalPages || totalPages === 0}
          className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs"
          title="Last Page"
        >
          <ChevronsRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
