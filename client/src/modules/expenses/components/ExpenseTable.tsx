import React from "react";
import {
  Eye,
  Edit2,
  Trash2,
  RotateCcw,
  Paperclip,
  CheckCircle,
  XCircle,
  ArrowUpDown,
  MoreVertical,
  Clock,
} from "lucide-react";
import type { Expense, PaginationMeta, ExpenseQueryFilters } from "../types/expense.types";
import { PaginationComponent } from "./PaginationComponent";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "../../../components/ui/dropdown-menu";

interface ExpenseTableProps {
  expenses: Expense[];
  meta?: PaginationMeta;
  isLoading?: boolean;
  filters: ExpenseQueryFilters;
  onFilterChange: (updated: Partial<ExpenseQueryFilters>) => void;
  onViewDetails: (expense: Expense) => void;
  onEditExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onRestoreExpense: (id: string) => void;
  onStatusChange: (id: string, status: "PAID" | "CANCELLED" | "PENDING") => void;
  selectedIds: string[];
  onSelectToggle: (id: string) => void;
  onSelectAllToggle: (allIds: string[]) => void;
  userRole?: string;
}

export const ExpenseTable: React.FC<ExpenseTableProps> = ({
  expenses,
  meta,
  isLoading,
  filters,
  onFilterChange,
  onViewDetails,
  onEditExpense,
  onDeleteExpense,
  onRestoreExpense,
  onStatusChange,
  selectedIds,
  onSelectToggle,
  onSelectAllToggle,
  userRole,
}) => {
  const canEdit = userRole === "OWNER" || userRole === "ADMIN" || userRole === "FINANCE";
  const canDelete = userRole === "OWNER" || userRole === "ADMIN";

  const allPageIds = expenses.map((e) => e.id);
  const isAllSelected = allPageIds.length > 0 && allPageIds.every((id) => selectedIds.includes(id));

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);

  const handleSort = (field: "expenseDate" | "totalAmount" | "title" | "createdAt") => {
    if (filters.sortBy === field) {
      onFilterChange({
        sortOrder: filters.sortOrder === "asc" ? "desc" : "asc",
        page: 1,
      });
    } else {
      onFilterChange({
        sortBy: field,
        sortOrder: "desc",
        page: 1,
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PAID":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400">
            <CheckCircle className="w-3 h-3" />
            Paid
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400">
            <XCircle className="w-3 h-3" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400">
            <Clock className="w-3 h-3" />
            Pending
          </span>
        );
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 space-y-4 shadow-xs">
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="h-12 w-full bg-slate-100 dark:bg-slate-800/50 animate-pulse rounded-xl"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xs overflow-hidden flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/50 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none">
              <th className="p-4 w-10">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={() => onSelectAllToggle(allPageIds)}
                  className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                />
              </th>
              <th className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => handleSort("title")}>
                <div className="flex items-center gap-1">
                  <span>Expense & Number</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-4">Category & Vendor</th>
              <th className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors" onClick={() => handleSort("expenseDate")}>
                <div className="flex items-center gap-1">
                  <span>Date & Due</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-4 cursor-pointer hover:text-slate-900 dark:hover:text-white transition-colors text-right" onClick={() => handleSort("totalAmount")}>
                <div className="flex items-center justify-end gap-1">
                  <span>Amount & Tax</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="p-4">Method & Status</th>
              <th className="p-4 text-center">Receipt</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-12 text-center text-slate-400 dark:text-slate-500">
                  No expenses found matching your query or filters.
                </td>
              </tr>
            ) : (
              expenses.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors ${
                      item.isDeleted ? "opacity-60 bg-rose-50/30 dark:bg-rose-950/10" : ""
                    } ${isSelected ? "bg-orange-50/50 dark:bg-orange-950/20" : ""}`}
                  >
                    <td className="p-4">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onSelectToggle(item.id)}
                        className="rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                      />
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                        {item.title}
                        {item.isDeleted && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-bold">
                            Deleted
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 font-mono mt-0.5">
                        {item.expenseNumber} {item.referenceNumber ? `• Ref: ${item.referenceNumber}` : ""}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: item.category?.color || "#4F46E5" }}
                        />
                        <span className="font-semibold text-slate-800 dark:text-slate-200">
                          {item.category?.name || "Uncategorized"}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                        {item.vendor?.name || "Direct Expense"}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="font-medium text-slate-700 dark:text-slate-300">
                        {new Date(item.expenseDate).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </div>
                      {item.dueDate && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">
                          Due: {new Date(item.dueDate).toLocaleDateString("en-IN", { month: "short", day: "numeric" })}
                        </div>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <div className="font-extrabold text-slate-900 dark:text-white">
                        {formatCurrency(item.totalAmount)}
                      </div>
                      <div className="text-[11px] text-slate-400 dark:text-slate-500">
                        {item.taxRate > 0
                          ? `Tax (${item.taxRate}% ${item.isTaxInclusive ? "Inc" : "Exc"}): ${formatCurrency(item.taxAmount)}`
                          : "No Tax"}
                      </div>
                    </td>

                    <td className="p-4">
                      <div className="flex flex-col gap-1 items-start">
                        {getStatusBadge(item.status)}
                        <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                          {item.paymentMethod.replace("_", " ")}
                        </span>
                      </div>
                    </td>

                    <td className="p-4 text-center">
                      {item.receiptUrl ? (
                        <a
                          href={item.receiptUrl}
                          target="_blank"
                          rel="noreferrer"
                          title={item.receiptOriginalName || "View Receipt"}
                          className="inline-flex items-center justify-center p-1.5 rounded-lg bg-orange-50 text-orange-600 dark:bg-orange-950/40 dark:text-orange-400 hover:bg-orange-100 transition-colors"
                        >
                          <Paperclip className="w-4 h-4" />
                        </a>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700">—</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            type="button"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>
                        </DropdownMenuTrigger>

                        <DropdownMenuContent align="end" className="w-44 font-sans">
                          <DropdownMenuItem onClick={() => onViewDetails(item)}>
                            <Eye className="w-3.5 h-3.5 mr-2" />
                            View Details
                          </DropdownMenuItem>

                          {canEdit && !item.isDeleted && (
                            <DropdownMenuItem onClick={() => onEditExpense(item)}>
                              <Edit2 className="w-3.5 h-3.5 mr-2" />
                              Edit Expense
                            </DropdownMenuItem>
                          )}

                          {canEdit && !item.isDeleted && item.status !== "PAID" && (
                            <DropdownMenuItem
                              onClick={() => onStatusChange(item.id, "PAID")}
                              className="text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 dark:focus:text-emerald-400"
                            >
                              <CheckCircle className="w-3.5 h-3.5 mr-2" />
                              Mark as Paid
                            </DropdownMenuItem>
                          )}

                          {canDelete && !item.isDeleted && (
                            <DropdownMenuItem
                              onClick={() => onDeleteExpense(item.id)}
                              className="text-rose-600 dark:text-rose-400 focus:text-rose-600 dark:focus:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5 mr-2" />
                              Delete Expense
                            </DropdownMenuItem>
                          )}

                          {canDelete && item.isDeleted && (
                            <DropdownMenuItem
                              onClick={() => onRestoreExpense(item.id)}
                              className="text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 dark:focus:text-emerald-400"
                            >
                              <RotateCcw className="w-3.5 h-3.5 mr-2" />
                              Restore Expense
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Component Footer */}
      {meta && (
        <PaginationComponent
          meta={meta}
          onPageChange={(newPage) => onFilterChange({ page: newPage })}
        />
      )}
    </div>
  );
};
