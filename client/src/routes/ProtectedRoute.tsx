import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../modules/auth/auth.store";
import { Loader2 } from "lucide-react";
import { UnauthorizedPage } from "../pages/UnauthorizedPage";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: string[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
  const { isAuthenticated, user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <Loader2 className="w-8 h-8 text-[#F97316] animate-spin mb-3" />
        <p className="text-sm font-medium text-slate-400">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <UnauthorizedPage />;
  }

  return <>{children}</>;
};
