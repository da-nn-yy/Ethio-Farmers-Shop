import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AdminPage from '../../components/ui/AdminPage.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/AppIcon.jsx';
import Button from '../../components/ui/Button.jsx';
import { adminService } from '../../services/apiService.js';

const defaultSettings = {
  general: {
    siteName: 'FarmConnect',
    defaultLanguage: 'en',
    siteDescription: 'Connecting farmers and buyers across Ethiopia.',
    timezone: 'Africa/Addis_Ababa',
    currency: 'ETB',
    maintenanceMode: false
  },
  notifications: {
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
    orderAlerts: true,
    userRegistrationAlerts: true,
    systemAlerts: true
  },
  security: {
    twoFactorAuth: true,
    passwordMinLength: 8,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    ipWhitelist: false,
    auditLogging: true
  },
  payment: {
    stripeEnabled: true,
    paypalEnabled: false,
    bankTransferEnabled: true,
    mobileMoneyEnabled: true,
    commissionRate: 5.0,
    minimumPayout: 1000
  },
  features: {
    userRegistration: true,
    farmerVerification: true,
    listingApproval: true,
    orderTracking: true,
    reviewsEnabled: true,
    chatEnabled: true
  }
};

const tabs = [
  { id: 'general', name: 'General', icon: 'Settings' },
  { id: 'notifications', name: 'Notifications', icon: 'Bell' },
  { id: 'security', name: 'Security', icon: 'Shield' },
  { id: 'payment', name: 'Payment', icon: 'CreditCard' },
  { id: 'features', name: 'Features', icon: 'ToggleLeft' },
  { id: 'backup', name: 'Backup', icon: 'Database' }
];

const AdminSettings = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [isLoading, setIsLoading] = useState(false);
  const [settings, setSettings] = useState(defaultSettings);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const data = await adminService.getSystemSettings();
      if (data) {
        setSettings((prev) => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSettingChange = (category, key, value) => {
    setSettings((prev) => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  };

  const handleSaveSettings = async () => {
    setIsLoading(true);
    try {
      await adminService.updateSystemSettings(settings);
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => setSettings(defaultSettings);

  const renderGeneralSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Site Name</label>
          <input
            type="text"
            value={settings.general.siteName}
            onChange={(e) => handleSettingChange('general', 'siteName', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Default Language</label>
          <select
            value={settings.general.defaultLanguage}
            onChange={(e) => handleSettingChange('general', 'defaultLanguage', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="en">English</option>
            <option value="am">Amharic</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Site Description</label>
        <textarea
          value={settings.general.siteDescription}
          onChange={(e) => handleSettingChange('general', 'siteDescription', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Timezone</label>
          <select
            value={settings.general.timezone}
            onChange={(e) => handleSettingChange('general', 'timezone', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="Africa/Addis_Ababa">Africa/Addis_Ababa</option>
            <option value="UTC">UTC</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Currency</label>
          <select
            value={settings.general.currency}
            onChange={(e) => handleSettingChange('general', 'currency', e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
          >
            <option value="ETB">ETB (Ethiopian Birr)</option>
            <option value="USD">USD (US Dollar)</option>
          </select>
        </div>
      </div>
      <div className="flex items-center">
        <input
          type="checkbox"
          id="maintenanceMode"
          checked={settings.general.maintenanceMode}
          onChange={(e) => handleSettingChange('general', 'maintenanceMode', e.target.checked)}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
        />
        <label htmlFor="maintenanceMode" className="ml-2 text-sm text-slate-700 dark:text-slate-300">
          Enable maintenance mode
        </label>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-slate-900 dark:text-white">Notification Channels</h4>
        {Object.entries(settings.notifications).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div>
              <h5 className="text-sm font-medium text-slate-900 dark:text-white">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {key === 'emailNotifications' && 'Send notifications via email'}
                {key === 'smsNotifications' && 'Send notifications via SMS'}
                {key === 'pushNotifications' && 'Send push notifications to mobile devices'}
                {key === 'orderAlerts' && 'Get notified about new orders'}
                {key === 'userRegistrationAlerts' && 'Get notified about new user registrations'}
                {key === 'systemAlerts' && 'Get notified about system events'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-slate-900 dark:text-white">Security Configuration</h4>
        {Object.entries(settings.security).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div>
              <h5 className="text-sm font-medium text-slate-900 dark:text-white">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {key === 'twoFactorAuth' && 'Require two-factor authentication for admin accounts'}
                {key === 'passwordMinLength' && 'Minimum password length'}
                {key === 'sessionTimeout' && 'Session timeout in minutes'}
                {key === 'maxLoginAttempts' && 'Maximum failed login attempts before lockout'}
                {key === 'ipWhitelist' && 'Restrict access to specific IP addresses'}
                {key === 'auditLogging' && 'Log all administrative actions'}
              </p>
            </div>
            {typeof value === 'boolean' ? (
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleSettingChange('security', key, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
            ) : (
              <input
                type="number"
                value={value}
                onChange={(e) => handleSettingChange('security', key, parseInt(e.target.value, 10))}
                className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPaymentSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-slate-900 dark:text-white">Payment Methods</h4>
        {Object.entries(settings.payment).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div>
              <h5 className="text-sm font-medium text-slate-900 dark:text-white">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {key === 'stripeEnabled' && 'Enable Stripe payment processing'}
                {key === 'paypalEnabled' && 'Enable PayPal payment processing'}
                {key === 'bankTransferEnabled' && 'Enable bank transfer payments'}
                {key === 'mobileMoneyEnabled' && 'Enable mobile money payments'}
                {key === 'commissionRate' && 'Platform commission rate (%)'}
                {key === 'minimumPayout' && 'Minimum payout amount (ETB)'}
              </p>
            </div>
            {typeof value === 'boolean' ? (
              <input
                type="checkbox"
                checked={value}
                onChange={(e) => handleSettingChange('payment', key, e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
              />
            ) : (
              <input
                type="number"
                value={value}
                onChange={(e) => handleSettingChange('payment', key, parseFloat(e.target.value))}
                className="w-20 px-2 py-1 border border-slate-300 dark:border-slate-600 rounded focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderFeatureSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h4 className="text-lg font-medium text-slate-900 dark:text-white">Feature Toggles</h4>
        {Object.entries(settings.features).map(([key, value]) => (
          <div key={key} className="flex items-center justify-between p-4 border border-slate-200 dark:border-slate-700 rounded-lg">
            <div>
              <h5 className="text-sm font-medium text-slate-900 dark:text-white">
                {key.replace(/([A-Z])/g, ' $1').replace(/^./, (str) => str.toUpperCase())}
              </h5>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {key === 'userRegistration' && 'Allow new user registrations'}
                {key === 'farmerVerification' && 'Require farmer verification process'}
                {key === 'listingApproval' && 'Require admin approval for new listings'}
                {key === 'orderTracking' && 'Enable order tracking functionality'}
                {key === 'reviewsEnabled' && 'Allow users to leave reviews'}
                {key === 'chatEnabled' && 'Enable chat between users'}
              </p>
            </div>
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleSettingChange('features', key, e.target.checked)}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-slate-300 rounded"
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderBackupSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Icon name="Database" size={24} className="text-blue-600 dark:text-blue-400" />
            <h4 className="text-lg font-medium text-slate-900 dark:text-white">Database Backup</h4>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Last backup: 2 hours ago</p>
          <div className="space-y-2">
            <Button variant="primary" size="sm" iconName="Download" className="w-full">Create Backup</Button>
            <Button variant="outline" size="sm" iconName="Upload" className="w-full">Restore Backup</Button>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center space-x-3 mb-4">
            <Icon name="FileText" size={24} className="text-green-600 dark:text-green-400" />
            <h4 className="text-lg font-medium text-slate-900 dark:text-white">Export Data</h4>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">Export system data for analysis</p>
          <div className="space-y-2">
            <Button variant="primary" size="sm" iconName="Download" className="w-full">Export Users</Button>
            <Button variant="outline" size="sm" iconName="Download" className="w-full">Export Orders</Button>
          </div>
        </Card>
      </div>
    </div>
  );

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
      title="System Settings"
      subtitle="Configure global settings for the platform"
      actions={(
        <>
          <Button variant="outline" size="sm" iconName="RotateCcw" onClick={handleReset}>Reset</Button>
          <Button variant="primary" size="sm" iconName="Save" onClick={handleSaveSettings} loading={isLoading}>
            Save Changes
          </Button>
        </>
      )}
    >
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card className="p-4">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                    activeTab === tab.id
                      ? 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon name={tab.icon} size={20} />
                  <span className="text-sm font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Card className="p-6">
            {activeTab === 'general' && renderGeneralSettings()}
            {activeTab === 'notifications' && renderNotificationSettings()}
            {activeTab === 'security' && renderSecuritySettings()}
            {activeTab === 'payment' && renderPaymentSettings()}
            {activeTab === 'features' && renderFeatureSettings()}
            {activeTab === 'backup' && renderBackupSettings()}
          </Card>
        </div>
      </div>
    </AdminPage>
  );
};

export default AdminSettings;
