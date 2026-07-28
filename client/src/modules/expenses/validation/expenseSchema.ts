import { z } from "zod";

export const categoryFormSchema = z.object({
  name: z
    .string()
    .min(2, "Category name must be at least 2 characters")
    .max(100, "Category name cannot exceed 100 characters"),
  description: z.string().max(500, "Description cannot exceed 500 characters").optional(),
  color: z
    .string()
    .regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Must be a valid hex color (e.g. #3B82F6)")
    .default("#3B82F6"),
});

export type CategoryFormValues = z.infer<typeof categoryFormSchema>;

export const vendorFormSchema = z.object({
  name: z
    .string()
    .min(2, "Vendor name must be at least 2 characters")
    .max(150, "Vendor name cannot exceed 150 characters"),
  email: z.string().email("Invalid email format").optional().or(z.literal("")),
  phone: z.string().max(20, "Phone number too long").optional().or(z.literal("")),
  address: z.string().max(500, "Address too long").optional().or(z.literal("")),
  gstNumber: z.string().max(30, "GSTIN too long").optional().or(z.literal("")),
  panNumber: z.string().max(20, "PAN number too long").optional().or(z.literal("")),
  notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),
});

export type VendorFormValues = z.infer<typeof vendorFormSchema>;

export const expenseFormSchema = z.object({
  title: z
    .string()
    .min(2, "Expense title must be at least 2 characters")
    .max(200, "Title cannot exceed 200 characters"),
  categoryId: z.string().min(1, "Please select an expense category"),
  vendorId: z.string().optional().or(z.literal("")),
  amount: z.coerce.number().positive("Amount must be greater than 0"),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative").max(100, "Tax rate cannot exceed 100%").default(0),
  isTaxInclusive: z.boolean().default(false),
  paymentMethod: z
    .enum(["CASH", "UPI", "BANK_TRANSFER", "CREDIT_CARD", "DEBIT_CARD", "CHEQUE", "OTHER"])
    .default("CASH"),
  status: z.enum(["PENDING", "PAID", "CANCELLED"]).default("PENDING"),
  expenseDate: z.string().min(1, "Expense date is required"),
  dueDate: z.string().optional().or(z.literal("")),
  referenceNumber: z.string().max(100, "Reference number too long").optional().or(z.literal("")),
  notes: z.string().max(1000, "Notes too long").optional().or(z.literal("")),
});

export type ExpenseFormValues = z.infer<typeof expenseFormSchema>;
