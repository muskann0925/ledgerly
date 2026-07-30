import React from "react";
import { usePaymentDetailsQuery } from "../hooks/usePayments";
import { PaymentMethodBadge } from "./PaymentMethodBadge";
import { InvoiceStatusBadge } from "../../invoices/components/InvoiceStatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  // DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import { Badge } from "../../../components/ui/badge";
import {
  Building2,
  Calendar,
  CreditCard,
  Edit,
  Loader2,
  FileText,
  UserCheck,
  Clock,
  Hash,
  XCircle,
  // Download,
  // Printer,
  // Mail,
  // Eye,
} from "lucide-react";
import type { Payment } from "../types/payment.types";

interface PaymentDetailsDialogProps {
  paymentId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (payment: Payment) => void;
  onDownloadReceipt?: (payment: Payment) => void;
  onPreviewReceipt?: (payment: Payment) => void;
  onPrintReceipt?: (payment: Payment) => void;
  onEmailReceipt?: (payment: Payment) => void;
}

export const PaymentDetailsDialog: React.FC<PaymentDetailsDialogProps> = ({
  paymentId,
  isOpen,
  onClose,
  onEdit,
  // onDownloadReceipt,
  // onPreviewReceipt,
  // onPrintReceipt,
  // onEmailReceipt,
}) => {
  const { data: payment, isLoading, isError, error } = usePaymentDetailsQuery(paymentId);

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
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

  const formatCurrency = (val?: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3">
            <Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading payment transaction...</p>
          </div>
        ) : isError || !payment ? (
          <div className="p-6 text-center text-rose-500 text-xs">
            {error instanceof Error ? error.message : "Payment transaction not found."}
          </div>
        ) : (
          <div className="space-y-6 select-none">
            {/* Header */}
            <DialogHeader className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">
                      Payment Transaction
                    </DialogTitle>
                    {payment.isDeleted ? (
                      <Badge
                        variant="outline"
                        className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 font-semibold text-[11px]"
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Soft Deleted
                      </Badge>
                    ) : (payment.status || "SUCCESS") === "SUCCESS" ? (
                      <Badge
                        variant="outline"
                        className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50 font-semibold text-[11px]"
                      >
                        Paid
                      </Badge>
                    ) : payment.status === "PENDING" ? (
                      <Badge
                        variant="outline"
                        className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50 font-semibold text-[11px]"
                      >
                        Pending
                      </Badge>
                    ) : payment.status === "FAILED" ? (
                      <Badge
                        variant="outline"
                        className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50 font-semibold text-[11px]"
                      >
                        Failed
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50 font-semibold text-[11px]"
                      >
                        Refunded
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Toolbar Buttons */}
                {/*
                <div className="flex items-center gap-2 flex-wrap">
                  {onDownloadReceipt && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownloadReceipt(payment)}
                      className="rounded-xl text-xs font-semibold"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Receipt PDF
                    </Button>
                  )}
                  {onPreviewReceipt && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPreviewReceipt(payment)}
                      className="rounded-xl text-xs font-semibold"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Preview
                    </Button>
                  )}
                  {onPrintReceipt && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPrintReceipt(payment)}
                      className="rounded-xl text-xs font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      Print
                    </Button>
                  )}
                  {onEmailReceipt && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEmailReceipt(payment)}
                      className="rounded-xl text-xs font-semibold"
                    >
                      <Mail className="w-3.5 h-3.5 mr-1" />
                      Email
                    </Button>
                  )}
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Recorded on {formatDate(payment.paymentDate)} · ID: {payment.id}
                  </DialogDescription>
                </div> */}

                {!payment.isDeleted && onEdit && (
                  <Button
                    size="sm"
                    onClick={() => {
                      onClose();
                      onEdit(payment);
                    }}
                    className="bg-[#F97316] hover:bg-orange-600 rounded-xl text-xs font-semibold text-white shadow-xs shrink-0"
                  >
                    <Edit className="w-3.5 h-3.5 mr-1" />
                    Edit
                  </Button>
                )}
              </div>
            </DialogHeader>

            <Separator className="bg-slate-100 dark:bg-slate-800" />

            {/* Amount Banner */}
            <div className="p-4 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200/80 dark:border-emerald-900/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300 block">
                  Amount Received
                </span>
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(payment.amount, payment.invoice?.currency)}
                </span>
              </div>
              <PaymentMethodBadge method={payment.paymentMethod} />
            </div>

            {/* Transaction Details Grid */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs">
              <h4 className="font-extrabold uppercase tracking-wider text-[#F97316] text-[11px] flex items-center gap-1.5">
                <CreditCard className="w-4 h-4" />
                Transaction Metadata
              </h4>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Payment Date:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(payment.paymentDate)}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Reference / Cheque No.:
                  </span>
                  <span className="font-mono font-semibold text-slate-900 dark:text-white flex items-center gap-1 mt-0.5">
                    <Hash className="w-3.5 h-3.5 text-slate-400" />
                    {payment.referenceNumber || "N/A"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Recorded By:
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    {payment.createdBy || "System User"}
                  </span>
                </div>

                <div>
                  <span className="text-slate-500 dark:text-slate-400 block text-[11px]">
                    Created At:
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {formatDate(payment.createdAt)}
                  </span>
                </div>
              </div>
            </div>

            {/* Linked Invoice Summary */}
            {payment.invoice && (
              <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <h4 className="font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 text-[11px]">
                    <FileText className="w-4 h-4 text-[#F97316]" />
                    Linked Invoice ({payment.invoice.number})
                  </h4>
                  <InvoiceStatusBadge status={payment.invoice.status as any} />
                </div>

                <div className="space-y-1 text-slate-600 dark:text-slate-300">
                  <p className="flex items-center gap-1 font-semibold text-slate-900 dark:text-white">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" />
                    {payment.invoice.client?.companyName}
                  </p>
                  <p className="text-[11px] text-slate-500 pl-5">
                    Contact: {payment.invoice.client?.contactPerson} ({payment.invoice.client?.email})
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Invoice Total:</span>
                    <span className="font-bold text-slate-900 dark:text-white">
                      {formatCurrency(payment.invoice.total, payment.invoice.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Amount Paid:</span>
                    <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                      {formatCurrency(payment.invoice.amountPaid, payment.invoice.currency)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Balance Due:</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(payment.invoice.balanceDue, payment.invoice.currency)}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes & Remarks */}
            {payment.notes && (
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1">
                <span className="font-bold text-slate-800 dark:text-slate-200 block">
                  Remarks / Internal Notes:
                </span>
                <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                  {payment.notes}
                </p>
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-xl text-xs font-semibold px-4"
              >
                Close
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
