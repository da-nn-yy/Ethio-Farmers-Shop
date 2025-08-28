
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';

const RoleBasedNavigation = ({ userRole, isCollapsed, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const farmerNavItems = [
    { id: 'dashboard', label: 'Dashboard', labelAm: 'ዳሽቦርድ', icon: 'Home', path: '/dashboard-farmer-home' },
    { id: 'orders', label: 'Orders', labelAm: 'ትዕዛዞች', icon: 'ShoppingCart', path: '/order-management' },
    { id: 'profile', label: 'Profile', labelAm: 'መገለጫ', icon: 'User', path: '/user-profile-management' },
    { id: 'trends', label: 'Market Trends', labelAm: 'የገበያ ዝንባሌ', icon: 'TrendingUp', path: '/market-trends-dashboard' }
  ];

  const buyerNavItems = [
    { id: 'dashboard', label: 'Dashboard', labelAm: 'ዳሽቦርድ', icon: 'Home', path: '/dashboard-buyer-home' },
    { id: 'browse', label: 'Browse Listings', labelAm: 'ዝርዝሮችን ያስሱ', icon: 'Search', path: '/browse-listings-buyer-home' },
    { id: 'profile', label: 'Profile', labelAm: 'መገለጫ', icon: 'User', path: '/user-profile-management' },
    { id: 'trends', label: 'Market Trends', labelAm: 'የገበያ ዝንባሌ', icon: 'TrendingUp', path: '/market-trends-dashboard' }
  ];

  const navItems = userRole === 'farmer' ? farmerNavItems : buyerNavItems;
  const currentLanguage = localStorage.getItem('farmconnect_language') || 'en';

  const isActive = (path) => location.pathname === path;

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-card border-r border-border transition-all duration-300 z-30 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Toggle Button */}
      <div className="flex justify-end p-4">
        <Button
          variant="ghost"
          size="sm"
          iconName={isCollapsed ? 'ChevronRight' : 'ChevronLeft'}
          onClick={onToggleCollapse}
          className="md:flex hidden"
        />
      </div>

      {/* Navigation Items */}
      <div className="px-3 space-y-2">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => handleNavigation(item.path)}
            className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-primary text-primary-foreground'
                : 'text-text-secondary hover:bg-accent hover:text-text-primary'
            }`}
          >
            <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="text-sm font-medium">
                {currentLanguage === 'am' ? item.labelAm : item.label}
              </span>
            )}
          </button>
        ))}
      </div>
    </nav>
  );
};

export default RoleBasedNavigation;
