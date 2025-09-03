import React from 'react';

const LocationSection = ({ formData, formErrors, onUpdate, currentLanguage }) => {
  const regions = [
    { value: 'Addis Ababa', label: 'Addis Ababa', labelAm: 'አዲስ አበባ' },
    { value: 'Afar', label: 'Afar', labelAm: 'አፋር' },
    { value: 'Amhara', label: 'Amhara', labelAm: 'አማራ' },
    { value: 'Benishangul-Gumuz', label: 'Benishangul-Gumuz', labelAm: 'ቤኒሻንጉል-ጉሙዝ' },
    { value: 'Dire Dawa', label: 'Dire Dawa', labelAm: 'ድሬ ዳዋ' },
    { value: 'Gambela', label: 'Gambela', labelAm: 'ጋምቤላ' },
    { value: 'Harari', label: 'Harari', labelAm: 'ሀረሪ' },
    { value: 'Oromia', label: 'Oromia', labelAm: 'ኦሮሚያ' },
    { value: 'Sidama', label: 'Sidama', labelAm: 'ሲዳማ' },
    { value: 'SNNPR', label: 'SNNPR', labelAm: 'ደቡብ ብሔሮች' },
    { value: 'Somali', label: 'Somali', labelAm: 'ሶማሌ' },
    { value: 'South West', label: 'South West', labelAm: 'ደቡብ ምዕራብ' },
    { value: 'Tigray', label: 'Tigray', labelAm: 'ትግራይ' }
  ];

  const woredas = {
    'Addis Ababa': [
      { value: 'Arada', label: 'Arada', labelAm: 'አራዳ' },
      { value: 'Bole', label: 'Bole', labelAm: 'ቦሌ' },
      { value: 'Gullele', label: 'Gullele', labelAm: 'ጉለሌ' },
      { value: 'Kirkos', label: 'Kirkos', labelAm: 'ቂርቆስ' },
      { value: 'Kolfe Keranio', label: 'Kolfe Keranio', labelAm: 'ኮልፌ ከራኒዮ' },
      { value: 'Lideta', label: 'Lideta', labelAm: 'ሊደታ' },
      { value: 'Nifas Silk-Lafto', label: 'Nifas Silk-Lafto', labelAm: 'ንፋስ ስልክ-ላፍቶ' },
      { value: 'Yeka', label: 'Yeka', labelAm: 'የካ' }
    ],
    'Amhara': [
      { value: 'Bahir Dar', label: 'Bahir Dar', labelAm: 'ባሕር ዳር' },
      { value: 'Gondar', label: 'Gondar', labelAm: 'ጎንደር' },
      { value: 'Dessie', label: 'Dessie', labelAm: 'ደሴ' },
      { value: 'Debre Markos', label: 'Debre Markos', labelAm: 'ደብረ ማርቆስ' }
    ],
    'Oromia': [
      { value: 'Adama', label: 'Adama', labelAm: 'አዳማ' },
      { value: 'Jimma', label: 'Jimma', labelAm: 'ጅማ' },
      { value: 'Bishoftu', label: 'Bishoftu', labelAm: 'ቢሾፍቱ' },
      { value: 'Shashemene', label: 'Shashemene', labelAm: 'ሻሸመኔ' }
    ],
    'Tigray': [
      { value: 'Mekelle', label: 'Mekelle', labelAm: 'መቀሌ' },
      { value: 'Axum', label: 'Axum', labelAm: 'አክሱም' },
      { value: 'Adigrat', label: 'Adigrat', labelAm: 'አዲግራት' }
    ]
  };

  const getWoredasForRegion = (region) => {
    return woredas[region] || [];
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {currentLanguage === 'en' ? 'Location Details' : 'የአካባቢ ዝርዝሮች'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {currentLanguage === 'en' 
            ? 'Specify where your produce is located for buyers to find you' 
            : 'ገዢዎች እንዲያገኙዎ ምርትዎ የሚገኝበትን ቦታ ይግለጹ'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Region */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {currentLanguage === 'en' ? 'Region *' : 'ክልል *'}
          </label>
          <select
            value={formData.region || ''}
            onChange={(e) => {
              onUpdate('region', e.target.value);
              // Reset woreda when region changes
              onUpdate('woreda', '');
            }}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              formErrors.region ? 'border-red-500' : 'border-border'
            }`}
          >
            <option value="">
              {currentLanguage === 'en' ? 'Select region' : 'ክልል ይምረጡ'}
            </option>
            {regions.map((region) => (
              <option key={region.value} value={region.value}>
                {currentLanguage === 'en' ? region.label : region.labelAm}
              </option>
            ))}
          </select>
          {formErrors.region && (
            <p className="mt-1 text-sm text-red-500">{formErrors.region}</p>
          )}
        </div>

        {/* Woreda */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {currentLanguage === 'en' ? 'Woreda *' : 'ወረዳ *'}
          </label>
          <select
            value={formData.woreda || ''}
            onChange={(e) => onUpdate('woreda', e.target.value)}
            disabled={!formData.region}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              formErrors.woreda ? 'border-red-500' : 'border-border'
            } ${!formData.region ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">
              {currentLanguage === 'en' 
                ? (formData.region ? 'Select woreda' : 'Select region first') 
                : (formData.region ? 'ወረዳ ይምረጡ' : 'መጀመሪያ ክልል ይምረጡ')
              }
            </option>
            {getWoredasForRegion(formData.region).map((woreda) => (
              <option key={woreda.value} value={woreda.value}>
                {currentLanguage === 'en' ? woreda.label : woreda.labelAm}
              </option>
            ))}
          </select>
          {formErrors.woreda && (
            <p className="mt-1 text-sm text-red-500">{formErrors.woreda}</p>
          )}
        </div>
      </div>

      {/* Specific Location */}
      <div>
        <label className="block text-sm font-medium text-foreground mb-2">
          {currentLanguage === 'en' ? 'Specific Location (Optional)' : 'የተወሰነ አካባቢ (አማራጭ)'}
        </label>
        <input
          type="text"
          value={formData.specificLocation || ''}
          onChange={(e) => onUpdate('specificLocation', e.target.value)}
          className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          placeholder={currentLanguage === 'en' 
            ? 'e.g., Near Central Market, Behind Post Office' 
            : 'ለምሳሌ: ከመካከለኛ ገበያ አጠገብ፣ ከፖስታ ቤት በስተጀርባ'}
        />
        <p className="mt-1 text-sm text-muted-foreground">
          {currentLanguage === 'en' 
            ? 'Provide additional details to help buyers locate you easily' 
            : 'ገዢዎች በቀላሉ እንዲያገኙዎ ተጨማሪ ዝርዝሮችን ይስጡ'}
        </p>
      </div>

      {/* Location Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              {currentLanguage === 'en' ? 'Location Tips' : 'የአካባቢ ምክሮች'}
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  {currentLanguage === 'en' 
                    ? 'Be as specific as possible to help buyers find you' 
                    : 'ገዢዎች እንዲያገኙዎ በተቻለ መጠን የተወሰነ ይሁኑ'}
                </li>
                <li>
                  {currentLanguage === 'en' 
                    ? 'Include nearby landmarks or major roads' 
                    : 'አጠገባቸው ያሉ ምልክቶች ወይም ዋና መንገዶችን ያካተቱ'}
                </li>
                <li>
                  {currentLanguage === 'en' 
                    ? 'Consider accessibility for delivery or pickup' 
                    : 'ለማድረስ ወይም ለመውሰድ ተደራሽነትን ያስቡ'}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationSection;
