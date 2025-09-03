import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import DashboardFarmerHome from './pages/dashboard-farmer-home';
import AuthenticationPage from './pages/authentication-login-register';
import OrderManagement from './pages/order-management';
import UserProfileManagement from './pages/user-profile-management';
import MarketTrendsDashboard from './pages/market-trends-dashboard';
import BrowseListingsBuyerHome from './pages/browse-listings-buyer-home';
import BuyerDashboard from './pages/dashboard-buyer-home';
import AddListing from './pages/add-listing';
import ProtectedRoute from './components/ProtectedRoute';
import { Navigate } from "react-router-dom";

const RoleRedirect = () => {
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole');
  if (!isAuthenticated) return <AuthenticationPage />;
  if (userRole === 'farmer') return <Navigate to="/dashboard-farmer-home" replace />;
  return <Navigate to="/dashboard-buyer-home" replace />;
};

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Public */}
        <Route path="/" element={<RoleRedirect />} />
        <Route path="/authentication-login-register" element={<AuthenticationPage />} />

        {/* Protected by role */}
        <Route path="/dashboard-farmer-home" element={
          <ProtectedRoute requiredRole="farmer">
            <DashboardFarmerHome />
          </ProtectedRoute>
        } />
        <Route path="/dashboard-buyer-home" element={
          <ProtectedRoute requiredRole="buyer">
            <BuyerDashboard />
          </ProtectedRoute>
        } />

        {/* General protected pages (either role) */}
        <Route path="/order-management" element={
          <ProtectedRoute>
            <OrderManagement />
          </ProtectedRoute>
        } />
        <Route path="/user-profile-management" element={
          <ProtectedRoute>
            <UserProfileManagement />
          </ProtectedRoute>
        } />
        <Route path="/market-trends-dashboard" element={
          <ProtectedRoute>
            <MarketTrendsDashboard />
          </ProtectedRoute>
        } />
        <Route path="/browse-listings-buyer-home" element={
          <ProtectedRoute requiredRole="buyer">
            <BrowseListingsBuyerHome />
          </ProtectedRoute>
        } />
        <Route path="/add-listing" element={
          <ProtectedRoute requiredRole="farmer">
            <AddListing />
          </ProtectedRoute>
        } />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;
