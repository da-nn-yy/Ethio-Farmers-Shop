import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/ui/GlobalHeader';
import TabNavigation from '../../components/ui/TabNavigation';
import MobileMenu from '../../components/ui/MobileMenu';
import ProfileHeader from './components/ProfileHeader';
import AccountInformation from './components/AccountInformation';
import RoleSpecificSection from './components/RoleSpecificSection';
import VerificationSection from './components/VerificationSection';
import OrderHistorySection from './components/OrderHistorySection';
import SecuritySection from './components/SecuritySection';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const UserProfileManagement = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [userRole, setUserRole] = useState('farmer'); // farmer or buyer
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('account');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);


  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Fetch user profile from backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const authInstance = getAuth();
        const currentUser = authInstance.currentUser;
        if (!currentUser) return;
        const token = await currentUser.getIdToken();
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
        const { data } = await axios.get(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(data);
        setUserRole(data.role || 'farmer');
      } catch (e) {
        // handle error silently for now
      }
    };
    fetchUser();
  }, []);

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Handle photo edit
  const handleEditPhoto = async (file) => {
    try {
      const authInstance = getAuth();
      const currentUser = authInstance.currentUser;
      if (!currentUser || !file) return;
      const token = await currentUser.getIdToken();
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const form = new FormData();
      form.append('image', file);
      const { data } = await axios.post(`${API_BASE}/users/me/avatar`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`
        }
      });
      setUser(prev => ({ ...(prev || {}), avatarUrl: data.avatarUrl }));
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
    {
      id: 'role-specific',
      label: userRole === 'farmer' ? 'Farm Details' : 'Business Details',
      labelAm: userRole === 'farmer' ? 'የእርሻ ዝርዝሮች' : 'የንግድ ዝርዝሮች',
      icon: userRole === 'farmer' ? 'Sprout' : 'Building'
    },
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
          />
        );
      case 'role-specific':
        return (
          <RoleSpecificSection
            userRole={userRole}
            currentLanguage={currentLanguage}
          />
        );
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
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <GlobalHeader
        userRole={userRole}
        isAuthenticated={isAuthenticated}
        onLanguageChange={handleLanguageChange}
        currentLanguage={currentLanguage}
        user={user}
      />
      {/* Tab Navigation */}
      <TabNavigation
        userRole={userRole}
        notificationCounts={{ orders: 3, total: 5 }}
      />
      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        userRole={userRole}
        isAuthenticated={isAuthenticated}
        notificationCounts={{ orders: 3, total: 5 }}
        currentLanguage={currentLanguage}
      />
      {/* Main Content */}
      <main className="pt-32 pb-8 lg:pt-36">
        <div className="px-4 mx-auto max-w-7xl lg:px-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center mb-2 space-x-2 text-sm text-text-secondary">
              <button
                onClick={() => navigate('/dashboard-farmer-home')}
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
      </main>
    </div>
  );
};

export default UserProfileManagement;
