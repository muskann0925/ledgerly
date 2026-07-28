import React, { useState } from "react";
import { Sidebar } from "../components/layout/Sidebar";
import { Header } from "../components/layout/Header";
import { type LucideIcon, Sparkles, ShieldCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ModulePlaceholderPageProps {
  title: string;
  description: string;
  icon: LucideIcon;
  badgeText?: string;
}

export const ModulePlaceholderPage: React.FC<ModulePlaceholderPageProps> = ({
  title,
  description,
  icon: Icon,
  badgeText = "Enterprise Module",
}) => {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-[#111827] dark:text-[#F9FAFB] flex transition-colors duration-200">
      {/* Sidebar */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenCreateInvoice={() => navigate("/dashboard")}
          onOpenCreateClient={() => navigate("/clients")}
          onRefresh={() => {}}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#F97316] text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>{badgeText}</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                <Icon className="w-7 h-7 text-[#F97316]" />
                <span>{title}</span>
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                {description}
              </p>
            </div>
          </div>

          {/* Feature Card Layout */}
          <div className="p-8 sm:p-12 text-center flex flex-col items-center justify-center space-y-5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-[#111827]/60 my-6 shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-[#F97316]">
              <Icon className="w-8 h-8" />
            </div>

            <div className="max-w-md space-y-2">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                {title} Suite Operational
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                This section is configured and fully linked to the Ledgerly routing engine. Active database metrics for clients and real-time financial tracking are ready.
              </p>
            </div>

            <div className="flex items-center gap-3 pt-2">
              {/* <button
                onClick={() => navigate("/clients")}
                className="btn-primary flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl"
              >
                <Layers className="w-4 h-4" />
                <span>Manage Clients</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button> */}

              <button
                onClick={() => navigate("/dashboard")}
                className="btn-secondary flex items-center gap-2 text-xs font-semibold px-4 py-2.5 rounded-xl"
              >
                <Sparkles className="w-4 h-4 text-[#F97316]" />
                <span>Go to Dashboard</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
