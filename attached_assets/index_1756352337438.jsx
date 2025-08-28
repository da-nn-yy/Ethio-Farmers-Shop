import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/ui/GlobalHeader';
import RoleBasedNavigation from '../../components/ui/RoleBasedNavigation';
import ContextualBreadcrumbs from '../../components/ui/ContextualBreadcrumbs';
import LocationHeader from './components/LocationHeader';
import CategoryFilter from './components/CategoryFilter';
import ProduceListingCard from './components/ProduceListingCard';
import SavedFarmersSection from './components/SavedFarmersSection';
import RecentOrdersWidget from './components/RecentOrdersWidget';
import MarketTrendsWidget from './components/MarketTrendsWidget';
import QuickActionsGrid from './components/QuickActionsGrid';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';

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

  // Mock produce listings data
  const produceListings = [
    {
      id: 1,
      name: "Fresh Organic Tomatoes",
      farmer: {
        id: 1,
        name: "Alemayehu Tadesse",
        phone: "+251911234567",
        isVerified: true,
        location: "Debre Zeit"
      },
      image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop",
      pricePerUnit: 30,
      unit: "kg",
      quantity: 50,
      availability: "high",
      distance: 12,
      marketComparison: 15,
      isNew: true,
      category: "vegetables",
      description: `Fresh organic tomatoes grown without pesticides.\nHarvested this morning for maximum freshness.\nPerfect for salads, cooking, and sauces.`,
      harvestDate: "2024-08-26",
      certifications: ["Organic", "Pesticide-Free"]
    },
    {
      id: 2,
      name: "Sweet Red Onions",
      farmer: {
        id: 2,
        name: "Tigist Bekele",
        phone: "+251922345678",
        isVerified: true,
        location: "Bishoftu"
      },
      image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&h=300&fit=crop",
      pricePerUnit: 25,
      unit: "kg",
      quantity: 30,
      availability: "medium",
      distance: 8,
      marketComparison: 8,
      isNew: false,
      category: "vegetables",
      description: `Premium red onions with sweet flavor.\nIdeal for cooking and raw consumption.\nFreshly harvested and properly stored.`,
      harvestDate: "2024-08-25",
      certifications: ["Fresh", "Quality Assured"]
    },
    {
      id: 3,
      name: "Organic Carrots",
      farmer: {
        id: 3,
        name: "Mulugeta Haile",
        phone: "+251933456789",
        isVerified: false,
        location: "Holeta"
      },
      image: "https://images.unsplash.com/photo-1445282768818-728615cc910a?w=400&h=300&fit=crop",
      pricePerUnit: 35,
      unit: "kg",
      quantity: 25,
      availability: "low",
      distance: 15,
      marketComparison: -5,
      isNew: true,
      category: "vegetables",
      description: `Crunchy organic carrots rich in vitamins.\nGrown in fertile soil without chemicals.\nPerfect for juicing, cooking, or snacking.`,
      harvestDate: "2024-08-26",
      certifications: ["Organic", "Vitamin Rich"]
    },
    {
      id: 4,
      name: "Fresh Green Lettuce",
      farmer: {
        id: 2,
        name: "Tigist Bekele",
        phone: "+251922345678",
        isVerified: true,
        location: "Bishoftu"
      },
      image: "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?w=400&h=300&fit=crop",
      pricePerUnit: 45,
      unit: "kg",
      quantity: 15,
      availability: "medium",
      distance: 8,
      marketComparison: 12,
      isNew: false,
      category: "vegetables",
      description: `Crisp and fresh lettuce leaves.\nPerfect for salads and sandwiches.\nHydroponically grown for consistent quality.`,
      harvestDate: "2024-08-25",
      certifications: ["Hydroponic", "Crisp Fresh"]
    },
    {
      id: 5,
      name: "Ripe Bananas",
      farmer: {
        id: 4,
        name: "Kebede Alemu",
        phone: "+251944567890",
        isVerified: true,
        location: "Awash"
      },
      image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop",
      pricePerUnit: 20,
      unit: "kg",
      quantity: 100,
      availability: "high",
      distance: 25,
      marketComparison: 18,
      isNew: true,
      category: "fruits",
      description: `Sweet and ripe bananas.\nRich in potassium and natural sugars.\nPerfect for breakfast, smoothies, and snacks.`,
      harvestDate: "2024-08-26",
      certifications: ["Natural", "Potassium Rich"]
    },
    {
      id: 6,
      name: "Fresh Mangoes",
      farmer: {
        id: 5,
        name: "Hanna Girma",
        phone: "+251955678901",
        isVerified: true,
        location: "Dire Dawa"
      },
      image: "https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&h=300&fit=crop",
      pricePerUnit: 60,
      unit: "kg",
      quantity: 40,
      availability: "high",
      distance: 35,
      marketComparison: 10,
      isNew: false,
      category: "fruits",
      description: `Juicy and sweet mangoes.\nPerfectly ripened for immediate consumption.\nRich in vitamins A and C.`,
      harvestDate: "2024-08-24",
      certifications: ["Vitamin Rich", "Tree Ripened"]
    }
  ];

  // Load saved language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('preferredLanguage', newLanguage);
  };

  // Handle pull-to-refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsRefreshing(false);
  };

  // Filter listings based on search and category
  const filteredListings = produceListings?.filter(listing => {
    const matchesSearch = listing?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
                         listing?.farmer?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || listing?.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle search
  const handleSearch = (e) => {
    setSearchQuery(e?.target?.value);
  };

  // Handle category change
  const handleCategoryChange = (category) => {
    setSelectedCategory(category?.id);
  };

  // Handle location change
  const handleLocationChange = (location) => {
    setSelectedLocation(location?.name);
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

          {/* Search Bar */}
          <div className="px-4 py-4 bg-background border-b border-border">
            <div className="relative">
              <Input
                type="search"
                placeholder={currentLanguage === 'en' ? 'Search produce, farmers...' : 'ምርት፣ አርሶ አደሮችን ይፈልጉ...'}
                value={searchQuery}
                onChange={handleSearch}
                className="pl-10 pr-4"
              />
              <Icon 
                name="Search" 
                size={20} 
                color="var(--color-muted-foreground)"
                className="absolute left-3 top-1/2 transform -translate-y-1/2"
              />
              {searchQuery && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1"
                >
                  <Icon name="X" size={16} />
                </Button>
              )}
            </div>
          </div>

          {/* Pull to Refresh Indicator */}
          {isRefreshing && (
            <div className="flex items-center justify-center py-4 bg-muted">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <span className="font-body text-sm text-muted-foreground">
                  {currentLanguage === 'en' ? 'Refreshing...' : 'በማደስ ላይ...'}
                </span>
              </div>
            </div>
          )}

          {/* Category Filter */}
          <CategoryFilter
            currentLanguage={currentLanguage}
            onCategoryChange={handleCategoryChange}
          />

          {/* Quick Actions Grid */}
          <QuickActionsGrid currentLanguage={currentLanguage} />

          {/* Market Trends Widget */}
          <div className="px-4 py-6">
            <MarketTrendsWidget currentLanguage={currentLanguage} />
          </div>

          {/* Featured Listings */}
          <div className="px-4 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading text-lg font-semibold text-foreground">
                {currentLanguage === 'en' ? 'Fresh Produce Near You' : 'በአቅራቢያዎ ያሉ ትኩስ ምርቶች'}
              </h3>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate('/browse-listings')}
                className="font-body text-sm text-primary hover:text-primary/80"
              >
                {currentLanguage === 'en' ? 'View All' : 'ሁሉንም ይመልከቱ'}
              </Button>
            </div>

            {filteredListings?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredListings?.slice(0, 6)?.map((listing) => (
                  <ProduceListingCard
                    key={listing?.id}
                    listing={listing}
                    currentLanguage={currentLanguage}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="Search" size={48} color="var(--color-muted-foreground)" className="mx-auto mb-4" />
                <h4 className="font-heading text-lg font-semibold text-foreground mb-2">
                  {currentLanguage === 'en' ? 'No produce found' : 'ምንም ምርት አልተገኘም'}
                </h4>
                <p className="font-body text-sm text-muted-foreground mb-4">
                  {currentLanguage === 'en' ?'Try adjusting your search or browse all categories' :'ፍለጋዎን ማስተካከል ወይም ሁሉንም ምድቦች ማሰስ ይሞክሩ'
                  }
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                  }}
                >
                  {currentLanguage === 'en' ? 'Clear Filters' : 'ማጣሪያዎችን አጽዳ'}
                </Button>
              </div>
            )}
          </div>

          {/* Saved Farmers Section */}
          <SavedFarmersSection currentLanguage={currentLanguage} />

          {/* Recent Orders Widget */}
          <RecentOrdersWidget currentLanguage={currentLanguage} />

          {/* Bottom Spacing for Mobile Navigation */}
          <div className="h-20 md:hidden" />
        </main>
      </div>
    </div>
  );
};

export default BuyerDashboard;