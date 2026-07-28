import React from "react";
import type { Quotation } from "../types/quotation.types";
import { QuotationStatusBadge } from "./QuotationStatusBadge";
import { QuotationActions } from "./QuotationActions";
import { TableCell, TableRow } from "../../../components/ui/table";
import { Building2, FileText } from "lucide-react";

interface QuotationRowProps {
  quotation: Quotation;
  onView: (quotation: Quotation) => void;
  onEdit: (quotation: Quotation) => void;
  onDelete: (quotation: Quotation) => void;
  onRestore: (quotation: Quotation) => void;
  onDuplicate: (quotation: Quotation) => void;
  onApprove: (quotation: Quotation) => void;
  onReject: (quotation: Quotation) => void;
  onConvert: (quotation: Quotation) => void;
  onDownloadPdf: (quotation: Quotation) => void;
  onPreview?: (quotation: Quotation) => void;
  onPrint?: (quotation: Quotation) => void;
  onEmail?: (quotation: Quotation) => void;
}

export const QuotationRow: React.FC<QuotationRowProps> = ({
  quotation,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onDuplicate,
  onApprove,
  onReject,
  onConvert,
  onDownloadPdf,
  onPreview,
  onPrint,
  onEmail,
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
      {/* Quotation Number */}
      <TableCell className="font-semibold py-3.5 px-4 text-xs">
        <div
          onClick={() => onView(quotation)}
          className="flex items-center gap-2 text-slate-900 dark:text-slate-100 hover:text-[#F97316] dark:hover:text-[#F97316] cursor-pointer transition-colors"
        >
          <FileText className="w-4 h-4 text-slate-400 group-hover:text-[#F97316] transition-colors" />
          <span className="font-mono font-bold tracking-tight">
            {quotation.quotationNumber}
          </span>
        </div>
      </TableCell>

      {/* Client */}
      <TableCell className="py-3.5 px-4 text-xs">
        <div className="flex items-center gap-1.5 font-semibold text-slate-900 dark:text-slate-100">
          <Building2 className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          {quotation.client?.companyName || "Unknown Client"}
        </div>
      </TableCell>

      {/* Issue Date */}
      <TableCell className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
        {formatDate(quotation.issueDate)}
      </TableCell>

      {/* Expiry Date */}
      <TableCell className="py-3.5 px-4 text-xs text-slate-600 dark:text-slate-300 whitespace-nowrap">
        {formatDate(quotation.expiryDate)}
      </TableCell>

      {/* Total Amount */}
      <TableCell className="py-3.5 px-4 text-xs font-black text-slate-900 dark:text-white whitespace-nowrap">
        {formatCurrency(quotation.total, quotation.currency)}
      </TableCell>

      {/* Status */}
      <TableCell className="py-3.5 px-4 text-xs whitespace-nowrap">
        <QuotationStatusBadge status={quotation.status} />
      </TableCell>

      {/* Created Date */}
      <TableCell className="py-3.5 px-4 text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
        {formatDate(quotation.createdAt)}
      </TableCell>

      {/* Actions */}
      <TableCell className="py-3.5 px-4 text-xs text-right whitespace-nowrap">
        <QuotationActions
          quotation={quotation}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
          onDuplicate={onDuplicate}
          onApprove={onApprove}
          onReject={onReject}
          onConvert={onConvert}
          onDownloadPdf={onDownloadPdf}
          onPreview={onPreview}
          onPrint={onPrint}
          onEmail={onEmail}
        />
      </TableCell>
    </TableRow>
  );
};
