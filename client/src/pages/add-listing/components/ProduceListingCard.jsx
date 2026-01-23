import React from 'react';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import ImageGallery from '../../../components/ui/ImageGallery';
import Button from '../../../components/ui/Button';

const ProduceListingCard = ({
  listing,
  onEdit,
  onDuplicate,
  onToggleStatus,
  currentLanguage = 'en'
}) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'bg-success text-success-foreground';
      case 'low_stock':
        return 'bg-warning text-warning-foreground';
      case 'sold_out':
        return 'bg-error text-error-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };



  const getStatusText = (status) => {
    if (currentLanguage === 'am') {
      switch (status) {
        case 'active':
          return 'ንቁ';
        case 'low_stock':
          return 'ዝቅተኛ ክምችት';
        case 'sold_out':
          return 'ተሽጧል';
        default:
          return 'ያልታወቀ';
      }
    } else {
      switch (status) {
        case 'active':
          return 'Active';
        case 'low_stock':
          return 'Low Stock';
        case 'sold_out':
          return 'Sold Out';
        default:
          return 'Unknown';
      }
    }
  };

  const formatPrice = (price) => {
    return `${price?.toLocaleString()} ETB`;
  };

  return (
    <div className="overflow-hidden border rounded-lg bg-card border-border shadow-warm hover:shadow-warm-md transition-smooth">
      {/* Image Section */}
      {(() => {
        const listingImages = getListingImages(listing);
        return (
          <div className="relative h-48 overflow-hidden lg:h-56 bg-gray-100">
            <ImageGallery
              images={listingImages}
              alt={listing?.name || 'Product Image'}
              className="w-full h-full"
              showThumbnails={false}
            />
            <div className="absolute top-3 right-3 z-10">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing?.status)}`}>
                {getStatusText(listing?.status)}
              </span>
            </div>
            {/* Image count badge if multiple images */}
            {listingImages.length > 1 && (
              <div className="absolute bottom-3 left-3 z-10 bg-black/70 text-white px-2 py-1 rounded text-xs">
                {listingImages.length} {currentLanguage === 'am' ? 'ምስሎች' : 'images'}
              </div>
            )}
          </div>
        );
      })()}
      {/* Content Section */}
      <div className="p-4 lg:p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className="mb-1 text-lg font-semibold text-text-primary">
              {currentLanguage === 'am' && listing?.nameAm ? listing?.nameAm : listing?.name}
            </h3>
            <p className="text-sm text-text-secondary">
              {currentLanguage === 'am' ? 'ዋጋ በኪሎ' : 'Price per kg'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xl font-bold text-primary">
              {formatPrice(listing?.pricePerKg)}
            </p>
          </div>
        </div>

        {/* Quantity and Location */}
        <div className="flex items-center justify-between mb-4 text-sm text-text-secondary">
          <div className="flex items-center space-x-1">
            <Icon name="Package" size={16} />
            <span>
              {listing?.availableQuantity} {currentLanguage === 'am' ? 'ኪሎ' : 'kg'}
            </span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="MapPin" size={16} />
            <span>{listing?.location}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(listing?.id)}
            iconName="Edit"
            iconPosition="left"
            className="flex-1"
          >
            {currentLanguage === 'am' ? 'አርም' : 'Edit'}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDuplicate(listing?.id)}
            iconName="Copy"
            iconPosition="left"
            className="flex-1"
          >
            {currentLanguage === 'am' ? 'ቅዳ' : 'Duplicate'}
          </Button>
          <Button
            variant={listing?.status === 'sold_out' ? 'success' : 'secondary'}
            size="sm"
            onClick={() => onToggleStatus(listing?.id)}
            iconName={listing?.status === 'sold_out' ? 'RotateCcw' : 'XCircle'}
            iconPosition="left"
            className="flex-1"
          >
            {listing?.status === 'sold_out'
              ? (currentLanguage === 'am' ? 'እንደገና ንቁ አድርግ' : 'Reactivate')
              : (currentLanguage === 'am' ? 'ተሽጧል ምልክት አድርግ' : 'Mark Sold')
            }
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProduceListingCard;
