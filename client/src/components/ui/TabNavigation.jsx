import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';


const TabNavigation = ({ userRole = 'farmer', notificationCounts = {} }) => {
  const location = useLocation();
  const navigate = useNavigate();

  // Role-based navigation configuration
  const getNavigationItems = () => {
    const baseItems = [
      {
        id: 'profile',
        label: 'Profile',
        labelAm: 'መገለጫ',
        icon: 'User',
        path: '/user-profile-management',
        roles: ['farmer', 'buyer']
      }
    ];

    if (userRole === 'farmer') {
      return [
        {
          id: 'dashboard',
          label: 'Dashboard',
          labelAm: 'ዳሽቦርድ',
          icon: 'LayoutDashboard',
          path: '/dashboard-farmer-home',
          roles: ['farmer']
        },
        {
          id: 'orders',
          label: 'Orders',
          labelAm: 'ትዕዛዞች',
          icon: 'ShoppingBag',
          path: '/order-management',
          roles: ['farmer'],
          badge: notificationCounts?.orders || 0
        },
        {
          id: 'market',
          label: 'Market',
          labelAm: 'ገበያ',
          icon: 'TrendingUp',
          path: '/market-trends-dashboard',
          roles: ['farmer', 'buyer']
        },
        ...baseItems
      ];
    } else {
      return [
        {
          id: 'browse',
          label: 'Browse',
          labelAm: 'ፈልግ',
          icon: 'Search',
          path: '/browse-listings-buyer-home',
          roles: ['buyer']
        },
        {
          id: 'orders',
          label: 'Orders',
          labelAm: 'ትዕዛዞች',
          icon: 'ShoppingBag',
          path: '/order-management',
          roles: ['buyer'],
          badge: notificationCounts?.orders || 0
        },
        {
          id: 'market',
          label: 'Market',
          labelAm: 'ገበያ',
          icon: 'TrendingUp',
          path: '/market-trends-dashboard',
          roles: ['farmer', 'buyer']
        },
        ...baseItems
      ];
    }
  };

  const navigationItems = getNavigationItems();

  const isActive = (path) => {
    return location?.pathname === path;
  };

  const handleNavigation = (path) => {
    navigate(path);
  };

  return (
    <nav className="fixed top-16 lg:top-18 left-0 right-0 z-40 bg-surface border-b border-border shadow-warm">
      <div className="flex items-center justify-center lg:justify-start lg:px-6">
        <div className="flex w-full lg:w-auto">
          {navigationItems?.map((item, index) => {
            const active = isActive(item?.path);
            
            return (
              <button
                key={item?.id}
                onClick={() => handleNavigation(item?.path)}
                className={`
                  relative flex-1 lg:flex-none flex flex-col lg:flex-row items-center justify-center lg:justify-start
                  px-3 lg:px-4 py-3 lg:py-4 space-y-1 lg:space-y-0 lg:space-x-2
                  text-sm font-medium transition-smooth min-h-[64px] lg:min-h-[56px]
                  ${active 
                    ? 'text-primary bg-primary/5 border-b-2 lg:border-b-0 lg:border-r-2 border-primary' :'text-text-secondary hover:text-primary hover:bg-primary/5'
                  }
                  ${index === 0 ? 'border-l-0' : 'border-l border-border lg:border-l-0'}
                `}
              >
                <div className="relative">
                  <Icon 
                    name={item?.icon} 
                    size={20} 
                    className={`transition-smooth ${active ? 'text-primary' : 'text-current'}`}
                  />
                  {item?.badge && item?.badge > 0 && (
                    <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-accent-foreground text-xs font-medium rounded-full flex items-center justify-center">
                      {item?.badge > 99 ? '99+' : item?.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs lg:text-sm transition-smooth ${active ? 'text-primary font-medium' : 'text-current'}`}>
                  {item?.label}
                </span>
                {/* Active indicator for desktop */}
                {active && (
                  <div className="hidden lg:block absolute right-0 top-1/2 transform -translate-y-1/2 w-1 h-8 bg-primary rounded-l-full" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export default TabNavigation;