import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { LoginPage } from "../modules/auth/pages/LoginPage";
import { RegisterPage } from "../modules/auth/pages/RegisterPage";
import { ForgotPasswordPage } from "../modules/auth/pages/ForgotPasswordPage";
import { ResetPasswordPage } from "../modules/auth/pages/ResetPasswordPage";
import { OtpVerificationPage } from "../modules/auth/pages/OtpVerificationPage";
import { DashboardPage } from "../modules/dashboard/pages/DashboardPage";
import { ClientsPage } from "../modules/clients/pages/ClientsPage";
import { ModulePlaceholderPage } from "../pages/ModulePlaceholderPage";
import { ProtectedRoute } from "./ProtectedRoute";
import { Sparkles } from "lucide-react";

import { InvoicesPage } from "../modules/invoices/pages/InvoicesPage";
import { PaymentsPage } from "../modules/payments/pages/PaymentsPage";
import { QuotationsPage } from "../modules/quotations/pages/QuotationsPage";
import { ExpensesPage } from "../modules/expenses/pages/ExpensesPage";
import { ReportsPage } from "../modules/reports/pages/ReportsPage";
import { TaxesPage } from "../modules/taxes/pages/TaxesPage";
import { NotificationsPage } from "../modules/notifications/pages/NotificationsPage";
import { SettingsPage } from "../modules/settings/pages/SettingsPage";
import { UsersPage } from "../modules/users/pages/UsersPage";
import { AuditLogsPage } from "../modules/audit-logs/pages/AuditLogsPage";

import { useAuthStore } from "../modules/auth/auth.store";

const RootRedirect: React.FC = () => {
  const defaultLanding =
    useAuthStore((state) => state.defaultDashboardPage) ||
    localStorage.getItem("defaultDashboardPage") ||
    "/dashboard";
  return <Navigate to={defaultLanding} replace />;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/verify-otp" element={<OtpVerificationPage />} />

      {/* Primary Implemented Modules */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/clients"
        element={
          <ProtectedRoute>
            <ClientsPage />
          </ProtectedRoute>
        }
      />

      {/* Connected Sidebar Module Routes */}
      <Route
        path="/invoices"
        element={
          <ProtectedRoute>
            <InvoicesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/quotations"
        element={
          <ProtectedRoute>
            <QuotationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payments"
        element={
          <ProtectedRoute allowedRoles={["OWNER", "ADMIN", "SALES", "FINANCE", "VIEWER"]}>
            <PaymentsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute allowedRoles={["OWNER", "ADMIN", "FINANCE", "VIEWER"]}>
            <ExpensesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/taxes"
        element={
          <ProtectedRoute allowedRoles={["OWNER", "ADMIN", "SALES", "FINANCE", "VIEWER"]}>
            <TaxesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <ReportsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
            <UsersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/ai-assistant"
        element={
          <ProtectedRoute>
            <ModulePlaceholderPage
              title="AI Billing Assistant"
              description="Automated financial forecasting, smart invoice generation, and anomaly detection."
              icon={Sparkles}
              badgeText="AI Suite"
            />
          </ProtectedRoute>
        }
      />
      <Route
        path="/audit-logs"
        element={
          <ProtectedRoute allowedRoles={["OWNER", "ADMIN"]}>
            <AuditLogsPage />
          </ProtectedRoute>
        }
      />

      {/* Fallback & Redirect */}
      <Route path="/" element={<RootRedirect />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};
