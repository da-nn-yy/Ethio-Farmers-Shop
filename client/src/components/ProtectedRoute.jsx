import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("userRole");

  if (!isAuthenticated) {
    return <Navigate to="/authentication-login-register" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirect users without the right role to their own dashboard if possible
    const fallback = userRole === 'farmer' ? '/dashboard-farmer-home' : '/dashboard-buyer-home';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
