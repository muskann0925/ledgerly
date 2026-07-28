import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { InvoiceForm } from "../../modules/invoices/components/InvoiceForm";
import { useCreateInvoiceMutation } from "../../modules/invoices/hooks/useInvoices";
import type { InvoiceFormValues } from "../../modules/invoices/validation/invoice.schema";

interface CreateInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateInvoiceModal: React.FC<CreateInvoiceModalProps> = ({
  isOpen,
  onClose,
}) => {
  const createMutation = useCreateInvoiceMutation(() => {
    onClose();
  });

  const handleSubmit = async (values: InvoiceFormValues) => {
    await createMutation.mutateAsync(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-[#111827]">
          <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">
            Create New Invoice
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Generate a formal service billing invoice for an active client account.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <InvoiceForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={createMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
