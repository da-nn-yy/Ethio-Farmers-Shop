import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon.jsx';
import Button from './Button.jsx';

const InstagramStyleGallery = ({
  images = [],
  alt = 'Product Images',
  className = '',
  showFullscreen = true,
  showThumbnails = true,
  autoPlay = false,
  autoPlayInterval = 3000,
  currentLanguage = 'en'
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const autoPlayRef = useRef(null);

  const getImageUrl = (imageUrl) => {
    if (!imageUrl) return '/assets/images/no_image.png';
    if (imageUrl.startsWith('http')) return imageUrl;
    const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
    return `${API_BASE}/${imageUrl}`;
  };

  const currentImage = images[currentIndex] || images[0];

  // Auto-play functionality
  useEffect(() => {
    if (autoPlay && images.length > 1 && !isFullscreen) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % images.length);
      }, autoPlayInterval);
    } else {
      clearInterval(autoPlayRef.current);
    }

    return () => clearInterval(autoPlayRef.current);
  }, [autoPlay, images.length, autoPlayInterval, isFullscreen]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe && images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
    if (isRightSwipe && images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const goToNext = () => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }
  };

  const goToPrevious = () => {
    if (images.length > 1) {
      setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  const goToImage = (index) => {
    setCurrentIndex(index);
  };

  const openFullscreen = () => {
    if (showFullscreen) {
      setIsFullscreen(true);
    }
  };

  const closeFullscreen = () => {
    setIsFullscreen(false);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (isFullscreen) {
        switch (e.key) {
          case 'Escape':
            closeFullscreen();
            break;
          case 'ArrowLeft':
            goToPrevious();
            break;
          case 'ArrowRight':
            goToNext();
            break;
          default:
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFullscreen]);

  if (!images || images.length === 0) {
    return (
      <div className={`relative aspect-square overflow-hidden rounded-lg bg-gray-100 ${className}`}>
        <img
          src="/assets/images/no_image.png"
          alt={alt}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const GalleryContent = ({ isFullscreenMode = false }) => (
    <div className={`relative ${isFullscreenMode ? 'w-full h-full' : 'aspect-square overflow-hidden rounded-lg'} ${className}`}>
      {/* Main Image */}
      <div
        className="relative w-full h-full cursor-pointer"
        onClick={openFullscreen}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={getImageUrl(currentImage)}
          alt={`${alt} ${currentIndex + 1}`}
          className="w-full h-full object-cover transition-all duration-300"
          onError={(e) => {
            console.log('Image failed to load:', currentImage);
            e.target.src = '/assets/images/no_image.png';
          }}
        />

        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-3 left-3 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
            {currentIndex + 1} / {images.length}
          </div>
        )}

        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToPrevious();
              }}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 hover:opacity-100 group-hover:opacity-100"
            >
              <Icon name="ChevronLeft" size={20} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                goToNext();
              }}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 hover:opacity-100 group-hover:opacity-100"
            >
              <Icon name="ChevronRight" size={20} />
            </button>
          </>
        )}

        {/* Fullscreen Button */}
        {showFullscreen && !isFullscreenMode && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              openFullscreen();
            }}
            className="absolute bottom-3 right-3 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 hover:opacity-100 group-hover:opacity-100"
          >
            <Icon name="Maximize" size={16} />
          </button>
        )}

        {/* Auto-play Indicator */}
        {autoPlay && images.length > 1 && (
          <div className="absolute bottom-3 left-3 bg-black/50 text-white px-2 py-1 rounded text-xs">
            <Icon name="Play" size={12} className="inline mr-1" />
            Auto
          </div>
        )}
      </div>

      {/* Thumbnail Navigation */}
      {showThumbnails && images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-2">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                currentIndex === index
                  ? 'border-primary ring-2 ring-primary/20'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <img
                src={getImageUrl(image)}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.log('Thumbnail image failed to load:', image);
                  e.target.src = '/assets/images/no_image.png';
                }}
              />
            </button>
          ))}
        </div>
      )}

      {/* Dots Indicator */}
      {images.length > 1 && !showThumbnails && (
        <div className="flex justify-center gap-2 mt-3">
          {images.map((_, index) => (
            <button
              key={index}
              onClick={() => goToImage(index)}
              className={`w-2 h-2 rounded-full transition-all duration-200 ${
                currentIndex === index
                  ? 'bg-primary'
                  : 'bg-gray-300 hover:bg-gray-400'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className="group">
        <GalleryContent />
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center">
          <div className="relative w-full h-full flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between p-4 bg-black/50">
              <div className="text-white">
                <h3 className="text-lg font-semibold">
                  {currentLanguage === 'am' ? 'የምርት ምስሎች' : 'Product Images'}
                </h3>
                <p className="text-sm text-gray-300">
                  {currentIndex + 1} / {images.length}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeFullscreen}
                className="text-white hover:bg-white/10"
                iconName="X"
              />
            </div>

            {/* Fullscreen Gallery */}
            <div className="flex-1 flex items-center justify-center p-4">
              <GalleryContent isFullscreenMode={true} />
            </div>

            {/* Instructions */}
            <div className="p-4 bg-black/50 text-center">
              <p className="text-white text-sm">
                {currentLanguage === 'am'
                  ? 'የቀጥታ ቀስቶችን ወይም የማውጫ ቀስቶችን ይጠቀሙ • ESC ለመዝጋት'
                  : 'Use arrow keys or swipe • ESC to close'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default InstagramStyleGallery;


