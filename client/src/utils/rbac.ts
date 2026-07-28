export type UserRole = "OWNER" | "ADMIN" | "SALES" | "FINANCE" | "VIEWER";

export type SystemModule =
  | "dashboard"
  | "clients"
  | "invoices"
  | "quotations"
  | "payments"
  | "expenses"
  | "taxes"
  | "reports"
  | "settings"
  | "users"
  | "notifications"
  | "audit-logs";

export type PermissionAction =
  | "view"
  | "create"
  | "edit"
  | "delete"
  | "approve"
  | "reject"
  | "duplicate"
  | "convert"
  | "export"
  | "send_email"
  | "record_payment"
  | "manage_users"
  | "manage_settings";

/**
 * Centralized Permission Matrix Mapping strictly matching User Preference:
 * 
 * VIEWER Role Policy:
 * ✅ Read-Only access to all business records (Dashboard, Clients, Invoices, Quotations, Payments, Expenses, Taxes, Reports, Notifications)
 * ❌ Cannot create, edit, delete, approve, reject, record payments, or mutate data.
 * ❌ No access to Administrative functions (Settings, Users, Audit Logs).
 */
export const PERMISSION_MATRIX: Record<UserRole, Partial<Record<SystemModule, PermissionAction[]>>> = {
  OWNER: {
    dashboard: ["view"],
    clients: ["view", "create", "edit", "delete", "export"],
    invoices: ["view", "create", "edit", "delete", "duplicate", "send_email", "record_payment", "export"],
    quotations: ["view", "create", "edit", "delete", "approve", "reject", "duplicate", "convert", "export"],
    payments: ["view", "create", "edit", "delete", "export"],
    expenses: ["view", "create", "edit", "delete", "export"],
    taxes: ["view", "create", "edit", "delete"],
    reports: ["view", "export"],
    settings: ["view", "manage_settings"],
    users: ["view", "create", "edit", "delete", "manage_users"],
    notifications: ["view"],
    "audit-logs": ["view", "export"],
  },
  ADMIN: {
    dashboard: ["view"],
    clients: ["view", "create", "edit", "delete", "export"],
    invoices: ["view", "create", "edit", "delete", "duplicate", "send_email", "record_payment", "export"],
    quotations: ["view", "create", "edit", "delete", "approve", "reject", "duplicate", "convert", "export"],
    payments: ["view", "create", "edit", "delete", "export"],
    expenses: ["view", "create", "edit", "delete", "export"],
    taxes: ["view", "create", "edit", "delete"],
    reports: ["view", "export"],
    settings: ["view", "manage_settings"],
    users: ["view", "create", "edit", "manage_users"],
    notifications: ["view"],
    "audit-logs": ["view"],
  },
  SALES: {
    dashboard: ["view"],
    clients: ["view", "create", "edit", "delete", "export"],
    invoices: ["view", "create", "edit", "duplicate", "send_email", "export"],
    quotations: ["view", "create", "edit", "delete", "duplicate", "convert", "export"],
    payments: ["view"],
    taxes: ["view"],
    reports: ["view", "export"],
    notifications: ["view"],
  },
  FINANCE: {
    dashboard: ["view"],
    clients: ["view"],
    invoices: ["view", "record_payment", "export"],
    quotations: ["view"],
    payments: ["view", "create", "edit", "delete", "export"],
    expenses: ["view", "create", "edit", "delete", "export"],
    taxes: ["view"],
    reports: ["view", "export"],
    notifications: ["view"],
  },
  VIEWER: {
    dashboard: ["view"],
    clients: ["view"],
    invoices: ["view"],
    quotations: ["view"],
    payments: ["view"],
    expenses: ["view"],
    taxes: ["view"],
    reports: ["view"],
    notifications: ["view"],
  },
};

/**
 * Helper to check if a given user role has permission for a specific module and action
 */
export function hasPermission(
  role: string | undefined | null,
  module: SystemModule,
  action: PermissionAction = "view"
): boolean {
  if (!role) return false;
  const userRole = role.toUpperCase() as UserRole;
  const modulePermissions = PERMISSION_MATRIX[userRole]?.[module];
  return Boolean(modulePermissions?.includes(action));
}

/**
 * Helper to check if a user role is allowed to access a page route
 */
export function canAccessRoute(role: string | undefined | null, routePath: string): boolean {
  if (!role) return false;
  const userRole = role.toUpperCase() as UserRole;

  switch (routePath) {
    case "/dashboard":
      return true;
    case "/clients":
      return Boolean(PERMISSION_MATRIX[userRole]?.clients?.includes("view"));
    case "/invoices":
      return Boolean(PERMISSION_MATRIX[userRole]?.invoices?.includes("view"));
    case "/quotations":
      return Boolean(PERMISSION_MATRIX[userRole]?.quotations?.includes("view"));
    case "/payments":
      return Boolean(PERMISSION_MATRIX[userRole]?.payments?.includes("view"));
    case "/expenses":
      return Boolean(PERMISSION_MATRIX[userRole]?.expenses?.includes("view"));
    case "/taxes":
      return Boolean(PERMISSION_MATRIX[userRole]?.taxes?.includes("view"));
    case "/reports":
      return Boolean(PERMISSION_MATRIX[userRole]?.reports?.includes("view"));
    case "/settings":
      return Boolean(PERMISSION_MATRIX[userRole]?.settings?.includes("view"));
    case "/users":
      return Boolean(PERMISSION_MATRIX[userRole]?.users?.includes("view"));
    case "/notifications":
      return true;
    case "/audit-logs":
      return Boolean(PERMISSION_MATRIX[userRole]?.["audit-logs"]?.includes("view"));
    default:
      return false;
  }
}
