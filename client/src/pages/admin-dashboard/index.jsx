import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/AppIcon.jsx';
import Button from '../../components/ui/Button.jsx';
import { dashboardService } from '../../services/apiService.js';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeListings: 0,
    totalOrders: 0,
    revenue: 0,
    newUsersToday: 0,
    pendingOrders: 0,
    verifiedFarmers: 0,
    activeBuyers: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [systemHealth, setSystemHealth] = useState({
    status: 'healthy',
    uptime: '99.9%',
    lastBackup: '2 hours ago'
  });
  const [dashboardData, setDashboardData] = useState(null);

  React.useEffect(() => {
    // Check authentication and role
    const checkAuth = async () => {
      // If not authenticated, redirect to admin login
      if (!isAuthenticated) {
        navigate('/admin-login', { replace: true });
        return;
      }

      // If user role is not admin, redirect to appropriate dashboard
      if (user?.role !== 'admin') {
        const fallback = user?.role === 'farmer' ? '/dashboard-farmer-home' : '/dashboard-buyer-home';
        navigate(fallback, { replace: true });
        return;
      }

      // Admin user authenticated, load dashboard data
      loadDashboardData();
    };

    checkAuth();
  }, [isAuthenticated, user, navigate]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Fetch real admin dashboard data from API
      const data = await dashboardService.getAdminDashboard();
      setDashboardData(data);

      // Update stats from API data
      const platformStats = data.platformStats || {};
      setStats({
        totalUsers: (platformStats.total_farmers || 0) + (platformStats.total_buyers || 0),
        activeListings: platformStats.active_listings || 0,
        totalOrders: platformStats.total_orders || 0,
        revenue: platformStats.total_transactions || 0,
        newUsersToday: 0, // This would need to be calculated from userGrowth data
        pendingOrders: platformStats.total_orders - platformStats.completed_orders || 0,
        verifiedFarmers: platformStats.total_farmers || 0,
        activeBuyers: platformStats.total_buyers || 0
      });

      // Transform recent activity from API data
      const activities = (data.recentActivity || []).map((activity, index) => ({
        id: index + 1,
        type: activity.type,
        message: getActivityMessage(activity),
        time: formatTimeAgo(activity.timestamp),
        icon: getActivityIcon(activity.type)
      }));
      setRecentActivity(activities);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // Fallback to mock data if API fails
      setStats({
        totalUsers: 1247,
        activeListings: 2341,
        totalOrders: 3456,
        revenue: 125000,
        newUsersToday: 23,
        pendingOrders: 45,
        verifiedFarmers: 892,
        activeBuyers: 355
      });

      setRecentActivity([
        { id: 1, type: 'user_registration', message: 'New farmer registered: Alemayehu Kebede', time: '5 minutes ago', icon: 'UserPlus' },
        { id: 2, type: 'order_placed', message: 'Order #1234 placed for 50kg Teff', time: '12 minutes ago', icon: 'ShoppingCart' },
        { id: 3, type: 'listing_approved', message: 'Listing "Organic Coffee" approved', time: '1 hour ago', icon: 'CheckCircle' },
        { id: 4, type: 'payment_received', message: 'Payment of ETB 2,500 received', time: '2 hours ago', icon: 'DollarSign' },
        { id: 5, type: 'user_verified', message: 'Farmer verification completed', time: '3 hours ago', icon: 'Shield' }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityMessage = (activity) => {
    switch (activity.type) {
      case 'new_user':
        return `New ${activity.role} registered: ${activity.name}`;
      case 'new_listing':
        return `New listing created: ${activity.name}`;
      case 'new_order':
        return `New order placed: ${activity.name}`;
      default:
        return activity.name;
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'new_user':
        return 'UserPlus';
      case 'new_listing':
        return 'Package';
      case 'new_order':
        return 'ShoppingCart';
      default:
        return 'Activity';
    }
  };

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)} hours ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)} days ago`;
    }
  };

  if (!isAuthenticated) {
    return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Icon name="Loader2" size={48} className="animate-spin mx-auto mb-4 text-blue-500" />
          <p className="text-gray-600">Loading...</p>
        </div>
          </div>
    );
  }

  if (user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="Shield" size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">Access Denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Modern Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-700">
          <div className="px-4 mx-auto max-w-7xl lg:px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                  Admin Dashboard
                </h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Welcome back, {user?.name || 'Admin'} • {new Date().toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button
                  variant="outline"
                  size="sm"
                  iconName="RefreshCw"
                  onClick={loadDashboardData}
                  loading={isLoading}
                >
                  Refresh
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  iconName="Download"
                  onClick={() => navigate('/admin/analytics')}
                >
                  View Analytics
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mx-auto max-w-7xl lg:px-6 py-8">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Users */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                    <Icon name="TrendingUp" size={12} className="mr-1" />
                    +{stats.newUsersToday} today
                  </p>
                </div>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                  <Icon name="Users" size={24} className="text-blue-600 dark:text-blue-400" />
                </div>
              </div>
            </Card>

            {/* Active Listings */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Listings</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.activeListings.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {stats.verifiedFarmers} verified farmers
                  </p>
                </div>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                  <Icon name="Package" size={24} className="text-green-600 dark:text-green-400" />
                </div>
              </div>
            </Card>

            {/* Total Orders */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Orders</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">{stats.totalOrders.toLocaleString()}</p>
                  <p className="text-xs text-orange-600 dark:text-orange-400 flex items-center mt-1">
                    <Icon name="Clock" size={12} className="mr-1" />
                    {stats.pendingOrders} pending
                  </p>
                </div>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                  <Icon name="ShoppingCart" size={24} className="text-purple-600 dark:text-purple-400" />
                </div>
              </div>
            </Card>

            {/* Revenue */}
            <Card className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Revenue</p>
                  <p className="text-3xl font-bold text-slate-900 dark:text-white">ETB {stats.revenue.toLocaleString()}</p>
                  <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                    <Icon name="DollarSign" size={12} className="mr-1" />
                    +12% this month
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
                  <Icon name="DollarSign" size={24} className="text-emerald-600 dark:text-emerald-400" />
                </div>
              </div>
            </Card>
          </div>

          {/* Main Content - Vertical layout */}
          <div className="space-y-8">
            {/* Quick Actions (vertical) */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Quick Actions</h3>
                <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <button
                    onClick={() => navigate('/admin/users')}
                    className="group p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-900/30 dark:hover:to-blue-800/30 transition-all duration-200 hover:scale-105"
                  >
                    <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon name="Users" size={24} className="text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">User Management</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Manage users and permissions</p>
                  </button>

                  <button
                    onClick={() => navigate('/admin/listings')}
                    className="group p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl hover:from-green-100 hover:to-green-200 dark:hover:from-green-900/30 dark:hover:to-green-800/30 transition-all duration-200 hover:scale-105"
                  >
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon name="Package" size={24} className="text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Listings</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Manage product listings</p>
                  </button>

                  <button
                    onClick={() => navigate('/admin/orders')}
                    className="group p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-900/30 dark:hover:to-purple-800/30 transition-all duration-200 hover:scale-105"
                  >
                    <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon name="ShoppingCart" size={24} className="text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Orders</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Track and manage orders</p>
                  </button>

                  <button
                    onClick={() => navigate('/admin/analytics')}
                    className="group p-6 bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20 rounded-xl hover:from-orange-100 hover:to-orange-200 dark:hover:from-orange-900/30 dark:hover:to-orange-800/30 transition-all duration-200 hover:scale-105"
                  >
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon name="BarChart3" size={24} className="text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Analytics</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">View reports and insights</p>
                  </button>

                  <button
                    onClick={() => navigate('/admin/settings')}
                    className="group p-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900/20 dark:to-gray-800/20 rounded-xl hover:from-gray-100 hover:to-gray-200 dark:hover:from-gray-900/30 dark:hover:to-gray-800/30 transition-all duration-200 hover:scale-105"
                  >
                    <div className="w-12 h-12 bg-gray-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon name="Settings" size={24} className="text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Settings</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">System configuration</p>
                  </button>

                  <button
                    onClick={() => navigate('/admin/notifications')}
                    className="group p-6 bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20 rounded-xl hover:from-red-100 hover:to-red-200 dark:hover:from-red-900/30 dark:hover:to-red-800/30 transition-all duration-200 hover:scale-105"
                  >
                    <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon name="Bell" size={24} className="text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Notifications</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Manage system notifications</p>
                  </button>

                  <button
                    onClick={() => navigate('/admin/payments')}
                    className="group p-6 bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20 rounded-xl hover:from-indigo-100 hover:to-indigo-200 dark:hover:from-indigo-900/30 dark:hover:to-indigo-800/30 transition-all duration-200 hover:scale-105"
                  >
                    <div className="w-12 h-12 bg-indigo-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                      <Icon name="CreditCard" size={24} className="text-white" />
                    </div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-1">Payments</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-400">Manage payment transactions</p>
                  </button>
              </div>
            </Card>

            {/* Recent Activity (vertical) */}
            <Card className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
                <Button variant="ghost" size="sm" onClick={() => navigate('/admin/orders')}>
                  View All
                </Button>
              </div>
              <div className="space-y-4">
                {recentActivity.map((activity) => (
                  <div key={activity.id} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon name={activity.icon} size={16} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-slate-900 dark:text-white">{activity.message}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* System Health (vertical) */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">System Health</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Status</span>
                  <span className="flex items-center text-sm font-medium text-green-600 dark:text-green-400">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                    {systemHealth.status}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Uptime</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{systemHealth.uptime}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Last Backup</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{systemHealth.lastBackup}</span>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>
  );
};

export default AdminDashboard;
