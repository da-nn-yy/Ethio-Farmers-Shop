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
          path: '/admin-dashboard',
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
          path: '/admin-users',
          icon: 'Users',
          badge: null
        },
        {
          name: 'Listings',
          nameAm: 'ዝርዝሮች',
          path: '/admin-listings',
          icon: 'Package',
          badge: null
        },
        {
          name: 'Orders',
          nameAm: 'ትዕዛዞች',
          path: '/admin-orders',
          icon: 'ShoppingCart',
          badge: null
        },
        {
          name: 'Chat',
          nameAm: 'ውይይት',
          path: '/admin-chat',
          icon: 'MessageCircle',
          badge: null
        },
           {
             name: 'Notifications',
             nameAm: 'ማሳወቂያዎች',
             path: '/admin-notifications',
             icon: 'Bell',
             badge: null
           },
           {
             name: 'Payments',
             nameAm: 'ክፍያዎች',
             path: '/admin-payments',
             icon: 'CreditCard',
             badge: null
           },
           {
             name: 'Content',
             nameAm: 'ይዘት',
             path: '/admin-content',
             icon: 'File',
             badge: null
           },
           {
             name: 'Marketplace',
             nameAm: 'ገበያ',
             path: '/admin-marketplace',
             icon: 'Store',
             badge: null
           },
           {
             name: 'Financial',
             nameAm: 'ገንዘብ',
             path: '/admin-financial',
             icon: 'DollarSign',
             badge: null
           },
           {
             name: 'Security',
             nameAm: 'ደህንነት',
             path: '/admin-security',
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
          path: '/admin-analytics',
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
          path: '/admin-settings',
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

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <div className={`fixed left-0 top-0 h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700 transition-all duration-300 z-40 flex flex-col ${
      isCollapsed ? 'w-16' : 'w-64'
    }`}>
      {/* Toggle Button */}
      <button
        onClick={onToggleCollapse}
        className="absolute -right-3 top-6 w-6 h-6 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full flex items-center justify-center transition-all duration-200 shadow-lg hover:scale-110"
      >
        <Icon name={isCollapsed ? 'ChevronRight' : 'ChevronLeft'} className="w-4 h-4" />
      </button>

      {/* Header */}
      <div className="px-4 py-6 border-b border-slate-200 dark:border-slate-700">
        {!isCollapsed ? (
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
              <Icon name="Shield" className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">Admin</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Control Panel</p>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
              <Icon name="Shield" className="w-5 h-5 text-white dark:text-slate-900" />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4">
        <div className="px-4 space-y-6">
          {adminMenuSections.map((section) => (
            <div key={section.id} className="space-y-2">
              {/* Section Header */}
              {!isCollapsed && (
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                  <div className="flex items-center space-x-2">
                    <Icon name={section.icon} className="w-4 h-4" />
                    <span>{language === 'am' ? section.nameAm : section.name}</span>
                  </div>
                  <Icon 
                    name={expandedSections[section.id] ? 'ChevronUp' : 'ChevronDown'} 
                    className="w-3 h-3 transition-transform" 
                  />
                </button>
              )}
              
              {/* Section Items */}
              {expandedSections[section.id] && (
                <div className="space-y-1">
                  {section.items.map((item) => (
                    <Link
                      key={item.path}
                      to={item.path}
                      className={`flex items-center space-x-3 px-3 py-2 rounded-lg transition-colors ${
                        isActive(item.path)
                          ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                          : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      <Icon name={item.icon} className="w-4 h-4 flex-shrink-0" />
                      {!isCollapsed && (
                        <span className="text-sm font-medium">
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
      <div className="border-t border-slate-200 dark:border-slate-700 p-4">
        {!isCollapsed ? (
          <button
            onClick={() => {
              logout();
              navigate('/authentication-login-register');
            }}
            className="w-full flex items-center space-x-3 px-3 py-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
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
            className="w-full flex justify-center p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            <Icon name="LogOut" className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminSidebar;
