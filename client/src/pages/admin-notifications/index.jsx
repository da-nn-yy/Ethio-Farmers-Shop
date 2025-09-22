import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/AppIcon.jsx';
import Button from '../../components/ui/Button.jsx';
import { adminService } from '../../services/apiService.js';

const AdminNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // Mock notification data for demonstration
  const mockNotifications = [
    {
      id: 1,
      user_id: 1,
      user_name: 'Alemayehu Kebede',
      user_role: 'farmer',
      type: 'order_update',
      payload: {
        title: 'New Order Received',
        message: 'You have received a new order for Teff',
        orderId: 'ORD-001'
      },
      is_read: false,
      created_at: '2024-01-20T10:30:00Z'
    },
    {
      id: 2,
      user_id: 2,
      user_name: 'Meron Tadesse',
      user_role: 'buyer',
      type: 'price_change',
      payload: {
        title: 'Price Alert',
        message: 'Coffee price has decreased by 5%',
        crop: 'Coffee',
        oldPrice: 150,
        newPrice: 142.5
      },
      is_read: true,
      created_at: '2024-01-20T09:15:00Z'
    },
    {
      id: 3,
      user_id: 3,
      user_name: 'Getachew Molla',
      user_role: 'farmer',
      type: 'system',
      payload: {
        title: 'System Maintenance',
        message: 'Scheduled maintenance will occur tonight',
        maintenanceTime: '2024-01-21T02:00:00Z'
      },
      is_read: false,
      created_at: '2024-01-20T08:00:00Z'
    }
  ];

  useEffect(() => {
    loadNotifications();
  }, [pagination.page, typeFilter, statusFilter, searchQuery]);

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      // In a real app, this would call the admin API
      // const data = await adminService.getAllNotifications(params);
      // For now, use mock data
      await new Promise(resolve => setTimeout(resolve, 1000));
      setNotifications(mockNotifications);
      setPagination({
        page: 1,
        limit: 50,
        total: mockNotifications.length,
        pages: 1
      });
    } catch (error) {
      console.error('Failed to load notifications:', error);
      setNotifications(mockNotifications);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedNotifications.length === 0) return;

    try {
      // In a real app, this would call the admin API
      console.log(`Performing ${action} on notifications:`, selectedNotifications);
      setSelectedNotifications([]);
      loadNotifications();
    } catch (error) {
      console.error(`Failed to ${action} notifications:`, error);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'order_update': 'ShoppingCart',
      'price_change': 'TrendingUp',
      'system': 'Settings',
      'message': 'MessageCircle',
      'payment': 'CreditCard',
      'verification': 'Shield',
      'promotion': 'Gift'
    };
    return iconMap[type] || 'Bell';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      'order_update': 'text-blue-600 bg-blue-100',
      'price_change': 'text-orange-600 bg-orange-100',
      'system': 'text-gray-600 bg-gray-100',
      'message': 'text-cyan-600 bg-cyan-100',
      'payment': 'text-green-600 bg-green-100',
      'verification': 'text-blue-600 bg-blue-100',
      'promotion': 'text-pink-600 bg-pink-100'
    };
    return colorMap[type] || 'text-gray-600 bg-gray-100';
  };

  const getRoleBadge = (role) => {
    const roleConfig = {
      farmer: { color: 'bg-blue-100 text-blue-800', icon: 'Tractor' },
      buyer: { color: 'bg-purple-100 text-purple-800', icon: 'ShoppingCart' },
      admin: { color: 'bg-gray-100 text-gray-800', icon: 'Shield' }
    };
    const config = roleConfig[role] || roleConfig.farmer;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon name={config.icon} size={12} className="mr-1" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
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
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-700">
          <div className="px-4 mx-auto max-w-7xl lg:px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Notification Management</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Monitor and manage system notifications
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" iconName="RefreshCw" onClick={loadNotifications} loading={isLoading}>
                  Refresh
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mx-auto max-w-7xl lg:px-6 py-8">
          {/* Filters and Actions */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Icon name="Search" size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  />
                </div>
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value="all">All Types</option>
                  <option value="order_update">Order Updates</option>
                  <option value="price_change">Price Changes</option>
                  <option value="system">System</option>
                  <option value="message">Messages</option>
                  <option value="payment">Payments</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="unread">Unread</option>
                  <option value="read">Read</option>
                </select>
              </div>

              {selectedNotifications.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedNotifications.length} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('mark_read')}
                  >
                    Mark as Read
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete
                  </Button>
                </div>
              )}
            </div>
          </Card>

          {/* Notifications List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Card key={i} className="p-4 animate-pulse">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <Card className="p-8 text-center">
                <Icon name="Bell" size={48} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                  No notifications found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  No notifications match your current filters.
                </p>
              </Card>
            ) : (
              notifications.map((notification) => (
                <Card
                  key={notification.id}
                  className={`p-4 transition-all duration-200 hover:shadow-md ${
                    !notification.is_read ? 'border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : ''
                  }`}
                >
                  <div className="flex items-start space-x-4">
                    <input
                      type="checkbox"
                      checked={selectedNotifications.includes(notification.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedNotifications(prev => [...prev, notification.id]);
                        } else {
                          setSelectedNotifications(prev => prev.filter(id => id !== notification.id));
                        }
                      }}
                      className="mt-1"
                    />
                    <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                      <Icon 
                        name={getNotificationIcon(notification.type)} 
                        size={20} 
                        className="text-current"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                            {notification.payload?.title || 'Notification'}
                          </h3>
                          {getRoleBadge(notification.user_role)}
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(notification.created_at)}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                        {notification.payload?.message || 'No message'}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          To: {notification.user_name} ({notification.user_role})
                        </div>
                        <div className="flex items-center space-x-2">
                          {!notification.is_read && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400">
                              Unread
                            </span>
                          )}
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            ID: {notification.id}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default AdminNotifications;
