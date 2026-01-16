import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Icon from '../AppIcon';
import { useLanguage } from '../../hooks/useLanguage.jsx';
import { useAuth } from '../../hooks/useAuth.jsx';

const AdminSidebar = ({ isCollapsed, onToggleCollapse }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { logout } = useAuth();

  const [expandedSections, setExpandedSections] = useState({
    overview: true,
    management: true,
    analytics: true,
    system: false
  });

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
          path: '/admin/dashboard',
          icon: 'Home',
          badge: null
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
          name: 'Users',
          nameAm: 'ተጠቃሚዎች',
          path: '/admin/users',
          icon: 'Users',
          badge: null
        },
        {
          name: 'Listings',
          nameAm: 'ዝርዝሮች',
          path: '/admin/listings',
          icon: 'Package',
          badge: null
        },
        {
          name: 'Orders',
          nameAm: 'ትዕዛዞች',
          path: '/admin/orders',
          icon: 'ShoppingCart',
          badge: null
        },
        {
          name: 'Chat',
          nameAm: 'ውይይት',
          path: '/admin/chat',
          icon: 'MessageCircle',
          badge: null
        },
        {
          name: 'Notifications',
          nameAm: 'ማሳወቂያዎች',
          path: '/admin/notifications',
          icon: 'Bell',
          badge: null
        },
        {
          name: 'Payments',
          nameAm: 'ክፍያዎች',
          path: '/admin/payments',
          icon: 'CreditCard',
          badge: null
        },
        {
          name: 'Content',
          nameAm: 'ይዘት',
          path: '/admin/content',
          icon: 'File',
          badge: null
        },
        {
          name: 'Marketplace',
          nameAm: 'ገበያ',
          path: '/admin/marketplace',
          icon: 'Store',
          badge: null
        },
        {
          name: 'Financial',
          nameAm: 'ገንዘብ',
          path: '/admin/financial',
          icon: 'DollarSign',
          badge: null
        },
        {
          name: 'Security',
          nameAm: 'ደህንነት',
          path: '/admin/security',
          icon: 'Shield',
          badge: null
        }
      ]
    },
    {
      id: 'analytics',
      name: 'Analytics',
      nameAm: 'ትንተና',
      icon: 'BarChart3',
      items: [
        {
          name: 'Analytics',
          nameAm: 'ትንተና',
          path: '/admin/analytics',
          icon: 'BarChart3',
          badge: null
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
          name: 'Settings',
          nameAm: 'ቅንብሮች',
          path: '/admin/settings',
          icon: 'Settings',
          badge: null
        }
      ]
    }
  ];

  const toggleSection = (sectionId) => {
    setExpandedSections(prev => ({
      ...prev,
      [sectionId]: !prev[sectionId]
    }));
  };

  const isActive = (path) => location.pathname === path;

  return (
    <div className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-surface border-r border-border transition-all duration-300 z-40 flex flex-col ${
      isCollapsed ? 'w-16' : 'w-72'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 w-6 h-6 rounded-full flex items-center justify-center transition-colors shadow-lg bg-primary text-white hover:bg-primary/90"
        aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="px-4 py-6 border-b border-border">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-md flex items-center justify-center bg-primary text-white">
              <Icon name="Shield" className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">Admin</h2>
              <p className="text-xs text-text-secondary">Control Panel</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-primary text-white">
              <Icon name="Shield" className="w-5 h-5" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-2 space-y-6">
          {adminMenuSections.map((section) => (
            <div key={section.id} className="space-y-2">
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
                  <Icon name={expandedSections[section.id] ? 'ChevronUp' : 'ChevronDown'} className="w-3 h-3 transition-transform" />
                </button>
              )}
              {expandedSections[section.id] && (
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center px-2 py-1.5 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-primary text-white shadow-md'
                          : 'text-text-secondary hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <div className="w-10 h-10 rounded-md flex items-center justify-center">
                        <Icon name={item.icon} className="w-4 h-4 flex-shrink-0" />
                      </div>
                      {!isCollapsed && (
                        <span className="ml-3 text-sm font-medium">
                          {language === 'am' ? (item.nameAm || item.name) : item.name}
                        </span>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-border p-4">
        {!isCollapsed ? (
          <button
            onClick={() => {
              logout();
              navigate('/authentication-login-register');
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 text-error hover:text-error hover:bg-error/10 rounded-lg transition-colors"
          >
            <Icon name="LogOut" className="w-4 h-4" />
            <span className="text-sm font-medium">
              {language === 'am' ? 'ውጣ' : 'Logout'}
            </span>
          </button>
        ) : (
          <button
            onClick={() => {
              logout();
              navigate('/authentication-login-register');
            }}
            className="w-full flex justify-center p-2 text-error hover:text-error hover:bg-error/10 rounded-lg transition-colors"
          >
            <Icon name="LogOut" className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
