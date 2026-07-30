import React, { useState } from "react";
import { ShieldCheck, ScrollText } from "lucide-react";
import { useAuditLogs } from "../hooks/useAuditLogs";
import { AuditLogFiltersBar } from "../components/AuditLogFiltersBar";
import { AuditLogTable } from "../components/AuditLogTable";
import { AuditLogDetailsDrawer } from "../components/AuditLogDetailsDrawer";
import { Sidebar } from "../../../components/layout/Sidebar";
import { Header } from "../../../components/layout/Header";

export const AuditLogsPage: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const {
    logs,
    pagination,
    isLoading,
    isFetching,
    filters,
    selectedLog,
    isDetailsOpen,
    isExporting,
    setSelectedLog,
    setIsDetailsOpen,
    handleFilterChange,
    handleResetFilters,
    handleExportCSV,
    refetch,
  } = useAuditLogs();

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-sans antialiased overflow-hidden">
      {/* Sidebar Navigation */}
      <Sidebar
        activeTab="audit-logs"
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <Header onToggleMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto pb-10">
          {/* Page Header Card */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 text-[#F97316] flex items-center justify-center shrink-0">
                <ScrollText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  System Audit Logs
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate max-w-xl">
                  Immutable, real-time audit trail of all authentication attempts, user role changes, financial updates, and system configuration events.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
              <div className="px-3 py-1.5 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200/60 dark:border-orange-900/40 flex items-center gap-2 text-xs font-semibold text-[#F97316]">
                <ShieldCheck className="w-4 h-4 text-[#F97316]" />
                <span>Immutable Database Trail</span>
              </div>
            </div>
          </div>

          {/* Filters Toolbar */}
          <AuditLogFiltersBar
            filters={filters}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            onRefresh={refetch}
            onExport={handleExportCSV}
            isFetching={isFetching}
            isExporting={isExporting}
          />

          {/* Main Audit Logs Table */}
          <AuditLogTable
            logs={logs}
            pagination={pagination}
            isLoading={isLoading}
            onPageChange={(page) => handleFilterChange({ page })}
            onViewDetails={(log) => {
              setSelectedLog(log);
              setIsDetailsOpen(true);
            }}
          />

          {/* Log Details Slide-Over Drawer */}
          <AuditLogDetailsDrawer
            log={selectedLog}
            isOpen={isDetailsOpen}
            onClose={() => {
              setIsDetailsOpen(false);
              setSelectedLog(null);
            }}
          />
        </main>
      </div>
    </div>
  );
};

export default AuditLogsPage;
