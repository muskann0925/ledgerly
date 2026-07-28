import React from "react";
import type { InvoiceStatus } from "../types/invoice.types";
import { Badge } from "../../../components/ui/badge";
import {
  FileEdit,
  Clock,
  Send,
  Eye,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RotateCcw,
} from "lucide-react";

interface InvoiceStatusBadgeProps {
  status: InvoiceStatus;
  isDeleted?: boolean;
}

export const InvoiceStatusBadge: React.FC<InvoiceStatusBadgeProps> = ({
  status,
  isDeleted,
}) => {
  if (isDeleted) {
    return (
      <Badge
        variant="outline"
        className="bg-red-500/10 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
      >
        <XCircle className="w-3 h-3" />
        Deleted
      </Badge>
    );
  }

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
    case "SENT":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <Send className="w-3 h-3 text-blue-500" />
          Sent
        </Badge>
      );
    case "VIEWED":
      return (
        <Badge
          variant="outline"
          className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <Eye className="w-3 h-3 text-sky-500" />
          Viewed
        </Badge>
      );
    case "PARTIALLY_PAID":
      return (
        <Badge
          variant="outline"
          className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <CreditCard className="w-3 h-3 text-purple-500" />
          Partial Paid
        </Badge>
      );
    case "PAID":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
          Paid
        </Badge>
      );
    case "OVERDUE":
      return (
        <Badge
          variant="outline"
          className="bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <AlertTriangle className="w-3 h-3 text-rose-500" />
          Overdue
        </Badge>
      );
    case "CANCELLED":
      return (
        <Badge
          variant="outline"
          className="bg-gray-500/10 text-gray-700 dark:text-gray-400 border-gray-200 dark:border-gray-800 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <XCircle className="w-3 h-3 text-gray-500" />
          Cancelled
        </Badge>
      );
    case "REFUNDED":
      return (
        <Badge
          variant="outline"
          className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <RotateCcw className="w-3 h-3 text-indigo-500" />
          Refunded
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="text-xs">
          {status}
        </Badge>
      );
  }
};
