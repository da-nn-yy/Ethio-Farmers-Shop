import React from 'react'

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
            {/*{user ? (*/}
            {/*  // <UserMenu />*/}
            {/*) : (*/}
              <>
                <button >
                  loginn
                </button>
                <button className={""}>
                  login
                </button>
              </>
            {/*)}*/}
          </nav>
        </div>
      </div>
    </header>
  )
}
export default Navbar;
