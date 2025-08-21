import React from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

const Navbar = () => {
  return (
    <header className="border-b bg-[#f1f5f9]/50 backdrop-blur-sm sticky top-0 z-50 rounded-md">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#006C36] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">EF</span>
            </div>
            <h1 className="font-serif font-bold text-xl text-black">Ethio Farmers</h1>
          </div>
          <nav className="hidden md:flex items-center gap-6">
            <a href="/marketplace" className="text-[#B5B5B5
] hover:text-[black] transition-colors">
              hi
            </a>
            <a href="/trends" className="text-[#B5B5B5
] hover:text-black transition-colors">
              by
            </a>
            {/*<LanguageSwitcher />*/}
            <AuthButtons />
          </nav>
        </div>
      </div>
    </header>
  )
}
const AuthButtons = () => {
  const { user, logout } = useAuth();
  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user.displayName || user.email}</span>
        <button onClick={logout} className="border px-3 py-1 rounded">Logout</button>
      </div>
    );
  }
  return (
    <div className="flex items-center gap-3">
      <Link to="/login" className="border px-3 py-1 rounded">Login</Link>
      <Link to="/signup" className="bg-black text-white px-3 py-1 rounded">Sign up</Link>
    </div>
  );
}
export default Navbar;