import React from "react";
import type { QuotationStatus } from "../types/quotation.types";
import { Badge } from "../../../components/ui/badge";
import {
  FileEdit,
  Clock,
  CheckCircle2,
  XCircle,
  FileCheck,
  AlertTriangle,
} from "lucide-react";

interface QuotationStatusBadgeProps {
  status: QuotationStatus;
}

export const QuotationStatusBadge: React.FC<QuotationStatusBadgeProps> = ({ status }) => {
  switch (status) {
    case "DRAFT":
      return (
        <Badge
          variant="outline"
          className="bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <FileEdit className="w-3 h-3 text-slate-500" />
          Draft
        </Badge>
      );
    case "PENDING":
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <Clock className="w-3 h-3 text-amber-500" />
          Pending
        </Badge>
      );
    case "APPROVED":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Approved
        </Badge>
      );
    case "REJECTED":
      return (
        <Badge
          variant="outline"
          className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <XCircle className="w-3 h-3 text-rose-500" />
          Rejected
        </Badge>
      );
    case "CONVERTED":
      return (
        <Badge
          variant="outline"
          className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <FileCheck className="w-3 h-3 text-purple-500" />
          Converted to Invoice
        </Badge>
      );
    case "EXPIRED":
      return (
        <Badge
          variant="outline"
          className="bg-red-500/10 text-red-700 dark:text-red-300 border-red-200 dark:border-red-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <AlertTriangle className="w-3 h-3 text-red-500" />
          Expired
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 font-semibold py-0.5 px-2 text-[11px]"
        >
          {status}
        </Badge>
      );
  }
};
