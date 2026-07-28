import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { RotateCcw, Loader2 } from "lucide-react";
import type { Client } from "../types/client.types";

interface RestoreConfirmationDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export const RestoreConfirmationDialog: React.FC<RestoreConfirmationDialogProps> = ({
  client,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  if (!client) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl">
        <DialogHeader>
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 flex items-center justify-center mb-2">
            <RotateCcw className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white">
            Restore Client Account?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 space-y-2 pt-1">
            <p>
              Do you want to restore{" "}
              <strong className="text-slate-900 dark:text-white">{client.companyName}</strong> (
              {client.contactPerson})?
            </p>
            <p className="bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 p-3 rounded-xl font-medium">
              This client account will be reactivated and returned to the main client directory. You will be able to issue invoices and record transactions again.
            </p>
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl text-xs"
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs px-5 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Restoring...
              </>
            ) : (
              "Confirm Restore"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
