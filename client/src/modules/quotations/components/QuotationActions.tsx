import React from "react";
import type { Quotation } from "../types/quotation.types";
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
  CheckCircle2,
  XCircle,
  FileCheck,
  Download,
  Printer,
  Mail,
  Trash2,
  RotateCcw,
} from "lucide-react";

interface QuotationActionsProps {
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

export const QuotationActions: React.FC<QuotationActionsProps> = ({
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
  const isConverted = quotation.status === "CONVERTED";
  const isDeleted = quotation.isDeleted;

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
          Quotation Actions
        </DropdownMenuLabel>

        {/* View Details */}
        <DropdownMenuItem
          onClick={() => onView(quotation)}
          className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
        >
          <Eye className="w-3.5 h-3.5 mr-2 text-slate-400" />
          View Details
        </DropdownMenuItem>

        {/* Download PDF */}
        <DropdownMenuItem
          onClick={() => onDownloadPdf(quotation)}
          className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
        >
          <Download className="w-3.5 h-3.5 mr-2 text-slate-400" />
          Download PDF
        </DropdownMenuItem>

        {/* Preview PDF */}
        {onPreview && (
          <DropdownMenuItem
            onClick={() => onPreview(quotation)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
          >
            <Eye className="w-3.5 h-3.5 mr-2 text-slate-400" />
            Preview Document
          </DropdownMenuItem>
        )}

        {/* Print */}
        {onPrint && (
          <DropdownMenuItem
            onClick={() => onPrint(quotation)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
          >
            <Printer className="w-3.5 h-3.5 mr-2 text-slate-400" />
            Print Proposal
          </DropdownMenuItem>
        )}

        {/* Email */}
        {onEmail && (
          <DropdownMenuItem
            onClick={() => onEmail(quotation)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
          >
            <Mail className="w-3.5 h-3.5 mr-2 text-slate-400" />
            Email Proposal
          </DropdownMenuItem>
        )}

        {/* Edit */}
        {!isDeleted && !isConverted && (
          <DropdownMenuItem
            onClick={() => onEdit(quotation)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
          >
            <Edit className="w-3.5 h-3.5 mr-2 text-slate-400" />
            Edit Quotation
          </DropdownMenuItem>
        )}

        {/* Duplicate */}
        <DropdownMenuItem
          onClick={() => onDuplicate(quotation)}
          className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-slate-700 dark:text-slate-300 focus:bg-slate-50 dark:focus:bg-slate-800"
        >
          <Copy className="w-3.5 h-3.5 mr-2 text-slate-400" />
          Duplicate Proposal
        </DropdownMenuItem>

        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

        {/* Approve & Reject */}
        {!isDeleted && !isConverted && (
          <>
            {quotation.status !== "APPROVED" && (
              <DropdownMenuItem
                onClick={() => onApprove(quotation)}
                className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-emerald-600 dark:text-emerald-400 focus:bg-emerald-50 dark:focus:bg-emerald-950/40 font-medium"
              >
                <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-500" />
                Approve Quotation
              </DropdownMenuItem>
            )}

            {quotation.status !== "REJECTED" && (
              <DropdownMenuItem
                onClick={() => onReject(quotation)}
                className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-amber-600 dark:text-amber-400 focus:bg-amber-50 dark:focus:bg-amber-950/40 font-medium"
              >
                <XCircle className="w-3.5 h-3.5 mr-2 text-amber-500" />
                Reject Proposal
              </DropdownMenuItem>
            )}
          </>
        )}

        {/* Convert to Invoice */}
        {!isDeleted && !isConverted && (
          <DropdownMenuItem
            onClick={() => onConvert(quotation)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-purple-600 dark:text-purple-400 focus:bg-purple-50 dark:focus:bg-purple-950/40 font-bold"
          >
            <FileCheck className="w-3.5 h-3.5 mr-2 text-purple-500" />
            Convert to Invoice
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator className="my-1 bg-slate-100 dark:bg-slate-800" />

        {/* Soft Delete / Restore */}
        {isDeleted ? (
          <DropdownMenuItem
            onClick={() => onRestore(quotation)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-emerald-600 dark:text-emerald-400 focus:bg-emerald-50 dark:focus:bg-emerald-950/40 font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-2" />
            Restore Proposal
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => onDelete(quotation)}
            className="rounded-lg text-xs cursor-pointer py-1.5 px-2 text-rose-600 dark:text-rose-400 focus:bg-rose-50 dark:focus:bg-rose-950/40 font-medium"
          >
            <Trash2 className="w-3.5 h-3.5 mr-2" />
            Delete Proposal
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
