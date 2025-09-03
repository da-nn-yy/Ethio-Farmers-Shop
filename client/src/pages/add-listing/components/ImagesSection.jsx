import React, { useState } from 'react';
import axios from 'axios';
import { auth } from '../../../firebase';

const ImagesSection = ({ formData, formErrors, onUpdate, currentLanguage }) => {
  const [uploading, setUploading] = useState(false);

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert(currentLanguage === 'en'
        ? 'Please select a valid image file'
        : 'እባክዎን ትክክለኛ የምስል ፋይል ይምረጡ');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert(currentLanguage === 'en'
        ? 'Image size should be less than 5MB'
        : 'የምስል መጠን 5MB ያነሰ መሆን አለበት');
      return;
    }

    setUploading(true);

    try {
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const currentUser = auth.currentUser;
      if (!currentUser) {
        alert(currentLanguage === 'en' ? 'Please log in again.' : 'እባክዎን እንደገና ይግቡ።');
        return;
      }
      const idToken = await currentUser.getIdToken();

      const form = new FormData();
      form.append('image', file);

      const response = await axios.post(`${API_BASE}/farmer/upload-image`, form, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${idToken}`
        }
      });

      const uploadedUrl = response?.data?.imageUrl;
      if (!uploadedUrl) {
        throw new Error('Upload did not return imageUrl');
      }

      const newImages = [...(formData.images || []), uploadedUrl];
      onUpdate('images', newImages);

      alert(currentLanguage === 'en'
        ? 'Image uploaded successfully!'
        : 'ምስሉ በተሳካ ሁኔታ ተጭኗል!');
    } catch (error) {
      console.error('Image upload failed:', error);
      alert(currentLanguage === 'en'
        ? 'Failed to add image. Please try again.'
        : 'ምስሉን መጨመር አልተሳካም። እባክዎን እንደገና ይሞክሩ።');
    } finally {
      setUploading(false);
    }
  };

  const removeImage = (indexToRemove) => {
    const newImages = formData.images.filter((_, index) => index !== indexToRemove);
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

      {/* Upload Area */}
      <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary transition-colors">
        <input
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
          id="image-upload"
          disabled={uploading}
        />
        <label
          htmlFor="image-upload"
          className={`cursor-pointer ${uploading ? 'cursor-not-allowed opacity-50' : ''}`}
        >
          <div className="space-y-4">
            <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <div>
              <p className="text-lg font-medium text-foreground">
                {uploading
                  ? (currentLanguage === 'en' ? 'Uploading...' : 'በማጭን ላይ...')
                  : (currentLanguage === 'en' ? 'Click to upload image' : 'ምስል ለመጭን ጠቅ ያድርጉ')
                }
              </p>
              <p className="text-sm text-muted-foreground">
                {currentLanguage === 'en'
                  ? 'PNG, JPG, JPEG up to 5MB'
                  : 'PNG, JPG, JPEG እስከ 5MB'}
              </p>
            </div>
            {uploading && (
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-primary h-2 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </label>
      </div>

      {/* Image Preview */}
      {formData.images && formData.images.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">
            {currentLanguage === 'en' ? 'Uploaded Images' : 'የተጭኑ ምስሎች'}
          </h3>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {formData.images.map((image, index) => (
              <div key={index} className="relative group">
                <img
                  src={image}
                  alt={`Product ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border border-border"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Message */}
      {formErrors.images && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{formErrors.images}</p>
        </div>
      )}

      {/* Tips */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-green-800">
              {currentLanguage === 'en' ? 'Image Tips' : 'የምስል ምክሮች'}
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <ul className="list-disc list-inside space-y-1">
                <li>
                  {currentLanguage === 'en'
                    ? 'Use good lighting and clear backgrounds'
                    : 'ጥሩ ብርሃን እና ግልጽ የሆኑ ዳራዎችን ይጠቀሙ'}
                </li>
                <li>
                  {currentLanguage === 'en'
                    ? 'Show different angles of your produce'
                    : 'የምርትዎን የተለያዩ ማዕዘኖች ያሳዩ'}
                </li>
                <li>
                  {currentLanguage === 'en'
                    ? 'Include close-up shots to show quality'
                    : 'ጥራት ለማሳየት ቅርብ የሆኑ ምስሎችን ያካተቱ'}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImagesSection;
