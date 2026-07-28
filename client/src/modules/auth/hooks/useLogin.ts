import { useMutation } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { loginApi } from "../api/auth.api";
import type { LoginFormData } from "../schemas/login.schema";
import { useAuthStore } from "../auth.store";
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types/auth.types";
import { useState } from "react";

export const useLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const setAuth = useAuthStore((state) => state.setAuth);
  const setMfaSession = useAuthStore((state) => state.setMfaSession);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const defaultLanding = localStorage.getItem("defaultDashboardPage") || "/dashboard";
  const from = location.state?.from?.pathname || defaultLanding;

  const mutation = useMutation({
    mutationFn: (credentials: LoginFormData) => loginApi(credentials),
    onMutate: () => {
      setErrorMessage(null);
    },
    onSuccess: (response) => {
      const data = response.data;
      if ("requires2FA" in data && data.requires2FA) {
        setMfaSession(data.mfaToken, data.email);
        navigate("/verify-otp", { replace: true, state: { from } });
      } else if ("user" in data && "tokens" in data) {
        setAuth(data.user, data.tokens);
        navigate(from, { replace: true });
      }
    },
    onError: (error: AxiosError<ApiErrorResponse>) => {
      if (!error.response) {
        setErrorMessage("Network error. Please check your internet connection.");
      } else if (error.response.status === 401) {
        setErrorMessage(
          error.response.data?.message || "Invalid email or password."
        );
      } else if (error.response.status === 403) {
        setErrorMessage(
          error.response.data?.message ||
            "Your account is inactive. Please contact support."
        );
      } else if (error.response.status === 400 && error.response.data?.errors) {
        const firstError = error.response.data.errors[0]?.message;
        setErrorMessage(firstError || "Validation error occurred.");
      } else {
        setErrorMessage(
          error.response.data?.message ||
            "An unexpected error occurred. Please try again later."
        );
      }
    },
  });

  return {
    login: mutation.mutate,
    isLoading: mutation.isPending,
    isError: mutation.isError,
    errorMessage,
    clearError: () => setErrorMessage(null),
  };
};
