import { z } from "zod";
import { InvoiceStatus } from "@prisma/client";

const nonWhitespaceString = z
  .string()
  .trim()
  .min(1, "Field cannot be empty or whitespace-only");

export const invoiceItemSchema = z.object({
  description: nonWhitespaceString,
  quantity: z.number().gt(0, "Quantity must be greater than 0"),
  unitPrice: z.number().min(0, "Unit price cannot be negative"),
  taxIds: z.array(z.string()).optional().default([]),
  discount: z
    .number()
    .min(0, "Discount cannot be negative")
    .optional()
    .default(0),
});

export const createInvoiceSchema = z
  .object({
    clientId: nonWhitespaceString,
    issueDate: z.string().optional(),
    dueDate: z.string().min(1, "Due date is required"),
    currency: z.string().trim().min(1).max(5).optional().default("INR"),
    notes: z.string().trim().optional(),
    terms: z.string().trim().optional(),
    items: z
      .array(invoiceItemSchema)
      .min(1, "Invoice must contain at least one line item"),
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

export const updateInvoiceSchema = z
  .object({
    clientId: nonWhitespaceString.optional(),
    issueDate: z.string().optional(),
    dueDate: z.string().optional(),
    currency: z.string().trim().min(1).max(5).optional(),
    notes: z.string().trim().optional(),
    terms: z.string().trim().optional(),
    items: z.array(invoiceItemSchema).min(1).optional(),
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

export const updateInvoiceStatusSchema = z.object({
  status: z.nativeEnum(InvoiceStatus, {
    message: "Invalid invoice status",
  }),
});

export const markPaidSchema = z.object({
  paymentMethod: z.string().trim().optional().default("OTHER"),
  notes: z.string().trim().optional(),
});

export const markPartialSchema = z.object({
  amount: z.number().gt(0, "Payment amount must be greater than 0"),
  paymentMethod: z.string().trim().optional().default("OTHER"),
  notes: z.string().trim().optional(),
});

const ALL_STATUSES = [
  "ALL",
  "DRAFT",
  "PENDING",
  "SENT",
  "VIEWED",
  "PARTIALLY_PAID",
  "PAID",
  "OVERDUE",
  "CANCELLED",
  "REFUNDED",
] as const;

export const invoiceQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  status: z.enum(ALL_STATUSES).optional().default("ALL"),
  clientId: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  dueStartDate: z.string().trim().optional(),
  dueEndDate: z.string().trim().optional(),
  isDeleted: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === "boolean") return val;
      return val === "true";
    }),
  sortBy: z
    .enum([
      "number",
      "issueDate",
      "dueDate",
      "createdAt",
      "total",
      "status",
    ])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
