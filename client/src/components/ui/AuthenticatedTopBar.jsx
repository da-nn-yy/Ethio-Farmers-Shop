import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import Button from './Button';
import Icon from '../AppIcon';
import { useLanguage } from '../../hooks/useLanguage.jsx';
import { useCart } from '../../hooks/useCart.jsx';
import NotificationBell from '../NotificationBell.jsx';

const AuthenticatedTopBar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { language, toggle, setLanguage } = useLanguage();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { totalItems } = useCart();

  useEffect(() => {
    const saved = localStorage.getItem('farmconnect_language') || 'en';
    setLanguage(saved);
  }, []);

  const toggleLanguage = () => toggle();

  const handleLogout = async () => {
    await logout();
    navigate('/authentication-login-register');
  };

  const role = user?.role || localStorage.getItem('userRole') || 'buyer';
  const displayRoleName = role === 'farmer'
    ? (language === 'am' ? 'ገበሬ' : 'Farmer')
    : (language === 'am' ? 'ገዢ' : 'Buyer');
  const avatarNode = user?.avatarUrl ? (
    <img src={user?.avatarUrl} alt={user?.fullName || 'User'} className="object-cover w-full h-full" />
  ) : (
    <div className={`w-full h-full flex items-center justify-center ${role === 'farmer' ? 'bg-emerald-100' : 'bg-indigo-100'}`}>
      <Icon name={role === 'farmer' ? 'Sprout' : 'ShoppingCart'} size={16} className={`${role === 'farmer' ? 'text-emerald-700' : 'text-indigo-700'}`} />
    </div>
  );

  return (
    <div className="fixed top-0 left-0 right-0 z-40 border-b bg-surface border-border">
      <div className="h-14 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/app')}>
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Icon name="Sprout" size={18} color="white" />
          </div>
          <span className="text-sm font-semibold text-primary">Ke Geberew</span>
        </div>

        <div className="flex items-center space-x-3">
          <NotificationBell />
          {role === 'buyer' && (
            <Button variant="ghost" size="icon" onClick={() => navigate('/cart')} className="relative">
              <Icon name="ShoppingCart" size={18} />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 text-[10px] bg-primary text-white rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center">{totalItems}</span>
              )}
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={toggleLanguage} className="flex items-center space-x-2 text-text-secondary hover:text-primary">
            <Icon name="Globe" size={16} />
            <span className="font-medium">{language === 'en' ? 'EN' : 'አማ'}</span>
          </Button>

          <div className="relative">
            <button
              className="flex items-center space-x-2 pl-3 pr-2 py-1.5 rounded-lg border border-border hover:bg-accent"
              onClick={() => setIsUserMenuOpen((o) => !o)}
            >
              <div className="w-8 h-8 overflow-hidden rounded-full bg-muted">
                {avatarNode}
              </div>
              <span className="hidden sm:block text-sm text-text-primary">{displayRoleName}</span>
              <Icon name={isUserMenuOpen ? 'ChevronUp' : 'ChevronDown'} size={16} className="text-text-secondary" />
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-56 p-2 border rounded-lg bg-surface border-border shadow-warm">
                <Button variant="ghost" className="justify-start w-full px-3 py-2" onClick={() => { setIsUserMenuOpen(false); navigate('/user-profile-management'); }}>
                  <Icon name="Settings" size={16} className="mr-2" /> Settings
                </Button>
                <Button variant="ghost" className="justify-start w-full px-3 py-2" onClick={() => { setIsUserMenuOpen(false); navigate('/help'); }}>
                  <Icon name="HelpCircle" size={16} className="mr-2" /> Help & Support
                </Button>
                <div className="my-2 border-t border-border" />
                <Button variant="ghost" className="justify-start w-full px-3 py-2 text-error hover:text-error hover:bg-error/10" onClick={handleLogout}>
                  <Icon name="LogOut" size={16} className="mr-2" /> Sign Out
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthenticatedTopBar;


