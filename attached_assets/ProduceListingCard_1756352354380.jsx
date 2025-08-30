import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProduceListingCard = ({ listing, currentLanguage = 'en' }) => {
  const navigate = useNavigate();

  const handleCardClick = () => {
    navigate('/listing-detail', { state: { listing } });
  };

  const handleContactClick = (e) => {
    e?.stopPropagation();
    window.open(`tel:${listing?.farmer?.phone}`, '_self');
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    })?.format(price)?.replace('ETB', 'ETB');
  };

  const getDistanceText = () => {
    return currentLanguage === 'en' 
      ? `${listing?.distance}km away` 
      : `${listing?.distance}ኪሜ ርቀት`;
  };

  const getQuantityText = () => {
    return currentLanguage === 'en' 
      ? `${listing?.quantity} ${listing?.unit} available`
      : `${listing?.quantity} ${listing?.unit} ይገኛል`;
  };

  return (
    <div 
      className="bg-card border border-border rounded-xl shadow-subtle hover:shadow-floating transition-all duration-200 cursor-pointer overflow-hidden"
      onClick={handleCardClick}
    >
      {/* Image Section */}
      <div className="relative h-48 overflow-hidden">
        <Image
          src={listing?.image}
          alt={listing?.name}
          className="w-full h-full object-cover"
        />
        
        {/* Price Badge */}
        <div className="absolute top-3 right-3 bg-primary text-primary-foreground px-3 py-1 rounded-full shadow-subtle">
          <span className="font-body text-sm font-semibold">
            {formatPrice(listing?.pricePerUnit)}/{listing?.unit}
          </span>
        </div>

        {/* Market Price Comparison */}
        {listing?.marketComparison && (
          <div className="absolute top-3 left-3 bg-success text-success-foreground px-2 py-1 rounded-full shadow-subtle">
            <span className="font-caption text-xs font-medium">
              {listing?.marketComparison > 0 
                ? `${listing?.marketComparison}% ${currentLanguage === 'en' ? 'below market' : 'ከገበያ በታች'}`
                : `${Math.abs(listing?.marketComparison)}% ${currentLanguage === 'en' ? 'above market' : 'ከገበያ በላይ'}`
              }
            </span>
          </div>
        )}

        {/* Fresh Badge */}
        {listing?.isNew && (
          <div className="absolute bottom-3 left-3 bg-accent text-accent-foreground px-2 py-1 rounded-full shadow-subtle">
            <span className="font-caption text-xs font-medium">
              {currentLanguage === 'en' ? 'Fresh Today' : 'ዛሬ ትኩስ'}
            </span>
          </div>
        )}
      </div>
      {/* Content Section */}
      <div className="p-4">
        {/* Produce Name */}
        <h3 className="font-heading text-lg font-semibold text-foreground mb-2 line-clamp-1">
          {listing?.name}
        </h3>

        {/* Farmer Info */}
        <div className="flex items-center space-x-2 mb-3">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <Icon name="User" size={16} color="white" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <span className="font-body text-sm font-medium text-foreground truncate">
                {listing?.farmer?.name}
              </span>
              {listing?.farmer?.isVerified && (
                <Icon name="BadgeCheck" size={14} color="var(--color-success)" />
              )}
            </div>
            <p className="font-caption text-xs text-muted-foreground">
              {getDistanceText()}
            </p>
          </div>
        </div>

        {/* Quantity and Availability */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-1">
            <Icon name="Package" size={16} color="var(--color-muted-foreground)" />
            <span className="font-body text-sm text-muted-foreground">
              {getQuantityText()}
            </span>
          </div>
          <div className={`flex items-center space-x-1 ${
            listing?.availability === 'high' ? 'text-success' : 
            listing?.availability === 'medium' ? 'text-warning' : 'text-error'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              listing?.availability === 'high' ? 'bg-success' : 
              listing?.availability === 'medium' ? 'bg-warning' : 'bg-error'
            }`} />
            <span className="font-caption text-xs font-medium">
              {listing?.availability === 'high' 
                ? (currentLanguage === 'en' ? 'In Stock' : 'በመጋዘን ውስጥ')
                : listing?.availability === 'medium'
                ? (currentLanguage === 'en' ? 'Limited' : 'ውሱን')
                : (currentLanguage === 'en' ? 'Low Stock' : 'ዝቅተኛ አቅርቦት')
              }
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleContactClick}
            className="flex-1"
            iconName="Phone"
            iconPosition="left"
            iconSize={16}
          >
            {currentLanguage === 'en' ? 'Contact' : 'ይደውሉ'}
          </Button>
          <Button
            variant="default"
            size="sm"
            className="flex-1"
            iconName="ShoppingCart"
            iconPosition="left"
            iconSize={16}
          >
            {currentLanguage === 'en' ? 'Order' : 'ይዘዙ'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProduceListingCard;