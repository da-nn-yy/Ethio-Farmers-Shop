import React from 'react';

const PricingQuantitySection = ({ formData, formErrors, onUpdate, currentLanguage }) => {
  const quantityUnits = [
    { value: 'kg', label: currentLanguage === 'en' ? 'Kilograms (kg)' : 'ኪሎግራም (ኪግ)', labelAm: 'ኪሎግራም (ኪግ)' },
    { value: 'ton', label: currentLanguage === 'en' ? 'Tons' : 'ቶን', labelAm: 'ቶን' },
    { value: 'crate', label: currentLanguage === 'en' ? 'Crates' : 'መጣያ', labelAm: 'መጣያ' },
    { value: 'bag', label: currentLanguage === 'en' ? 'Bags' : 'ቦርሳዎች', labelAm: 'ቦርሳዎች' },
    { value: 'unit', label: currentLanguage === 'en' ? 'Units' : 'ክፍሎች', labelAm: 'ክፍሎች' }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {currentLanguage === 'en' ? 'Pricing & Quantity' : 'ዋጋ እና ብዛት'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {currentLanguage === 'en' 
            ? 'Set your pricing and available quantity' 
            : 'ዋጋዎን እና ያለ ብዛት ያዋቅሩ'}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Price per Unit */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {currentLanguage === 'en' ? 'Price per Unit (ETB) *' : 'በክፍል ዋጋ (ETB) *'}
          </label>
          <div className="relative">
            <input
              type="number"
              value={formData.pricePerKg}
              onChange={(e) => onUpdate('pricePerKg', e.target.value)}
              min="0"
              step="0.01"
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
                formErrors.pricePerKg ? 'border-red-500' : 'border-border'
              }`}
              placeholder={currentLanguage === 'en' ? '0.00' : '0.00'}
            />
            <div className="absolute inset-y-0 right-0 flex items-center pr-3">
              <span className="text-muted-foreground text-sm">ETB</span>
            </div>
          </div>
          {formErrors.pricePerKg && (
            <p className="mt-1 text-sm text-red-500">{formErrors.pricePerKg}</p>
          )}
        </div>

        {/* Available Quantity */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {currentLanguage === 'en' ? 'Available Quantity *' : 'ያለ ብዛት *'}
          </label>
          <input
            type="number"
            value={formData.availableQuantity}
            onChange={(e) => onUpdate('availableQuantity', e.target.value)}
            min="0"
            step="0.01"
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              formErrors.availableQuantity ? 'border-red-500' : 'border-border'
            }`}
            placeholder={currentLanguage === 'en' ? '0.00' : '0.00'}
          />
          {formErrors.availableQuantity && (
            <p className="mt-1 text-sm text-red-500">{formErrors.availableQuantity}</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Quantity Unit */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {currentLanguage === 'en' ? 'Quantity Unit *' : 'የብዛት ክፍል *'}
          </label>
          <select
            value={formData.quantityUnit}
            onChange={(e) => onUpdate('quantityUnit', e.target.value)}
            className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            {quantityUnits.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {currentLanguage === 'en' ? unit.label : unit.labelAm}
              </option>
            ))}
          </select>
        </div>

        {/* Harvest Date */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            {currentLanguage === 'en' ? 'Harvest Date *' : 'የመሰብሰቢያ ቀን *'}
          </label>
          <input
            type="date"
            value={formData.harvestDate}
            onChange={(e) => onUpdate('harvestDate', e.target.value)}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent ${
              formErrors.harvestDate ? 'border-red-500' : 'border-border'
            }`}
          />
          {formErrors.harvestDate && (
            <p className="mt-1 text-sm text-red-500">{formErrors.harvestDate}</p>
          )}
        </div>
      </div>

      {/* Price Information */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              {currentLanguage === 'en' ? 'Pricing Tips' : 'የዋጋ ምክሮች'}
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  {currentLanguage === 'en' 
                    ? 'Research current market prices for similar produce' 
                    : 'ለተመሳሳይ ምርቶች የአሁኑን የገበያ ዋጋዎች ያሰሱ'}
                </li>
                <li>
                  {currentLanguage === 'en' 
                    ? 'Consider quality, freshness, and seasonal factors' 
                    : 'ጥራት፣ ትኩስነት እና የወቅት ምክንያቶችን ያስቡ'}
                </li>
                <li>
                  {currentLanguage === 'en' 
                    ? 'Be competitive but fair to ensure quick sales' 
                    : 'ፈጣን ሽያጭ ለማረጋገጥ ተወዳዳሪ ግን ፍትሃዊ ይሁኑ'}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricingQuantitySection;
