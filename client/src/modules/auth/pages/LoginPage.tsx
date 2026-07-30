import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";
import { useAuthStore } from "../auth.store";
import { ShieldCheck, BarChart3, Users, Sparkles, UserPlus, Crown, Info } from "lucide-react";
import { getRegistrationStatusApi } from "../api/auth.api";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [registrationAllowed, setRegistrationAllowed] = useState<boolean | null>(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

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

  const registeredEmail = (location.state as { registeredEmail?: string })?.registeredEmail;

  return (
    <div className="min-h-screen w-full bg-white dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col lg:flex-row">
      {/* Left Side: Brand Showcase */}
      <div className="lg:w-1/2 p-8 lg:p-16 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col justify-between relative overflow-hidden shrink-0 min-h-[300px] lg:min-h-screen">
        {/* Subtle Orange Glow */}
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
              Enterprise Billing Solution.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Empower your organization with real-time analytics, client invoicing, and role-based permissions.
            </p>
          </div>

          <div className="pt-8 space-y-4">
            <div className="flex items-center gap-3.5 text-slate-300 text-sm font-medium">
              <div className="p-2.5 rounded-xl bg-[#FF5400]/15 text-[#FF5400]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span>Real-Time Payment Tracking & Invoice Management</span>
            </div>
            <div className="flex items-center gap-3.5 text-slate-300 text-sm font-medium">
              <div className="p-2.5 rounded-xl bg-[#FF5400]/15 text-[#FF5400]">
                <BarChart3 className="w-5 h-5" />
              </div>
              <span>Powerful Financial Insights & Reporting</span>
            </div>
            <div className="flex items-center gap-3.5 text-slate-300 text-sm font-medium">
              <div className="p-2.5 rounded-xl bg-[#FF5400]/15 text-[#FF5400]">
                <Users className="w-5 h-5" />
              </div>
              <span>Professional Multi-Tenant Invoice Management</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 pt-12 text-xs text-slate-500 font-medium">
          v0.1 · Foundation build | © {new Date().getFullYear()} Ledgerly
        </div>
      </div>

      {/* Right Side: Clean Full-Page Form Section */}
      <div className="lg:w-1/2 p-6 sm:p-12 lg:p-20 flex flex-col justify-center items-center bg-white dark:bg-[#0B0F17]">
        <div className="w-full max-w-md space-y-6">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome back
            </h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">
              Please enter your credentials to sign in
            </p>
          </div>

          <LoginForm initialEmail={registeredEmail} />

          {/* Registration Section */}
          {!checkingStatus && (
            <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
              {registrationAllowed ? (
                <div className="p-4 rounded-2xl bg-orange-50/80 dark:bg-orange-950/20 border border-orange-200/80 dark:border-orange-900/40 space-y-2.5 text-center">
                  <div className="flex items-center justify-center gap-2 text-[#FF5400] font-semibold text-xs uppercase tracking-wider">
                    <Crown className="w-4 h-4" />
                    <span>Account Registration Available</span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 font-medium">
                    Create your account to access the platform
                  </p>
                  <Link
                    to="/register"
                    className="inline-flex items-center justify-center gap-2 w-full py-2.5 px-4 bg-[#FF5400] hover:bg-[#EA4D00] text-white text-xs font-bold rounded-xl transition-all shadow-sm shadow-orange-500/20"
                  >
                    <UserPlus className="w-4 h-4" />
                    <span>Register Account</span>
                  </Link>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 text-xs flex items-center gap-2.5 justify-center">
                  <Info className="w-4 h-4 text-slate-400 shrink-0" />
                  <span>Registration is disabled. Please contact your administrator.</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
