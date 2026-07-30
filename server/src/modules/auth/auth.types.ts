import { Role } from "@prisma/client";
import { z } from "zod";
import {
  registerSchema,
  loginSchema,
  refreshTokenSchema,
} from "./auth.validator";

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>;

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponseData {
  user: UserResponse;
  tokens: AuthTokens;
}

export interface MfaRequiredResponseData {
  requires2FA: true;
  mfaToken: string;
  email: string;
}

export type LoginResult = AuthResponseData | MfaRequiredResponseData;

export interface AuthUserPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface VerifyOtpInput {
  mfaToken: string;
  otp: string;
}

export interface ResendOtpInput {
  mfaToken: string;
}

export interface RegistrationStatusResponse {
  registrationAllowed: boolean;
}

