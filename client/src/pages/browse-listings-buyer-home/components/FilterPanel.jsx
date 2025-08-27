import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterPanel = ({ 
  isOpen, 
  onClose, 
  filters, 
  onApplyFilters,
  currentLanguage = 'en' 
}) => {
  const [localFilters, setLocalFilters] = useState(filters);

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

  const produceTypes = Object.entries(t?.produces)?.map(([key, label]) => ({
    id: key,
    label,
    checked: localFilters?.produceTypes?.includes(key)
  }));

  const regions = Object.entries(t?.regions)?.map(([key, label]) => ({
    id: key,
    label,
    checked: localFilters?.regions?.includes(key)
  }));

  const handleProduceTypeChange = (produceId, checked) => {
    setLocalFilters(prev => ({
      ...prev,
      produceTypes: checked 
        ? [...prev?.produceTypes, produceId]
        : prev?.produceTypes?.filter(id => id !== produceId)
    }));
  };

  const handleRegionChange = (regionId, checked) => {
    setLocalFilters(prev => ({
      ...prev,
      regions: checked 
        ? [...prev?.regions, regionId]
        : prev?.regions?.filter(id => id !== regionId)
    }));
  };

  const handlePriceChange = (field, value) => {
    setLocalFilters(prev => ({
      ...prev,
      priceRange: {
        ...prev?.priceRange,
        [field]: value
      }
    }));
  };

  const handleVerificationChange = (checked) => {
    setLocalFilters(prev => ({
      ...prev,
      verifiedOnly: checked
    }));
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
    onApplyFilters(localFilters);
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
        shadow-warm-lg lg:shadow-none rounded-l-lg lg:rounded-lg
        z-50 lg:z-auto overflow-y-auto
        ${isOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        transition-transform lg:transition-none
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

        <div className="p-4 space-y-6">
          {/* Desktop Header */}
          <div className="hidden lg:flex items-center justify-between">
            <h2 className="font-heading font-semibold text-lg text-text-primary">
              {t?.filters}
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClearAll}
              className="text-text-secondary hover:text-primary"
            >
              {t?.clearAll}
            </Button>
          </div>

          {/* Produce Type */}
          <div className="space-y-3">
            <h3 className="font-medium text-text-primary">
              {t?.produceType}
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {produceTypes?.map((produce) => (
                <Checkbox
                  key={produce?.id}
                  label={produce?.label}
                  checked={produce?.checked}
                  onChange={(e) => handleProduceTypeChange(produce?.id, e?.target?.checked)}
                  size="sm"
                />
              ))}
            </div>
          </div>

          {/* Location */}
          <div className="space-y-3">
            <h3 className="font-medium text-text-primary">
              {t?.location}
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {regions?.map((region) => (
                <Checkbox
                  key={region?.id}
                  label={region?.label}
                  checked={region?.checked}
                  onChange={(e) => handleRegionChange(region?.id, e?.target?.checked)}
                  size="sm"
                />
              ))}
            </div>
          </div>

          {/* Price Range */}
          <div className="space-y-3">
            <h3 className="font-medium text-text-primary">
              {t?.priceRange}
            </h3>
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
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
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
                  className="w-full px-3 py-2 border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                />
              </div>
            </div>
          </div>

          {/* Verification */}
          <div className="space-y-3">
            <h3 className="font-medium text-text-primary">
              {t?.verification}
            </h3>
            <Checkbox
              label={t?.verified}
              checked={localFilters?.verifiedOnly}
              onChange={(e) => handleVerificationChange(e?.target?.checked)}
              size="sm"
            />
          </div>
        </div>

        {/* Mobile Footer */}
        <div className="lg:hidden sticky bottom-0 p-4 bg-surface border-t border-border">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleClearAll}
              className="flex-1"
            >
              {t?.clearAll}
            </Button>
            <Button
              variant="default"
              onClick={handleApply}
              className="flex-1"
            >
              {t?.apply}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default FilterPanel;