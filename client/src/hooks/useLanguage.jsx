import React, { createContext, useContext, useEffect, useState } from 'react';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    const saved = localStorage.getItem('farmconnect_language');
    if (saved === 'en' || saved === 'am') setLanguage(saved);
  }, []);

  useEffect(() => {
    try { localStorage.setItem('farmconnect_language', language); } catch {}
  }, [language]);

  const toggle = () => setLanguage(prev => (prev === 'en' ? 'am' : 'en'));

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggle }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};


