import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import Icon from '../../../components/AppIcon';
import LanguageToggle from './LanguageToggle';
import ResetPasswordForm from './ResetPasswordForm';

const ResetPasswordPage = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');

  useEffect(() => {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('currentLanguage');
    if (savedLanguage) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('currentLanguage', newLanguage);
  };

  const getPageTitle = () => {
    const baseTitle = 'Ke geberew Ethiopia';
    return currentLanguage === 'am' ? `ፓስዎርድ አስተካከል - ${baseTitle}` : `Reset Password - ${baseTitle}`;
  };

    return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>{getPageTitle()}</title>
        <meta name="description" content={
          currentLanguage === 'am' ?'የፓስዎርድ ማስተካከያ ገጽ' :'Password reset page for Ethio Farmers Shop'
        } />
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
                  Ke geberew
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
            <ResetPasswordForm currentLanguage={currentLanguage} />
          </div>
        </main>

        {/* Footer */}
        <footer className="flex-shrink-0 p-4 text-center">
          <p className="text-xs text-text-secondary">
            © {new Date()?.getFullYear()} Ke geberew Ethiopia.
            {currentLanguage === 'am' ? ' ሁሉም መብቶች የተጠበቁ ናቸው።' : ' All rights reserved.'}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default ResetPasswordPage;