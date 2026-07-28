import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuthStore } from "../auth.store";
import { verifyOtpApi, resendOtpApi } from "../api/auth.api";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
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
                Two-Factor Verification.
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Enhanced security protection for your organization's financial billing system.
              </p>
            </div>

            <div className="pt-6 space-y-3">
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="p-2 rounded-lg bg-[#FF5400]/15 text-[#FF5400]">
                  <Mail className="w-4 h-4" />
                </div>
                <span>OTP Sent to Registered Email</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="p-2 rounded-lg bg-[#FF5400]/15 text-[#FF5400]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>5-Minute One-Time Code Expiry</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-10 text-xs text-slate-500">
            v0.1 · Foundation build | © {new Date().getFullYear()}  Ledgerly
          </div>
        </div>

        {/* Right Side: Form Card */}
        <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <Card className="border-0 shadow-none p-0">
            <CardHeader className="px-0 pt-0 pb-4 space-y-1">
              <CardTitle className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Enter verification code
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                We sent a 6-digit security code to{" "}
                <span className="font-semibold text-slate-900">{mfaEmail || "your email"}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0 space-y-6">
              {errorMessage && (
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                  <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-red-600" />
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
                    className="w-11 h-13 sm:w-12 sm:h-14 text-center text-xl font-bold text-slate-900 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:border-[#FF5400] focus:ring-2 focus:ring-orange-500/20 focus:outline-none transition-all"
                  />
                ))}
              </div>

              {/* Submit Button */}
              <Button
                onClick={() => handleVerify(otp.join(""))}
                disabled={isLoading || otp.some((d) => !d)}
                className="w-full h-11 bg-[#FF5400] hover:bg-[#EA4D00] text-white font-semibold text-sm rounded-xl shadow-md shadow-orange-500/20"
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
                <p className="text-xs text-slate-500">
                  Didn't receive the code? Check your spam folder or resend.
                </p>
                <div className="flex items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={cooldown > 0 || isResending}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold ${
                      cooldown > 0 || isResending
                        ? "text-slate-400 cursor-not-allowed"
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
              <div className="pt-4 border-t border-slate-100 text-center">
                <Link
                  to="/login"
                  onClick={clearMfaSession}
                  className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Cancel and back to Sign In</span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
