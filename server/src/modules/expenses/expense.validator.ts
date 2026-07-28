import { z } from "zod";
import { ExpenseStatus, ExpensePaymentMethod } from "@prisma/client";

// Category validators
export const createCategorySchema = z.object({
  name: z.string().min(2, "Category name must be at least 2 characters").max(100),
  description: z.string().max(500).optional(),
  color: z.string().regex(/^#([0-9a-fA-F]{3}){1,2}$/, "Invalid color hex code").optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

// Vendor validators
export const createVendorSchema = z.object({
  name: z.string().min(2, "Vendor name must be at least 2 characters").max(150),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z.string().max(20).optional().or(z.literal("")),
  address: z.string().max(500).optional().or(z.literal("")),
  gstNumber: z.string().max(30).optional().or(z.literal("")),
  panNumber: z.string().max(20).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const updateVendorSchema = createVendorSchema.partial();

// Expense validators
export const createExpenseSchema = z.object({
  title: z.string().min(2, "Expense title must be at least 2 characters").max(200),
  categoryId: z.string().min(1, "Category ID is required"),
  vendorId: z.string().optional().or(z.literal("")),
  amount: z.coerce.number().positive("Amount must be a positive number"),
  taxRate: z.coerce.number().min(0, "Tax rate cannot be negative").max(100, "Tax rate cannot exceed 100%").default(0),
  isTaxInclusive: z.coerce.boolean().default(false),
  paymentMethod: z.nativeEnum(ExpensePaymentMethod).default(ExpensePaymentMethod.CASH),
  status: z.nativeEnum(ExpenseStatus).default(ExpenseStatus.PENDING),
  expenseDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)),
  dueDate: z.string().datetime().optional().or(z.string().regex(/^\d{4}-\d{2}-\d{2}/)).or(z.literal("")),
  referenceNumber: z.string().max(100).optional().or(z.literal("")),
  notes: z.string().max(1000).optional().or(z.literal("")),
});

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  vendorId: z.string().nullable().optional(),
  dueDate: z.string().nullable().optional(),
  paidAt: z.string().nullable().optional(),
  referenceNumber: z.string().nullable().optional(),
  notes: z.string().nullable().optional(),
});

export const updateExpenseStatusSchema = z.object({
  status: z.nativeEnum(ExpenseStatus),
  paidAt: z.string().optional(),
});

// Query string validators
export const expenseQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(10),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  vendorId: z.string().optional(),
  status: z.nativeEnum(ExpenseStatus).optional(),
  paymentMethod: z.nativeEnum(ExpensePaymentMethod).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  minAmount: z.coerce.number().optional(),
  maxAmount: z.coerce.number().optional(),
  sortBy: z.enum(["expenseDate", "totalAmount", "title", "createdAt"]).default("expenseDate"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
  includeDeleted: z.coerce.boolean().default(false),
});

export const categoryQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().optional(),
  includeDeleted: z.coerce.boolean().default(false),
});

export const vendorQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(50),
  search: z.string().optional(),
  includeDeleted: z.coerce.boolean().default(false),
});

export const reportQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  categoryId: z.string().optional(),
  vendorId: z.string().optional(),
});
