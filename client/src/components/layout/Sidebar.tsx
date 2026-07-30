import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Users,
  CreditCard,
  PiggyBank,
  Percent,
  BarChart3,
  Settings,
  UserCheck,
  Bell,
  // Sparkles,
  ScrollText,
  Zap,
  HelpCircle,
  X,
  type LucideIcon,
} from "lucide-react";

import { useUnreadCountQuery } from "../../modules/notifications/hooks/useNotifications";
import { usePermission } from "../../hooks/usePermission";

interface SidebarProps {
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

interface MenuItem {
  id: string;
  label: string;
  path: string;
  icon: LucideIcon;
  badge?: string;
}

export const baseMenuItems: MenuItem[] = [
  { id: "dashboard", label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { id: "invoices", label: "Invoices", path: "/invoices", icon: Receipt },
  { id: "quotations", label: "Quotations", path: "/quotations", icon: FileText },
  { id: "clients", label: "Clients", path: "/clients", icon: Users },
  { id: "payments", label: "Payments", path: "/payments", icon: CreditCard },
  { id: "expenses", label: "Expenses", path: "/expenses", icon: PiggyBank },
  { id: "taxes", label: "Taxes", path: "/taxes", icon: Percent },
  { id: "reports", label: "Reports", path: "/reports", icon: BarChart3 },
  { id: "settings", label: "Settings", path: "/settings", icon: Settings },
  { id: "users", label: "Users", path: "/users", icon: UserCheck },
  { id: "notifications", label: "Notifications", path: "/notifications", icon: Bell },
  // { id: "ai-assistant", label: "AI Assistant", path: "/ai-assistant", icon: Sparkles },
  { id: "audit-logs", label: "Audit Logs", path: "/audit-logs", icon: ScrollText },
];

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const permission = usePermission();
  const { data: unreadData } = useUnreadCountQuery();
  const unreadCount = unreadData?.data?.unreadCount || 0;

  const menuItems = baseMenuItems
    .filter((item) => permission.canAccess(item.path))
    .map((item) => {
      if (item.id === "notifications" && unreadCount > 0) {
        return {
          ...item,
          badge: unreadCount > 99 ? "99+" : String(unreadCount),
        };
      }
      return item;
    });

  const handleItemClick = (item: MenuItem) => {
    if (onTabChange) {
      onTabChange(item.id);
    } else {
      navigate(item.path);
    }
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs lg:hidden animate-in fade-in duration-200"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-40 w-64 bg-white dark:bg-[#111827] border-r border-slate-200/80 dark:border-slate-800/80 flex flex-col justify-between h-screen shrink-0 select-none transition-transform duration-300 ${
          isOpenMobile ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div>
          {/* Brand Header */}
          <div className="h-16 px-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/dashboard")}>
              <div className="w-9 h-9 rounded-xl bg-[#F97316] flex items-center justify-center text-white shadow-sm shadow-orange-500/20">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-slate-900 dark:text-white tracking-tight text-lg leading-none">
                  LEDGERLY
                </span>
                <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest mt-0.5">
                  SaaS Billing
                </span>
              </div>
            </div>

            {/* Mobile Close Button */}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                className="p-1 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 lg:hidden"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* Navigation Section */}
          <div className="p-3 space-y-1 overflow-y-auto max-h-[calc(100vh-8.5rem)]">
            <nav className="space-y-0.5">
              {menuItems.map((item) => {
                const Icon = item.icon;
                // Active route detection based on current URL path or activeTab prop
                const isPathActive = location.pathname === item.path || (item.path !== "/" && location.pathname.startsWith(item.path));
                const isActive = activeTab ? activeTab === item.id : isPathActive;

                return (
                  <button
                    key={item.id}
                    onClick={() => handleItemClick(item)}
                    className={`relative w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                      isActive
                        ? "bg-orange-50/80 dark:bg-orange-950/30 text-slate-900 dark:text-slate-100 border-l-4 border-[#F97316] pl-2.5 shadow-xs"
                        : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 transition-colors ${
                          isActive
                            ? "text-[#F97316]"
                            : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300"
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                          isActive
                            ? "bg-[#F97316] text-white"
                            : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400"
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sidebar Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5" />
            <span className="font-medium text-[11px]">v0.1 · Foundation build</span>
          </div>
          <span className="w-2 h-2 rounded-full bg-emerald-500" title="System Operational" />
        </div>
      </aside>
    </>
  );
};
