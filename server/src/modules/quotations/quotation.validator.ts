import { z } from "zod";
import { QuotationStatus } from "@prisma/client";

const nonWhitespaceString = z
  .string()
  .trim()
  .min(1, "Field cannot be empty or whitespace-only");

export const createQuotationItemSchema = z.object({
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

export const createQuotationSchema = z.object({
  clientId: nonWhitespaceString,
  issueDate: z.string().optional(),
  expiryDate: z.string().min(1, "Expiry date is required"),
  status: z.nativeEnum(QuotationStatus).optional().default(QuotationStatus.DRAFT),
  currency: z.string().trim().min(1).optional().default("INR"),
  notes: z.string().trim().max(1000, "Notes cannot exceed 1000 characters").optional().nullable(),
  terms: z.string().trim().max(1000, "Terms cannot exceed 1000 characters").optional().nullable(),
  items: z
    .array(createQuotationItemSchema)
    .min(1, "Quotation must contain at least one line item"),
});

export const updateQuotationSchema = z.object({
  clientId: nonWhitespaceString.optional(),
  issueDate: z.string().optional(),
  expiryDate: z.string().optional(),
  status: z.nativeEnum(QuotationStatus).optional(),
  currency: z.string().trim().min(1).optional(),
  notes: z.string().trim().max(1000, "Notes cannot exceed 1000 characters").optional().nullable(),
  terms: z.string().trim().max(1000, "Terms cannot exceed 1000 characters").optional().nullable(),
  items: z
    .array(createQuotationItemSchema)
    .min(1, "Quotation must contain at least one line item")
    .optional(),
});

export const rejectQuotationSchema = z.object({
  rejectionReason: z.string().trim().max(500, "Rejection reason cannot exceed 500 characters").optional(),
});

const ALL_STATUSES = [
  "ALL",
  "DRAFT",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "CONVERTED",
  "EXPIRED",
] as const;

export const quotationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).optional(),
  pageSize: z.coerce.number().int().positive().max(100).optional(),
  search: z.string().trim().optional(),
  status: z.enum(ALL_STATUSES).optional().default("ALL"),
  clientId: z.string().trim().optional(),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  isExpired: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === "boolean") return val;
      return val === "true";
    }),
  isDeleted: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === "boolean") return val;
      return val === "true";
    }),
  sortBy: z
    .enum(["quotationNumber", "issueDate", "expiryDate", "total", "status", "createdAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
