import { z } from "zod";

export const registerSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Full name is required")
      .min(2, "Full name must be at least 2 characters long"),
    email: z
      .string()
      .trim()
      .min(1, "Email address is required")
      .email("Invalid email address format"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter (A-Z)")
      .regex(/[a-z]/, "Must contain at least one lowercase letter (a-z)")
      .regex(/[0-9]/, "Must contain at least one number (0-9)")
      .regex(
        /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
        "Must contain at least one special character (!@#$%^&*...)"
      ),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export type RegisterFormData = z.infer<typeof registerSchema>;
