import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import Button from '../ui/Button';

const UserMenu = () => {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
  };

  const getDashboardLink = () => {
    if (user?.role === 'farmer') return '/dashboard-farmer-home';
    if (user?.role === 'buyer') return '/dashboard-buyer-home';
    if (user?.role === 'admin') return '/admin-dashboard';
    return '/app';
  };

  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-h-[44px]"
      >
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <span className="text-primary-foreground text-xs font-bold">
            {user?.name?.charAt(0)?.toUpperCase() || 'U'}
          </span>
        </div>
        <span className="hidden sm:inline">{user?.name || 'User'}</span>
      </Button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-48 sm:w-56 bg-white rounded-lg shadow-lg border z-20">
            <div className="py-1">
              <div className="px-4 py-3 text-sm text-gray-700 border-b">
                <div className="font-medium">{user?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{user?.role}</div>
              </div>

              <a
                href={getDashboardLink()}
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 min-h-[44px]"
                onClick={() => setIsOpen(false)}
              >
                Dashboard
              </a>

              <a
                href="/user-profile-management"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 min-h-[44px]"
                onClick={() => setIsOpen(false)}
              >
                Profile
              </a>

              <a
                href="/notifications"
                className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-100 min-h-[44px]"
                onClick={() => setIsOpen(false)}
              >
                Notifications
              </a>

              <button
                onClick={handleLogout}
                className="flex items-center w-full text-left px-4 py-3 text-sm text-red-600 hover:bg-red-50 min-h-[44px]"
              >
                Sign Out
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export { UserMenu };
