import React from "react";
import type { Quotation } from "../types/quotation.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { FileCheck, Loader2 } from "lucide-react";

interface QuotationConvertDialogProps {
  quotation: Quotation | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const QuotationConvertDialog: React.FC<QuotationConvertDialogProps> = ({
  quotation,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!quotation) return null;

  const formatCurrency = (val: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(val);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 select-none">
        <DialogHeader className="space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-900/50 flex items-center justify-center text-purple-600 dark:text-purple-400 mb-2">
            <FileCheck className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
            Convert Proposal to Active Invoice?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            This will create a new <span className="font-semibold text-slate-700 dark:text-slate-200">Invoice ({formatCurrency(quotation.total, quotation.currency)})</span> for client <span className="font-semibold text-slate-700 dark:text-slate-200">{quotation.client?.companyName}</span> copying all proposal deliverables, terms, and totals.
          </DialogDescription>
        </DialogHeader>

        <div className="p-3.5 rounded-xl bg-purple-50/50 dark:bg-purple-950/20 border border-purple-100 dark:border-purple-900/40 text-xs text-purple-800 dark:text-purple-300 space-y-1">
          <p className="font-bold">What will happen:</p>
          <ul className="list-disc pl-4 space-y-0.5 text-[11px]">
            <li>A new sequential Invoice number will be assigned automatically.</li>
            <li>Proposal status will change to <span className="font-semibold">CONVERTED</span>.</li>
            <li>Double conversion of the same proposal is automatically prevented.</li>
          </ul>
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl text-xs font-semibold px-4"
          >
            Cancel
          </Button>
          <Button
            size="sm"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold px-5 shadow-sm shadow-purple-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Converting...
              </>
            ) : (
              <>
                <FileCheck className="w-4 h-4 mr-1.5" />
                Convert Proposal
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
