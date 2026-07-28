import React, { useState } from "react";
import type { Quotation } from "../types/quotation.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Loader2, XCircle } from "lucide-react";

interface QuotationRejectDialogProps {
  quotation: Quotation | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason?: string) => Promise<void>;
  isLoading?: boolean;
}

export const QuotationRejectDialog: React.FC<QuotationRejectDialogProps> = ({
  quotation,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [reason, setReason] = useState("");

  if (!quotation) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onConfirm(reason);
    setReason("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800">
        <DialogHeader className="space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-400 mb-2">
            <XCircle className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
            Reject Proposal ({quotation.quotationNumber})?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Mark proposal for <span className="font-semibold text-slate-700 dark:text-slate-200">{quotation.client?.companyName}</span> as REJECTED. Optionally enter client feedback or rejection reason below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Rejection Reason / Client Feedback (Optional)
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Budget constraints, project postponed to next quarter..."
              className="w-full text-xs p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl text-xs font-semibold px-4"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold px-5 shadow-sm shadow-amber-500/20"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                  Rejecting...
                </>
              ) : (
                <>
                  <XCircle className="w-4 h-4 mr-1.5" />
                  Mark Rejected
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
