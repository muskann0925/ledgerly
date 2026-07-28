import { z } from "zod";

const nonWhitespaceString = z
  .string()
  .trim()
  .min(1, "This field is required and cannot be empty or whitespace only");

export const paymentFormSchema = z.object({
  invoiceId: nonWhitespaceString,
  amount: z
    .number()
    .gt(0, "Payment amount must be greater than 0"),
  paymentDate: z.string().min(1, "Payment date is required"),
  paymentMethod: z.enum([
    "CASH",
    "UPI",
    "BANK_TRANSFER",
    "CREDIT_CARD",
    "DEBIT_CARD",
    "CHEQUE",
    "OTHER",
  ]),
  referenceNumber: z.string().trim().max(100, "Reference number cannot exceed 100 characters").optional(),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional(),
});

export type PaymentFormValues = z.infer<typeof paymentFormSchema>;
