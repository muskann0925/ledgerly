import React from "react";
import type { Payment } from "../types/payment.types";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";
import {
  MoreHorizontal,
  Eye,
  Download,
  Printer,
  Mail,
  Trash2,
  RotateCcw,
  RefreshCw,
} from "lucide-react";

interface PaymentActionsProps {
  payment: Payment;
  onView: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
  onRestore: (payment: Payment) => void;
  onRetryPayment?: (payment: Payment) => void;
  onRefreshStatus?: (payment: Payment) => void;
  onDownloadReceipt?: (payment: Payment) => void;
  onPreviewReceipt?: (payment: Payment) => void;
  onPrintReceipt?: (payment: Payment) => void;
  onEmailReceipt?: (payment: Payment) => void;
}

export const PaymentActions: React.FC<PaymentActionsProps> = ({
  payment,
  onView,
  onDelete,
  onRestore,
  onRetryPayment,
  onRefreshStatus,
  onDownloadReceipt,
  onPreviewReceipt,
  onPrintReceipt,
  onEmailReceipt,
}) => {
  const isSuccess = (payment.status || "SUCCESS") === "SUCCESS";
  const isFailed = payment.status === "FAILED";
  const isPending = payment.status === "PENDING";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <span className="sr-only">Open menu</span>
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-48 bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 rounded-xl p-1.5 shadow-xl select-none"
      >
        <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-2 py-1">
          Actions
        </DropdownMenuLabel>

        {/* View Details */}
        <DropdownMenuItem
          onClick={() => onView(payment)}
          className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
        >
          <Eye className="w-3.5 h-3.5 mr-2 text-slate-400" />
          View Details
        </DropdownMenuItem>

        {/* Retry Payment (if FAILED) */}
        {isFailed && onRetryPayment && (
          <DropdownMenuItem
            onClick={() => onRetryPayment(payment)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/40 font-semibold"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-2 text-rose-500" />
            Retry Payment
          </DropdownMenuItem>
        )}

        {/* Refresh Status (if PENDING) */}
        {isPending && onRefreshStatus && (
          <DropdownMenuItem
            onClick={() => onRefreshStatus(payment)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-amber-600 dark:text-amber-400 focus:bg-amber-50 dark:focus:bg-amber-950/40 font-semibold"
          >
            <RefreshCw className="w-3.5 h-3.5 mr-2 text-amber-500" />
            Refresh Status
          </DropdownMenuItem>
        )}

        {/* Download Receipt PDF (if PAID/SUCCESS) */}
        {isSuccess && onDownloadReceipt && (
          <DropdownMenuItem
            onClick={() => onDownloadReceipt(payment)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
          >
            <Download className="w-3.5 h-3.5 mr-2 text-slate-400" />
            Download Receipt PDF
          </DropdownMenuItem>
        )}

        {/* Preview Receipt (if PAID/SUCCESS) */}
        {isSuccess && onPreviewReceipt && (
          <DropdownMenuItem
            onClick={() => onPreviewReceipt(payment)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
          >
            <Eye className="w-3.5 h-3.5 mr-2 text-slate-400" />
            Preview Receipt
          </DropdownMenuItem>
        )}

        {/* Print Receipt (if PAID/SUCCESS) */}
        {isSuccess && onPrintReceipt && (
          <DropdownMenuItem
            onClick={() => onPrintReceipt(payment)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
          >
            <Printer className="w-3.5 h-3.5 mr-2 text-slate-400" />
            Print Receipt
          </DropdownMenuItem>
        )}

        {/* Email Receipt (if PAID/SUCCESS) */}
        {isSuccess && onEmailReceipt && (
          <DropdownMenuItem
            onClick={() => onEmailReceipt(payment)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
          >
            <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
            Email Receipt
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

        {/* Delete / Restore */}
        {payment.isDeleted ? (
          <DropdownMenuItem
            onClick={() => onRestore(payment)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-emerald-600 dark:text-emerald-400 focus:bg-emerald-50 dark:focus:bg-emerald-950/40 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-2" />
            Restore Payment
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onDelete(payment)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/40 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            Delete Record
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

