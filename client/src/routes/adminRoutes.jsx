import React from "react";
import { Route, Navigate } from "react-router-dom";
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../components/ui/AdminLayout';
import AdminDashboard from '../pages/admin-dashboard';
import AdminUsers from '../pages/admin-users';
import AdminListings from '../pages/admin-listings';
import AdminOrders from '../pages/admin-orders';
import AdminAnalytics from '../pages/admin-analytics';
import AdminSettings from '../pages/admin-settings';
import AdminChat from '../pages/admin-chat';
import AdminNotifications from '../pages/admin-notifications';
import AdminPayments from '../pages/admin-payments';
import AdminContent from '../pages/admin-content';
import AdminMarketplace from '../pages/admin-marketplace';
import AdminFinancial from '../pages/admin-financial';
import AdminSecurity from '../pages/admin-security';

/**
 * Admin-only routes
 * All routes require admin role and use AdminLayout
 */
const AdminRouteWrapper = ({ children }) => (
  <ProtectedRoute requiredRole="admin">
    <AdminLayout>
      {children}
    </AdminLayout>
  </ProtectedRoute>
);

export const adminRoutes = (
  <>
    <Route path="/admin/dashboard" element={
      <AdminRouteWrapper>
        <AdminDashboard />
      </AdminRouteWrapper>
    } />
    <Route path="/admin/users" element={
      <AdminRouteWrapper>
        <AdminUsers />
      </AdminRouteWrapper>
    } />
    <Route path="/admin/listings" element={
      <AdminRouteWrapper>
        <AdminListings />
      </AdminRouteWrapper>
    } />
    <Route path="/admin/orders" element={
      <AdminRouteWrapper>
        <AdminOrders />
      </AdminRouteWrapper>
    } />
    <Route path="/admin/analytics" element={
      <AdminRouteWrapper>
        <AdminAnalytics />
      </AdminRouteWrapper>
    } />
    <Route path="/admin/settings" element={
      <AdminRouteWrapper>
        <AdminSettings />
      </AdminRouteWrapper>
    } />
    <Route path="/admin/chat" element={
      <AdminRouteWrapper>
        <AdminChat />
      </AdminRouteWrapper>
    } />
    <Route path="/admin/notifications" element={
      <AdminRouteWrapper>
        <AdminNotifications />
      </AdminRouteWrapper>
    } />
    <Route path="/admin/payments" element={
      <AdminRouteWrapper>
        <AdminPayments />
      </AdminRouteWrapper>
    } />
    <Route path="/admin/content" element={
      <AdminRouteWrapper>
        <AdminContent />
      </AdminRouteWrapper>
    } />
    <Route path="/admin/marketplace" element={
      <AdminRouteWrapper>
        <AdminMarketplace />
      </AdminRouteWrapper>
    } />
    <Route path="/admin/financial" element={
      <AdminRouteWrapper>
        <AdminFinancial />
      </AdminRouteWrapper>
    } />
    <Route path="/admin/security" element={
      <AdminRouteWrapper>
        <AdminSecurity />
      </AdminRouteWrapper>
    } />

    {/* Legacy admin routes: redirect to new canonical `/admin/...` paths */}
    <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
    <Route path="/admin-users" element={<Navigate to="/admin/users" replace />} />
    <Route path="/admin-listings" element={<Navigate to="/admin/listings" replace />} />
    <Route path="/admin-orders" element={<Navigate to="/admin/orders" replace />} />
    <Route path="/admin-analytics" element={<Navigate to="/admin/analytics" replace />} />
    <Route path="/admin-settings" element={<Navigate to="/admin/settings" replace />} />
    <Route path="/admin-chat" element={<Navigate to="/admin/chat" replace />} />
    <Route path="/admin-notifications" element={<Navigate to="/admin/notifications" replace />} />
    <Route path="/admin-payments" element={<Navigate to="/admin/payments" replace />} />
    <Route path="/admin-content" element={<Navigate to="/admin/content" replace />} />
    <Route path="/admin-marketplace" element={<Navigate to="/admin/marketplace" replace />} />
    <Route path="/admin-financial" element={<Navigate to="/admin/financial" replace />} />
    <Route path="/admin-security" element={<Navigate to="/admin/security" replace />} />
  </>
);
