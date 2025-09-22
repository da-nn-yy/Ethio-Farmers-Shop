import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../../services/apiService.js';
import { useAuth } from '../../hooks/useAuth.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/AppIcon.jsx';
import Card from '../../components/ui/Card.jsx';

const NotificationsPage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchNotifications();
    }
  }, [isAuthenticated, user, filter, page]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 20,
        unreadOnly: filter === 'unread'
      };

      const response = await notificationService.getUserNotifications(params);

      if (page === 1) {
        setNotifications(response.notifications || []);
      } else {
        setNotifications(prev => [...prev, ...(response.notifications || [])]);
      }

      setHasMore(response.hasMore || false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load notifications');
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await notificationService.markNotificationRead(notificationId);
      setNotifications(prev =>
        prev.map(notif =>
          notif.id === notificationId ? { ...notif, is_read: true } : notif
        )
      );
    } catch (err) {
      console.error('Failed to mark notification as read:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications(prev =>
        prev.map(notif => ({ ...notif, is_read: true }))
      );
    } catch (err) {
      console.error('Failed to mark all notifications as read:', err);
    }
  };

  const deleteNotification = async (notificationId) => {
    if (!window.confirm('Are you sure you want to delete this notification?')) {
      return;
    }

    try {
      await notificationService.deleteNotification(notificationId);
      setNotifications(prev => prev.filter(notif => notif.id !== notificationId));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  const getNotificationIcon = (type) => {
    const iconMap = {
      'order_placed': 'ShoppingCart',
      'order_confirmed': 'CheckCircle',
      'order_shipped': 'Truck',
      'order_delivered': 'Package',
      'order_cancelled': 'XCircle',
      'order_update': 'ShoppingCart',
      'new_listing': 'PlusCircle',
      'price_change': 'TrendingUp',
      'review_received': 'Star',
      'message': 'MessageCircle',
      'system': 'Settings',
      'payment': 'CreditCard',
      'verification': 'Shield',
      'promotion': 'Gift'
    };
    return iconMap[type] || 'Bell';
  };

  const getNotificationColor = (type) => {
    const colorMap = {
      'order_placed': 'text-blue-600 bg-blue-100',
      'order_confirmed': 'text-green-600 bg-green-100',
      'order_shipped': 'text-purple-600 bg-purple-100',
      'order_delivered': 'text-emerald-600 bg-emerald-100',
      'order_cancelled': 'text-red-600 bg-red-100',
      'order_update': 'text-blue-600 bg-blue-100',
      'new_listing': 'text-indigo-600 bg-indigo-100',
      'price_change': 'text-orange-600 bg-orange-100',
      'review_received': 'text-yellow-600 bg-yellow-100',
      'message': 'text-cyan-600 bg-cyan-100',
      'system': 'text-gray-600 bg-gray-100',
      'payment': 'text-green-600 bg-green-100',
      'verification': 'text-blue-600 bg-blue-100',
      'promotion': 'text-pink-600 bg-pink-100'
    };
    return colorMap[type] || 'text-gray-600 bg-gray-100';
  };

  const getNotificationTitle = (type) => {
    const titleMap = {
      'order_placed': 'New Order',
      'order_confirmed': 'Order Confirmed',
      'order_shipped': 'Order Shipped',
      'order_delivered': 'Order Delivered',
      'order_cancelled': 'Order Cancelled',
      'order_update': 'Order Update',
      'new_listing': 'New Listing',
      'price_change': 'Price Change',
      'review_received': 'New Review',
      'message': 'New Message',
      'system': 'System Notification',
      'payment': 'Payment Update',
      'verification': 'Verification Update',
      'promotion': 'Special Offer'
    };
    return titleMap[type] || 'Notification';
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
      });
    }
  };

  const handleBack = () => {
    navigate(-1);
  };

  const filteredNotifications = notifications.filter(notif => {
    if (filter === 'unread') return !notif.is_read;
    if (filter === 'read') return notif.is_read;
    return true;
  });

  const unreadCount = notifications.filter(notif => !notif.is_read).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Please Log In</h1>
            <p className="text-gray-600 mb-6">You need to be logged in to view notifications.</p>
            <Button onClick={() => navigate('/authentication-login-register')}>
              Go to Login
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              onClick={handleBack}
              className="flex items-center space-x-2"
            >
              <Icon name="ArrowLeft" size={16} />
              <span>Back</span>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                <Icon name="Bell" size={20} className="text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Notifications</h1>
                <p className="text-gray-600 dark:text-gray-400">
                  {unreadCount > 0 ? `${unreadCount} unread notifications` : 'All caught up!'}
                </p>
              </div>
            </div>
          </div>

          {unreadCount > 0 && (
            <Button onClick={markAllAsRead} variant="outline">
              <Icon name="CheckCircle" size={16} className="mr-2" />
              Mark All Read
            </Button>
          )}
        </div>

        {/* Filter Tabs */}
        <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-fit">
          {[
            { key: 'all', label: 'All' },
            { key: 'unread', label: 'Unread' },
            { key: 'read', label: 'Read' }
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => {
                setFilter(tab.key);
                setPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                filter === tab.key
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notifications List */}
        <div className="space-y-4">
          {loading && notifications.length === 0 ? (
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="bg-white rounded-lg shadow-sm p-4 animate-pulse">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 mb-2">{error}</p>
              <Button onClick={fetchNotifications} variant="outline">
                Try Again
              </Button>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-12">
              <Icon name="Bell" size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
                {filter === 'unread' ? 'No unread notifications' :
                 filter === 'read' ? 'No read notifications' :
                 'No notifications yet'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                {filter === 'unread' ? 'You\'re all caught up!' :
                 'Notifications will appear here when you have activity.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`transition-all duration-200 hover:shadow-md ${
                  !notification.is_read ? 'border-l-4 border-blue-500 bg-blue-50/50 dark:bg-blue-900/10' : ''
                }`}
              >
                <div className="flex items-start space-x-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${getNotificationColor(notification.type)}`}>
                    <Icon 
                      name={getNotificationIcon(notification.type)} 
                      size={20} 
                      className="text-current"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-sm font-semibold text-gray-800 dark:text-white">
                        {notification.payload?.title || getNotificationTitle(notification.type)}
                      </h3>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(notification.created_at)}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteNotification(notification.id)}
                          className="text-gray-400 hover:text-red-500 dark:hover:text-red-400"
                        >
                          <Icon name="Trash2" size={14} />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                      {notification.payload?.message || 'You have a new notification'}
                    </p>
                    {notification.payload?.title && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-2">
                        {notification.payload.title}
                      </p>
                    )}
                    <div className="flex items-center justify-between">
                      {!notification.is_read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markAsRead(notification.id)}
                          className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          <Icon name="Check" size={12} className="mr-1" />
                          Mark as read
                        </Button>
                      )}
                      {notification.is_read && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Icon name="CheckCircle" size={12} className="mr-1" />
                          Read
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}

          {/* Load More Button */}
          {hasMore && !loading && (
            <div className="text-center pt-4">
              <Button
                onClick={() => setPage(prev => prev + 1)}
                variant="outline"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default NotificationsPage;

