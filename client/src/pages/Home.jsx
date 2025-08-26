import React, { useState } from "react";
import { useAuth } from "../contexts/AuthContexts";
import { Search } from "lucide-react";

const Home = () => {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = (e) => {
    e.preventDefault();
    // Handle search functionality
    console.log("Searching for:", searchQuery);
  };

  return (
    <div>
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
                    <button className="border-2 border-[#006C36] text-[#006C36] px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#006C36]/10 transition-colors">
                      My Listings
                    </button>
                  </>
                ) : (
                  <>
                    <button className="bg-[#006C36] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#006C36]/90 transition-colors">
                      Browse Marketplace
                    </button>
                    <button className="border-2 border-[#006C36] text-[#006C36] px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#006C36]/10 transition-colors">
                      My Orders
                    </button>
                  </>
                )
              ) : (
                <>
                  <button className="bg-[#006C36] text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#006C36]/90 transition-colors">
                    Browse Marketplace
                  </button>
                  <button className="border-2 border-[#006C36] text-[#006C36] px-8 py-3 rounded-lg text-lg font-medium hover:bg-[#006C36]/10 transition-colors">
                    Join as Farmer
                  </button>
                </>
              )}
            </div>

            {/* Search Bar */}
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

      {/* Additional sections can be added here */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-serif font-bold text-gray-900 mb-4">
              Why Choose Ethio Farmers?
            </h3>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              We connect you directly with local farmers, ensuring fresh produce and fair prices for everyone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#006C36] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🌾</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Fresh from Farm</h4>
              <p className="text-gray-600">Get produce directly from local farmers, ensuring maximum freshness and quality.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#006C36] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">💰</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Fair Prices</h4>
              <p className="text-gray-600">Support local farmers while getting competitive prices on fresh produce.</p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-[#006C36] rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-white text-2xl">🚚</span>
              </div>
              <h4 className="text-xl font-semibold text-gray-900 mb-2">Fast Delivery</h4>
              <p className="text-gray-600">Quick and reliable delivery to your doorstep, maintaining product freshness.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
