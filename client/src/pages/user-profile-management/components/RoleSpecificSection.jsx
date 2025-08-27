import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const RoleSpecificSection = ({ userRole, currentLanguage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(
    userRole === 'farmer' 
      ? {
          farmSize: '5.2',
          farmSizeUnit: 'hectares',
          primaryCrops: ['teff', 'maize', 'wheat'],
          farmingMethods: ['organic', 'traditional'],
          businessHours: {
            start: '06:00',
            end: '18:00'
          },
          seasonalAvailability: 'year-round'
        }
      : {
          businessType: 'restaurant',
          preferredSuppliers: 'local-farmers',
          purchaseVolume: 'medium',
          deliveryPreference: 'pickup',
          businessHours: {
            start: '08:00',
            end: '22:00'
          }
        }
  );

  const farmSizeUnits = [
    { value: 'hectares', label: 'Hectares', labelAm: 'ሄክታር' },
    { value: 'acres', label: 'Acres', labelAm: 'ኤከር' },
    { value: 'square-meters', label: 'Square Meters', labelAm: 'ካሬ ሜትር' }
  ];

  const cropOptions = [
    { value: 'teff', label: 'Teff', labelAm: 'ጤፍ' },
    { value: 'maize', label: 'Maize', labelAm: 'በቆሎ' },
    { value: 'wheat', label: 'Wheat', labelAm: 'ስንዴ' },
    { value: 'barley', label: 'Barley', labelAm: 'ገብስ' },
    { value: 'sorghum', label: 'Sorghum', labelAm: 'ማሽላ' },
    { value: 'coffee', label: 'Coffee', labelAm: 'ቡና' },
    { value: 'vegetables', label: 'Vegetables', labelAm: 'አትክልት' },
    { value: 'fruits', label: 'Fruits', labelAm: 'ፍራፍሬ' }
  ];

  const farmingMethodOptions = [
    { value: 'organic', label: 'Organic', labelAm: 'ኦርጋኒክ' },
    { value: 'traditional', label: 'Traditional', labelAm: 'ባህላዊ' },
    { value: 'modern', label: 'Modern', labelAm: 'ዘመናዊ' },
    { value: 'mixed', label: 'Mixed', labelAm: 'ድብልቅ' }
  ];

  const businessTypeOptions = [
    { value: 'restaurant', label: 'Restaurant', labelAm: 'ሬስቶራንት' },
    { value: 'retailer', label: 'Retailer', labelAm: 'ችርቻሮ ሻጭ' },
    { value: 'wholesaler', label: 'Wholesaler', labelAm: 'ጅምላ ሻጭ' },
    { value: 'individual', label: 'Individual Consumer', labelAm: 'ግለሰብ ተጠቃሚ' },
    { value: 'cooperative', label: 'Cooperative', labelAm: 'ህብረት ስራ' }
  ];

  const purchaseVolumeOptions = [
    { value: 'small', label: 'Small (< 100kg/month)', labelAm: 'ትንሽ (< 100ኪ.ግ/ወር)' },
    { value: 'medium', label: 'Medium (100-500kg/month)', labelAm: 'መካከለኛ (100-500ኪ.ግ/ወር)' },
    { value: 'large', label: 'Large (> 500kg/month)', labelAm: 'ትልቅ (> 500ኪ.ግ/ወር)' }
  ];

  const handleInputChange = (field, value) => {
    if (field?.includes('.')) {
      const [parent, child] = field?.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev?.[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleArrayChange = (field, value, checked) => {
    setFormData(prev => ({
      ...prev,
      [field]: checked 
        ? [...prev?.[field], value]
        : prev?.[field]?.filter(item => item !== value)
    }));
  };

  const getLabel = (text, textAm) => {
    return currentLanguage === 'am' ? textAm : text;
  };

  const getOptionLabel = (option) => {
    return currentLanguage === 'am' && option?.labelAm ? option?.labelAm : option?.label;
  };

  const renderFarmerSection = () => (
    <div className="space-y-6">
      {/* Farm Details */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {getLabel('Farm Details', 'የእርሻ ዝርዝሮች')}
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="flex space-x-2">
            <Input
              label={getLabel('Farm Size', 'የእርሻ መጠን')}
              type="number"
              value={formData?.farmSize}
              onChange={(e) => handleInputChange('farmSize', e?.target?.value)}
              disabled={!isEditing}
              className="flex-1"
            />
            <Select
              label={getLabel('Unit', 'መለኪያ')}
              options={farmSizeUnits?.map(unit => ({
                value: unit?.value,
                label: getOptionLabel(unit)
              }))}
              value={formData?.farmSizeUnit}
              onChange={(value) => handleInputChange('farmSizeUnit', value)}
              disabled={!isEditing}
              className="w-32"
            />
          </div>
          
          <Select
            label={getLabel('Seasonal Availability', 'የወቅት አቅርቦት')}
            options={[
              { value: 'year-round', label: getLabel('Year Round', 'ዓመት ሙሉ') },
              { value: 'seasonal', label: getLabel('Seasonal', 'ወቅታዊ') },
              { value: 'harvest-only', label: getLabel('Harvest Season Only', 'የመከር ወቅት ብቻ') }
            ]}
            value={formData?.seasonalAvailability}
            onChange={(value) => handleInputChange('seasonalAvailability', value)}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Primary Crops */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {getLabel('Primary Crops', 'ዋና ሰብሎች')}
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {cropOptions?.map((crop) => (
            <Checkbox
              key={crop?.value}
              label={getOptionLabel(crop)}
              checked={formData?.primaryCrops?.includes(crop?.value)}
              onChange={(e) => handleArrayChange('primaryCrops', crop?.value, e?.target?.checked)}
              disabled={!isEditing}
            />
          ))}
        </div>
      </div>

      {/* Farming Methods */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {getLabel('Farming Methods', 'የእርሻ ዘዴዎች')}
        </h3>
        
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {farmingMethodOptions?.map((method) => (
            <Checkbox
              key={method?.value}
              label={getOptionLabel(method)}
              checked={formData?.farmingMethods?.includes(method?.value)}
              onChange={(e) => handleArrayChange('farmingMethods', method?.value, e?.target?.checked)}
              disabled={!isEditing}
            />
          ))}
        </div>
      </div>

      {/* Business Hours */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {getLabel('Available Hours', 'የመገኘት ሰዓት')}
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label={getLabel('Start Time', 'መጀመሪያ ሰዓት')}
            type="time"
            value={formData?.businessHours?.start}
            onChange={(e) => handleInputChange('businessHours.start', e?.target?.value)}
            disabled={!isEditing}
          />
          
          <Input
            label={getLabel('End Time', 'መጨረሻ ሰዓት')}
            type="time"
            value={formData?.businessHours?.end}
            onChange={(e) => handleInputChange('businessHours.end', e?.target?.value)}
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  );

  const renderBuyerSection = () => (
    <div className="space-y-6">
      {/* Business Information */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {getLabel('Business Information', 'የንግድ መረጃ')}
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Select
            label={getLabel('Business Type', 'የንግድ አይነት')}
            options={businessTypeOptions?.map(type => ({
              value: type?.value,
              label: getOptionLabel(type)
            }))}
            value={formData?.businessType}
            onChange={(value) => handleInputChange('businessType', value)}
            disabled={!isEditing}
          />
          
          <Select
            label={getLabel('Purchase Volume', 'የግዢ መጠን')}
            options={purchaseVolumeOptions?.map(volume => ({
              value: volume?.value,
              label: getOptionLabel(volume)
            }))}
            value={formData?.purchaseVolume}
            onChange={(value) => handleInputChange('purchaseVolume', value)}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Preferences */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {getLabel('Purchasing Preferences', 'የግዢ ምርጫዎች')}
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Select
            label={getLabel('Preferred Suppliers', 'የተመረጡ አቅራቢዎች')}
            options={[
              { value: 'local-farmers', label: getLabel('Local Farmers', 'የአካባቢ ገበሬዎች') },
              { value: 'certified-organic', label: getLabel('Certified Organic', 'የተረጋገጠ ኦርጋኒክ') },
              { value: 'cooperatives', label: getLabel('Cooperatives', 'ህብረት ስራዎች') },
              { value: 'any', label: getLabel('Any Supplier', 'ማንኛውም አቅራቢ') }
            ]}
            value={formData?.preferredSuppliers}
            onChange={(value) => handleInputChange('preferredSuppliers', value)}
            disabled={!isEditing}
          />
          
          <Select
            label={getLabel('Delivery Preference', 'የማድረስ ምርጫ')}
            options={[
              { value: 'pickup', label: getLabel('Self Pickup', 'በራስ መውሰድ') },
              { value: 'delivery', label: getLabel('Home Delivery', 'ወደ ቤት ማድረስ') },
              { value: 'both', label: getLabel('Both Options', 'ሁለቱም አማራጮች') }
            ]}
            value={formData?.deliveryPreference}
            onChange={(value) => handleInputChange('deliveryPreference', value)}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Business Hours */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {getLabel('Business Hours', 'የንግድ ሰዓት')}
        </h3>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label={getLabel('Opening Time', 'የመክፈቻ ሰዓት')}
            type="time"
            value={formData?.businessHours?.start}
            onChange={(e) => handleInputChange('businessHours.start', e?.target?.value)}
            disabled={!isEditing}
          />
          
          <Input
            label={getLabel('Closing Time', 'የመዝጊያ ሰዓት')}
            type="time"
            value={formData?.businessHours?.end}
            onChange={(e) => handleInputChange('businessHours.end', e?.target?.value)}
            disabled={!isEditing}
          />
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">
          {userRole === 'farmer' ? getLabel('Farm Information', 'የእርሻ መረጃ')
            : getLabel('Business Information', 'የንግድ መረጃ')
          }
        </h2>
        {!isEditing ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            iconName="Edit"
            iconPosition="left"
          >
            {getLabel('Edit', 'አርትዕ')}
          </Button>
        ) : (
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditing(false)}
            >
              {getLabel('Cancel', 'ሰርዝ')}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => setIsEditing(false)}
              iconName="Check"
              iconPosition="left"
            >
              {getLabel('Save', 'አስቀምጥ')}
            </Button>
          </div>
        )}
      </div>

      {userRole === 'farmer' ? renderFarmerSection() : renderBuyerSection()}
    </div>
  );
};

export default RoleSpecificSection;