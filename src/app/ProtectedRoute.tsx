import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { useAuth } from "@/lib/auth/AuthContext";

export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="p-8 text-gray-500">Cargando...</div>;
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}
