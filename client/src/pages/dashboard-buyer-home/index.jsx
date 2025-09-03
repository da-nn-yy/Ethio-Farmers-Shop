<<<<<<< HEAD
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../firebase';
import GlobalHeader from '../../components/ui/GlobalHeader';
import TabNavigation from '../../components/ui/TabNavigation';
import MobileMenu from '../../components/ui/MobileMenu';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import ProduceListingCard from '../dashboard-farmer-home/components/ProduceListingCard';
=======

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
>>>>>>> 3eda38a82d432751664176e4f857952c5804203a

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
<<<<<<< HEAD
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  // Dashboard data state
  const [allListings, setAllListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search & filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState('newest');

  // Cart state
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
=======
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
>>>>>>> 3eda38a82d432751664176e4f857952c5804203a

  // Load language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem('farmconnect_language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

<<<<<<< HEAD
=======
  // Handle language change
>>>>>>> 3eda38a82d432751664176e4f857952c5804203a
  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('farmconnect_language', newLanguage);
  };

<<<<<<< HEAD
  // Fetch user data safely
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        setIsAuthenticated(true);

        const idToken = await currentUser.getIdToken();
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

        const res = await axios.get(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        setUser(res.data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setIsAuthenticated(false);
      }
    };

    fetchUser();
  }, []);

  // Fetch all produce listings
  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

        // Fetch all active listings from public endpoint
        const response = await axios.get(`${API_BASE}/public/listings`);

        if (response.data.success) {
          // Transform API data to match component expectations
          const transformedListings = response.data.listings.map(listing => ({
            id: listing.id,
            name: listing.name,
            nameAm: listing.category,
            image: listing.image || "https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg",
            pricePerKg: parseFloat(listing.pricePerKg),
            availableQuantity: parseFloat(listing.availableQuantity),
            location: listing.location,
            category: listing.category,
            farmerName: listing.farmerName,
            status: listing.status,
            createdAt: listing.createdAt
          }));

          setAllListings(transformedListings);
          setFilteredListings(transformedListings);
        } else {
          setError('Failed to load produce listings');
        }
      } catch (error) {
        console.error('Failed to fetch listings:', error);
        setError('Failed to load produce listings');
      } finally {
        setIsLoading(false);
      }
    };

    fetchListings();
  }, []);

  // Apply filters and search
  useEffect(() => {
    let filtered = [...allListings];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(listing =>
        listing.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.nameAm?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        listing.location.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(listing => listing.category === selectedCategory);
    }

    // Region filter
    if (selectedRegion !== 'all') {
      filtered = filtered.filter(listing => listing.location === selectedRegion);
    }

    // Price filter
    filtered = filtered.filter(listing =>
      listing.pricePerKg >= priceRange.min && listing.pricePerKg <= priceRange.max
    );

    // Sorting
    switch (sortBy) {
      case 'price-low':
        filtered.sort((a, b) => a.pricePerKg - b.pricePerKg);
        break;
      case 'price-high':
        filtered.sort((a, b) => b.pricePerKg - a.pricePerKg);
        break;
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      default:
        break;
    }

    setFilteredListings(filtered);
  }, [allListings, searchQuery, selectedCategory, selectedRegion, priceRange, sortBy]);

  // Cart functions
  const addToCart = (listing, quantity = 1) => {
    const existingItem = cart.find(item => item.id === listing.id);

    if (existingItem) {
      setCart(cart.map(item =>
        item.id === listing.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setCart([...cart, { ...listing, quantity }]);
    }

    // Show success message
    if (currentLanguage === 'am') {
      alert(`${listing.nameAm || listing.name} ወደ ካርት ተጨምሯል!`);
    } else {
      alert(`${listing.name} added to cart!`);
    }
  };

  const removeFromCart = (listingId) => {
    setCart(cart.filter(item => item.id !== listingId));
  };

  const updateCartQuantity = (listingId, quantity) => {
    if (quantity <= 0) {
      removeFromCart(listingId);
    } else {
      setCart(cart.map(item =>
        item.id === listingId ? { ...item, quantity } : item
      ));
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.pricePerKg * item.quantity), 0);
  };

  const clearCart = () => {
    setCart([]);
    setIsCartOpen(false);
  };

  // Place order
  const placeOrder = async () => {
    if (cart.length === 0) return;

    try {
      const currentUser = auth.currentUser;
      const idToken = await currentUser.getIdToken();
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

      // Create order for each cart item
      const orderPromises = cart.map(item =>
        axios.post(`${API_BASE}/orders`, {
          listingId: item.id,
          quantity: item.quantity,
          totalPrice: item.pricePerKg * item.quantity,
          notes: `Order placed from buyer dashboard`
        }, {
          headers: { Authorization: `Bearer ${idToken}` }
        })
      );

      await Promise.all(orderPromises);

      // Clear cart and show success
      clearCart();
      if (currentLanguage === 'am') {
        alert('ትዕዛዝዎ በተሳካቸ ሁኔታ ተላክቷል!');
      } else {
        alert('Your order has been placed successfully!');
      }

      // Refresh listings to update availability
      window.location.reload();
    } catch (error) {
      console.error('Failed to place order:', error);
      if (currentLanguage === 'am') {
        alert('ትዕዛዝ ማስገባት አልተሳካም። እባክዎ እንደገና ይሞክሩ።');
      } else {
        alert('Failed to place order. Please try again.');
      }
    }
  };

  // Categories and regions
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

  const sortOptions = [
    { value: 'newest', label: 'Newest First', labelAm: 'አዲስ እስከ አሮጌ' },
    { value: 'oldest', label: 'Oldest First', labelAm: 'አሮጌ እስከ አዲስ' },
    { value: 'price-low', label: 'Price: Low to High', labelAm: 'ዋጋ: ከዝቅተኛ እስከ ከፍተኛ' },
    { value: 'price-high', label: 'Price: High to Low', labelAm: 'ዋጋ: ከከፍተኛ እስከ ዝቅተኛ' }
  ];

  // Welcome text
  const welcomeText = currentLanguage === 'am'
    ? `እንኳን ደህና መጡ፣ ${user?.fullName || 'ገዢ'}!`
    : `Welcome, ${user?.fullName || 'Buyer'}!`;

=======
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

>>>>>>> 3eda38a82d432751664176e4f857952c5804203a
  return (
    <div className="min-h-screen bg-background">
      {/* Global Header */}
      <GlobalHeader
<<<<<<< HEAD
        userRole="buyer"
        isAuthenticated={isAuthenticated}
        onLanguageChange={handleLanguageChange}
        currentLanguage={currentLanguage}
      />

      <TabNavigation userRole="buyer" notificationCounts={{ orders: cart.length, total: cart.length }} />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        userRole="buyer"
        isAuthenticated={isAuthenticated}
        notificationCounts={{ orders: cart.length, total: cart.length }}
        currentLanguage={currentLanguage}
      />

      <main className="px-4 pt-32 pb-6 lg:pt-36 lg:px-6">
        <div className="mx-auto max-w-7xl">
          {/* Welcome Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold lg:text-3xl text-text-primary">{welcomeText}</h1>
                <p className="mt-1 text-text-secondary">
                  {currentLanguage === 'am'
                    ? 'ትኩስ ምርቶችን ያግኙ እና ከገበሬዎች በቀጥታ ይግዙ'
                    : 'Discover fresh produce and buy directly from farmers'}
                </p>
              </div>

              {/* Cart Button */}
              <Button
                variant="primary"
                onClick={() => setIsCartOpen(true)}
                iconName="ShoppingCart"
                iconPosition="left"
                className="relative"
              >
                {currentLanguage === 'am' ? 'ካርት' : 'Cart'}
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cart.length}
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={20} className="text-red-500" />
                <span className="text-red-700">{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto"
                >
                  {currentLanguage === 'am' ? 'ዘግብ' : 'Dismiss'}
                </Button>
              </div>
            </div>
          )}

          {/* Search and Filters */}
          <div className="mb-8 p-6 bg-card border border-border rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-text-primary">
              {currentLanguage === 'am' ? 'ፍለጋ እና ማጣራት' : 'Search & Filters'}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              {/* Search Input */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {currentLanguage === 'am' ? 'ፍለጋ' : 'Search'}
                </label>
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={currentLanguage === 'am' ? 'ምርት ያግኙ...' : 'Find produce...'}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {currentLanguage === 'am' ? 'ምድብ' : 'Category'}
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {categories.map(category => (
                    <option key={category.value} value={category.value}>
                      {currentLanguage === 'am' ? category.labelAm : category.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Region Filter */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {currentLanguage === 'am' ? 'ክልል' : 'Region'}
                </label>
                <select
                  value={selectedRegion}
                  onChange={(e) => setSelectedRegion(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {regions.map(region => (
                    <option key={region.value} value={region.value}>
                      {currentLanguage === 'am' ? region.labelAm : region.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {currentLanguage === 'am' ? 'ያድርጉ' : 'Sort By'}
                </label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  {sortOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {currentLanguage === 'am' ? option.labelAm : option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Price Range */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">
                  {currentLanguage === 'am' ? 'የዋጋ ክልል (ETB/kg)' : 'Price Range (ETB/kg)'}
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })}
                    placeholder="Min"
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                  <span className="flex items-center text-text-secondary">-</span>
                  <input
                    type="number"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })}
                    placeholder="Max"
                    className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Results Count */}
              <div className="flex items-end">
                <p className="text-text-secondary">
                  {currentLanguage === 'am'
                    ? `${filteredListings.length} ውጤቶች ተገኝተዋል`
                    : `${filteredListings.length} results found`}
                </p>
              </div>
            </div>
          </div>

          {/* Produce Listings Grid */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">
              {currentLanguage === 'am' ? 'የሚገኙ ምርቶች' : 'Available Produce'}
            </h2>

            {isLoading ? (
              // Loading skeleton
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((listing) => (
                  <div key={listing.id} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img
                        src={listing.image}
                        alt={listing.name}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          listing.status === 'active' ? 'bg-green-100 text-green-800' :
                          listing.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {listing.status === 'active' ? (currentLanguage === 'am' ? 'ንቁ' : 'Active') :
                           listing.status === 'low_stock' ? (currentLanguage === 'am' ? 'ዝቅተኛ ክምችት' : 'Low Stock') :
                           (currentLanguage === 'am' ? 'የተሸጠ' : 'Sold Out')}
                        </span>
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-text-primary mb-2">
                        {currentLanguage === 'am' ? listing.nameAm || listing.name : listing.name}
                      </h3>

                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-primary">
                          ETB {listing.pricePerKg}
                        </span>
                        <span className="text-sm text-text-secondary">
                          {currentLanguage === 'am' ? 'በኪሎ' : 'per kg'}
                        </span>
                      </div>

                      <div className="text-sm text-text-secondary mb-3">
                        <div className="flex items-center space-x-2 mb-1">
                          <Icon name="MapPin" size={16} />
                          <span>{listing.location}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Icon name="Package" size={16} />
                          <span>
                            {currentLanguage === 'am'
                              ? `${listing.availableQuantity} kg ይገኛል`
                              : `${listing.availableQuantity} kg available`}
                          </span>
                        </div>
                      </div>

                      <Button
                        variant="primary"
                        onClick={() => addToCart(listing)}
                        disabled={listing.status !== 'active'}
                        className="w-full"
                        iconName="ShoppingCart"
                        iconPosition="left"
                      >
                        {currentLanguage === 'am' ? 'ወደ ካርት ጨምር' : 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">
                  {currentLanguage === 'am'
                    ? 'ምንም ውጤቶች አልተገኙም። ፍልተቶችዎን ይለውጡ።'
                    : 'No results found. Try adjusting your filters.'}
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedRegion('all');
                    setPriceRange({ min: 0, max: 1000 });
                    setSortBy('newest');
                  }}
                >
                  {currentLanguage === 'am' ? 'ፍልተቶች ያጽዱ' : 'Clear Filters'}
                </Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Shopping Cart Modal */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">
                  {currentLanguage === 'am' ? 'የግዛት ካርት' : 'Shopping Cart'}
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCartOpen(false)}
                  iconName="X"
                />
              </div>
            </div>

            <div className="p-4 overflow-y-auto max-h-96">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="ShoppingCart" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">
                    {currentLanguage === 'am' ? 'ካርትዎ ባዶ ነው' : 'Your cart is empty'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <div key={item.id} className="flex items-center space-x-3 p-3 border border-border rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-medium text-text-primary">
                          {currentLanguage === 'am' ? item.nameAm || item.name : item.name}
                        </h4>
                        <p className="text-sm text-text-secondary">
                          ETB {item.pricePerKg} × {item.quantity} kg
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.id, item.quantity - 1)}
                          iconName="Minus"
                        />
                        <span className="w-8 text-center">{item.quantity}</span>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                          iconName="Plus"
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFromCart(item.id)}
                        iconName="Trash2"
                        className="text-red-500 hover:text-red-700"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between mb-4">
                  <span className="font-semibold text-text-primary">
                    {currentLanguage === 'am' ? 'ጠቅላላ' : 'Total'}
                  </span>
                  <span className="text-xl font-bold text-primary">
                    ETB {getCartTotal()}
                  </span>
                </div>

                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={clearCart}
                    className="flex-1"
                  >
                    {currentLanguage === 'am' ? 'ካርት አጽዳ' : 'Clear Cart'}
                  </Button>
                  <Button
                    variant="primary"
                    onClick={placeOrder}
                    className="flex-1"
                    iconName="ShoppingBag"
                    iconPosition="left"
                  >
                    {currentLanguage === 'am' ? 'ትዕዛዝ አሳልም' : 'Place Order'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
=======
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
>>>>>>> 3eda38a82d432751664176e4f857952c5804203a
    </div>
  );
};

export default BuyerDashboard;
