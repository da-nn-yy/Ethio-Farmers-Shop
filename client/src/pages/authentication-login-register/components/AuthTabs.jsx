import React from 'react';

const AuthTabs = ({ activeTab, onTabChange, currentLanguage }) => {
  const tabs = [
    { id: 'login', label: 'Sign In', labelAm: 'ግባ' },
    { id: 'register', label: 'Register', labelAm: 'ተመዝገብ' }
  ];

  const getLabel = (tab) => {
    return currentLanguage === 'am' && tab?.labelAm ? tab?.labelAm : tab?.label;
  };

  return (
    <div className="flex bg-muted rounded-lg p-1 mb-8">
      {tabs?.map((tab) => (
        <button
          key={tab?.id}
          onClick={() => onTabChange(tab?.id)}
          className={`
            flex-1 py-3 px-4 text-sm font-medium rounded-md transition-smooth
            ${activeTab === tab?.id
              ? 'bg-surface text-primary shadow-warm'
              : 'text-text-secondary hover:text-primary'
            }
          `}
        >
          {getLabel(tab)}
        </button>
      ))}
    </div>
  );
};

export default AuthTabs;