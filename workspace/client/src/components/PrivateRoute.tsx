import React from "react";
import { Navigate, useLocation } from "react-router-dom";

interface PrivateRouteProps {
  children: React.ReactElement;
  allowedRoles?: string[];
}

// Helper function to get user data from localStorage (using the correct key)
function getCurrentUser() {
  try {
    const str = localStorage.getItem("tm_user");
    return str ? JSON.parse(str) : null;
  } catch {
    return null;
  }
}

/**
 * PrivateRoute: Secure wrapper for protected routes
 * - Checks for authentication token
 * - Checks if user has the required role
 * - Redirects to login if unauthenticated
 * - Redirects to unauthorized if access denied
 */
const PrivateRoute: React.FC<PrivateRouteProps> = ({ children, allowedRoles }) => {
  const location = useLocation();

  const token = localStorage.getItem("tm_token");
  const user = getCurrentUser();

  if (!token || !user) {
    // Not authenticated: redirect to login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role || "")) {
    // Authenticated but unauthorized: redirect to unauthorized page
    return <Navigate to="/unauthorized" replace />;
  }

  // Authorized: render child routes/components
  return children;
};

export default PrivateRoute;
