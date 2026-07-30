import React, { useState } from "react";
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "../hooks/useNotifications";
import type { NotificationType } from "../types/notification.types";
import { Sidebar } from "../../../components/layout/Sidebar";
import { Header } from "../../../components/layout/Header";
import { NotificationList } from "../components/NotificationList";
import {
  CheckCheck,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Receipt,
  CreditCard,
  FileText,
  Clock,
  AlertTriangle,
} from "lucide-react";

type FilterTab = "ALL" | "UNREAD" | "INVOICE" | "PAYMENT" | "QUOTATION" | "REMINDER" | "OVERDUE";

export const NotificationsPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FilterTab>("ALL");
  const [page, setPage] = useState(1);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const limit = 10;

  // Map tabs to query parameters
  const getQueryParams = () => {
    const params: {
      page: number;
      limit: number;
      search?: string;
      isRead?: boolean;
      type?: NotificationType;
      entityType?: string;
    } = { page, limit };

    switch (activeTab) {
      case "UNREAD":
        params.isRead = false;
        break;
      case "INVOICE":
        params.type = "INVOICE_SENT";
        params.entityType = "Invoice";
        break;
      case "PAYMENT":
        params.type = "PAYMENT_RECEIVED";
        params.entityType = "Payment";
        break;
      case "QUOTATION":
        params.type = "QUOTATION_APPROVED";
        params.entityType = "Quotation";
        break;
      case "REMINDER":
        params.type = "REMINDER_SENT";
        break;
      case "OVERDUE":
        params.type = "INVOICE_OVERDUE";
        break;
    }

    return params;
  };

  const { data, isLoading } = useNotificationsQuery(getQueryParams());
  const { data: unreadData } = useUnreadCountQuery();

  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();
  const deleteMutation = useDeleteNotificationMutation();

  const notifications = data?.data || [];
  const meta = data?.meta || { total: 0, unreadCount: 0, page: 1, limit: 10, totalPages: 1 };
  const totalUnread = unreadData?.data?.unreadCount ?? meta.unreadCount;

  const totalPages = Math.max(1, meta.totalPages);

  const startRecord = meta.total === 0 ? 0 : (page - 1) * limit + 1;
  const endRecord = Math.min(page * limit, meta.total);

  const filterTabs: { id: FilterTab; label: string; count?: number; icon?: React.ElementType }[] = [
    { id: "ALL", label: "All Activity", count: meta.total },
    { id: "UNREAD", label: "Unread", count: totalUnread },
    { id: "INVOICE", label: "Invoices", icon: Receipt },
    { id: "PAYMENT", label: "Payments", icon: CreditCard },
    { id: "QUOTATION", label: "Quotations", icon: FileText },
    // { id: "REMINDER", label: "Reminders", icon: Clock },
    { id: "OVERDUE", label: "Overdue", icon: AlertTriangle },
  ];

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-[#0B0F17] overflow-hidden">
      <Sidebar
        activeTab="notifications"
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
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                    Notifications & Activity Log
                  </h1>
                  {totalUnread > 0 && (
                    <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#F97316]">
                      {totalUnread} Unread
                    </span>
                  )}
                </div>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate max-w-xl">
                  Real-time audit stream of invoice activities, customer views, payments, and automated system reminders.
                </p>
              </div>
            </div>

            {totalUnread > 0 && (
              <button
                type="button"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="h-9 px-4 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#F97316] hover:bg-orange-100 border border-orange-200 dark:border-orange-900/40 text-xs font-bold transition-all flex items-center gap-2 shrink-0 self-start sm:self-auto"
              >
                <CheckCheck className="w-4 h-4" />
                <span>Mark All as Read</span>
              </button>
            )}
          </div>

          {/* Controls Bar */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-3 sm:p-3.5 shadow-xs flex items-center gap-2.5 overflow-x-auto scrollbar-none w-full select-none">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 shrink-0">
              {filterTabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setActiveTab(tab.id);
                      setPage(1);
                    }}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 border ${
                      isActive
                        ? "border-[#F97316] text-white bg-[#F97316] shadow-xs"
                        : "border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 bg-white dark:bg-[#111827]"
                    }`}
                  >
                    {Icon && <Icon className="w-3.5 h-3.5" />}
                    <span>{tab.label}</span>
                    {tab.count !== undefined && tab.count > 0 && (
                      <span
                        className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                          isActive
                            ? "bg-white/20 text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                        }`}
                      >
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Notifications List Container */}
          <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 sm:p-6 shadow-xs">
            <NotificationList
              notifications={notifications}
              isLoading={isLoading}
              onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
              onDelete={(id) => deleteMutation.mutate(id)}
            />

            {/* Pagination - Standard AGENTS.md Rules Pattern */}
            {!isLoading && meta.total > 0 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400">
                {/* Left Side */}
                <div>
                  Showing {startRecord}–{endRecord} of {meta.total}
                </div>

                {/* Right Side */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage(1)}
                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="First Page"
                  >
                    <ChevronsLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Previous Page"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>

                  <span className="px-2 font-semibold text-slate-700 dark:text-slate-300">
                    Page {page} of {totalPages}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Next Page"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage(totalPages)}
                    className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                    title="Last Page"
                  >
                    <ChevronsRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
