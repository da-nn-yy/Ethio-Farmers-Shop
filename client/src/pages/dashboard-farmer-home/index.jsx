import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/ui/GlobalHeader';
import TabNavigation from '../../components/ui/TabNavigation';
import MobileMenu from '../../components/ui/MobileMenu';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MetricsCard from './components/MetricsCard';
import QuickActionCard from './components/QuickActionCard';
import ProduceListingCard from './components/ProduceListingCard';
import MarketTrendsWidget from './components/MarketTrendsWidget';
import RecentActivityFeed from './components/RecentActivityFeed';

const DashboardFarmerHome = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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

  // Mock data for farmer dashboard
  const farmerMetrics = [
    {
      title: 'Active Listings',
      titleAm: 'ንቁ ዝርዝሮች',
      value: 12,
      icon: 'Package',
      trend: 'up',
      trendValue: 8.5
    },
    {
      title: 'Pending Orders',
      titleAm: 'በመጠባበቅ ላይ ያሉ ትዕዛዞች',
      value: 7,
      icon: 'ShoppingBag',
      trend: 'up',
      trendValue: 12.3
    },
    {
      title: 'Weekly Earnings',
      titleAm: 'ሳምንታዊ ገቢ',
      value: 2850,
      icon: 'TrendingUp',
      currency: true,
      trend: 'up',
      trendValue: 15.7
    },
    {
      title: 'Total Reviews',
      titleAm: 'ጠቅላላ ግምገማዎች',
      value: 48,
      icon: 'Star',
      trend: 'up',
      trendValue: 4.2
    }
  ];

  const quickActions = [
    {
      title: 'Add New Listing',
      titleAm: 'አዲስ ዝርዝር ጨምር',
      description: 'List your fresh produce for buyers',
      descriptionAm: 'ለገዢዎች ትኩስ ምርትዎን ዘርዝር',
      icon: 'Plus',
      variant: 'primary',
      onClick: () => console.log('Add new listing')
    },
    {
      title: 'View All Orders',
      titleAm: 'ሁሉንም ትዕዛዞች ይመልከቱ',
      description: 'Manage your incoming orders',
      descriptionAm: 'የሚመጡ ትዕዛዞችዎን ያስተዳድሩ',
      icon: 'ShoppingBag',
      variant: 'secondary',
      onClick: () => navigate('/order-management')
    }
  ];

  const produceListings = [
    {
      id: 1,
      name: 'Premium Teff',
      nameAm: 'ፕሪሚየም ጤፍ',
      image: 'https://images.pexels.com/photos/4110404/pexels-photo-4110404.jpeg',
      pricePerKg: 92,
      availableQuantity: 150,
      location: 'Addis Ababa',
      status: 'active'
    },
    {
      id: 2,
      name: 'Organic Wheat',
      nameAm: 'ኦርጋኒክ ስንዴ',
      image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b',
      pricePerKg: 50,
      availableQuantity: 200,
      location: 'Oromia',
      status: 'active'
    },
    {
      id: 3,
      name: 'Fresh Barley',
      nameAm: 'ትኩስ ገብስ',
      image: 'https://images.pixabay.com/photo/2016/08/10/16/58/barley-1584328_1280.jpg',
      pricePerKg: 43,
      availableQuantity: 8,
      location: 'Amhara',
      status: 'low_stock'
    },
    {
      id: 4,
      name: 'Yellow Maize',
      nameAm: 'ቢጫ በቆሎ',
      image: 'https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg',
      pricePerKg: 37,
      availableQuantity: 0,
      location: 'SNNP',
      status: 'sold_out'
    },
    {
      id: 5,
      name: 'Red Onions',
      nameAm: 'ቀይ ሽንኩርት',
      image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655',
      pricePerKg: 25,
      availableQuantity: 75,
      location: 'Tigray',
      status: 'active'
    },
    {
      id: 6,
      name: 'Fresh Tomatoes',
      nameAm: 'ትኩስ ቲማቲም',
      image: 'https://images.pixabay.com/photo/2016/08/10/16/58/tomatoes-1584328_1280.jpg',
      pricePerKg: 18,
      availableQuantity: 120,
      location: 'Addis Ababa',
      status: 'active'
    }
  ];

  const notificationCounts = {
    orders: 7,
    total: 15
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  // Handle listing actions
  const handleEditListing = (listingId) => {
    console.log('Edit listing:', listingId);
    // Navigate to edit listing page
  };

  const handleDuplicateListing = (listingId) => {
    console.log('Duplicate listing:', listingId);
    // Handle listing duplication
  };

  const handleToggleListingStatus = (listingId) => {
    console.log('Toggle listing status:', listingId);
    // Handle status toggle
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <GlobalHeader
        userRole="farmer"
        isAuthenticated={true}
        onLanguageChange={handleLanguageChange}
        currentLanguage={currentLanguage}
      />
      {/* Tab Navigation */}
      <TabNavigation
        userRole="farmer"
        notificationCounts={notificationCounts}
      />
      {/* Mobile Menu */}
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        userRole="farmer"
        isAuthenticated={true}
        notificationCounts={notificationCounts}
        currentLanguage={currentLanguage}
      />
      {/* Main Content */}
      <main className="pt-32 lg:pt-36 pb-6 px-4 lg:px-6">
        <div className="max-w-7xl mx-auto">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-text-primary">
                  {currentLanguage === 'am' ? 'እንኳን ደህና መጡ፣ አበበ!' : 'Welcome back, Abebe!'}
                </h1>
                <p className="text-text-secondary mt-1">
                  {currentLanguage === 'am' ?'የእርስዎን የእርሻ ንግድ ያስተዳድሩ እና ሽያጭዎን ይከታተሉ' :'Manage your farm business and track your sales'
                  }
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleRefresh}
                loading={isRefreshing}
                iconName="RefreshCw"
                iconPosition="left"
                className="hidden lg:flex"
              >
                {currentLanguage === 'am' ? 'አድስ' : 'Refresh'}
              </Button>
            </div>
          </div>

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-8">
            {farmerMetrics?.map((metric, index) => (
              <MetricsCard
                key={index}
                {...metric}
                currentLanguage={currentLanguage}
              />
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-text-primary mb-4">
              {currentLanguage === 'am' ? 'ፈጣን እርምጃዎች' : 'Quick Actions'}
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
              {quickActions?.map((action, index) => (
                <QuickActionCard
                  key={index}
                  {...action}
                  currentLanguage={currentLanguage}
                />
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
            {/* Left Column - Produce Listings */}
            <div className="lg:col-span-2 space-y-6">
              {/* Active Listings Section */}
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-text-primary">
                    {currentLanguage === 'am' ? 'የእርስዎ ንቁ ዝርዝሮች' : 'Your Active Listings'}
                  </h2>
                  <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
                    {currentLanguage === 'am' ? 'አዲስ ጨምር' : 'Add New'}
                  </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  {produceListings?.slice(0, 4)?.map((listing) => (
                    <ProduceListingCard
                      key={listing?.id}
                      listing={listing}
                      onEdit={handleEditListing}
                      onDuplicate={handleDuplicateListing}
                      onToggleStatus={handleToggleListingStatus}
                      currentLanguage={currentLanguage}
                    />
                  ))}
                </div>

                {/* View All Listings Button */}
                <div className="mt-6 text-center">
                  <Button variant="outline" iconName="ArrowRight" iconPosition="right">
                    {currentLanguage === 'am' ? 'ሁሉንም ዝርዝሮች ይመልከቱ' : 'View All Listings'} ({produceListings?.length})
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column - Market Trends & Activity */}
            <div className="space-y-6">
              {/* Market Trends Widget */}
              <MarketTrendsWidget currentLanguage={currentLanguage} />

              {/* Recent Activity Feed */}
              <RecentActivityFeed currentLanguage={currentLanguage} />
            </div>
          </div>

          {/* Mobile Pull-to-Refresh Indicator */}
          {isRefreshing && (
            <div className="lg:hidden fixed top-32 left-1/2 transform -translate-x-1/2 z-40">
              <div className="bg-card border border-border rounded-full px-4 py-2 shadow-warm-lg flex items-center space-x-2">
                <Icon name="RefreshCw" size={16} className="text-primary animate-spin" />
                <span className="text-sm text-text-primary">
                  {currentLanguage === 'am' ? 'በመጫን ላይ...' : 'Refreshing...'}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardFarmerHome;
