import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const SavedFarmersSection = ({ currentLanguage = 'en' }) => {
  const navigate = useNavigate();

  const savedFarmers = [
    {
      id: 1,
      name: "Alemayehu Tadesse",
      location: "Debre Zeit",
      distance: "12km",
      specialties: ["Tomatoes", "Onions", "Peppers"],
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      isVerified: true,
      newListings: 3,
      lastActive: "2 hours ago",
      rating: 4.8,
      totalOrders: 24
    },
    {
      id: 2,
      name: "Tigist Bekele",
      location: "Bishoftu",
      distance: "8km",
      specialties: ["Carrots", "Cabbage", "Lettuce"],
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
      isVerified: true,
      newListings: 1,
      lastActive: "1 hour ago",
      rating: 4.9,
      totalOrders: 18
    },
    {
      id: 3,
      name: "Mulugeta Haile",
      location: "Holeta",
      distance: "15km",
      specialties: ["Potatoes", "Beans", "Peas"],
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      isVerified: false,
      newListings: 2,
      lastActive: "4 hours ago",
      rating: 4.6,
      totalOrders: 12
    }
  ];

  const handleFarmerClick = (farmer) => {
    navigate('/browse-listings', { state: { farmerId: farmer?.id } });
  };

  const handleViewAllClick = () => {
    navigate('/browse-listings', { state: { showSavedOnly: true } });
  };

  return (
    <div className="bg-background px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          {currentLanguage === 'en' ? 'Saved Farmers' : 'የተቀመጡ አርሶ አደሮች'}
        </h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleViewAllClick}
          className="font-body text-sm text-primary hover:text-primary/80"
        >
          {currentLanguage === 'en' ? 'View All' : 'ሁሉንም ይመልከቱ'}
        </Button>
      </div>
      <div className="space-y-3">
        {savedFarmers?.map((farmer) => (
          <div
            key={farmer?.id}
            className="bg-card border border-border rounded-xl p-4 hover:shadow-subtle transition-all duration-200 cursor-pointer"
            onClick={() => handleFarmerClick(farmer)}
          >
            <div className="flex items-center space-x-3">
              {/* Farmer Avatar */}
              <div className="relative">
                <div className="w-12 h-12 rounded-full overflow-hidden">
                  <Image
                    src={farmer?.avatar}
                    alt={farmer?.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                {farmer?.newListings > 0 && (
                  <div className="absolute -top-1 -right-1 w-5 h-5 bg-accent text-accent-foreground rounded-full flex items-center justify-center">
                    <span className="font-caption text-xs font-bold">
                      {farmer?.newListings}
                    </span>
                  </div>
                )}
              </div>

              {/* Farmer Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-1 mb-1">
                  <h4 className="font-body text-sm font-semibold text-foreground truncate">
                    {farmer?.name}
                  </h4>
                  {farmer?.isVerified && (
                    <Icon name="BadgeCheck" size={14} color="var(--color-success)" />
                  )}
                </div>
                
                <div className="flex items-center space-x-2 mb-2">
                  <div className="flex items-center space-x-1">
                    <Icon name="MapPin" size={12} color="var(--color-muted-foreground)" />
                    <span className="font-caption text-xs text-muted-foreground">
                      {farmer?.location} • {farmer?.distance}
                    </span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Icon name="Star" size={12} color="var(--color-warning)" />
                    <span className="font-caption text-xs text-muted-foreground">
                      {farmer?.rating}
                    </span>
                  </div>
                </div>

                {/* Specialties */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {farmer?.specialties?.slice(0, 2)?.map((specialty, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground rounded-md font-caption text-xs"
                    >
                      {specialty}
                    </span>
                  ))}
                  {farmer?.specialties?.length > 2 && (
                    <span className="inline-flex items-center px-2 py-1 bg-muted text-muted-foreground rounded-md font-caption text-xs">
                      +{farmer?.specialties?.length - 2}
                    </span>
                  )}
                </div>

                {/* Last Active */}
                <p className="font-caption text-xs text-muted-foreground">
                  {currentLanguage === 'en' ? 'Active' : 'ንቁ'} {farmer?.lastActive}
                </p>
              </div>

              {/* Action Button */}
              <div className="flex flex-col items-center space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={(e) => {
                    e?.stopPropagation();
                    window.open(`tel:+251911234567`, '_self');
                  }}
                  className="p-2"
                >
                  <Icon name="Phone" size={16} color="currentColor" />
                </Button>
                
                {farmer?.newListings > 0 && (
                  <div className="flex items-center space-x-1">
                    <Icon name="Plus" size={12} color="var(--color-accent)" />
                    <span className="font-caption text-xs text-accent font-medium">
                      {currentLanguage === 'en' ? 'New' : 'አዲስ'}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* Add New Farmer Button */}
      <Button
        variant="outline"
        size="sm"
        className="w-full mt-4"
        iconName="UserPlus"
        iconPosition="left"
        iconSize={16}
        onClick={() => navigate('/browse-listings')}
      >
        {currentLanguage === 'en' ? 'Discover New Farmers' : 'አዳዲስ አርሶ አደሮችን ያግኙ'}
      </Button>
    </div>
  );
};

export default SavedFarmersSection;