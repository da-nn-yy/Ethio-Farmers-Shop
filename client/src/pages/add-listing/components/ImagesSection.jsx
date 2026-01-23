import React, { useState } from 'react';
import StandardImageUpload from '../../../components/ui/StandardImageUpload.jsx';
import UploadedImagesGallery from '../../../components/ui/UploadedImagesGallery.jsx';

const ImagesSection = ({ formData, formErrors, onUpdate, currentLanguage }) => {
  const [showGallery, setShowGallery] = useState(false);

  const handleImagesChange = (newImages) => {
    onUpdate('images', newImages);
  };

  const handleSelectFromGallery = (image) => {
    const currentImages = formData.images || [];
    // Add image URL if not already in the list
    if (!currentImages.includes(image.url)) {
      const updatedImages = [...currentImages, image.url];
      onUpdate('images', updatedImages);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-foreground mb-4">
          {currentLanguage === 'en' ? 'Product Images' : 'የምርት ምስሎች'}
        </h2>
        <p className="text-muted-foreground mb-6">
          {currentLanguage === 'en'
            ? 'Upload high-quality images of your produce to attract buyers'
            : 'ገዢዎችን ለማስሳት የምርትዎን ከፍተኛ ጥራት ያላቸው ምስሎች ይጭኑ'}
        </p>
      </div>

      {/* Upload New Images */}
      <StandardImageUpload
        images={formData.images || []}
        onImagesChange={handleImagesChange}
        maxImages={10}
        currentLanguage={currentLanguage}
        showPreview={true}
        showTips={true}
      />

      {/* Toggle Gallery Button */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <p className="text-sm text-text-secondary">
          {currentLanguage === 'en'
            ? 'Or select from previously uploaded images'
            : 'ወይም ከቀድሞ የተጭኑ ምስሎች ይምረጡ'}
        </p>
        <button
          onClick={() => setShowGallery(!showGallery)}
          className="text-primary hover:text-primary-dark text-sm font-medium flex items-center space-x-2"
        >
          <span>
            {showGallery
              ? (currentLanguage === 'en' ? 'Hide Gallery' : 'ጋሌሪ ደብቅ')
              : (currentLanguage === 'en' ? 'Show Uploaded Images' : 'የተጭኑ ምስሎች አሳይ')
            }
          </span>
          <svg
            className={`w-4 h-4 transition-transform ${showGallery ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Uploaded Images Gallery */}
      {showGallery && (
        <div className="pt-4">
          <UploadedImagesGallery
            onSelectImage={handleSelectFromGallery}
            currentLanguage={currentLanguage}
            showSelectButton={true}
          />
        </div>
      )}

      {/* Error Message */}
      {formErrors.images && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{formErrors.images}</p>
        </div>
      )}
    </div>
  );
};

export default ImagesSection;
