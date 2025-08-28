
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';
import { FavoritesApi } from '../../../utils/api';

const SavedFarmersSection = ({ currentLanguage = 'en' }) => {
  const navigate = useNavigate();
  const [farmers, setFarmers] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await FavoritesApi.listFarmers();
        setFarmers(data?.items || []);
      } catch (_) {
        setFarmers([]);
      }
    };
    load();
  }, []);

  const savedFarmers = farmers?.map(f => ({
    id: f.farmer_user_id,
    name: f.farmer_name,
    location: [f.region, f.woreda].filter(Boolean).join(', ') || 'Ethiopia',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    rating: 4.8,
    specialties: ['Produce'],
    isVerified: true,
    activeListings: 0,
    totalOrders: 0
  }));

  const handleViewFarmerProfile = (farmerId) => {
    // Navigate to farmer profile
    console.log('View farmer profile:', farmerId);
  };

  const handleContactFarmer = (farmerId) => {
    // Contact farmer
    console.log('Contact farmer:', farmerId);
  };

  const handleRemoveFarmer = (farmerId) => {
    // Remove from saved farmers
    console.log('Remove farmer:', farmerId);
  };

  if (savedFarmers.length === 0) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {currentLanguage === 'en' ? 'Saved Farmers' : 'የተቀመጡ አርሶ አደሮች'}
        </h3>
        <div className="text-center py-8">
          <Icon name="Heart" className="w-12 h-12 text-text-secondary mx-auto mb-3" />
          <p className="text-text-secondary mb-4">
            {currentLanguage === 'en' 
              ? 'No saved farmers yet. Save farmers you frequently buy from for quick access!' 
              : 'እስካሁን የተቀመጡ አርሶ አደሮች የሉም። ከፍተው ከሚገዙ አርሶ አደሮች ለፈጣን መዳረሻ ያስቀምጡ!'
            }
          </p>
          <Button
            variant="primary"
            onClick={() => navigate('/browse-listings-buyer-home')}
          >
            {currentLanguage === 'en' ? 'Discover Farmers' : 'አርሶ አደሮችን ያግኙ'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          {currentLanguage === 'en' ? 'Saved Farmers' : 'የተቀመጡ አርሶ አደሮች'}
        </h3>
        <Button variant="outline" size="sm" iconName="Heart">
          {currentLanguage === 'en' ? 'Manage' : 'አስተዳድር'}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {savedFarmers.map((farmer) => (
          <div key={farmer.id} className="border border-border rounded-lg p-4 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-3">
                <Image
                  src={farmer.avatar}
                  alt={farmer.name}
                  className="w-12 h-12 rounded-full"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h4 className="font-medium text-text-primary">{farmer.name}</h4>
                    {farmer.isVerified && (
                      <Icon name="CheckCircle" className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <div className="flex items-center space-x-1 text-sm text-text-secondary">
                    <Icon name="MapPin" className="w-3 h-3" />
                    <span>{farmer.location}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => handleRemoveFarmer(farmer.id)}
                className="p-1 text-text-secondary hover:text-red-500 transition-colors"
              >
                <Icon name="Heart" className="w-4 h-4 fill-current" />
              </button>
            </div>

            <div className="flex items-center space-x-4 mb-3 text-sm">
              <div className="flex items-center space-x-1">
                <Icon name="Star" className="w-3 h-3 text-yellow-500" />
                <span className="font-medium">{farmer.rating}</span>
              </div>
              <div className="flex items-center space-x-1">
                <Icon name="Package" className="w-3 h-3 text-text-secondary" />
                <span className="text-text-secondary">{farmer.activeListings} listings</span>
              </div>
            </div>

            <div className="mb-3">
              <div className="flex flex-wrap gap-1">
                {farmer.specialties.map((specialty, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 text-xs bg-muted text-text-secondary rounded-full"
                  >
                    {specialty}
                  </span>
                ))}
              </div>
            </div>

            <div className="flex space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                iconName="MessageCircle"
                onClick={() => handleContactFarmer(farmer.id)}
              >
                {currentLanguage === 'en' ? 'Contact' : 'ያነጋግሩ'}
              </Button>
              <Button
                variant="primary"
                size="sm"
                className="flex-1"
                onClick={() => handleViewFarmerProfile(farmer.id)}
              >
                {currentLanguage === 'en' ? 'View Profile' : 'መገለጫ ይመልከቱ'}
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SavedFarmersSection;
