import React, { useEffect, useState } from 'react';
import { userService } from '../../../services/apiService';

import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';
import { useAuth } from '../../../hooks/useAuth.jsx';

const AccountInformation = ({ userRole, currentLanguage, onProfileUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    region: '',
    woreda: '',
    language: currentLanguage
  });
  const { updateUser } = useAuth();

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const data = await userService.getMe();

        // Auto-populate from registration data
        const registrationData = {
          fullName: data.full_name || data.fullName || '',
          email: data.email || '',
          phone: data.phone || data.phoneNumber || '',
          region: data.region || '',
          woreda: data.woreda || '',
          language: data.language || currentLanguage
        };

        setFormData(prev => ({
          ...prev,
          ...registrationData
        }));

        // If this is a new user with incomplete profile, auto-enable editing
        const hasIncompleteProfile = !data.full_name || !data.phone || !data.region || !data.woreda;
        if (hasIncompleteProfile) {
          setIsEditing(true);
        }
      } catch (e) {
        console.error('Failed to load profile:', e);
        // Fallback to localStorage data if API fails
        const storedUser = localStorage.getItem('userData');
        if (storedUser) {
          try {
            const userData = JSON.parse(storedUser);
            setFormData(prev => ({
              ...prev,
              fullName: userData.full_name || userData.fullName || '',
              email: userData.email || '',
              phone: userData.phone || userData.phoneNumber || '',
              region: userData.region || '',
              woreda: userData.woreda || '',
              language: userData.language || currentLanguage
            }));
            setIsEditing(true); // Enable editing for new users
          } catch (parseError) {
            console.error('Failed to parse stored user data:', parseError);
          }
        }
      }
    };
    loadProfile();
  }, [currentLanguage]);

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

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const payload = {
        full_name: formData.fullName,
        phone: formData.phone,
        email: formData.email,
        region: formData.region,
        woreda: formData.woreda,
        language: formData.language
      };

      // Update via API
      const updatedUser = await userService.updateMe(payload);

      // Update local auth context with the complete updated user data
      try {
        updateUser && updateUser({
          full_name: formData.fullName,
          fullName: formData.fullName, // Ensure both formats are available
          phone: formData.phone,
          phoneNumber: formData.phone, // Ensure both formats are available
          email: formData.email,
          region: formData.region,
          woreda: formData.woreda,
          language: formData.language
        });
      } catch {}

      // Update parent component
      try {
        onProfileUpdated && onProfileUpdated({
          full_name: formData.fullName,
          fullName: formData.fullName, // Ensure both formats are available
          phone: formData.phone,
          phoneNumber: formData.phone, // Ensure both formats are available
          email: formData.email,
          region: formData.region,
          woreda: formData.woreda,
          language: formData.language
        });
      } catch {}

      // Update localStorage with complete user data
      const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
      const updatedUserData = {
        ...currentUser,
        ...payload,
        fullName: formData.fullName, // Ensure both formats are available
        phoneNumber: formData.phone, // Ensure both formats are available
      };
      localStorage.setItem('userData', JSON.stringify(updatedUserData));

      // Update language preference
      if (formData.language !== currentLanguage) {
        localStorage.setItem('language', formData.language);
        localStorage.setItem('currentLanguage', formData.language);
        // Trigger a page refresh to update language across the app
        window.location.reload();
      }

      setIsEditing(false);
      alert(currentLanguage === 'en' ? 'Profile updated successfully!' : 'መገለጫ በተሳካ ሁኔታ ተዘምኗል!');
    } catch (e) {
      console.error('Profile update error:', e);
      alert(currentLanguage === 'en' ? 'Failed to update profile. Please try again.' : 'መገለጫ ማዘመን አልተሳካም። እባክዎ እንደገና ይሞክሩ።');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form data to original values
    const loadProfile = async () => {
      try {
        const data = await userService.getMe();
        const registrationData = {
          fullName: data.full_name || data.fullName || '',
          email: data.email || '',
          phone: data.phone || data.phoneNumber || '',
          region: data.region || '',
          woreda: data.woreda || '',
          language: data.language || currentLanguage
        };
        setFormData(prev => ({
          ...prev,
          ...registrationData
        }));
      } catch (e) {
        console.error('Failed to reload profile:', e);
      }
    };
    loadProfile();
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
      {/* Welcome message for new users */}
      {isEditing && (!formData.fullName || !formData.phone || !formData.region || !formData.woreda) && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-bold">!</span>
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-medium text-blue-800">
                {getLabel('Complete Your Profile', 'መገለጫዎን ያጠናቅቁ')}
              </h3>
              <p className="mt-1 text-sm text-blue-700">
                {getLabel(
                  'Please complete your profile information to get the most out of Ke geberew. This helps other users find and connect with you.',
                  'ከ Ke geberew የተሻለ ጥቅም ለማግኘት የመገለጫ መረጃዎን ያጠናቅቁ። ይህ ሌሎች ተጠቃሚዎች እንዲያገኙዎት እና እንዲገናኙዎት ይረዳል።'
                )}
              </p>
            </div>
          </div>
        </div>
      )}

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
              iconName={isSaving ? "Loader2" : "Check"}
              iconPosition="left"
              disabled={isSaving}
            >
              {isSaving ? getLabel('Saving...', 'በመቀመጥ ላይ...') : getLabel('Save', 'አስቀምጥ')}
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
              label={getLabel('Full Name', 'ሙሉ ስም')}
              type="text"
              value={formData?.fullName}
              onChange={(e) => handleInputChange('fullName', e?.target?.value)}
              disabled={!isEditing}
              required
            />

            {/* Amharic name fields optional in future */}
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
