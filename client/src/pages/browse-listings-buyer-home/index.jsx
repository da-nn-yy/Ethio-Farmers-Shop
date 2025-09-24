import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingService, orderService, favoriteService } from '../../services/apiService';
import { useAuth } from '../../hooks/useAuth.jsx';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import SearchHeader from './components/SearchHeader';
import FilterChips from './components/FilterChips';
import FilterPanel from './components/FilterPanel';
import SortDropdown from './components/SortDropdown';
import ProduceCard from './components/ProduceCard';
import LoadingSkeleton from './components/LoadingSkeleton';
import EmptyState from './components/EmptyState';
import { useLanguage } from '../../hooks/useLanguage.jsx';
import { useCart } from '../../hooks/useCart.jsx';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const BrowseListingsBuyerHome = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { addItem, updateQuantity, removeItem, clear, items, totalItems, totalCost } = useCart();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [currentSort, setCurrentSort] = useState('relevance');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [lastFetchTime, setLastFetchTime] = useState(null);
  const [bookmarkedFarmers, setBookmarkedFarmers] = useState(new Set());

  // Function to get default image based on category
  const getDefaultImage = () => '/assets/images/no_image.png';
  const [cartItems, setCartItems] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);

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

  // Removed mock listings; we rely on real API data only

  // Load language preference
  useEffect(() => {
    const savedLanguage = localStorage.getItem('farmconnect_language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  useEffect(() => { if (language !== currentLanguage) setCurrentLanguage(language); }, [language]);

  // Load initial data with caching and retry logic
  useEffect(() => {
    const loadInitialData = async (retryCount = 0) => {
      const cacheKey = 'listings_cache';
      const cachedData = localStorage.getItem(cacheKey);
      const cacheTimestamp = localStorage.getItem(`${cacheKey}_timestamp`);
      const now = Date.now();
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

      if (cachedData && cacheTimestamp && (now - parseInt(cacheTimestamp)) < CACHE_DURATION) {
        try {
          const parsedData = JSON.parse(cachedData);
          setListings(parsedData);
          setFilteredListings(parsedData);
          setIsLoading(false);
          return;
        } catch (e) {
          console.warn('Failed to parse cached data, fetching fresh data');
        }
      }

      setIsLoading(true);
      try {
        // Prefer public listings for unauthenticated visibility
        const publicRes = await listingService.getPublicListings();
        if (publicRes && Array.isArray(publicRes.listings)) {
          const transformedListings = publicRes.listings.map(listing => ({
            id: listing.id,
            name: listing.name,
            nameAm: listing.category,
            pricePerKg: parseFloat(listing.pricePerKg || 0),
            availableQuantity: parseFloat(listing.availableQuantity || 0),
            image: listing.image || getDefaultImage(listing.category),
            freshness: 'Fresh from farm',
            category: listing.category,
            farmer: {
              id: listing.farmerUserId,
              name: listing.farmerName,
              avatar: listing.farmerAvatar,
              location: listing.location,
              rating: 4.5,
              reviewCount: 50,
              phone: '+251900000000',
              isVerified: true
            }
          }));
          setListings(transformedListings);
          setFilteredListings(transformedListings);
          setLastFetchTime(now);
          localStorage.setItem(cacheKey, JSON.stringify(transformedListings));
          localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
          return;
        }

        // Fallback to authenticated endpoint if needed
        const response = await listingService.getActiveListings();
        if (response && response.listings && Array.isArray(response.listings)) {
          const transformed = response.listings.map(listing => ({
            id: listing.id,
            name: listing.title || listing.name,
            nameAm: listing.crop,
            pricePerKg: parseFloat(listing.price_per_unit || listing.pricePerKg || 0),
            availableQuantity: parseFloat(listing.quantity || listing.availableQuantity || 0),
            image: listing.image || listing.images?.[0]?.url || getDefaultImage(listing.crop || listing.category),
            freshness: 'Fresh from farm',
            category: listing.crop || listing.category,
            farmer: {
              id: listing.farmer_user_id || listing.farmerUserId,
              name: listing.farmer_name || listing.farmerName,
              avatar: listing.farmer_avatar || listing.farmerAvatar || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
              location: `${listing.region || listing.location}, ${listing.woreda || ''}`,
              rating: 4.5,
              reviewCount: 50,
              phone: listing.farmer_phone || '+251900000000',
              isVerified: true
            }
          }));
          setListings(transformed);
          setFilteredListings(transformed);
          setLastFetchTime(now);
          localStorage.setItem(cacheKey, JSON.stringify(transformed));
          localStorage.setItem(`${cacheKey}_timestamp`, now.toString());
        } else {
          throw new Error('API did not return valid listings data');
        }
        } catch (error) {
        console.error('Failed to fetch listings:', error);
        setListings([]);
        setFilteredListings([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);

  // Manual refresh function
  const handleRefresh = async () => {
    localStorage.removeItem('listings_cache');
    localStorage.removeItem('listings_cache_timestamp');
    setIsRefreshing(true);
    try {
      const publicRes = await listingService.getPublicListings();
      if (publicRes && Array.isArray(publicRes.listings)) {
        const transformedListings = publicRes.listings.map(listing => ({
          id: listing.id,
          name: listing.name,
          nameAm: listing.category,
          pricePerKg: parseFloat(listing.pricePerKg || 0),
          availableQuantity: parseFloat(listing.availableQuantity || 0),
          image: listing.image || getDefaultImage(listing.category),
          freshness: 'Fresh from farm',
          category: listing.category,
          farmer: {
            id: listing.farmerUserId,
            name: listing.farmerName,
            avatar: listing.farmerAvatar,
            location: listing.location,
            rating: 4.5,
            reviewCount: 50,
            phone: '+251900000000',
            isVerified: true
          }
        }));
        setListings(transformedListings);
        setFilteredListings(transformedListings);
        setLastFetchTime(Date.now());
        localStorage.setItem('listings_cache', JSON.stringify(transformedListings));
        localStorage.setItem('listings_cache_timestamp', Date.now().toString());
        return;
      }
    } catch (error) {
      console.error('Failed to refresh public listings, falling back:', error);
    }
    try {
      const response = await listingService.getActiveListings();
      if (response && response.listings && Array.isArray(response.listings)) {
        const transformedListings = response.listings.map(listing => ({
          id: listing.id,
          name: listing.title || listing.name,
          nameAm: listing.crop,
          pricePerKg: parseFloat(listing.price_per_unit || listing.pricePerKg || 0),
          availableQuantity: parseFloat(listing.quantity || listing.availableQuantity || 0),
          image: listing.image || listing.images?.[0]?.url || getDefaultImage(listing.crop || listing.category),
          freshness: 'Fresh from farm',
          category: listing.crop || listing.category,
          farmer: {
            id: listing.farmer_user_id || listing.farmerUserId,
            name: listing.farmer_name || listing.farmerName,
            avatar: listing.farmer_avatar || listing.farmerAvatar || 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg',
            location: `${listing.region || listing.location}, ${listing.woreda || ''}`,
            rating: 4.5,
            reviewCount: 50,
            phone: listing.farmer_phone || '+251900000000',
            isVerified: true
          }
        }));
        setListings(transformedListings);
        setFilteredListings(transformedListings);
        setLastFetchTime(Date.now());
        localStorage.setItem('listings_cache', JSON.stringify(transformedListings));
        localStorage.setItem('listings_cache_timestamp', Date.now().toString());
      }
    } catch (error) {
      console.error('Failed to refresh listings:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

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
        // Keep original order for relevance
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
    } catch {}
  }, [cartItems]);

  // Cart helpers
  const updateCartQuantity = (id, quantity) => updateQuantity(id, quantity);
  const removeCartItem = (id) => removeItem(id);
  const clearCart = () => clear();
  const getCartTotal = () => totalCost;

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
      setIsCartOpen(false);
      alert(currentLanguage === 'am' ? 'ትዕዛዝ ተልኳል!' : 'Order placed!');
    } catch (error) {
      console.error('placeOrder failed', error);
      alert(currentLanguage === 'am' ? 'ትዕዛዝ አልተሳካም።' : 'Failed to place order.');
    }
  };

  // Calculate total cart items
  const totalCartItems = totalItems;

  return (
    <AuthenticatedLayout>
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

      {/* Top filter bar (replaces sidebar) */}
      <div className="p-4 lg:p-6">
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

      {/* Listings Content */}
      <div className="flex-1 p-4 lg:p-6">
          {/* Sort and Results Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
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

              {/* Refresh Button */}
              <button
                onClick={handleRefresh}
                disabled={isLoading || isRefreshing}
                className="p-2 text-text-secondary hover:text-primary transition-colors disabled:opacity-50"
                title={currentLanguage === 'am' ? 'አዲስ አድርግ' : 'Refresh'}
              >
                <Icon
                  name="RefreshCw"
                  size={16}
                  className={isRefreshing ? 'animate-spin' : ''}
                />
              </button>

              {/* Last Updated Time */}
              {lastFetchTime && !isLoading && (
                <span className="text-xs text-text-secondary">
                  {currentLanguage === 'am' ? 'የመጨረሻ ዝመና' : 'Last updated'}: {new Date(lastFetchTime).toLocaleTimeString()}
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
              onRetry={handleRefresh}
              currentLanguage={currentLanguage}
            />
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {filteredListings?.map((listing) => (
                <ProduceCard
                  key={listing?.id}
                  listing={listing}
                  onContactFarmer={handleContactFarmer}
                  onToggleBookmark={handleToggleBookmark}
                  isBookmarked={bookmarkedFarmers?.has(listing?.farmer?.id)}
                  currentLanguage={currentLanguage}
                />
              ))}
            </div>
          )}
      </div>
      {/* Mobile Filter Panel retained for small screens */}
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="text-lg font-semibold text-text-primary">{currentLanguage === 'am' ? 'የግዛት ካርት' : 'Shopping Cart'}</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-text-secondary">×</button>
            </div>
            <div className="p-4 overflow-y-auto max-h-96">
              {items.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="ShoppingCart" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">{currentLanguage === 'am' ? 'ካርት ባዶ ነው' : 'Your cart is empty'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map(item => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <img src={item.image} alt={item.name} className="w-16 h-16 object-cover rounded" />
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
            {items.length > 0 && (
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
    </AuthenticatedLayout>
  );
};

export default BrowseListingsBuyerHome;
