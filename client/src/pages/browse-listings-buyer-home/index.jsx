import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingService, orderService, favoriteService } from '../../services/apiService';
import { useAuth } from '../../hooks/useAuth.jsx';
import GlobalHeader from '../../components/ui/GlobalHeader';
import TabNavigation from '../../components/ui/TabNavigation';
import SearchHeader from './components/SearchHeader';
import FilterChips from './components/FilterChips';
import FilterPanel from './components/FilterPanel';
import SortDropdown from './components/SortDropdown';
import ProduceCard from './components/ProduceCard';
import LoadingSkeleton from './components/LoadingSkeleton';
import EmptyState from './components/EmptyState';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';

const BrowseListingsBuyerHome = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState('relevance');
  const [isLoading, setIsLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [recommendedListings, setRecommendedListings] = useState([]);
  const [bookmarkedFarmers, setBookmarkedFarmers] = useState(new Set());
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

  // Compute proximity score based on buyer's woreda and region vs listing location
  const getProximityScore = useCallback((listing) => {
    const buyerRegion = (user?.region || '').toLowerCase();
    const buyerWoreda = (user?.woreda || '').toLowerCase();
    const location = ((listing?.location || listing?.farmer?.location || '')).toLowerCase();
    let score = 0;
    if (buyerRegion && location.includes(buyerRegion)) score += 1;
    if (buyerWoreda && location.includes(buyerWoreda)) score += 2;
    return score;
  }, [user?.region, user?.woreda]);

  // Old-dashboard-style single-select filters
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const categories = [
    { value: 'all', label: 'All Categories', labelAm: 'ሁሉም ምድቦች' },
    { value: 'vegetables', label: 'Vegetables', labelAm: 'አትክልቶች' },
    { value: 'fruits', label: 'Fruits', labelAm: 'ፍራፍሬዎች' },
    { value: 'grains', label: 'Grains', labelAm: 'እህሎች' },
    { value: 'legumes', label: 'Legumes', labelAm: 'ጥራጥሮች' },
    { value: 'spices', label: 'Spices', labelAm: 'ቅመሞች' }
  ];
  const regions = [
    { value: 'all', label: 'All Regions', labelAm: 'ሁሉም ክልሎች' },
    { value: 'Addis Ababa', label: 'Addis Ababa', labelAm: 'አዲስ አበባ' },
    { value: 'Oromia', label: 'Oromia', labelAm: 'ኦሮሚያ' },
    { value: 'Amhara', label: 'Amhara', labelAm: 'አማራ' },
    { value: 'Tigray', label: 'Tigray', labelAm: 'ትግራይ' },
    { value: 'SNNP', label: 'SNNP', labelAm: 'ደቡብ ብሔሮች' },
    { value: 'Somali', label: 'Somali', labelAm: 'ሶማሌ' },
    { value: 'Afar', label: 'Afar', labelAm: 'አፋር' }
  ];

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
      try {
        // Use the new API service to fetch listings
        const response = await listingService.getActiveListings();

        if (response.listings) {
          const transformedListings = response.listings.map(listing => ({
            id: listing.id,
            name: listing.name,
            nameAm: listing.nameAm,
            pricePerKg: Number(listing.pricePerKg),
            availableQuantity: Number(listing.availableQuantity),
            image: listing.image || "https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg",
            freshness: "Fresh from farm",
            category: listing.category,
            location: listing.location,
            createdAt: listing.createdAt ? new Date(listing.createdAt) : null,
            farmer: {
              id: listing.farmerUserId || null,
              name: listing.farmerName,
              avatar: listing.farmerAvatar || "https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg",
              location: listing.location,
              rating: 4.5,
              reviewCount: 50,
              phone: listing.farmerPhone || "+251900000000",
              isVerified: true
            }
          }));

          setListings(transformedListings);
          setFilteredListings(transformedListings);
          // Recommended: newest first (ignore region proximity)
          const newestRecommended = [...transformedListings].sort((a, b) => {
            if (a.createdAt && b.createdAt) return b.createdAt - a.createdAt;
            return (b.id || 0) - (a.id || 0);
          });
          setRecommendedListings(newestRecommended.slice(0, 8));
        } else {
          throw new Error('API did not return listings');
        }
      } catch (error) {
        console.error('Failed to fetch listings:', error);
        // Fallback to mock data if API fails
        setListings(mockListings);
        setFilteredListings(mockListings);
        setRecommendedListings(mockListings.slice(0, 8));
      } finally {
        setIsLoading(false);
      }
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

    // Apply single-select filters like old dashboard
    if (selectedCategory && selectedCategory !== 'all') {
      filtered = filtered?.filter(listing => listing?.category === selectedCategory);
    }

    if (selectedRegion && selectedRegion !== 'all') {
      filtered = filtered?.filter(listing => {
        const location = (listing?.farmer?.location || listing?.location || '')?.toLowerCase();
        return location === selectedRegion?.toLowerCase() || location?.includes(selectedRegion?.toLowerCase());
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
        // Relevance: prioritize proximity to buyer
        filtered?.sort((a, b) => {
          const psA = getProximityScore(a);
          const psB = getProximityScore(b);
          if (psB !== psA) return psB - psA;
          // tie-breaker by newest
          if (a.createdAt && b.createdAt) return b.createdAt - a.createdAt;
          return (b.id || 0) - (a.id || 0);
        });
        break;
    }

    setFilteredListings(filtered);
  }, [listings, searchQuery, selectedCategory, selectedRegion, filters, currentSort]);

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
    if (!listing) return;

    setCartItems(prev => {
      const existingItem = prev?.find(item => item?.id === listingId);
      if (existingItem) {
        return prev?.map(item =>
          item?.id === listingId
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      const normalized = {
        id: listing.id,
        name: listing.name,
        nameAm: listing.nameAm,
        image: listing.image,
        pricePerKg: listing.pricePerKg,
        quantity: quantity
      };
      return [...prev, normalized];
    });
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

  // Handle cart click -> open mini cart
  const handleCartClick = () => {
    setIsCartOpen(true);
  };

  // Persist cart to localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('buyer_cart');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) setCartItems(parsed);
      }
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('buyer_cart', JSON.stringify(cartItems));
      // Notify other components (e.g., header) in the same tab
      window.dispatchEvent(new Event('buyer_cart_updated'));
    } catch {}
  }, [cartItems]);

  // Auto-open cart when navigated with #cart and react to hash changes
  useEffect(() => {
    const openIfHashCart = () => {
      if (window.location.hash === '#cart') setIsCartOpen(true);
    };
    openIfHashCart();
    window.addEventListener('hashchange', openIfHashCart);
    const openOnEvent = () => setIsCartOpen(true);
    window.addEventListener('open_buyer_cart', openOnEvent);
    return () => window.removeEventListener('hashchange', openIfHashCart);
  }, []);

  // Cart helpers
  const updateCartQuantity = (id, quantity) => {
    setCartItems(prev => {
      if (quantity <= 0) return prev.filter(i => i.id !== id);
      return prev.map(i => i.id === id ? { ...i, quantity } : i);
    });
  };
  const removeCartItem = (id) => setCartItems(prev => prev.filter(i => i.id !== id));
  const clearCart = () => setCartItems([]);
  const getCartTotal = () => cartItems.reduce((t, i) => t + (Number(i.pricePerKg) || 0) * (Number(i.quantity) || 0), 0);

  const placeOrder = async () => {
    if (!cartItems.length) return;

    if (!isAuthenticated) {
      navigate('/authentication-login-register');
      return;
    }

    try {
      // Create order with multiple items
      const orderData = {
        items: cartItems.map(item => ({
          listingId: item.id,
          quantity: item.quantity
        })),
        notes: 'Order placed from buyer dashboard',
        deliveryFee: 0
      };

      await orderService.createOrder(orderData);
      clearCart();
      try {
        localStorage.setItem('buyer_cart', JSON.stringify([]));
        window.dispatchEvent(new Event('buyer_cart_updated'));
      } catch {}
      setIsCartOpen(false);
      alert(currentLanguage === 'am' ? 'ትዕዛዝ ተልኳል!' : 'Order placed!');
      navigate('/order-management');
    } catch (error) {
      console.error('placeOrder failed', error);
      alert(currentLanguage === 'am' ? 'ትዕዛዝ አልተሳካም።' : 'Failed to place order.');
    }
  };

  // Calculate total cart items
  const totalCartItems = cartItems?.reduce((total, item) => total + (Number(item?.quantity) || 0), 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <GlobalHeader
        userRole={user?.role || "buyer"}
        isAuthenticated={isAuthenticated}
        onLanguageChange={handleLanguageChange}
        currentLanguage={currentLanguage}
      />
      {/* Tab Navigation - show Dashboard label for buyers */}
      <TabNavigation userRole="buyer" />
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
        {/* Desktop Filter Sidebar from previous dashboard */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky p-6 top-32">
            <FilterPanel
              isOpen={true}
              onClose={() => {}}
              filters={filters}
              onApplyFilters={(f) => {
                setFilters(f);
                setSelectedCategory((f?.produceTypes && f.produceTypes[0]) || 'all');
                setSelectedRegion((f?.regions && f.regions[0]) || 'all');
                setCurrentSort(f?.sort || currentSort);
              }}
              currentLanguage={currentLanguage}
              selectedCategory={selectedCategory}
              selectedRegion={selectedRegion}
              currentSort={currentSort}
              categoryOptions={categories.map(c => ({ id: c.value, label: currentLanguage === 'am' ? c.labelAm : c.label }))}
              regionOptions={regions.map(r => ({ id: r.label, label: currentLanguage === 'am' ? r.labelAm : r.label }))}
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
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
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
        onApplyFilters={(f) => {
          setFilters(f);
          setSelectedCategory((f?.produceTypes && f.produceTypes[0]) || 'all');
          setSelectedRegion((f?.regions && f.regions[0]) || 'all');
          setCurrentSort(f?.sort || currentSort);
        }}
        currentLanguage={currentLanguage}
        selectedCategory={selectedCategory}
        selectedRegion={selectedRegion}
        currentSort={currentSort}
        categoryOptions={categories.map(c => ({ id: c.value, label: currentLanguage === 'am' ? c.labelAm : c.label }))}
        regionOptions={regions.map(r => ({ id: r.label, label: currentLanguage === 'am' ? r.labelAm : r.label }))}
      />

      {/* Mini Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="text-lg font-semibold text-text-primary">{currentLanguage === 'am' ? 'የግዛት ካርት' : 'Shopping Cart'}</h3>
              <button onClick={() => { setIsCartOpen(false); try { if (window.location.hash === '#cart') window.location.hash = ''; } catch {} }} className="text-text-secondary">×</button>
            </div>
            <div className="p-4 overflow-y-auto max-h-96">
              {cartItems.length === 0 ? (
                <div className="py-8 text-center">
                  <Icon name="ShoppingCart" size={48} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-500">{currentLanguage === 'am' ? 'ካርት ባዶ ነው' : 'Your cart is empty'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex items-center p-3 space-x-3 border rounded-lg border-border">
                      <img src={item.image} alt={item.name} className="object-cover w-16 h-16 rounded" />
                      <div className="flex-1">
                        <h4 className="font-medium text-text-primary">{currentLanguage === 'am' ? item.nameAm || item.name : item.name}</h4>
                        <p className="text-sm text-text-secondary">ETB {item.pricePerKg} × {item.quantity} kg</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button variant="outline" size="sm" onClick={() => updateCartQuantity(item.id, item.quantity - 1)} iconName="Minus" />
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button variant="outline" size="sm" onClick={() => updateCartQuantity(item.id, item.quantity + 1)} iconName="Plus" />
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeCartItem(item.id)} iconName="Trash2" className="text-red-500 hover:text-red-700" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cartItems.length > 0 && (
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-text-primary">{currentLanguage === 'am' ? 'ጠቅላላ' : 'Total'}</span>
                  <span className="text-xl font-bold text-primary">ETB {getCartTotal()}</span>
                </div>
                <div className="flex space-x-2">
                  <Button variant="outline" onClick={clearCart} className="flex-1">{currentLanguage === 'am' ? 'ካርት አጽዳ' : 'Clear Cart'}</Button>
                  <Button variant="primary" onClick={placeOrder} className="flex-1" iconName="ShoppingBag" iconPosition="left">{currentLanguage === 'am' ? 'ትዕዛዝ አሳልም' : 'Place Order'}</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default BrowseListingsBuyerHome;
