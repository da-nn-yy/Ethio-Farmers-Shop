
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const ProduceListingCard = ({ listing, currentLanguage = 'en' }) => {
  const navigate = useNavigate();

  const handleViewDetails = () => {
    navigate('/browse-listings-buyer-home');
  };

  const price = listing?.price ?? listing?.pricePerKg ?? listing?.price_per_unit ?? 0;
  const unit = listing?.unit || 'kg';
  const quantity = listing?.quantity ?? listing?.availableQuantity ?? 0;
  const farmerName = listing?.farmer?.name || listing?.farmer_name || 'Farmer';
  const farmerRegion = listing?.farmer?.location || listing?.farmer_region || listing?.location || '-';
  const farmerAvatar = listing?.farmer?.avatar || '/assets/images/no_image.png';
  const farmerRating = listing?.farmer?.rating ?? listing?.farmer_rating ?? 0;
  const shortDescription = (listing?.description || '').slice(0, 140);
  const createdAt = listing?.createdAt ? new Date(listing.createdAt) : null;

  const handleContactFarmer = () => {
    // Contact farmer logic
    console.log('Contact farmer:', listing.farmer.name);
  };

  return (
    <div className="overflow-hidden transition-shadow border rounded-lg bg-card border-border hover:shadow-md">
      <div className="relative">
        <Image
          src={listing?.image}
          alt={listing?.name || 'Listing'}
          className="object-cover w-full h-48"
        />
        {listing.isOrganic && (
          <div className="absolute px-2 py-1 text-xs text-white bg-green-600 rounded top-2 left-2">
            {currentLanguage === 'en' ? 'Organic' : 'ኦርጋኒክ'}
          </div>
        )}
        <button className="absolute p-2 rounded-full top-2 right-2 bg-white/80 hover:bg-white">
          <Icon name="Heart" className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-text-primary">{listing?.name || 'Untitled'}</h4>
            <p className="text-sm text-text-secondary">{listing?.variety || listing?.category || ''}</p>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary">{price} ETB</p>
            <p className="text-xs text-text-secondary">per {unit}</p>
          </div>
        </div>

        <div className="flex items-center mb-3 space-x-4 text-sm text-text-secondary">
          <div className="flex items-center space-x-1">
            <Icon name="MapPin" className="w-3 h-3" />
            <span>{farmerRegion}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Package" className="w-3 h-3" />
            <span>{quantity} {unit}</span>
          </div>
          {createdAt && (
            <div className="flex items-center space-x-1">
              <Icon name="Clock" className="w-3 h-3" />
              <span>{createdAt.toLocaleDateString()}</span>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Image
              src={farmerAvatar}
              alt={farmerName}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm font-medium">{farmerName}</span>
            <div className="flex items-center space-x-1">
              <Icon name="Star" className="w-3 h-3 text-yellow-500" />
              <span className="text-xs">{farmerRating}</span>
            </div>
          </div>
          {listing?.farmer?.isVerified && (
            <div className="flex items-center space-x-1 text-green-600">
              <Icon name="CheckCircle" className="w-3 h-3" />
              <span className="text-xs">{currentLanguage === 'en' ? 'Verified' : 'የተረጋገጠ'}</span>
            </div>
          )}
        </div>

        {/* Description */}
        {shortDescription && (
          <p className="mb-3 text-sm leading-snug text-text-secondary line-clamp-2">
            {shortDescription}{listing?.description && listing.description.length > 140 ? '…' : ''}
          </p>
        )}

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            iconName="MessageCircle"
            onClick={handleContactFarmer}
          >
            {currentLanguage === 'en' ? 'Contact' : 'ያነጋግሩ'}
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="flex-1"
            onClick={handleViewDetails}
          >
            {currentLanguage === 'en' ? 'View Details' : 'ዝርዝር ይመልከቱ'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProduceListingCard;
