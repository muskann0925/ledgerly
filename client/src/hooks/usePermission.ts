import { useAuthStore } from "../modules/auth/auth.store";
import { hasPermission, canAccessRoute, type SystemModule, type PermissionAction } from "../utils/rbac";

export function usePermission() {
  const { user } = useAuthStore();
  const role = user?.role || "VIEWER";

  return {
    role,
    user,
    can: (module: SystemModule, action: PermissionAction = "view") => hasPermission(role, module, action),
    canAccess: (routePath: string) => canAccessRoute(role, routePath),
    isOwner: role === "OWNER",
    isAdmin: role === "ADMIN" || role === "OWNER",
    isSales: role === "SALES",
    isFinance: role === "FINANCE",
    isViewer: role === "VIEWER",
  };
}
