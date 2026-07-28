import React from "react";
import type { Invoice } from "../types/invoice.types";
import { usePermission } from "../../../hooks/usePermission";
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
  Edit,
  Copy,
  Download,
  Printer,
  Mail,
  CheckCircle2,
  DollarSign,
  Tag,
  Trash2,
  RotateCcw,
} from "lucide-react";

interface InvoiceActionsProps {
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

export const InvoiceActions: React.FC<InvoiceActionsProps> = ({
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
  const permission = usePermission();
  const isPaidOrRefunded = invoice.status === "PAID" || invoice.status === "REFUNDED";
  const isFullyPaid = invoice.status === "PAID" || invoice.balanceDue <= 0;

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
          onClick={() => onView(invoice)}
          className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
        >
          <Eye className="w-3.5 h-3.5 mr-2 text-slate-400" />
          View Details
        </DropdownMenuItem>

        {/* Edit */}
        {!invoice.isDeleted && permission.can("invoices", "edit") && (
          <DropdownMenuItem
            onClick={() => onEdit(invoice)}
            disabled={isPaidOrRefunded}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800 disabled:opacity-40"
          >
            <Edit className="w-3.5 h-3.5 mr-2 text-slate-400" />
            Edit Invoice
          </DropdownMenuItem>
        )}

        {/* Duplicate */}
        {permission.can("invoices", "duplicate") && (
          <DropdownMenuItem
            onClick={() => onDuplicate(invoice)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
          >
            <Copy className="w-3.5 h-3.5 mr-2 text-slate-400" />
            Duplicate Invoice
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

        {/* Download PDF */}
        <DropdownMenuItem
          onClick={() => onDownloadPdf(invoice)}
          className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
        >
          <Download className="w-3.5 h-3.5 mr-2 text-slate-400" />
          Download PDF
        </DropdownMenuItem>

        {/* Preview */}
        {onPreview && (
          <DropdownMenuItem
            onClick={() => onPreview(invoice)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
          >
            <Eye className="w-3.5 h-3.5 mr-2 text-slate-400" />
            Preview Document
          </DropdownMenuItem>
        )}

        {/* Print */}
        <DropdownMenuItem
          onClick={() => onPrint(invoice)}
          className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
        >
          <Printer className="w-3.5 h-3.5 mr-2 text-slate-400" />
          Print Invoice
        </DropdownMenuItem>

        {/* Email */}
        {onEmail && permission.can("invoices", "send_email") && (
          <DropdownMenuItem
            onClick={() => onEmail(invoice)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
          >
            <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
            Email Invoice
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

        {/* Payment & Status Actions */}
        {!invoice.isDeleted && permission.can("invoices", "record_payment") && (
          <>
            <DropdownMenuItem
              onClick={() => onMarkPaid(invoice)}
              disabled={isFullyPaid}
              className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-emerald-600 dark:text-emerald-400 focus:bg-emerald-50 dark:focus:bg-emerald-950/40 disabled:opacity-40"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-2" />
              Mark Fully Paid
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onMarkPartial(invoice)}
              disabled={isFullyPaid}
              className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-purple-600 dark:text-purple-400 focus:bg-purple-50 dark:focus:bg-purple-950/40 disabled:opacity-40"
            >
              <DollarSign className="w-3.5 h-3.5 mr-2" />
              Mark Partial Payment
            </DropdownMenuItem>

            <DropdownMenuItem
              onClick={() => onChangeStatus(invoice)}
              className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
            >
              <Tag className="w-3.5 h-3.5 mr-2 text-slate-400" />
              Change Status
            </DropdownMenuItem>

            <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />
          </>
        )}

        {/* Delete / Restore */}
        {permission.can("invoices", "delete") && (
          invoice.isDeleted ? (
            <DropdownMenuItem
              onClick={() => onRestore(invoice)}
              className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-emerald-600 dark:text-emerald-400 focus:bg-emerald-50 dark:focus:bg-emerald-950/40 font-medium"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-2" />
              Restore Invoice
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => onDelete(invoice)}
              className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/40 font-medium"
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              Delete Invoice
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
