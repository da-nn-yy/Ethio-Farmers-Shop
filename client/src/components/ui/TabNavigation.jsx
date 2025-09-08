import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { orderService } from '../../services/apiService';
import { useAuth } from '../../hooks/useAuth.jsx';


const TabNavigation = ({ userRole = 'farmer', notificationCounts = {} }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [ordersBadge, setOrdersBadge] = useState(0);

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        if (!isAuthenticated) return;
        const data = await orderService.getOrderStats();
        const pending = data?.stats?.pending_orders ?? 0;
        setOrdersBadge(Number(pending) || 0);
      } catch (_) {
        setOrdersBadge(0);
      }
    };
    fetchCounts();
    const interval = setInterval(fetchCounts, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

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
          badge: (typeof notificationCounts?.orders === 'number' ? notificationCounts.orders : ordersBadge)
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
          id: 'dashboard',
          label: 'Dashboard',
          labelAm: 'ዳሽቦርድ',
          icon: 'LayoutDashboard',
          path: '/dashboard-buyer-home',
          roles: ['buyer']
        },
        {
          id: 'orders',
          label: 'Orders',
          labelAm: 'ትዕዛዞች',
          icon: 'ShoppingBag',
          path: '/order-management',
          roles: ['buyer'],
          badge: (typeof notificationCounts?.orders === 'number' ? notificationCounts.orders : ordersBadge)
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
    <nav className="fixed left-0 right-0 z-40 border-b top-16 lg:top-18 bg-surface border-border shadow-warm">
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
                  {typeof item?.badge === 'number' && (
                    <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full -top-2 -right-2 bg-accent text-accent-foreground">
                      {item?.badge > 99 ? '99+' : item?.badge}
                    </span>
                  )}
                </div>
                <span className={`text-xs lg:text-sm transition-smooth ${active ? 'text-primary font-medium' : 'text-current'}`}>
                  {item?.label}
                </span>
                {/* Active indicator for desktop */}
                {active && (
                  <div className="absolute right-0 hidden w-1 h-8 transform -translate-y-1/2 rounded-l-full lg:block top-1/2 bg-primary" />
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
