import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContexts";
import { Search, Star } from "lucide-react";
import { productsAPI } from "../services/api";

const Home = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFeaturedProducts();
  }, []);

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true);
      const response = await productsAPI.getFeatured();
      setFeaturedProducts(response.data || []);
    } catch (error) {
      console.error("Error loading featured products:", error);
      setFeaturedProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      window.location.href = `/marketplace?query=${encodeURIComponent(searchQuery)}`;
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="py-20 bg-gradient-to-b from-green-50 to-white">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto">
            {currentUser && (
              <div className="mb-6">
                <p className="text-lg text-[#006C36] font-medium">
                  Welcome back, {currentUser.displayName || currentUser.email}!
                  {currentUser.email?.includes("farmer") ? " Ready to list your produce?" : " Ready to find fresh produce?"}
                </p>
              </div>
            )}
            <h2 className="font-serif font-bold text-4xl md:text-6xl text-gray-900 mb-6">
              Fresh Produce from Ethiopian Farmers
            </h2>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Connect directly with local farmers and get fresh, quality produce delivered to your doorstep.
              Support local agriculture while enjoying the best of Ethiopian farming.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              {currentUser ? (
                currentUser.email?.includes("farmer") ? (
                  <>
                    <button className="bg-[#006C36] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#006C36]/90 transition-colors">
                      Create Listing
                    </button>
                    <button
                      onClick={() => window.location.href = '/farmer-dashboard'}
                      className="border-2 border-[#006C36] text-[#006C36] px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#006C36]/10 transition-colors"
                    >
                      My Listings
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => window.location.href = '/marketplace'}
                      className="bg-[#006C36] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#006C36]/90 transition-colors"
                    >
                      Browse Marketplace
                    </button>
                    <button
                      onClick={() => window.location.href = '/buyer-dashboard'}
                      className="border-2 border-[#006C36] text-[#006C36] px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#006C36]/10 transition-colors"
                    >
                      My Orders
                    </button>
                  </>
                )
              ) : (
                <>
                  <button
                    onClick={() => window.location.href = '/marketplace'}
                    className="bg-[#006C36] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#006C36]/90 transition-colors"
                  >
                    Browse Marketplace
                  </button>
                  <button
                    onClick={() => window.location.href = '/signup'}
                    className="border-2 border-[#006C36] text-[#006C36] px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#006C36]/10 transition-colors"
                  >
                    Join as Farmer
                  </button>
                </>
              )}
            </div>
            <div className="max-w-md mx-auto">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for fresh produce..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 text-lg border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#006C36] focus:border-transparent"
                />
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="font-serif font-bold text-3xl text-gray-900 mb-4">Why Choose Ethio Farmers?</h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              We eliminate intermediaries to ensure farmers get fair prices while buyers access the freshest produce
              directly from the source.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-12 h-12 bg-[#006C36]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-[#006C36] text-2xl">👥</span>
              </div>
              <h4 className="font-serif font-semibold text-xl text-gray-900 mb-3">Direct Connection</h4>
              <p className="text-gray-600 text-base">
                Connect directly with local farmers and buyers, building lasting relationships and trust in the
                community.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-12 h-12 bg-[#006C36]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-[#006C36] text-2xl">📈</span>
              </div>
              <h4 className="font-serif font-semibold text-xl text-gray-900 mb-3">Fair Pricing</h4>
              <p className="text-gray-600 text-base">
                Market-driven pricing ensures farmers receive fair compensation while buyers get competitive rates.
              </p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6 text-center">
              <div className="w-12 h-12 bg-[#006C36]/10 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-[#006C36] text-2xl">🛡️</span>
              </div>
              <h4 className="font-serif font-semibold text-xl text-gray-900 mb-3">Quality Assured</h4>
              <p className="text-gray-600 text-base">
                Verified farmers and quality ratings ensure you receive the freshest, highest-quality produce.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <h3 className="font-serif font-bold text-3xl text-gray-900">Featured Products</h3>
            <button
              onClick={() => window.location.href = '/marketplace'}
              className="px-6 py-2 border-2 border-[#006C36] text-[#006C36] rounded-lg font-medium hover:bg-[#006C36]/10 transition-colors"
            >
              View All
            </button>
          </div>

          {loading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
                  <div className="aspect-[4/3] bg-gray-200"></div>
                  <div className="p-4 space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map((product, index) => (
                <div key={product.id || index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="aspect-[4/3] overflow-hidden bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.title}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
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
                  <div className="p-4">
                    <h4 className="font-serif font-semibold text-lg mb-1 text-gray-900">{product.title}</h4>
                    <p className="text-gray-600 text-sm mb-2">{product.farmerName}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-[#006C36] text-lg">{product.pricePerKg} ETB/{product.unit}</span>
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                        <span className="text-sm font-medium">{product.averageRating || "N/A"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!loading && featuredProducts.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-gray-400 text-2xl">🌾</span>
              </div>
              <h3 className="text-lg font-semibold mb-2 text-gray-600">No featured products available</h3>
              <p className="text-gray-500">Check back soon for fresh produce from local farmers</p>
            </div>
          )}
        </div>
      </section>

      {/* Language Support Banner */}
      <section className="py-12 bg-[#006C36]/5">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-[#006C36] text-2xl">🌍</span>
            <h3 className="font-serif font-bold text-2xl text-gray-900">Available in Multiple Languages</h3>
          </div>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Our platform supports both English and Amharic to ensure accessibility for all Ethiopian farmers and buyers.
          </p>
          <div className="flex items-center justify-center gap-4">
            <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-medium">
              English
            </span>
            <span className="px-4 py-2 bg-gray-200 text-gray-700 rounded-full font-medium">
              አማርኛ (Amharic)
            </span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#006C36] rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">EF</span>
                </div>
                <h4 className="font-serif font-bold text-lg text-gray-900">Ethio Farmers</h4>
              </div>
              <p className="text-gray-600">
                Connecting Ethiopian farmers directly with buyers for a sustainable agricultural future.
              </p>
            </div>

            <div>
              <h5 className="font-semibold mb-4 text-gray-900">For Farmers</h5>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Create Listings
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Manage Orders
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Market Trends
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4 text-gray-900">For Buyers</h5>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Browse Products
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Place Orders
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Favorite Farmers
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-4 text-gray-900">Support</h5>
              <ul className="space-y-2 text-gray-600">
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Contact Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-gray-900 transition-colors">
                    Community
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 mt-8 pt-8 text-center text-gray-600">
            <p>&copy; 2024 Ethio Farmers. Building a sustainable agricultural marketplace for Ethiopia.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
