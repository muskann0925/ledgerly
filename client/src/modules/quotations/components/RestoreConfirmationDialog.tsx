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
import { Loader2, RotateCcw } from "lucide-react";

interface RestoreConfirmationDialogProps {
  quotation: Quotation | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const RestoreConfirmationDialog: React.FC<RestoreConfirmationDialogProps> = ({
  quotation,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!quotation) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800">
        <DialogHeader className="space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-2">
            <RotateCcw className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
            Restore Proposal ({quotation.quotationNumber})?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            This will restore quotation proposal <span className="font-semibold text-slate-700 dark:text-slate-200">{quotation.quotationNumber}</span> for client <span className="font-semibold text-slate-700 dark:text-slate-200">{quotation.client?.companyName}</span> back to active state.
          </DialogDescription>
        </DialogHeader>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4">
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
            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-5 shadow-sm shadow-emerald-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Restoring...
              </>
            ) : (
              <>
                <RotateCcw className="w-4 h-4 mr-1.5" />
                Restore Proposal
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
