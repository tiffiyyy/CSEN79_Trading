import { Navigate } from "react-router-dom";

const AUTH_KEY = "authenticated";

export function isAuthenticated(): boolean {
  return typeof window !== "undefined" && sessionStorage.getItem(AUTH_KEY) === "true";
}

export function setAuthenticated(): void {
  sessionStorage.setItem(AUTH_KEY, "true");
}

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
}
