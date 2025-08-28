import React, { useState, useEffect } from 'react';
import Icon from '../AppIcon';
import Button from './Button';
import { useNavigate } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../../firebase';

const GlobalHeader = ({ userRole = null, isAuthenticated = false, onLanguageChange, currentLanguage = 'en' }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulate user data based on authentication state
    if (isAuthenticated) {
      setUser({
        name: userRole === 'farmer' ? 'Abebe Kebede' : 'Sarah Johnson',
        avatar: '/assets/images/no_image.png',
        role: userRole
      });
    } else {
      setUser(null);
    }
  }, [isAuthenticated, userRole]);

  const handleLanguageToggle = () => {
    const newLanguage = currentLanguage === 'en' ? 'am' : 'en';
    if (onLanguageChange) {
      onLanguageChange(newLanguage);
    }
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('firebase_id_token');
    // keep language preference
    setIsMobileMenuOpen(false);
    navigate('/authentication-login-register');
  };

  const languages = {
    en: { label: 'EN', fullName: 'English' },
    am: { label: 'አማ', fullName: 'አማርኛ' }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-surface border-b border-border shadow-warm">
      <div className="flex items-center justify-between h-16 lg:h-18 px-4 lg:px-6">
        {/* Logo Section */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 lg:w-10 lg:h-10 bg-primary rounded-lg flex items-center justify-center">
              <Icon name="Sprout" size={20} color="white" className="lg:w-6 lg:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="font-heading font-bold text-lg lg:text-xl text-primary">
                FarmConnect
              </span>
              <span className="font-caption text-xs text-text-secondary -mt-1">
                Ethiopia
              </span>
            </div>
          </div>
        </div>

        {/* Desktop Navigation & Actions */}
        <div className="hidden lg:flex items-center space-x-6">
          {/* Language Toggle */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLanguageToggle}
            className="flex items-center space-x-2 text-text-secondary hover:text-primary"
          >
            <Icon name="Globe" size={16} />
            <span className="font-medium">{languages?.[currentLanguage]?.label}</span>
          </Button>

          {/* User Section */}
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <Button
                variant="ghost"
                size="icon"
                className="relative text-text-secondary hover:text-primary"
              >
                <Icon name="Bell" size={20} />
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground text-xs font-medium rounded-full flex items-center justify-center">
                  3
                </span>
              </Button>

              {/* User Menu */}
              <div className="flex items-center space-x-3 pl-4 border-l border-border">
                <div className="w-8 h-8 bg-muted rounded-full overflow-hidden">
                  <img
                    src={user?.avatar}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = '/assets/images/no_image.png';
                    }}
                  />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text-primary">
                    {user?.name}
                  </span>
                  <span className="text-xs text-text-secondary capitalize">
                    {user?.role}
                  </span>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-text-secondary hover:text-primary"
                >
                  <Icon name="ChevronDown" size={16} />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <Button variant="ghost" size="sm" onClick={() => navigate('/authentication-login-register')}>
                Sign In
              </Button>
              <Button variant="default" size="sm" onClick={() => navigate('/authentication-login-register')}>
                Get Started
              </Button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <div className="lg:hidden flex items-center space-x-3">
          {/* Language Toggle Mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleLanguageToggle}
            className="text-text-secondary"
          >
            <span className="text-sm font-medium">{languages?.[currentLanguage]?.label}</span>
          </Button>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleMobileMenuToggle}
            className="text-text-secondary"
          >
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
          </Button>
        </div>
      </div>
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-surface z-40 border-t border-border">
          <div className="flex flex-col p-4 space-y-4">
            {isAuthenticated && user ? (
              <>
                {/* User Info */}
                <div className="flex items-center space-x-3 p-4 bg-muted rounded-lg">
                  <div className="w-12 h-12 bg-primary/10 rounded-full overflow-hidden">
                    <img
                      src={user?.avatar}
                      alt={user?.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = '/assets/images/no_image.png';
                      }}
                    />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-text-primary">
                      {user?.name}
                    </span>
                    <span className="text-sm text-text-secondary capitalize">
                      {user?.role}
                    </span>
                  </div>
                </div>

                {/* Notifications */}
                <Button
                  variant="ghost"
                  className="justify-start p-4 h-auto"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon name="Bell" size={20} className="mr-3" />
                  <span>Notifications</span>
                  <span className="ml-auto w-6 h-6 bg-accent text-accent-foreground text-xs font-medium rounded-full flex items-center justify-center">
                    3
                  </span>
                </Button>

                {/* Profile */}
                <Button
                  variant="ghost"
                  className="justify-start p-4 h-auto"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon name="User" size={20} className="mr-3" />
                  <span>Profile</span>
                </Button>

                {/* Settings */}
                <Button
                  variant="ghost"
                  className="justify-start p-4 h-auto"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon name="Settings" size={20} className="mr-3" />
                  <span>Settings</span>
                </Button>

                {/* Help */}
                <Button
                  variant="ghost"
                  className="justify-start p-4 h-auto"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon name="HelpCircle" size={20} className="mr-3" />
                  <span>Help & Support</span>
                </Button>

                <div className="border-t border-border pt-4">
                  <Button
                    variant="ghost"
                    className="justify-start p-4 h-auto text-error hover:text-error hover:bg-error/10"
                    onClick={handleLogout}
                  >
                    <Icon name="LogOut" size={20} className="mr-3" />
                    <span>Sign Out</span>
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="justify-start p-4 h-auto"
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/authentication-login-register'); }}
                >
                  <Icon name="LogIn" size={20} className="mr-3" />
                  <span>Sign In</span>
                </Button>
                <Button
                  variant="default"
                  className="justify-start p-4 h-auto"
                  onClick={() => { setIsMobileMenuOpen(false); navigate('/authentication-login-register'); }}
                >
                  <Icon name="UserPlus" size={20} className="mr-3" />
                  <span>Get Started</span>
                </Button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default GlobalHeader;
