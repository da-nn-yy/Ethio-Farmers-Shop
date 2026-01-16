import React from "react";
import { Route } from "react-router-dom";
import LandingPage from '../pages/landing';
import AuthenticationPage from '../pages/authentication-login-register';
import ResetPasswordPage from '../pages/authentication-login-register/components/ResetPasswordPage';
import AdminLogin from '../pages/admin-login';
import AdminRegister from '../pages/admin-register';
import NotFound from '../pages/NotFound';

/**
 * Public routes accessible to all users (unauthenticated)
 */
export const publicRoutes = (
  <>
    <Route path="/" element={<LandingPage />} />
    <Route path="/landing" element={<LandingPage />} />
    <Route path="/admin-login" element={<AdminLogin />} />
    <Route path="/admin-register" element={<AdminRegister />} />
    <Route path="/authentication-login-register" element={<AuthenticationPage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
  </>
);
