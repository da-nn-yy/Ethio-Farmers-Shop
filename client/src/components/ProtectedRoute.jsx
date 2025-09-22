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
    return <Navigate to="/authentication-login-register" replace />;
  }

  if (requiredRole && userRole !== requiredRole) {
    const fallback = userRole === 'admin' ? '/admin-dashboard' : 
                     userRole === 'farmer' ? '/dashboard-farmer-home' : '/dashboard-buyer-home';
    return <Navigate to={fallback} replace />;
  }

  return children;
};

export default ProtectedRoute;
