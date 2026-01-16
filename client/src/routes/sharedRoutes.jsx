import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from '../components/ProtectedRoute';
import UserProfileManagement from '../pages/user-profile-management';
import NotificationsPage from '../pages/notifications';
import ChatPage from '../pages/chat';
import HelpPage from '../pages/help';
import PaymentsPage from '../pages/payments';
import OrderManagement from '../pages/order-management';
import MarketTrendsDashboard from '../pages/market-trends-dashboard';

/**
 * Shared routes accessible to authenticated users (any role)
 * These routes don't have role restrictions but require authentication
 */
export const sharedRoutes = (
  <>
    {/* Profile Management - accessible to all authenticated users */}
    <Route path="/profile" element={
      <ProtectedRoute>
        <UserProfileManagement />
      </ProtectedRoute>
    } />

    {/* Notifications - accessible to all authenticated users */}
    <Route path="/notifications" element={
      <ProtectedRoute>
        <NotificationsPage />
      </ProtectedRoute>
    } />

    {/* Chat - accessible to all authenticated users */}
    <Route path="/chat" element={
      <ProtectedRoute>
        <ChatPage />
      </ProtectedRoute>
    } />

    {/* Help - accessible to all authenticated users */}
    <Route path="/help" element={
      <ProtectedRoute>
        <HelpPage />
      </ProtectedRoute>
    } />

    {/* Payments - role-based component inside */}
    <Route path="/payments" element={
      <ProtectedRoute>
        <PaymentsPage />
      </ProtectedRoute>
    } />

    {/* Order Management - general view (role-specific views in role routes) */}
    <Route path="/orders" element={
      <ProtectedRoute>
        <OrderManagement />
      </ProtectedRoute>
    } />

    {/* Market Trends - general view (role-specific views in role routes) */}
    <Route path="/market-trends" element={
      <ProtectedRoute>
        <MarketTrendsDashboard />
      </ProtectedRoute>
    } />

    {/* Legacy routes for backward compatibility */}
    <Route path="/user-profile-management" element={
      <ProtectedRoute>
        <UserProfileManagement />
      </ProtectedRoute>
    } />
    <Route path="/order-management" element={
      <ProtectedRoute>
        <OrderManagement />
      </ProtectedRoute>
    } />
    <Route path="/market-trends-dashboard" element={
      <ProtectedRoute>
        <MarketTrendsDashboard />
      </ProtectedRoute>
    } />
  </>
);
