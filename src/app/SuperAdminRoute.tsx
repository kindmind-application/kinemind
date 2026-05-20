import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useRole } from "@/lib/auth/AuthContext";

export function SuperAdminRoute({ children }: { children: ReactNode }) {
  const { isSuperAdmin } = useRole();
  if (!isSuperAdmin) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
}
