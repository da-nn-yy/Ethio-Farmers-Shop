import React, { useState, useRef, useEffect } from 'react';
import Icon from '../AppIcon.jsx';
import Button from './Button.jsx';

const ListingDetailGallery = ({
  images = [],
  alt = 'Product Images',
  className = '',
  currentLanguage = 'en',
  showFullscreen = true,
  autoPlay = false,
  autoPlayInterval = 5000
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

  return (
    <>
      <div className={`space-y-4 ${className}`}>
        {/* Main Image Display */}
        <div className="relative aspect-square overflow-hidden rounded-lg bg-gray-100">
          <div
            className="relative w-full h-full cursor-pointer group"
            onClick={openFullscreen}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <img
              src={getImageUrl(currentImage)}
              alt={`${alt} ${currentIndex + 1}`}
              className="w-full h-full object-cover transition-all duration-300 group-hover:scale-105"
              onError={(e) => {
                console.log('Image failed to load:', currentImage);
                e.target.src = '/assets/images/no_image.png';
              }}
            />

            {/* Overlay Controls */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-all duration-200">
              {/* Image Counter */}
              {images.length > 1 && (
                <div className="absolute top-4 left-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-medium">
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
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <Icon name="ChevronLeft" size={24} />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      goToNext();
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                  >
                    <Icon name="ChevronRight" size={24} />
                  </button>
                </>
              )}

              {/* Fullscreen Button */}
              {showFullscreen && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    openFullscreen();
                  }}
                  className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                >
                  <Icon name="Maximize" size={20} />
                </button>
              )}

              {/* Auto-play Indicator */}
              {autoPlay && images.length > 1 && (
                <div className="absolute bottom-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                  <Icon name="Play" size={12} />
                  Auto
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Thumbnail Navigation */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => goToImage(index)}
                className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
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

        {/* Image Information */}
        <div className="text-center text-sm text-gray-600">
          <p>
            {currentLanguage === 'am'
              ? `ምስል ${currentIndex + 1} ከ ${images.length}`
              : `Image ${currentIndex + 1} of ${images.length}`
            }
          </p>
          {images.length > 1 && (
            <p className="text-xs text-gray-500 mt-1">
              {currentLanguage === 'am'
                ? 'ለማየት የቀጥታ ቀስቶችን ወይም የማውጫ ቀስቶችን ይጠቀሙ'
                : 'Use arrow keys or swipe to navigate'
              }
            </p>
          )}
        </div>
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

            {/* Fullscreen Image */}
            <div className="flex-1 flex items-center justify-center p-4">
              <div className="relative max-w-4xl max-h-full">
                <img
                  src={getImageUrl(currentImage)}
                  alt={`${alt} ${currentIndex + 1}`}
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onError={(e) => {
                    console.log('Fullscreen image failed to load:', currentImage);
                    e.target.src = '/assets/images/no_image.png';
                  }}
                />

                {/* Fullscreen Navigation */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={goToPrevious}
                      className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-200"
                    >
                      <Icon name="ChevronLeft" size={32} />
                    </button>
                    <button
                      onClick={goToNext}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-4 rounded-full transition-all duration-200"
                    >
                      <Icon name="ChevronRight" size={32} />
                    </button>
                  </>
                )}
              </div>
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

export default ListingDetailGallery;


