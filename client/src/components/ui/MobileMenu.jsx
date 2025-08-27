import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import Button from './Button';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

const MobileMenu = ({
  isOpen = false,
  onClose,
  userRole = 'farmer',
  isAuthenticated = false,
  notificationCounts = {},
  currentLanguage = 'en'
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const getMenuItems = () => {
    const commonItems = [
      {
        id: 'market',
        label: 'Market Trends',
        labelAm: 'የገበያ አዝማሚያዎች',
        icon: 'TrendingUp',
        path: '/market-trends-dashboard',
        roles: ['farmer', 'buyer']
      },
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
          label: 'Order Management',
          labelAm: 'የትዕዛዝ አስተዳደር',
          icon: 'ShoppingBag',
          path: '/order-management',
          roles: ['farmer'],
          badge: notificationCounts?.orders || 0
        },
        ...commonItems
      ];
    } else {
      return [
        {
          id: 'browse',
          label: 'Browse Listings',
          labelAm: 'ዝርዝሮችን ፈልግ',
          icon: 'Search',
          path: '/browse-listings-buyer-home',
          roles: ['buyer']
        },
        {
          id: 'orders',
          label: 'My Orders',
          labelAm: 'የእኔ ትዕዛዞች',
          icon: 'ShoppingBag',
          path: '/order-management',
          roles: ['buyer'],
          badge: notificationCounts?.orders || 0
        },
        ...commonItems
      ];
    }
  };

  const secondaryItems = [
    {
      id: 'notifications',
      label: 'Notifications',
      labelAm: 'ማሳወቂያዎች',
      icon: 'Bell',
      badge: notificationCounts?.total || 0
    },
    {
      id: 'settings',
      label: 'Settings',
      labelAm: 'ቅንብሮች',
      icon: 'Settings'
    },
    {
      id: 'help',
      label: 'Help & Support',
      labelAm: 'እርዳታ እና ድጋፍ',
      icon: 'HelpCircle'
    }
  ];

  const handleNavigation = (path) => {
    if (path) {
      navigate(path);
    }
    onClose();
  };

  const handleLogout = async () => {
    try { await signOut(auth); } catch (_) {}
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    onClose();
    navigate('/authentication-login-register');
  };

  const isActive = (path) => {
    return location?.pathname === path;
  };

  const getLabel = (item) => {
    return currentLanguage === 'am' && item?.labelAm ? item?.labelAm : item?.label;
  };

  if (!isOpen) return null;

  return (
    <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={onClose}>
      <div
        className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-surface shadow-warm-lg animate-slide-in"
        onClick={(e) => e?.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Sprout" size={18} color="white" />
            </div>
            <span className="font-heading font-bold text-lg text-primary">
              FarmConnect
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-text-secondary"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="flex flex-col h-full overflow-y-auto pb-20">
          {/* User Info */}
          {isAuthenticated && (
            <div className="p-4 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full overflow-hidden">
                  <img
                    src="/assets/images/no_image.png"
                    alt="User"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/images/no_image.png';
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="font-medium text-text-primary">
                    {userRole === 'farmer' ? 'Abebe Kebede' : 'Sarah Johnson'}
                  </span>
                  <span className="text-sm text-text-secondary capitalize">
                    {userRole}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Main Navigation */}
          <div className="flex-1 py-4">
            <div className="px-4 mb-4">
              <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
                {currentLanguage === 'am' ? 'ዋና ዝርዝር' : 'Main Menu'}
              </h3>
            </div>

            <div className="space-y-1 px-2">
              {getMenuItems()?.map((item) => {
                const active = isActive(item?.path);

                return (
                  <button
                    key={item?.id}
                    onClick={() => handleNavigation(item?.path)}
                    className={`
                      w-full flex items-center justify-between p-3 rounded-lg transition-smooth
                      ${active
                        ? 'bg-primary/10 text-primary border border-primary/20' :'text-text-secondary hover:text-primary hover:bg-primary/5'
                      }
                    `}
                  >
                    <div className="flex items-center space-x-3">
                      <Icon
                        name={item?.icon}
                        size={20}
                        className={active ? 'text-primary' : 'text-current'}
                      />
                      <span className="font-medium">
                        {getLabel(item)}
                      </span>
                    </div>
                    {item?.badge && item?.badge > 0 && (
                      <span className="w-6 h-6 bg-accent text-accent-foreground text-xs font-medium rounded-full flex items-center justify-center">
                        {item?.badge > 99 ? '99+' : item?.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Secondary Items */}
            <div className="px-4 mt-8 mb-4">
              <h3 className="text-sm font-medium text-text-secondary uppercase tracking-wide">
                {currentLanguage === 'am' ? 'ሌሎች' : 'More'}
              </h3>
            </div>

            <div className="space-y-1 px-2">
              {secondaryItems?.map((item) => (
                <button
                  key={item?.id}
                  onClick={() => handleNavigation(item?.path)}
                  className="w-full flex items-center justify-between p-3 rounded-lg text-text-secondary hover:text-primary hover:bg-primary/5 transition-smooth"
                >
                  <div className="flex items-center space-x-3">
                    <Icon name={item?.icon} size={20} />
                    <span className="font-medium">
                      {getLabel(item)}
                    </span>
                  </div>

                  {item?.badge && item?.badge > 0 && (
                    <span className="w-6 h-6 bg-accent text-accent-foreground text-xs font-medium rounded-full flex items-center justify-center">
                      {item?.badge > 99 ? '99+' : item?.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Footer Actions */}
          {isAuthenticated && (
            <div className="p-4 border-t border-border">
              <Button
                variant="ghost"
                onClick={handleLogout}
                className="w-full justify-start text-error hover:text-error hover:bg-error/10"
              >
                <Icon name="LogOut" size={20} className="mr-3" />
                <span>{currentLanguage === 'am' ? 'ውጣ' : 'Sign Out'}</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MobileMenu;
