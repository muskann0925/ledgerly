import React, { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { resetPasswordApi } from "../api/auth.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
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
      <div className="min-h-screen w-full bg-[#F8F9FA] text-slate-900 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl p-8 text-center space-y-6">
          <div className="w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-slate-900">Invalid Reset Link</h2>
            <p className="text-sm text-slate-500">
              The password reset link is missing a valid security token. Please request a new link.
            </p>
          </div>
          <Link
            to="/forgot-password"
            className="inline-flex items-center justify-center w-full h-11 bg-[#FF5400] hover:bg-[#EA4D00] text-white font-semibold text-sm rounded-xl shadow-md"
          >
            Request New Reset Link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] text-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        {/* Left Side: Brand Showcase */}
        <div className="lg:col-span-6 p-8 lg:p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="absolute -top-24 -left-24 w-72 h-72 bg-[#FF5400]/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-[#FF5400]/15 rounded-full blur-3xl" />

          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#FF5400] flex items-center justify-center shadow-lg shadow-orange-500/30">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white">
                 <span className="text-[#FF5400] font-black">Ledgerly</span>
              </span>
            </div>

            <div className="pt-4 space-y-3">
              <h1 className="text-3xl lg:text-4xl font-extrabold text-white tracking-tight leading-tight">
                Create New Password.
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Ensure your account stays secure by picking a strong, complex password meeting all security requirements.
              </p>
            </div>

            <div className="pt-4 space-y-2.5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Password Policy Requirements
              </p>
              {policyChecks.map((item, idx) => (
                <div key={idx} className="flex items-center gap-2.5 text-xs">
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

          <div className="relative z-10 pt-8 text-xs text-slate-500">
            v0.1 · Foundation build | © {new Date().getFullYear()}  Ledgerly
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <Card className="border-0 shadow-none p-0">
            <CardHeader className="px-0 pt-0 pb-4 space-y-1">
              <CardTitle className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Reset your password
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                Enter your new password below to update your account credentials.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {isSuccess ? (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      <h3 className="font-bold text-base">Password Updated</h3>
                    </div>
                    <p className="text-sm text-emerald-800 leading-relaxed">
                      Your password has been successfully reset. All existing active sessions have been invalidated for your security.
                    </p>
                  </div>

                  <Button
                    onClick={() => navigate("/login")}
                    className="w-full h-11 bg-[#FF5400] hover:bg-[#EA4D00] text-white font-semibold text-sm rounded-xl shadow-md"
                  >
                    Sign In with New Password
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
                  {errorMessage && (
                    <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                      <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
                      <div className="flex-1">
                        <p className="font-medium text-xs sm:text-sm">{errorMessage}</p>
                      </div>
                    </div>
                  )}

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="newPassword"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                      New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-xs text-red-600 font-medium mt-1">
                        {errors.newPassword.message}
                      </p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label
                      htmlFor="confirmPassword"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                      Confirm New Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-xs text-red-600 font-medium mt-1">
                        {errors.confirmPassword.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-11 bg-[#FF5400] hover:bg-[#EA4D00] text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20"
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
