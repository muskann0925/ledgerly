import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { forgotPasswordApi } from "../api/auth.api";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Mail, ArrowLeft, Loader2, CheckCircle2, AlertCircle, Sparkles, ShieldCheck } from "lucide-react";
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types/auth.types";

const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordPage: React.FC = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      await forgotPasswordApi(data.email);
      setIsSuccess(true);
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      if (!error.response) {
        setErrorMessage("Network error. Please check your internet connection.");
      } else {
        setErrorMessage(
          error.response.data?.message || "Failed to process request. Please try again."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

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
              Account Recovery & Security.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Enter your registered email address to receive secure, encrypted password reset instructions.
            </p>
          </div>

          <div className="pt-8 space-y-4">
            <div className="flex items-center gap-3.5 text-slate-300 text-sm font-medium">
              <div className="p-2.5 rounded-xl bg-[#FF5400]/15 text-[#FF5400]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span>Cryptographically Secure Token Hashing</span>
            </div>
            <div className="flex items-center gap-3.5 text-slate-300 text-sm font-medium">
              <div className="p-2.5 rounded-xl bg-[#FF5400]/15 text-[#FF5400]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span>15-Minute Expiration Security Window</span>
            </div>
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
              Forgot password?
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </div>

          {isSuccess ? (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-emerald-900 dark:text-emerald-300 space-y-3">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <h3 className="font-bold text-base">Check your inbox</h3>
                </div>
                <p className="text-sm leading-relaxed">
                  If an account exists with that email, we have sent password reset instructions to your inbox.
                </p>
                <p className="text-xs opacity-80">
                  The link expires in 15 minutes. Be sure to check your spam folder if you don't see it.
                </p>
              </div>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Return to Sign In</span>
              </Link>
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

              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your registered Email"
                    disabled={isLoading}
                    className={`pl-10 ${errors.email ? "border-red-500 focus:ring-red-200" : ""}`}
                    {...register("email")}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                    {errors.email.message}
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
                    <span>Sending reset link...</span>
                  </>
                ) : (
                  <span>Send Reset Link</span>
                )}
              </Button>

              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
