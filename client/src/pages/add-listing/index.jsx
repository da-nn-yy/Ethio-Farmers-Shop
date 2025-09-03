import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/ui/GlobalHeader';
// Remove sidebar and breadcrumb - using consistent design
import ProductDetailsSection from './components/ProductDetailsSection';
import PricingQuantitySection from './components/PricingQuantitySection';
import ImagesSection from './components/ImagesSection';
import LocationSection from './components/LocationSection';
import ProgressIndicator from './components/ProgressIndicator';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import axios from 'axios';
import { auth } from '../../firebase';

const AddListing = () => {
  const [currentLanguage, setCurrentLanguage] = useState('en');
  // Remove sidebar state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    // Product Details
    productName: '',
    produceType: '',
    description: '',
    qualityGrade: '',

    // Pricing & Quantity
    pricePerKg: '',
    availableQuantity: '',
    quantityUnit: 'kg',
    harvestDate: '',

    // Images
    images: [],

    // Location
    region: '',
    woreda: '',
    specificLocation: ''
  });

  const [formErrors, setFormErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4;

  const navigate = useNavigate();

  useEffect(() => {
    // Check authentication
    const authStatus = localStorage.getItem('isAuthenticated') === 'true';
    const role = localStorage.getItem('userRole') || '';
    const name = localStorage.getItem('userName') || 'User';

    setIsAuthenticated(authStatus);
    setUserRole(role);
    setUserName(name);

    // If not authenticated or not a farmer, redirect
    if (!authStatus || role !== 'farmer') {
      navigate('/authentication-login-register');
      return;
    }

    const savedLanguage = localStorage.getItem('ethiofarm-language') || 'en';
    setCurrentLanguage(savedLanguage);

    // Listen for language changes
    const handleStorageChange = (e) => {
      if (e?.key === 'ethiofarm-language') {
        setCurrentLanguage(e?.newValue || 'en');
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/authentication-login-register');
  };

  const updateFormData = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when field is updated
    if (formErrors?.[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateCurrentStep = () => {
    const errors = {};

    switch (currentStep) {
      case 1: // Product Details
        if (!formData?.productName?.trim()) {
          errors.productName = currentLanguage === 'en' ? 'Please enter a product name' : 'እባክዎን የምርት ስም ያስገቡ';
        }
        if (!formData?.produceType) {
          errors.produceType = currentLanguage === 'en' ?'Please select a produce type' :'እባክዎን የምርት አይነት ይምረጡ';
        }
        if (!formData?.description || formData?.description?.length < 10) {
          errors.description = currentLanguage === 'en' ?'Description must be at least 10 characters' :'መግለጫው ቢያንስ 10 ቁምፊ መሆን አለበት';
        }
        if (!formData?.qualityGrade) {
          errors.qualityGrade = currentLanguage === 'en' ?'Please select quality grade' :'እባክዎን የጥራት ደረጃ ይምረጡ';
        }
        break;

      case 2: // Pricing & Quantity
        if (!formData?.pricePerKg || formData?.pricePerKg <= 0) {
          errors.pricePerKg = currentLanguage === 'en' ?'Please enter a valid price' :'እባክዎን ትክክለኛ ዋጋ ያስገቡ';
        }
        if (!formData?.availableQuantity || formData?.availableQuantity <= 0) {
          errors.availableQuantity = currentLanguage === 'en' ?'Please enter available quantity' :'እባክዎን ያለ መጠን ያስገቡ';
        }
        if (!formData?.harvestDate) {
          errors.harvestDate = currentLanguage === 'en' ?'Please select harvest date' :'እባክዎን የመሰብሰቢያ ቀን ይምረጡ';
        }
        break;

      case 3: // Images
        if (formData?.images?.length === 0) {
          errors.images = currentLanguage === 'en' ?'Please add at least one image' :'እባክዎን ቢያንስ አንድ ምስል ያክሉ';
        }
        break;

      case 4: // Location
        if (!formData?.region) {
          errors.region = currentLanguage === 'en' ?'Please select region' :'እባክዎን ክልል ይምረጡ';
        }
        if (!formData?.woreda) {
          errors.woreda = currentLanguage === 'en' ?'Please select woreda' :'እባክዎን ወረዳ ይምረጡ';
        }
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors)?.length === 0;
  };

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = async () => {
    setIsSubmitting(true);
    setIsDraft(true);

    try {
      // Mock API call to save draft
      await new Promise(resolve => setTimeout(resolve, 1500));

      alert(currentLanguage === 'en' ?'Draft saved successfully!' :'ረቂቁ በተሳካ ሁኔታ ተቀምጧል!'
      );

      navigate('/dashboard-farmer-home');
    } catch (error) {
      alert(currentLanguage === 'en' ?'Failed to save draft. Please try again.' :'ረቂቁ ማስቀመጥ አልተሳካም። እባክዎን እንደገና ይሞክሩ።'
      );
    } finally {
      setIsSubmitting(false);
      setIsDraft(false);
    }
  };

  const handlePublish = async () => {
    if (!validateCurrentStep()) {
      return;
    }

    setIsSubmitting(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
      const currentUser = auth.currentUser;
      if (!currentUser) {
        navigate('/authentication-login-register');
        return;
      }
      const idToken = await currentUser.getIdToken();

      // Prepare the listing data without image first
      const listingData = {
        name: formData.productName?.trim() || formData.produceType,
        nameAm: undefined,
        description: formData.description,
        category: formData.produceType,
        pricePerKg: Number(formData.pricePerKg),
        availableQuantity: Number(formData.availableQuantity),
        location: formData.region
      };

      const response = await axios.post(`${API_BASE}/farmer/listings`, listingData, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${idToken}`
        }
      });

      if (response.status === 201 || response.data?.id) {
        const createdId = response.data?.id;

        // If image URLs exist, attach the first as primary
        if (createdId && Array.isArray(formData.images) && formData.images.length > 0) {
          try {
            await axios.post(`${API_BASE}/farmer/listings/${createdId}/images`, { url: formData.images[0] }, {
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${idToken}`
              }
            });
          } catch (attachErr) {
            console.warn('Image attach failed, continuing:', attachErr);
          }
        }

        alert(
          currentLanguage === 'en'
            ? 'Listing published successfully!'
            : 'ዝርዝሩ በተሳካ ሁኔታ ታትሟል!'
        );
        navigate('/dashboard-farmer-home');
      }
    } catch (error) {
      console.error('Failed to publish listing:', error);
      alert(currentLanguage === 'en' ?'Failed to publish listing. Please try again.' :'ዝርዝሩ ማተም አልተሳካም። እባክዎን እንደገና ይሞክሩ።'
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const calculateCompletionPercentage = () => {
    const fields = [
      formData?.produceType,
      formData?.description,
      formData?.qualityGrade,
      formData?.pricePerKg,
      formData?.availableQuantity,
      formData?.harvestDate,
      formData?.images?.length > 0,
      formData?.region,
      formData?.woreda
    ];

    const filledFields = fields?.filter(Boolean)?.length;
    return Math.round((filledFields / fields?.length) * 100);
  };

  const renderCurrentSection = () => {
    switch (currentStep) {
      case 1:
        return (
          <ProductDetailsSection
            formData={formData}
            formErrors={formErrors}
            onUpdate={updateFormData}
            currentLanguage={currentLanguage}
          />
        );
      case 2:
        return (
          <PricingQuantitySection
            formData={formData}
            formErrors={formErrors}
            onUpdate={updateFormData}
            currentLanguage={currentLanguage}
          />
        );
      case 3:
        return (
          <ImagesSection
            formData={formData}
            formErrors={formErrors}
            onUpdate={updateFormData}
            currentLanguage={currentLanguage}
          />
        );
      case 4:
        return (
          <LocationSection
            formData={formData}
            formErrors={formErrors}
            onUpdate={updateFormData}
            currentLanguage={currentLanguage}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader
        userRole={userRole}
        isAuthenticated={isAuthenticated}
        userName={userName}
        onLogout={handleLogout}
      />
      <main className="pt-16 pb-8">
        <div className="max-w-4xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
          {/* Simple navigation breadcrumb */}
          <div className="mb-6">
            <nav className="flex items-center space-x-2 text-sm text-muted-foreground">
              <button
                onClick={() => navigate('/dashboard-farmer-home')}
                className="transition-colors hover:text-foreground"
              >
                {currentLanguage === 'en' ? 'Dashboard' : 'ዳሽቦርድ'}
              </button>
              <span>/</span>
              <span className="text-foreground">
                {currentLanguage === 'en' ? 'Add Listing' : 'ዝርዝር ጨምር'}
              </span>
            </nav>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="mb-2 text-3xl font-bold font-heading text-foreground">
                  {currentLanguage === 'en' ? 'Add New Listing' : 'አዲስ ዝርዝር ጨምር'}
                </h1>
                <p className="font-body text-muted-foreground">
                  {currentLanguage === 'en' ?'Create a new produce listing for potential buyers' :'ለሚፈልጉ ገዢዎች አዲስ የምርት ዝርዝር ይፍጠሩ'
                  }
                </p>
              </div>

              <div className="items-center hidden space-x-2 sm:flex">
                <div className="flex items-center px-3 py-2 space-x-2 rounded-lg bg-primary/10">
                  <div className="w-2 h-2 rounded-full bg-primary"></div>
                  <span className="text-sm font-medium font-caption text-primary">
                    {calculateCompletionPercentage()}% {currentLanguage === 'en' ? 'Complete' : 'ተጠናቋል'}
                  </span>
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <ProgressIndicator
              currentStep={currentStep}
              totalSteps={totalSteps}
              currentLanguage={currentLanguage}
            />
          </div>

          {/* Form Content */}
          <div className="p-6 mb-8 border rounded-lg bg-card border-border">
            {renderCurrentSection()}
          </div>

          {/* Form Actions */}
          <div className="flex flex-col items-center justify-between gap-4 p-6 border rounded-lg sm:flex-row bg-card border-border">
            <div className="flex items-center gap-3">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  iconName="ArrowLeft"
                  iconPosition="left"
                  disabled={isSubmitting}
                >
                  {currentLanguage === 'en' ? 'Previous' : 'ወደ ኋላ'}
                </Button>
              )}

              <Button
                variant="ghost"
                onClick={handleSaveDraft}
                iconName="Save"
                iconPosition="left"
                disabled={isSubmitting}
                className="text-muted-foreground hover:text-foreground"
              >
                {isSubmitting && isDraft ? (
                  <>
                    <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                    {currentLanguage === 'en' ? 'Saving...' : 'በማስቀመጥ ላይ...'}
                  </>
                ) : (
                  <>
                    {currentLanguage === 'en' ? 'Save as Draft' : 'እንደ ረቂቅ ማስቀመጥ'}
                  </>
                )}
              </Button>
            </div>

            <div className="flex items-center gap-3">
              {currentStep < totalSteps ? (
                <Button
                  variant="default"
                  onClick={handleNext}
                  iconName="ArrowRight"
                  iconPosition="right"
                >
                  {currentLanguage === 'en' ? 'Next' : 'ቀጣይ'}
                </Button>
              ) : (
                <Button
                  variant="default"
                  onClick={handlePublish}
                  iconName="Upload"
                  iconPosition="left"
                  disabled={isSubmitting}
                  className="bg-success hover:bg-success/90"
                >
                  {isSubmitting && !isDraft ? (
                    <>
                      <Icon name="Loader2" className="w-4 h-4 mr-2 animate-spin" />
                      {currentLanguage === 'en' ? 'Publishing...' : 'በማተም ላይ...'}
                    </>
                  ) : (
                    <>
                      {currentLanguage === 'en' ? 'Publish Listing' : 'ዝርዝር አተም'}
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default AddListing;
