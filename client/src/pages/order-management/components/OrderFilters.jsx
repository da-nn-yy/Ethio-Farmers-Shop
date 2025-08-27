import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';

const OrderFilters = ({ 
  filters, 
  onFiltersChange, 
  onExport,
  currentLanguage = 'en' 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState(filters);

  const statusOptions = [
    { value: '', label: currentLanguage === 'am' ? 'ሁሉም ሁኔታዎች' : 'All Status' },
    { value: 'pending', label: currentLanguage === 'am' ? 'በመጠባበቅ ላይ' : 'Pending' },
    { value: 'confirmed', label: currentLanguage === 'am' ? 'ተረጋግጧል' : 'Confirmed' },
    { value: 'completed', label: currentLanguage === 'am' ? 'ተጠናቅቋል' : 'Completed' },
    { value: 'cancelled', label: currentLanguage === 'am' ? 'ተሰርዟል' : 'Cancelled' }
  ];

  const sortOptions = [
    { value: 'newest', label: currentLanguage === 'am' ? 'አዲስ ቀዳሚ' : 'Newest First' },
    { value: 'oldest', label: currentLanguage === 'am' ? 'ቆየት ያለ ቀዳሚ' : 'Oldest First' },
    { value: 'highest_value', label: currentLanguage === 'am' ? 'ከፍተኛ ዋጋ' : 'Highest Value' },
    { value: 'lowest_value', label: currentLanguage === 'am' ? 'ዝቅተኛ ዋጋ' : 'Lowest Value' }
  ];

  const handleFilterChange = (key, value) => {
    const updatedFilters = { ...localFilters, [key]: value };
    setLocalFilters(updatedFilters);
    onFiltersChange(updatedFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      status: '',
      dateFrom: '',
      dateTo: '',
      minValue: '',
      maxValue: '',
      buyerLocation: '',
      sortBy: 'newest'
    };
    setLocalFilters(resetFilters);
    onFiltersChange(resetFilters);
  };

  const hasActiveFilters = Object.values(localFilters)?.some(value => 
    value !== '' && value !== 'newest'
  );

  return (
    <div className="bg-card border border-border rounded-lg shadow-warm">
      {/* Filter Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Icon name="Filter" size={20} className="text-text-secondary" />
          <h3 className="font-medium text-text-primary">
            {currentLanguage === 'am' ? 'ማጣሪያዎች' : 'Filters'}
          </h3>
          {hasActiveFilters && (
            <span className="px-2 py-1 bg-primary/10 text-primary text-xs font-medium rounded-full">
              {currentLanguage === 'am' ? 'ንቁ' : 'Active'}
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onExport}
            iconName="Download"
            iconPosition="left"
          >
            {currentLanguage === 'am' ? 'ወደ ውጪ ላክ' : 'Export'}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-text-secondary"
          >
            <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} />
          </Button>
        </div>
      </div>
      {/* Quick Filters */}
      <div className="p-4 border-b border-border">
        <div className="flex flex-wrap gap-2">
          {statusOptions?.slice(1)?.map((status) => (
            <Button
              key={status?.value}
              variant={localFilters?.status === status?.value ? "default" : "outline"}
              size="sm"
              onClick={() => handleFilterChange('status', 
                localFilters?.status === status?.value ? '' : status?.value
              )}
            >
              {status?.label}
            </Button>
          ))}
        </div>
      </div>
      {/* Expanded Filters */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Date Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                {currentLanguage === 'am' ? 'ከቀን' : 'From Date'}
              </label>
              <Input
                type="date"
                value={localFilters?.dateFrom}
                onChange={(e) => handleFilterChange('dateFrom', e?.target?.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                {currentLanguage === 'am' ? 'እስከ ቀን' : 'To Date'}
              </label>
              <Input
                type="date"
                value={localFilters?.dateTo}
                onChange={(e) => handleFilterChange('dateTo', e?.target?.value)}
                className="w-full"
              />
            </div>

            {/* Value Range */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                {currentLanguage === 'am' ? 'ዝቅተኛ ዋጋ (ብር)' : 'Min Value (ETB)'}
              </label>
              <Input
                type="number"
                placeholder="0"
                value={localFilters?.minValue}
                onChange={(e) => handleFilterChange('minValue', e?.target?.value)}
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                {currentLanguage === 'am' ? 'ከፍተኛ ዋጋ (ብር)' : 'Max Value (ETB)'}
              </label>
              <Input
                type="number"
                placeholder="10000"
                value={localFilters?.maxValue}
                onChange={(e) => handleFilterChange('maxValue', e?.target?.value)}
                className="w-full"
              />
            </div>

            {/* Buyer Location */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                {currentLanguage === 'am' ? 'የገዢ አካባቢ' : 'Buyer Location'}
              </label>
              <Input
                type="text"
                placeholder={currentLanguage === 'am' ? 'አካባቢ ያስገቡ' : 'Enter location'}
                value={localFilters?.buyerLocation}
                onChange={(e) => handleFilterChange('buyerLocation', e?.target?.value)}
                className="w-full"
              />
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary">
                {currentLanguage === 'am' ? 'ደርድር በ' : 'Sort By'}
              </label>
              <select
                value={localFilters?.sortBy}
                onChange={(e) => handleFilterChange('sortBy', e?.target?.value)}
                className="w-full px-3 py-2 border border-border rounded-lg bg-input text-text-primary focus:ring-2 focus:ring-ring focus:border-transparent"
              >
                {sortOptions?.map((option) => (
                  <option key={option?.value} value={option?.value}>
                    {option?.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Filter Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-border">
            <Button
              variant="ghost"
              onClick={handleReset}
              disabled={!hasActiveFilters}
              iconName="RotateCcw"
              iconPosition="left"
            >
              {currentLanguage === 'am' ? 'ዳግም አስጀምር' : 'Reset Filters'}
            </Button>
            
            <div className="text-sm text-text-secondary">
              {currentLanguage === 'am' 
                ? `${hasActiveFilters ? 'ማጣሪያዎች ተተግብረዋል' : 'ምንም ማጣሪያ የለም'}`
                : `${hasActiveFilters ? 'Filters applied' : 'No filters applied'}`
              }
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderFilters;