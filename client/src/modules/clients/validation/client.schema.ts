import { z } from "zod";

// Indian GSTIN 15-character format: 2 digits + 5 letters + 4 digits + 1 letter + 1 char + Z + 1 char
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

// Indian PAN 10-character format: 5 letters + 4 digits + 1 letter
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

// Phone number format: 10 to 15 digits, optional + prefix
const PHONE_REGEX = /^\+?[0-9]{10,15}$/;

export const clientFormSchema = z.object({
  companyName: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(1, "Company name is required")
        .min(2, "Company name must be at least 2 characters")
        .max(150, "Company name cannot exceed 150 characters")
    ),

  clientType: z.enum(["BUSINESS", "INDIVIDUAL"]),

  contactPerson: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(1, "Contact person name is required")
        .min(2, "Contact person name must be at least 2 characters")
        .max(100, "Contact person name cannot exceed 100 characters")
    ),

  email: z
    .string()
    .transform((val) => val.trim().toLowerCase())
    .pipe(
      z
        .string()
        .min(1, "Email address is required")
        .email("Invalid email address format")
    ),

  phone: z
    .string()
    .transform((val) => val.trim())
    .pipe(
      z
        .string()
        .min(1, "Phone number is required")
        .regex(PHONE_REGEX, "Phone number must be between 10 and 15 digits")
    ),

  gstNumber: z
    .string()
    .transform((val) => (val ? val.trim().toUpperCase() : ""))
    .pipe(
      z
        .string()
        .refine(
          (val) => !val || GST_REGEX.test(val),
          "Invalid GSTIN format (15 characters required e.g., 22AAAAA0000A1Z5)"
        )
    )
    .optional(),

  panNumber: z
    .string()
    .transform((val) => (val ? val.trim().toUpperCase() : ""))
    .pipe(
      z
        .string()
        .refine(
          (val) => !val || PAN_REGEX.test(val),
          "Invalid PAN format (10 characters required e.g., ABCDE1234F)"
        )
    )
    .optional(),

  billingAddress: z
    .string()
    .transform((val) => (val ? val.trim() : ""))
    .pipe(
      z.string().max(500, "Billing address cannot exceed 500 characters")
    )
    .optional(),

  shippingAddress: z
    .string()
    .transform((val) => (val ? val.trim() : ""))
    .pipe(
      z.string().max(500, "Shipping address cannot exceed 500 characters")
    )
    .optional(),

  status: z.enum(["ACTIVE", "INACTIVE"]),

  notes: z
    .string()
    .transform((val) => (val ? val.trim() : ""))
    .pipe(
      z.string().max(1000, "Notes cannot exceed 1000 characters")
    )
    .optional(),
});

export type ClientFormValues = z.infer<typeof clientFormSchema>;
