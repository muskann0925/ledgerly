import { z } from "zod";

const nonWhitespaceString = z
  .string()
  .trim()
  .min(1, "This field is required and cannot be empty or whitespace only");

export const invoiceItemFormSchema = z.object({
  id: z.string().optional(),
  description: nonWhitespaceString,
  quantity: z
    .number()
    .gt(0, "Quantity must be greater than 0"),
  unitPrice: z
    .number()
    .min(0, "Unit price cannot be negative"),
  taxIds: z.array(z.string()).optional().default([]),
  discount: z
    .number()
    .min(0, "Discount cannot be negative")
    .optional()
    .default(0),
});

export const invoiceFormSchema = z
  .object({
    clientId: nonWhitespaceString,
    issueDate: z.string().min(1, "Issue date is required"),
    dueDate: z.string().min(1, "Due date is required"),
    currency: z.string().trim().min(1, "Currency is required").max(5),
    notes: z.string().trim().optional(),
    terms: z.string().trim().optional(),
    items: z
      .array(invoiceItemFormSchema)
      .min(1, "At least one line item is required"),
  })
  .refine(
    (data) => {
      if (data.issueDate && data.dueDate) {
        return new Date(data.dueDate) >= new Date(data.issueDate);
      }
      return true;
    },
    {
      message: "Due date cannot be before issue date",
      path: ["dueDate"],
    }
  );

export const updateStatusFormSchema = z.object({
  status: z.enum([
    "DRAFT",
    "PENDING",
    "SENT",
    "VIEWED",
    "PARTIALLY_PAID",
    "PAID",
    "OVERDUE",
    "CANCELLED",
    "REFUNDED",
  ]),
});

export const markPaidFormSchema = z.object({
  paymentMethod: z.string().trim().min(1, "Payment method is required"),
  notes: z.string().trim().optional(),
});

export const markPartialFormSchema = z.object({
  amount: z
    .number()
    .gt(0, "Payment amount must be greater than 0"),
  paymentMethod: z.string().trim().min(1, "Payment method is required"),
  notes: z.string().trim().optional(),
});

export type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;
export type InvoiceItemFormValues = z.infer<typeof invoiceItemFormSchema>;
export type UpdateStatusFormValues = z.infer<typeof updateStatusFormSchema>;
export type MarkPaidFormValues = z.infer<typeof markPaidFormSchema>;
export type MarkPartialFormValues = z.infer<typeof markPartialFormSchema>;
