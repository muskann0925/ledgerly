import React, { useState } from "react";
import { useSettingsQuery } from "../hooks/useSettings";
import { useAuthStore } from "../../auth/auth.store";
import { Sidebar } from "../../../components/layout/Sidebar";
import { Header } from "../../../components/layout/Header";
import { CompanyTab } from "../components/CompanyTab";
import { InvoiceTab } from "../components/InvoiceTab";
import { AppearanceTab } from "../components/AppearanceTab";
import {
  Building2,
  Receipt,
  Palette,
  ShieldCheck,
} from "lucide-react";

type SettingsTab = "company" | "invoice" | "appearance";

export const SettingsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>("company");
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const { data: settingsData, isLoading, isError, error } = useSettingsQuery();
  const { user } = useAuthStore();

  const userRole = user?.role || "OWNER";
  const canEdit = ["OWNER", "ADMIN"].includes(userRole);

  const settings = settingsData?.data;

  const tabs: { id: SettingsTab; label: string; icon: React.ElementType }[] = [
    { id: "company", label: "Company Profile", icon: Building2 },
    { id: "invoice", label: "Invoice & Billing", icon: Receipt },
    { id: "appearance", label: "Appearance", icon: Palette },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0B0F17] overflow-hidden">
      <Sidebar
        activeTab="settings"
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 text-[#F97316] flex items-center justify-center shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Application Settings
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate max-w-xl">
                  Centralized management for organization branding, invoice numbering and interface themes.
                </p>
              </div>
            </div>

            {!canEdit && (
              <div className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 text-xs font-semibold border border-amber-200 dark:border-amber-900/40 shrink-0 self-start sm:self-auto">
                <ShieldCheck className="w-4 h-4 text-amber-500" />
                <span>Read-Only View (Requires Owner or Admin Role)</span>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200 dark:border-slate-800 no-scrollbar">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-t-xl text-xs font-bold transition-all shrink-0 border-b-2 ${
                    isActive
                      ? "border-[#F97316] text-[#F97316] bg-orange-50/50 dark:bg-orange-950/20"
                      : "border-transparent text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/50"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#F97316]" : "text-slate-400"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Main Tab Content Card */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
            {isLoading ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 rounded-full border-2 border-t-[#F97316] border-slate-200 dark:border-slate-800 animate-spin" />
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Loading system settings...
                </span>
              </div>
            ) : isError || !settings ? (
              <div className="py-12 text-center space-y-2">
                <p className="text-sm font-bold text-rose-600 dark:text-rose-400">
                  Failed to load settings from server.
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {(error as any)?.message || "Please check your network connection or backend state."}
                </p>
              </div>
            ) : (
              <>
                {activeTab === "company" && <CompanyTab settings={settings} canEdit={canEdit} />}
                {activeTab === "invoice" && <InvoiceTab settings={settings} canEdit={canEdit} />}
                {activeTab === "appearance" && <AppearanceTab settings={settings} canEdit={canEdit} />}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
