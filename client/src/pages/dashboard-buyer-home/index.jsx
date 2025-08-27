import React, { useEffect, useState } from 'react';
import GlobalHeader from '../../components/ui/GlobalHeader';

const BuyerDashboard = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
  const userRole = localStorage.getItem('userRole') || 'buyer';

  useEffect(() => {
    const savedLanguage = localStorage.getItem('currentLanguage') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader
        isAuthenticated={isAuthenticated}
        userRole={userRole}
        currentLanguage={currentLanguage}
        onLanguageChange={setCurrentLanguage}
      />
      <main className="pt-20 px-4 max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Buyer Dashboard</h1>
        <p className="text-text-secondary">Welcome! Start browsing fresh listings tailored for buyers.</p>
      </main>
    </div>
  );
};

export default BuyerDashboard;
