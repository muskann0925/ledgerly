import React from "react";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import type { Tax } from "../types/tax.types";

interface TaxDeleteDialogProps {
  isOpen: boolean;
  onClose: () => void;
  tax: Tax | null;
  isBulk: boolean;
  selectedCount: number;
  onConfirmDelete: () => Promise<void>;
}

export const TaxDeleteDialog: React.FC<TaxDeleteDialogProps> = ({
  isOpen,
  onClose,
  tax,
  isBulk,
  selectedCount,
  onConfirmDelete,
}) => {
  const [isDeleting, setIsDeleting] = React.useState(false);

  const handleConfirm = async () => {
    setIsDeleting(true);
    await onConfirmDelete();
    setIsDeleting(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
        <DialogHeader className="flex flex-col items-center text-center pt-2">
          <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-3">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white">
            {isBulk ? `Delete ${selectedCount} Tax Rates?` : `Delete Tax Rate '${tax?.name}'?`}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
            {isBulk
              ? `Are you sure you want to soft delete these ${selectedCount} selected tax configurations? They will no longer be available for selection.`
              : `Are you sure you want to soft delete '${tax?.name}' (${tax?.code})? Active transactions referencing this tax will retain historical values.`}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="flex items-center justify-center gap-3 pt-4 sm:justify-center">
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
            className="bg-rose-600 hover:bg-rose-700 font-semibold"
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Deleting...
              </>
            ) : (
              "Confirm Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
