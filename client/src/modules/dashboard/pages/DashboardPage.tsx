import React, { useState, useEffect } from "react";
import { useAuthStore } from "../../auth/auth.store";
import { Sidebar } from "../../../components/layout/Sidebar";
import { Header } from "../../../components/layout/Header";
import { KPICard } from "../../../components/dashboard/KPICard";
import { RevenueChart } from "../../../components/dashboard/RevenueChart";
import { InvoiceBreakdownChart } from "../../../components/dashboard/InvoiceBreakdownChart";
import { OutstandingPaymentsCard } from "../../../components/dashboard/OutstandingPaymentsCard";
import { RecentActivityFeed } from "../../../components/dashboard/RecentActivityFeed";
import { UpcomingDueCard } from "../../../components/dashboard/UpcomingDueCard";
import { RecentInvoicesTable } from "../../../components/dashboard/RecentInvoicesTable";
import { EmptyState } from "../../../components/dashboard/EmptyState";
import { CreateInvoiceModal } from "../../../components/modals/CreateInvoiceModal";
import { CreateClientModal } from "../../../components/modals/CreateClientModal";
import {
  fetchDashboardMetricsApi,
  exportAnalyticsCsvApi,
  type DashboardMetrics,
} from "../api/dashboard.api";
import { toast } from "sonner";
import {
  IndianRupee,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Receipt,
  Users,
  PiggyBank,
  Sparkles,
  RefreshCw,
  Plus,
  ShieldCheck,
  ChevronDown,
  UserPlus,
  Download,
  Loader2,
} from "lucide-react";

export const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [showQuickActionsMenu, setShowQuickActionsMenu] = useState(false);
  const [kpiTab, setKpiTab] = useState<"primary" | "operational" | "all">("primary");
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  const loadDashboardMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await fetchDashboardMetricsApi();
      setMetrics(data);
    } catch (err: any) {
      console.error("Dashboard API Error:", err);
      setError("Failed to connect to Dashboard API.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardMetrics();
  }, [refreshKey]);

  const handleRefresh = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const formatCurrency = (val?: number) => {
    if (val === undefined || val === null) return "₹0.00";
    return `₹${val.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const kpiCardsData = [
    {
      title: "Revenue",
      value: formatCurrency(metrics?.revenue),
      change: metrics?.revenue ? "Real-time DB" : "No revenue",
      changeType: (metrics?.revenue ? "positive" : "neutral") as "positive" | "negative" | "neutral",
      subtitle: "Gross revenue",
      icon: IndianRupee,
    },
    {
      title: "Outstanding",
      value: formatCurrency(metrics?.outstanding),
      change: metrics?.outstanding ? "Receivables" : "0 pending",
      changeType: "neutral" as const,
      subtitle: "Pending settlement",
      icon: Clock,
    },
    {
      title: "Paid Invoices",
      value: formatCurrency(metrics?.paid),
      change: metrics?.paid ? "Cleared" : "0 cleared",
      changeType: (metrics?.paid ? "positive" : "neutral") as "positive" | "negative" | "neutral",
      subtitle: "Settled payments",
      icon: CheckCircle2,
    },
    {
      title: "Overdue",
      value: formatCurrency(metrics?.overdue),
      change: metrics?.overdue ? "Follow-up" : "0 overdue",
      changeType: (metrics?.overdue ? "negative" : "neutral") as "positive" | "negative" | "neutral",
      subtitle: "Past deadline",
      icon: AlertTriangle,
    },
    {
      title: "Total Invoices",
      value: metrics?.invoices !== undefined ? String(metrics.invoices) : "0",
      change: metrics?.invoices ? `${metrics.invoices} in DB` : "No invoices",
      changeType: (metrics?.invoices ? "positive" : "neutral") as "positive" | "negative" | "neutral",
      subtitle: "All accounts",
      icon: Receipt,
    },
    {
      title: "Active Clients",
      value: metrics?.clients !== undefined ? String(metrics.clients) : "0",
      change: metrics?.clients ? `${metrics.clients} active` : "No clients",
      changeType: (metrics?.clients ? "positive" : "neutral") as "positive" | "negative" | "neutral",
      subtitle: "Billing profiles",
      icon: Users,
    },
    {
      title: "Expenses",
      value: formatCurrency(metrics?.expenses),
      change: metrics?.expenses ? "Operational" : "0 costs",
      changeType: (metrics?.expenses ? "positive" : "neutral") as "positive" | "negative" | "neutral",
      subtitle: "Total overheads",
      icon: PiggyBank,
    },
    {
      title: "Net Profit",
      value: formatCurrency(metrics?.profit),
      change: metrics?.profit ? "Net margin" : "0 profit",
      changeType: (metrics?.profit && metrics.profit >= 0 ? "positive" : "negative") as "positive" | "negative" | "neutral",
      subtitle: "After tax & costs",
      icon: Sparkles,
    },
  ];

  const hasAnyData =
    (metrics?.invoices ?? 0) > 0 ||
    (metrics?.clients ?? 0) > 0 ||
    (metrics?.expenses ?? 0) > 0 ||
    (metrics?.revenue ?? 0) > 0;

  return (
    <div key={refreshKey} className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-[#111827] dark:text-[#F9FAFB] flex transition-colors duration-200">
      {/* Sidebar Navigation */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar */}
        <Header
          onOpenCreateInvoice={() => setIsInvoiceModalOpen(true)}
          onOpenCreateClient={() => setIsClientModalOpen(true)}
          onRefresh={handleRefresh}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Dashboard Content Container */}
        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 max-w-[1600px] w-full mx-auto">
          {/* Welcome Header & Compact Quick Action Dropdown */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 text-[#F97316] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Welcome back, {user?.name || "Super Admin"}
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate max-w-xl">
                  Real-time database analytics for Ledgerly billing metrics, invoices, and financial health.
                </p>
              </div>
            </div>

            {/* Quick Actions Dropdown & Refresh Button */}
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="btn-secondary flex items-center gap-2 text-xs font-semibold px-3 py-2 rounded-xl"
              >
                <RefreshCw className={`w-3.5 h-3.5 text-slate-500 ${isLoading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowQuickActionsMenu(!showQuickActionsMenu)}
                  className="btn-primary flex items-center gap-2 text-xs font-semibold"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>Quick Actions</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-80" />
                </button>

                {showQuickActionsMenu && (
                  <div className="absolute right-0 mt-2 w-52 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    <button
                      onClick={() => {
                        setShowQuickActionsMenu(false);
                        setIsInvoiceModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-orange-50 dark:hover:bg-orange-950/30 hover:text-[#F97316] rounded-xl transition-colors"
                    >
                      <Receipt className="w-4 h-4 text-[#F97316]" />
                      <span>Create Invoice</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowQuickActionsMenu(false);
                        setIsClientModalOpen(true);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <UserPlus className="w-4 h-4 text-slate-400" />
                      <span>New Client</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowQuickActionsMenu(false);
                        handleRefresh();
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <RefreshCw className="w-4 h-4 text-slate-400" />
                      <span>Refresh Data</span>
                    </button>

                    <button
                      onClick={async () => {
                        setShowQuickActionsMenu(false);
                        try {
                          const blob = await exportAnalyticsCsvApi();
                          const url = window.URL.createObjectURL(blob);
                          const a = document.createElement("a");
                          a.href = url;
                          a.download = `dashboard-analytics-${new Date().toISOString().slice(0, 10)}.csv`;
                          document.body.appendChild(a);
                          a.click();
                          window.URL.revokeObjectURL(url);
                          document.body.removeChild(a);
                          toast.success("Dashboard Analytics Exported", {
                            description: "Analytics data exported to CSV file.",
                          });
                        } catch (err: any) {
                          toast.error("Export Failed", {
                            description: err?.message || "Could not export CSV from server.",
                          });
                        }
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                    >
                      <Download className="w-4 h-4 text-slate-400" />
                      <span>Export Analytics CSV</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center justify-between">
              <span>{error}</span>
              <button onClick={handleRefresh} className="font-semibold underline">
                Retry
              </button>
            </div>
          )}

          {/* Optimized KPI Cards Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h2 className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Financial Metrics</span>
                {isLoading && <Loader2 className="w-4 h-4 animate-spin text-[#F97316]" />}
              </h2>

              {/* Segmented Control Tabs */}
              <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl text-xs font-semibold self-start sm:self-auto border border-slate-200/60 dark:border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setKpiTab("primary")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    kpiTab === "primary"
                      ? "bg-white dark:bg-slate-900 text-[#F97316] shadow-xs font-bold"
                      : "text-[#111827] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Primary Financials
                </button>
                <button
                  type="button"
                  onClick={() => setKpiTab("operational")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    kpiTab === "operational"
                      ? "bg-white dark:bg-slate-900 text-[#F97316] shadow-xs font-bold"
                      : "text-[#111827] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  Operational Overview
                </button>
                <button
                  type="button"
                  onClick={() => setKpiTab("all")}
                  className={`px-3 py-1.5 rounded-lg transition-all ${
                    kpiTab === "all"
                      ? "bg-white dark:bg-slate-900 text-[#F97316] shadow-xs font-bold"
                      : "text-[#111827] dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                >
                  All Metrics (8)
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
              {kpiCardsData
                .filter((kpi) => {
                  if (kpiTab === "primary") {
                    return ["Revenue", "Outstanding", "Paid Invoices", "Net Profit"].includes(kpi.title);
                  }
                  if (kpiTab === "operational") {
                    return ["Overdue", "Total Invoices", "Active Clients", "Expenses"].includes(kpi.title);
                  }
                  return true;
                })
                .map((kpi, idx) => (
                  <KPICard key={kpi.title} {...kpi} delay={idx} />
                ))}
            </div>
          </div>

          {/* Zero Data Banner vs Live Data View */}
          {!isLoading && !hasAnyData ? (
            <EmptyState
              onCreateInvoice={() => setIsInvoiceModalOpen(true)}
              onAddClient={() => setIsClientModalOpen(true)}
            />
          ) : (
            <>
              {/* Analytics & Breakdown Charts Row (Equal Height Alignment) */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="lg:col-span-2 flex flex-col">
                  <RevenueChart data={metrics?.revenueChart} />
                </div>
                <div className="lg:col-span-1 flex flex-col">
                  <InvoiceBreakdownChart data={metrics?.invoiceChart} />
                </div>
              </div>

              {/* Outstanding Payments & Activity Feed Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="lg:col-span-2 flex flex-col h-full">
                  <OutstandingPaymentsCard agingData={metrics?.outstandingAging} />
                </div>
                <div className="lg:col-span-1 flex flex-col h-full">
                  <RecentActivityFeed activities={metrics?.recentActivity} />
                </div>
              </div>

              {/* Recent Invoices Table & Upcoming Due Invoices Row */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                <div className="lg:col-span-2 flex flex-col h-full">
                  <RecentInvoicesTable invoices={metrics?.recentInvoices} />
                </div>
                <div className="lg:col-span-1 flex flex-col h-full">
                  <UpcomingDueCard upcomingInvoices={metrics?.upcomingDueInvoices} />
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => {
          setIsInvoiceModalOpen(false);
          handleRefresh();
        }}
      />

      <CreateClientModal
        isOpen={isClientModalOpen}
        onClose={() => {
          setIsClientModalOpen(false);
          handleRefresh();
        }}
      />
    </div>
  );
};
