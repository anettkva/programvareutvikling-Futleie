import { Navigate } from "react-router-dom";
import Cookie from "js-cookie";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const userCookie = Cookie.get("user");
  const isAuthenticated = userCookie && userCookie.length > 0;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}
