import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import { useLanguage } from '../../hooks/useLanguage.jsx';
import Button from './Button.jsx';
import Icon from '../AppIcon.jsx';
import CartIcon from './CartIcon.jsx';
import NotificationBell from '../NotificationBell.jsx';

const AdminLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { language, toggleLanguage } = useLanguage();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const currentLanguage = language || 'en';

  const translations = {
    en: {
      adminDashboard: 'Admin Dashboard',
      logout: 'Logout',
      profile: 'Profile',
      settings: 'Settings',
      help: 'Help'
    },
    am: {
      adminDashboard: 'የአስተዳደር ዳሽቦርድ',
      logout: 'ውጣ',
      profile: 'መገለጫ',
      settings: 'ቅንብሮች',
      help: 'እርዳታ'
    }
  };

  const t = translations[currentLanguage];

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/admin-login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActiveRoute = (path) => {
    return location.pathname === path;
  };

  const adminMenuItems = [
    { path: '/admin/dashboard', label: 'Dashboard', labelAm: 'ዳሽቦርድ', icon: 'LayoutDashboard' },
    { path: '/admin/users', label: 'Users', labelAm: 'ተጠቃሚዎች', icon: 'Users' },
    { path: '/admin/listings', label: 'Listings', labelAm: 'ዝርዝሮች', icon: 'Package' },
    { path: '/admin/orders', label: 'Orders', labelAm: 'ትዕዛዞች', icon: 'ShoppingCart' },
    { path: '/admin/payments', label: 'Payments', labelAm: 'ክፍያዎች', icon: 'CreditCard' },
    { path: '/admin/analytics', label: 'Analytics', labelAm: 'ትንታኔ', icon: 'BarChart3' },
    { path: '/admin/notifications', label: 'Notifications', labelAm: 'ማሳወቂያዎች', icon: 'Bell' },
    { path: '/admin/chat', label: 'Chat', labelAm: 'ውይይት', icon: 'MessageCircle' },
    { path: '/admin/settings', label: 'Settings', labelAm: 'ቅንብሮች', icon: 'Settings' }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Title */}
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Icon name="Shield" size={20} color="white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    {currentLanguage === 'am' ? 'አስተዳደር' : 'Admin'}
                  </h1>
                  <p className="text-xs text-gray-500">
                    {currentLanguage === 'am' ? 'የኢትዮጵያ ገበሬዎች ሱቅ' : 'Ethio Farmers Shop'}
                  </p>
                </div>
              </div>
            </div>

            {/* Right Side Actions */}
            <div className="flex items-center space-x-4">
              {/* Language Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleLanguage}
                className="flex items-center space-x-2 text-gray-600 hover:text-primary"
              >
                <Icon name="Globe" size={16} />
                <span className="font-medium">{currentLanguage === 'en' ? 'EN' : 'አማ'}</span>
              </Button>

              {/* Notifications */}
              <NotificationBell />

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.full_name?.charAt(0) || user?.email?.charAt(0) || 'A'}
                    </span>
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-sm font-medium text-gray-900">
                      {user?.full_name || user?.email || 'Admin'}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user?.role || 'admin'}
                    </p>
                  </div>
                  <Icon
                    name={isUserMenuOpen ? "ChevronUp" : "ChevronDown"}
                    size={16}
                    className="text-gray-500"
                  />
                </button>

                {/* User Dropdown Menu */}
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                    <button
                      onClick={() => navigate('/admin/settings')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Icon name="Settings" size={16} className="mr-3" />
                      {t.settings}
                    </button>
                    <button
                      onClick={() => navigate('/user-profile-management')}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      <Icon name="User" size={16} className="mr-3" />
                      {t.profile}
                    </button>
                    <div className="border-t border-gray-100 my-1"></div>
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Icon name="LogOut" size={16} className="mr-3" />
                      {t.logout}
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-gray-200 min-h-screen">
          <nav className="p-4">
            <ul className="space-y-2">
              {adminMenuItems.map((item) => (
                <li key={item.path}>
                  <button
                    onClick={() => navigate(item.path)}
                    className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                      isActiveRoute(item.path)
                        ? 'bg-primary text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon
                      name={item.icon}
                      size={18}
                      className={`mr-3 ${
                        isActiveRoute(item.path) ? 'text-white' : 'text-gray-500'
                      }`}
                    />
                    {currentLanguage === 'am' ? item.labelAm : item.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;
