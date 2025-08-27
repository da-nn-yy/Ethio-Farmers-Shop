import React, { useState, useEffect } from 'react';
import Select from '../../../components/ui/Select';
import Icon from '../../../components/AppIcon';

const LocationSelector = ({ onLocationChange, currentLanguage = 'en' }) => {
  const [selectedRegion, setSelectedRegion] = useState('addis-ababa');
  const [selectedWoreda, setSelectedWoreda] = useState('bole');

  const regions = [
    { value: 'addis-ababa', label: 'Addis Ababa', labelAm: 'አዲስ አበባ' },
    { value: 'oromia', label: 'Oromia', labelAm: 'ኦሮሚያ' },
    { value: 'amhara', label: 'Amhara', labelAm: 'አማራ' },
    { value: 'tigray', label: 'Tigray', labelAm: 'ትግራይ' },
    { value: 'snnpr', label: 'SNNPR', labelAm: 'ደቡብ ብሔሮች' },
    { value: 'sidama', label: 'Sidama', labelAm: 'ሲዳማ' }
  ];

  const woredas = {
    'addis-ababa': [
      { value: 'bole', label: 'Bole', labelAm: 'ቦሌ' },
      { value: 'kirkos', label: 'Kirkos', labelAm: 'ቂርቆስ' },
      { value: 'yeka', label: 'Yeka', labelAm: 'የካ' },
      { value: 'arada', label: 'Arada', labelAm: 'አራዳ' }
    ],
    'oromia': [
      { value: 'adama', label: 'Adama', labelAm: 'አዳማ' },
      { value: 'jimma', label: 'Jimma', labelAm: 'ጅማ' },
      { value: 'nekemte', label: 'Nekemte', labelAm: 'ነቀምት' },
      { value: 'hawassa', label: 'Hawassa', labelAm: 'ሐዋሳ' }
    ],
    'amhara': [
      { value: 'bahir-dar', label: 'Bahir Dar', labelAm: 'ባሕር ዳር' },
      { value: 'gondar', label: 'Gondar', labelAm: 'ጎንደር' },
      { value: 'dessie', label: 'Dessie', labelAm: 'ደሴ' },
      { value: 'debre-markos', label: 'Debre Markos', labelAm: 'ደብረ ማርቆስ' }
    ]
  };

  const getLabel = (item) => {
    return currentLanguage === 'am' && item?.labelAm ? item?.labelAm : item?.label;
  };

  const handleRegionChange = (value) => {
    setSelectedRegion(value);
    const firstWoreda = woredas?.[value]?.[0]?.value || '';
    setSelectedWoreda(firstWoreda);
    
    if (onLocationChange) {
      onLocationChange({
        region: value,
        woreda: firstWoreda
      });
    }
  };

  const handleWoredaChange = (value) => {
    setSelectedWoreda(value);
    
    if (onLocationChange) {
      onLocationChange({
        region: selectedRegion,
        woreda: value
      });
    }
  };

  useEffect(() => {
    if (onLocationChange) {
      onLocationChange({
        region: selectedRegion,
        woreda: selectedWoreda
      });
    }
  }, []);

  const regionOptions = regions?.map(region => ({
    value: region?.value,
    label: getLabel(region)
  }));

  const woredaOptions = (woredas?.[selectedRegion] || [])?.map(woreda => ({
    value: woreda?.value,
    label: getLabel(woreda)
  }));

  return (
    <div className="bg-surface p-4 lg:p-6 rounded-lg border border-border shadow-warm">
      <div className="flex items-center space-x-2 mb-4">
        <Icon name="MapPin" size={20} className="text-primary" />
        <h3 className="text-lg font-semibold text-text-primary">
          {currentLanguage === 'am' ? 'ቦታ ምረጥ' : 'Select Location'}
        </h3>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Select
          label={currentLanguage === 'am' ? 'ክልል' : 'Region'}
          options={regionOptions}
          value={selectedRegion}
          onChange={handleRegionChange}
          placeholder={currentLanguage === 'am' ? 'ክልል ምረጥ' : 'Select region'}
        />
        
        <Select
          label={currentLanguage === 'am' ? 'ወረዳ' : 'Woreda'}
          options={woredaOptions}
          value={selectedWoreda}
          onChange={handleWoredaChange}
          placeholder={currentLanguage === 'am' ? 'ወረዳ ምረጥ' : 'Select woreda'}
          disabled={!selectedRegion}
        />
      </div>
    </div>
  );
};

export default LocationSelector;