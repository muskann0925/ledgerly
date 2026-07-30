import React from "react";
import type { Payment } from "../types/payment.types";
import { PaymentMethodBadge } from "./PaymentMethodBadge";
import { PaymentActions } from "./PaymentActions";
import { TableCell, TableRow } from "../../../components/ui/table";
import { Badge } from "../../../components/ui/badge";
import { XCircle } from "lucide-react";

interface PaymentRowProps {
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

export const PaymentRow: React.FC<PaymentRowProps> = ({
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
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  const formatCurrency = (val: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const renderStatusBadge = () => {
    if (payment.isDeleted) {
      return (
        <Badge
          variant="outline"
          className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <XCircle className="w-3 h-3" />
          Deleted
        </Badge>
      );
    }

    const status = payment.status || "SUCCESS";
    switch (status) {
      case "SUCCESS":
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50 font-semibold py-0.5 px-2 text-[11px]"
          >
            Paid
          </Badge>
        );
      case "PENDING":
        return (
          <Badge
            variant="outline"
            className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50 font-semibold py-0.5 px-2 text-[11px]"
          >
            Pending
          </Badge>
        );
      case "FAILED":
        return (
          <Badge
            variant="outline"
            className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50 font-semibold py-0.5 px-2 text-[11px]"
          >
            Failed
          </Badge>
        );
      case "REFUNDED":
        return (
          <Badge
            variant="outline"
            className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50 font-semibold py-0.5 px-2 text-[11px]"
          >
            Refunded
          </Badge>
        );
      default:
        return (
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50 font-semibold py-0.5 px-2 text-[11px]"
          >
            Paid
          </Badge>
        );
    }
  };

  return (
    <TableRow className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 transition-colors group">
      {/* Payment Date */}
      <TableCell className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
        {formatDate(payment.paymentDate)}
      </TableCell>

      {/* Invoice Number */}
      <TableCell className="font-semibold py-3.5 px-4 text-xs">
        <span
          onClick={() => onView(payment)}
          className="font-bold tracking-tight text-slate-900 dark:text-slate-100 hover:text-[#F97316] dark:hover:text-[#F97316] cursor-pointer transition-colors"
        >
          {payment.invoice?.number || "N/A"}
        </span>
      </TableCell>

      {/* Client Info */}
      <TableCell className="py-3.5 px-4 text-xs">
        <span className="font-semibold text-slate-900 dark:text-slate-100">
          {payment.invoice?.client?.companyName || "Unknown Client"}
        </span>
      </TableCell>

      {/* Amount */}
      <TableCell className="py-3.5 px-4 text-xs font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
        {formatCurrency(payment.amount, payment.invoice?.currency)}
      </TableCell>

      {/* Payment Method */}
      <TableCell className="py-3.5 px-4 text-xs whitespace-nowrap">
        <PaymentMethodBadge method={payment.paymentMethod} />
      </TableCell>

      {/* Reference Number */}
      <TableCell className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
        {payment.referenceNumber ? (
          <span className="font-mono text-[11px]">{payment.referenceNumber}</span>
        ) : (
          <span className="text-slate-400 dark:text-slate-500 italic text-[11px]">-</span>
        )}
      </TableCell>

      {/* Status */}
      <TableCell className="py-3.5 px-4 text-xs whitespace-nowrap">
        {renderStatusBadge()}
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3.5 px-4 text-xs text-right whitespace-nowrap">
        <PaymentActions
          payment={payment}
          onView={onView}
          onDelete={onDelete}
          onRestore={onRestore}
          onRetryPayment={onRetryPayment}
          onRefreshStatus={onRefreshStatus}
          onDownloadReceipt={onDownloadReceipt}
          onPreviewReceipt={onPreviewReceipt}
          onPrintReceipt={onPrintReceipt}
          onEmailReceipt={onEmailReceipt}
        />
      </TableCell>
    </TableRow>
  );
};
