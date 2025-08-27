import React, { useState, useRef, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SortDropdown = ({ 
  currentSort, 
  onSortChange, 
  currentLanguage = 'en' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const translations = {
    en: {
      sortBy: 'Sort by',
      options: {
        relevance: 'Relevance',
        priceLowHigh: 'Price: Low to High',
        priceHighLow: 'Price: High to Low',
        distance: 'Distance',
        rating: 'Farmer Rating',
        freshness: 'Freshness',
        newest: 'Newest First'
      }
    },
    am: {
      sortBy: 'ደርድር በ',
      options: {
        relevance: 'ተዛማጅነት',
        priceLowHigh: 'ዋጋ: ዝቅተኛ ወደ ከፍተኛ',
        priceHighLow: 'ዋጋ: ከፍተኛ ወደ ዝቅተኛ',
        distance: 'ርቀት',
        rating: 'የገበሬ ደረጃ',
        freshness: 'ትኩስነት',
        newest: 'አዲስ መጀመሪያ'
      }
    }
  };

  const t = translations?.[currentLanguage];

  const sortOptions = [
    { value: 'relevance', label: t?.options?.relevance, icon: 'Target' },
    { value: 'priceLowHigh', label: t?.options?.priceLowHigh, icon: 'TrendingUp' },
    { value: 'priceHighLow', label: t?.options?.priceHighLow, icon: 'TrendingDown' },
    { value: 'distance', label: t?.options?.distance, icon: 'MapPin' },
    { value: 'rating', label: t?.options?.rating, icon: 'Star' },
    { value: 'freshness', label: t?.options?.freshness, icon: 'Clock' },
    { value: 'newest', label: t?.options?.newest, icon: 'Calendar' }
  ];

  const currentOption = sortOptions?.find(option => option?.value === currentSort);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef?.current && !dropdownRef?.current?.contains(event?.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSortSelect = (sortValue) => {
    onSortChange(sortValue);
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 min-w-0"
      >
        <Icon name="ArrowUpDown" size={16} />
        <span className="hidden sm:inline text-sm">
          {t?.sortBy}: {currentOption?.label}
        </span>
        <span className="sm:hidden text-sm">
          {t?.sortBy}
        </span>
        <Icon 
          name="ChevronDown" 
          size={16} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </Button>
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full right-0 mt-2 w-64 bg-surface border border-border rounded-lg shadow-warm-lg z-50 overflow-hidden">
          <div className="py-2">
            {sortOptions?.map((option) => (
              <button
                key={option?.value}
                onClick={() => handleSortSelect(option?.value)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left transition-smooth
                  ${currentSort === option?.value 
                    ? 'bg-primary/10 text-primary' :'text-text-primary hover:bg-muted'
                  }
                `}
              >
                <Icon 
                  name={option?.icon} 
                  size={16} 
                  className={currentSort === option?.value ? 'text-primary' : 'text-text-secondary'}
                />
                <span className="text-sm font-medium">
                  {option?.label}
                </span>
                {currentSort === option?.value && (
                  <Icon name="Check" size={16} className="ml-auto text-primary" />
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SortDropdown;