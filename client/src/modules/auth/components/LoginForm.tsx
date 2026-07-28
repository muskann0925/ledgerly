import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginFormData } from "../schemas/login.schema";
import { useLogin } from "../hooks/useLogin";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle } from "lucide-react";

export const LoginForm: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { login, isLoading, errorMessage, clearError } = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = (data: LoginFormData) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 w-full">
      {/* Global Backend Error Banner */}
      {errorMessage && (
        <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm animate-fade-in">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <p className="font-medium text-xs sm:text-sm">{errorMessage}</p>
          </div>
          <button
            type="button"
            onClick={clearError}
            className="text-red-500 hover:text-red-700 font-bold ml-auto text-xs"
          >
            ✕
          </button>
        </div>
      )}

      {/* Email Field */}
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

      {/* Password Field */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-xs font-semibold uppercase tracking-wider text-slate-600"
          >
            Password
          </label>
          <Link
            to="/forgot-password"
            className="text-xs font-semibold text-[#FF5400] hover:text-[#EA4D00] transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Lock className="h-4 w-4" />
          </div>
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter password"
            disabled={isLoading}
            className={`pl-10 pr-10 ${errors.password ? "border-red-500 focus:ring-red-200" : ""}`}
            {...register("password")}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            tabIndex={-1}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {errors.password && (
          <p className="text-xs text-red-600 font-medium mt-1">
            {errors.password.message}
          </p>
        )}
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-11 bg-[#FF5400] hover:bg-[#EA4D00] text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20"
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            <span>Signing in...</span>
          </>
        ) : (
          <span>Sign In to Ledgerly</span>
        )}
      </Button>
    </form>
  );
};
