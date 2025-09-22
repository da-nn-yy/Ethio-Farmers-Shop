import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterPanel = ({
  isOpen,
  onClose,
  filters,
  onApplyFilters,
  currentLanguage = 'en',
  selectedCategory = 'all',
  selectedRegion = 'all',
  currentSort = 'relevance',
  categoryOptions = [],
  regionOptions = []
}) => {
  const [localFilters, setLocalFilters] = useState(filters);
  const [localCategory, setLocalCategory] = useState(selectedCategory);
  const [localRegion, setLocalRegion] = useState(selectedRegion);
  const [localSort, setLocalSort] = useState(currentSort);

  const translations = {
    en: {
      filters: 'Filters',
      clearAll: 'Clear All',
      apply: 'Apply Filters',
      produceType: 'Produce Type',
      location: 'Location',
      priceRange: 'Price Range (ETB)',
      verification: 'Farmer Verification',
      verified: 'Verified Farmers Only',
      minPrice: 'Min Price',
      maxPrice: 'Max Price',
      regions: {
        addisAbaba: 'Addis Ababa',
        oromia: 'Oromia',
        amhara: 'Amhara',
        tigray: 'Tigray',
        snnp: 'SNNP',
        somali: 'Somali',
        afar: 'Afar',
        benishangul: 'Benishangul-Gumuz',
        gambela: 'Gambela',
        harari: 'Harari',
        direDawa: 'Dire Dawa'
      },
      produces: {
        teff: 'Teff',
        wheat: 'Wheat',
        barley: 'Barley',
        maize: 'Maize',
        sorghum: 'Sorghum',
        coffee: 'Coffee',
        sesame: 'Sesame',
        beans: 'Beans',
        chickpeas: 'Chickpeas',
        lentils: 'Lentils'
      }
    },
    am: {
      filters: 'ማጣሪያዎች',
      clearAll: 'ሁሉንም አጽዳ',
      apply: 'ማጣሪያዎችን ተግብር',
      produceType: 'የምርት አይነት',
      location: 'አካባቢ',
      priceRange: 'የዋጋ ክልል (ብር)',
      verification: 'የገበሬ ማረጋገጫ',
      verified: 'የተረጋገጡ ገበሬዎች ብቻ',
      minPrice: 'ዝቅተኛ ዋጋ',
      maxPrice: 'ከፍተኛ ዋጋ',
      regions: {
        addisAbaba: 'አዲስ አበባ',
        oromia: 'ኦሮሚያ',
        amhara: 'አማራ',
        tigray: 'ትግራይ',
        snnp: 'ደቡብ ብሔሮች',
        somali: 'ሶማሊ',
        afar: 'አፋር',
        benishangul: 'ቤንሻንጉል ጉሙዝ',
        gambela: 'ጋምቤላ',
        harari: 'ሐረሪ',
        direDawa: 'ድሬዳዋ'
      },
      produces: {
        teff: 'ጤፍ',
        wheat: 'ስንዴ',
        barley: 'ገብስ',
        maize: 'በቆሎ',
        sorghum: 'ማሽላ',
        coffee: 'ቡና',
        sesame: 'ሰሊጥ',
        beans: 'ባቄላ',
        chickpeas: 'ሽምብራ',
        lentils: 'ምስር'
      }
    }
  };

  const t = translations?.[currentLanguage];

  const builtCategoryOptions = categoryOptions?.length > 0
    ? categoryOptions
    : [{ id: 'all', label: currentLanguage === 'am' ? 'ሁሉም' : 'All' }];

  const builtRegionOptions = regionOptions?.length > 0
    ? regionOptions
    : [{ id: 'all', label: currentLanguage === 'am' ? 'ሁሉም' : 'All' }];

  const sortOptions = [
    { id: 'relevance', label: currentLanguage === 'am' ? 'ተዛማጅነት' : 'Relevance' },
    { id: 'newest', label: currentLanguage === 'am' ? 'አዲስ' : 'Newest' },
    { id: 'priceLowHigh', label: currentLanguage === 'am' ? 'ዋጋ: ዝቅ ወደ ከፍ' : 'Price: Low → High' },
    { id: 'priceHighLow', label: currentLanguage === 'am' ? 'ዋጋ: ከፍ ወደ ዝቅ' : 'Price: High → Low' },
    { id: 'rating', label: currentLanguage === 'am' ? 'ደረጃ' : 'Rating' },
    { id: 'freshness', label: currentLanguage === 'am' ? ' تازነት' : 'Freshness' }
  ];

  // Single-select handlers
  const handleCategoryChange = (value) => {
    setLocalCategory(value);
    const mapped = {
      ...localFilters,
      produceTypes: value && value !== 'all' ? [value] : [],
      regions: localRegion && localRegion !== 'all' ? [localRegion] : [],
      sort: localSort
    };
    onApplyFilters(mapped);
  };

  const handleRegionChange = (value) => {
    setLocalRegion(value);
    const mapped = {
      ...localFilters,
      produceTypes: localCategory && localCategory !== 'all' ? [localCategory] : [],
      regions: value && value !== 'all' ? [value] : [],
      sort: localSort
    };
    onApplyFilters(mapped);
  };

  const handlePriceChange = (field, value) => {
    setLocalFilters(prev => {
      const updated = {
        ...prev,
        priceRange: {
          ...prev?.priceRange,
          [field]: value
        }
      };
      const mapped = {
        ...updated,
        produceTypes: localCategory && localCategory !== 'all' ? [localCategory] : [],
        regions: localRegion && localRegion !== 'all' ? [localRegion] : [],
        sort: localSort
      };
      onApplyFilters(mapped);
      return updated;
    });
  };

  const handleVerificationChange = (checked) => {
    setLocalFilters(prev => {
      const updated = { ...prev, verifiedOnly: checked };
      const mapped = {
        ...updated,
        produceTypes: localCategory && localCategory !== 'all' ? [localCategory] : [],
        regions: localRegion && localRegion !== 'all' ? [localRegion] : [],
        sort: localSort
      };
      onApplyFilters(mapped);
      return updated;
    });
  };

  const handleClearAll = () => {
    setLocalFilters({
      produceTypes: [],
      regions: [],
      priceRange: { min: '', max: '' },
      verifiedOnly: false
    });
  };

  const handleApply = () => {
    // Map single-selects into expected filter structure for parent
    const mapped = {
      ...localFilters,
      produceTypes: localCategory && localCategory !== 'all' ? [localCategory] : [],
      regions: localRegion && localRegion !== 'all' ? [localRegion] : [],
      sort: localSort
    };
    onApplyFilters(mapped);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Overlay */}
      <div className="lg:hidden fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      {/* Filter Panel */}
      <div className={`
        fixed lg:static inset-y-0 right-0 lg:right-auto
        w-80 max-w-[85vw] lg:w-full lg:max-w-none
        bg-surface border-l lg:border-l-0 lg:border border-border
        shadow-warm-lg lg:shadow-md rounded-l-lg lg:rounded-2xl lg:bg-white/90 lg:backdrop-blur lg:ring-1 lg:ring-emerald-50
        z-50 lg:z-auto overflow-y-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        transition-transform lg:transition-none lg:sticky lg:top-14
      `}>
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border lg:hidden">
          <h2 className="font-heading font-semibold text-lg text-text-primary">
            {t?.filters}
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-text-secondary"
          >
            <Icon name="X" size={20} />
          </Button>
        </div>

        <div className="p-4 lg:p-3 space-y-6 lg:space-y-0 lg:flex lg:flex-wrap lg:items-center lg:gap-3">
          {/* Desktop Header (hidden in compact bar) */}
          <div className="hidden">
            <h2 className="font-heading font-semibold text-lg text-text-primary">
              {t?.filters}
            </h2>
          </div>

          {/* Category (single-select) */}
          <div className="space-y-3 lg:space-y-1 lg:w-64">
            <label className="hidden lg:flex items-center text-xs font-medium text-text-secondary gap-1">
              <Icon name="Tag" size={14} /> {t?.produceType}
            </label>
            <div className="relative">
            <select
              value={localCategory}
              onChange={(e) => handleCategoryChange(e?.target?.value)}
              className="w-full h-10 pl-9 pr-4 border border-border rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {builtCategoryOptions?.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <Icon name="Tag" size={16} className="text-text-secondary" />
            </div>
            </div>
          </div>

          {/* Region (single-select) */}
          <div className="space-y-3 lg:space-y-1 lg:w-64">
            <label className="hidden lg:flex items-center text-xs font-medium text-text-secondary gap-1">
              <Icon name="MapPin" size={14} /> {t?.location}
            </label>
            <div className="relative">
            <select
              value={localRegion}
              onChange={(e) => handleRegionChange(e?.target?.value)}
              className="w-full h-10 pl-9 pr-4 border border-border rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {builtRegionOptions?.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
              <Icon name="MapPin" size={16} className="text-text-secondary" />
            </div>
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3 lg:space-y-1 lg:w-72">
            <label className="hidden lg:flex items-center text-xs font-medium text-text-secondary gap-1">
              <Icon name="DollarSign" size={14} /> {t?.priceRange}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  {t?.minPrice}
                </label>
                <input
                  type="number"
                  placeholder="0"
                  value={localFilters?.priceRange?.min}
                  onChange={(e) => handlePriceChange('min', e?.target?.value)}
                  className="w-full h-10 px-4 border border-border rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1">
                  {t?.maxPrice}
                </label>
                <input
                  type="number"
                  placeholder="1000"
                  value={localFilters?.priceRange?.max}
                  onChange={(e) => handlePriceChange('max', e?.target?.value)}
                  className="w-full h-10 px-4 border border-border rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Sort */}
          <div className="space-y-3 lg:space-y-1 lg:w-56">
            <label className="hidden lg:flex items-center text-xs font-medium text-text-secondary gap-1">
              <Icon name="ArrowUpDown" size={14} /> Sort
            </label>
            <select
              value={localSort}
              onChange={(e) => setLocalSort(e?.target?.value)}
              className="w-full h-10 px-4 border border-border rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
            >
              {sortOptions?.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Verification */}
          <div className="space-y-3 lg:space-y-1 lg:w-auto lg:flex lg:items-center lg:h-[58px] lg:pl-2">
            <label className="hidden lg:flex items-center text-xs font-medium text-text-secondary gap-1 mr-2">
              <Icon name="ShieldCheck" size={14} /> {t?.verification}
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary">{t?.verified}</span>
              <button
                onClick={() => handleVerificationChange(!localFilters?.verifiedOnly)}
                className={`w-10 h-6 rounded-full transition-colors ${localFilters?.verifiedOnly ? 'bg-emerald-500' : 'bg-gray-300'}`}
                aria-label="Toggle verified"
              >
                <span className={`block w-5 h-5 bg-white rounded-full transform transition-transform ${localFilters?.verifiedOnly ? 'translate-x-5' : 'translate-x-1'}`} />
              </button>
            </div>
          </div>

          {/* Clear All (compact) */}
          <div className="hidden lg:block lg:ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-text-secondary hover:text-primary"
            >
              {t?.clearAll}
            </Button>
          </div>
        </div>

        {/* Mobile Footer removed for instant apply */}
      </div>
    </>
  );
};

export default FilterPanel;
