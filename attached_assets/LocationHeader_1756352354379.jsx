import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LocationHeader = ({ currentLanguage = 'en', onLocationChange }) => {
  const [selectedLocation, setSelectedLocation] = useState('Addis Ababa');
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  const locations = [
    { id: 'addis-ababa', name: currentLanguage === 'en' ? 'Addis Ababa' : 'አዲስ አበባ' },
    { id: 'dire-dawa', name: currentLanguage === 'en' ? 'Dire Dawa' : 'ድሬዳዋ' },
    { id: 'mekelle', name: currentLanguage === 'en' ? 'Mekelle' : 'መቐለ' },
    { id: 'gondar', name: currentLanguage === 'en' ? 'Gondar' : 'ጎንደር' },
    { id: 'hawassa', name: currentLanguage === 'en' ? 'Hawassa' : 'ሐዋሳ' },
    { id: 'bahir-dar', name: currentLanguage === 'en' ? 'Bahir Dar' : 'ባሕር ዳር' }
  ];

  const handleLocationSelect = (location) => {
    setSelectedLocation(location?.name);
    setIsLocationOpen(false);
    if (onLocationChange) {
      onLocationChange(location);
    }
  };

  return (
    <div className="bg-card border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Icon name="MapPin" size={20} color="var(--color-primary)" />
          <div>
            <p className="font-caption text-xs text-muted-foreground">
              {currentLanguage === 'en' ? 'Delivering to' : 'የሚደርስበት ቦታ'}
            </p>
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsLocationOpen(!isLocationOpen)}
                className="p-0 h-auto font-body text-sm font-medium text-foreground hover:text-primary"
              >
                {selectedLocation}
                <Icon name="ChevronDown" size={16} className="ml-1" />
              </Button>

              {isLocationOpen && (
                <div className="absolute top-full left-0 mt-2 w-48 bg-popover border border-border rounded-lg shadow-floating z-50">
                  <div className="py-2">
                    {locations?.map((location) => (
                      <button
                        key={location?.id}
                        onClick={() => handleLocationSelect(location)}
                        className="w-full px-4 py-2 text-left font-body text-sm text-popover-foreground hover:bg-muted transition-colors duration-200"
                      >
                        {location?.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <Icon name="Bell" size={20} color="currentColor" />
          </Button>
        </div>
      </div>
      {isLocationOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-20 z-40"
          onClick={() => setIsLocationOpen(false)}
        />
      )}
    </div>
  );
};

export default LocationHeader;