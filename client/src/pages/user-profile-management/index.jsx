import React, { useState, useEffect } from 'react';
import { userService } from '../../services/apiService';
import { useNavigate } from 'react-router-dom';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import ProfileHeader from './components/ProfileHeader';
import AccountInformation from './components/AccountInformation';
import RoleSpecificSection from './components/RoleSpecificSection';
import VerificationSection from './components/VerificationSection';
import OrderHistorySection from './components/OrderHistorySection';
import SecuritySection from './components/SecuritySection';
import FarmerProfileStats from './components/FarmerProfileStats';
import CertificationManagement from './components/CertificationManagement';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useLanguage } from '../../hooks/useLanguage.jsx';

const UserProfileManagement = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [userRole, setUserRole] = useState('buyer'); // will be set from API
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('account');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);


  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  useEffect(() => { if (language !== currentLanguage) setCurrentLanguage(language); }, [language]);

  // Fetch user profile from backend and enforce role-based tabs
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const data = await userService.getMe();
        setUser(data);
        setUserRole(data.role || 'buyer');
      } catch (e) {
        // ignore; layout will protect route elsewhere
      }
    };
    fetchUser();
  }, []);

  // Listen for user data updates from other components
  useEffect(() => {
    const handleUserDataUpdate = (event) => {
      if (event.detail) {
        setUser(prev => ({ ...prev, ...event.detail }));
      }
    };

    window.addEventListener('userDataUpdated', handleUserDataUpdate);
    return () => window.removeEventListener('userDataUpdated', handleUserDataUpdate);
  }, []);

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Handle photo edit
  const handleEditPhoto = async (file) => {
    try {
      if (!file) return;
      const data = await userService.uploadAvatar(file);
      const newAvatar = data.avatarUrl || data.url || data.imageUrl;
      setUser(prev => ({ ...(prev || {}), avatarUrl: newAvatar }));
      // Persist to localStorage
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
      localStorage.setItem('userData', JSON.stringify({ ...currentUser, avatarUrl: newAvatar }));
      // Notify app-wide listeners (e.g., nav bar) for instant update
      window.dispatchEvent(new CustomEvent('userDataUpdated', { detail: { avatarUrl: newAvatar } }));
    } catch (e) {
      // ignore for now
    }
  };

  // Tab configuration
  const tabs = [
    {
      id: 'account',
      label: 'Account Info',
      labelAm: 'የመለያ መረጃ',
      icon: 'User'
    },
    ...(userRole === 'farmer' ? [{
      id: 'role-specific',
      label: 'Farm Details',
      labelAm: 'የእርሻ ዝርዝሮች',
      icon: 'Sprout'
    }] : [{
      id: 'role-specific',
      label: 'Business Details',
      labelAm: 'የንግድ ዝርዝሮች',
      icon: 'Building'
    }]),
    ...(userRole === 'farmer' ? [
      {
        id: 'stats',
        label: 'Profile Stats',
        labelAm: 'የመገለጫ ስታቲስቲክስ',
        icon: 'BarChart'
      },
      {
        id: 'certifications',
        label: 'Certifications',
        labelAm: 'ማረጋገጫዎች',
        icon: 'Award'
      }
    ] : []),
    {
      id: 'verification',
      label: 'Verification',
      labelAm: 'ማረጋገጫ',
      icon: 'Shield'
    },
    {
      id: 'orders',
      label: 'Order History',
      labelAm: 'የትዕዛዝ ታሪክ',
      icon: 'History'
    },
    {
      id: 'security',
      label: 'Security',
      labelAm: 'ደህንነት',
      icon: 'Lock'
    }
  ];

  const getLabel = (text, textAm) => {
    return currentLanguage === 'am' ? textAm : text;
  };

  const getTabLabel = (tab) => {
    return currentLanguage === 'am' ? tab?.labelAm : tab?.label;
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'account':
        return (
          <AccountInformation
            userRole={userRole}
            currentLanguage={currentLanguage}
            onProfileUpdated={(patch) => setUser(prev => ({ ...(prev || {}), ...patch }))}
          />
        );
      case 'role-specific':
        return (
          <RoleSpecificSection
            userRole={userRole}
            currentLanguage={currentLanguage}
          />
        );
      case 'stats':
        return userRole === 'farmer' ? (
          <FarmerProfileStats
            currentLanguage={currentLanguage}
          />
        ) : null;
      case 'certifications':
        return userRole === 'farmer' ? (
          <CertificationManagement
            currentLanguage={currentLanguage}
          />
        ) : null;
      case 'verification':
        return (
          <VerificationSection
            userRole={userRole}
            currentLanguage={currentLanguage}
          />
        );
      case 'orders':
        return (
          <OrderHistorySection
            userRole={userRole}
            currentLanguage={currentLanguage}
          />
        );
      case 'security':
        return (
          <SecuritySection
            currentLanguage={currentLanguage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <AuthenticatedLayout>
        <div className="px-4 mx-auto max-w-7xl lg:px-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center mb-2 space-x-2 text-sm text-text-secondary">
              <button
                onClick={() => navigate(userRole === 'buyer' ? '/dashboard-buyer-home' : '/dashboard-farmer-home')}
                className="hover:text-primary transition-smooth"
              >
                {getLabel('Dashboard', 'ዳሽቦርድ')}
              </button>
              <Icon name="ChevronRight" size={16} />
              <span className="text-text-primary">
                {getLabel('Profile Management', 'የመገለጫ አስተዳደር')}
              </span>
            </div>
            <h1 className="text-2xl font-bold lg:text-3xl text-text-primary">
              {getLabel('Profile Management', 'የመገለጫ አስተዳደር')}
            </h1>
            <p className="mt-2 text-text-secondary">
              {getLabel(
                'Manage your account information, verification documents, and security settings.',
                'የመለያ መረጃዎን፣ የማረጋገጫ ሰነዶችን እና የደህንነት ቅንብሮችን ያስተዳድሩ።'
              )}
            </p>
          </div>

          {/* Welcome message for new users */}
          {user && (!user.full_name || !user.phone || !user.region || !user.woreda) && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-start space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-medium text-green-800">
                      {getLabel('Welcome to Ke geberew!', 'እንኳን ወደ ከገበረው በደህና መጡ!')}
                  </h3>
                  <p className="mt-1 text-sm text-green-700">
                    {getLabel(
                      'Complete your profile to get the most out of Ke geberew. This helps other users find and connect with you.',
                      'ከ ከገበረው የተሻለ ጥቅም ለማግኘት የመገለጫ መረጃዎን ያጠናቅቁ። ይህ ሌሎች ተጠቃሚዎች እንዲያገኙዎት እና እንዲገናኙዎት ይረዳል።'
                    )}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Profile Header */}
          <div className="mb-8">
            <ProfileHeader
              userRole={userRole}
              currentLanguage={currentLanguage}
              onEditPhoto={handleEditPhoto}
              user={user}
            />
          </div>

          {/* Desktop Tabs */}
          <div className="hidden lg:block">
            <div className="mb-8 border-b border-border">
              <nav className="flex space-x-8">
                {tabs?.map((tab) => (
                  <button
                    key={tab?.id}
                    onClick={() => setActiveTab(tab?.id)}
                    className={`
                      flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-smooth
                      ${activeTab === tab?.id
                        ? 'border-primary text-primary' :'border-transparent text-text-secondary hover:text-primary hover:border-primary/50'
                      }
                    `}
                  >
                    <Icon name={tab?.icon} size={18} />
                    <span>{getTabLabel(tab)}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Mobile Tab Selector */}
          <div className="mb-6 lg:hidden">
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e?.target?.value)}
                className="w-full p-3 pr-10 font-medium border rounded-lg appearance-none bg-surface border-border text-text-primary"
              >
                {tabs?.map((tab) => (
                  <option key={tab?.id} value={tab?.id}>
                    {getTabLabel(tab)}
                  </option>
                ))}
              </select>
              <Icon
                name="ChevronDown"
                size={20}
                className="absolute transform -translate-y-1/2 pointer-events-none right-3 top-1/2 text-text-secondary"
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {renderTabContent()}
          </div>

          {/* Quick Actions (Mobile) */}
          <div className="fixed z-40 lg:hidden bottom-4 right-4">
            <div className="flex flex-col space-y-2">
              <Button
                variant="default"
                size="icon"
                className="w-12 h-12 rounded-full shadow-warm-lg"
                onClick={() => setActiveTab('verification')}
              >
                <Icon name="Shield" size={20} />
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="w-12 h-12 rounded-full shadow-warm-lg bg-surface"
                onClick={() => setActiveTab('security')}
              >
                <Icon name="Lock" size={20} />
              </Button>
            </div>
          </div>
        </div>
    </AuthenticatedLayout>
  );
};

export default UserProfileManagement;
