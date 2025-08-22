import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContexts";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const { currentUser, logout } = useAuth();

  return (
    <>
      <header className="border-b bg-[#f1f5f9]/50 backdrop-blur-sm sticky top-0 z-50 rounded-md">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#006C36] rounded-lg flex items-center justify-center">
              <a href="/">
                <span className="text-white font-bold text-sm">EF</span>
              </a>
            </div>
            <a href="/" className="font-serif font-bold text-xl text-black uppercase">
              <h1>Ethio Farmers</h1>
            </a>
          </div>

          <nav className="flex items-center gap-4">
            {currentUser ? (
              <>
                <span className="font-medium text-gray-700">Hello, {currentUser.displayName || currentUser.email}</span>
                <button
                  onClick={logout}
                  className="px-4 py-2 rounded-md bg-red-600 text-white font-medium"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-4 py-2 rounded-md bg-[#006C36] text-white font-medium"
                >
                  Login
                </button>
                <button
                  onClick={() => setIsAuthOpen(true)}
                  className="px-4 py-2 rounded-md border border-[#006C36] text-[#006C36] font-medium hover:bg-[#006C36]/10"
                >
                  Signup
                </button>
              </>
            )}
          </nav>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
};

export default Navbar;
