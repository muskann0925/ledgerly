import React from "react";
import { useNavigate } from "react-router-dom";
import type { NotificationItemData, NotificationType } from "../types/notification.types";
import {
  Send,
  Eye,
  CheckCircle2,
  AlertTriangle,
  BellRing,
  FileCheck,
  Check,
  Trash2,
} from "lucide-react";

interface NotificationItemProps {
  notification: NotificationItemData;
  onMarkAsRead?: (id: string) => void;
  onDelete?: (id: string) => void;
  isCompact?: boolean;
}

const getNotificationTypeConfig = (type: NotificationType) => {
  switch (type) {
    case "INVOICE_SENT":
      return {
        icon: Send,
        bgColor: "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border-blue-100 dark:border-blue-900/40",
        badgeText: "Invoice Sent",
        pathPrefix: "/invoices",
      };
    case "INVOICE_VIEWED":
      return {
        icon: Eye,
        bgColor: "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/40",
        badgeText: "Viewed",
        pathPrefix: "/invoices",
      };
    case "PAYMENT_RECEIVED":
      return {
        icon: CheckCircle2,
        bgColor: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/40",
        badgeText: "Payment Received",
        pathPrefix: "/payments",
      };
    case "INVOICE_OVERDUE":
      return {
        icon: AlertTriangle,
        bgColor: "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border-rose-100 dark:border-rose-900/40",
        badgeText: "Overdue Alert",
        pathPrefix: "/invoices",
      };
    case "REMINDER_SENT":
      return {
        icon: BellRing,
        bgColor: "bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/40",
        badgeText: "Reminder Sent",
        pathPrefix: "/invoices",
      };
    case "QUOTATION_APPROVED":
      return {
        icon: FileCheck,
        bgColor: "bg-teal-50 dark:bg-teal-950/40 text-teal-600 dark:text-teal-400 border-teal-100 dark:border-teal-900/40",
        badgeText: "Quotation Approved",
        pathPrefix: "/quotations",
      };
    default:
      return {
        icon: BellRing,
        bgColor: "bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        badgeText: "Notification",
        pathPrefix: "/dashboard",
      };
  }
};

const formatRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 172800) return "Yesterday";
  return date.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
};

export const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onMarkAsRead,
  onDelete,
  isCompact = false,
}) => {
  const navigate = useNavigate();
  const config = getNotificationTypeConfig(notification.type);
  const IconComponent = config.icon;

  const handleItemClick = (e: React.MouseEvent) => {
    // Avoid triggering navigation if button clicked
    if ((e.target as HTMLElement).closest("button")) {
      return;
    }

    if (!notification.isRead && onMarkAsRead) {
      onMarkAsRead(notification.id);
    }

    if (config.pathPrefix) {
      navigate(config.pathPrefix);
    }
  };

  return (
    <div
      onClick={handleItemClick}
      className={`group relative p-3 sm:p-3.5 rounded-2xl border transition-all duration-200 cursor-pointer ${
        !notification.isRead
          ? "bg-gradient-to-r from-orange-50/70 via-white to-white dark:from-orange-950/20 dark:via-[#111827] dark:to-[#111827] border-orange-200/80 dark:border-orange-900/30 shadow-xs"
          : "bg-white dark:bg-[#111827] border-slate-200/80 dark:border-slate-800/80 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50/60 dark:hover:bg-slate-800/40"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* Type Icon Badge */}
        <div
          className={`w-9 h-9 rounded-xl border flex items-center justify-center shrink-0 ${config.bgColor}`}
        >
          <IconComponent className="w-4 h-4" />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-0.5">
            <div className="flex items-center gap-2 truncate">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                {notification.title}
              </span>
              {!notification.isRead && (
                <span className="w-2 h-2 rounded-full bg-[#F97316] shrink-0" title="Unread" />
              )}
            </div>
            <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 shrink-0">
              {formatRelativeTime(notification.createdAt)}
            </span>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
            {notification.message}
          </p>

          {/* Action Row for Non-compact view */}
          {!isCompact && (
            <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${config.bgColor}`}>
                {config.badgeText}
              </span>

              <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100 transition-opacity">
                {!notification.isRead && onMarkAsRead && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkAsRead(notification.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                    title="Mark as Read"
                  >
                    <Check className="w-3.5 h-3.5" />
                  </button>
                )}
                {onDelete && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(notification.id);
                    }}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                    title="Delete Notification"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
