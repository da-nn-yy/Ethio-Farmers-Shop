import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const BreadcrumbNavigation = ({ userRole }) => {
  const location = useLocation();

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [];

    // Add home breadcrumb
    breadcrumbs.push({
      name: 'Home',
      nameAm: 'ቤት',
      path: userRole === 'farmer' ? '/dashboard-farmer-home' : '/dashboard-buyer-home'
    });

    // Add path-specific breadcrumbs
    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      let name = '';
      let nameAm = '';

      switch (segment) {
        case 'dashboard-farmer-home':
          name = 'Farmer Dashboard';
          nameAm = 'የአርሶ አደር ዳሽቦርድ';
          break;
        case 'dashboard-buyer-home':
          name = 'Buyer Dashboard';
          nameAm = 'የገዢ ዳሽቦርድ';
          break;
        case 'add-listing':
          name = 'Add Listing';
          nameAm = 'ዝርዝር ጨምር';
          break;
        case 'browse-listings-buyer-home':
          name = 'Browse Listings';
          nameAm = 'ዝርዝሮችን ያስሱ';
          break;
        case 'order-management':
          name = 'Order Management';
          nameAm = 'የትዕዛዝ አያያዝ';
          break;
        case 'user-profile-management':
          name = 'Profile Management';
          nameAm = 'የመገለጫ አያያዝ';
          break;
        case 'market-trends-dashboard':
          name = 'Market Trends';
          nameAm = 'የገበያ አዝማሚያዎች';
          break;
        default:
          name = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ');
          nameAm = name;
      }

      breadcrumbs.push({
        name,
        nameAm,
        path,
        isLast: index === pathSegments.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      {breadcrumbs.map((breadcrumb, index) => (
        <React.Fragment key={breadcrumb.path}>
          {index > 0 && (
            <Icon name="ChevronRight" className="w-4 h-4" />
          )}
          {breadcrumb.isLast ? (
            <span className="font-medium text-foreground">
              {breadcrumb.name}
            </span>
          ) : (
            <Link
              to={breadcrumb.path}
              className="hover:text-foreground transition-colors"
            >
              {breadcrumb.name}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
};

export default BreadcrumbNavigation;

