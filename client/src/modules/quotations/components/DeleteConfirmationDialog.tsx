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
import { AlertTriangle, Loader2, Trash2 } from "lucide-react";

interface DeleteConfirmationDialogProps {
  quotation: Quotation | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isLoading?: boolean;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
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
          <div className="w-10 h-10 rounded-2xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/50 flex items-center justify-center text-rose-600 dark:text-rose-400 mb-2">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
            Soft Delete Proposal ({quotation.quotationNumber})?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            This will mark proposal for <span className="font-semibold text-slate-700 dark:text-slate-200">{quotation.client?.companyName}</span> as soft-deleted. You can restore it later from Trash mode.
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
            className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold px-5 shadow-sm shadow-rose-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-1.5" />
                Soft Delete
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
