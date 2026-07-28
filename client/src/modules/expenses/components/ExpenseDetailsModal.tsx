import React from "react";
import {
  X,
  FileText,
  Download,
  Trash2,
  Edit2,
  Paperclip,
  Building2,
  Tag,
  Calendar,
  History,
} from "lucide-react";
import type { Expense } from "../types/expense.types";
import { expenseApi } from "../api/expenseApi";

interface ExpenseDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense: Expense | null;
  onEdit?: (expense: Expense) => void;
  onDelete?: (id: string) => void;
  onStatusChange?: (id: string, status: "PAID" | "CANCELLED" | "PENDING") => void;
  userRole?: string;
}

export const ExpenseDetailsModal: React.FC<ExpenseDetailsModalProps> = ({
  isOpen,
  onClose,
  expense,
  onEdit,
  onDelete,
  onStatusChange,
  userRole,
}) => {
  if (!isOpen || !expense) return null;

  const handleDownloadReceipt = async () => {
    try {
      const blob = await expenseApi.downloadReceipt(expense.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = expense.receiptOriginalName || `receipt-${expense.expenseNumber}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error("Failed to download receipt:", err);
    }
  };

  const canEdit = userRole === "OWNER" || userRole === "ADMIN" || userRole === "FINANCE";
  const canDelete = userRole === "OWNER" || userRole === "ADMIN";

  const formatCurrency = (val: number = 0) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded-md">
                {expense.expenseNumber}
              </span>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white">
                {expense.title}
              </h2>
            </div>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Logged on {new Date(expense.createdAt).toLocaleString("en-IN")}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Key Overview Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                Total Amount
              </span>
              <span className="text-lg font-extrabold text-slate-900 dark:text-white mt-0.5 block">
                {formatCurrency(expense.totalAmount)}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                Status
              </span>
              <span className="text-xs font-bold mt-1 block">
                {expense.status === "PAID" ? (
                  <span className="text-emerald-600 dark:text-emerald-400">Paid</span>
                ) : expense.status === "CANCELLED" ? (
                  <span className="text-rose-600 dark:text-rose-400">Cancelled</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">Pending</span>
                )}
              </span>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 p-3 rounded-2xl border border-slate-200/60 dark:border-slate-800/60 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                Payment Method
              </span>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-1 block uppercase">
                {expense.paymentMethod.replace("_", " ")}
              </span>
            </div>
          </div>

          {/* Details breakdown */}
          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" /> Category:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {expense.category?.name || "Uncategorized"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5" /> Vendor / Supplier:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {expense.vendor?.name || "Direct Expense"}
              </span>
            </div>

            <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
              <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Expense Date:
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {new Date(expense.expenseDate).toLocaleDateString("en-IN", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>

            {expense.dueDate && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Due Date:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {new Date(expense.dueDate).toLocaleDateString("en-IN", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
              </div>
            )}

            {expense.referenceNumber && (
              <div className="flex items-center justify-between py-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500 dark:text-slate-400">Bill / Ref Number:</span>
                <span className="font-mono font-semibold text-slate-900 dark:text-white">
                  {expense.referenceNumber}
                </span>
              </div>
            )}
          </div>

          {/* Tax Computation Breakdown */}
          <div className="bg-slate-50 dark:bg-slate-900/60 rounded-2xl p-4 border border-slate-200/80 dark:border-slate-800/80 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white">Tax Breakdown</h4>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>Base Expense Amount:</span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(expense.amount)}
              </span>
            </div>
            <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400">
              <span>
                Tax Rate ({expense.taxRate}% {expense.isTaxInclusive ? "Inclusive" : "Exclusive"}):
              </span>
              <span className="font-semibold text-slate-900 dark:text-white">
                {formatCurrency(expense.taxAmount)}
              </span>
            </div>
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between text-xs font-extrabold text-slate-900 dark:text-white">
              <span>Grand Total Amount:</span>
              <span className="text-orange-600 dark:text-orange-400">
                {formatCurrency(expense.totalAmount)}
              </span>
            </div>
          </div>

          {/* Receipt Attachment Section */}
          {expense.receiptUrl && (
            <div className="bg-orange-50/50 dark:bg-orange-950/20 p-4 rounded-2xl border border-orange-200/60 dark:border-orange-900/40">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <Paperclip className="w-4 h-4 text-orange-500" />
                  Attached Receipt
                </span>
                <button
                  type="button"
                  onClick={handleDownloadReceipt}
                  className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>

              {expense.receiptMimeType?.startsWith("image") || expense.receiptUrl.match(/\.(jpeg|jpg|png|webp)/i) ? (
                <img
                  src={expense.receiptUrl.startsWith("http") ? expense.receiptUrl : `/api${expense.receiptUrl}`}
                  alt="Receipt"
                  className="max-h-48 rounded-xl object-contain mx-auto border border-slate-200 dark:border-slate-800"
                />
              ) : (
                <div className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                  <FileText className="w-5 h-5 text-orange-500" />
                  <span>{expense.receiptOriginalName || "Document Receipt"}</span>
                </div>
              )}
            </div>
          )}

          {/* Audit Logs Timeline */}
          {expense.auditLogs && expense.auditLogs.length > 0 && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <History className="w-4 h-4 text-slate-400" />
                Audit Trail & History
              </h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {expense.auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="text-[11px] bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60"
                  >
                    <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                      <span className="font-bold text-slate-800 dark:text-slate-200">
                        {log.action}
                      </span>
                      <span>{new Date(log.createdAt).toLocaleString("en-IN")}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 mt-0.5">{log.details}</p>
                    <div className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5">
                      By: {log.performedBy || "System"} ({log.userRole || "ADMIN"})
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            {canEdit && onStatusChange && expense.status !== "PAID" && (
              <button
                type="button"
                onClick={() => onStatusChange(expense.id, "PAID")}
                className="px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 hover:bg-emerald-100 transition-colors"
              >
                Mark Paid
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {canEdit && onEdit && !expense.isDeleted && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onEdit(expense);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit
              </button>
            )}

            {canDelete && onDelete && !expense.isDeleted && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onDelete(expense.id);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100 transition-colors flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" /> Delete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
