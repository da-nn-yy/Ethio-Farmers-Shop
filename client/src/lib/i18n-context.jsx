import React, { createContext, useContext } from 'react';
import { useLanguage } from '../hooks/useLanguage.jsx';

const translations = {
  en: {
    common: {
      loading: 'Loading...',
      view: 'View All',
    },
    nav: {
      marketplace: 'Marketplace',
      trends: 'Market Trends',
      login: 'Sign In',
      signup: 'Sign Up',
    },
    home: {
      hero: {
        title: 'Connect Farmers and Buyers Across Ethiopia',
        subtitle: 'Transparent prices, trusted profiles, and direct marketplace access for sustainable agriculture.',
        cta: {
          marketplace: 'Browse Marketplace',
          farmer: 'Start Selling',
        },
      },
      featured: {
        title: 'Featured Products',
      },
    },
    farmer: {
      dashboard: {
        welcome: 'Welcome back',
      },
      listings: {
        create: 'Create Listing',
        title: 'My Listings',
      },
    },
    buyer: {
      orders: {
        title: 'My Orders',
      },
    },
    marketplace: {
      search: 'Search for fresh produce...',
    },
  },
  am: {
    common: {
      loading: 'በመጫን ላይ...',
      view: 'ሁሉንም ይመልከቱ',
    },
    nav: {
      marketplace: 'ገበያ',
      trends: 'የገበያ አዝማሚያ',
      login: 'ግባ',
      signup: 'ተመዝግብ',
    },
    home: {
      hero: {
        title: 'ገበሬዎችን እና ገዢዎችን በኢትዮጵያ ውስጥ ያገናኙ',
        subtitle: 'ግልጽ ዋጋዎች፣ የሚታመኑ መገለጫዎች እና ቀጥታ ገበያ መዳረሻ ለተገናኘ ግብርና።',
        cta: {
          marketplace: 'ገበያ ይፈልጉ',
          farmer: 'መሸጫ ይጀምሩ',
        },
      },
      featured: {
        title: 'የተመረጡ ምርቶች',
      },
    },
    farmer: {
      dashboard: {
        welcome: 'እንኳን ደህና መጡ',
      },
      listings: {
        create: 'ምርት ይጨምሩ',
        title: 'የእኔ ምርቶች',
      },
    },
    buyer: {
      orders: {
        title: 'የእኔ ትዕዛዞች',
      },
    },
    marketplace: {
      search: 'አዳዲስ ምርቶችን ይፈልጉ...',
    },
  },
};

const I18nContext = createContext();

export const I18nProvider = ({ children }) => {
  const { language } = useLanguage();

  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  return (
    <I18nContext.Provider value={{ t, language }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useI18n = () => {
  const context = useContext(I18nContext);
  if (!context) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
};






