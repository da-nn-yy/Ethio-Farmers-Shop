import React, { useState, useEffect } from 'react';
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
  const [activeTab, setActiveTab] = useState('account');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(true);

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('language', newLanguage);
  };

  // Handle photo edit
  const handleEditPhoto = () => {
    // Photo edit logic here
    console.log('Edit photo clicked');
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
      <main className="pt-32 lg:pt-36 pb-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2 text-sm text-text-secondary mb-2">
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
            <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
              {getLabel('Profile Management', 'የመገለጫ አስተዳደር')}
            </h1>
            <p className="text-text-secondary mt-2">
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
            />
          </div>

          {/* Desktop Tabs */}
          <div className="hidden lg:block">
            <div className="border-b border-border mb-8">
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
          <div className="lg:hidden mb-6">
            <div className="relative">
              <select
                value={activeTab}
                onChange={(e) => setActiveTab(e?.target?.value)}
                className="w-full p-3 bg-surface border border-border rounded-lg text-text-primary font-medium appearance-none pr-10"
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
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary pointer-events-none"
              />
            </div>
          </div>

          {/* Tab Content */}
          <div className="space-y-6">
            {renderTabContent()}
          </div>

          {/* Quick Actions (Mobile) */}
          <div className="lg:hidden fixed bottom-4 right-4 z-40">
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