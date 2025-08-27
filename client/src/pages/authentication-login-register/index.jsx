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
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Icon name="Sprout" size={24} color="white" />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-bold text-xl text-primary">
                  FarmConnect
                </span>
                <span className="font-caption text-xs text-text-secondary -mt-1">
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
        <main className="flex-1 flex items-center justify-center p-4 lg:p-6">
          <div className="w-full max-w-md lg:max-w-lg">
            {/* Welcome Section */}
            <div className="text-center mb-8">
              <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2">
                {currentLanguage === 'am' ?'እንኳን ወደ FarmConnect በደህና መጡ' :'Welcome to FarmConnect'
                }
              </h1>
              <p className="text-text-secondary">
                {currentLanguage === 'am' ?'ገበሬዎችን ከገዢዎች ጋር በቀጥታ የሚያገናኝ መድረክ' :'Connecting farmers directly with buyers'
                }
              </p>
            </div>

            {/* Auth Form Container */}
            <div className="bg-surface rounded-2xl shadow-warm-lg border border-border p-6 lg:p-8">
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
                <button className="text-primary hover:text-primary/80 transition-smooth font-medium">
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