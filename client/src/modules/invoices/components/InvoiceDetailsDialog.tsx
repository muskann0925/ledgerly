import React from "react";
import { useInvoiceDetailsQuery } from "../hooks/useInvoices";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
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
  CreditCard,
  Download,
  Printer,
  Edit,
  Loader2,
  FileText,
  UserCheck,
  Clock,
  ShieldCheck,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import type { Invoice } from "../types/invoice.types";
import type { AppliedTaxSnapshot } from "../../../shared/utils/taxCalculator";

interface InvoiceDetailsDialogProps {
  invoiceId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (invoice: Invoice) => void;
  onDownloadPdf?: (invoice: Invoice) => void;
  onPreview?: (invoice: Invoice) => void;
  onPrint?: (invoice: Invoice) => void;
  onEmail?: (invoice: Invoice) => void;
  onMarkPaid?: (invoice: Invoice) => void;
  onMarkPartial?: (invoice: Invoice) => void;
  onChangeStatus?: (invoice: Invoice) => void;
}

export const InvoiceDetailsDialog: React.FC<InvoiceDetailsDialogProps> = ({
  invoiceId,
  isOpen,
  onClose,
  onEdit,
  onDownloadPdf,
  onPreview,
  onPrint,
  onEmail,
  onMarkPaid,
  onMarkPartial,
  onChangeStatus,
}) => {
  const { data: invoice, isLoading, isError, error } = useInvoiceDetailsQuery(invoiceId);

  const formatDate = (dateStr?: Date | string) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amt: number, curr: string = "INR") => {
    const symbol = curr === "INR" ? "₹" : `${curr} `;
    return `${symbol}${amt.toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden select-none">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 space-y-3 p-6">
            <Loader2 className="w-8 h-8 text-[#F97316] animate-spin" />
            <p className="text-xs text-slate-500 font-medium">Loading invoice details...</p>
          </div>
        ) : isError || !invoice ? (
          <div className="p-6 text-center text-rose-500 text-xs">
            {error instanceof Error ? error.message : "Invoice details not found."}
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 space-y-6 select-none">
            {/* Header & Quick Action Buttons */}
            <DialogHeader className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <DialogTitle className="text-2xl font-black text-slate-900 dark:text-white">
                      {invoice.number}
                    </DialogTitle>
                    <InvoiceStatusBadge status={invoice.status} isDeleted={invoice.isDeleted} />
                  </div>
                  <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
                    Created on {formatDate(invoice.createdAt)} · Updated on {formatDate(invoice.updatedAt)}
                  </DialogDescription>
                </div>

                {/* Toolbar Buttons */}
                <div className="flex items-center gap-2 flex-wrap">
                  {onDownloadPdf && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownloadPdf(invoice)}
                      className="rounded-xl text-xs font-semibold"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      PDF
                    </Button>
                  )}
                  {onPreview && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPreview(invoice)}
                      className="rounded-xl text-xs font-semibold"
                    >
                      Preview
                    </Button>
                  )}
                  {onPrint && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPrint(invoice)}
                      className="rounded-xl text-xs font-semibold"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      Print
                    </Button>
                  )}
                  {onEmail && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEmail(invoice)}
                      className="rounded-xl text-xs font-semibold"
                    >
                      Email
                    </Button>
                  )}
                  {onEdit && !invoice.isDeleted && invoice.status !== "PAID" && (
                    <Button
                      size="sm"
                      onClick={() => {
                        onClose();
                        onEdit(invoice);
                      }}
                      className="bg-[#F97316] hover:bg-orange-600 rounded-xl text-xs font-semibold text-white shadow-xs"
                    >
                      <Edit className="w-3.5 h-3.5 mr-1" />
                      Edit
                    </Button>
                  )}
                </div>
              </div>
            </DialogHeader>

            <Separator className="bg-slate-100 dark:bg-slate-800" />

            {/* Client & Billing Info Card */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800">
              {/* Client Details */}
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center gap-1.5 font-extrabold text-slate-900 dark:text-white uppercase tracking-wider text-[11px]">
                  <Building2 className="w-4 h-4 text-[#F97316]" />
                  Billed To (Client Profile)
                </div>
                <p className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                  {invoice.client?.companyName}
                </p>
                <p className="text-slate-600 dark:text-slate-400">
                  Attn: <span className="font-medium text-slate-800 dark:text-slate-200">{invoice.client?.contactPerson}</span>
                </p>
                <p className="text-slate-600 dark:text-slate-400">{invoice.client?.email}</p>
                <p className="text-slate-600 dark:text-slate-400">{invoice.client?.phone}</p>
                {invoice.client?.gstNumber && (
                  <p className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
                    GSTIN: {invoice.client.gstNumber}
                  </p>
                )}
                {invoice.client?.billingAddress && (
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] pt-1">
                    Address: {invoice.client.billingAddress}
                  </p>
                )}
              </div>

              {/* Invoice Meta */}
              <div className="space-y-2 text-xs border-t sm:border-t-0 sm:border-l border-slate-200 dark:border-slate-800 pt-3 sm:pt-0 sm:pl-4">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    Issue Date:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatDate(invoice.issueDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    Due Date:
                  </span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatDate(invoice.dueDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    Created By:
                  </span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {invoice.createdBy || "System"}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Currency:</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {invoice.currency}
                  </span>
                </div>
              </div>
            </div>

            {/* Line Items Table */}
            <div className="space-y-2">
              <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-[#F97316]" />
                Invoice Line Items ({invoice.items?.length || 0})
              </h4>

              <div className="rounded-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 dark:bg-slate-900/80 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-right">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3">Applied Taxes (Snapshot)</th>
                      <th className="py-2.5 px-3 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {invoice.items?.map((item, idx) => {
                      const appliedSnapshots: AppliedTaxSnapshot[] =
                        (item.appliedTaxes as unknown as AppliedTaxSnapshot[]) || [];
                      const lineAmt = item.lineAmount || item.quantity * item.unitPrice;

                      return (
                        <tr key={item.id || idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                          <td className="py-2.5 px-3 font-medium text-slate-900 dark:text-slate-100">
                            {item.description}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                            {item.quantity}
                          </td>
                          <td className="py-2.5 px-3 text-right text-slate-600 dark:text-slate-300">
                            {formatCurrency(item.unitPrice, invoice.currency)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-300">
                            {appliedSnapshots.length > 0 ? (
                              <div className="flex flex-wrap gap-1">
                                {appliedSnapshots.map((t, i) => (
                                  <span
                                    key={i}
                                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-semibold border ${
                                      t.calculationType === "DEDUCT"
                                        ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200"
                                        : "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200"
                                    }`}
                                  >
                                    {t.taxCode} ({t.taxRate}{t.type === "PERCENTAGE" ? "%" : ""}): {formatCurrency(t.taxAmount, invoice.currency)}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-400 italic">No Tax</span>
                            )}
                          </td>
                          <td className="py-2.5 px-3 text-right font-bold text-slate-900 dark:text-slate-100">
                            {formatCurrency(lineAmt, invoice.currency)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Totals & Payments Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Payment History if available */}
              <div className="space-y-2">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-[#F97316]" />
                  Payment Records ({invoice.payments?.length || 0})
                </h4>

                {invoice.payments && invoice.payments.length > 0 ? (
                  <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                    {invoice.payments.map((p) => (
                      <div
                        key={p.id}
                        className="p-2 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/30 flex items-center justify-between text-xs"
                      >
                        <div>
                          <span className="font-semibold text-emerald-800 dark:text-emerald-300">
                            {p.paymentMethod}
                          </span>
                          <span className="text-[10px] text-slate-400 block">
                            {formatDate(p.createdAt)}
                          </span>
                        </div>
                        <span className="font-bold text-emerald-700 dark:text-emerald-400">
                          + {formatCurrency(p.amount, invoice.currency)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/60 dark:border-slate-800 text-[11px] text-slate-500 italic">
                    No payment transactions recorded yet.
                  </div>
                )}
              </div>

              {/* Invoice Totals */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Subtotal:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(invoice.subtotal, invoice.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Total Additive Tax:</span>
                  <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                    + {formatCurrency(invoice.totalAdditiveTax || invoice.tax || 0, invoice.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between font-bold text-slate-900 dark:text-white">
                  <span>Grand Total:</span>
                  <span>{formatCurrency(invoice.grandTotal || invoice.total, invoice.currency)}</span>
                </div>

                {(invoice.totalDeductionTax || 0) > 0 && (
                  <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 font-semibold">
                    <span>TDS / Deduction Tax:</span>
                    <span>- {formatCurrency(invoice.totalDeductionTax, invoice.currency)}</span>
                  </div>
                )}

                <Separator className="my-1 bg-slate-200 dark:bg-slate-800" />

                <div className="flex items-center justify-between font-black text-sm text-slate-900 dark:text-white">
                  <span className="text-orange-600 dark:text-orange-400">Net Payable:</span>
                  <span className="text-[#F97316]">
                    {formatCurrency(invoice.netPayable || invoice.total, invoice.currency)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                  <span>Amount Paid:</span>
                  <span>{formatCurrency(invoice.amountPaid, invoice.currency)}</span>
                </div>

                <div className="flex items-center justify-between text-rose-600 dark:text-rose-400 font-extrabold text-xs">
                  <span>Balance Due:</span>
                  <span>{formatCurrency(invoice.balanceDue, invoice.currency)}</span>
                </div>
              </div>
            </div>

            {/* Notes & Terms */}
            {(invoice.notes || invoice.terms) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs pt-2">
                {invoice.notes && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">Notes:</span>
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                      {invoice.notes}
                    </p>
                  </div>
                )}
                {invoice.terms && (
                  <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 space-y-1">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block">
                      Terms & Conditions:
                    </span>
                    <p className="text-slate-600 dark:text-slate-400 whitespace-pre-wrap">
                      {invoice.terms}
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Action Bar Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                {onChangeStatus && !invoice.isDeleted && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onClose();
                      onChangeStatus(invoice);
                    }}
                    className="rounded-xl text-xs font-semibold"
                  >
                    <ShieldCheck className="w-3.5 h-3.5 mr-1 text-slate-500" />
                    Change Status
                  </Button>
                )}
                {onMarkPaid && !invoice.isDeleted && invoice.balanceDue > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onClose();
                      onMarkPaid(invoice);
                    }}
                    className="rounded-xl text-xs font-semibold text-emerald-600 border-emerald-200 dark:border-emerald-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Mark Fully Paid
                  </Button>
                )}
                {onMarkPartial && !invoice.isDeleted && invoice.balanceDue > 0 && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      onClose();
                      onMarkPartial(invoice);
                    }}
                    className="rounded-xl text-xs font-semibold text-purple-600 border-purple-200 dark:border-purple-900 hover:bg-purple-50 dark:hover:bg-purple-950/40"
                  >
                    <DollarSign className="w-3.5 h-3.5 mr-1" />
                    Partial Payment
                  </Button>
                )}
              </div>

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
