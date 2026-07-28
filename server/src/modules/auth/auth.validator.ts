import { z } from "zod";
import { Request, Response, NextFunction } from "express";
import { Role } from "@prisma/client";

export const registerSchema = z.object({
  name: z.string().trim().min(2, "Name must be at least 2 characters long"),
  email: z.string().trim().email("Invalid email address format"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
  role: z
    .enum(["SALES", "FINANCE", "VIEWER"])
    .optional()
    .default("VIEWER"),
});

export const loginSchema = z.object({
  email: z.string().trim().email("Invalid email address format"),
  password: z.string().min(1, "Password is required"),
});

export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, "Refresh token is required"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Invalid email address format"),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(
      /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/,
      "Password must contain at least one special character"
    ),
});

export const verifyOtpSchema = z.object({
  mfaToken: z.string().min(1, "MFA token is required"),
  otp: z
    .string()
    .trim()
    .length(6, "OTP must be exactly 6 digits")
    .regex(/^\d+$/, "OTP must contain numbers only"),
});

export const resendOtpSchema = z.object({
  mfaToken: z.string().min(1, "MFA token is required"),
});


export const validate = (schema: z.ZodSchema) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      req.body = schema.parse(req.body);
      next();
    } catch (error) {
      next(error);
    }
  };
};
