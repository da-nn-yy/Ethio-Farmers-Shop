import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../firebase';
import GlobalHeader from '../../components/ui/GlobalHeader';
import TabNavigation from '../../components/ui/TabNavigation';
import MobileMenu from '../../components/ui/MobileMenu';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const [allListings, setAllListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedRegion, setSelectedRegion] = useState('all');
  const [priceRange, setPriceRange] = useState({ min: 0, max: 1000 });
  const [sortBy, setSortBy] = useState('newest');

  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    const savedLanguage = localStorage.getItem('farmconnect_language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('farmconnect_language', newLanguage);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;
        setIsAuthenticated(true);
        const idToken = await currentUser.getIdToken();
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        const res = await axios.get(`${API_BASE}/users/me`, { headers: { Authorization: `Bearer ${idToken}` } });
        setUser(res.data);
      } catch (e) {
        console.error('Failed to fetch user data:', e);
        setIsAuthenticated(false);
      }
    };
    fetchUser();
  }, []);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        const res = await axios.get(`${API_BASE}/public/listings`);
        if (res.data.success) {
          const transformed = res.data.listings.map((l) => ({
            id: l.id,
            name: l.name,
            nameAm: l.category,
            image: l.image || 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg',
            pricePerKg: Number(l.pricePerKg),
            availableQuantity: Number(l.availableQuantity),
            location: l.location,
            category: l.category,
            farmerName: l.farmerName,
            status: l.status,
            createdAt: l.createdAt,
          }));
          setAllListings(transformed);
          setFilteredListings(transformed);
        } else {
          setError('Failed to load produce listings');
        }
      } catch (e) {
        console.error('Failed to fetch listings:', e);
        setError('Failed to load produce listings');
      } finally {
        setIsLoading(false);
      }
    };
    fetchListings();
  }, []);

  useEffect(() => {
    let filtered = [...allListings];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((l) =>
        l.name.toLowerCase().includes(q) ||
        (l.nameAm && l.nameAm.toLowerCase().includes(q)) ||
        (l.location && l.location.toLowerCase().includes(q))
      );
    }
    if (selectedCategory !== 'all') filtered = filtered.filter((l) => l.category === selectedCategory);
    if (selectedRegion !== 'all') filtered = filtered.filter((l) => l.location === selectedRegion);
    filtered = filtered.filter((l) => l.pricePerKg >= priceRange.min && l.pricePerKg <= priceRange.max);
    switch (sortBy) {
      case 'price-low': filtered.sort((a, b) => a.pricePerKg - b.pricePerKg); break;
      case 'price-high': filtered.sort((a, b) => b.pricePerKg - a.pricePerKg); break;
      case 'newest': filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)); break;
      case 'oldest': filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)); break;
      default: break;
    }
    setFilteredListings(filtered);
  }, [allListings, searchQuery, selectedCategory, selectedRegion, priceRange, sortBy]);

  const addToCart = (listing, quantity = 1) => {
    const existing = cart.find((i) => i.id === listing.id);
    if (existing) setCart(cart.map((i) => (i.id === listing.id ? { ...i, quantity: i.quantity + quantity } : i)));
    else setCart([...cart, { ...listing, quantity }]);
    alert(currentLanguage === 'am' ? `${listing.nameAm || listing.name} ወደ ካርት ተጨምሯል!` : `${listing.name} added to cart!`);
  };
  const removeFromCart = (id) => setCart(cart.filter((i) => i.id !== id));
  const updateCartQuantity = (id, quantity) => {
    if (quantity <= 0) return removeFromCart(id);
    setCart(cart.map((i) => (i.id === id ? { ...i, quantity } : i)));
  };
  const getCartTotal = () => cart.reduce((t, i) => t + i.pricePerKg * i.quantity, 0);
  const clearCart = () => { setCart([]); setIsCartOpen(false); };

  const placeOrder = async () => {
    if (cart.length === 0) return;
    try {
      const currentUser = auth.currentUser;
      const idToken = await currentUser.getIdToken();
      const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      await Promise.all(cart.map((item) => axios.post(`${API_BASE}/orders`, {
        listingId: item.id,
        quantity: item.quantity,
        totalPrice: item.pricePerKg * item.quantity,
        notes: 'Order placed from buyer dashboard'
      }, { headers: { Authorization: `Bearer ${idToken}` } })));
      clearCart();
      alert(currentLanguage === 'am' ? 'ትዕዛዝዎ በተሳካቸ ሁኔታ ተላክቷል!' : 'Your order has been placed successfully!');
      window.location.reload();
    } catch (e) {
      console.error('Failed to place order:', e);
      alert(currentLanguage === 'am' ? 'ትዕዛዝ ማስገባት አልተሳካም። እባክዎ እንደገና ይሞክሩ።' : 'Failed to place order. Please try again.');
    }
  };

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

  const welcomeText = currentLanguage === 'am' ? `እንኳን ደህና መጡ፣ ${user?.fullName || 'ገዢ'}!` : `Welcome, ${user?.fullName || 'Buyer'}!`;

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader userRole="buyer" isAuthenticated={isAuthenticated} onLanguageChange={handleLanguageChange} currentLanguage={currentLanguage} />
      <TabNavigation userRole="buyer" notificationCounts={{ orders: cart.length, total: cart.length }} />
      <MobileMenu isOpen={isMobileMenuOpen} onClose={() => setIsMobileMenuOpen(false)} userRole="buyer" isAuthenticated={isAuthenticated} notificationCounts={{ orders: cart.length, total: cart.length }} currentLanguage={currentLanguage} />

      <main className="px-4 pt-32 pb-6 lg:pt-36 lg:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold lg:text-3xl text-text-primary">{welcomeText}</h1>
                <p className="mt-1 text-text-secondary">{currentLanguage === 'am' ? 'ትኩስ ምርቶችን ያግኙ እና ከገበሬዎች በቀጥታ ይግዙ' : 'Discover fresh produce and buy directly from farmers'}</p>
              </div>
              <Button variant="primary" onClick={() => setIsCartOpen(true)} iconName="ShoppingCart" iconPosition="left" className="relative">
                {currentLanguage === 'am' ? 'ካርት' : 'Cart'}
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">{cart.length}</span>
                )}
              </Button>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={20} className="text-red-500" />
                <span className="text-red-700">{error}</span>
                <Button variant="outline" size="sm" onClick={() => setError(null)} className="ml-auto">{currentLanguage === 'am' ? 'ዘግብ' : 'Dismiss'}</Button>
              </div>
            </div>
          )}

          <div className="mb-8 p-6 bg-card border border-border rounded-lg">
            <h2 className="text-lg font-semibold mb-4 text-text-primary">{currentLanguage === 'am' ? 'ፍለጋ እና ማጣራት' : 'Search & Filters'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{currentLanguage === 'am' ? 'ፍለጋ' : 'Search'}</label>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={currentLanguage === 'am' ? 'ምርት ያግኙ...' : 'Find produce...'} className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{currentLanguage === 'am' ? 'ምድብ' : 'Category'}</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                  {categories.map((c) => (
                    <option key={c.value} value={c.value}>{currentLanguage === 'am' ? c.labelAm : c.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{currentLanguage === 'am' ? 'ክልል' : 'Region'}</label>
                <select value={selectedRegion} onChange={(e) => setSelectedRegion(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                  {regions.map((r) => (
                    <option key={r.value} value={r.value}>{currentLanguage === 'am' ? r.labelAm : r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{currentLanguage === 'am' ? 'ያድርጉ' : 'Sort By'}</label>
                <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="w-full px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent">
                  {sortOptions.map((o) => (
                    <option key={o.value} value={o.value}>{currentLanguage === 'am' ? o.labelAm : o.label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-2">{currentLanguage === 'am' ? 'የዋጋ ክልል (ETB/kg)' : 'Price Range (ETB/kg)'}</label>
                <div className="flex space-x-2">
                  <input type="number" value={priceRange.min} onChange={(e) => setPriceRange({ ...priceRange, min: Number(e.target.value) })} placeholder="Min" className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                  <span className="flex items-center text-text-secondary">-</span>
                  <input type="number" value={priceRange.max} onChange={(e) => setPriceRange({ ...priceRange, max: Number(e.target.value) })} placeholder="Max" className="flex-1 px-3 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent" />
                </div>
              </div>
              <div className="flex items-end">
                <p className="text-text-secondary">{currentLanguage === 'am' ? `${filteredListings.length} ውጤቶች ተገኝተዋል` : `${filteredListings.length} results found`}</p>
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 text-text-primary">{currentLanguage === 'am' ? 'የሚገኙ ምርቶች' : 'Available Produce'}</h2>
            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (<div key={i} className="h-64 bg-gray-200 rounded-lg animate-pulse" />))}
              </div>
            ) : filteredListings.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredListings.map((l) => (
                  <div key={l.id} className="bg-card border border-border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative">
                      <img src={l.image} alt={l.name} className="w-full h-48 object-cover" />
                      <div className="absolute top-2 right-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${l.status === 'active' ? 'bg-green-100 text-green-800' : l.status === 'low_stock' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {l.status === 'active' ? (currentLanguage === 'am' ? 'ንቁ' : 'Active') : l.status === 'low_stock' ? (currentLanguage === 'am' ? 'ዝቅተኛ ክምችት' : 'Low Stock') : (currentLanguage === 'am' ? 'የተሸጠ' : 'Sold Out')}
                        </span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-lg text-text-primary mb-2">{currentLanguage === 'am' ? l.nameAm || l.name : l.name}</h3>
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl font-bold text-primary">ETB {l.pricePerKg}</span>
                        <span className="text-sm text-text-secondary">{currentLanguage === 'am' ? 'በኪሎ' : 'per kg'}</span>
                      </div>
                      <div className="text-sm text-text-secondary mb-3">
                        <div className="flex items-center space-x-2 mb-1"><Icon name="MapPin" size={16} /><span>{l.location}</span></div>
                        <div className="flex items-center space-x-2"><Icon name="Package" size={16} /><span>{currentLanguage === 'am' ? `${l.availableQuantity} kg ይገኛል` : `${l.availableQuantity} kg available`}</span></div>
                      </div>
                      <Button variant="primary" onClick={() => addToCart(l)} disabled={l.status !== 'active'} className="w-full" iconName="ShoppingCart" iconPosition="left">
                        {currentLanguage === 'am' ? 'ወደ ካርት ጨምር' : 'Add to Cart'}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Icon name="Search" size={48} className="mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500 mb-4">{currentLanguage === 'am' ? 'ምንም ውጤቶች አልተገኙም። ፍልተቶችዎን ይለውጡ።' : 'No results found. Try adjusting your filters.'}</p>
                <Button variant="outline" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); setSelectedRegion('all'); setPriceRange({ min: 0, max: 1000 }); setSortBy('newest'); }}>{currentLanguage === 'am' ? 'ፍልተቶች ያጽዱ' : 'Clear Filters'}</Button>
              </div>
            )}
          </div>
        </div>
      </main>

      {isCartOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="p-4 border-b border-border">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-text-primary">{currentLanguage === 'am' ? 'የግዛት ካርት' : 'Shopping Cart'}</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsCartOpen(false)} iconName="X" />
              </div>
            </div>
            <div className="p-4 overflow-y-auto max-h-96">
              {cart.length === 0 ? (
                <div className="text-center py-8">
                  <Icon name="ShoppingCart" size={48} className="mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-500">{currentLanguage === 'am' ? 'ካርትዎ ባዶ ነው' : 'Your cart is empty'}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
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
                      <Button variant="ghost" size="sm" onClick={() => removeFromCart(item.id)} iconName="Trash2" className="text-red-500 hover:text-red-700" />
                    </div>
                  ))}
                </div>
              )}
            </div>
            {cart.length > 0 && (
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

export default BuyerDashboard;
