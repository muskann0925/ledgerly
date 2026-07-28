import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { forgotPasswordApi } from "../api/auth.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
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
                Account Recovery & Security.
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Enter your registered email address to receive secure, encrypted password reset instructions.
              </p>
            </div>

            <div className="pt-6 space-y-3">
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="p-2 rounded-lg bg-[#FF5400]/15 text-[#FF5400]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Cryptographically Secure Token Hashing</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="p-2 rounded-lg bg-[#FF5400]/15 text-[#FF5400]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>15-Minute Expiration Security Window</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-10 text-xs text-slate-500">
            v0.1 · Foundation build | © {new Date().getFullYear()} Ledgerly
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <Card className="border-0 shadow-none p-0">
            <CardHeader className="px-0 pt-0 pb-4 space-y-1">
              <CardTitle className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Forgot password?
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                No worries! Enter your email and we'll send you reset instructions.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              {isSuccess ? (
                <div className="space-y-6">
                  <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      <h3 className="font-bold text-base">Check your inbox</h3>
                    </div>
                    <p className="text-sm text-emerald-800 leading-relaxed">
                      If an account exists with that email, we have sent password reset instructions to your inbox.
                    </p>
                    <p className="text-xs text-emerald-700">
                      The link expires in 15 minutes. Be sure to check your spam folder if you don't see it.
                    </p>
                  </div>

                  <Link
                    to="/login"
                    className="flex items-center justify-center gap-2 w-full h-11 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Return to Sign In</span>
                  </Link>
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

                  <div className="space-y-1.5">
                    <label
                      htmlFor="email"
                      className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                      <p className="text-xs text-red-600 font-medium mt-1">
                        {errors.email.message}
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
                        <span>Sending reset link...</span>
                      </>
                    ) : (
                      <span>Send Reset Link</span>
                    )}
                  </Button>

                  <div className="pt-2 text-center">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      <span>Back to Sign In</span>
                    </Link>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
