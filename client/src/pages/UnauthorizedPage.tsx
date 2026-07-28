import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ShieldAlert, ArrowLeft, Lock, LayoutDashboard } from "lucide-react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { Button } from "../components/ui/button";
import { useAuthStore } from "../modules/auth/auth.store";

export const UnauthorizedPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const { user } = useAuthStore();
  const role = user?.role || "GUEST";

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased overflow-hidden select-none">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-md w-full text-center space-y-6 bg-white dark:bg-[#111827] p-8 sm:p-10 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl animate-in zoom-in-95 duration-200">
            {/* Top Icon Badge */}
            <div className="relative mx-auto w-20 h-20 rounded-3xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 flex items-center justify-center shadow-lg shadow-rose-500/10">
              <ShieldAlert className="w-10 h-10 text-rose-600 dark:text-rose-400" />
              <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-xl bg-[#F97316] text-white flex items-center justify-center shadow-md">
                <Lock className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Error Code & Text */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300">
                Error Code: 403 Forbidden
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                Unauthorized Access
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto">
                You are not authorized to view this page or perform this action. Permission is restricted based on your assigned organizational role.
              </p>
            </div>

            {/* Current Role Banner */}
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs">
              <span className="font-semibold text-slate-500 dark:text-slate-400">Assigned Access Role:</span>
              <span className="px-2.5 py-0.5 rounded-md font-extrabold uppercase text-[11px] bg-orange-100 dark:bg-orange-950/80 text-[#F97316]">
                {role}
              </span>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto h-10 px-5 text-xs font-bold bg-[#F97316] hover:bg-orange-600 text-white rounded-xl shadow-md shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
              >
                <LayoutDashboard className="w-4 h-4" />
                <span>Back to Dashboard</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => navigate(-1)}
                className="w-full sm:w-auto h-10 px-4 text-xs font-semibold rounded-xl border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Previous Page</span>
              </Button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default UnauthorizedPage;
