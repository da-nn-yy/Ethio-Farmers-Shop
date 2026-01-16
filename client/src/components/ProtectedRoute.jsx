import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.jsx";
import FullScreenLoader from "./ui/FullScreenLoader";

const ProtectedRoute = ({ children, requiredRole = null }) => {
  const { isAuthenticated, loading, user } = useAuth();
  const userRole = user?.role || localStorage.getItem("userRole");

  if (loading) {
    // Per-route loading message based on requiredRole
    const label = requiredRole === 'farmer'
      ? 'Preparing your farmer dashboard…'
      : requiredRole === 'buyer'
        ? 'Preparing your buyer dashboard…'
        : 'Authenticating…';
    return <FullScreenLoader label={label} logoSrc="/favicon.ico" />;
  }

  if (!isAuthenticated) {
    // Redirect to admin login if accessing admin routes, otherwise user login
    const isAdminRoute = window.location.pathname.startsWith('/admin');
    return <Navigate to={isAdminRoute ? "/admin-login" : "/authentication-login-register"} replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    // Redirect to role-specific dashboard using new route structure
    const fallback = userRole === 'admin' ? '/admin/dashboard' :
                     userRole === 'farmer' ? '/farmer/dashboard' :
                     userRole === 'buyer' ? '/buyer/dashboard' : '/authentication-login-register';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
