import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../auth.store";
import { verifyOtpApi, resendOtpApi } from "../api/auth.api";
import { Button } from "../../../components/ui/button";
import { Loader2, AlertCircle, ShieldCheck, Sparkles, ArrowLeft, RefreshCw, Mail } from "lucide-react";
import { AxiosError } from "axios";
import type { ApiErrorResponse } from "../types/auth.types";
import { toast } from "sonner";

export const OtpVerificationPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const mfaToken = useAuthStore((state) => state.mfaToken);
  const mfaEmail = useAuthStore((state) => state.mfaEmail);
  const setAuth = useAuthStore((state) => state.setAuth);
  const clearMfaSession = useAuthStore((state) => state.clearMfaSession);

  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(60);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const from = location.state?.from || "/dashboard";

  useEffect(() => {
    if (!mfaToken) {
      navigate("/login", { replace: true });
    }
  }, [mfaToken, navigate]);

  // 60-second Countdown Timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    setErrorMessage(null);

    // Auto-advance focus
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-submit if all 6 digits entered
    if (newOtp.every((digit) => digit !== "")) {
      handleVerify(newOtp.join(""));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{6}$/.test(pastedData)) return;

    const newOtp = pastedData.split("");
    setOtp(newOtp);
    setErrorMessage(null);
    inputRefs.current[5]?.focus();
    handleVerify(pastedData);
  };

  const handleVerify = async (otpCode: string) => {
    if (!mfaToken) return;

    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await verifyOtpApi(mfaToken, otpCode);
      const { user, tokens } = response.data;
      
      toast.success("Authentication successful! Welcome back.", {
        className: "bg-white border-slate-200 text-slate-900 shadow-xl dark:bg-[#111827] dark:border-slate-800 dark:text-slate-100 dark:shadow-2xl",
      });

      setAuth(user, tokens);
      navigate(from, { replace: true });
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      if (!error.response) {
        setErrorMessage("Network error. Please check your internet connection.");
      } else {
        setErrorMessage(
          error.response.data?.message || "Invalid or expired verification code."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!mfaToken || cooldown > 0 || isResending) return;

    setIsResending(true);
    setErrorMessage(null);
    try {
      await resendOtpApi(mfaToken);
      toast.success("A new 6-digit verification code has been sent to your email.", {
        className: "bg-white border-slate-200 text-slate-900 shadow-xl dark:bg-[#111827] dark:border-slate-800 dark:text-slate-100 dark:shadow-2xl",
      });
      setCooldown(60);
      setOtp(Array(6).fill(""));
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const error = err as AxiosError<ApiErrorResponse>;
      if (!error.response) {
        setErrorMessage("Network error. Please check your internet connection.");
      } else {
        setErrorMessage(
          error.response.data?.message || "Could not resend verification code. Please try again."
        );
      }
    } finally {
      setIsResending(false);
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
              Two-Factor Verification.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Enhanced security protection for your organization's financial billing system.
            </p>
          </div>

          <div className="pt-8 space-y-4">
            <div className="flex items-center gap-3.5 text-slate-300 text-sm font-medium">
              <div className="p-2.5 rounded-xl bg-[#FF5400]/15 text-[#FF5400]">
                <Mail className="w-5 h-5" />
              </div>
              <span>OTP Code Sent to Registered Email</span>
            </div>
            <div className="flex items-center gap-3.5 text-slate-300 text-sm font-medium">
              <div className="p-2.5 rounded-xl bg-[#FF5400]/15 text-[#FF5400]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span>5-Minute One-Time Code Expiration Window</span>
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
              Enter verification code
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              We sent a 6-digit security code to{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-200">{mfaEmail || "your email"}</span>.
            </p>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-sm">
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
              <div className="flex-1">
                <p className="font-medium text-xs sm:text-sm">{errorMessage}</p>
              </div>
            </div>
          )}

          {/* 6-Digit OTP Inputs */}
          <div className="flex items-center justify-between gap-2 sm:gap-3">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={(el) => {
                  inputRefs.current[idx] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(idx, e.target.value)}
                onKeyDown={(e) => handleKeyDown(idx, e)}
                onPaste={handlePaste}
                disabled={isLoading}
                className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold bg-white dark:bg-[#111827] text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-800 rounded-xl focus:border-[#FF5400] focus:ring-2 focus:ring-[#FF5400]/20 focus:outline-none transition-all dark:[&:-webkit-autofill]:[box-shadow:0_0_0_1000px_#111827_inset] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:white]"
              />
            ))}
          </div>

          {/* Submit Button */}
          <Button
            onClick={() => handleVerify(otp.join(""))}
            disabled={isLoading || otp.some((d) => !d)}
            className="w-full h-11 bg-[#FF5400] hover:bg-[#EA4D00] text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20 transition-all mt-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                <span>Verifying OTP...</span>
              </>
            ) : (
              <span>Verify & Sign In</span>
            )}
          </Button>

          {/* Resend Cooldown Section */}
          <div className="pt-2 text-center space-y-2">
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Didn't receive the code? Check your spam folder or resend.
            </p>
            <div className="flex items-center justify-center gap-2">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={cooldown > 0 || isResending}
                className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                  cooldown > 0 || isResending
                    ? "text-slate-400 dark:text-slate-600 cursor-not-allowed"
                    : "text-[#FF5400] hover:text-[#EA4D00] cursor-pointer"
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResending ? "animate-spin" : ""}`} />
                <span>
                  {cooldown > 0 ? `Resend Code in ${cooldown}s` : "Resend Verification Code"}
                </span>
              </button>
            </div>
          </div>

          {/* Cancel / Back Link */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-center">
            <Link
              to="/login"
              onClick={clearMfaSession}
              className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Cancel and back to Sign In</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
