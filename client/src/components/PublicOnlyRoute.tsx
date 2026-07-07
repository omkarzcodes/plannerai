import { Navigate, Outlet } from "react-router";
import { useAuthStore } from "@/stores/auth";

export function PublicOnlyRoute() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  if (isAuthenticated) return <Navigate to="/" replace />;
  return <Outlet />;
}
