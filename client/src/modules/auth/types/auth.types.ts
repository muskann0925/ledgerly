export type Role = "OWNER" | "ADMIN" | "SALES" | "FINANCE" | "VIEWER";

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  isActive: boolean;
  twoFactorEnabled?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponseData {
  user: User;
  tokens: AuthTokens;
}

export interface MfaRequiredResponseData {
  requires2FA: true;
  mfaToken: string;
  email: string;
}

export type LoginResponseData = AuthResponseData | MfaRequiredResponseData;

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

export interface ApiErrorResponse {
  success: boolean;
  message: string;
  errors?: Array<{ field?: string; message: string }>;
}

export interface RegistrationStatusData {
  registrationAllowed: boolean;
}

