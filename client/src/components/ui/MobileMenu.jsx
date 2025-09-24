import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useLanguage } from '../../hooks/useLanguage.jsx';
import Button from './Button';
import { LanguageSwitcher } from './LanguageSwitcher';

const MobileMenu = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();
  const { language } = useLanguage();

  const handleLogout = async () => {
    await logout();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Mobile Menu */}
      <div className="fixed top-0 right-0 h-full w-80 max-w-[85vw] bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">KG</span>
              </div>
              <h2 className="font-serif font-bold text-lg">Ke Geberew</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-4">
            <a
              href="/market-trends-dashboard"
              className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              onClick={onClose}
            >
              Market Trends
            </a>

            {user ? (
              <>
                <div className="border-t pt-4">
                  <div className="px-4 py-2 text-sm text-gray-500 mb-2">Account</div>
                  <a
                    href={user.role === 'farmer' ? '/dashboard-farmer-home' : '/dashboard-buyer-home'}
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    Dashboard
                  </a>
                  <a
                    href="/user-profile-management"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    Profile
                  </a>
                  <a
                    href="/notifications"
                    className="block px-4 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                    onClick={onClose}
                  >
                    Notifications
                  </a>
                </div>

                <div className="border-t pt-4">
                  <button
                    onClick={handleLogout}
                    className="block w-full text-left px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <div className="border-t pt-4 space-y-3">
                <Button
                  variant="outline"
                  className="w-full"
                  asChild
                >
                  <a href="/authentication-login-register" onClick={onClose}>
                    Sign In
                  </a>
                </Button>
                <Button
                  className="w-full"
                  asChild
                >
                  <a href="/authentication-login-register" onClick={onClose}>
                    Sign Up
                  </a>
                </Button>
              </div>
            )}
          </nav>

          {/* Language Switcher */}
          <div className="border-t p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Language</span>
              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export { MobileMenu };
export default MobileMenu;
