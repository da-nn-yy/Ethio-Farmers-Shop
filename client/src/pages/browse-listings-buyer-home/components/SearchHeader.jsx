import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import CartIcon from '../../../components/ui/CartIcon';

const SearchHeader = ({
  searchQuery,
  onSearchChange,
  cartItemCount = 0,
  onCartClick,
  onFilterClick,
  currentLanguage = 'en'
}) => {
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const translations = {
    en: {
      searchPlaceholder: 'Search for produce, farmers, or locations...',
      cart: 'Cart',
      filters: 'Filters'
    },
    am: {
      searchPlaceholder: 'ምርቶችን፣ ገበሬዎችን ወይም አካባቢዎችን ይፈልጉ...',
      cart: 'ጋሪ',
      filters: 'ማጣሪያዎች'
    }
  };

  const t = translations?.[currentLanguage];

  return (
    <div className="sticky top-16 lg:top-18 z-30 bg-surface border-b border-border shadow-warm">
      <div className="px-4 py-3">
        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className={`
            flex-1 relative transition-smooth
            ${isSearchFocused ? 'ring-2 ring-primary/20' : ''}
          `}>
            <div className="relative">
              <Icon
                name="Search"
                size={18}
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
              />
              <input
                type="text"
                placeholder={t?.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => onSearchChange(e?.target?.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                className="w-full pl-10 pr-4 py-3 bg-muted border border-border rounded-lg text-sm placeholder:text-text-secondary focus:outline-none focus:bg-surface focus:border-primary transition-smooth"
              />

              {/* Clear Search */}
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-text-secondary hover:text-primary transition-smooth"
                >
                  <Icon name="X" size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Cart Icon */}
          <CartIcon
            currentLanguage={currentLanguage}
            size="sm"
          />

          {/* Filter Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={onFilterClick}
            className="flex items-center gap-2"
          >
            <Icon name="Filter" size={16} />
            <span className="hidden sm:inline">{t?.filters}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SearchHeader;
