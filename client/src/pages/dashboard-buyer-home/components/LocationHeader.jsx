
import React, { useState, useEffect } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const LocationHeader = ({ currentLanguage = 'en', onLocationChange }) => {
  const [selectedLocation, setSelectedLocation] = useState('Addis Ababa');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const locations = [
    'Addis Ababa',
    'Dire Dawa',
    'Bahir Dar',
    'Gondar',
    'Mekelle',
    'Hawassa',
    'Jimma',
    'Adama'
  ];

  const handleLocationSelect = (location) => {
    setSelectedLocation(location);
    setIsDropdownOpen(false);
    onLocationChange?.(location);
  };

  return (
    <div className="bg-primary text-white p-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold mb-2">
              {currentLanguage === 'en' ? 'Fresh Produce Market' : 'የትኩስ ምርት ገበያ'}
            </h2>
            <div className="flex items-center space-x-2">
              <Icon name="MapPin" className="w-4 h-4" />
              <span className="text-sm opacity-90">
                {currentLanguage === 'en' ? 'Location:' : 'አካባቢ:'}
              </span>
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-1 text-sm font-medium hover:underline"
                >
                  <span>{selectedLocation}</span>
                  <Icon name="ChevronDown" className="w-3 h-3" />
                </button>
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 bg-white border border-border rounded-lg shadow-lg z-10 min-w-32">
                    {locations.map((location) => (
                      <button
                        key={location}
                        onClick={() => handleLocationSelect(location)}
                        className="block w-full text-left px-3 py-2 text-sm text-text-primary hover:bg-muted first:rounded-t-lg last:rounded-b-lg"
                      >
                        {location}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <Button variant="secondary" size="sm" iconName="Search">
            {currentLanguage === 'en' ? 'Browse All' : 'ሁሉንም አስሳ'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LocationHeader;
