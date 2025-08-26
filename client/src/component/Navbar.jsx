import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContexts";
import AuthModal from "./AuthModal";

const Navbar = () => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState("login");
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
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <img
                      src={currentUser.photoURL || "https://ui-avatars.com/api/?background=006C36&color=fff&name=" + encodeURIComponent(currentUser.displayName || currentUser.email)}
                      alt="Avatar"
                      className="h-9 w-9 rounded-full object-cover ring-2 ring-[#006C36] ring-offset-2 ring-offset-white shadow"
                    />
                  </div>
                  <span className="max-w-[120px] truncate hidden sm:block text-sm font-medium text-gray-700">
                    {currentUser.displayName || currentUser.email}
                  </span>
                </div>
                <button
                  onClick={logout}
                  className="px-3 py-2 rounded-md bg-red-700 text-white text-sm font-medium shadow hover:bg-red-600/90"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setAuthMode("login"); setIsAuthOpen(true); }}
                  className="px-4 py-2 rounded-md bg-[#006C36] text-white font-medium shadow hover:bg-[#006C36]/90"
                >
                  Sign in
                </button>
                <button
                  onClick={() => { setAuthMode("signup"); setIsAuthOpen(true); }}
                  className="px-4 py-2 rounded-md border border-[#006C36] text-[#006C36] font-medium hover:bg-[#006C36]/10"
                >
                  Sign up
                </button>
              </div>
            )}
          </nav>
        </div>
      </header>

      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} initialMode={authMode} />
    </>
  );
};

export default Navbar;
