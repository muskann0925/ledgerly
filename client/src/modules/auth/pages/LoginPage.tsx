import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { LoginForm } from "../components/LoginForm";
import { useAuthStore } from "../auth.store";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../../../components/ui/card";
import { ShieldCheck, BarChart3, Users, Sparkles } from "lucide-react";

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] text-slate-900 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 bg-white rounded-3xl border border-slate-200/80 shadow-xl overflow-hidden">
        {/* Left Side: Brand Showcase */}
        <div className="lg:col-span-6 p-8 lg:p-12 bg-gradient-to-br from-slate-900 via-slate-900 to-slate-950 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Orange Glow */}
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
                Enterprise Billing Solution.
              </h1>
              <p className="text-slate-400 text-sm leading-relaxed">
                Empower your organization with real-time analytics, escrow management, client invoicing, and role-based permissions.
              </p>
            </div>

            <div className="pt-6 space-y-3">
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="p-2 rounded-lg bg-[#FF5400]/15 text-[#FF5400]">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <span>Real-Time Payment Tracking</span>
              </div>
              <div className="flex items-center gap-[#FF5400] text-slate-300 text-sm flex gap-3">
                <div className="p-2 rounded-lg bg-[#FF5400]/15 text-[#FF5400]">
                  <BarChart3 className="w-4 h-4" />
                </div>
                <span>Powerful Financial Insights</span>
              </div>
              <div className="flex items-center gap-3 text-slate-300 text-sm">
                <div className="p-2 rounded-lg bg-[#FF5400]/15 text-[#FF5400]">
                  <Users className="w-4 h-4" />
                </div>
                <span>Professional Invoice Management</span>
              </div>
            </div>
          </div>

          <div className="relative z-10 pt-10 text-xs text-slate-500">
            v0.1 · Foundation build | © {new Date().getFullYear()}  Ledgerly
          </div>
        </div>

        {/* Right Side: Login Card */}
        <div className="lg:col-span-6 p-6 sm:p-10 lg:p-12 flex flex-col justify-center bg-white">
          <Card className="border-0 shadow-none p-0">
            <CardHeader className="px-0 pt-0 pb-4 space-y-1">
              <CardTitle className="text-2xl font-extrabold text-slate-900 tracking-tight">
                Welcome back
              </CardTitle>
              <CardDescription className="text-slate-500 text-sm">
                Please enter your admin credentials to sign in
              </CardDescription>
            </CardHeader>
            <CardContent className="px-0 pb-0">
              <LoginForm />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
