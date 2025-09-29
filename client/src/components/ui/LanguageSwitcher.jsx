import React from 'react';
import { useLanguage } from '../../hooks/useLanguage.jsx';
import Button from './Button';

const LanguageSwitcher = () => {
  const { language, toggle } = useLanguage();

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={toggle}
      className="flex items-center gap-2 min-h-[44px] px-3"
    >
      <span className="text-sm font-medium">
        {language === 'en' ? 'አማርኛ' : 'English'}
      </span>
    </Button>
  );
};

export { LanguageSwitcher };
