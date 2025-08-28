
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/ui/GlobalHeader';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import ContextualBreadcrumbs from '../../components/ui/ContextualBreadcrumbs';
import LocationHeader from './components/LocationHeader';
import CategoryFilter from './components/CategoryFilter';
import QuickActionsGrid from './components/QuickActionsGrid';
import MarketTrendsWidget from './components/MarketTrendsWidget';
import ProduceListingCard from './components/ProduceListingCard';
import RecentOrdersWidget from './components/RecentOrdersWidget';
import SavedFarmersSection from './components/SavedFarmersSection';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isNavCollapsed, setIsNavCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('Addis Ababa');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Mock user data
  const user = {
    id: 1,
    name: "Sarah Johnson",
    email: "sarah.johnson@email.com",
    role: "buyer",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    location: "Addis Ababa",
    joinDate: "2024-01-15"
  };

  // Mock featured listings
  const featuredListings = [
    {
      id: 1,
      name: "Fresh Tomatoes",
      variety: "Roma",
      price: 65,
      unit: "kg",
      quantity: 50,
      location: "Bahir Dar",
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop",
      farmer: {
        id: 1,
        name: "Ahmed Hassan",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        rating: 4.8,
        isVerified: true
      },
      isOrganic: true
    },
    {
      id: 2,
      name: "Red Onions",
      variety: "Sweet",
      price: 45,
      unit: "kg",
      quantity: 30,
      location: "Gondar",
      image: "https://images.unsplash.com/photo-1508747703725-719777637510?w=400&h=300&fit=crop",
      farmer: {
        id: 2,
        name: "Fatima Ali",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
        rating: 4.9,
        isVerified: true
      },
      isOrganic: false
    },
    {
      id: 3,
      name: "Potatoes",
      variety: "Irish",
      price: 32,
      unit: "kg",
      quantity: 100,
      location: "Hawassa",
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop",
      farmer: {
        id: 3,
        name: "Mohammed Getnet",
        avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
        rating: 4.7,
        isVerified: true
      },
      isOrganic: true
    }
  ];

  // Load language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('farmconnect_language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('farmconnect_language', newLanguage);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
    // Filter logic would go here
  };

  // Handle location change
  const handleLocationChange = (location) => {
    setSelectedLocation(location);
    // Filter logic would go here
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate refresh
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <GlobalHeader
        user={user}
        onLanguageChange={handleLanguageChange}
        currentLanguage={currentLanguage}
      />
      
      {/* Navigation */}
      <RoleBasedNavigation
        userRole="buyer"
        isCollapsed={isNavCollapsed}
        onToggleCollapse={() => setIsNavCollapsed(!isNavCollapsed)}
      />
      
      {/* Breadcrumbs */}
      <div className={`transition-all duration-300 ${isNavCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        <div className="pt-16">
          <ContextualBreadcrumbs userRole="buyer" />
        </div>

        {/* Main Content */}
        <main className="pb-20 md:pb-6">
          {/* Location Header */}
          <LocationHeader
            currentLanguage={currentLanguage}
            onLocationChange={handleLocationChange}
          />

          {/* Dashboard Content */}
          <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
            {/* Welcome Section */}
            <div className="bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-text-primary mb-2">
                    {currentLanguage === 'en' 
                      ? `Welcome back, ${user.name}!` 
                      : `እንኳን ደህና መጡ, ${user.name}!`
                    }
                  </h1>
                  <p className="text-text-secondary">
                    {currentLanguage === 'en' 
                      ? 'Discover fresh produce from verified farmers in your area' 
                      : 'በአካባቢዎ ካሉ የተረጋገጡ አርሶ አደሮች ትኩስ ምርቶችን ያግኙ'
                    }
                  </p>
                </div>
                <Button
                  variant="primary"
                  iconName="RefreshCw"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                >
                  {isRefreshing 
                    ? (currentLanguage === 'en' ? 'Refreshing...' : 'በመደስ ላይ...') 
                    : (currentLanguage === 'en' ? 'Refresh' : 'አድስ')
                  }
                </Button>
              </div>
            </div>

            {/* Category Filter */}
            <CategoryFilter
              currentLanguage={currentLanguage}
              onCategoryChange={handleCategoryChange}
            />

            {/* Quick Actions Grid */}
            <QuickActionsGrid currentLanguage={currentLanguage} />

            {/* Two Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Featured Listings */}
                <div className="bg-card border border-border rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-text-primary">
                      {currentLanguage === 'en' ? 'Featured Listings' : 'ተመራጭ ዝርዝሮች'}
                    </h3>
                    <Button
                      variant="outline"
                      size="sm"
                      iconName="ArrowRight"
                      iconPosition="right"
                      onClick={() => navigate('/browse-listings-buyer-home')}
                    >
                      {currentLanguage === 'en' ? 'View All' : 'ሁሉንም ይመልከቱ'}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {featuredListings.map((listing) => (
                      <ProduceListingCard
                        key={listing.id}
                        listing={listing}
                        currentLanguage={currentLanguage}
                      />
                    ))}
                  </div>
                </div>

                {/* Saved Farmers Section */}
                <SavedFarmersSection currentLanguage={currentLanguage} />
              </div>

              {/* Right Column - Widgets */}
              <div className="space-y-6">
                {/* Market Trends Widget */}
                <MarketTrendsWidget currentLanguage={currentLanguage} />

                {/* Recent Orders Widget */}
                <RecentOrdersWidget currentLanguage={currentLanguage} />
              </div>
            </div>
          </div>

          {/* Mobile Pull-to-Refresh Indicator */}
          {isRefreshing && (
            <div className="lg:hidden fixed top-32 left-1/2 transform -translate-x-1/2 z-40">
              <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                <div className="flex items-center space-x-2">
                  <Icon name="RefreshCw" className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm text-text-primary">
                    {currentLanguage === 'en' ? 'Refreshing...' : 'በመደስ ላይ...'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default BuyerDashboard;
