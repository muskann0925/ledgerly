import React from "react";
import { useQuotationDetailsQuery } from "../hooks/useQuotations";
import { QuotationStatusBadge } from "./QuotationStatusBadge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Separator } from "../../../components/ui/separator";
import {
  Building2,
  Calendar,
  Clock,
  Download,
  Edit,
  FileCheck,
  Loader2,
  UserCheck,
  XCircle,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import type { Quotation } from "../types/quotation.types";
import { useNavigate } from "react-router-dom";

interface QuotationDetailsDialogProps {
  quotationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (quotation: Quotation) => void;
  onDownloadPdf?: (quotation: Quotation) => void;
  onPreview?: (quotation: Quotation) => void;
  onPrint?: (quotation: Quotation) => void;
  onEmail?: (quotation: Quotation) => void;
  onConvert?: (quotation: Quotation) => void;
}

export const QuotationDetailsDialog: React.FC<QuotationDetailsDialogProps> = ({
  quotationId,
  isOpen,
  onClose,
  onEdit,
  onDownloadPdf,
  onPreview,
  onPrint,
  onEmail,
  onConvert,
}) => {
  const { data: quotation, isLoading, isError, error } = useQuotationDetailsQuery(quotationId);
  const navigate = useNavigate();

  const formatDate = (dateStr?: string | null) => {
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
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden select-none">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3 p-6">
            <Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading proposal details...</p>
          </div>
        ) : isError || !quotation ? (
          <div className="p-6 text-center text-rose-500 text-xs">
            {error instanceof Error ? error.message : "Quotation proposal not found."}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Header Title & Actions */}
            <DialogHeader className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white font-mono">
                      {quotation.quotationNumber}
                    </DialogTitle>
                    <QuotationStatusBadge status={quotation.status} />
                  </div>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Issued: {formatDate(quotation.issueDate)} · Valid Until: {formatDate(quotation.expiryDate)}
                  </DialogDescription>
                </div>

                <div className="flex items-center gap-2 shrink-0 flex-wrap">
                  {onDownloadPdf && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDownloadPdf(quotation)}
                      className="rounded-xl text-xs font-semibold px-3 h-9"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      PDF
                    </Button>
                  )}
                  {onPreview && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPreview(quotation)}
                      className="rounded-xl text-xs font-semibold px-3 h-9"
                    >
                      Preview
                    </Button>
                  )}
                  {onPrint && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPrint(quotation)}
                      className="rounded-xl text-xs font-semibold px-3 h-9"
                    >
                      Print
                    </Button>
                  )}
                  {onEmail && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEmail(quotation)}
                      className="rounded-xl text-xs font-semibold px-3 h-9"
                    >
                      Email
                    </Button>
                  )}

                  {!quotation.isDeleted && quotation.status !== "CONVERTED" && onEdit && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        onClose();
                        onEdit(quotation);
                      }}
                      className="rounded-xl text-xs font-semibold px-3 h-9"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                  )}

                  {!quotation.isDeleted && quotation.status !== "CONVERTED" && onConvert && (
                    <Button
                      size="sm"
                      onClick={() => {
                        onClose();
                        onConvert(quotation);
                      }}
                      className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold px-3 h-9 shadow-xs"
                    >
                      <FileCheck className="w-3.5 h-3.5 mr-1" />
                      Convert to Invoice
                    </Button>
                  )}
                </div>
              </div>
            </DialogHeader>

            <Separator className="bg-slate-100 dark:bg-slate-800" />

            {/* Client Profile Card & Dates Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Client Info */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <span className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px] block">
                  Client Profile
                </span>
                <p className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-1.5">
                  <Building2 className="w-4 h-4 text-[#F97316]" />
                  {quotation.client?.companyName}
                </p>
                <div className="space-y-0.5 text-slate-600 dark:text-slate-400 text-[11px]">
                  <p>Contact: {quotation.client?.contactPerson}</p>
                  <p>Email: {quotation.client?.email}</p>
                  <p>Phone: {quotation.client?.phone}</p>
                  {quotation.client?.gstNumber && <p>GSTIN: {quotation.client.gstNumber}</p>}
                </div>
              </div>

              {/* Proposal Metadata */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
                <span className="font-extrabold uppercase tracking-wider text-slate-400 text-[10px] block">
                  Proposal Overview
                </span>
                <div className="grid grid-cols-2 gap-2 text-[11px]">
                  <div>
                    <span className="text-slate-500 block">Issue Date:</span>
                    <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      {formatDate(quotation.issueDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Valid Until:</span>
                    <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-500" />
                      {formatDate(quotation.expiryDate)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Currency:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {quotation.currency}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Created By:</span>
                    <span className="font-semibold text-slate-900 dark:text-white flex items-center gap-1">
                      <UserCheck className="w-3 h-3 text-slate-400" />
                      {quotation.createdBy || "System User"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Approval / Rejection Metadata Callout */}
            {quotation.status === "APPROVED" && (
              <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span className="font-semibold">Approved by {quotation.approvedBy || "Client"}</span>
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono">
                  {formatDate(quotation.approvedAt)}
                </span>
              </div>
            )}

            {quotation.status === "REJECTED" && (
              <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/50 space-y-1 text-xs text-rose-800 dark:text-rose-300">
                <div className="flex items-center justify-between font-semibold">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-4 h-4 text-rose-500" />
                    <span>Proposal Rejected</span>
                  </div>
                  <span className="text-[11px] font-mono">{formatDate(quotation.rejectedAt)}</span>
                </div>
                {quotation.rejectionReason && (
                  <p className="text-[11px] text-rose-600 dark:text-rose-400 pl-6">
                    Reason: {quotation.rejectionReason}
                  </p>
                )}
              </div>
            )}

            {/* Converted Invoice Card */}
            {quotation.status === "CONVERTED" && (
              <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileCheck className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                  <div>
                    <span className="font-extrabold text-purple-900 dark:text-purple-200 block">
                      Converted to Active Invoice
                    </span>
                    <span className="text-[11px] text-purple-700 dark:text-purple-300">
                      Invoice ID: {quotation.convertedInvoiceId}
                    </span>
                  </div>
                </div>
                <Button
                  size="sm"
                  onClick={() => {
                    onClose();
                    navigate("/invoices");
                  }}
                  className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold px-4"
                >
                  Go to Invoices
                  <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </div>
            )}

            {/* Line Items Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden text-xs">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-900 text-slate-500 dark:text-slate-400 text-[11px] uppercase tracking-wider font-extrabold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-3 px-4">Description</th>
                    <th className="py-3 px-4 text-right">Qty</th>
                    <th className="py-3 px-4 text-right">Rate</th>
                    <th className="py-3 px-4 text-right">Tax</th>
                    <th className="py-3 px-4 text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {quotation.items?.map((item, idx) => (
                    <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/40">
                      <td className="py-3 px-4 font-medium text-slate-900 dark:text-white">
                        {item.description}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                        {item.quantity}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-600 dark:text-slate-300">
                        {formatCurrency(item.unitPrice, quotation.currency)}
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-slate-500">
                        {item.taxRate}%
                      </td>
                      <td className="py-3 px-4 text-right font-black text-slate-900 dark:text-white font-mono">
                        {formatCurrency(item.total, quotation.currency)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals Summary */}
            <div className="flex justify-end">
              <div className="w-full max-w-xs space-y-2 text-xs p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(quotation.subtotal, quotation.currency)}
                  </span>
                </div>
                {quotation.discount > 0 && (
                  <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                    <span>Discount:</span>
                    <span className="font-semibold">-{formatCurrency(quotation.discount, quotation.currency)}</span>
                  </div>
                )}
                {quotation.tax > 0 && (
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>GST / Tax:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(quotation.tax, quotation.currency)}
                    </span>
                  </div>
                )}
                <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center font-bold">
                  <span className="text-slate-900 dark:text-white">Grand Total:</span>
                  <span className="text-lg font-black text-[#F97316]">
                    {formatCurrency(quotation.total, quotation.currency)}
                  </span>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(quotation.notes || quotation.terms) && (
              <div className="space-y-3 pt-2 text-xs">
                {quotation.notes && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Scope Notes:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                      {quotation.notes}
                    </p>
                  </div>
                )}

                {quotation.terms && (
                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Terms & Conditions:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                      {quotation.terms}
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="flex items-center justify-end pt-3 border-t border-slate-200 dark:border-slate-800">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="rounded-xl text-xs font-semibold px-5"
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
