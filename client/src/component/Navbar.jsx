import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContexts";
import { ShoppingCart, Menu, X } from "lucide-react";
import { ordersAPI } from "../services/api";
import AuthModal from "./AuthModal";
import ShoppingCartModal from "../components/ShoppingCart";

const Navbar = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartItemCount, setCartItemCount] = useState(0);
  const { currentUser, logout } = useAuth();

  // Load cart item count when user changes
  useEffect(() => {
    if (currentUser) {
      loadCartCount();
    } else {
      setCartItemCount(0);
    }
  }, [currentUser]);

  const loadCartCount = async () => {
    try {
      const response = await ordersAPI.getCart();
      setCartItemCount(response.data.summary?.totalItems || 0);
    } catch (error) {
      console.error('Error loading cart count:', error);
      setCartItemCount(0);
    }
  };

  const openAuthModal = (mode) => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  return (
    <>
      <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#006C36] rounded-lg flex items-center justify-center">
                <a href="/">
                  <span className="text-white font-bold text-sm">EF</span>
                </a>
              </div>
              <h1 className="font-serif font-bold text-xl text-gray-900">Ethio Farmers</h1>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <a href="/marketplace" className="text-gray-600 hover:text-gray-900 transition-colors">
                Marketplace
              </a>
              <a href="/trends" className="text-gray-600 hover:text-gray-900 transition-colors">
                Market Trends
              </a>

              {currentUser ? (
                <div className="flex items-center gap-4">
                  {/* Shopping Cart */}
                  <button
                    onClick={() => setIsCartOpen(true)}
                    className="relative p-2 text-gray-600 hover:text-[#006C36] transition-colors"
                  >
                    <ShoppingCart className="h-5 w-5" />
                    {cartItemCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-[#006C36] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {cartItemCount > 99 ? '99+' : cartItemCount}
                      </span>
                    )}
                  </button>

                  {/* User Menu */}
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <img
                        src={currentUser.photoURL || "https://ui-avatars.com/api/?background=006C36&color=fff&name=" + encodeURIComponent(currentUser.displayName || currentUser.email)}
                        alt="Avatar"
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-[#006C36] ring-offset-2 ring-offset-white shadow"
                      />
                    </div>
                    <span className="max-w-[120px] truncate text-sm font-medium text-gray-700">
                      {currentUser.displayName || currentUser.email}
                    </span>
                    <button
                      onClick={logout}
                      className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-medium shadow hover:bg-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openAuthModal("login")}
                    className="px-4 py-2 rounded-md border border-[#006C36] text-[#006C36] font-medium hover:bg-[#006C36]/10 transition-colors"
                  >
                    Sign in
                  </button>
                  <button
                    onClick={() => openAuthModal("signup")}
                    className="px-4 py-2 rounded-md bg-[#006C36] text-white font-medium shadow hover:bg-[#006C36]/90 transition-colors"
                  >
                    Sign up
                  </button>
                </div>
              )}
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-600 hover:text-gray-900"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t border-gray-200">
              <div className="flex flex-col gap-4 pt-4">
                <a
                  href="/marketplace"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Marketplace
                </a>
                <a
                  href="/trends"
                  className="text-gray-600 hover:text-gray-900 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Market Trends
                </a>

                {currentUser ? (
                  <div className="flex flex-col gap-3">
                    {/* Shopping Cart */}
                    <button
                      onClick={() => {
                        setIsCartOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-2 text-gray-600 hover:text-[#006C36] transition-colors"
                    >
                      <ShoppingCart className="h-5 w-5" />
                      <span>Shopping Cart</span>
                      {cartItemCount > 0 && (
                        <span className="bg-[#006C36] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {cartItemCount > 99 ? '99+' : cartItemCount}
                        </span>
                      )}
                    </button>

                    {/* User Info */}
                    <div className="flex items-center gap-3 py-2">
                      <img
                        src={currentUser.photoURL || "https://ui-avatars.com/api/?background=006C36&color=fff&name=" + encodeURIComponent(currentUser.displayName || currentUser.email)}
                        alt="Avatar"
                        className="h-8 w-8 rounded-full object-cover ring-2 ring-[#006C36] ring-offset-2 ring-offset-white shadow"
                      />
                      <span className="text-sm font-medium text-gray-700">
                        {currentUser.displayName || currentUser.email}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="px-4 py-2 rounded-md bg-red-600 text-white text-sm font-medium shadow hover:bg-red-700 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => {
                        openAuthModal("login");
                        setIsMobileMenuOpen(false);
                      }}
                      className="px-4 py-2 rounded-md border border-[#006C36] text-[#006C36] font-medium hover:bg-[#006C36]/10 transition-colors"
                    >
                      Sign in
                    </button>
                    <button
                      onClick={() => {
                        openAuthModal("signup");
                        setIsMobileMenuOpen(false);
                      }}
                      className="px-4 py-2 rounded-md bg-[#006C36] text-white font-medium shadow hover:bg-[#006C36]/90 transition-colors"
                    >
                      Sign up
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialMode={authMode} />
      <ShoppingCartModal isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </>
  );
};

export default Navbar;
