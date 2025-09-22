import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useLanguage } from '../../hooks/useLanguage.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

const RoleBasedSidebar = ({ userRole, isAuthenticated, isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { logout } = useAuth();

  // State for enhanced admin features
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationCount, setNotificationCount] = useState(12);
  const [adminStats, setAdminStats] = useState({
    pendingApprovals: 8,
    systemAlerts: 3,
    activeUsers: 1247,
    criticalIssues: 2
  });
  const [expandedSections, setExpandedSections] = useState({
    management: true,
    analytics: true,
    system: false
  });

  const farmerMenuItems = [
    {
      name: 'Dashboard',
      nameAm: 'ዳሽቦርድ',
      path: '/dashboard-farmer-home',
      icon: 'Home'
    },
    {
      name: 'Payments',
      nameAm: 'ክፍያዎች',
      path: '/payments',
      icon: 'CreditCard'
    },
    {
      name: 'Add Listing',
      nameAm: 'ዝርዝር ጨምር',
      path: '/add-listing',
      icon: 'Plus'
    },
    {
      name: 'My Listings',
      nameAm: 'የእኔ ዝርዝሮች',
      path: '/farmer-my-listings',
      icon: 'Package'
    },
    {
      name: 'Orders',
      nameAm: 'ትዕዛዞች',
      path: '/orders-farmer',
      icon: 'ShoppingCart'
    },
    {
      name: 'Chat',
      nameAm: 'ውይይት',
      path: '/chat',
      icon: 'MessageCircle'
    },
    {
      name: 'Market Trends',
      nameAm: 'የገበያ አዝማሚያዎች',
      path: '/market-trends-dashboard',
      icon: 'TrendingUp'
    },
    {
      name: 'All Activities',
      nameAm: 'ሁሉም እንቅስቃሴዎች',
      path: '/farmer-activity',
      icon: 'Activity'
    },
    {
      name: 'Reviews',
      nameAm: 'ግምገማዎች',
      path: '/farmer-reviews',
      icon: 'Star'
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
      name: 'Favorites',
      nameAm: 'የምትወዱ',
      path: '/favorites',
      icon: 'Heart'
    },
    {
      name: 'My Reviews',
      nameAm: 'ግምገማዎቼ',
      path: '/user-reviews',
      icon: 'Star'
    },
    {
      name: 'Payments',
      nameAm: 'ክፍያዎች',
      path: '/payments',
      icon: 'CreditCard'
    },
    {
      name: 'Chat',
      nameAm: 'ውይይት',
      path: '/chat',
      icon: 'MessageCircle'
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

  const adminMenuSections = [
    {
      id: 'overview',
      name: 'Overview',
      nameAm: 'አጠቃላይ እይታ',
      icon: 'Home',
      items: [
        {
          name: 'Dashboard',
          nameAm: 'ዳሽቦርድ',
          path: '/admin-dashboard',
          icon: 'Home',
          badge: null,
          shortcut: '1'
        }
      ]
    },
    {
      id: 'management',
      name: 'Management',
      nameAm: 'አያያዝ',
      icon: 'Users',
      items: [
        {
          name: 'User Management',
          nameAm: 'የተጠቃሚ አያያዝ',
          path: '/admin-users',
          icon: 'Users',
          badge: adminStats.pendingApprovals > 0 ? adminStats.pendingApprovals : null,
          badgeColor: 'bg-orange-500',
          shortcut: '2'
        },
        {
          name: 'Listing Management',
          nameAm: 'የዝርዝር አያያዝ',
          path: '/admin-listings',
          icon: 'Package',
          badge: null,
          shortcut: '3'
        },
        {
          name: 'Order Management',
          nameAm: 'የትዕዛዝ አያያዝ',
          path: '/admin-orders',
          icon: 'ShoppingCart',
          badge: null,
          shortcut: '4'
        },
        {
          name: 'Financial Management',
          nameAm: 'የገንዘብ አያያዝ',
          path: '/admin-financial-management',
          icon: 'CreditCard',
          badge: null,
          shortcut: '5'
        }
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics & Reports',
      nameAm: 'ትንተና እና ሪፖርቶች',
      icon: 'BarChart3',
      items: [
        {
          name: 'Analytics Dashboard',
          nameAm: 'የትንተና ዳሽቦርድ',
          path: '/admin-analytics',
          icon: 'BarChart3',
          badge: null,
          shortcut: '6'
        },
        {
          name: 'Market Trends',
          nameAm: 'የገበያ አዝማሚያዎች',
          path: '/market-trends-dashboard',
          icon: 'TrendingUp',
          badge: null,
          shortcut: '7'
        },
        {
          name: 'Reports',
          nameAm: 'ሪፖርቶች',
          path: '/admin-reports',
          icon: 'FileText',
          badge: null,
          shortcut: '8'
        }
      ]
    },
    {
      id: 'system',
      name: 'System',
      nameAm: 'ስርዓት',
      icon: 'Settings',
      items: [
        {
          name: 'System Settings',
          nameAm: 'የስርዓት ቅንብሮች',
          path: '/admin-settings',
          icon: 'Settings',
          badge: adminStats.systemAlerts > 0 ? adminStats.systemAlerts : null,
          badgeColor: 'bg-red-500',
          shortcut: '9'
        },
        {
          name: 'Security Management',
          nameAm: 'የደህንነት አያያዝ',
          path: '/admin-security-management',
          icon: 'Shield',
          badge: adminStats.criticalIssues > 0 ? adminStats.criticalIssues : null,
          badgeColor: 'bg-red-600',
          shortcut: '0'
        },
        {
          name: 'Notifications',
          nameAm: 'ማሳወቂያዎች',
          path: '/notifications',
          icon: 'Bell',
          badge: notificationCount > 0 ? notificationCount : null,
          badgeColor: 'bg-blue-500',
          shortcut: 'n'
        }
      ]
    },
    {
      id: 'profile',
      name: 'Profile',
      nameAm: 'መገለጫ',
      icon: 'User',
      items: [
        {
          name: 'Profile Settings',
          nameAm: 'የመገለጫ ቅንብሮች',
          path: '/user-profile-management',
          icon: 'User',
          badge: null,
          shortcut: 'p'
        }
      ]
    }
  ];

  // Helper functions
  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const filteredAdminSections = useMemo(() => {
    if (!searchQuery) return adminMenuSections;

    return adminMenuSections.map(section => ({
      ...section,
      items: section.items.filter(item =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.nameAm && item.nameAm.includes(searchQuery))
      )
    })).filter(section => section.items.length > 0);
  }, [searchQuery]);

  const getMenuItems = () => {
    switch (userRole) {
      case 'admin':
        return adminMenuSections;
      case 'farmer':
        return farmerMenuItems;
      case 'buyer':
      default:
        return buyerMenuItems.filter(item => item.path !== '/add-listing');
    }
  };

  const menuItems = getMenuItems();

  const isActive = (path) => {
    return location.pathname === path;
  };

  // Keyboard shortcuts for admin
  useEffect(() => {
    if (userRole !== 'admin') return;

    const handleKeyPress = (e) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'u':
            e.preventDefault();
            navigate('/admin-users');
            return;
          case 'a':
            e.preventDefault();
            navigate('/admin-listings');
            return;
          case 'r':
            e.preventDefault();
            navigate('/admin-reports');
            return;
          case 'h':
            e.preventDefault();
            navigate('/admin-settings');
            return;
        }
      }
      const sections = adminMenuSections;
      for (const section of sections) {
        for (const item of section.items) {
          if (item.shortcut === e.key.toLowerCase()) {
            e.preventDefault();
            navigate(item.path);
            return;
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [userRole, navigate]);

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-surface border-r border-border transition-all duration-300 z-40 ${
      isCollapsed ? 'w-16' : 'w-72'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className={`absolute -right-3 top-4 w-6 h-6 text-white rounded-full flex items-center justify-center transition-colors shadow-lg bg-primary hover:bg-primary/90`}
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} className="w-4 h-4" />
      </button>

      {/* Admin Header */}
      {userRole === 'admin' && (
        <div className="px-4 py-3 border-b border-border">
          {!isCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center space-x-2 px-3 py-2 rounded-lg text-white bg-primary">
                <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary/90">
                  <Icon name="Shield" className="w-5 h-5" />
                </div>
                <span className="text-sm font-semibold">Admin Panel</span>
                <div className="ml-auto w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              </div>
              <div className="relative">
                <Icon name="Search" className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
                <input
                  type="text"
                  placeholder={language === 'am' ? 'ፍለጋ...' : 'Search...'}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-muted border border-border focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-text-secondary hover:text-text-primary"
                  >
                    <Icon name="X" className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="flex justify-center">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-white">
                <Icon name="Shield" className="w-4 h-4" />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Menu Items */}
      <nav className="flex-1 overflow-y-auto py-4">
        {userRole === 'admin' ? (
          <div className="px-2 space-y-1">
            {filteredAdminSections.map((section) => (
              <div key={section.id} className="space-y-1">
                {!isCollapsed && (
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between px-2 py-2 text-xs font-semibold uppercase tracking-wider rounded-lg text-text-secondary hover:bg-accent"
                  >
                    <div className="flex items-center space-x-2">
                      <div className="w-10 h-10 rounded-md flex items-center justify-center">
                        <Icon name={section.icon} className="w-4 h-4" />
                      </div>
                      <span>{language === 'am' ? section.nameAm : section.name}</span>
                    </div>
                    <Icon
                      name={expandedSections[section.id] ? 'ChevronUp' : 'ChevronDown'}
                      className="w-3 h-3 transition-transform"
                    />
                  </button>
                )}
                {expandedSections[section.id] && (
                  <div className="space-y-1">
                    {section.items.map((item) => (
                      <Link
                        key={item.path}
                        to={item.path}
                        title={`${language === 'am' ? (item.nameAm || item.name) : item.name}${item.shortcut ? ` (${item.shortcut})` : ''}`}
                        className={`flex items-center justify-between px-2 py-1.5 rounded-lg transition-all duration-200 group ${
                          isActive(item.path)
                            ? 'bg-primary text-white shadow-md'
                            : 'text-text-secondary hover:bg-accent hover:text-accent-foreground'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-md flex items-center justify-center">
                            <Icon name={item.icon} className="w-5 h-5" />
                          </div>
                          {!isCollapsed && (
                            <span className="ml-3 text-sm font-medium">
                              {language === 'am' ? (item.nameAm || item.name) : item.name}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {item.badge && !isCollapsed && (
                            <span className={`px-2 py-1 text-xs font-bold text-white rounded-full ${item.badgeColor || 'bg-blue-500'}`}>
                              {item.badge}
                            </span>
                          )}
                          {!isCollapsed && item.shortcut && (
                            <span className="text-xs text-text-secondary bg-muted px-1.5 py-0.5 rounded">
                              {item.shortcut}
                            </span>
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="px-2 space-y-1">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                title={(language === 'am' ? (item.nameAm || item.name) : item.name) || item.name}
                className={`flex items-center px-2 py-1.5 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-white shadow-md'
                    : 'text-text-secondary hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                <div className="w-10 h-10 rounded-md flex items-center justify-center">
                  <Icon name={item.icon} className="w-5 h-5" />
                </div>
                {!isCollapsed && (
                  <span className="ml-3 font-medium">{language === 'am' ? (item.nameAm || item.name) : item.name}</span>
                )}
              </Link>
            ))}
          </div>
        )}
      </nav>

      {/* Admin Footer */}
      {userRole === 'admin' && (
        <div className="bg-surface">
          <div className="border-t border-border">
            {!isCollapsed ? (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 rounded-lg text-center bg-primary/10">
                    <div className="font-bold text-primary text-sm">{adminStats.activeUsers.toLocaleString()}</div>
                    <div className="text-xs text-text-secondary">Users</div>
                  </div>
                  <div className="p-2 rounded-lg text-center bg-orange-100">
                    <div className="font-bold text-orange-700 text-sm">{adminStats.pendingApprovals}</div>
                    <div className="text-xs text-orange-600">Pending</div>
                  </div>
                </div>
                <div className="flex items-center justify-between px-2 py-1 rounded-lg bg-muted">
                  <span className="text-xs text-text-secondary">System Status</span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">Online</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    logout();
                    navigate('/authentication-login-register');
                  }}
                  className="w-full flex items-center space-x-2 px-3 py-2 text-error hover:text-error hover:bg-error/10 rounded-lg transition-colors"
                >
                  <Icon name="LogOut" className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {language === 'am' ? 'ውጣ' : 'Logout'}
                  </span>
                </button>
              </div>
            ) : (
              <div className="flex justify-center py-4">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-white">
                  <Icon name="Shield" className="w-4 h-4" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoleBasedSidebar;
