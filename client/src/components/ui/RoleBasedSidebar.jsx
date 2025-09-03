import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const RoleBasedSidebar = ({ userRole, isAuthenticated, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();

  const farmerMenuItems = [
    {
      name: 'Dashboard',
      nameAm: 'ዳሽቦርድ',
      path: '/dashboard-farmer-home',
      icon: 'Home'
    },
    {
      name: 'Add Listing',
      nameAm: 'ዝርዝር ጨምር',
      path: '/add-listing',
      icon: 'Plus'
    },
    {
      name: 'Orders',
      nameAm: 'ትዕዛዞች',
      path: '/order-management',
      icon: 'ShoppingCart'
    },
    {
      name: 'Market Trends',
      nameAm: 'የገበያ አዝማሚያዎች',
      path: '/market-trends-dashboard',
      icon: 'TrendingUp'
    },
    {
      name: 'Profile',
      nameAm: 'መገለጫ',
      path: '/user-profile-management',
      icon: 'User'
    }
  ];

  const buyerMenuItems = [
    {
      name: 'Dashboard',
      nameAm: 'ዳሽቦርድ',
      path: '/dashboard-buyer-home',
      icon: 'Home'
    },
    {
      name: 'Browse Listings',
      nameAm: 'ዝርዝሮችን ያስሱ',
      path: '/browse-listings-buyer-home',
      icon: 'Search'
    },
    {
      name: 'Orders',
      nameAm: 'ትዕዛዞች',
      path: '/order-management',
      icon: 'ShoppingCart'
    },
    {
      name: 'Market Trends',
      nameAm: 'የገበያ አዝማሚያዎች',
      path: '/market-trends-dashboard',
      icon: 'TrendingUp'
    },
    {
      name: 'Profile',
      nameAm: 'መገለጫ',
      path: '/user-profile-management',
      icon: 'User'
    }
  ];

  const menuItems = userRole === 'farmer' ? farmerMenuItems : buyerMenuItems;

  const isActive = (path) => {
    return location.pathname === path;
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`fixed left-0 top-16 h-full bg-card border-r border-border transition-all duration-300 z-40 ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-4 w-6 h-6 bg-primary text-white rounded-full flex items-center justify-center hover:bg-primary/90 transition-colors"
      >
        <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} className="w-4 h-4" />
      </button>

      {/* Menu Items */}
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
              isActive(item.path)
                ? 'bg-primary text-white'
                : 'text-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <Icon name={item.icon} className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && (
              <span className="font-medium">{item.name}</span>
            )}
          </Link>
        ))}
      </nav>
    </div>
  );
};

export default RoleBasedSidebar;

