import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContexts";
import { Search, Filter, Leaf, ShoppingCart, Star } from "lucide-react";

const Marketplace = () => {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [organicOnly, setOrganicOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");

  // Load marketplace data
  useEffect(() => {
    loadMarketplaceData();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
    applyFilters();
  }, [listings, searchTerm, selectedCategory, priceRange, organicOnly, sortBy]);

  const loadMarketplaceData = async () => {
    try {
      setLoading(true);
      // TODO: Replace with actual service calls
      // const [availableListings, allCategories] = await Promise.all([
      //   listingService.getAll({ status: "available" }),
      //   categoryService.getAll(),
      // ]);
      // setListings(availableListings);
      // setCategories(allCategories);

      // Mock data for now
      const mockListings = [
        {
          id: "1",
          title: "Fresh Tomatoes",
          description: "Organic tomatoes grown without pesticides",
          pricePerKg: 25,
          unit: "kg",
          availableQuantity: 50,
          category: "vegetables",
          farmerName: "Abebe Kebede",
          farmerLocation: "Addis Ababa",
          rating: 4.5,
          isOrganic: true,
          harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          image: null
        },
        {
          id: "2",
          title: "Sweet Potatoes",
          description: "Fresh sweet potatoes from our farm",
          pricePerKg: 30,
          unit: "kg",
          availableQuantity: 30,
          category: "tubers",
          farmerName: "Tigist Haile",
          farmerLocation: "Bahir Dar",
          rating: 4.8,
          isOrganic: false,
          harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          image: null
        },
        {
          id: "3",
          title: "Green Peppers",
          description: "Spicy green peppers perfect for cooking",
          pricePerKg: 20,
          unit: "kg",
          availableQuantity: 25,
          category: "vegetables",
          farmerName: "Mekonnen Alemu",
          farmerLocation: "Gondar",
          rating: 4.2,
          isOrganic: true,
          harvestDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          image: null
        },
        {
          id: "4",
          title: "Onions",
          description: "Fresh red onions from local farms",
          pricePerKg: 15,
          unit: "kg",
          availableQuantity: 100,
          category: "vegetables",
          farmerName: "Bethel Tadesse",
          farmerLocation: "Addis Ababa",
          rating: 4.6,
          isOrganic: false,
          harvestDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          image: null
        },
        {
          id: "5",
          title: "Organic Carrots",
          description: "Sweet organic carrots rich in vitamins",
          pricePerKg: 35,
          unit: "kg",
          availableQuantity: 40,
          category: "vegetables",
          farmerName: "Yohannes Desta",
          farmerLocation: "Hawassa",
          rating: 4.9,
          isOrganic: true,
          harvestDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
          image: null
        },
        {
          id: "6",
          title: "Fresh Corn",
          description: "Sweet corn harvested at peak freshness",
          pricePerKg: 18,
          unit: "kg",
          availableQuantity: 60,
          category: "grains",
          farmerName: "Alemayehu Tadesse",
          farmerLocation: "Jimma",
          rating: 4.3,
          isOrganic: false,
          harvestDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
          image: null
        }
      ];

      const mockCategories = [
        { id: "vegetables", name: "Vegetables" },
        { id: "fruits", name: "Fruits" },
        { id: "tubers", name: "Tubers" },
        { id: "grains", name: "Grains" },
        { id: "herbs", name: "Herbs" }
      ];

      setListings(mockListings);
      setCategories(mockCategories);
    } catch (error) {
      console.error("Error loading marketplace data:", error);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...listings];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (listing) =>
          listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.farmerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          listing.farmerLocation.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Category filter
    if (selectedCategory !== "all") {
      filtered = filtered.filter((listing) => listing.category === selectedCategory);
    }

    // Price range filter
    if (priceRange !== "all") {
      const [min, max] = priceRange.split("-").map(Number);
      filtered = filtered.filter((listing) => {
        if (max) {
          return listing.pricePerKg >= min && listing.pricePerKg <= max;
        }
        return listing.pricePerKg >= min;
      });
    }

    // Organic filter
    if (organicOnly) {
      filtered = filtered.filter((listing) => listing.isOrganic);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        break;
      case "price-low":
        filtered.sort((a, b) => a.pricePerKg - b.pricePerKg);
        break;
      case "price-high":
        filtered.sort((a, b) => b.pricePerKg - a.pricePerKg);
        break;
      case "harvest-recent":
        filtered.sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime());
        break;
    }

    setFilteredListings(filtered);
  };

  const clearFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange("all");
    setOrganicOnly(false);
    setSortBy("newest");
  };

  const handleAddToCart = (product) => {
    // TODO: Implement add to cart functionality
    console.log("Adding to cart:", product);
    alert(`${product.title} added to cart!`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006C36] mx-auto mb-4"></div>
          <p className="text-[#006C36]">Loading marketplace...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Fresh Produce Marketplace</h1>
          <p className="text-gray-700">Discover fresh, quality produce directly from Ethiopian farmers</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Search & Filter Products
            </h2>
          </div>
          <div className="p-6 space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search products, farmers, or locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006C36] focus:border-transparent"
              />
            </div>

            {/* Filter Controls */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006C36] focus:border-transparent"
                >
                  <option value="all">All Categories</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Price Range (ETB)</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006C36] focus:border-transparent"
                >
                  <option value="all">All Prices</option>
                  <option value="0-50">0 - 50 ETB</option>
                  <option value="50-100">50 - 100 ETB</option>
                  <option value="100-200">100 - 200 ETB</option>
                  <option value="200">200+ ETB</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006C36] focus:border-transparent"
                >
                  <option value="newest">Newest First</option>
                  <option value="price-low">Price: Low to High</option>
                  <option value="price-high">Price: High to Low</option>
                  <option value="harvest-recent">Recently Harvested</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">Options</label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="organic"
                    checked={organicOnly}
                    onChange={(e) => setOrganicOnly(e.target.checked)}
                    className="rounded border-gray-300 text-[#006C36] focus:ring-[#006C36]"
                  />
                  <label htmlFor="organic" className="text-sm flex items-center gap-1 text-gray-700">
                    <Leaf className="h-4 w-4 text-green-600" />
                    Organic Only
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <p className="text-sm text-gray-600">
                Showing {filteredListings.length} of {listings.length} products
              </p>
              <button
                onClick={clearFilters}
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        {filteredListings.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md">
            <div className="text-center py-12">
              <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No products found</h3>
              <p className="text-gray-600 mb-4">
                {searchTerm || selectedCategory !== "all" || priceRange !== "all" || organicOnly
                  ? "Try adjusting your filters to see more products"
                  : "No products are currently available"}
              </p>
              {(searchTerm || selectedCategory !== "all" || priceRange !== "all" || organicOnly) && (
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredListings.map((listing) => (
              <ProductCard
                key={listing.id}
                product={listing}
                onAddToCart={handleAddToCart}
                onClick={() => setSelectedProduct(listing)}
              />
            ))}
          </div>
        )}

        {/* Product Detail Modal */}
        {selectedProduct && (
          <ProductDetailModal
            product={selectedProduct}
            isOpen={!!selectedProduct}
            onClose={() => setSelectedProduct(null)}
            onOrderSuccess={() => {
              setSelectedProduct(null);
              loadMarketplaceData(); // Refresh to update quantities
            }}
          />
        )}
      </div>
    </div>
  );
};

// Product Card Component
const ProductCard = ({ product, onAddToCart, onClick }) => {
  return (
    <div
      className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Product Image */}
      <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="text-center">
            <div className="w-16 h-16 bg-[#006C36] rounded-full flex items-center justify-center mx-auto mb-2">
              <span className="text-white text-2xl">🌾</span>
            </div>
            <p className="text-sm text-gray-500">No image</p>
          </div>
        )}
      </div>

      {/* Product Info */}
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-1">{product.title}</h3>
          <div className="flex items-center gap-1">
            <Star className="h-4 w-4 text-yellow-400 fill-current" />
            <span className="text-sm text-gray-600">{product.rating}</span>
          </div>
        </div>

        <p className="text-gray-600 text-sm mb-3 line-clamp-2">{product.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Price:</span>
            <span className="font-semibold text-[#006C36]">
              {product.pricePerKg} ETB/{product.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Available:</span>
            <span className="text-sm">{product.availableQuantity} {product.unit}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Farmer:</span>
            <span className="text-sm font-medium">{product.farmerName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Location:</span>
            <span className="text-sm">{product.farmerLocation}</span>
          </div>
          {product.isOrganic && (
            <div className="flex items-center gap-1 text-green-600">
              <Leaf className="h-4 w-4" />
              <span className="text-sm font-medium">Organic</span>
            </div>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          className="w-full bg-[#006C36] text-white py-2 px-4 rounded-md hover:bg-[#006C36]/90 transition-colors flex items-center justify-center gap-2"
        >
          <ShoppingCart className="h-4 w-4" />
          Add to Cart
        </button>
      </div>
    </div>
  );
};

// Product Detail Modal Component
const ProductDetailModal = ({ product, isOpen, onClose, onOrderSuccess }) => {
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const handleOrder = () => {
    // TODO: Implement order functionality
    console.log("Ordering:", { product, quantity });
    alert(`Order placed for ${quantity} ${product.unit} of ${product.title}!`);
    onOrderSuccess();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold text-gray-900">{product.title}</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Product Image */}
            <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center">
              {product.image ? (
                <img
                  src={product.image}
                  alt={product.title}
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <div className="text-center">
                  <div className="w-20 h-20 bg-[#006C36] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-white text-3xl">🌾</span>
                  </div>
                  <p className="text-gray-500">No image available</p>
                </div>
              )}
            </div>

            {/* Product Details */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                <p className="text-gray-600">{product.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">Price</span>
                  <p className="font-semibold text-[#006C36] text-lg">
                    {product.pricePerKg} ETB/{product.unit}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Available</span>
                  <p className="font-semibold text-gray-900">
                    {product.availableQuantity} {product.unit}
                  </p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Farmer</span>
                  <p className="font-medium text-gray-900">{product.farmerName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-500">Location</span>
                  <p className="font-medium text-gray-900">{product.farmerLocation}</p>
                </div>
              </div>

              {product.isOrganic && (
                <div className="flex items-center gap-2 text-green-600">
                  <Leaf className="h-5 w-5" />
                  <span className="font-medium">Certified Organic</span>
                </div>
              )}

              <div className="flex items-center gap-2">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <span className="font-medium">{product.rating}</span>
                <span className="text-gray-500">({product.rating}/5)</span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Quantity ({product.unit})
                  </label>
                  <input
                    type="number"
                    min="1"
                    max={product.availableQuantity}
                    value={quantity}
                    onChange={(e) => setQuantity(Math.min(parseInt(e.target.value) || 1, product.availableQuantity))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#006C36] focus:border-transparent"
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleOrder}
                    className="flex-1 bg-[#006C36] text-white py-3 px-4 rounded-md hover:bg-[#006C36]/90 transition-colors font-medium"
                  >
                    Place Order
                  </button>
                  <button
                    onClick={onClose}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 px-4 rounded-md hover:bg-gray-50 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Marketplace;
