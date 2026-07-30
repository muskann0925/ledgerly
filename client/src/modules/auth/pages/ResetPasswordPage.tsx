import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resetPasswordApi } from "../api/auth.api";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, Sparkles, Check, X } from "lucide-react";
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types/auth.types";

const resetPasswordSchema = z
  .object({
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/, "Must contain at least one special character"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

export const ResetPasswordPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
  });

  const passwordValue = watch("newPassword", "");

  const policyChecks = [
    { label: "At least 8 characters", met: passwordValue.length >= 8 },
    { label: "One uppercase letter (A-Z)", met: /[A-Z]/.test(passwordValue) },
    { label: "One lowercase letter (a-z)", met: /[a-z]/.test(passwordValue) },
    { label: "One number (0-9)", met: /[0-9]/.test(passwordValue) },
    { label: "One special character (!@#$%^&*)", met: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(passwordValue) },
  ];

  const onSubmit = async (data: ResetPasswordFormData) => {
    if (!token) {
      setErrorMessage("Reset token is missing from the URL.");
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);
    try {
      await resetPasswordApi(token, data.newPassword);
      setIsSuccess(true);
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      if (!error.response) {
        setErrorMessage("Network error. Please check your internet connection.");
      } else {
        setErrorMessage(
          error.response.data?.message || "Invalid or expired password reset link."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen w-full bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6 text-center">
          <div className="w-14 h-14 rounded-2xl bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-7 h-7" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Invalid Reset Link</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              The password reset link is missing a valid security token. Please request a new link.
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center w-full h-11 bg-[#FF5400] hover:bg-[#EA4D00] text-white font-semibold text-sm rounded-xl shadow-md transition-all"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row">
      {/* Left Side: Brand Showcase */}
      <div className="lg:w-1/2 p-8 lg:p-16 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col justify-between relative overflow-hidden shrink-0 min-h-[300px] lg:min-h-screen">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-[#FF5400]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-[#FF5400]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-8">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FF5400] flex items-center justify-center shadow-lg shadow-orange-500/30">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-white">
              <span className="text-[#FF5400] font-black">Ledgerly</span>
            </span>
          </div>

          <div className="pt-6 space-y-4 max-w-lg">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Create New Password.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Ensure your account stays secure by picking a strong, complex password meeting all security requirements.
            </p>
          </div>

          <div className="pt-6 space-y-3">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Password Policy Requirements
            </p>
            {policyChecks.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2.5 text-xs font-medium">
                <div
                  className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 ${
                    item.met ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-800 text-slate-500"
                  }`}
                >
                  {item.met ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                </div>
                <span className={item.met ? "text-emerald-300 font-medium" : "text-slate-400"}>
                  {item.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 pt-12 text-xs text-slate-500 font-medium">
          v0.1 · Foundation build | © {new Date().getFullYear()} Ledgerly
        </div>
      </div>

      {/* Right Side: Form */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-20 flex flex-col justify-center items-center bg-white dark:bg-[#0B0F17]">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Reset your password
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Enter your new password below to update your account credentials.
            </p>
          </div>

          {isSuccess ? (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <h3 className="font-bold text-base">Password Updated</h3>
                </div>
                <p className="text-sm leading-relaxed">
                  Your password has been successfully reset. All existing active sessions have been invalidated for your security.
                </p>
              </div>

              <Button
                onClick={() => navigate("/login")}
                className="w-full h-11 bg-[#FF5400] hover:bg-[#EA4D00] text-white font-semibold text-sm rounded-xl shadow-md transition-all"
              >
                Sign In with New Password
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
              {errorMessage && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <div className="flex-1">
                    <p className="font-medium text-xs sm:text-sm">{errorMessage}</p>
                  </div>
                </div>
              )}

              {/* New Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="newPassword"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter strong new password"
                    disabled={isLoading}
                    className={`pl-10 pr-10 ${errors.newPassword ? "border-red-500 focus:ring-red-200" : ""}`}
                    {...register("newPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.newPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                    {errors.newPassword.message}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Confirm New Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter new password"
                    disabled={isLoading}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500 focus:ring-red-200" : ""}`}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#FF5400] hover:bg-[#EA4D00] text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20 transition-all mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Updating password...</span>
                  </>
                ) : (
                  <span>Reset Password</span>
                )}
              </Button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
