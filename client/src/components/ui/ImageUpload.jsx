import React, { useState, useRef } from 'react';
import Icon from '../AppIcon';
import Button from './Button';

const ImageUpload = ({
  onImageUpload,
  currentImage = '',
  currentLanguage = 'en',
  className = ''
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(currentImage);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError(currentLanguage === 'am' ? 'እባክዎ የምስት ፋይል ይምረጡ' : 'Please select an image file');
      return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError(currentLanguage === 'am' ? 'የፋይሉ መጠን ከ 5MB ያነሰ መሆን አለበት' : 'File size must be less than 5MB');
      return;
    }

    setError('');

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload the file
    uploadImage(file);
  };

  const uploadImage = async (file) => {
    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('image', file);

      // Get Firebase auth token
      const { auth } = await import('../../firebase');
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('User not authenticated');
      }
      const idToken = await currentUser.getIdToken();

      const RAW_API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const API_BASE = RAW_API_BASE.endsWith('/api') ? RAW_API_BASE : `${RAW_API_BASE.replace(/\/+$/, '')}/api`;
      const response = await fetch(`${API_BASE}/farmers/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${idToken}`
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Upload failed');
      }

      const data = await response.json();

      // Call the parent callback with the uploaded image URL
      if (onImageUpload) {
        onImageUpload(data.imageUrl);
      }

    } catch (error) {
      console.error('Error uploading image:', error);
      setError(currentLanguage === 'am' ? 'የምስት ማስገቢያ አልተሳካም። እባክዎ እንደገና ይሞክሩ።' : 'Image upload failed. Please try again.');
      setPreviewUrl(currentImage); // Reset to current image
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveImage = () => {
    setPreviewUrl('');
    if (onImageUpload) {
      onImageUpload('');
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Image Preview */}
      {previewUrl && (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Preview"
            className="w-full h-48 object-cover rounded-lg border border-border"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRemoveImage}
            className="absolute top-2 right-2 bg-white/80 hover:bg-white"
            iconName="X"
          />
        </div>
      )}

      {/* Upload Area */}
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading}
        />

        <div className="space-y-3">
          <Icon
            name="Upload"
            size={32}
            className="mx-auto text-text-secondary"
          />

          <div>
            <p className="text-sm font-medium text-text-primary">
              {currentLanguage === 'am' ? 'የምስት ፋይል ይምረጡ' : 'Choose an image file'}
            </p>
            <p className="text-xs text-text-secondary mt-1">
              {currentLanguage === 'am'
                ? 'PNG, JPG, JPEG ወይም GIF (ከ 5MB ያነሰ)'
                : 'PNG, JPG, JPEG or GIF (max 5MB)'
              }
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            iconName={isUploading ? "Loader" : "Upload"}
            iconPosition="left"
            loading={isUploading}
          >
            {isUploading
              ? (currentLanguage === 'am' ? 'በመጫን ላይ...' : 'Uploading...')
              : (currentLanguage === 'am' ? 'የምስት ፋይል ይምረጡ' : 'Choose File')
            }
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
