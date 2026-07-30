import React, { useState } from "react";
import { Sidebar } from "../../../components/layout/Sidebar";
import { Header } from "../../../components/layout/Header";
import { BarChart3 } from "lucide-react";
import {
  useDashboardReports,
  useRevenueReport,
  useInvoiceReport,
  useTaxReport,
  useProfitLossReport,
  useClientPerformanceReport,
  useExportReport,
} from "../hooks/useReports";
import type { ReportFilterQuery } from "../types/reports.types";
import { ReportsHeaderBar } from "../components/ReportsHeaderBar";
import { ReportsKpiCards } from "../components/ReportsKpiCards";
import { ReportsTabsView } from "../components/ReportsTabsView";

export const ReportsPage: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [filters, setFilters] = useState<ReportFilterQuery>({
    period: "monthly",
  });

  // Data Queries
  const dashboardQuery = useDashboardReports(filters);
  const revenueQuery = useRevenueReport(filters);
  const invoiceQuery = useInvoiceReport(filters);
  const taxQuery = useTaxReport(filters);
  const profitQuery = useProfitLossReport(filters);
  const clientQuery = useClientPerformanceReport(filters);

  const exportMutation = useExportReport();

  const handleFilterChange = (updated: Partial<ReportFilterQuery>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({ period: "monthly" });
  };

  const handleExport = (format: "pdf" | "excel" | "csv") => {
    exportMutation.mutate({
      ...filters,
      reportType: "revenue",
      format,
    });
  };

  const handleRefresh = () => {
    dashboardQuery.refetch();
    revenueQuery.refetch();
    invoiceQuery.refetch();
    taxQuery.refetch();
    profitQuery.refetch();
    clientQuery.refetch();
  };

  const isLoading =
    dashboardQuery.isLoading ||
    revenueQuery.isLoading ||
    invoiceQuery.isLoading ||
    taxQuery.isLoading ||
    profitQuery.isLoading ||
    clientQuery.isLoading;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-[#111827] dark:text-[#F9FAFB] flex transition-colors duration-200">
      {/* Navigation Sidebar */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenCreateInvoice={() => {}}
          onOpenCreateClient={() => {}}
          onRefresh={handleRefresh}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Page Banner Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 text-[#F97316] flex items-center justify-center shrink-0">
                <BarChart3 className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Financial Reports & Intelligence
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate max-w-xl">
                  Information-dense SaaS analytics, revenue trends, tax liabilities, and P&L reports.
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Top Filter Header Bar */}
          <ReportsHeaderBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onExport={handleExport}
            isExporting={exportMutation.isPending}
          />

          {/* Core Overview: Capped at Maximum 6 KPI Cards */}
          <ReportsKpiCards metrics={dashboardQuery.data?.data} isLoading={dashboardQuery.isLoading} />

          {/* Unified 6-Tab Section containing Charts & Paginated Tables */}
          <ReportsTabsView
            revenue={revenueQuery.data?.data}
            invoices={invoiceQuery.data?.data}
            tax={taxQuery.data?.data}
            profit={profitQuery.data?.data}
            clients={clientQuery.data?.data}
            isLoading={isLoading}
            onExport={handleExport}
          />
        </main>
      </div>
    </div>
  );
};
