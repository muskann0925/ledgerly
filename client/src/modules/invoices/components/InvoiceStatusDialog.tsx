import React, { useState, useEffect } from "react";
import type { Invoice, InvoiceStatus } from "../types/invoice.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Tag, Loader2, Save } from "lucide-react";
import { InvoiceStatusBadge } from "./InvoiceStatusBadge";

interface InvoiceStatusDialogProps {
  invoice: Invoice | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (id: string, newStatus: InvoiceStatus) => Promise<void>;
  isLoading?: boolean;
}

const ALLOWED_TRANSITIONS: Record<InvoiceStatus, InvoiceStatus[]> = {
  DRAFT: ["PENDING", "SENT", "CANCELLED"],
  PENDING: ["SENT", "VIEWED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"],
  SENT: ["VIEWED", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"],
  VIEWED: ["PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"],
  PARTIALLY_PAID: ["PAID", "OVERDUE", "REFUNDED", "CANCELLED"],
  PAID: ["REFUNDED"],
  OVERDUE: ["PARTIALLY_PAID", "PAID", "CANCELLED"],
  CANCELLED: ["DRAFT"],
  REFUNDED: [],
};

export const InvoiceStatusDialog: React.FC<InvoiceStatusDialogProps> = ({
  invoice,
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}) => {
  const [selectedStatus, setSelectedStatus] = useState<InvoiceStatus | "">("");

  useEffect(() => {
    if (invoice) {
      const allowed = ALLOWED_TRANSITIONS[invoice.status] || [];
      setSelectedStatus(allowed[0] || invoice.status);
    }
  }, [invoice]);

  if (!invoice) return null;

  const allowedStatuses = ALLOWED_TRANSITIONS[invoice.status] || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStatus || selectedStatus === invoice.status) return;
    await onConfirm(invoice.id, selectedStatus as InvoiceStatus);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800">
        <DialogHeader className="space-y-2">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-900/50 flex items-center justify-center text-[#F97316] mb-2">
            <Tag className="w-5 h-5" />
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
            Update Status for {invoice.number}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Current status: <InvoiceStatusBadge status={invoice.status} />
          </DialogDescription>
        </DialogHeader>

        {allowedStatuses.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 text-xs text-slate-500 italic">
            No status transitions are allowed from {invoice.status}.
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                New Status
              </label>
              <Select
                value={selectedStatus}
                onValueChange={(val) => setSelectedStatus(val as InvoiceStatus)}
              >
                <SelectTrigger className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  {allowedStatuses.map((st) => (
                    <SelectItem key={st} value={st} className="text-xs">
                      {st.replace("_", " ")}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
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
                disabled={isLoading || !selectedStatus || selectedStatus === invoice.status}
                className="bg-[#F97316] hover:bg-orange-600 text-white rounded-xl text-xs font-semibold px-5 shadow-sm shadow-orange-500/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Updating...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-1.5" />
                    Update Status
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
