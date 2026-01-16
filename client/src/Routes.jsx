import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import { Navigate } from "react-router-dom";
import { useAuth } from "./hooks/useAuth.jsx";
import DevMode from './components/DevMode.jsx';
import AuthenticationPage from './pages/authentication-login-register';

// Import separated route files
import { publicRoutes } from './routes/publicRoutes';
import { adminRoutes } from './routes/adminRoutes';
import { farmerRoutes } from './routes/farmerRoutes';
import { buyerRoutes } from './routes/buyerRoutes';
import { sharedRoutes } from './routes/sharedRoutes';

const RoleRedirect = () => {
  const { isAuthenticated, loading, user } = useAuth();
  const userRole = user?.role || localStorage.getItem('userRole');

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <AuthenticationPage />;
  }

  // Redirect to role-specific dashboard using new route structure
  if (userRole === 'admin') {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (userRole === 'farmer') {
    return <Navigate to="/farmer/dashboard" replace />;
  }

  if (userRole === 'buyer') {
    return <Navigate to="/buyer/dashboard" replace />;
  }

  // Fallback to buyer dashboard
  return <Navigate to="/buyer/dashboard" replace />;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
        <ScrollToTop />
        <RouterRoutes>
          {/* Public Routes - No authentication required */}
          {publicRoutes}

          {/* Role Redirect */}
          <Route path="/app" element={<RoleRedirect />} />

          {/* Admin Routes - Admin role required */}
          {adminRoutes}

          {/* Farmer Routes - Farmer role required */}
          {farmerRoutes}

          {/* Buyer Routes - Buyer role required */}
          {buyerRoutes}

          {/* Shared Routes - Any authenticated user */}
          {sharedRoutes}

          {/* 404 - Not Found */}
          <Route path="*" element={<NotFound />} />
        </RouterRoutes>
        <DevMode />
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
