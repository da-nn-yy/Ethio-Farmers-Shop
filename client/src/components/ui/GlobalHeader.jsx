import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth.jsx";
import Button from "./Button";
import Icon from "../AppIcon";
import NotificationBell from "../NotificationBell.jsx";
import { useLanguage } from "../../hooks/useLanguage.jsx";

const GlobalHeader = ({ onLanguageChange, currentLanguage = "en", publicOnly = false, onToggleSidebar, isSidebarCollapsed = false, showSidebarToggle = true }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [, forceUpdate] = useState({});
  const showUserSection = !!user && !publicOnly;
  const { language, toggle } = useLanguage();

  // Listen for user data updates
  useEffect(() => {
    const handleUserDataUpdate = (event) => {
      // Force re-render by updating state
      forceUpdate({});
    };

    window.addEventListener('userDataUpdated', handleUserDataUpdate);
    return () => window.removeEventListener('userDataUpdated', handleUserDataUpdate);
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    navigate("/authentication-login-register");
  };

  const handleLanguageToggle = () => {
    if (onLanguageChange) {
      const newLang = currentLanguage === "en" ? "am" : "en";
      onLanguageChange(newLang);
    }
    toggle();
  };

  const languages = {
    en: { label: "EN", fullName: "English" },
    am: { label: "አማ", fullName: "አማርኛ" },
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b shadow-warm supports-[backdrop-filter]:backdrop-blur-md bg-white/60 dark:bg-slate-900/40 border-white/20 dark:border-white/10">
      <div className="flex items-center justify-between h-16 px-4 lg:h-18 lg:px-6">
        {/* Left section: logo */}
        <div className="flex items-center space-x-3 lg:space-x-4">
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate("/")}>
            <div className="flex items-center justify-center w-8 h-8 rounded-lg lg:w-10 lg:h-10 bg-primary">
              <Icon name="Sprout" size={20} color="white" className="lg:w-6 lg:h-6" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold font-heading lg:text-xl text-primary">KeGeberew</span>
              <span className="-mt-1 text-xs font-caption text-text-secondary">Ethiopia</span>
            </div>
          </div>
        </div>

        {/* Actions (now visible on all breakpoints) */}
        <div className="items-center flex space-x-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLanguageToggle}
            className="flex items-center space-x-2 text-text-secondary hover:text-primary"
          >
            <Icon name="Globe" size={16} />
            <span className="font-medium">{languages?.[language]?.label}</span>
          </Button>

          {showUserSection ? (
            <div className="relative flex items-center space-x-4">
              <NotificationBell />

              {/* User Menu */}
              <div className="flex items-center pl-4 space-x-3 border-l cursor-pointer border-border" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <div className="w-8 h-8 overflow-hidden rounded-full bg-muted">
                  <img src={user.avatarUrl || "/assets/images/no_image.png"} alt={user.fullName || user.full_name || "User"} className="object-cover w-full h-full" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text-primary">{user.fullName || user.full_name || "User"}</span>
                  <span className="text-xs capitalize text-text-secondary">{user.role}</span>
                </div>
                <Button variant="ghost" size="icon" className="text-text-secondary hover:text-primary">
                  <Icon name={isUserMenuOpen ? "ChevronUp" : "ChevronDown"} size={16} />
                </Button>
              </div>

              {isUserMenuOpen && (
                <div className="absolute right-0 w-56 p-2 border rounded-lg top-12 bg-surface border-border shadow-warm">
                  <Button variant="ghost" className="justify-start w-full px-3 py-2" onClick={() => { setIsUserMenuOpen(false); navigate("/user-profile-management"); }}>
                    <Icon name="User" size={16} className="mr-2" /> Profile
                  </Button>
                  <Button variant="ghost" className="justify-start w-full px-3 py-2" onClick={() => { setIsUserMenuOpen(false); navigate("/notifications"); }}>
                    <Icon name="Bell" size={16} className="mr-2" /> Notifications
                  </Button>
                  <Button variant="ghost" className="justify-start w-full px-3 py-2" onClick={() => { setIsUserMenuOpen(false); navigate("/settings"); }}>
                    <Icon name="Settings" size={16} className="mr-2" /> Settings
                  </Button>
                  <Button variant="ghost" className="justify-start w-full px-3 py-2" onClick={() => { setIsUserMenuOpen(false); navigate("/help"); }}>
                    <Icon name="HelpCircle" size={16} className="mr-2" /> Help & Support
                  </Button>
                  <div className="my-2 border-t border-border" />
                  <Button variant="ghost" className="justify-start w-full px-3 py-2 text-error hover:text-error hover:bg-error/10" onClick={handleLogout}>
                    <Icon name="LogOut" size={16} className="mr-2" /> Sign Out
                  </Button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/authentication-login-register")}>Sign In</Button>
              <Button variant="default" size="sm" onClick={() => navigate("/authentication-login-register")}>Get Started</Button>
            </>
          )}
        </div>

        {/* Mobile Menu */}
        <div className="flex items-center space-x-3 lg:hidden">
          {showUserSection && <NotificationBell />}
          <Button variant="ghost" size="icon" onClick={handleLanguageToggle}>
            <span className="text-sm font-medium">{languages?.[currentLanguage]?.label}</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Icon name={isMobileMenuOpen ? "X" : "Menu"} size={24} />
          </Button>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 border-t lg:hidden top-16 bg-surface/80 supports-[backdrop-filter]:backdrop-blur-md border-border">
          <div className="flex flex-col p-4 space-y-4">
            {showUserSection ? (
              <>
                <div className="flex items-center p-4 space-x-3 rounded-lg bg-muted">
                  <div className="w-12 h-12 overflow-hidden rounded-full bg-primary/10">
                    <img src={user.avatarUrl || "/assets/images/no_image.png"} alt={user.fullName || user.full_name || "User"} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-text-primary">{user.fullName || user.full_name || "User"}</span>
                    <span className="text-sm capitalize text-text-secondary">{user.role}</span>
                  </div>
                </div>

                <Button variant="ghost" className="justify-start h-auto p-4" onClick={() => setIsMobileMenuOpen(false)}>
                  <Icon name="Bell" size={20} className="mr-3" /> Notifications
                </Button>

                <Button variant="ghost" className="justify-start h-auto p-4" onClick={() => setIsMobileMenuOpen(false)}>
                  <Icon name="User" size={20} className="mr-3" /> Profile
                </Button>

                <Button variant="ghost" className="justify-start h-auto p-4" onClick={() => setIsMobileMenuOpen(false)}>
                  <Icon name="Settings" size={20} className="mr-3" /> Settings
                </Button>

                <Button variant="ghost" className="justify-start h-auto p-4" onClick={() => setIsMobileMenuOpen(false)}>
                  <Icon name="HelpCircle" size={20} className="mr-3" /> Help & Support
                </Button>

                <div className="pt-4 border-t border-border">
                  <Button variant="ghost" className="justify-start h-auto p-4 text-error hover:text-error hover:bg-error/10" onClick={handleLogout}>
                    <Icon name="LogOut" size={20} className="mr-3" /> Sign Out
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button variant="ghost" className="justify-start h-auto p-4" onClick={() => { setIsMobileMenuOpen(false); navigate("/authentication-login-register"); }}>
                  <Icon name="LogIn" size={20} className="mr-3" /> Sign In
                </Button>
                <Button variant="default" className="justify-start h-auto p-4" onClick={() => { setIsMobileMenuOpen(false); navigate("/authentication-login-register"); }}>
                  <Icon name="UserPlus" size={20} className="mr-3" /> Get Started
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
