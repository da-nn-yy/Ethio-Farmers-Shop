import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/ui/GlobalHeader';
import TabNavigation from '../../components/ui/TabNavigation';
import SearchHeader from './components/SearchHeader';
import FilterChips from './components/FilterChips';
import FilterPanel from './components/FilterPanel';
import SortDropdown from './components/SortDropdown';
import ProduceCard from './components/ProduceCard';
import LoadingSkeleton from './components/LoadingSkeleton';
import EmptyState from './components/EmptyState';

const BrowseListingsBuyerHome = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState('relevance');
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [bookmarkedFarmers, setBookmarkedFarmers] = useState(new Set());
  const [cartItems, setCartItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Filter state
  const [filters, setFilters] = useState({
    produceTypes: [],
    regions: [],
    priceRange: { min: '', max: '' },
    verifiedOnly: false
  });

  // Mock data for listings
  const mockListings = [
    {
      id: 1,
      name: "Premium Teff",
      nameAm: "ምርጥ ጤፍ",
      pricePerKg: 85,
      availableQuantity: 150,
      image: "https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg",
      freshness: "Harvested 2 days ago",
      category: "teff",
      farmer: {
        id: 1,
        name: "Abebe Kebede",
        avatar: "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
        location: "Debre Zeit, Oromia",
        rating: 4.8,
        reviewCount: 127,
        phone: "+251911234567",
        isVerified: true
      }
    },
    {
      id: 2,
      name: "Organic Coffee Beans",
      nameAm: "ኦርጋኒክ ቡና",
      pricePerKg: 320,
      availableQuantity: 75,
      image: "https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg",
      freshness: "Fresh roasted",
      category: "coffee",
      farmer: {
        id: 2,
        name: "Almaz Tadesse",
        avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg",
        location: "Jimma, Oromia",
        rating: 4.9,
        reviewCount: 89,
        phone: "+251922345678",
        isVerified: true
      }
    },
    {
      id: 3,
      name: "Fresh Wheat",
      nameAm: "ትኩስ ስንዴ",
      pricePerKg: 45,
      availableQuantity: 200,
      image: "https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg",
      freshness: "Harvested yesterday",
      category: "wheat",
      farmer: {
        id: 3,
        name: "Getachew Molla",
        avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg",
        location: "Bahir Dar, Amhara",
        rating: 4.6,
        reviewCount: 156,
        phone: "+251933456789",
        isVerified: false
      }
    },
    {
      id: 4,
      name: "Yellow Maize",
      nameAm: "ቢጫ በቆሎ",
      pricePerKg: 35,
      availableQuantity: 300,
      image: "https://images.pexels.com/photos/547263/pexels-photo-547263.jpeg",
      freshness: "Harvested 1 week ago",
      category: "maize",
      farmer: {
        id: 4,
        name: "Hanna Wolde",
        avatar: "https://images.pexels.com/photos/1181519/pexels-photo-1181519.jpeg",
        location: "Hawassa, SNNP",
        rating: 4.7,
        reviewCount: 203,
        phone: "+251944567890",
        isVerified: true
      }
    },
    {
      id: 5,
      name: "Red Kidney Beans",
      nameAm: "ቀይ ባቄላ",
      pricePerKg: 95,
      availableQuantity: 120,
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
      freshness: "Dried and ready",
      category: "beans",
      farmer: {
        id: 5,
        name: "Mulugeta Assefa",
        avatar: "https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg",
        location: "Gondar, Amhara",
        rating: 4.5,
        reviewCount: 78,
        phone: "+251955678901",
        isVerified: true
      }
    },
    {
      id: 6,
      name: "Sesame Seeds",
      nameAm: "ሰሊጥ",
      pricePerKg: 180,
      availableQuantity: 80,
      image: "https://images.pexels.com/photos/1435904/pexels-photo-1435904.jpeg",
      freshness: "Premium quality",
      category: "sesame",
      farmer: {
        id: 6,
        name: "Tigist Bekele",
        avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg",
        location: "Humera, Tigray",
        rating: 4.8,
        reviewCount: 145,
        phone: "+251966789012",
        isVerified: true
      }
    },
    {
      id: 7,
      name: "Barley Grain",
      nameAm: "ገብስ",
      pricePerKg: 55,
      availableQuantity: 180,
      image: "https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg",
      freshness: "Harvested 3 days ago",
      category: "barley",
      farmer: {
        id: 7,
        name: "Dawit Haile",
        avatar: "https://images.pexels.com/photos/1043473/pexels-photo-1043473.jpeg",
        location: "Mekelle, Tigray",
        rating: 4.4,
        reviewCount: 92,
        phone: "+251977890123",
        isVerified: false
      }
    },
    {
      id: 8,
      name: "Chickpeas",
      nameAm: "ሽምብራ",
      pricePerKg: 110,
      availableQuantity: 90,
      image: "https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg",
      freshness: "Sun-dried",
      category: "chickpeas",
      farmer: {
        id: 8,
        name: "Meron Tadesse",
        avatar: "https://images.pexels.com/photos/1239288/pexels-photo-1239288.jpeg",
        location: "Dessie, Amhara",
        rating: 4.6,
        reviewCount: 134,
        phone: "+251988901234",
        isVerified: true
      }
    }
  ];

  // Load language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('farmconnect_language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  // Load initial data
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      setListings(mockListings);
      setFilteredListings(mockListings);
      setIsLoading(false);
    };

    loadInitialData();
  }, []);

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('farmconnect_language', newLanguage);
  };

  // Filter and search logic
  const applyFiltersAndSearch = useCallback(() => {
    let filtered = [...listings];

    // Apply search
    if (searchQuery?.trim()) {
      const query = searchQuery?.toLowerCase();
      filtered = filtered?.filter(listing =>
        listing?.name?.toLowerCase()?.includes(query) ||
        (listing?.nameAm && listing?.nameAm?.includes(query)) ||
        listing?.farmer?.name?.toLowerCase()?.includes(query) ||
        listing?.farmer?.location?.toLowerCase()?.includes(query)
      );
    }

    // Apply filters
    if (filters?.produceTypes?.length > 0) {
      filtered = filtered?.filter(listing =>
        filters?.produceTypes?.includes(listing?.category)
      );
    }

    if (filters?.regions?.length > 0) {
      filtered = filtered?.filter(listing => {
        const location = listing?.farmer?.location?.toLowerCase();
        return filters?.regions?.some(region =>
          location?.includes(region?.toLowerCase())
        );
      });
    }

    if (filters?.priceRange?.min || filters?.priceRange?.max) {
      filtered = filtered?.filter(listing => {
        const price = listing?.pricePerKg;
        const min = filters?.priceRange?.min ? parseFloat(filters?.priceRange?.min) : 0;
        const max = filters?.priceRange?.max ? parseFloat(filters?.priceRange?.max) : Infinity;
        return price >= min && price <= max;
      });
    }

    if (filters?.verifiedOnly) {
      filtered = filtered?.filter(listing => listing?.farmer?.isVerified);
    }

    // Apply sorting
    switch (currentSort) {
      case 'priceLowHigh':
        filtered?.sort((a, b) => a?.pricePerKg - b?.pricePerKg);
        break;
      case 'priceHighLow':
        filtered?.sort((a, b) => b?.pricePerKg - a?.pricePerKg);
        break;
      case 'rating':
        filtered?.sort((a, b) => b?.farmer?.rating - a?.farmer?.rating);
        break;
      case 'freshness':
        filtered?.sort((a, b) => a?.id - b?.id); // Mock freshness sort
        break;
      case 'newest':
        filtered?.sort((a, b) => b?.id - a?.id);
        break;
      default:
        // Keep original order for relevance
        break;
    }

    setFilteredListings(filtered);
  }, [listings, searchQuery, filters, currentSort]);

  useEffect(() => {
    applyFiltersAndSearch();
  }, [applyFiltersAndSearch]);

  // Get active filters for chips
  const getActiveFilters = () => {
    const activeFilters = [];

    filters?.produceTypes?.forEach(type => {
      const labels = {
        en: { teff: 'Teff', wheat: 'Wheat', coffee: 'Coffee', maize: 'Maize', beans: 'Beans', sesame: 'Sesame', barley: 'Barley', chickpeas: 'Chickpeas' },
        am: { teff: 'ጤፍ', wheat: 'ስንዴ', coffee: 'ቡና', maize: 'በቆሎ', beans: 'ባቄላ', sesame: 'ሰሊጥ', barley: 'ገብስ', chickpeas: 'ሽምብራ' }
      };
      activeFilters?.push({
        type: 'produceType',
        value: type,
        label: labels?.[currentLanguage]?.[type] || type
      });
    });

    filters?.regions?.forEach(region => {
      const labels = {
        en: { oromia: 'Oromia', amhara: 'Amhara', tigray: 'Tigray', snnp: 'SNNP' },
        am: { oromia: 'ኦሮሚያ', amhara: 'አማራ', tigray: 'ትግራይ', snnp: 'ደቡብ ብሔሮች' }
      };
      activeFilters?.push({
        type: 'region',
        value: region,
        label: labels?.[currentLanguage]?.[region] || region
      });
    });

    if (filters?.priceRange?.min || filters?.priceRange?.max) {
      const min = filters?.priceRange?.min || '0';
      const max = filters?.priceRange?.max || '∞';
      activeFilters?.push({
        type: 'priceRange',
        value: 'price',
        label: `${min} - ${max} ETB`
      });
    }

    if (filters?.verifiedOnly) {
      activeFilters?.push({
        type: 'verification',
        value: 'verified',
        label: currentLanguage === 'am' ? 'የተረጋገጡ ብቻ' : 'Verified Only'
      });
    }

    return activeFilters;
  };

  // Handle filter removal
  const handleRemoveFilter = (filterToRemove) => {
    setFilters(prev => {
      const newFilters = { ...prev };

      switch (filterToRemove?.type) {
        case 'produceType':
          newFilters.produceTypes = prev?.produceTypes?.filter(type => type !== filterToRemove?.value);
          break;
        case 'region':
          newFilters.regions = prev?.regions?.filter(region => region !== filterToRemove?.value);
          break;
        case 'priceRange':
          newFilters.priceRange = { min: '', max: '' };
          break;
        case 'verification':
          newFilters.verifiedOnly = false;
          break;
      }

      return newFilters;
    });
  };

  // Handle clear all filters
  const handleClearAllFilters = () => {
    setFilters({
      produceTypes: [],
      regions: [],
      priceRange: { min: '', max: '' },
      verifiedOnly: false
    });
    setSearchQuery('');
  };

  // Handle add to cart
  const handleAddToCart = async (listingId, quantity) => {
    const listing = listings?.find(l => l?.id === listingId);
    if (listing) {
      setCartItems(prev => {
        const existingItem = prev?.find(item => item?.listingId === listingId);
        if (existingItem) {
          return prev?.map(item =>
            item?.listingId === listingId
              ? { ...item, quantity: item?.quantity + quantity }
              : item
          );
        } else {
          return [...prev, { listingId, quantity, listing }];
        }
      });
    }
  };

  // Handle contact farmer
  const handleContactFarmer = (phoneNumber) => {
    window.open(`tel:${phoneNumber}`, '_self');
  };

  // Handle bookmark toggle
  const handleToggleBookmark = (farmerId) => {
    setBookmarkedFarmers(prev => {
      const newBookmarks = new Set(prev);
      if (newBookmarks?.has(farmerId)) {
        newBookmarks?.delete(farmerId);
      } else {
        newBookmarks?.add(farmerId);
      }
      return newBookmarks;
    });
  };

  // Handle cart click
  const handleCartClick = () => {
    navigate('/order-management');
  };

  // Calculate total cart items
  const totalCartItems = cartItems?.reduce((total, item) => total + item?.quantity, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <GlobalHeader
        userRole="buyer"
        isAuthenticated={true}
        onLanguageChange={handleLanguageChange}
        currentLanguage={currentLanguage}
      />
      {/* Tab Navigation */}
      <TabNavigation
        userRole="buyer"
        notificationCounts={{ orders: 3 }}
      />
      {/* Search Header */}
      <SearchHeader
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        cartItemCount={totalCartItems}
        onCartClick={handleCartClick}
        onFilterClick={() => setIsFilterPanelOpen(true)}
        currentLanguage={currentLanguage}
      />
      {/* Filter Chips */}
      <FilterChips
        activeFilters={getActiveFilters()}
        onRemoveFilter={handleRemoveFilter}
        onClearAll={handleClearAllFilters}
        currentLanguage={currentLanguage}
      />
      {/* Main Content */}
      <div className="flex">
        {/* Desktop Filter Sidebar */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-32 p-6">
            <FilterPanel
              isOpen={true}
              onClose={() => {}}
              filters={filters}
              onApplyFilters={setFilters}
              currentLanguage={currentLanguage}
            />
          </div>
        </div>

        {/* Listings Content */}
        <div className="flex-1 p-4 lg:p-6">
          {/* Sort and Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="text-sm text-text-secondary">
              {isLoading ? (
                <span>Loading...</span>
              ) : (
                <span>
                  {filteredListings?.length} {currentLanguage === 'am' ? 'ውጤቶች' : 'results'}
                  {searchQuery && (
                    <span> for "{searchQuery}"</span>
                  )}
                </span>
              )}
            </div>

            <SortDropdown
              currentSort={currentSort}
              onSortChange={setCurrentSort}
              currentLanguage={currentLanguage}
            />
          </div>

          {/* Listings Grid */}
          {isLoading ? (
            <LoadingSkeleton count={8} />
          ) : filteredListings?.length === 0 ? (
            <EmptyState
              type={searchQuery || getActiveFilters()?.length > 0 ? 'no-results' : 'no-listings'}
              onClearFilters={handleClearAllFilters}
              onRetry={() => window.location?.reload()}
              currentLanguage={currentLanguage}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredListings?.map((listing) => (
                <ProduceCard
                  key={listing?.id}
                  listing={listing}
                  onAddToCart={handleAddToCart}
                  onContactFarmer={handleContactFarmer}
                  onToggleBookmark={handleToggleBookmark}
                  isBookmarked={bookmarkedFarmers?.has(listing?.farmer?.id)}
                  currentLanguage={currentLanguage}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      {/* Mobile Filter Panel */}
      <FilterPanel
        isOpen={isFilterPanelOpen}
        onClose={() => setIsFilterPanelOpen(false)}
        filters={filters}
        onApplyFilters={setFilters}
        currentLanguage={currentLanguage}
      />
    </div>
  );
};

export default BrowseListingsBuyerHome;
