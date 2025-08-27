import React, { useState } from 'react';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const AccountInformation = ({ userRole, currentLanguage }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: userRole === 'farmer' ? 'Abebe' : 'Sarah',
    lastName: userRole === 'farmer' ? 'Kebede' : 'Johnson',
    firstNameAm: userRole === 'farmer' ? 'አበበ' : 'ሳራ',
    lastNameAm: userRole === 'farmer' ? 'ከበደ' : 'ጆንሰን',
    email: userRole === 'farmer' ? 'abebe.kebede@gmail.com' : 'sarah.johnson@email.com',
    phone: userRole === 'farmer' ? '+251911234567' : '+251922345678',
    region: userRole === 'farmer' ? 'oromia' : 'addis-ababa',
    woreda: userRole === 'farmer' ? 'adama' : 'bole',
    language: currentLanguage
  });

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
      { value: 'bole', label: 'Bole Sub-city', labelAm: 'ቦሌ ክፍለ ከተማ' },
      { value: 'kirkos', label: 'Kirkos Sub-city', labelAm: 'ቂርቆስ ክፍለ ከተማ' },
      { value: 'yeka', label: 'Yeka Sub-city', labelAm: 'የካ ክፍለ ከተማ' },
      { value: 'nifas-silk', label: 'Nifas Silk Sub-city', labelAm: 'ንፋስ ስልክ ክፍለ ከተማ' }
    ],
    'oromia': [
      { value: 'adama', label: 'Adama Woreda', labelAm: 'አዳማ ወረዳ' },
      { value: 'bishoftu', label: 'Bishoftu Woreda', labelAm: 'ብሾፍቱ ወረዳ' },
      { value: 'sebeta', label: 'Sebeta Woreda', labelAm: 'ሰበታ ወረዳ' },
      { value: 'jimma', label: 'Jimma Woreda', labelAm: 'ጅማ ወረዳ' }
    ],
    'amhara': [
      { value: 'bahir-dar', label: 'Bahir Dar Woreda', labelAm: 'ባሕር ዳር ወረዳ' },
      { value: 'gondar', label: 'Gondar Woreda', labelAm: 'ጎንደር ወረዳ' },
      { value: 'dessie', label: 'Dessie Woreda', labelAm: 'ደሴ ወረዳ' }
    ]
  };

  const languageOptions = [
    { value: 'en', label: 'English', labelAm: 'እንግሊዝኛ' },
    { value: 'am', label: 'Amharic', labelAm: 'አማርኛ' }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = () => {
    // Save logic here
    setIsEditing(false);
  };

  const handleCancel = () => {
    // Reset form data
    setIsEditing(false);
  };

  const getLabel = (text, textAm) => {
    return currentLanguage === 'am' ? textAm : text;
  };

  const getOptionLabel = (option) => {
    return currentLanguage === 'am' && option?.labelAm ? option?.labelAm : option?.label;
  };

  return (
    <div className="bg-surface border border-border rounded-xl p-6 shadow-warm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-text-primary">
          {getLabel('Account Information', 'የመለያ መረጃ')}
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
              onClick={handleCancel}
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
      <div className="space-y-6">
        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {getLabel('Personal Information', 'የግል መረጃ')}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              label={getLabel('First Name', 'ስም')}
              type="text"
              value={formData?.firstName}
              onChange={(e) => handleInputChange('firstName', e?.target?.value)}
              disabled={!isEditing}
              required
            />
            
            <Input
              label={getLabel('Last Name', 'የአባት ስም')}
              type="text"
              value={formData?.lastName}
              onChange={(e) => handleInputChange('lastName', e?.target?.value)}
              disabled={!isEditing}
              required
            />

            {currentLanguage === 'am' && (
              <>
                <Input
                  label="ስም (አማርኛ)"
                  type="text"
                  value={formData?.firstNameAm}
                  onChange={(e) => handleInputChange('firstNameAm', e?.target?.value)}
                  disabled={!isEditing}
                />
                
                <Input
                  label="የአባት ስም (አማርኛ)"
                  type="text"
                  value={formData?.lastNameAm}
                  onChange={(e) => handleInputChange('lastNameAm', e?.target?.value)}
                  disabled={!isEditing}
                />
              </>
            )}
          </div>
        </div>

        {/* Contact Information */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {getLabel('Contact Information', 'የመገናኛ መረጃ')}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Input
              label={getLabel('Email Address', 'ኢሜይል አድራሻ')}
              type="email"
              value={formData?.email}
              onChange={(e) => handleInputChange('email', e?.target?.value)}
              disabled={!isEditing}
              required
            />
            
            <Input
              label={getLabel('Phone Number', 'ስልክ ቁጥር')}
              type="tel"
              value={formData?.phone}
              onChange={(e) => handleInputChange('phone', e?.target?.value)}
              disabled={!isEditing}
              required
            />
          </div>
        </div>

        {/* Location Information */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {getLabel('Location Information', 'የአካባቢ መረጃ')}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Select
              label={getLabel('Region', 'ክልል')}
              options={regions?.map(region => ({
                value: region?.value,
                label: getOptionLabel(region)
              }))}
              value={formData?.region}
              onChange={(value) => handleInputChange('region', value)}
              disabled={!isEditing}
              required
            />
            
            <Select
              label={getLabel('Woreda/Sub-city', 'ወረዳ/ክፍለ ከተማ')}
              options={(woredas?.[formData?.region] || [])?.map(woreda => ({
                value: woreda?.value,
                label: getOptionLabel(woreda)
              }))}
              value={formData?.woreda}
              onChange={(value) => handleInputChange('woreda', value)}
              disabled={!isEditing || !formData?.region}
              required
            />
          </div>
        </div>

        {/* Preferences */}
        <div>
          <h3 className="text-lg font-semibold text-text-primary mb-4">
            {getLabel('Preferences', 'ምርጫዎች')}
          </h3>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Select
              label={getLabel('Preferred Language', 'የተመረጠ ቋንቋ')}
              options={languageOptions?.map(lang => ({
                value: lang?.value,
                label: getOptionLabel(lang)
              }))}
              value={formData?.language}
              onChange={(value) => handleInputChange('language', value)}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Account Status */}
        {!isEditing && (
          <div className="pt-4 border-t border-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-success rounded-full"></div>
                <span className="text-sm text-text-secondary">
                  {getLabel('Account Status: Active', 'የመለያ ሁኔታ፡ ንቁ')}
                </span>
              </div>
              <span className="text-sm text-text-secondary">
                {getLabel('Last updated: Today', 'የመጨረሻ ዝማኔ፡ ዛሬ')}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccountInformation;