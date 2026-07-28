import React from "react";
import type { PaymentMethod } from "../types/payment.types";
import { Badge } from "../../../components/ui/badge";
import {
  Banknote,
  Smartphone,
  Building,
  CreditCard,
  FileCheck,
  HelpCircle,
} from "lucide-react";

interface PaymentMethodBadgeProps {
  method: PaymentMethod;
}

export const PaymentMethodBadge: React.FC<PaymentMethodBadgeProps> = ({ method }) => {
  switch (method) {
    case "CASH":
      return (
        <Badge
          variant="outline"
          className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <Banknote className="w-3 h-3 text-emerald-500" />
          Cash
        </Badge>
      );
    case "UPI":
      return (
        <Badge
          variant="outline"
          className="bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <Smartphone className="w-3 h-3 text-purple-500" />
          UPI / GPay
        </Badge>
      );
    case "BANK_TRANSFER":
      return (
        <Badge
          variant="outline"
          className="bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <Building className="w-3 h-3 text-blue-500" />
          Bank Wire
        </Badge>
      );
    case "CREDIT_CARD":
      return (
        <Badge
          variant="outline"
          className="bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <CreditCard className="w-3 h-3 text-indigo-500" />
          Credit Card
        </Badge>
      );
    case "DEBIT_CARD":
      return (
        <Badge
          variant="outline"
          className="bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <CreditCard className="w-3 h-3 text-sky-500" />
          Debit Card
        </Badge>
      );
    case "CHEQUE":
      return (
        <Badge
          variant="outline"
          className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-900/50 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <FileCheck className="w-3 h-3 text-amber-500" />
          Cheque
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 font-semibold gap-1 py-0.5 px-2 text-[11px]"
        >
          <HelpCircle className="w-3 h-3 text-slate-500" />
          Other
        </Badge>
      );
  }
};
