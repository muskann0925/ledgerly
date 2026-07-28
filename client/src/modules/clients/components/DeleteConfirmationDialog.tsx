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
import { AlertTriangle, Loader2 } from "lucide-react";
import type { Client } from "../types/client.types";

interface DeleteConfirmationDialogProps {
  client: Client | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
  isLoading?: boolean;
}

export const DeleteConfirmationDialog: React.FC<DeleteConfirmationDialogProps> = ({
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
          <div className="w-12 h-12 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 flex items-center justify-center mb-2">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <DialogTitle className="text-lg font-extrabold text-slate-900 dark:text-white">
            Soft Delete Client Profile?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 space-y-2 pt-1">
            <p>
              Are you sure you want to delete{" "}
              <strong className="text-slate-900 dark:text-white">{client.companyName}</strong> (
              {client.contactPerson})?
            </p>
            <p className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-300 p-3 rounded-xl font-medium">
              This client profile will be marked as inactive and soft-deleted. No historical invoice or transaction data will be destroyed. You can restore this client at any time from the Deleted filter view.
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
            className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl text-xs px-5 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                Deleting...
              </>
            ) : (
              "Confirm Soft Delete"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
