import React, { useState, useEffect } from 'react';
import { farmerService } from '../../services/apiService';
import Icon from '../AppIcon';
import Button from './Button';

const UploadedImagesGallery = ({
  onSelectImage,
  currentLanguage = 'en',
  className = '',
  showSelectButton = true
}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    loadImages();
  }, []);

  const loadImages = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await farmerService.getUploadedImages({ limit: 50 });
      setImages(response.images || []);
    } catch (err) {
      console.error('Error loading uploaded images:', err);
      setError(currentLanguage === 'am'
        ? 'ምስሎችን ማስተካከል አልተሳካም'
        : 'Failed to load images');
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (image) => {
    setSelectedImage(image.id);
    if (onSelectImage) {
      onSelectImage(image);
    }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString(currentLanguage === 'am' ? 'am-ET' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className={`flex items-center justify-center p-8 ${className}`}>
        <Icon name="Loader" size={32} className="animate-spin text-primary" />
        <span className="ml-2 text-text-secondary">
          {currentLanguage === 'am' ? 'በመጫን ላይ...' : 'Loading images...'}
        </span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`p-4 bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <div className="flex items-center space-x-2">
          <Icon name="AlertCircle" size={20} className="text-red-500" />
          <span className="text-red-700">{error}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={loadImages}
            className="ml-auto"
          >
            {currentLanguage === 'am' ? 'እንደገና ይሞክሩ' : 'Retry'}
          </Button>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className={`text-center p-8 ${className}`}>
        <Icon name="Image" size={48} className="mx-auto mb-4 text-gray-400" />
        <p className="mb-4 text-text-secondary">
          {currentLanguage === 'am'
            ? 'ምንም የተጭኑ ምስሎች የሉም'
            : 'No uploaded images yet'}
        </p>
        <p className="text-sm text-text-secondary">
          {currentLanguage === 'am'
            ? 'አዲስ ምስል ለመጫን የምስል ማስገቢያ ቦታን ይጠቀሙ'
            : 'Use the image upload area to upload new images'}
        </p>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-text-primary">
          {currentLanguage === 'am' ? 'የተጭኑ ምስሎች' : 'Uploaded Images'}
          <span className="ml-2 text-sm text-text-secondary">
            ({images.length})
          </span>
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={loadImages}
          iconName="RefreshCw"
        >
          {currentLanguage === 'am' ? 'እንደገና ይጫኑ' : 'Refresh'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {images.map((image) => (
          <div
            key={image.id}
            className={`relative group border-2 rounded-lg overflow-hidden transition-all ${
              selectedImage === image.id
                ? 'border-primary ring-2 ring-primary'
                : 'border-border hover:border-primary'
            }`}
          >
            {/* Image */}
            <div className="overflow-hidden bg-gray-100 aspect-square">
              <img
                src={image.url}
                alt={image.originalname}
                className="object-cover w-full h-full transition-transform group-hover:scale-105"
                onError={(e) => {
                  console.log('Image failed to load:', image.url);
                  e.target.src = '/assets/images/no_image.png';
                }}
              />
            </div>

            {/* Overlay Info */}
            <div className="absolute inset-0 transition-all duration-200 bg-black/0 group-hover:bg-black/60">
              <div className="absolute bottom-0 left-0 right-0 p-2 transition-transform transform translate-y-full group-hover:translate-y-0">
                <p className="mb-1 text-xs text-white truncate" title={image.originalname}>
                  {image.originalname}
                </p>
                <div className="flex items-center justify-between text-xs text-white">
                  <span>{formatFileSize(image.size)}</span>
                  <span>{formatDate(image.createdAt)}</span>
                </div>
              </div>
            </div>

            {/* Select Button */}
            {showSelectButton && (
              <div className="absolute transition-opacity opacity-0 top-2 right-2 group-hover:opacity-100">
                <Button
                  variant={selectedImage === image.id ? "primary" : "outline"}
                  size="sm"
                  onClick={() => handleSelect(image)}
                  className="bg-white/90 hover:bg-white"
                  iconName={selectedImage === image.id ? "Check" : "Plus"}
                >
                  {selectedImage === image.id
                    ? (currentLanguage === 'am' ? 'ተመርጧል' : 'Selected')
                    : (currentLanguage === 'am' ? 'ምረጥ' : 'Select')
                  }
                </Button>
              </div>
            )}

            {/* Selected Indicator */}
            {selectedImage === image.id && (
              <div className="absolute p-1 text-white rounded-full top-2 left-2 bg-primary">
                <Icon name="Check" size={16} />
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default UploadedImagesGallery;
