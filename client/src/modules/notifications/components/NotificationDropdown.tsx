import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, CheckCheck, ExternalLink } from "lucide-react";
import {
  useNotificationsQuery,
  useUnreadCountQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useDeleteNotificationMutation,
} from "../hooks/useNotifications";
import { NotificationItem } from "./NotificationItem";
import { EmptyState } from "./EmptyState";
import { LoadingState } from "./LoadingState";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

export const NotificationDropdown: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useOutsideClick<HTMLDivElement>(
    () => setIsOpen(false),
    isOpen
  );
  const navigate = useNavigate();

  const { data: countData } = useUnreadCountQuery();
  const unreadCount = countData?.data?.unreadCount || 0;

  const { data: notificationsData, isLoading } = useNotificationsQuery({
    page: 1,
    limit: 6,
  });

  const markAsReadMutation = useMarkAsReadMutation();
  const markAllAsReadMutation = useMarkAllAsReadMutation();
  const deleteMutation = useDeleteNotificationMutation();

  const notifications = notificationsData?.data || [];

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="relative w-9 h-9 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-[#F97316]"
        aria-label="Open Notifications"
      >
        <Bell className="w-4 h-4" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#F97316] px-1 text-[9px] font-extrabold text-white ring-2 ring-white dark:ring-slate-900 animate-in zoom-in duration-150">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2.5 w-80 sm:w-96 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
          {/* Header */}
          <div className="p-3.5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
            <div className="flex items-center gap-2">
              <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 dark:bg-orange-950/60 text-[#F97316]">
                  {unreadCount} new
                </span>
              )}
            </div>

            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="flex items-center gap-1 text-[11px] font-semibold text-[#F97316] hover:text-orange-600 transition-colors"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Mark all read</span>
              </button>
            )}
          </div>

          {/* List Content */}
          <div className="max-h-80 overflow-y-auto p-2.5 space-y-2">
            {isLoading ? (
              <LoadingState count={3} />
            ) : notifications.length > 0 ? (
              notifications.map((item) => (
                <NotificationItem
                  key={item.id}
                  notification={item}
                  isCompact={true}
                  onMarkAsRead={(id) => markAsReadMutation.mutate(id)}
                  onDelete={(id) => deleteMutation.mutate(id)}
                />
              ))
            ) : (
              <EmptyState title="No notifications" description="You're all caught up with business alerts." />
            )}
          </div>

          {/* Footer */}
          <div className="p-2.5 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <button
              type="button"
              onClick={() => {
                setIsOpen(false);
                navigate("/notifications");
              }}
              className="w-full py-2 px-3 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all flex items-center justify-center gap-1.5"
            >
              <span>View All Notifications</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
