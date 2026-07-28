import { z } from "zod";
import { InvoiceStatus, PaymentMethod } from "@prisma/client";

export const reportQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  period: z
    .enum(["daily", "weekly", "monthly", "quarterly", "yearly", "custom"])
    .default("monthly"),
  clientId: z.string().optional(),
  status: z.nativeEnum(InvoiceStatus).optional(),
  paymentStatus: z.enum(["PAID", "PENDING", "OVERDUE", "PARTIALLY_PAID"]).optional(),
  paymentMethod: z.nativeEnum(PaymentMethod).optional(),
  categoryId: z.string().optional(),
  vendorId: z.string().optional(),
  taxRate: z.coerce.number().optional(),
  currency: z.string().optional(),
});

export const exportReportSchema = reportQuerySchema.extend({
  reportType: z.enum(["revenue", "invoices", "tax", "profit-loss", "expenses", "clients"]),
  format: z.enum(["pdf", "excel", "csv"]).default("pdf"),
});
