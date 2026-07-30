import { apiClient } from "../../../lib/axios";
import type { LoginFormData } from "../schemas/login.schema";
import type { RegisterFormData } from "../schemas/register.schema";
import type {
  ApiResponse,
  AuthResponseData,
  LoginResponseData,
  User,
  AuthTokens,
  RegistrationStatusData,
} from "../types/auth.types";

export const getRegistrationStatusApi = async (): Promise<
  ApiResponse<RegistrationStatusData>
> => {
  const response = await apiClient.get<ApiResponse<RegistrationStatusData>>(
    "/auth/registration-status"
  );
  return response.data;
};

export const registerApi = async (
  data: RegisterFormData
): Promise<ApiResponse<AuthResponseData>> => {
  const response = await apiClient.post<ApiResponse<AuthResponseData>>(
    "/auth/register",
    data
  );
  return response.data;
};

export const loginApi = async (
  credentials: LoginFormData
): Promise<ApiResponse<LoginResponseData>> => {
  const response = await apiClient.post<ApiResponse<LoginResponseData>>(
    "/auth/login",
    credentials
  );
  return response.data;
};

export const forgotPasswordApi = async (
  email: string
): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>(
    "/auth/forgot-password",
    { email }
  );
  return response.data;
};

export const resetPasswordApi = async (
  token: string,
  newPassword: string
): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>(
    "/auth/reset-password",
    { token, newPassword }
  );
  return response.data;
};

export const sendOtpApi = async (
  mfaToken: string
): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>(
    "/auth/send-otp",
    { mfaToken }
  );
  return response.data;
};

export const resendOtpApi = async (
  mfaToken: string
): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>(
    "/auth/resend-otp",
    { mfaToken }
  );
  return response.data;
};

export const verifyOtpApi = async (
  mfaToken: string,
  otp: string
): Promise<ApiResponse<AuthResponseData>> => {
  const response = await apiClient.post<ApiResponse<AuthResponseData>>(
    "/auth/verify-otp",
    { mfaToken, otp }
  );
  return response.data;
};

export const getMeApi = async (): Promise<ApiResponse<User>> => {
  const response = await apiClient.get<ApiResponse<User>>("/auth/me");
  return response.data;
};

export const logoutApi = async (): Promise<ApiResponse<void>> => {
  const response = await apiClient.post<ApiResponse<void>>("/auth/logout");
  return response.data;
};

export const refreshTokenApi = async (
  refreshToken: string
): Promise<ApiResponse<AuthTokens>> => {
  const response = await apiClient.post<ApiResponse<AuthTokens>>("/auth/refresh", {
    refreshToken,
  });
  return response.data;
};
