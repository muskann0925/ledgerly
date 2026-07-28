import { z } from "zod";
import { Role } from "@prisma/client";

export const createUserSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  phone: z.string().min(5, "Invalid phone number").nullable().optional(),
  profileImage: z.string().nullable().optional(),
  role: z.nativeEnum(Role).optional(),
  department: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
});

export const updateUserSchema = z.object({
  name: z.string().min(2, "Full name must be at least 2 characters").optional(),
  email: z.string().email("Invalid email address").optional(),
  phone: z.string().nullable().optional(),
  profileImage: z.string().nullable().optional(),
  department: z.string().nullable().optional(),
  isActive: z.boolean().optional(),
  twoFactorEnabled: z.boolean().optional(),
});

export const changeRoleSchema = z.object({
  role: z.nativeEnum(Role),
});

export const changeStatusSchema = z.object({
  isActive: z.boolean(),
});

export const toggle2FaSchema = z.object({
  twoFactorEnabled: z.boolean(),
});

export const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
