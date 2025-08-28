
import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import Icon from '../AppIcon';

const ContextualBreadcrumbs = ({ userRole }) => {
  const location = useLocation();
  const currentLanguage = localStorage.getItem('farmconnect_language') || 'en';

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    
    const breadcrumbMap = {
      'dashboard-farmer-home': {
        en: 'Farmer Dashboard',
        am: 'የአርሶ አደር ዳሽቦርድ'
      },
      'dashboard-buyer-home': {
        en: 'Buyer Dashboard',
        am: 'የገዢ ዳሽቦርድ'
      },
      'order-management': {
        en: 'Order Management',
        am: 'የትዕዛዝ አያያዝ'
      },
      'user-profile-management': {
        en: 'Profile Management',
        am: 'የመገለጫ አያያዝ'
      },
      'market-trends-dashboard': {
        en: 'Market Trends',
        am: 'የገበያ ዝንባሌ'
      },
      'browse-listings-buyer-home': {
        en: 'Browse Listings',
        am: 'ዝርዝሮችን ያስሱ'
      }
    };

    const breadcrumbs = [
      {
        label: currentLanguage === 'am' ? 'መነሻ' : 'Home',
        path: userRole === 'farmer' ? '/dashboard-farmer-home' : '/dashboard-buyer-home'
      }
    ];

    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const breadcrumbInfo = breadcrumbMap[segment];
      
      if (breadcrumbInfo) {
        breadcrumbs.push({
          label: breadcrumbInfo[currentLanguage] || breadcrumbInfo.en,
          path: path
        });
      }
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  if (breadcrumbs.length <= 1) return null;

  return (
    <div className="bg-background border-b border-border px-4 py-3">
      <div className="max-w-6xl mx-auto">
        <nav className="flex items-center space-x-2 text-sm">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.path}>
              {index > 0 && (
                <Icon name="ChevronRight" className="w-4 h-4 text-text-muted" />
              )}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-text-primary font-medium">
                  {breadcrumb.label}
                </span>
              ) : (
                <Link
                  to={breadcrumb.path}
                  className="text-text-secondary hover:text-text-primary transition-colors"
                >
                  {breadcrumb.label}
                </Link>
              )}
            </React.Fragment>
          ))}
        </nav>
      </div>
    </div>
  );
};

export default ContextualBreadcrumbs;
