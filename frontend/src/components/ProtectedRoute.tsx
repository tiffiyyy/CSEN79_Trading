import { Navigate } from "react-router-dom";

const AUTH_KEY = "authenticated";
const USERNAME_KEY = "trading_current_username";

export function isAuthenticated(): boolean {
  return typeof window !== "undefined" && sessionStorage.getItem(AUTH_KEY) === "true";
}

export function setAuthenticated(username: string): void {
  sessionStorage.setItem(AUTH_KEY, "true");
  sessionStorage.setItem(USERNAME_KEY, username);
}

export function getCurrentUsername(): string | null {
  return typeof window !== "undefined" ? sessionStorage.getItem(USERNAME_KEY) : null;
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
