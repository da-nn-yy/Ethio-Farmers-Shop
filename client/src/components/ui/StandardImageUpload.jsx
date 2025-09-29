import React, { useState, useRef, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import Icon from '../AppIcon.jsx';
import Button from './Button.jsx';
import { imageService } from '../../services/apiService.js';

const StandardImageUpload = ({
  images = [],
  onImagesChange,
  maxImages = 10,
  maxFileSize = 5 * 1024 * 1024, // 5MB
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  currentLanguage = 'en',
  className = '',
  showPreview = true,
  showTips = true
}) => {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);
  const { user } = useAuth();

  const validateFile = useCallback((file) => {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      throw new Error(
        currentLanguage === 'am'
          ? 'የማይታወቅ የፋይል አይነት። እባክዎን JPG, PNG, ወይም WebP ይጠቀሙ።'
          : 'Invalid file type. Please use JPG, PNG, or WebP.'
      );
    }

    // Check file size
    if (file.size > maxFileSize) {
      const maxSizeMB = Math.round(maxFileSize / (1024 * 1024));
      throw new Error(
        currentLanguage === 'am'
          ? `የፋይሉ መጠን ከ ${maxSizeMB}MB ያነሰ መሆን አለበት።`
          : `File size must be less than ${maxSizeMB}MB.`
      );
    }

    return true;
  }, [allowedTypes, maxFileSize, currentLanguage]);

  const uploadImage = useCallback(async (file, index) => {
    try {
      setUploadProgress(prev => ({ ...prev, [index]: 0 }));

      const formData = new FormData();
      formData.append('image', file);

      const response = await imageService.uploadImage(formData, (progressEvent) => {
        const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        setUploadProgress(prev => ({ ...prev, [index]: progress }));
      });

      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[index];
        return newProgress;
      });

      return response.imageUrl;
    } catch (error) {
      console.error('Image upload failed:', error);
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[index];
        return newProgress;
      });
      throw error;
    }
  }, []);

  const handleFiles = useCallback(async (files) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);

    // Check if adding these files would exceed the limit
    if (images.length + fileArray.length > maxImages) {
      alert(
        currentLanguage === 'am'
          ? `ከ ${maxImages} ምስሎች በላይ መጨመር አይቻልም።`
          : `Cannot add more than ${maxImages} images.`
      );
      return;
    }

    setUploading(true);
    const newImageUrls = [];
    const errors = [];

    try {
      // Validate all files first
      for (const file of fileArray) {
        try {
          validateFile(file);
        } catch (error) {
          errors.push(`${file.name}: ${error.message}`);
        }
      }

      if (errors.length > 0) {
        alert(errors.join('\n'));
        setUploading(false);
        return;
      }

      // Upload files
      for (let i = 0; i < fileArray.length; i++) {
        try {
          const imageUrl = await uploadImage(fileArray[i], i);
          newImageUrls.push(imageUrl);
        } catch (error) {
          errors.push(`${fileArray[i].name}: Upload failed`);
        }
      }

      if (newImageUrls.length > 0) {
        const updatedImages = [...images, ...newImageUrls];
        onImagesChange(updatedImages);
      }

      if (errors.length > 0) {
        alert(
          currentLanguage === 'am'
            ? `አንዳንድ ምስሎች አልተጭኑም:\n${errors.join('\n')}`
            : `Some images failed to upload:\n${errors.join('\n')}`
        );
      }
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, validateFile, uploadImage, onImagesChange, currentLanguage]);

  const handleFileSelect = useCallback((event) => {
    const files = event.target.files;
    handleFiles(files);
  }, [handleFiles]);

  const handleDrag = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  }, [handleFiles]);

  const removeImage = useCallback((indexToRemove) => {
    const newImages = images.filter((_, index) => index !== indexToRemove);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const reorderImages = useCallback((fromIndex, toIndex) => {
    const newImages = [...images];
    const [movedImage] = newImages.splice(fromIndex, 1);
    newImages.splice(toIndex, 0, movedImage);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/assets/images/no_image.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${API_BASE}/${imageUrl}`;
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          dragActive
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50'
        } ${uploading ? 'pointer-events-none opacity-50' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={allowedTypes.join(',')}
          multiple
          onChange={handleFileSelect}
          className="hidden"
          disabled={uploading}
        />

        <div className="space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon
              name={uploading ? "Loader2" : "Upload"}
              size={32}
              className={`text-primary ${uploading ? 'animate-spin' : ''}`}
            />
          </div>

          <div>
            <p className="text-lg font-medium text-foreground">
              {uploading
                ? (currentLanguage === 'am' ? 'በማጭን ላይ...' : 'Uploading...')
                : (currentLanguage === 'am' ? 'ምስሎች ይጭኑ' : 'Upload Images')
              }
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {currentLanguage === 'am'
                ? 'ጠቅ ያድርጉ ወይም ምስሎችን ይጎትቱ (JPG, PNG, WebP - እስከ 5MB)'
                : 'Click or drag images here (JPG, PNG, WebP - up to 5MB each)'
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              {currentLanguage === 'am'
                ? `ከ ${maxImages} ምስሎች በላይ መጨመር አይቻልም`
                : `Maximum ${maxImages} images allowed`
              }
            </p>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading || images.length >= maxImages}
            iconName="Upload"
            iconPosition="left"
          >
            {currentLanguage === 'am' ? 'ፋይሎች ይምረጡ' : 'Choose Files'}
          </Button>

          {/* Upload Progress */}
          {Object.keys(uploadProgress).length > 0 && (
            <div className="space-y-2">
              {Object.entries(uploadProgress).map(([index, progress]) => (
                <div key={index} className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Grid */}
      {showPreview && images.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-foreground mb-4">
            {currentLanguage === 'am' ? 'የተጭኑ ምስሎች' : 'Uploaded Images'}
            <span className="text-sm text-muted-foreground ml-2">
              ({images.length}/{maxImages})
            </span>
          </h3>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {images.map((image, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square overflow-hidden rounded-lg border border-border">
                  <img
                    src={getImageUrl(image)}
                    alt={`Product ${index + 1}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    onError={(e) => {
                      console.log('Image failed to load:', image);
                      e.target.src = '/assets/images/no_image.png';
                    }}
                  />
                </div>

                {/* Image Actions */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-200 rounded-lg">
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => removeImage(index)}
                      className="w-8 h-8 p-0 rounded-full"
                      iconName="X"
                    />
                  </div>

                  {/* Drag Handle */}
                  <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-8 h-8 bg-white/80 rounded-full flex items-center justify-center cursor-move">
                      <Icon name="GripVertical" size={16} className="text-gray-600" />
                    </div>
                  </div>

                  {/* Image Number */}
                  <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span className="bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {index + 1}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tips */}
      {showTips && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-start">
            <Icon name="Info" size={20} className="text-blue-500 mt-0.5 mr-3 flex-shrink-0" />
            <div>
              <h4 className="text-sm font-medium text-blue-800 dark:text-blue-200 mb-2">
                {currentLanguage === 'am' ? 'የምስል ምክሮች' : 'Image Tips'}
              </h4>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• {currentLanguage === 'am' ? 'ጥሩ ብርሃን እና ግልጽ ዳራዎችን ይጠቀሙ' : 'Use good lighting and clear backgrounds'}</li>
                <li>• {currentLanguage === 'am' ? 'የምርትዎን የተለያዩ ማዕዘኖች ያሳዩ' : 'Show different angles of your product'}</li>
                <li>• {currentLanguage === 'am' ? 'ጥራት ለማሳየት ቅርብ የሆኑ ምስሎችን ያካተቱ' : 'Include close-up shots to show quality'}</li>
                <li>• {currentLanguage === 'am' ? 'መጀመሪያው ምስል ዋናው ምስል ይሆናል' : 'The first image will be the main product image'}</li>
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardImageUpload;
