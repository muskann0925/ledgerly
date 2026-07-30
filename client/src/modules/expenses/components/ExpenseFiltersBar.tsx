import React from "react";
import {
  Search,
  X,
  Download,
  Trash2,
  RotateCcw,
} from "lucide-react";
import type {
  ExpenseQueryFilters,
  ExpenseCategory,
  Vendor,
} from "../types/expense.types";

interface ExpenseFiltersBarProps {
  filters: ExpenseQueryFilters;
  categories: ExpenseCategory[];
  vendors: Vendor[];
  onFilterChange: (updated: Partial<ExpenseQueryFilters>) => void;
  onResetFilters: () => void;
  selectedCount?: number;
  onBulkDelete?: () => void;
  onBulkRestore?: () => void;
  onExportCsv?: () => void;
  userRole?: string;
}

export const ExpenseFiltersBar: React.FC<ExpenseFiltersBarProps> = ({
  filters,
  categories,
  vendors,
  onFilterChange,
  onResetFilters,
  selectedCount = 0,
  onBulkDelete,
  onBulkRestore,
  onExportCsv,
  userRole,
}) => {
  const isOwnerOrAdmin = userRole === "OWNER" || userRole === "ADMIN";

  const hasActiveFilters = Boolean(
    filters.search ||
      filters.categoryId ||
      filters.vendorId ||
      filters.status ||
      filters.paymentMethod ||
      filters.startDate ||
      filters.endDate ||
      filters.minAmount ||
      filters.maxAmount ||
      filters.includeDeleted
  );

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-3 sm:p-3.5 mb-4 shadow-xs flex items-center gap-2.5 overflow-x-auto scrollbar-none w-full select-none">
      {/* Search Input */}
      <div className="relative w-64 sm:w-72 shrink-0">
        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search title, number, notes..."
          value={filters.search || ""}
          onChange={(e) => onFilterChange({ search: e.target.value, page: 1 })}
          className="w-full pl-9 pr-8 h-9 text-xs rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        />
        {filters.search && (
          <button
            onClick={() => onFilterChange({ search: "", page: 1 })}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Category Select */}
      <select
        value={filters.categoryId || ""}
        onChange={(e) => onFilterChange({ categoryId: e.target.value || undefined, page: 1 })}
        className="w-36 h-9 text-xs font-semibold rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shrink-0"
      >
        <option value="">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>
            {c.name}
          </option>
        ))}
      </select>

      {/* Vendor Select */}
      <select
        value={filters.vendorId || ""}
        onChange={(e) => onFilterChange({ vendorId: e.target.value || undefined, page: 1 })}
        className="w-36 h-9 text-xs font-semibold rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shrink-0"
      >
        <option value="">All Vendors</option>
        {vendors.map((v) => (
          <option key={v.id} value={v.id}>
            {v.name}
          </option>
        ))}
      </select>

      {/* Status Select */}
      <select
        value={filters.status || ""}
        onChange={(e) =>
          onFilterChange({
            status: (e.target.value as any) || undefined,
            page: 1,
          })
        }
        className="w-32 h-9 text-xs font-semibold rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shrink-0"
      >
        <option value="">All Statuses</option>
        <option value="PENDING">Pending</option>
        <option value="PAID">Paid</option>
        <option value="CANCELLED">Cancelled</option>
      </select>

      {/* Payment Method Select */}
      <select
        value={filters.paymentMethod || ""}
        onChange={(e) =>
          onFilterChange({
            paymentMethod: (e.target.value as any) || undefined,
            page: 1,
          })
        }
        className="w-36 h-9 text-xs font-semibold rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shrink-0"
      >
        <option value="">All Methods</option>
        <option value="CASH">Cash</option>
        <option value="UPI">UPI</option>
        <option value="BANK_TRANSFER">Bank Transfer</option>
        <option value="CREDIT_CARD">Credit Card</option>
        <option value="DEBIT_CARD">Debit Card</option>
        <option value="CHEQUE">Cheque</option>
        <option value="OTHER">Other</option>
      </select>

      {/* Start Date */}
      <input
        type="date"
        value={filters.startDate || ""}
        onChange={(e) => onFilterChange({ startDate: e.target.value || undefined, page: 1 })}
        className="w-32 h-9 text-xs rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shrink-0"
      />

      {/* End Date */}
      <input
        type="date"
        value={filters.endDate || ""}
        onChange={(e) => onFilterChange({ endDate: e.target.value || undefined, page: 1 })}
        className="w-32 h-9 text-xs rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3 focus:outline-none focus:ring-2 focus:ring-orange-500/50 shrink-0"
      />

      {/* Bulk Actions / Export / Reset Buttons */}
      {selectedCount > 0 && isOwnerOrAdmin && (
        <>
          <button
            type="button"
            onClick={onBulkDelete}
            className="flex items-center gap-1 px-3 h-9 text-xs font-semibold rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900/50 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Delete ({selectedCount})
          </button>
          <button
            type="button"
            onClick={onBulkRestore}
            className="flex items-center gap-1 px-3 h-9 text-xs font-semibold rounded-xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 shrink-0"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore ({selectedCount})
          </button>
        </>
      )}

      {onExportCsv && (
        <button
          type="button"
          onClick={onExportCsv}
          className="flex items-center gap-1 px-3 h-9 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 shrink-0 bg-white dark:bg-[#111827]"
        >
          <Download className="w-3.5 h-3.5 text-[#F97316]" />
          CSV
        </button>
      )}

      {hasActiveFilters && (
        <button
          type="button"
          onClick={onResetFilters}
          className="flex items-center gap-1 px-2.5 h-9 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl shrink-0"
        >
          <X className="w-3.5 h-3.5" />
          Reset
        </button>
      )}
    </div>
  );
};
