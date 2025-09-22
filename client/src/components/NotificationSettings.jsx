import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth.jsx';
import Card from './ui/Card.jsx';
import Button from './ui/Button.jsx';
import Icon from './AppIcon.jsx';

const NotificationSettings = () => {
  const { user } = useAuth();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: true,
    orderUpdates: true,
    priceAlerts: true,
    newMessages: true,
    systemUpdates: false,
    promotions: false,
    marketing: false
  });
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      // In a real app, this would fetch from API
      // For now, we'll use localStorage
      const savedSettings = localStorage.getItem('notificationSettings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Failed to load notification settings:', error);
    }
  };

  const saveSettings = async () => {
    setLoading(true);
    try {
      // In a real app, this would save to API
      localStorage.setItem('notificationSettings', JSON.stringify(settings));
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error('Failed to save notification settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const notificationTypes = [
    {
      key: 'emailNotifications',
      title: 'Email Notifications',
      description: 'Receive notifications via email',
      icon: 'Mail'
    },
    {
      key: 'pushNotifications',
      title: 'Push Notifications',
      description: 'Receive browser push notifications',
      icon: 'Bell'
    },
    {
      key: 'orderUpdates',
      title: 'Order Updates',
      description: 'Get notified about order status changes',
      icon: 'ShoppingCart'
    },
    {
      key: 'priceAlerts',
      title: 'Price Alerts',
      description: 'Be notified when prices change for your favorites',
      icon: 'TrendingUp'
    },
    {
      key: 'newMessages',
      title: 'New Messages',
      description: 'Get notified when you receive new messages',
      icon: 'MessageCircle'
    },
    {
      key: 'systemUpdates',
      title: 'System Updates',
      description: 'Receive important system announcements',
      icon: 'Settings'
    },
    {
      key: 'promotions',
      title: 'Promotions',
      description: 'Get notified about special offers and discounts',
      icon: 'Gift'
    },
    {
      key: 'marketing',
      title: 'Marketing',
      description: 'Receive marketing communications (optional)',
      icon: 'Megaphone'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Notification Preferences
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Choose how you want to be notified about activities
          </p>
        </div>
        {saved && (
          <div className="flex items-center text-green-600 dark:text-green-400">
            <Icon name="CheckCircle" size={16} className="mr-1" />
            <span className="text-sm font-medium">Saved!</span>
          </div>
        )}
      </div>

      <Card className="p-6">
        <div className="space-y-6">
          {notificationTypes.map((type) => (
            <div key={type.key} className="flex items-center justify-between py-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                  <Icon name={type.icon} size={18} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-800 dark:text-white">
                    {type.title}
                  </h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {type.description}
                  </p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings[type.key]}
                  onChange={(e) => handleSettingChange(type.key, e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
              </label>
            </div>
          ))}
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            onClick={saveSettings}
            loading={loading}
            disabled={loading}
            className="min-w-[120px]"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </Button>
        </div>
      </Card>

      <Card className="p-6 bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-blue-600 dark:text-blue-400 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-1">
              Notification Tips
            </h3>
            <ul className="text-xs text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Enable push notifications for instant updates</li>
              <li>• Email notifications are sent for important activities</li>
              <li>• You can change these settings anytime</li>
              <li>• Some notifications are required for platform functionality</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default NotificationSettings;
