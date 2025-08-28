
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
  };

  // Handle location change
  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  // Handle refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
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
      
      {/* Main Content Container */}
      <div className={`transition-all duration-300 ${isNavCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
        {/* Breadcrumbs */}
        <div className="pt-16">
          <ContextualBreadcrumbs userRole="buyer" />
        </div>

        {/* Location Header */}
        <LocationHeader
          currentLanguage={currentLanguage}
          onLocationChange={handleLocationChange}
        />

        {/* Dashboard Content */}
        <main className="p-6 space-y-6">
          <div className="max-w-7xl mx-auto">
            {/* Welcome Section & Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-6">
              {/* Welcome Card */}
              <div className="lg:col-span-3 bg-gradient-to-r from-primary to-primary/80 text-white rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold mb-2">
                      {currentLanguage === 'en' 
                        ? `Welcome back, ${user.name}!` 
                        : `እንኳን ደህና መጡ, ${user.name}!`
                      }
                    </h1>
                    <p className="text-white/90 mb-4">
                      {currentLanguage === 'en' 
                        ? 'Discover fresh produce from verified farmers in your area' 
                        : 'በአካባቢዎ ካሉ የተረጋገጡ አርሶ አደሮች ትኩስ ምርቶችን ያግኙ'
                      }
                    </p>
                    <div className="flex items-center space-x-2 text-sm text-white/80">
                      <Icon name="MapPin" className="w-4 h-4" />
                      <span>{selectedLocation}</span>
                    </div>
                  </div>
                  <Button
                    variant="secondary"
                    iconName={isRefreshing ? "RefreshCw" : "Search"}
                    onClick={() => navigate('/browse-listings-buyer-home')}
                    className={isRefreshing ? "animate-spin" : ""}
                  >
                    {currentLanguage === 'en' ? 'Browse Market' : 'ገበያ አስሳ'}
                  </Button>
                </div>
              </div>

              {/* Quick Stats Card */}
              <div className="bg-card border border-border rounded-xl p-6">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-1">24</div>
                  <div className="text-sm text-text-secondary mb-3">
                    {currentLanguage === 'en' ? 'Active Orders' : 'ንቁ ትዕዛዞች'}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => navigate('/order-management')}
                    className="w-full"
                  >
                    {currentLanguage === 'en' ? 'View Orders' : 'ትዕዛዞችን ይመልከቱ'}
                  </Button>
                </div>
              </div>
            </div>

            {/* Category Filter */}
            <CategoryFilter
              currentLanguage={currentLanguage}
              onCategoryChange={handleCategoryChange}
            />

            {/* Quick Actions Grid */}
            <QuickActionsGrid currentLanguage={currentLanguage} />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Left Content - Listings & Farmers */}
              <div className="xl:col-span-2 space-y-6">
                {/* Featured Listings */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-xl font-semibold text-text-primary">
                        {currentLanguage === 'en' ? 'Featured Listings' : 'ተመራጭ ዝርዝሮች'}
                      </h2>
                      <p className="text-sm text-text-secondary mt-1">
                        {currentLanguage === 'en' ? 'Fresh produce from verified farmers' : 'ከተረጋገጡ አርሶ አደሮች ትኩስ ምርቶች'}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      iconName="ArrowRight"
                      iconPosition="right"
                      onClick={() => navigate('/browse-listings-buyer-home')}
                    >
                      {currentLanguage === 'en' ? 'View All' : 'ሁሉንም ይመልከቱ'}
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {featuredListings.slice(0, 4).map((listing) => (
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

              {/* Right Sidebar - Widgets */}
              <div className="space-y-6">
                {/* Market Trends Widget */}
                <MarketTrendsWidget currentLanguage={currentLanguage} />

                {/* Recent Orders Widget */}
                <RecentOrdersWidget currentLanguage={currentLanguage} />

                {/* Market Insights Card */}
                <div className="bg-card border border-border rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    {currentLanguage === 'en' ? 'Market Insights' : 'የገበያ ግንዛቤዎች'}
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Icon name="TrendingUp" className="w-4 h-4 text-green-600" />
                        <span className="text-sm font-medium">
                          {currentLanguage === 'en' ? 'Tomato prices up 12%' : 'የቲማቲም ዋጋ በ12% ጨምሯል'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Icon name="Leaf" className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium">
                          {currentLanguage === 'en' ? 'New organic farmers available' : 'አዳዲስ ኦርጋኒክ አርሶ አደሮች ይገኛሉ'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-yellow-50 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <Icon name="Clock" className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-medium">
                          {currentLanguage === 'en' ? 'Seasonal produce available' : 'የወቅት ምርቶች ይገኛሉ'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Mobile Refresh Indicator */}
      {isRefreshing && (
        <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 md:hidden">
          <div className="bg-card border border-border rounded-lg px-4 py-2 shadow-lg">
            <div className="flex items-center space-x-2">
              <Icon name="RefreshCw" className="w-4 h-4 animate-spin text-primary" />
              <span className="text-sm text-text-primary">
                {currentLanguage === 'en' ? 'Refreshing...' : 'በመደስ ላይ...'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerDashboard;
