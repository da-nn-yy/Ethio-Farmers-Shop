import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const FilterChips = ({ 
  activeFilters = [], 
  onRemoveFilter, 
  onClearAll,
  currentLanguage = 'en' 
}) => {
  const translations = {
    en: {
      clearAll: 'Clear All',
      filters: 'filters active'
    },
    am: {
      clearAll: 'ሁሉንም አጽዳ',
      filters: 'ማጣሪያዎች ንቁ'
    }
  };

  const t = translations?.[currentLanguage];

  if (activeFilters?.length === 0) return null;

  return (
    <div className="flex items-center gap-2 px-4 py-3 bg-surface border-b border-border overflow-x-auto">
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className="text-sm text-text-secondary whitespace-nowrap">
          {activeFilters?.length} {t?.filters}
        </span>
        
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {activeFilters?.map((filter, index) => (
            <div
              key={index}
              className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary rounded-full text-sm whitespace-nowrap border border-primary/20"
            >
              <span>{filter?.label}</span>
              <button
                onClick={() => onRemoveFilter(filter)}
                className="ml-1 hover:bg-primary/20 rounded-full p-0.5 transition-smooth"
              >
                <Icon name="X" size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={onClearAll}
        className="text-text-secondary hover:text-primary whitespace-nowrap"
      >
        {t?.clearAll}
      </Button>
    </div>
  );
};

export default FilterChips;