import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
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
import { useLanguage } from '../../hooks/useLanguage.jsx';
import DebugInfo from '../../components/DebugInfo.jsx';

const AddListing = () => {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  // Remove sidebar state
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [userName, setUserName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingListingId, setEditingListingId] = useState(null);
  const [showDebug, setShowDebug] = useState(false);

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

    setCurrentLanguage(language || 'en');

    // Check for draft mode, edit mode, or duplicate mode
    const draftMode = searchParams.get('draft') === 'true';
    const editId = searchParams.get('edit');
    const duplicateId = searchParams.get('duplicate');
    
    if (draftMode) {
      setIsDraft(true);
    }
    
    if (editId) {
      setIsEditMode(true);
      setEditingListingId(editId);
      loadListingForEdit(editId);
    }
    
    if (duplicateId) {
      loadListingForDuplicate(duplicateId);
    }
  }, [navigate, searchParams]);

  useEffect(() => {
    if (language && language !== currentLanguage) setCurrentLanguage(language);
  }, [language]);

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    navigate('/authentication-login-register');
  };

  const loadListingForEdit = async (listingId) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      
      // Check if user is authenticated (for navigation purposes)
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (!isAuthenticated) {
        console.error('User not authenticated');
        navigate('/authentication-login-register');
        return;
      }

      // Call the public listings endpoint (no authentication required)
      const response = await axios.get(`${API_BASE}/listings/${listingId}`);

      if (response.data) {
        const listing = response.data;
        setFormData({
          productName: listing.name || listing.title || '',
          produceType: listing.category || listing.crop || '',
          description: listing.description || '',
          qualityGrade: 'premium', // Default value
          pricePerKg: listing.pricePerKg || listing.price_per_unit || '',
          availableQuantity: listing.availableQuantity || listing.quantity || '',
          quantityUnit: listing.unit || 'kg',
          harvestDate: '',
          images: listing.image ? [listing.image] : [],
          region: listing.location || listing.region || '',
          woreda: listing.woreda || '',
          specificLocation: ''
        });
      }
    } catch (error) {
      console.error('Failed to load listing for edit:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to load listing for editing: ${error.response?.data?.error || error.message}`);
    }
  };

  const loadListingForDuplicate = async (listingId) => {
    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      
      // Check if user is authenticated (for navigation purposes)
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (!isAuthenticated) {
        console.error('User not authenticated');
        navigate('/authentication-login-register');
        return;
      }

      // Call the public listings endpoint (no authentication required)
      const response = await axios.get(`${API_BASE}/listings/${listingId}`);

      if (response.data) {
        const listing = response.data;
        // Pre-fill form with listing data for duplication
        setFormData({
          productName: `${listing.name || listing.title || ''} (Copy)`,
          produceType: listing.category || listing.crop || '',
          description: listing.description || '',
          qualityGrade: 'premium', // Default value
          pricePerKg: listing.pricePerKg || listing.price_per_unit || '',
          availableQuantity: listing.availableQuantity || listing.quantity || '',
          quantityUnit: listing.unit || 'kg',
          harvestDate: '',
          images: listing.image ? [listing.image] : [],
          region: listing.location || listing.region || '',
          woreda: listing.woreda || '',
          specificLocation: ''
        });
        
        // Show success message
        if (currentLanguage === 'am') {
          alert('የዝርዝር ውሂብ ተጭኗል። አሁን አዲስ ዝርዝር መፍጠር ይችላሉ።');
        } else {
          alert('Listing data loaded successfully. You can now create a new listing.');
        }
      }
    } catch (error) {
      console.error('Failed to load listing for duplication:', error);
      console.error('Error details:', error.response?.data || error.message);
      alert(`Failed to load listing for duplication: ${error.response?.data?.error || error.message}`);
    }
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
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      
      // Get auth token from localStorage (works for both Firebase and dev auth)
      const authToken = localStorage.getItem('authToken');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (!isAuthenticated) {
        console.error('User not authenticated');
        navigate('/authentication-login-register');
        return;
      }

      // Try Firebase auth first, fallback to dev token
      let authHeader = '';
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const idToken = await currentUser.getIdToken();
          authHeader = `Bearer ${idToken}`;
        } else if (authToken) {
          authHeader = `Bearer ${authToken}`;
        } else {
          throw new Error('No authentication token available');
        }
      } catch (authError) {
        console.error('Auth error:', authError);
        if (authToken) {
          authHeader = `Bearer ${authToken}`;
        } else {
          throw new Error('No authentication token available');
        }
      }

      // Prepare the listing data for draft
      const listingData = {
        name: formData.productName?.trim() || formData.produceType || 'Draft Listing',
        nameAm: formData.productNameAm?.trim() || undefined,
        description: formData.description?.trim() || 'Draft description',
        category: formData.produceType || 'Other',
        pricePerKg: Number(formData.pricePerKg) || 0,
        availableQuantity: Number(formData.availableQuantity) || 0,
        location: formData.region || 'Addis Ababa',
        status: 'draft',
        image: formData.images && formData.images.length > 0 ? formData.images[0] : undefined
      };

      // Basic validation for draft - ensure we have at least a name
      if (!listingData.name || listingData.name.trim() === '') {
        alert(currentLanguage === 'en' 
          ? 'Please enter a product name before saving as draft.' 
          : 'እባክዎ እንደ ረቂቅ ከመቀመጥ በፊት የምርት ስም ያስገቡ።');
        return;
      }

      // Debug logging
      console.log('Saving draft with data:', listingData);
      console.log('API endpoint:', `${API_BASE}/farmers/listings`);
      console.log('Auth header present:', !!authHeader);
      console.log('Auth header value:', authHeader ? authHeader.substring(0, 20) + '...' : 'None');
      console.log('User authenticated:', isAuthenticated);
      console.log('User role:', userRole);

      let response;
      if (isEditMode && editingListingId) {
        // Update existing listing
        console.log('Updating existing listing:', editingListingId);
        response = await axios.put(`${API_BASE}/farmers/listings/${editingListingId}`, listingData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader
          }
        });
      } else {
        // Create new draft
        console.log('Creating new draft listing');
        response = await axios.post(`${API_BASE}/farmers/listings`, listingData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader
          }
        });
      }

      if (response.status === 200 || response.status === 201) {
        const listingId = response.data?.id;
        
        // If image URLs exist, attach all images to the draft
        if (listingId && Array.isArray(formData.images) && formData.images.length > 0) {
          console.log('Attaching images to draft listing:', formData.images);
          
          for (let i = 0; i < formData.images.length; i++) {
            try {
              const imageUrl = formData.images[i];
              console.log(`Attaching image ${i + 1}/${formData.images.length} to draft:`, imageUrl);
              
              const attachResponse = await axios.post(`${API_BASE}/farmers/listings/${listingId}/images`, 
                { url: imageUrl }, 
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: authHeader
                  }
                }
              );
              
              console.log(`Draft image ${i + 1} attached successfully:`, attachResponse.data);
            } catch (attachErr) {
              console.error(`Failed to attach image ${i + 1} to draft:`, attachErr);
              // Continue with other images even if one fails
            }
          }
        }
        
        alert(currentLanguage === 'en' ? 'Draft saved successfully!' : 'ረቂቁ በተሳካ ሁኔታ ተቀምጧል!');
        navigate('/farmer-my-listings');
      }
    } catch (error) {
      console.error('Failed to save draft:', error);
      
      // Provide more specific error messages
      let errorMessage = currentLanguage === 'en' ? 'Failed to save draft. Please try again.' : 'ረቂቁ ማስቀመጥ አልተሳካም። እባክዎን እንደገና ይሞክሩ።';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const serverMessage = error.response.data?.error || error.response.data?.message;
        
        console.error('Draft save error details:', {
          status,
          data: error.response.data,
          message: serverMessage
        });
        
        if (status === 401) {
          errorMessage = currentLanguage === 'en' ? 'Authentication failed. Please log in again.' : 'ማረጋገጫ አልተሳካም። እባክዎ እንደገና ይግቡ።';
        } else if (status === 400) {
          errorMessage = currentLanguage === 'en' 
            ? `Invalid data: ${serverMessage || 'Please check your input and try again.'}`
            : `የማይሰራ ውሂብ: ${serverMessage || 'እባክዎ የገባችሁትን ያረጋግጡ እና እንደገና ይሞክሩ።'}`;
        } else if (status === 500) {
          errorMessage = currentLanguage === 'en' ? 'Server error. Please try again later.' : 'የሰርቨር ስህተት። እባክዎ ቆይተው እንደገና ይሞክሩ።';
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      } else if (error.request) {
        // Network error
        console.error('Draft save network error:', error.request);
        errorMessage = currentLanguage === 'en' ? 'Network error. Please check your connection and try again.' : 'የኔትዎርክ ስህተት። እባክዎ ግንኙነትዎን ያረጋግጡ እና እንደገና ይሞክሩ።';
      } else {
        // Other error
        console.error('Draft save other error:', error.message);
        errorMessage = currentLanguage === 'en' 
          ? `Error: ${error.message}` 
          : `ስህተት: ${error.message}`;
      }
      
      alert(errorMessage);
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
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";
      
      // Get auth token from localStorage (works for both Firebase and dev auth)
      const authToken = localStorage.getItem('authToken');
      const isAuthenticated = localStorage.getItem('isAuthenticated') === 'true';
      
      if (!isAuthenticated) {
        console.error('User not authenticated');
        navigate('/authentication-login-register');
        return;
      }

      // Try Firebase auth first, fallback to dev token
      let authHeader = '';
      try {
        const currentUser = auth.currentUser;
        if (currentUser) {
          const idToken = await currentUser.getIdToken();
          authHeader = `Bearer ${idToken}`;
        } else if (authToken) {
          authHeader = `Bearer ${authToken}`;
        } else {
          throw new Error('No authentication token available');
        }
      } catch (authError) {
        console.error('Auth error:', authError);
        if (authToken) {
          authHeader = `Bearer ${authToken}`;
        } else {
          throw new Error('No authentication token available');
        }
      }

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

      // Debug logging for publish
      console.log('Publishing listing with data:', listingData);
      console.log('API endpoint:', `${API_BASE}/farmers/listings`);
      console.log('Auth header present:', !!authHeader);
      console.log('Auth header value:', authHeader ? authHeader.substring(0, 20) + '...' : 'None');
      console.log('User authenticated:', isAuthenticated);
      console.log('User role:', userRole);

      let response;
      let listingId;
      
      if (isEditMode && editingListingId) {
        // Update existing listing
        response = await axios.put(`${API_BASE}/farmers/listings/${editingListingId}`, listingData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader
          }
        });
        listingId = editingListingId;
      } else {
        // Create new listing
        response = await axios.post(`${API_BASE}/farmers/listings`, listingData, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: authHeader
          }
        });
        listingId = response.data?.id;
      }

      if (response.status === 200 || response.status === 201 || response.data?.id) {

        // If image URLs exist, attach all images
        if (listingId && Array.isArray(formData.images) && formData.images.length > 0) {
          console.log('=== IMAGE ATTACHMENT DEBUG ===');
          console.log('Listing ID:', listingId);
          console.log('Images to attach:', formData.images);
          console.log('Number of images:', formData.images.length);
          console.log('API Base URL:', API_BASE);
          console.log('Auth header present:', !!authHeader);
          
          let successfulAttachments = 0;
          let failedAttachments = 0;
          
          for (let i = 0; i < formData.images.length; i++) {
            try {
              const imageUrl = formData.images[i];
              console.log(`\n--- Attaching image ${i + 1}/${formData.images.length} ---`);
              console.log('Image URL:', imageUrl);
              console.log('Endpoint:', `${API_BASE}/farmers/listings/${listingId}/images`);
              
              const attachResponse = await axios.post(`${API_BASE}/farmers/listings/${listingId}/images`, 
                { url: imageUrl }, 
                {
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: authHeader
                  }
                }
              );
              
              console.log(`✅ Image ${i + 1} attached successfully:`, attachResponse.data);
              successfulAttachments++;
            } catch (attachErr) {
              console.error(`❌ Failed to attach image ${i + 1}:`, attachErr);
              console.error('Image attach error details:', {
                status: attachErr.response?.status,
                data: attachErr.response?.data,
                message: attachErr.message,
                url: attachErr.config?.url,
                method: attachErr.config?.method
              });
              failedAttachments++;
              // Continue with other images even if one fails
            }
          }
          
          console.log(`=== IMAGE ATTACHMENT SUMMARY ===`);
          console.log(`Successful: ${successfulAttachments}/${formData.images.length}`);
          console.log(`Failed: ${failedAttachments}/${formData.images.length}`);
          console.log('=== END IMAGE ATTACHMENT DEBUG ===\n');
          
          // Show user feedback about image attachment
          if (failedAttachments > 0) {
            console.warn(`Warning: ${failedAttachments} images failed to attach. Listing was created but some images may not be visible.`);
          }
        } else {
          console.log('No images to attach:', {
            listingId,
            hasImages: Array.isArray(formData.images),
            imageCount: formData.images?.length || 0,
            images: formData.images
          });
        }

        alert(
          currentLanguage === 'en'
            ? (isEditMode ? 'Listing updated successfully!' : 'Listing published successfully!')
            : (isEditMode ? 'ዝርዝሩ በተሳካ ሁኔታ ተሻሽሏል!' : 'ዝርዝሩ በተሳካ ሁኔታ ታትሟል!')
        );
        navigate('/farmer-my-listings');
      }
    } catch (error) {
      console.error('Failed to publish listing:', error);
      
      // Provide more specific error messages
      let errorMessage = currentLanguage === 'en' ? 'Failed to publish listing. Please try again.' : 'ዝርዝሩ ማተም አልተሳካም። እባክዎን እንደገና ይሞክሩ።';
      
      if (error.response) {
        // Server responded with error status
        const status = error.response.status;
        const serverMessage = error.response.data?.error || error.response.data?.message;
        
        console.error('Server error details:', {
          status,
          data: error.response.data,
          message: serverMessage
        });
        
        if (status === 401) {
          errorMessage = currentLanguage === 'en' ? 'Authentication failed. Please log in again.' : 'ማረጋገጫ አልተሳካም። እባክዎ እንደገና ይግቡ።';
        } else if (status === 400) {
          errorMessage = currentLanguage === 'en' 
            ? `Invalid data: ${serverMessage || 'Please check your input and try again.'}`
            : `የማይሰራ ውሂብ: ${serverMessage || 'እባክዎ የገባችሁትን ያረጋግጡ እና እንደገና ይሞክሩ።'}`;
        } else if (status === 500) {
          errorMessage = currentLanguage === 'en' ? 'Server error. Please try again later.' : 'የሰርቨር ስህተት። እባክዎ ቆይተው እንደገና ይሞክሩ።';
        } else if (serverMessage) {
          errorMessage = serverMessage;
        }
      } else if (error.request) {
        // Network error
        console.error('Network error:', error.request);
        errorMessage = currentLanguage === 'en' ? 'Network error. Please check your connection and try again.' : 'የኔትዎርክ ስህተት። እባክዎ ግንኙነትዎን ያረጋግጡ እና እንደገና ይሞክሩ።';
      } else {
        // Other error
        console.error('Other error:', error.message);
        errorMessage = currentLanguage === 'en' 
          ? `Error: ${error.message}` 
          : `ስህተት: ${error.message}`;
      }
      
      alert(errorMessage);
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
    <AuthenticatedLayout>
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
                {currentLanguage === 'en' 
                  ? (isEditMode ? 'Edit Listing' : 'Add Listing')
                  : (isEditMode ? 'ዝርዝር አርትዖት' : 'ዝርዝር ጨምር')
                }
              </span>
            </nav>
          </div>

          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="mb-2 text-3xl font-bold font-heading text-foreground">
                  {currentLanguage === 'en' 
                    ? (isEditMode ? 'Edit Listing' : 'Add New Listing')
                    : (isEditMode ? 'ዝርዝር አርትዖት' : 'አዲስ ዝርዝር ጨምር')
                  }
                </h1>
                <p className="font-body text-muted-foreground">
                  {currentLanguage === 'en' 
                    ? (isEditMode 
                        ? 'Update your produce listing information' 
                        : 'Create a new produce listing for potential buyers')
                    : (isEditMode 
                        ? 'የምርት ዝርዝር መረጃዎን ያዘምኑ' 
                        : 'ለሚፈልጉ ገዢዎች አዲስ የምርት ዝርዝር ይፍጠሩ')
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
                      {currentLanguage === 'en' 
                        ? (isEditMode ? 'Update Listing' : 'Publish Listing')
                        : (isEditMode ? 'ዝርዝር አዘምን' : 'ዝርዝር አተም')
                      }
                    </>
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
        
        {/* Debug Info */}
        <DebugInfo isVisible={showDebug} />
        
        {/* Debug Toggle Button */}
        <button
          onClick={() => setShowDebug(!showDebug)}
          className="fixed bottom-4 left-4 px-3 py-2 bg-gray-800 text-white text-xs rounded-lg z-50"
        >
          {showDebug ? 'Hide Debug' : 'Show Debug'}
        </button>
    </AuthenticatedLayout>
  );
};

export default AddListing;
