import React from "react";
import { Route } from "react-router-dom";
import ProtectedRoute from '../components/ProtectedRoute';
import BuyerDashboard from '../pages/dashboard-buyer-home';
import BrowseListingsBuyerHome from '../pages/browse-listings-buyer-home';
import BuyerMarketTrends from '../pages/buyer-market-trends';
import FavoritesPage from '../pages/favorites';
import CartPage from '../pages/cart';
import BuyerPaymentPage from '../pages/payments/BuyerPaymentPage.jsx';
import ListingReviewsPage from '../pages/listing-reviews';
import UserReviewsPage from '../pages/user-reviews';
import UserProfileManagement from '../pages/user-profile-management';
import NotificationsPage from '../pages/notifications';
import ChatPage from '../pages/chat';
import HelpPage from '../pages/help';

/**
 * Buyer-only routes
 * All routes require buyer role
 */
export const buyerRoutes = (
  <>
    {/* Buyer Dashboard */}
    <Route path="/buyer/dashboard" element={
      <ProtectedRoute requiredRole="buyer">
        <BuyerDashboard />
      </ProtectedRoute>
    } />

    {/* Buyer Browse & Shop */}
    <Route path="/buyer/listings" element={
      <ProtectedRoute requiredRole="buyer">
        <BrowseListingsBuyerHome />
      </ProtectedRoute>
    } />
    <Route path="/buyer/favorites" element={
      <ProtectedRoute requiredRole="buyer">
        <FavoritesPage />
      </ProtectedRoute>
    } />
    <Route path="/buyer/cart" element={
      <ProtectedRoute requiredRole="buyer">
        <CartPage />
      </ProtectedRoute>
    } />

    {/* Buyer Market Trends */}
    <Route path="/buyer/market-trends" element={
      <ProtectedRoute requiredRole="buyer">
        <BuyerMarketTrends />
      </ProtectedRoute>
    } />

    {/* Buyer Reviews */}
    <Route path="/buyer/reviews" element={
      <ProtectedRoute requiredRole="buyer">
        <UserReviewsPage />
      </ProtectedRoute>
    } />
    <Route path="/buyer/listings/:id/reviews" element={
      <ProtectedRoute requiredRole="buyer">
        <ListingReviewsPage />
      </ProtectedRoute>
    } />

    {/* Buyer Payments */}
    <Route path="/buyer/payments" element={
      <ProtectedRoute requiredRole="buyer">
        <BuyerPaymentPage />
      </ProtectedRoute>
    } />

    {/* Buyer Profile */}
    <Route path="/buyer/profile" element={
      <ProtectedRoute requiredRole="buyer">
        <UserProfileManagement />
      </ProtectedRoute>
    } />

    {/* Shared Features */}
    <Route path="/buyer/notifications" element={
      <ProtectedRoute requiredRole="buyer">
        <NotificationsPage />
      </ProtectedRoute>
    } />
    <Route path="/buyer/chat" element={
      <ProtectedRoute requiredRole="buyer">
        <ChatPage />
      </ProtectedRoute>
    } />
    <Route path="/buyer/help" element={
      <ProtectedRoute requiredRole="buyer">
        <HelpPage />
      </ProtectedRoute>
    } />

    {/* Legacy routes for backward compatibility */}
    <Route path="/dashboard-buyer-home" element={
      <ProtectedRoute requiredRole="buyer">
        <BuyerDashboard />
      </ProtectedRoute>
    } />
    <Route path="/browse-listings-buyer-home" element={
      <ProtectedRoute requiredRole="buyer">
        <BrowseListingsBuyerHome />
      </ProtectedRoute>
    } />
    <Route path="/favorites" element={
      <ProtectedRoute requiredRole="buyer">
        <FavoritesPage />
      </ProtectedRoute>
    } />
    <Route path="/cart" element={
      <ProtectedRoute requiredRole="buyer">
        <CartPage />
      </ProtectedRoute>
    } />
    <Route path="/buyer-market-trends" element={
      <ProtectedRoute requiredRole="buyer">
        <BuyerMarketTrends />
      </ProtectedRoute>
    } />
    <Route path="/user-reviews" element={
      <ProtectedRoute requiredRole="buyer">
        <UserReviewsPage />
      </ProtectedRoute>
    } />
    <Route path="/listing/:id/reviews" element={
      <ProtectedRoute requiredRole="buyer">
        <ListingReviewsPage />
      </ProtectedRoute>
    } />
  </>
);
