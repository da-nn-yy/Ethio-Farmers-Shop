import React from 'react';
import PropTypes from 'prop-types';
import BreadcrumbNavigation from './BreadcrumbNavigation.jsx';

const AdminPage = ({ title, subtitle, children, actions }) => {
  return (
    <div className="min-h-full">
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200">
        <div className="px-4 mx-auto max-w-7xl lg:px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-sm text-slate-600">{subtitle}</p>
              )}
            </div>
            <div className="flex items-center space-x-3">
              {actions}
            </div>
          </div>
          <div className="mt-3">
            <BreadcrumbNavigation />
          </div>
        </div>
      </div>

      <div className="px-4 mx-auto max-w-7xl lg:px-6 py-8">
        {children}
      </div>
    </div>
  );
};

AdminPage.propTypes = {
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  subtitle: PropTypes.oneOfType([PropTypes.string, PropTypes.node]),
  children: PropTypes.node,
  actions: PropTypes.node
};

export default AdminPage;
