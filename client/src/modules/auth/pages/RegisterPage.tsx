import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterFormData } from "../schemas/register.schema";
import { registerApi, getRegistrationStatusApi } from "../api/auth.api";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  User as UserIcon,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Crown,
  CheckCircle2,
} from "lucide-react";
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types/auth.types";
import { toast } from "sonner";
import { useAuthStore } from "../auth.store";

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [checkingStatus, setCheckingStatus] = useState(true);
  const [registrationAllowed, setRegistrationAllowed] = useState<boolean | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
      return;
    }

    const checkStatus = async () => {
      try {
        const response = await getRegistrationStatusApi();
        setRegistrationAllowed(response.data.registrationAllowed);
      } catch (err) {
        console.error("Failed to check registration status:", err);
        setRegistrationAllowed(false);
      } finally {
        setCheckingStatus(false);
      }
    };

    checkStatus();
  }, [isAuthenticated, navigate]);

  const onSubmit = async (data: RegisterFormData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await registerApi(data);
      toast.success("Owner account created successfully!", {
        description: "Please sign in with your credentials.",
      });

      // Navigate to login page
      navigate("/login", {
        replace: true,
        state: { registeredEmail: data.email },
      });
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      const msg =
        error.response?.data?.message ||
        "Registration failed. Please check your details and try again.";
      setErrorMessage(msg);
      toast.error("Registration failed", {
        description: msg,
      });
    } finally {
      setIsSubmitting(false);
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
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FF5400]/15 border border-[#FF5400]/30 text-[#FF5400] text-xs font-semibold">
              <Crown className="w-4 h-4" />
              <span>First-Time Workspace Setup</span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              Create First Owner Account.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Initialize your billing platform workspace. The first registered user automatically gains full Owner privileges.
            </p>
          </div>

          <div className="pt-8 space-y-4">
            <div className="flex items-center gap-3.5 text-slate-300 text-sm font-medium">
              <div className="p-2.5 rounded-xl bg-[#FF5400]/15 text-[#FF5400]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span>Full System Owner Access</span>
            </div>
            <div className="flex items-center gap-3.5 text-slate-300 text-sm font-medium">
              <div className="p-2.5 rounded-xl bg-[#FF5400]/15 text-[#FF5400]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span>User Management & Role Governance</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-12 text-xs text-slate-500 font-medium">
          v0.1 · Foundation build | © {new Date().getFullYear()} Ledgerly
        </div>
      </div>

      {/* Right Side: Registration Form */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-20 flex flex-col justify-center items-center bg-white dark:bg-[#0B0F17]">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <span>Setup Owner Account</span>
              <Crown className="w-6 h-6 text-amber-500" />
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Enter your details to create the initial administrator account.
            </p>
          </div>

          {checkingStatus ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 space-y-3">
              <Loader2 className="w-8 h-8 animate-spin text-[#FF5400]" />
              <p className="text-sm font-medium">Checking workspace status...</p>
            </div>
          ) : registrationAllowed === false ? (
            /* Registration Disabled Banner */
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40 text-amber-900 dark:text-amber-300 space-y-3">
                <div className="flex items-center gap-3">
                  <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400 shrink-0" />
                  <h3 className="font-bold text-base">Registration Disabled</h3>
                </div>
                <p className="text-sm leading-relaxed">
                  Registration is disabled. Please contact the administrator.
                </p>
                <p className="text-xs opacity-80">
                  An owner account already exists for this system. Additional accounts must be provisioned through User Management by an Owner or Admin.
                </p>
              </div>

              <Link
                to="/login"
                className="flex items-center justify-center gap-2 w-full h-11 bg-slate-900 hover:bg-slate-800 dark:bg-slate-800 dark:hover:bg-slate-700 text-white font-semibold text-sm rounded-xl transition-all"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back to Sign In</span>
              </Link>
            </div>
          ) : (
            /* Active Registration Form */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
              {errorMessage && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
                  <div className="flex-1">
                    <p className="font-medium text-xs sm:text-sm">{errorMessage}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setErrorMessage(null)}
                    className="text-red-500 hover:text-red-700 dark:hover:text-red-300 font-bold ml-auto text-xs"
                  >
                    ✕
                  </button>
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1.5">
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Full Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <UserIcon className="h-4 w-4" />
                  </div>
                  <Input
                    id="name"
                    type="text"
                    placeholder="e.g. Alexander Wright"
                    disabled={isSubmitting}
                    className={`pl-10 ${errors.name ? "border-red-500 focus:ring-red-200" : ""}`}
                    {...register("name")}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Email Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Work Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Mail className="h-4 w-4" />
                  </div>
                  <Input
                    id="email"
                    type="email"
                    placeholder="owner@company.com"
                    disabled={isSubmitting}
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

              {/* Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Min. 8 chars, 1 upper, 1 number, 1 symbol"
                    disabled={isSubmitting}
                    className={`pl-10 pr-10 ${errors.password ? "border-red-500 focus:ring-red-200" : ""}`}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-1.5">
                <label
                  htmlFor="confirmPassword"
                  className="block text-xs font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-400"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                    <Lock className="h-4 w-4" />
                  </div>
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="Re-enter password"
                    disabled={isSubmitting}
                    className={`pl-10 pr-10 ${errors.confirmPassword ? "border-red-500 focus:ring-red-200" : ""}`}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    tabIndex={-1}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 focus:outline-none"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="text-xs text-red-600 dark:text-red-400 font-medium mt-1">
                    {errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 bg-[#FF5400] hover:bg-[#EA4D00] text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20 transition-all mt-2"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    <span>Creating Owner Account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </Button>

              {/* Back to Login Link */}
              <div className="pt-2 text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
