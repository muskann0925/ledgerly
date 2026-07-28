import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Search,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  Command,
  Building2,
  Menu,
} from "lucide-react";
import { Dialog, DialogContent } from "../ui/dialog";
import { useTheme } from "../theme-provider";
import { useAuthStore } from "../../modules/auth/auth.store";
import { logoutApi } from "../../modules/auth/api/auth.api";
import { NotificationDropdown } from "../../modules/notifications/components/NotificationDropdown";
import { useOutsideClick } from "../../hooks/useOutsideClick";

interface HeaderProps {
  onOpenCreateInvoice?: () => void | Promise<void>;
  onOpenCreateClient?: () => void | Promise<void>;
  onRefresh?: (...args: any[]) => void | Promise<any>;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onToggleMobileSidebar,
}) => {
  const location = useLocation();
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuthStore();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const profileMenuRef = useOutsideClick<HTMLDivElement>(
    () => setShowProfileMenu(false),
    showProfileMenu
  );

  const getBreadcrumbTitle = (path: string) => {
    switch (path) {
      case "/dashboard":
        return "Dashboard";
      case "/clients":
        return "Clients Directory";
      case "/invoices":
        return "Invoices";
      case "/quotations":
        return "Quotations";
      case "/products":
        return "Products & Services";
      case "/payments":
        return "Payments";
      case "/expenses":
        return "Expenses";
      case "/taxes":
        return "Taxes & Compliance";
      case "/reports":
        return "Financial Reports";
      case "/settings":
        return "Settings";
      case "/users":
        return "User Management";
      case "/notifications":
        return "Notifications";
      // case "/ai-assistant":
      //   return "AI Assistant";
      case "/audit-logs":
        return "Audit Logs";
      default:
        return "Dashboard";
    }
  };

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      logout();
    }
  };

  const navigate = useNavigate();
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [commandQuery, setCommandQuery] = useState("");

  // Keyboard shortcut listener for Ctrl+K / Cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navigationItems = [
    { label: "Dashboard", path: "/dashboard", desc: "Overview analytics and real-time database metrics" },
    { label: "Invoices & Billing", path: "/invoices", desc: "Manage billing invoices, payments, and PDF generation" },
    { label: "Quotations & Proposals", path: "/quotations", desc: "Create formal price quotes and convert to invoices" },
    { label: "Clients Directory", path: "/clients", desc: "Client profiles, contact information, and billing rules" },
    { label: "Payments Registry", path: "/payments", desc: "Transaction history, wire transfers, and UPI logs" },
    { label: "Expenses Manager", path: "/expenses", desc: "Record operational costs, categories, and vendor accounts" },
    { label: "Taxes & Compliance", path: "/taxes", desc: "Central GST/TDS tax definitions and rule configuration" },
    { label: "Financial Reports", path: "/reports", desc: "Revenue summaries, client statements, and ledger audit" },
    { label: "System Settings", path: "/settings", desc: "Company preferences, tax rules, and profile defaults" },
  ];

  const filteredItems = navigationItems.filter(
    (item) =>
      item.label.toLowerCase().includes(commandQuery.toLowerCase()) ||
      item.desc.toLowerCase().includes(commandQuery.toLowerCase())
  );

  return (
    <header className="sticky top-0 z-30 h-16 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 lg:px-8 flex items-center justify-between transition-colors duration-200">
      {/* Left: Mobile Drawer Trigger & Organization Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        <button
          onClick={onToggleMobileSidebar}
          className="p-2 rounded-xl border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 lg:hidden"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/80 text-slate-800 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700/60 text-xs font-semibold hover:bg-slate-200/60 dark:hover:bg-slate-700/60 cursor-pointer transition-all">
          <Building2 className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Ledgerly</span>
        </div>

        <span className="text-slate-300 dark:text-slate-700 hidden sm:inline">/</span>

        <nav aria-label="Breadcrumb" className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200">
          <span>{getBreadcrumbTitle(location.pathname)}</span>
        </nav>
      </div>

      {/* Center: Search Trigger Box */}
      <div className="hidden md:flex items-center flex-1 max-w-md mx-6 relative">
        <button
          type="button"
          onClick={() => setIsSearchModalOpen(true)}
          className="w-full pl-10 pr-12 py-2 text-xs text-left rounded-xl bg-slate-100/70 dark:bg-slate-800/70 border border-slate-200/60 dark:border-slate-700/60 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <span>Search invoices, clients, reports...</span>
          </div>
          <kbd className="hidden sm:inline-flex items-center gap-0.5 text-[10px] font-semibold text-slate-400 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
            <Command className="w-2.5 h-2.5" /> K
          </kbd>
        </button>
      </div>

      {/* Right Controls: Notifications, Theme, Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        <NotificationDropdown />

        {/* Theme Toggle */}
        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="w-9 h-9 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? (
            <Sun className="w-4 h-4 text-amber-400" />
          ) : (
            <Moon className="w-4 h-4 text-slate-600" />
          )}
        </button>

        {/* Profile Avatar & Menu */}
        <div className="relative" ref={profileMenuRef}>
          <button
            onClick={() => setShowProfileMenu((prev) => !prev)}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-slate-100/70 dark:hover:bg-slate-800/70 transition-all focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          >
            <div className="w-8 h-8 rounded-full bg-[#F97316] text-white font-bold text-xs flex items-center justify-center shadow-xs">
              {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
            </div>
            <div className="hidden lg:flex flex-col text-left text-xs">
              <span className="font-bold text-slate-900 dark:text-slate-100 leading-tight">
                {user?.name || "Super Admin"}
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                {user?.role || "OWNER"}
              </span>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden lg:block" />
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 space-y-0.5">
                <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  {user?.name || "Super Admin"}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || "admin@ledgerly.io"}
                </p>
                <span className="inline-block mt-1 text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-md bg-orange-100 text-[#F97316] dark:bg-orange-950/60 dark:text-orange-400">
                  {user?.role || "SUPER ADMIN"}
                </span>
              </div>

              {/* Profile & Settings items commented out per request */}
              {/* 
              <div className="py-1 space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/users");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                    location.pathname === "/users"
                      ? "bg-orange-50 dark:bg-orange-950/40 text-[#F97316] font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>User Management</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate("/settings");
                  }}
                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-xl transition-colors ${
                    location.pathname === "/settings"
                      ? "bg-orange-50 dark:bg-orange-950/40 text-[#F97316] font-bold"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  <Settings className="w-3.5 h-3.5 text-slate-400" />
                  <span>System Settings</span>
                </button>
              </div>
              */}

              <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setShowProfileMenu(false);
                    handleLogout();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-xl transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Global Command Palette Search Modal (Ctrl+K / Cmd+K) */}
      <Dialog open={isSearchModalOpen} onOpenChange={setIsSearchModalOpen}>
        <DialogContent className="max-w-xl p-0 overflow-hidden rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl">
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3">
            <Search className="w-4 h-4 text-[#F97316]" />
            <input
              type="text"
              autoFocus
              value={commandQuery}
              onChange={(e) => setCommandQuery(e.target.value)}
              placeholder="Type a command or search modules..."
              className="w-full text-xs bg-transparent text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
            />
            <kbd className="text-[10px] font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded px-1.5 py-0.5">
              ESC
            </kbd>
          </div>

          <div className="max-h-80 overflow-y-auto p-2 space-y-1">
            {filteredItems.length > 0 ? (
              filteredItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    setIsSearchModalOpen(false);
                    setCommandQuery("");
                    navigate(item.path);
                  }}
                  className="w-full text-left p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/70 transition-colors flex flex-col gap-0.5"
                >
                  <div className="flex items-center justify-between text-xs font-bold text-slate-900 dark:text-white">
                    <span>{item.label}</span>
                    <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500">{item.path}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 leading-snug">
                    {item.desc}
                  </span>
                </button>
              ))
            ) : (
              <div className="py-8 text-center text-xs text-slate-400">
                No matching navigation routes found.
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </header>
  );
};
