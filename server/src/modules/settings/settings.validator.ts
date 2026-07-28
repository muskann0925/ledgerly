import { z } from "zod";

export const updateCompanySchema = z.object({
  companyName: z.string().min(2, "Company name must be at least 2 characters").optional(),
  logoUrl: z.string().nullable().optional(),
  businessEmail: z.string().email("Invalid business email format").optional(),
  phone: z.string().min(5, "Invalid phone number format").optional(),
  website: z.string().url("Invalid website URL").nullable().or(z.literal("")).optional(),
  address: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  state: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  postalCode: z.string().nullable().optional(),
  gstNumber: z.string().nullable().optional(),
  panNumber: z.string().nullable().optional(),
});

export const updateInvoiceSchema = z.object({
  invoicePrefix: z.string().min(1, "Invoice prefix cannot be empty").max(10, "Prefix too long").optional(),
  quotationPrefix: z.string().min(1, "Quotation prefix cannot be empty").max(10, "Prefix too long").optional(),
  creditNotePrefix: z.string().min(1, "Credit note prefix cannot be empty").max(10, "Prefix too long").optional(),
  receiptPrefix: z.string().min(1, "Receipt prefix cannot be empty").max(10, "Prefix too long").optional(),
  includeYearInNumber: z.boolean().optional(),
  numberSeparator: z.string().max(3, "Separator too long").optional(),
  startingNumber: z.number().int().min(1, "Starting number must be at least 1").optional(),
  zeroPaddingLength: z.number().int().min(3).max(10).optional(),
  defaultPaymentTerms: z.string().min(2, "Default payment terms required").optional(),
  defaultDueDays: z.number().int().min(0, "Due days cannot be negative").max(365, "Due days too large").optional(),
  defaultCurrency: z.enum(["INR", "USD", "EUR", "GBP", "AUD", "CAD", "SGD", "AED"]).optional(),
  timezone: z.string().min(2, "Invalid timezone").optional(),
  dateFormat: z.enum(["DD/MM/YYYY", "MM/DD/YYYY", "YYYY-MM-DD"]).optional(),
  numberFormat: z.enum(["en-IN", "en-US", "de-DE", "fr-FR"]).optional(),
  decimalPrecision: z.number().int().min(0).max(4, "Decimal precision must be 0-4").optional(),
});

export const updateEmailSchema = z.object({
  senderName: z.string().min(2, "Sender name required").optional(),
  senderEmail: z.string().email("Invalid sender email format").optional(),
  replyToEmail: z.string().email("Invalid reply-to email format").nullable().or(z.literal("")).optional(),
  emailSignature: z.string().nullable().optional(),
  defaultEmailFooter: z.string().nullable().optional(),
});

export const updateReminderSchema = z.object({
  autoReminderEnabled: z.boolean().optional(),
  reminderBeforeDueDays: z.number().int().min(0).max(30).optional(),
  reminderAfterDueDays: z.number().int().min(0).max(30).optional(),
  reminderFrequencyDays: z.number().int().min(1).max(30).optional(),
});

export const updateAppearanceSchema = z.object({
  theme: z.enum(["light", "dark", "system"]).optional(),
  defaultTablePageSize: z.number().int().min(5).max(100).optional(),
  defaultDashboardPage: z.string().min(1).optional(),
  defaultLanguage: z.string().min(2).optional(),
});
