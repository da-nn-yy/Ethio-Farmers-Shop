import React from 'react';
import Button from '../../../components/ui/Button';


const LanguageToggle = ({ currentLanguage, onLanguageChange }) => {
  const languages = {
    en: { label: 'EN', fullName: 'English' },
    am: { label: 'አማ', fullName: 'አማርኛ' }
  };

  const handleToggle = () => {
    const newLanguage = currentLanguage === 'en' ? 'am' : 'en';
    onLanguageChange(newLanguage);
  };

  return (
    <div className="flex items-center justify-center mb-6">
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        iconName="Globe"
        iconPosition="left"
        className="px-4 py-2"
      >
        {languages?.[currentLanguage]?.label}
      </Button>
    </div>
  );
};

export default LanguageToggle;