import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationService } from '../services/apiService.js';
import { useAuth } from '../hooks/useAuth.jsx';
import Icon from './AppIcon.jsx';

const NotificationBell = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchUnreadCount();
      // Poll for new notifications every 15 seconds for better real-time experience
      const interval = setInterval(fetchUnreadCount, 15000);
      return () => clearInterval(interval);
    }
  }, [user]);

  // Listen for visibility changes to refresh when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user) {
        fetchUnreadCount();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const fetchUnreadCount = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const response = await notificationService.getUserNotifications({
        limit: 1,
        unreadOnly: true
      });
      setUnreadCount(response.unreadCount || 0);
    } catch (err) {
      console.error('Failed to fetch notification count:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBellClick = () => {
    navigate('/notifications');
  };

  if (!user) return null;

  return (
    <button
      onClick={handleBellClick}
      className="relative p-2 text-gray-600 hover:text-gray-800 transition-colors rounded-lg hover:bg-gray-100 dark:text-gray-300 dark:hover:text-gray-100 dark:hover:bg-gray-700"
      disabled={loading}
      title="View Notifications"
    >
      <Icon 
        name="Bell" 
        size={20} 
        className={`transition-all duration-200 ${unreadCount > 0 ? 'text-blue-600 dark:text-blue-400' : ''}`}
      />

      {unreadCount > 0 && (
        <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm animate-pulse">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        </div>
      )}
    </button>
  );
};

export default NotificationBell;

