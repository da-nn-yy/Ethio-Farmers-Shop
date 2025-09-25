import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { profileService } from '../../../services/apiService';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { Checkbox } from '../../../components/ui/Checkbox';

const RoleSpecificSection = ({ userRole, currentLanguage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(
    userRole === 'farmer'
      ? {
          farmName: '',
          farmSize: '',
          farmSizeUnit: 'hectares',
          primaryCrops: [],
          farmingMethods: [],
          businessHours: {
            start: '06:00',
            end: '18:00'
          },
          seasonalAvailability: 'year-round',
          farmDescription: '',
          farmDescriptionAm: '',
          experienceYears: '',
          specializations: [],
          equipment: [],
          irrigationType: '',
          soilType: '',
          organicCertified: false,
          fairTradeCertified: false,
          gmoFree: true,
          sustainabilityPractices: [],
          address: ''
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

  // Load role-specific profile attributes saved during registration
  useEffect(() => {
    const loadRoleSpecific = async () => {
      try {
        // Unified profile fetch regardless of role
        const unified = await profileService.getProfile();
        if (userRole === 'farmer' && unified?.profile) {
          const profileData = unified.profile;
          setFormData(prev => ({
            ...prev,
            farmName: profileData.farm_name || prev.farmName,
            farmSize: profileData.farm_size_ha || prev.farmSize,
            farmSizeUnit: profileData.farm_size_unit || prev.farmSizeUnit,
            primaryCrops: Array.isArray(profileData.crops) ? profileData.crops : prev.primaryCrops,
            farmingMethods: Array.isArray(profileData.farming_methods) ? profileData.farming_methods : prev.farmingMethods,
            businessHours: {
              start: profileData.business_hours_start || prev.businessHours.start,
              end: profileData.business_hours_end || prev.businessHours.end
            },
            seasonalAvailability: profileData.seasonal_availability || prev.seasonalAvailability,
            farmDescription: profileData.farm_description || prev.farmDescription,
            farmDescriptionAm: profileData.farm_description_am || prev.farmDescriptionAm,
            experienceYears: profileData.experience_years || prev.experienceYears,
            specializations: Array.isArray(profileData.specializations) ? profileData.specializations : prev.specializations,
            equipment: Array.isArray(profileData.equipment) ? profileData.equipment : prev.equipment,
            irrigationType: profileData.irrigation_type || prev.irrigationType,
            soilType: profileData.soil_type || prev.soilType,
            organicCertified: profileData.organic_certified || prev.organicCertified,
            fairTradeCertified: profileData.fair_trade_certified || prev.fairTradeCertified,
            gmoFree: profileData.gmo_free !== undefined ? profileData.gmo_free : prev.gmoFree,
            sustainabilityPractices: Array.isArray(profileData.sustainability_practices) ? profileData.sustainability_practices : prev.sustainabilityPractices,
            address: profileData.address || prev.address,
          }));
        } else if (unified?.user) {
          const data = unified.user;
          setFormData(prev => ({
            ...prev,
            businessType: data?.businessType || prev.businessType,
            preferredSuppliers: data?.preferredSuppliers || prev.preferredSuppliers,
            purchaseVolume: data?.purchaseVolume || prev.purchaseVolume,
            deliveryPreference: data?.deliveryPreference || prev.deliveryPreference,
            businessHours: {
              start: (data?.businessHours && data?.businessHours?.start) || prev.businessHours.start,
              end: (data?.businessHours && data?.businessHours?.end) || prev.businessHours.end
            },
          }));
        }
      } catch (e) {
        console.error('Failed to load role-specific data:', e);
        // Fallback to localStorage data if API fails
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            // Auto-populate from registration data if available
            if (userRole === 'farmer') {
              setFormData(prev => ({
                ...prev,
                farmSize: userData.farmSize || '5.2',
                farmSizeUnit: userData.farmSizeUnit || 'hectares',
                primaryCrops: userData.primaryCrops || ['teff', 'maize', 'wheat'],
                farmingMethods: userData.farmingMethods || ['organic', 'traditional'],
                seasonalAvailability: userData.seasonalAvailability || 'year-round'
              }));
            } else {
              setFormData(prev => ({
                ...prev,
                businessType: userData.businessType || 'restaurant',
                preferredSuppliers: userData.preferredSuppliers || 'local-farmers',
                purchaseVolume: userData.purchaseVolume || 'medium',
                deliveryPreference: userData.deliveryPreference || 'pickup'
              }));
            }
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError);
          }
        }
      }
    };
    loadRoleSpecific();
  }, [userRole]);

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
    { value: 'mixed', label: 'Mixed', labelAm: 'ድብልቅ' },
    { value: 'permaculture', label: 'Permaculture', labelAm: 'ፐርማኩልቸር' },
    { value: 'biodynamic', label: 'Biodynamic', labelAm: 'ባዮዳይናሚክ' }
  ];

  const specializationOptions = [
    { value: 'crop-rotation', label: 'Crop Rotation', labelAm: 'የሰብል ማሽከርከር' },
    { value: 'soil-conservation', label: 'Soil Conservation', labelAm: 'የአፈር ጥበቃ' },
    { value: 'water-management', label: 'Water Management', labelAm: 'የውሃ አስተዳደር' },
    { value: 'pest-control', label: 'Pest Control', labelAm: 'የጉዳተኛ ቁሳቁስ መቆጣጠር' },
    { value: 'seed-production', label: 'Seed Production', labelAm: 'የዘር ምርት' },
    { value: 'livestock-integration', label: 'Livestock Integration', labelAm: 'የእንስሳት ውህደት' }
  ];

  const equipmentOptions = [
    { value: 'tractor', label: 'Tractor', labelAm: 'ትራክተር' },
    { value: 'plow', label: 'Plow', labelAm: 'መሐላ' },
    { value: 'harvester', label: 'Harvester', labelAm: 'የመከር ማሽን' },
    { value: 'irrigation-system', label: 'Irrigation System', labelAm: 'የማጠራቀሚያ ስርዓት' },
    { value: 'greenhouse', label: 'Greenhouse', labelAm: 'አረንጓዴ ቤት' },
    { value: 'storage-facility', label: 'Storage Facility', labelAm: 'የማከማቻ ተቋም' }
  ];

  const sustainabilityOptions = [
    { value: 'composting', label: 'Composting', labelAm: 'የኮምፖስት ማድረግ' },
    { value: 'renewable-energy', label: 'Renewable Energy', labelAm: 'የማደራጀት ኢነርጂ' },
    { value: 'water-conservation', label: 'Water Conservation', labelAm: 'የውሃ ቆጣቢነት' },
    { value: 'biodiversity', label: 'Biodiversity', labelAm: 'ባዮዲቨርሲቲ' },
    { value: 'carbon-sequestration', label: 'Carbon Sequestration', labelAm: 'የካርቦን መያዣ' },
    { value: 'zero-waste', label: 'Zero Waste', labelAm: 'ዜሮ ቆሻሻ' }
  ];

  const irrigationTypeOptions = [
    { value: 'rain-fed', label: 'Rain-fed', labelAm: 'የዝናብ ማጠራቀሚያ' },
    { value: 'irrigated', label: 'Irrigated', labelAm: 'የማጠራቀሚያ' },
    { value: 'mixed', label: 'Mixed', labelAm: 'ድብልቅ' }
  ];

  const soilTypeOptions = [
    { value: 'clay', label: 'Clay', labelAm: 'ሸክላ' },
    { value: 'sandy', label: 'Sandy', labelAm: 'አሸዋማ' },
    { value: 'loamy', label: 'Loamy', labelAm: 'የሸክላ አሸዋማ' },
    { value: 'rocky', label: 'Rocky', labelAm: 'የድንጋይ' },
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

  const handleSave = async () => {
    try {
      // Update localStorage with role-specific data
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
      localStorage.setItem('userData', JSON.stringify({
        ...currentUser,
        ...formData
      }));

      // Try to save via unified API
      try {
        if (userRole === 'farmer') {
          await profileService.updateProfile({
            farm_name: formData.farmName,
            farm_size_ha: formData.farmSize,
            farm_size_unit: formData.farmSizeUnit,
            crops: formData.primaryCrops,
            farming_methods: formData.farmingMethods,
            seasonal_availability: formData.seasonalAvailability,
            business_hours_start: formData.businessHours.start,
            business_hours_end: formData.businessHours.end,
            farm_description: formData.farmDescription,
            farm_description_am: formData.farmDescriptionAm,
            experience_years: formData.experienceYears,
            specializations: formData.specializations,
            equipment: formData.equipment,
            irrigation_type: formData.irrigationType,
            soil_type: formData.soilType,
            organic_certified: formData.organicCertified,
            fair_trade_certified: formData.fairTradeCertified,
            gmo_free: formData.gmoFree,
            sustainability_practices: formData.sustainabilityPractices,
            address: formData.address
          });
        } else {
          await profileService.updateProfile(formData);
        }
      } catch (apiError) {
        console.warn('API save failed, data saved locally:', apiError);
      }

      setIsEditing(false);
      alert(currentLanguage === 'en' ? 'Profile updated successfully!' : 'መገለጫ በተሳካ ሁኔታ ተዘምኗል!');
    } catch (e) {
      console.error('Profile update error:', e);
      alert(currentLanguage === 'en' ? 'Failed to update profile. Please try again.' : 'መገለጫ ማዘመን አልተሳካም። እባክዎ እንደገና ይሞክሩ።');
    }
  };

  const getLabel = (text, textAm) => {
    return currentLanguage === 'am' ? textAm : text;
  };

  const getOptionLabel = (option) => {
    return currentLanguage === 'am' && option?.labelAm ? option?.labelAm : option?.label;
  };

  const renderFarmerSection = () => (
    <div className="space-y-8">
      {/* Basic Farm Information */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {getLabel('Basic Farm Information', 'የእርሻ መሰረታዊ መረጃ')}
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Input
            label={getLabel('Farm Name', 'የእርሻ ስም')}
            type="text"
            value={formData?.farmName}
            onChange={(e) => handleInputChange('farmName', e?.target?.value)}
            disabled={!isEditing}
            placeholder={getLabel('Enter your farm name', 'የእርሻዎን ስም ያስገቡ')}
          />

          <div className="flex space-x-2">
            <Input
              label={getLabel('Farm Size', 'የእርሻ መጠን')}
              type="number"
              value={formData?.farmSize}
              onChange={(e) => handleInputChange('farmSize', e?.target?.value)}
              disabled={!isEditing}
              className="flex-1"
              placeholder="0.0"
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

          <Input
            label={getLabel('Experience (Years)', 'ልምድ (ዓመታት)')}
            type="number"
            value={formData?.experienceYears}
            onChange={(e) => handleInputChange('experienceYears', e?.target?.value)}
            disabled={!isEditing}
            placeholder="0"
          />

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

        <div className="mt-4">
          <Input
            label={getLabel('Farm Address', 'የእርሻ አድራሻ')}
            type="text"
            value={formData?.address}
            onChange={(e) => handleInputChange('address', e?.target?.value)}
            disabled={!isEditing}
            placeholder={getLabel('Enter detailed farm address', 'የእርሻ ዝርዝር አድራሻ ያስገቡ')}
          />
        </div>
      </div>

      {/* Farm Description */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {getLabel('Farm Description', 'የእርሻ መግለጫ')}
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {getLabel('Description (English)', 'መግለጫ (እንግሊዝኛ)')}
            </label>
            <textarea
              className="w-full p-3 border border-border rounded-lg bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
              rows={4}
              value={formData?.farmDescription}
              onChange={(e) => handleInputChange('farmDescription', e?.target?.value)}
              disabled={!isEditing}
              placeholder={getLabel('Describe your farm, its history, and what makes it special...', 'እርሻዎን፣ ታሪኩን እና ምን እንደሚያስደንቅ ይግለጹ...')}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {getLabel('Description (Amharic)', 'መግለጫ (አማርኛ)')}
            </label>
            <textarea
              className="w-full p-3 border border-border rounded-lg bg-surface text-text-primary placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary disabled:opacity-50 disabled:cursor-not-allowed"
              rows={4}
              value={formData?.farmDescriptionAm}
              onChange={(e) => handleInputChange('farmDescriptionAm', e?.target?.value)}
              disabled={!isEditing}
              placeholder={getLabel('እርሻዎን፣ ታሪኩን እና ምን እንደሚያስደንቅ ይግለጹ...', 'Describe your farm, its history, and what makes it special...')}
            />
          </div>
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

      {/* Farm Characteristics */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {getLabel('Farm Characteristics', 'የእርሻ ባህሪያት')}
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Select
            label={getLabel('Irrigation Type', 'የማጠራቀሚያ አይነት')}
            options={irrigationTypeOptions?.map(type => ({
              value: type?.value,
              label: getOptionLabel(type)
            }))}
            value={formData?.irrigationType}
            onChange={(value) => handleInputChange('irrigationType', value)}
            disabled={!isEditing}
          />

          <Select
            label={getLabel('Soil Type', 'የአፈር አይነት')}
            options={soilTypeOptions?.map(type => ({
              value: type?.value,
              label: getOptionLabel(type)
            }))}
            value={formData?.soilType}
            onChange={(value) => handleInputChange('soilType', value)}
            disabled={!isEditing}
          />
        </div>
      </div>

      {/* Specializations */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {getLabel('Specializations', 'ልዩ ችሎታዎች')}
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {specializationOptions?.map((spec) => (
            <Checkbox
              key={spec?.value}
              label={getOptionLabel(spec)}
              checked={formData?.specializations?.includes(spec?.value)}
              onChange={(e) => handleArrayChange('specializations', spec?.value, e?.target?.checked)}
              disabled={!isEditing}
            />
          ))}
        </div>
      </div>

      {/* Equipment */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {getLabel('Farm Equipment', 'የእርሻ መሳሪያዎች')}
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {equipmentOptions?.map((equipment) => (
            <Checkbox
              key={equipment?.value}
              label={getOptionLabel(equipment)}
              checked={formData?.equipment?.includes(equipment?.value)}
              onChange={(e) => handleArrayChange('equipment', equipment?.value, e?.target?.checked)}
              disabled={!isEditing}
            />
          ))}
        </div>
      </div>

      {/* Certifications */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {getLabel('Certifications & Standards', 'ማረጋገጫዎች እና ደረጃዎች')}
        </h3>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="organic-certified"
              checked={formData?.organicCertified}
              onChange={(e) => handleInputChange('organicCertified', e?.target?.checked)}
              disabled={!isEditing}
              className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="organic-certified" className="text-sm font-medium text-text-primary">
              {getLabel('Organic Certified', 'ኦርጋኒክ የተረጋገጠ')}
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="fair-trade-certified"
              checked={formData?.fairTradeCertified}
              onChange={(e) => handleInputChange('fairTradeCertified', e?.target?.checked)}
              disabled={!isEditing}
              className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="fair-trade-certified" className="text-sm font-medium text-text-primary">
              {getLabel('Fair Trade Certified', 'ፌር ትሬድ የተረጋገጠ')}
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="gmo-free"
              checked={formData?.gmoFree}
              onChange={(e) => handleInputChange('gmoFree', e?.target?.checked)}
              disabled={!isEditing}
              className="w-4 h-4 text-primary bg-surface border-border rounded focus:ring-primary focus:ring-2"
            />
            <label htmlFor="gmo-free" className="text-sm font-medium text-text-primary">
              {getLabel('GMO Free', 'GMO ነፃ')}
            </label>
          </div>
        </div>
      </div>

      {/* Sustainability Practices */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {getLabel('Sustainability Practices', 'የተቀጣጣይነት ልምዶች')}
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
          {sustainabilityOptions?.map((practice) => (
            <Checkbox
              key={practice?.value}
              label={getOptionLabel(practice)}
              checked={formData?.sustainabilityPractices?.includes(practice?.value)}
              onChange={(e) => handleArrayChange('sustainabilityPractices', practice?.value, e?.target?.checked)}
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
              onClick={handleSave}
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
