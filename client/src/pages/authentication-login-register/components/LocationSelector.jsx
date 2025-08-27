import React from 'react';
import Select from '../../../components/ui/Select';

const LocationSelector = ({ selectedRegion, selectedWoreda, onRegionChange, onWoredaChange, currentLanguage }) => {
  const regions = [
    { value: 'addis-ababa', label: 'Addis Ababa', labelAm: 'አዲስ አበባ' },
    { value: 'oromia', label: 'Oromia', labelAm: 'ኦሮሚያ' },
    { value: 'amhara', label: 'Amhara', labelAm: 'አማራ' },
    { value: 'tigray', label: 'Tigray', labelAm: 'ትግራይ' },
    { value: 'snnpr', label: 'SNNPR', labelAm: 'ደቡብ ብሔሮች' },
    { value: 'afar', label: 'Afar', labelAm: 'አፋር' },
    { value: 'somali', label: 'Somali', labelAm: 'ሶማሊ' },
    { value: 'benishangul', label: 'Benishangul-Gumuz', labelAm: 'ቤንሻንጉል ጉሙዝ' },
    { value: 'gambela', label: 'Gambela', labelAm: 'ጋምቤላ' },
    { value: 'harari', label: 'Harari', labelAm: 'ሐረሪ' },
    { value: 'dire-dawa', label: 'Dire Dawa', labelAm: 'ድሬዳዋ' }
  ];

  const woredas = {
    'addis-ababa': [
      { value: 'arada', label: 'Arada', labelAm: 'አራዳ' },
      { value: 'kirkos', label: 'Kirkos', labelAm: 'ቂርቆስ' },
      { value: 'lideta', label: 'Lideta', labelAm: 'ልደታ' },
      { value: 'yeka', label: 'Yeka', labelAm: 'የካ' }
    ],
    'oromia': [
      { value: 'adama', label: 'Adama', labelAm: 'አዳማ' },
      { value: 'jimma', label: 'Jimma', labelAm: 'ጅማ' },
      { value: 'nekemte', label: 'Nekemte', labelAm: 'ነቀምት' },
      { value: 'shashemene', label: 'Shashemene', labelAm: 'ሻሸመኔ' }
    ],
    'amhara': [
      { value: 'bahir-dar', label: 'Bahir Dar', labelAm: 'ባሕር ዳር' },
      { value: 'gondar', label: 'Gondar', labelAm: 'ጎንደር' },
      { value: 'dessie', label: 'Dessie', labelAm: 'ደሴ' },
      { value: 'debre-markos', label: 'Debre Markos', labelAm: 'ደብረ ማርቆስ' }
    ]
  };

  const getRegionOptions = () => {
    return regions?.map(region => ({
      value: region?.value,
      label: currentLanguage === 'am' && region?.labelAm ? region?.labelAm : region?.label
    }));
  };

  const getWoredaOptions = () => {
    if (!selectedRegion || !woredas?.[selectedRegion]) return [];
    
    return woredas?.[selectedRegion]?.map(woreda => ({
      value: woreda?.value,
      label: currentLanguage === 'am' && woreda?.labelAm ? woreda?.labelAm : woreda?.label
    }));
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <Select
        label={currentLanguage === 'am' ? 'ክልል' : 'Region'}
        placeholder={currentLanguage === 'am' ? 'ክልል ይምረጡ' : 'Select region'}
        options={getRegionOptions()}
        value={selectedRegion}
        onChange={onRegionChange}
        required
        searchable
      />
      
      <Select
        label={currentLanguage === 'am' ? 'ወረዳ' : 'Woreda'}
        placeholder={currentLanguage === 'am' ? 'ወረዳ ይምረጡ' : 'Select woreda'}
        options={getWoredaOptions()}
        value={selectedWoreda}
        onChange={onWoredaChange}
        disabled={!selectedRegion}
        required
        searchable
      />
    </div>
  );
};

export default LocationSelector;