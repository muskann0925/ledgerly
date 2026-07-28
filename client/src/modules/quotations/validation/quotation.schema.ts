import { z } from "zod";

const nonWhitespaceString = z
  .string()
  .trim()
  .min(1, "This field is required and cannot be empty or whitespace only");

export const quotationItemSchema = z.object({
  description: nonWhitespaceString,
  quantity: z
    .number()
    .gt(0, "Quantity must be greater than 0"),
  unitPrice: z
    .number()
    .gte(0, "Unit price cannot be negative"),
  taxRate: z
    .number()
    .gte(0, "Tax rate cannot be negative")
    .optional()
    .default(0),
  discount: z
    .number()
    .gte(0, "Discount cannot be negative")
    .optional()
    .default(0),
});

export const quotationFormSchema = z
  .object({
    clientId: nonWhitespaceString,
    issueDate: z.string().optional(),
    expiryDate: z.string().min(1, "Expiry date is required"),
    currency: z.string().min(1, "Currency is required").optional().default("INR"),
    notes: z.string().trim().max(1000, "Notes cannot exceed 1000 characters").optional(),
    terms: z.string().trim().max(1000, "Terms cannot exceed 1000 characters").optional(),
    items: z
      .array(quotationItemSchema)
      .min(1, "Quotation proposal must contain at least one line item"),
  })
  .refine(
    (data) => {
      if (data.issueDate && data.expiryDate) {
        return new Date(data.expiryDate) >= new Date(data.issueDate);
      }
      return true;
    },
    {
      message: "Expiry date cannot be before issue date",
      path: ["expiryDate"],
    }
  );

export type QuotationFormValues = z.infer<typeof quotationFormSchema>;
