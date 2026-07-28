import React from "react";
import type { Invoice } from "../types/invoice.types";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";
import { InvoiceActions } from "./InvoiceActions";
import { TableCell, TableRow } from "../../../components/ui/table";

interface InvoiceRowProps {
  invoice: Invoice;
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onRestore: (invoice: Invoice) => void;
  onDuplicate: (invoice: Invoice) => void;
  onDownloadPdf: (invoice: Invoice) => void;
  onPreview?: (invoice: Invoice) => void;
  onPrint: (invoice: Invoice) => void;
  onEmail?: (invoice: Invoice) => void;
  onMarkPaid: (invoice: Invoice) => void;
  onMarkPartial: (invoice: Invoice) => void;
  onChangeStatus: (invoice: Invoice) => void;
}

export const InvoiceRow: React.FC<InvoiceRowProps> = ({
  invoice,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onDuplicate,
  onDownloadPdf,
  onPreview,
  onPrint,
  onEmail,
  onMarkPaid,
  onMarkPartial,
  onChangeStatus,
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

  return (
    <TableRow className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 transition-colors group">
      {/* Invoice Number */}
      <TableCell className="font-semibold py-3.5 px-4 text-xs">
        <div
          onClick={() => onView(invoice)}
          className="text-slate-900 dark:text-slate-100 hover:text-[#F97316] dark:hover:text-[#F97316] cursor-pointer transition-colors"
        >
          <span className="font-bold tracking-tight">{invoice.number}</span>
        </div>
      </TableCell>

      {/* Client Info */}
      <TableCell className="py-3.5 px-4 text-xs">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {invoice.client?.companyName || "Unknown Client"}
          </span>
          {invoice.client?.contactPerson && (
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              {invoice.client.contactPerson}
            </span>
          )}
        </div>
      </TableCell>

      {/* Issue Date */}
      <TableCell className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
        {formatDate(invoice.issueDate)}
      </TableCell>

      {/* Due Date */}
      <TableCell className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
        {formatDate(invoice.dueDate)}
      </TableCell>

      {/* Total Amount */}
      <TableCell className="py-3.5 px-4 text-xs font-bold text-slate-900 dark:text-slate-100 whitespace-nowrap">
        {formatCurrency(invoice.total, invoice.currency)}
      </TableCell>

      {/* Amount Paid */}
      <TableCell className="py-3.5 px-4 text-xs font-semibold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
        {formatCurrency(invoice.amountPaid, invoice.currency)}
      </TableCell>

      {/* Balance Due */}
      <TableCell className="py-3.5 px-4 text-xs font-semibold whitespace-nowrap">
        <span
          className={
            invoice.balanceDue > 0
              ? "text-rose-600 dark:text-rose-400 font-bold"
              : "text-slate-400 dark:text-slate-500"
          }
        >
          {formatCurrency(invoice.balanceDue, invoice.currency)}
        </span>
      </TableCell>

      {/* Status */}
      <TableCell className="py-3.5 px-4 text-xs whitespace-nowrap">
        <InvoiceStatusBadge status={invoice.status} isDeleted={invoice.isDeleted} />
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3.5 px-4 text-xs text-right whitespace-nowrap">
        <InvoiceActions
          invoice={invoice}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
          onDuplicate={onDuplicate}
          onDownloadPdf={onDownloadPdf}
          onPreview={onPreview}
          onPrint={onPrint}
          onEmail={onEmail}
          onMarkPaid={onMarkPaid}
          onMarkPartial={onMarkPartial}
          onChangeStatus={onChangeStatus}
        />
      </TableCell>
    </TableRow>
  );
};
