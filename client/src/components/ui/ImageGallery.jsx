import React, { useState } from 'react';
import Image from '../AppImage';

const ImageGallery = ({ 
  images = [], 
  alt = 'Product Images', 
  className = '',
  showThumbnails = true,
  maxThumbnails = 4
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (!images || images.length === 0) {
    return (
      <div className={`relative overflow-hidden ${className}`}>
        <Image
          src="/assets/images/no_image.png"
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const currentImage = images[currentImageIndex] || images[0];
  const visibleThumbnails = images.slice(0, maxThumbnails);

  return (
    <div className={`relative ${className}`}>
      {/* Main Image */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
        <Image
          src={currentImage}
          alt={`${alt} ${currentImageIndex + 1}`}
          className="w-full h-full object-cover"
          onError={(e) => {
            console.log('Main image failed to load:', currentImage);
            e.target.src = '/assets/images/no_image.png';
          }}
        />
        
        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={() => setCurrentImageIndex((prev) => 
                prev === 0 ? images.length - 1 : prev - 1
              )}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              onClick={() => setCurrentImageIndex((prev) => 
                prev === images.length - 1 ? 0 : prev + 1
              )}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-1 rounded-full hover:bg-opacity-75 transition-opacity"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 mt-2 overflow-x-auto">
          {visibleThumbnails.map((image, index) => (
            <button
              key={index}
              onClick={() => setCurrentImageIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded overflow-hidden border-2 transition-colors ${
                currentImageIndex === index 
                  ? 'border-primary' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Image
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log('Thumbnail image failed to load:', image);
                  e.target.src = '/assets/images/no_image.png';
                }}
              />
            </button>
          ))}
          
          {/* Show more indicator if there are more images */}
          {images.length > maxThumbnails && (
            <div className="flex-shrink-0 w-16 h-16 rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-500 text-xs">
              +{images.length - maxThumbnails}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
