import { z } from "zod";
import { PaymentMethod, PaymentStatus } from "@prisma/client";

const nonWhitespaceString = z
  .string()
  .trim()
  .min(1, "Field cannot be empty or whitespace-only");

export const createPaymentSchema = z.object({
  invoiceId: nonWhitespaceString,
  amount: z.number().gt(0, "Amount must be greater than 0"),
  paymentDate: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    message: "Invalid payment method",
  }),
  status: z.nativeEnum(PaymentStatus).optional().default("SUCCESS"),
  failureReason: z.string().trim().max(300, "Failure reason cannot exceed 300 characters").optional().nullable(),
  referenceNumber: z.string().trim().max(100, "Reference number cannot exceed 100 characters").optional().nullable(),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional().nullable(),
});

export const updatePaymentSchema = z.object({
  amount: z.number().gt(0, "Amount must be greater than 0").optional(),
  paymentDate: z.string().optional(),
  paymentMethod: z.nativeEnum(PaymentMethod, {
    message: "Invalid payment method",
  }).optional(),
  status: z.nativeEnum(PaymentStatus).optional(),
  failureReason: z.string().trim().max(300).optional().nullable(),
  referenceNumber: z.string().trim().max(100, "Reference number cannot exceed 100 characters").optional().nullable(),
  notes: z.string().trim().max(500, "Notes cannot exceed 500 characters").optional().nullable(),
});

const ALL_METHODS = [
  "ALL",
  "CASH",
  "UPI",
  "BANK_TRANSFER",
  "CREDIT_CARD",
  "DEBIT_CARD",
  "CHEQUE",
  "OTHER",
] as const;

const ALL_STATUSES = [
  "ALL",
  "SUCCESS",
  "PENDING",
  "FAILED",
  "REFUNDED",
] as const;

export const paymentQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().trim().optional(),
  paymentMethod: z.enum(ALL_METHODS).optional().default("ALL"),
  status: z.enum(ALL_STATUSES).optional().default("ALL"),
  startDate: z.string().trim().optional(),
  endDate: z.string().trim().optional(),
  isDeleted: z
    .union([z.boolean(), z.string()])
    .optional()
    .transform((val) => {
      if (typeof val === "boolean") return val;
      return val === "true";
    }),
  sortBy: z
    .enum(["paymentDate", "amount", "createdAt"])
    .optional()
    .default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

