import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../components/AppIcon';
import LanguageToggle from './components/LanguageToggle';
import AuthTabs from './components/AuthTabs';
import LoginForm from './components/LoginForm';
import RegisterForm from './components/RegisterForm';
import TrustSignals from './components/TrustSignals';

const AuthenticationPage = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [activeTab, setActiveTab] = useState('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('currentLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }

    // Check authentication status
    const authStatus = localStorage.getItem('isAuthenticated');
    if (authStatus === 'true') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('currentLanguage', newLanguage);
  };

  const handleAuthSuccess = (userRole) => {
    setIsAuthenticated(true);
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', userRole);
    localStorage.setItem('userName', userRole === 'farmer' ? 'Test Farmer' : 'Test Buyer');
  };

  // Test authentication for development
  const handleTestLogin = (role) => {
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', role);
    localStorage.setItem('userName', role === 'farmer' ? 'Test Farmer' : 'Test Buyer');
    setIsAuthenticated(true);

    // Navigate to appropriate dashboard
    if (role === 'farmer') {
      window.location.href = '/dashboard-farmer-home';
    } else {
      window.location.href = '/dashboard-buyer-home';
    }
  };

  const getPageTitle = () => {
    const baseTitle = 'FarmConnect Ethiopia';
    if (activeTab === 'login') {
      return currentLanguage === 'am' ? `ግባ - ${baseTitle}` : `Sign In - ${baseTitle}`;
    } else {
      return currentLanguage === 'am' ? `ተመዝገብ - ${baseTitle}` : `Register - ${baseTitle}`;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={
          currentLanguage === 'am' ?'የኢትዮጵያ ገበሬዎችን ከገዢዎች ጋር የሚያገናኝ ዲጂታል ገበያ። ፍትሃዊ ዋጋ እና ቀጥተኛ ግንኙነት።' :'Digital marketplace connecting Ethiopian farmers directly with buyers. Fair prices and direct connections.'
        } />
        <meta name="keywords" content="Ethiopia, farmers, marketplace, agriculture, direct trade" />
      </Helmet>
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-accent/5" />
      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex-shrink-0 p-4 lg:p-6">
          <div className="flex items-center justify-between max-w-md mx-auto lg:max-w-lg">
            {/* Logo */}
            <div className="flex items-center space-x-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary">
                <Icon name="Sprout" size={24} color="white" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold font-heading text-primary">
                  FarmConnect
                </span>
                <span className="-mt-1 text-xs font-caption text-text-secondary">
                  Ethiopia
                </span>
              </div>
            </div>

            {/* Language Toggle */}
            <LanguageToggle
              currentLanguage={currentLanguage}
              onLanguageChange={handleLanguageChange}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex items-center justify-center flex-1 p-4 lg:p-6">
          <div className="w-full max-w-md lg:max-w-lg">
            {/* Welcome Section */}
            <div className="mb-8 text-center">
              <h1 className="mb-2 text-2xl font-bold lg:text-3xl text-text-primary">
                {currentLanguage === 'am' ?'እንኳን ወደ FarmConnect በደህና መጡ' :'Welcome to FarmConnect'
                }
              </h1>
              <p className="text-text-secondary">
                {currentLanguage === 'am' ?'ገበሬዎችን ከገዢዎች ጋር በቀጥታ የሚያገናኝ መድረክ' :'Connecting farmers directly with buyers'
                }
              </p>
            </div>

            {/* Auth Form Container */}
            <div className="p-6 border bg-surface rounded-2xl shadow-warm-lg border-border lg:p-8">
              <AuthTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
                currentLanguage={currentLanguage}
              />

              {/* Form Content */}
              <div className="space-y-6">
                {activeTab === 'login' ? (
                  <LoginForm
                    currentLanguage={currentLanguage}
                    onAuthSuccess={handleAuthSuccess}
                  />
                ) : (
                  <RegisterForm
                    currentLanguage={currentLanguage}
                    onAuthSuccess={handleAuthSuccess}
                  />
                )}
              </div>

              {/* Trust Signals */}
              <TrustSignals currentLanguage={currentLanguage} />
            </div>

            {/* Footer Help Text */}
            <div className="mt-8 text-center">
              <p className="text-sm text-text-secondary">
                {currentLanguage === 'am' ?'ችግር አለብዎት? ' :'Need help? '
                }
                <button className="font-medium text-primary hover:text-primary/80 transition-smooth">
                  {currentLanguage === 'am' ? 'እርዳታ ያግኙ' : 'Get Support'}
                </button>
              </p>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 p-4 text-center">
          <p className="text-xs text-text-secondary">
            © {new Date()?.getFullYear()} FarmConnect Ethiopia.
            {currentLanguage === 'am' ? ' ሁሉም መብቶች የተጠበቁ ናቸው።' : ' All rights reserved.'}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default AuthenticationPage;
