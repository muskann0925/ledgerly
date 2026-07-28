import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../ui/dialog";
import { ClientForm } from "../../modules/clients/components/ClientForm";
import { useCreateClientMutation } from "../../modules/clients/hooks/useClients";
import type { ClientFormValues } from "../../modules/clients/validation/client.schema";

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreateClientModal: React.FC<CreateClientModalProps> = ({
  isOpen,
  onClose,
}) => {
  const createMutation = useCreateClientMutation();

  const handleSubmit = async (values: ClientFormValues) => {
    try {
      await createMutation.mutateAsync({
        companyName: values.companyName,
        contactPerson: values.contactPerson,
        email: values.email,
        phone: values.phone,
        clientType: values.clientType,
        gstNumber: values.gstNumber || undefined,
        panNumber: values.panNumber || undefined,
        billingAddress: values.billingAddress || undefined,
        shippingAddress: values.shippingAddress || undefined,
        notes: values.notes || undefined,
      });
      onClose();
    } catch {
      // Error toast handling is managed by useCreateClientMutation
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-[#111827]">
          <DialogTitle className="text-xl font-extrabold text-slate-900 dark:text-white">
            Add New Client
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Register a new client profile into the Ledgerly directory.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6">
          <ClientForm
            onSubmit={handleSubmit}
            onCancel={onClose}
            isLoading={createMutation.isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};
