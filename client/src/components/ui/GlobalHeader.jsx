import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase"; // Your Firebase config
import axios from "axios";
import Button from "./Button";
import Icon from "../AppIcon";
import NotificationBell from "../NotificationBell";

const GlobalHeader = ({ isAuthenticated = false, onLanguageChange, currentLanguage = "en" }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  // Fetch user data from Firebase and backend
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) {
          setUser(null);
          return;
        }

        const idToken = await currentUser.getIdToken();
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
        const API_URL = API_BASE.endsWith('/api') ? API_BASE : `${API_BASE}/api`;

        const res = await axios.get(`${API_URL}/users/me`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        setUser(res.data); // Expect API returns { name, avatar, role }
      } catch (err) {
        console.error("Failed to fetch user:", err);
        setUser(null);
      }
    };

    if (isAuthenticated) {
      fetchUser();
    } else {
      setUser(null);
    }
  }, [isAuthenticated]);

  // Cart badge updater
  useEffect(() => {
    const readCartCount = () => {
      try {
        const saved = localStorage.getItem('buyer_cart');
        const items = saved ? JSON.parse(saved) : [];
        if (Array.isArray(items)) {
          const count = items.reduce((sum, it) => sum + (Number(it?.quantity) || 0), 0);
          setCartCount(count);
        } else {
          setCartCount(0);
        }
      } catch {
        setCartCount(0);
      }
    };

    readCartCount();
    const onStorage = (e) => {
      if (e.key === 'buyer_cart') readCartCount();
    };
    const onFocus = () => readCartCount();
    const onCustom = () => readCartCount();
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', onFocus);
    window.addEventListener('buyer_cart_updated', onCustom);
    return () => {
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('buyer_cart_updated', onCustom);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (_) {}
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("userRole");
    setIsMobileMenuOpen(false);
    setIsUserMenuOpen(false);
    setUser(null);
    navigate("/authentication-login-register");
  };

  const handleLanguageToggle = () => {
    const newLang = currentLanguage === "en" ? "am" : "en";
    if (onLanguageChange) onLanguageChange(newLang);
  };

  const languages = {
    en: { label: "EN", fullName: "English" },
    am: { label: "አማ", fullName: "አማርኛ" },
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-surface border-border shadow-warm">
      <div className="flex items-center justify-between h-16 px-4 lg:h-18 lg:px-6">
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

        {/* Desktop */}
        <div className="items-center hidden space-x-6 lg:flex">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleLanguageToggle}
            className="flex items-center space-x-2 text-text-secondary hover:text-primary"
          >
            <Icon name="Globe" size={16} />
            <span className="font-medium">{languages?.[currentLanguage]?.label}</span>
          </Button>

          {user ? (
            <div className="relative flex items-center space-x-4">
              {/* Cart Button */}
              <Button
                variant="ghost"
                size="icon"
                className="relative text-text-secondary hover:text-primary"
                onClick={() => {
                  try {
                    navigate('/browse-listings-buyer-home#cart');
                    window.dispatchEvent(new Event('open_buyer_cart'));
                  } catch {
                    navigate('/browse-listings-buyer-home#cart');
                  }
                }}
              >
                <Icon name="ShoppingCart" size={20} />
                {cartCount > 0 && (
                  <span className="absolute flex items-center justify-center w-5 h-5 text-xs font-medium rounded-full -top-1 -right-1 bg-primary text-white">
                    {cartCount}
                  </span>
                )}
              </Button>
              <NotificationBell />

              {/* User Menu */}
              <div className="flex items-center pl-4 space-x-3 border-l cursor-pointer border-border" onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}>
                <div className="w-8 h-8 overflow-hidden rounded-full bg-muted">
                  <img src={user.avatarUrl || "/assets/images/no_image.png"} alt={user.fullName || "User"} className="object-cover w-full h-full" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-text-primary">{user.fullName}</span>
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
        <div className="fixed inset-0 z-40 border-t lg:hidden top-16 bg-surface border-border">
          <div className="flex flex-col p-4 space-y-4">
            {user ? (
              <>
                <div className="flex items-center p-4 space-x-3 rounded-lg bg-muted">
                  <div className="w-12 h-12 overflow-hidden rounded-full bg-primary/10">
                    <img src={user.avatarUrl || "/assets/images/no_image.png"} alt={user.fullName || "User"} className="object-cover w-full h-full" />
                  </div>
                  <div className="flex flex-col">
                    <span className="font-medium text-text-primary">{user.fullName}</span>
                    <span className="text-sm capitalize text-text-secondary">{user.role}</span>
                  </div>
                </div>

                <Button variant="ghost" className="justify-start h-auto p-4" onClick={() => { setIsMobileMenuOpen(false); navigate('/browse-listings-buyer-home#cart'); }}>
                  <Icon name="ShoppingCart" size={20} className="mr-3" /> Cart {cartCount > 0 ? `(${cartCount})` : ''}
                </Button>

                <Button variant="ghost" className="justify-start h-auto p-4" onClick={() => { setIsMobileMenuOpen(false); navigate('/notifications'); }}>
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
