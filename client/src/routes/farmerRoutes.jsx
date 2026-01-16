import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from '../components/ProtectedRoute';
import DashboardFarmerHome from '../pages/dashboard-farmer-home';
import FarmerMyListings from '../pages/farmer-my-listings';
import AddListing from '../pages/add-listing';
import FarmerOrders from '../pages/order-management/FarmerOrders.jsx';
import FarmerActivityPage from '../pages/dashboard-farmer-home/components/FarmerActivityPage.jsx';
import FarmerMarketTrends from '../pages/farmer-market-trends';
import FarmerReviews from '../pages/reviews/FarmerReviews.jsx';
import FarmerPaymentPage from '../pages/payments/FarmerPaymentPage.jsx';
import UserProfileManagement from '../pages/user-profile-management';
import NotificationsPage from '../pages/notifications';
import ChatPage from '../pages/chat';
import HelpPage from '../pages/help';

/**
 * Farmer-only routes
 * All routes require farmer role
 */
export const farmerRoutes = (
  <>
    {/* Farmer Dashboard */}
    <Route path="/farmer/dashboard" element={
      <ProtectedRoute requiredRole="farmer">
        <DashboardFarmerHome />
      </ProtectedRoute>
    } />

    {/* Farmer Listings */}
    <Route path="/farmer/listings" element={
      <ProtectedRoute requiredRole="farmer">
        <FarmerMyListings />
      </ProtectedRoute>
    } />
    <Route path="/farmer/listings/add" element={
      <ProtectedRoute requiredRole="farmer">
        <AddListing />
      </ProtectedRoute>
    } />

    {/* Farmer Orders */}
    <Route path="/farmer/orders" element={
      <ProtectedRoute requiredRole="farmer">
        <FarmerOrders />
      </ProtectedRoute>
    } />

    {/* Farmer Activity */}
    <Route path="/farmer/activity" element={
      <ProtectedRoute requiredRole="farmer">
        <FarmerActivityPage />
      </ProtectedRoute>
    } />

    {/* Farmer Market Trends */}
    <Route path="/farmer/market-trends" element={
      <ProtectedRoute requiredRole="farmer">
        <FarmerMarketTrends />
      </ProtectedRoute>
    } />

    {/* Farmer Reviews */}
    <Route path="/farmer/reviews" element={
      <ProtectedRoute requiredRole="farmer">
        <FarmerReviews />
      </ProtectedRoute>
    } />

    {/* Farmer Payments */}
    <Route path="/farmer/payments" element={
      <ProtectedRoute requiredRole="farmer">
        <FarmerPaymentPage />
      </ProtectedRoute>
    } />

    {/* Farmer Profile */}
    <Route path="/farmer/profile" element={
      <ProtectedRoute requiredRole="farmer">
        <UserProfileManagement />
      </ProtectedRoute>
    } />

    {/* Shared Features */}
    <Route path="/farmer/notifications" element={
      <ProtectedRoute requiredRole="farmer">
        <NotificationsPage />
      </ProtectedRoute>
    } />
    <Route path="/farmer/chat" element={
      <ProtectedRoute requiredRole="farmer">
        <ChatPage />
      </ProtectedRoute>
    } />
    <Route path="/farmer/help" element={
      <ProtectedRoute requiredRole="farmer">
        <HelpPage />
      </ProtectedRoute>
    } />

    {/* Legacy routes for backward compatibility */}
    <Route path="/dashboard-farmer-home" element={
      <ProtectedRoute requiredRole="farmer">
        <DashboardFarmerHome />
      </ProtectedRoute>
    } />
    <Route path="/farmer-my-listings" element={
      <ProtectedRoute requiredRole="farmer">
        <FarmerMyListings />
      </ProtectedRoute>
    } />
    <Route path="/add-listing" element={
      <ProtectedRoute requiredRole="farmer">
        <AddListing />
      </ProtectedRoute>
    } />
    <Route path="/orders-farmer" element={
      <ProtectedRoute requiredRole="farmer">
        <FarmerOrders />
      </ProtectedRoute>
    } />
    <Route path="/farmer-activity" element={
      <ProtectedRoute requiredRole="farmer">
        <FarmerActivityPage />
      </ProtectedRoute>
    } />
    <Route path="/farmer-market-trends" element={
      <ProtectedRoute requiredRole="farmer">
        <FarmerMarketTrends />
      </ProtectedRoute>
    } />
    <Route path="/farmer-reviews" element={
      <ProtectedRoute requiredRole="farmer">
        <FarmerReviews />
      </ProtectedRoute>
    } />
  </>
);
