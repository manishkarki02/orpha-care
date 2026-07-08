import { useAuthStore } from "@/store/auth-store";
import { Navigate, Outlet } from "@tanstack/react-router";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children?: ReactNode;
  allowedRoles?: ("USER" | "ADMIN")[];
}

// Tanstack Router might handle this differently (e.g. via beforeLoad), 
// but for component-level protection or wrapping:
export const ProtectedRoute = ({ allowedRoles, children }: ProtectedRouteProps) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/sign-in" />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" />; // Or unauthorized page
  }

  return children ? <>{children}</> : <Outlet />;
};
