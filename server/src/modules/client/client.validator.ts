import { z } from "zod";
import { ClientType, ClientStatus } from "@prisma/client";

// Indian GSTIN 15-character format: 2 digits + 5 letters + 4 digits + 1 letter + 1 char + Z + 1 char
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// Indian PAN 10-character format: 5 letters + 4 digits + 1 letter
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// Phone number format: 10 to 15 digits, optional + prefix
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

export const createClientSchema = z.object({
  companyName: z
    .string({ message: "Company name is required" })
    .trim()
    .min(2, "Company name must be at least 2 characters")
    .max(150, "Company name cannot exceed 150 characters"),

  clientType: z.nativeEnum(ClientType).optional().default(ClientType.BUSINESS),

  contactPerson: z
    .string({ message: "Contact person name is required" })
    .trim()
    .min(2, "Contact person name must be at least 2 characters")
    .max(100, "Contact person name cannot exceed 100 characters"),

  email: z
    .string({ message: "Email is required" })
    .trim()
    .toLowerCase()
    .email("Invalid email address format"),

  phone: z
    .string({ message: "Phone number is required" })
    .trim()
    .regex(PHONE_REGEX, "Phone number must be between 10 and 15 digits"),

  gstNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(GST_REGEX, "Invalid GSTIN format (15 characters required e.g., 22AAAAA0000A1Z5)")
    .optional()
    .nullable()
    .or(z.literal("")),

  panNumber: z
    .string()
    .trim()
    .toUpperCase()
    .regex(PAN_REGEX, "Invalid PAN format (10 characters required e.g., ABCDE1234F)")
    .optional()
    .nullable()
    .or(z.literal("")),

  billingAddress: z.string().trim().max(500, "Billing address cannot exceed 500 characters").optional().nullable(),
  shippingAddress: z.string().trim().max(500, "Shipping address cannot exceed 500 characters").optional().nullable(),
  status: z.nativeEnum(ClientStatus).optional().default(ClientStatus.ACTIVE),
  notes: z.string().trim().max(1000, "Notes cannot exceed 1000 characters").optional().nullable(),
});

export const updateClientSchema = createClientSchema.partial();

export const clientQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  limit: z.coerce.number().int().positive().max(100).optional().default(10),
  search: z.string().trim().optional(),
  status: z.nativeEnum(ClientStatus).optional(),
  clientType: z.nativeEnum(ClientType).optional(),
  isDeleted: z.preprocess((val) => (val === "true" ? true : val === "false" ? false : val), z.boolean()).optional(),
  sortBy: z.enum(["companyName", "createdAt", "status", "email"]).optional().default("createdAt"),
  sortOrder: z.enum(["asc", "desc"]).optional().default("desc"),
});

export type CreateClientInput = z.infer<typeof createClientSchema>;
export type UpdateClientInput = z.infer<typeof updateClientSchema>;
export type ClientQueryInput = z.infer<typeof clientQuerySchema>;
