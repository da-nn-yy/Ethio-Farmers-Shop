import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AdminPage from '../../components/ui/AdminPage.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/AppIcon.jsx';
import Button from '../../components/ui/Button.jsx';
import { adminService } from '../../services/apiService.js';

const mockAnalyticsData = {
  revenue: {
    total: 125000,
    growth: 12.5,
    chart: [
      { month: 'Jan', value: 85000 },
      { month: 'Feb', value: 92000 },
      { month: 'Mar', value: 105000 },
      { month: 'Apr', value: 118000 },
      { month: 'May', value: 125000 }
    ]
  },
  users: {
    total: 1247,
    growth: 8.3,
    chart: [
      { month: 'Jan', value: 800 },
      { month: 'Feb', value: 920 },
      { month: 'Mar', value: 1050 },
      { month: 'Apr', value: 1150 },
      { month: 'May', value: 1247 }
    ]
  },
  orders: {
    total: 3456,
    growth: 15.2,
    chart: [
      { month: 'Jan', value: 2100 },
      { month: 'Feb', value: 2400 },
      { month: 'Mar', value: 2800 },
      { month: 'Apr', value: 3200 },
      { month: 'May', value: 3456 }
    ]
  },
  listings: {
    total: 2341,
    growth: 6.7,
    chart: [
      { month: 'Jan', value: 1800 },
      { month: 'Feb', value: 1950 },
      { month: 'Mar', value: 2100 },
      { month: 'Apr', value: 2250 },
      { month: 'May', value: 2341 }
    ]
  }
};

const topCategories = [
  { name: 'Grains', value: 45, color: 'bg-amber-500', revenue: 56000 },
  { name: 'Coffee', value: 25, color: 'bg-amber-600', revenue: 32000 },
  { name: 'Vegetables', value: 15, color: 'bg-green-500', revenue: 19000 },
  { name: 'Fruits', value: 10, color: 'bg-orange-500', revenue: 12000 },
  { name: 'Spices', value: 5, color: 'bg-red-500', revenue: 6000 }
];

const topFarmers = [
  { name: 'Alemayehu Kebede', orders: 45, revenue: 12500, rating: 4.8 },
  { name: 'Meron Tadesse', orders: 38, revenue: 9800, rating: 4.7 },
  { name: 'Getachew Molla', orders: 32, revenue: 8200, rating: 4.6 },
  { name: 'Hanna Wolde', orders: 28, revenue: 7500, rating: 4.5 },
  { name: 'Dawit Haile', orders: 25, revenue: 6800, rating: 4.4 }
];

const recentActivity = [
  { type: 'order', message: 'New order #ORD-001 placed', time: '2 minutes ago', value: 'ETB 5,600' },
  { type: 'user', message: 'New farmer registered', time: '15 minutes ago', value: 'Alemayehu K.' },
  { type: 'listing', message: 'New listing approved', time: '1 hour ago', value: 'Organic Coffee' },
  { type: 'payment', message: 'Payment received', time: '2 hours ago', value: 'ETB 3,200' },
  { type: 'delivery', message: 'Order delivered', time: '3 hours ago', value: 'ORD-004' }
];

const AdminAnalytics = () => {
  const { user, isAuthenticated } = useAuth();
  const [timeRange, setTimeRange] = useState('30d');
  const [isLoading, setIsLoading] = useState(true);
  const [analyticsData, setAnalyticsData] = useState(mockAnalyticsData);

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange]);

  const loadAnalyticsData = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getAdminAnalytics({ period: timeRange });
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      setAnalyticsData(mockAnalyticsData);
    } finally {
      setIsLoading(false);
    }
  };

  const getActivityIcon = (type) => {
    const icons = {
      order: 'ShoppingCart',
      user: 'UserPlus',
      listing: 'Package',
      payment: 'DollarSign',
      delivery: 'Truck'
    };
    return icons[type] || 'Activity';
  };

  const getActivityColor = (type) => {
    const colors = {
      order: 'text-blue-600',
      user: 'text-green-600',
      listing: 'text-purple-600',
      payment: 'text-emerald-600',
      delivery: 'text-orange-600'
    };
    return colors[type] || 'text-gray-600';
  };

  if (!isAuthenticated || user?.role !== 'admin') {
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
    <AdminPage
      title="Analytics Dashboard"
      subtitle="Business intelligence and performance insights"
      actions={(
        <>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
          <Button variant="outline" size="sm" iconName="Download">Export Report</Button>
          <Button variant="primary" size="sm" iconName="RefreshCw" onClick={loadAnalyticsData} loading={isLoading}>
            Refresh
          </Button>
        </>
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Revenue</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">ETB {analyticsData.revenue.total.toLocaleString()}</p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                <Icon name="TrendingUp" size={12} className="mr-1" />
                +{analyticsData.revenue.growth}% from last period
              </p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex items-center justify-center">
              <Icon name="DollarSign" size={24} className="text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{analyticsData.users.total.toLocaleString()}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400 flex items-center mt-1">
                <Icon name="TrendingUp" size={12} className="mr-1" />
                +{analyticsData.users.growth}% from last period
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
              <Icon name="Users" size={24} className="text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Orders</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{analyticsData.orders.total.toLocaleString()}</p>
              <p className="text-xs text-purple-600 dark:text-purple-400 flex items-center mt-1">
                <Icon name="TrendingUp" size={12} className="mr-1" />
                +{analyticsData.orders.growth}% from last period
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
              <Icon name="ShoppingCart" size={24} className="text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Listings</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{analyticsData.listings.total.toLocaleString()}</p>
              <p className="text-xs text-green-600 dark:text-green-400 flex items-center mt-1">
                <Icon name="TrendingUp" size={12} className="mr-1" />
                +{analyticsData.listings.growth}% from last period
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
              <Icon name="Package" size={24} className="text-green-600 dark:text-green-400" />
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Revenue Trend</h3>
            <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
          </div>
          <div className="h-64 flex items-end space-x-2">
            {analyticsData.revenue.chart.map((item, index) => {
              const max = Math.max(...analyticsData.revenue.chart.map((d) => d.value));
              const height = max ? (item.value / max) * 200 : 0;
              return (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t" style={{ height: `${height}px` }}></div>
                  <span className="text-xs text-slate-600 dark:text-slate-400 mt-2">{item.month}</span>
                  <span className="text-xs font-medium text-slate-900 dark:text-white">ETB {(item.value / 1000).toFixed(0)}k</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Category Distribution</h3>
            <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
          </div>
          <div className="space-y-4">
            {topCategories.map((category, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${category.color}`}></div>
                  <span className="text-sm font-medium text-slate-900 dark:text-white">{category.name}</span>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                    <div className={`h-2 rounded-full ${category.color}`} style={{ width: `${category.value}%` }}></div>
                  </div>
                  <span className="text-sm text-slate-600 dark:text-slate-400 w-16 text-right">{category.value}%</span>
                  <span className="text-sm font-medium text-slate-900 dark:text-white w-20 text-right">ETB {category.revenue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Top Performing Farmers</h3>
            <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
          </div>
          <div className="space-y-4">
            {topFarmers.map((farmer, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                    <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{index + 1}</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{farmer.name}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{farmer.orders} orders • {farmer.rating}★</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900 dark:text-white">ETB {farmer.revenue.toLocaleString()}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Revenue</p>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Recent Activity</h3>
            <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
          </div>
          <div className="space-y-4">
            {recentActivity.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="w-8 h-8 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name={getActivityIcon(activity.type)} size={16} className={getActivityColor(activity.type)} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-slate-900 dark:text-white">{activity.message}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-slate-500 dark:text-slate-400">{activity.time}</p>
                    <p className="text-xs font-medium text-slate-600 dark:text-slate-400">{activity.value}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AdminPage>
  );
};

export default AdminAnalytics;
