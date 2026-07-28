import { z } from "zod";
import { TaxType, TaxValueType, TaxCalculationType } from "@prisma/client";

export const createTaxSchema = z
  .object({
    name: z.string().min(2, "Tax name must be at least 2 characters").max(100, "Tax name cannot exceed 100 characters"),
    code: z
      .string()
      .min(2, "Tax code must be at least 2 characters")
      .max(50, "Tax code cannot exceed 50 characters")
      .transform((val) => val.toUpperCase().trim()),
    type: z.nativeEnum(TaxType).default(TaxType.GST),
    category: z.string().optional().nullable(),
    valueType: z.nativeEnum(TaxValueType).default(TaxValueType.PERCENTAGE),
    calculationType: z.nativeEnum(TaxCalculationType).default(TaxCalculationType.ADD),
    rate: z.number().min(0, "Tax rate/value cannot be negative"),
    country: z.string().optional().nullable().default("India"),
    state: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    isDefault: z.boolean().optional().default(false),
    effectiveFrom: z.string().optional().nullable(),
    effectiveTo: z.string().optional().nullable(),
    applicableModules: z
      .array(z.string())
      .optional()
      .default(["INVOICE", "QUOTATION", "EXPENSE", "CREDIT_NOTE"]),
  })
  .refine(
    (data) => {
      if (data.valueType === TaxValueType.PERCENTAGE && data.rate > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage tax rate cannot exceed 100%",
      path: ["rate"],
    }
  );

export const updateTaxSchema = z
  .object({
    name: z.string().min(2).max(100).optional(),
    code: z
      .string()
      .min(2)
      .max(50)
      .transform((val) => val.toUpperCase().trim())
      .optional(),
    type: z.nativeEnum(TaxType).optional(),
    category: z.string().optional().nullable(),
    valueType: z.nativeEnum(TaxValueType).optional(),
    calculationType: z.nativeEnum(TaxCalculationType).optional(),
    rate: z.number().min(0).optional(),
    country: z.string().optional().nullable(),
    state: z.string().optional().nullable(),
    description: z.string().optional().nullable(),
    isActive: z.boolean().optional(),
    isDefault: z.boolean().optional(),
    effectiveFrom: z.string().optional().nullable(),
    effectiveTo: z.string().optional().nullable(),
    applicableModules: z.array(z.string()).optional(),
  })
  .refine(
    (data) => {
      if (data.valueType === TaxValueType.PERCENTAGE && data.rate !== undefined && data.rate > 100) {
        return false;
      }
      return true;
    },
    {
      message: "Percentage tax rate cannot exceed 100%",
      path: ["rate"],
    }
  );

const taxItemSchema = z.object({
  description: z.string().optional(),
  quantity: z.number().min(0).default(1),
  unitPrice: z.number().min(0).default(0),
  taxIds: z.array(z.string()).optional(),
});

export const calculateTaxSchema = z.object({
  items: z.array(taxItemSchema).optional(),
  taxIds: z.array(z.string()).optional(),
});

export const taxQuerySchema = z.object({
  page: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z.string().optional().transform((val) => (val ? parseInt(val, 10) : 10)),
  search: z.string().optional(),
  type: z.nativeEnum(TaxType).optional(),
  calculationType: z.nativeEnum(TaxCalculationType).optional(),
  isActive: z
    .string()
    .optional()
    .transform((val) => (val === "true" ? true : val === "false" ? false : undefined)),
  module: z.string().optional(),
  country: z.string().optional(),
  state: z.string().optional(),
  sortBy: z.enum(["name", "code", "rate", "createdAt"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});
