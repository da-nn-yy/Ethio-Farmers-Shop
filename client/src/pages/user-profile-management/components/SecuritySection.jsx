import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { Checkbox } from '../../../components/ui/Checkbox';

const SecuritySection = ({ currentLanguage }) => {
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const securitySettings = [
    {
      id: 'login-notifications',
      title: 'Login Notifications',
      titleAm: 'የመግቢያ ማሳወቂያዎች',
      description: 'Get notified when someone logs into your account',
      descriptionAm: 'ማንም ሰው ወደ መለያዎ ሲገባ ማሳወቂያ ያግኙ',
      enabled: true
    },
    {
      id: 'order-notifications',
      title: 'Order Notifications',
      titleAm: 'የትዕዛዝ ማሳወቂያዎች',
      description: 'Receive notifications for new orders and updates',
      descriptionAm: 'ለአዳዲስ ትዕዛዞች እና ዝማኔዎች ማሳወቂያዎችን ይቀበሉ',
      enabled: true
    },
    {
      id: 'marketing-emails',
      title: 'Marketing Emails',
      titleAm: 'የማርኬቲንግ ኢሜይሎች',
      description: 'Receive promotional emails and market updates',
      descriptionAm: 'የማስተዋወቂያ ኢሜይሎችን እና የገበያ ዝማኔዎችን ይቀበሉ',
      enabled: false
    }
  ];

  const recentActivity = [
    {
      id: 1,
      action: 'Login from mobile device',
      actionAm: 'ከሞባይል መሳሪያ መግቢያ',
      location: 'Addis Ababa, Ethiopia',
      locationAm: 'አዲስ አበባ፣ ኢትዮጵያ',
      timestamp: '2024-08-27 09:30:00',
      device: 'Mobile - Android',
      deviceAm: 'ሞባይል - አንድሮይድ',
      status: 'success'
    },
    {
      id: 2,
      action: 'Password changed',
      actionAm: 'የይለፍ ቃል ተቀይሯል',
      location: 'Addis Ababa, Ethiopia',
      locationAm: 'አዲስ አበባ፣ ኢትዮጵያ',
      timestamp: '2024-08-25 14:15:00',
      device: 'Desktop - Chrome',
      deviceAm: 'ዴስክቶፕ - ክሮም',
      status: 'success'
    },
    {
      id: 3,
      action: 'Failed login attempt',
      actionAm: 'ያልተሳካ የመግቢያ ሙከራ',
      location: 'Unknown Location',
      locationAm: 'ያልታወቀ አካባቢ',
      timestamp: '2024-08-23 22:45:00',
      device: 'Desktop - Firefox',
      deviceAm: 'ዴስክቶፕ - ፋየርፎክስ',
      status: 'failed'
    }
  ];

  const handlePasswordChange = (field, value) => {
    setPasswordData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordSubmit = () => {
    // Password change logic here
    setIsChangingPassword(false);
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  const handleTwoFactorToggle = () => {
    setTwoFactorEnabled(!twoFactorEnabled);
  };

  const getLabel = (text, textAm) => {
    return currentLanguage === 'am' ? textAm : text;
  };

  const getActivityStatus = (status) => {
    const statusConfig = {
      success: {
        color: 'text-success',
        icon: 'CheckCircle'
      },
      failed: {
        color: 'text-error',
        icon: 'XCircle'
      },
      warning: {
        color: 'text-warning',
        icon: 'AlertTriangle'
      }
    };

    return statusConfig?.[status];
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date?.toLocaleString();
  };

  return (
    <div className="space-y-6">
      {/* Password Change Section */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">
            {getLabel('Password & Security', 'የይለፍ ቃል እና ደህንነት')}
          </h2>
          <Icon name="Shield" size={20} className="text-primary" />
        </div>

        {/* Change Password */}
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium text-text-primary">
                {getLabel('Password', 'የይለፍ ቃል')}
              </h3>
              <p className="text-sm text-text-secondary">
                {getLabel('Last changed 2 days ago', 'ከ2 ቀናት በፊት ተቀይሯል')}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsChangingPassword(!isChangingPassword)}
              iconName="Key"
              iconPosition="left"
            >
              {getLabel('Change Password', 'የይለፍ ቃል ቀይር')}
            </Button>
          </div>

          {isChangingPassword && (
            <div className="p-4 border border-border rounded-lg space-y-4">
              <Input
                label={getLabel('Current Password', 'የአሁኑ የይለፍ ቃል')}
                type="password"
                value={passwordData?.currentPassword}
                onChange={(e) => handlePasswordChange('currentPassword', e?.target?.value)}
                required
              />
              
              <Input
                label={getLabel('New Password', 'አዲስ የይለፍ ቃል')}
                type="password"
                value={passwordData?.newPassword}
                onChange={(e) => handlePasswordChange('newPassword', e?.target?.value)}
                description={getLabel('Must be at least 8 characters long', 'ቢያንስ 8 ቁምፊዎች ሊኖሩት ይገባል')}
                required
              />
              
              <Input
                label={getLabel('Confirm New Password', 'አዲሱን የይለፍ ቃል አረጋግጥ')}
                type="password"
                value={passwordData?.confirmPassword}
                onChange={(e) => handlePasswordChange('confirmPassword', e?.target?.value)}
                required
              />

              <div className="flex items-center space-x-2 pt-2">
                <Button
                  variant="default"
                  size="sm"
                  onClick={handlePasswordSubmit}
                  iconName="Check"
                  iconPosition="left"
                >
                  {getLabel('Update Password', 'የይለፍ ቃል አዘምን')}
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsChangingPassword(false)}
                >
                  {getLabel('Cancel', 'ሰርዝ')}
                </Button>
              </div>
            </div>
          )}

          {/* Two-Factor Authentication */}
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div>
              <h3 className="font-medium text-text-primary">
                {getLabel('Two-Factor Authentication', 'ሁለት-ደረጃ ማረጋገጫ')}
              </h3>
              <p className="text-sm text-text-secondary">
                {getLabel('Add an extra layer of security to your account', 'ለመለያዎ ተጨማሪ የደህንነት ሽፋን ይጨምሩ')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className={`text-sm ${twoFactorEnabled ? 'text-success' : 'text-text-secondary'}`}>
                {twoFactorEnabled 
                  ? getLabel('Enabled', 'ነቅቷል')
                  : getLabel('Disabled', 'ተዘግቷል')
                }
              </span>
              <Button
                variant={twoFactorEnabled ? "outline" : "default"}
                size="sm"
                onClick={handleTwoFactorToggle}
                iconName={twoFactorEnabled ? "ShieldOff" : "Shield"}
                iconPosition="left"
              >
                {twoFactorEnabled 
                  ? getLabel('Disable', 'አሰናክል')
                  : getLabel('Enable', 'አንቃ')
                }
              </Button>
            </div>
          </div>
        </div>
      </div>
      {/* Privacy Settings */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
        <h2 className="text-xl font-bold text-text-primary mb-6">
          {getLabel('Privacy Settings', 'የግላዊነት ቅንብሮች')}
        </h2>

        <div className="space-y-4">
          {securitySettings?.map((setting) => (
            <div key={setting?.id} className="flex items-start justify-between p-4 bg-muted rounded-lg">
              <div className="flex-1">
                <h3 className="font-medium text-text-primary mb-1">
                  {currentLanguage === 'am' ? setting?.titleAm : setting?.title}
                </h3>
                <p className="text-sm text-text-secondary">
                  {currentLanguage === 'am' ? setting?.descriptionAm : setting?.description}
                </p>
              </div>
              <Checkbox
                checked={setting?.enabled}
                onChange={(e) => {
                  // Handle setting toggle
                }}
                className="mt-1"
              />
            </div>
          ))}
        </div>
      </div>
      {/* Recent Activity */}
      <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-text-primary">
            {getLabel('Recent Activity', 'የቅርብ ጊዜ እንቅስቃሴ')}
          </h2>
          <Button variant="ghost" size="sm" iconName="RefreshCw" iconPosition="left">
            {getLabel('Refresh', 'አድስ')}
          </Button>
        </div>

        <div className="space-y-3">
          {recentActivity?.map((activity) => {
            const statusConfig = getActivityStatus(activity?.status);
            
            return (
              <div key={activity?.id} className="flex items-start space-x-3 p-3 border border-border rounded-lg">
                <Icon 
                  name={statusConfig?.icon} 
                  size={16} 
                  className={`mt-1 ${statusConfig?.color}`}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium text-text-primary">
                        {currentLanguage === 'am' ? activity?.actionAm : activity?.action}
                      </p>
                      <div className="flex items-center space-x-2 text-sm text-text-secondary">
                        <span>{currentLanguage === 'am' ? activity?.locationAm : activity?.location}</span>
                        <span>•</span>
                        <span>{currentLanguage === 'am' ? activity?.deviceAm : activity?.device}</span>
                      </div>
                    </div>
                    <span className="text-xs text-text-secondary whitespace-nowrap">
                      {formatTimestamp(activity?.timestamp)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" iconName="Eye" iconPosition="left">
            {getLabel('View All Activity', 'ሁሉንም እንቅስቃሴ ይመልከቱ')}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SecuritySection;