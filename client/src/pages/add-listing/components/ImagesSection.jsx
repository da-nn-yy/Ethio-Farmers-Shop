import React from 'react';
import StandardImageUpload from '../../../components/ui/StandardImageUpload.jsx';

const ImagesSection = ({ formData, formErrors, onUpdate, currentLanguage }) => {
  const handleImagesChange = (newImages) => {
    onUpdate('images', newImages);
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

      <StandardImageUpload
        images={formData.images || []}
        onImagesChange={handleImagesChange}
        maxImages={10}
        currentLanguage={currentLanguage}
        showPreview={true}
        showTips={true}
      />

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
