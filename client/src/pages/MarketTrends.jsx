import React, { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, BarChart3, Package, Star } from "lucide-react";
import { productsAPI } from "../services/api";

const MarketTrends = () => {
  const [marketData, setMarketData] = useState([]);
  const [popularProducts, setPopularProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      setLoading(true);

      // Get all products to analyze market data
      const response = await productsAPI.search({ limit: 100 });
      const products = response.data.products || [];

      // Process market data by category
      const categoryData = processCategoryData(products);
      setMarketData(categoryData);

      // Get popular products (top rated)
      const popularResponse = await productsAPI.getFeatured();
      setPopularProducts(popularResponse.data || []);

    } catch (error) {
      console.error("Error loading market data:", error);
      setMarketData([]);
      setPopularProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const processCategoryData = (products) => {
    const categories = {};

    products.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = {
          category: product.category,
          totalListings: 0,
          totalQuantity: 0,
          prices: [],
          minPrice: Infinity,
          maxPrice: 0
        };
      }

      categories[product.category].totalListings++;
      categories[product.category].totalQuantity += product.availableQuantity;
      categories[product.category].prices.push(product.pricePerKg);

      if (product.pricePerKg < categories[product.category].minPrice) {
        categories[product.category].minPrice = product.pricePerKg;
      }
      if (product.pricePerKg > categories[product.category].maxPrice) {
        categories[product.category].maxPrice = product.pricePerKg;
      }
    });

    // Calculate averages
    Object.values(categories).forEach(category => {
      category.averagePrice = category.prices.reduce((sum, price) => sum + price, 0) / category.prices.length;
    });

    return Object.values(categories);
  };

  const getTotalListings = () => {
    return marketData.reduce((sum, category) => sum + category.totalListings, 0);
  };

  const getAveragePrice = () => {
    if (marketData.length === 0) return 0;
    const totalPrice = marketData.reduce((sum, category) => sum + category.averagePrice, 0);
    return totalPrice / marketData.length;
  };

  const getMostExpensiveCategory = () => {
    if (marketData.length === 0) return null;
    return marketData.reduce((max, category) => (category.averagePrice > max.averagePrice ? category : max));
  };

  const getCheapestCategory = () => {
    if (marketData.length === 0) return null;
    return marketData.reduce((min, category) => (category.averagePrice < min.averagePrice ? category : min));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-emerald-700">Loading market trends...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-green-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-emerald-900 mb-2">Market Trends & Analytics</h1>
          <p className="text-emerald-700">Real-time insights into Ethiopian agricultural market prices and trends</p>
        </div>

        {/* Market Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Products</h3>
              <Package className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{getTotalListings()}</div>
            <p className="text-xs text-gray-500">Available in marketplace</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Average Price</h3>
              <BarChart3 className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{getAveragePrice().toFixed(2)} ETB</div>
            <p className="text-xs text-gray-500">Across all categories</p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Highest Priced</h3>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{getMostExpensiveCategory()?.averagePrice.toFixed(2) || 0} ETB</div>
            <p className="text-xs text-gray-500 capitalize">
              {getMostExpensiveCategory()?.category || "N/A"}
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Most Affordable</h3>
              <TrendingDown className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{getCheapestCategory()?.averagePrice.toFixed(2) || 0} ETB</div>
            <p className="text-xs text-gray-500 capitalize">{getCheapestCategory()?.category || "N/A"}</p>
          </div>
        </div>

        {/* Main Content Tabs */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("overview")}
              className={`px-4 py-2 font-medium ${
                activeTab === "overview"
                  ? "border-b-2 border-[#006C36] text-[#006C36]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Overview
            </button>
            <button
              onClick={() => setActiveTab("categories")}
              className={`px-4 py-2 font-medium ${
                activeTab === "categories"
                  ? "border-b-2 border-[#006C36] text-[#006C36]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setActiveTab("popular")}
              className={`px-4 py-2 font-medium ${
                activeTab === "popular"
                  ? "border-b-2 border-[#006C36] text-[#006C36]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Popular Products
            </button>
            <button
              onClick={() => setActiveTab("insights")}
              className={`px-4 py-2 font-medium ${
                activeTab === "insights"
                  ? "border-b-2 border-[#006C36] text-[#006C36]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Insights
            </button>
          </div>

          {/* Tab Content */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Price Chart */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Price Distribution by Category</h3>
                  <div className="space-y-4">
                    {marketData.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{category.category}</span>
                          <span className="text-sm text-gray-600">{category.averagePrice.toFixed(2)} ETB</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#006C36] h-2 rounded-full"
                            style={{
                              width: `${Math.min((category.averagePrice / Math.max(...marketData.map(c => c.averagePrice))) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Category Trends */}
                <div className="bg-white rounded-lg shadow-md p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Share by Category</h3>
                  <div className="space-y-4">
                    {marketData.map((category) => (
                      <div key={category.category} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium capitalize">{category.category}</span>
                          <span className="text-sm text-gray-600">{category.totalListings} products</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#006C36] h-2 rounded-full"
                            style={{
                              width: `${Math.min((category.totalListings / getTotalListings()) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {((category.totalListings / getTotalListings()) * 100).toFixed(1)}% of total market
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "categories" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {marketData.map((category) => (
                  <div key={category.category} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 capitalize">{category.category}</h3>
                        <span className="bg-[#006C36] text-white text-xs px-2 py-1 rounded-full">
                          {category.totalListings} products
                        </span>
                      </div>
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Average Price:</span>
                            <span className="font-semibold">{category.averagePrice.toFixed(2)} ETB</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Price Range:</span>
                            <span className="text-sm">
                              {category.minPrice?.toFixed(2)} - {category.maxPrice?.toFixed(2)} ETB
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Total Quantity:</span>
                            <span className="text-sm">{category.totalQuantity.toFixed(0)} units</span>
                          </div>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#006C36] h-2 rounded-full"
                            style={{
                              width: `${Math.min((category.totalListings / getTotalListings()) * 100, 100)}%`,
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-gray-500">
                          {((category.totalListings / getTotalListings()) * 100).toFixed(1)}% of total market
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "popular" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Most Popular Products</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {popularProducts.map((product) => (
                    <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="aspect-square bg-gradient-to-br from-green-100 to-emerald-100 rounded-lg flex items-center justify-center mb-3">
                        {product.images && product.images.length > 0 ? (
                          <img
                            src={product.images[0]}
                            alt={product.title}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        ) : (
                          <span className="text-3xl">🌾</span>
                        )}
                      </div>
                      <h4 className="font-semibold text-gray-900 mb-1">{product.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{product.farmerName}</p>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[#006C36]">{product.pricePerKg} ETB/{product.unit}</span>
                        <div className="flex items-center gap-1">
                          <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-sm font-medium">{product.averageRating || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "insights" && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Market Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Price Analysis</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Most Expensive Category:</strong> {getMostExpensiveCategory()?.category}
                        (Avg: {getMostExpensiveCategory()?.averagePrice.toFixed(2)} ETB)
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Most Affordable Category:</strong> {getCheapestCategory()?.category}
                        (Avg: {getCheapestCategory()?.averagePrice.toFixed(2)} ETB)
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Price Difference:</strong> {(getMostExpensiveCategory()?.averagePrice - getCheapestCategory()?.averagePrice).toFixed(2)} ETB
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <h4 className="font-medium text-gray-900">Market Distribution</h4>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600">
                        <strong>Total Categories:</strong> {marketData.length}
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Most Popular Category:</strong> {
                          marketData.reduce((max, category) =>
                            category.totalListings > max.totalListings ? category : max
                          )?.category
                        }
                      </p>
                      <p className="text-sm text-gray-600">
                        <strong>Average Products per Category:</strong> {(getTotalListings() / marketData.length).toFixed(1)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MarketTrends;
