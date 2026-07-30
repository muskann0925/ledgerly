import React from "react";
import type { Invoice } from "../types/invoice.types";
import { SimulatedPaymentGatewayModal } from "../../payments/components/SimulatedPaymentGatewayModal";
import { useCreatePaymentMutation } from "../../payments/hooks/usePayments";
import type { PaymentMethod, PaymentStatus } from "../../payments/types/payment.types";

interface InvoicePaymentDialogProps {
  invoice: Invoice | null;
  mode: "FULL" | "PARTIAL" | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmFull?: (id: string, values: any) => Promise<void>;
  onConfirmPartial?: (id: string, values: any) => Promise<void>;
  isLoading?: boolean;
}

export const InvoicePaymentDialog: React.FC<InvoicePaymentDialogProps> = ({
  invoice,
  isOpen,
  onClose,
}) => {
  const createPaymentMutation = useCreatePaymentMutation(() => {
    onClose();
  });

  if (!invoice || !isOpen) return null;

  const targetInvoice = {
    id: invoice.id,
    number: invoice.number,
    clientName: invoice.client?.companyName || invoice.client?.contactPerson || "Client",
    amount: invoice.balanceDue || invoice.total,
    currency: invoice.currency,
  };

  const handleGatewaySubmit = async (params: {
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    referenceNumber: string;
    notes?: string;
    failureReason?: string;
  }) => {
    await createPaymentMutation.mutateAsync({
      invoiceId: params.invoiceId,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      status: params.status,
      referenceNumber: params.referenceNumber,
      notes: params.notes,
      failureReason: params.failureReason,
    });
  };

  return (
    <SimulatedPaymentGatewayModal
      isOpen={isOpen}
      onClose={onClose}
      invoice={targetInvoice}
      onSubmitPayment={handleGatewaySubmit}
      isLoading={createPaymentMutation.isPending}
    />
  );
};
