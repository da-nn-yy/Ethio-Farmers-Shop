import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import RoleBasedSidebar from './RoleBasedSidebar.jsx';
import AdminSidebar from './AdminSidebar.jsx';
import AuthenticatedTopBar from './AuthenticatedTopBar.jsx';

const AuthenticatedLayout = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const userRole = user?.role || 'buyer';

  return (
    <div className="min-h-screen bg-background">
      <AuthenticatedTopBar />
      
      {userRole === 'admin' ? (
        <AdminSidebar
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      ) : (
        <RoleBasedSidebar
          userRole={userRole}
          isAuthenticated={isAuthenticated}
          isCollapsed={isCollapsed}
          onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      )}

      <div className={`pt-14 ${isCollapsed ? 'pl-16' : 'pl-72'} transition-all ${userRole === 'admin' ? 'pb-20' : ''}`}>
        <main className="p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AuthenticatedLayout;


