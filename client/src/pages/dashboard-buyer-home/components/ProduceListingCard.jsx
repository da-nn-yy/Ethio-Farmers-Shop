
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

  const handleContactFarmer = () => {
    // Contact farmer logic
    console.log('Contact farmer:', listing.farmer.name);
  };

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <Image
          src={listing.image}
          alt={listing.name}
          className="w-full h-48 object-cover"
        />
        {listing.isOrganic && (
          <div className="absolute top-2 left-2 bg-green-600 text-white px-2 py-1 text-xs rounded">
            {currentLanguage === 'en' ? 'Organic' : 'ኦርጋኒክ'}
          </div>
        )}
        <button className="absolute top-2 right-2 p-2 bg-white/80 rounded-full hover:bg-white">
          <Icon name="Heart" className="w-4 h-4" />
        </button>
      </div>
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <div>
            <h4 className="font-semibold text-text-primary">{listing.name}</h4>
            <p className="text-sm text-text-secondary">{listing.variety}</p>
          </div>
          <div className="text-right">
            <p className="font-bold text-lg text-primary">{listing.price} ETB</p>
            <p className="text-xs text-text-secondary">per {listing.unit}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-4 text-sm text-text-secondary mb-3">
          <div className="flex items-center space-x-1">
            <Icon name="MapPin" className="w-3 h-3" />
            <span>{listing.location}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Icon name="Package" className="w-3 h-3" />
            <span>{listing.quantity} {listing.unit}</span>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Image
              src={listing.farmer.avatar}
              alt={listing.farmer.name}
              className="w-6 h-6 rounded-full"
            />
            <span className="text-sm font-medium">{listing.farmer.name}</span>
            <div className="flex items-center space-x-1">
              <Icon name="Star" className="w-3 h-3 text-yellow-500" />
              <span className="text-xs">{listing.farmer.rating}</span>
            </div>
          </div>
          {listing.farmer.isVerified && (
            <div className="flex items-center space-x-1 text-green-600">
              <Icon name="CheckCircle" className="w-3 h-3" />
              <span className="text-xs">{currentLanguage === 'en' ? 'Verified' : 'የተረጋገጠ'}</span>
            </div>
          )}
        </div>
        
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
