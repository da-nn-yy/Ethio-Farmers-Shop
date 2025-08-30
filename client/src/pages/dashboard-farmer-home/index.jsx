import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../../firebase"; // ✅ make sure you have firebase config
import GlobalHeader from "../../components/ui/GlobalHeader";
import TabNavigation from "../../components/ui/TabNavigation";
import MobileMenu from "../../components/ui/MobileMenu";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import MetricsCard from "./components/MetricsCard";
import QuickActionCard from "./components/QuickActionCard";
import ProduceListingCard from "./components/ProduceListingCard";
import MarketTrendsWidget from "./components/MarketTrendsWidget";
import RecentActivityFeed from "./components/RecentActivityFeed";

const DashboardFarmerHome = () => {
  const navigate = useNavigate();
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ✅ Add missing user & auth state
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Dashboard data state
  const [farmerMetrics, setFarmerMetrics] = useState([]);
  const [produceListings, setProduceListings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Add New Listing state
  const [isAddListingModalOpen, setIsAddListingModalOpen] = useState(false);
  const [newListing, setNewListing] = useState({
    name: '',
    nameAm: '',
    description: '',
    descriptionAm: '',
    category: 'vegetables',
    pricePerKg: '',
    availableQuantity: '',
    location: 'Addis Ababa',
    image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Load language preference on component mount
  useEffect(() => {
    const savedLanguage = localStorage.getItem("farmconnect_language") || "en";
    setCurrentLanguage(savedLanguage);
  }, []);

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem("farmconnect_language", newLanguage);
  };

  // ✅ Fetch user data safely
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        setIsAuthenticated(true);

        const idToken = await currentUser.getIdToken();
        const API_BASE =
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

        const res = await axios.get(`${API_BASE}/users/me`, {
          headers: { Authorization: `Bearer ${idToken}` },
        });

        setUser(res.data); // expect { fullName, avatar, role }
      } catch (error) {
        console.error("Failed to fetch user data:", error);
        setIsAuthenticated(false);
      }
    };

    fetchUser();
  }, []);

  // ✅ Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated || !user) return;

      try {
        setIsLoading(true);
        setError(null);

        const currentUser = auth.currentUser;
        const idToken = await currentUser.getIdToken();
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

        // Fetch all dashboard data in parallel
        const [metricsRes, listingsRes, activityRes] = await Promise.all([
          axios.get(`${API_BASE}/farmer/metrics`, {
            headers: { Authorization: `Bearer ${idToken}` }
          }),
          axios.get(`${API_BASE}/farmer/listings?limit=6`, {
            headers: { Authorization: `Bearer ${idToken}` }
          }),
          axios.get(`${API_BASE}/farmer/activity?limit=5`, {
            headers: { Authorization: `Bearer ${idToken}` }
          })
        ]);

        setFarmerMetrics(metricsRes.data);
        setProduceListings(listingsRes.data);
        setRecentActivity(activityRes.data);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setError("Failed to load dashboard data");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAuthenticated, user]);

  // ✅ Safe text interpolation
  const welcomeText =
    currentLanguage === "am"
      ? `እንኳን ደህና መጡ፣ ${user?.fullName || "ገበሬ"}!`
      : `Welcome back, ${user?.fullName || "Farmer"}!`;

  // Dashboard data will be fetched from API

  const quickActions = [
    { title: "Add New Listing", titleAm: "አዲስ ዝርዝር ጨምር", description: "List your fresh produce for buyers", descriptionAm: "ለገዢዎች ትኩስ ምርትዎን ዘርዝር", icon: "Plus", variant: "primary", onClick: () => console.log("Add new listing") },
    { title: "View All Orders", titleAm: "ሁሉንም ትዕዛዞች ይመልከቱ", description: "Manage your incoming orders", descriptionAm: "የሚመጡ ትዕዛዞችዎን ያስተዳድሩ", icon: "ShoppingBag", variant: "secondary", onClick: () => navigate("/order-management") }
  ];

  // Calculate notification counts from real data
  const notificationCounts = {
    orders: farmerMetrics?.find(m => m.title === "Pending Orders")?.value || 0,
    total: (farmerMetrics?.find(m => m.title === "Pending Orders")?.value || 0) +
           (farmerMetrics?.find(m => m.title === "Active Listings")?.value || 0)
  };

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      const currentUser = auth.currentUser;
      const idToken = await currentUser.getIdToken();
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      // Refresh all dashboard data
      const [metricsRes, listingsRes, activityRes] = await Promise.all([
        axios.get(`${API_BASE}/farmer/metrics`, {
          headers: { Authorization: `Bearer ${idToken}` }
        }),
        axios.get(`${API_BASE}/farmer/listings?limit=6`, {
          headers: { Authorization: `Bearer ${idToken}` }
        }),
        axios.get(`${API_BASE}/farmer/activity?limit=5`, {
          headers: { Authorization: `Bearer ${idToken}` }
        })
      ]);

      setFarmerMetrics(metricsRes.data);
      setProduceListings(listingsRes.data);
      setRecentActivity(activityRes.data);
      setError(null);
    } catch (error) {
      console.error("Failed to refresh dashboard data:", error);
      setError("Failed to refresh data");
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleEditListing = (listingId) => console.log("Edit listing:", listingId);
  const handleDuplicateListing = (listingId) => console.log("Duplicate listing:", listingId);
  const handleToggleListingStatus = (listingId) => console.log("Toggle listing status:", listingId);

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader
        userRole="farmer"
        isAuthenticated={isAuthenticated}
        onLanguageChange={handleLanguageChange}
        currentLanguage={currentLanguage}
      />

      <TabNavigation userRole="farmer" notificationCounts={notificationCounts} />

      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        userRole="farmer"
        isAuthenticated={isAuthenticated}
        notificationCounts={notificationCounts}
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
                  {currentLanguage === "am"
                    ? "የእርስዎን የእርሻ ንግድ ያስተዳድሩ እና ሽያጭዎን ይከታተሉ"
                    : "Manage your farm business and track your sales"}
                </p>
              </div>
              <Button
                variant="outline"
                onClick={handleRefresh}
                loading={isRefreshing}
                iconName="RefreshCw"
                iconPosition="left"
                className="hidden lg:flex"
              >
                {currentLanguage === "am" ? "አድስ" : "Refresh"}
              </Button>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={20} className="text-red-500" />
                <span className="text-red-700">{error}</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setError(null)}
                  className="ml-auto"
                >
                  {currentLanguage === "am" ? "ዘግብ" : "Dismiss"}
                </Button>
              </div>
            </div>
          )}

          {/* Metrics Cards */}
          <div className="grid grid-cols-1 gap-4 mb-8 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6">
            {isLoading ? (
              // Loading skeleton for metrics
              Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 bg-gray-200 rounded-lg animate-pulse" />
              ))
            ) : (
              farmerMetrics?.map((metric, index) => (
                <MetricsCard key={index} {...metric} currentLanguage={currentLanguage} />
              ))
            )}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="mb-4 text-xl font-semibold text-text-primary">
              {currentLanguage === "am" ? "ፈጣን እርምጃዎች" : "Quick Actions"}
            </h2>
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 lg:gap-6">
              {quickActions?.map((action, index) => (
                <QuickActionCard key={index} {...action} currentLanguage={currentLanguage} />
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
            <div className="space-y-6 lg:col-span-2">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-semibold text-text-primary">
                    {currentLanguage === "am" ? "የእርስዎ ንቁ ዝርዝሮች" : "Your Active Listings"}
                  </h2>
                  <Button variant="outline" size="sm" iconName="Plus" iconPosition="left">
                    {currentLanguage === "am" ? "አዲስ ጨምር" : "Add New"}
                  </Button>
                </div>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
                  {isLoading ? (
                    // Loading skeleton for listings
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
                    ))
                  ) : produceListings?.length > 0 ? (
                    produceListings?.slice(0, 4)?.map((listing) => (
                      <ProduceListingCard
                        key={listing.id}
                        listing={listing}
                        onEdit={handleEditListing}
                        onDuplicate={handleDuplicateListing}
                        onToggleStatus={handleToggleListingStatus}
                        currentLanguage={currentLanguage}
                      />
                    ))
                  ) : (
                    <div className="col-span-2 py-12 text-center">
                      <Icon name="Package" size={48} className="mx-auto mb-4 text-gray-400" />
                      <p className="mb-4 text-gray-500">
                        {currentLanguage === "am"
                          ? "ገና ምንም ዝርዝሮች የሉዎትም። የእርስዎን ምርት ያስጀምሩ!"
                          : "You don't have any listings yet. Start listing your produce!"}
                      </p>
                      <Button variant="primary" iconName="Plus" iconPosition="left">
                        {currentLanguage === "am" ? "ዝርዝር ጀምር" : "Create First Listing"}
                      </Button>
                    </div>
                  )}
                </div>
                <div className="mt-6 text-center">
                  <Button variant="outline" iconName="ArrowRight" iconPosition="right">
                    {currentLanguage === "am" ? "ሁሉንም ዝርዝሮች ይመልከቱ" : "View All Listings"} ({produceListings?.length || 0})
                  </Button>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {isLoading ? (
                <>
                  <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
                  <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
                </>
              ) : (
                <>
                  <MarketTrendsWidget currentLanguage={currentLanguage} />
                  <RecentActivityFeed currentLanguage={currentLanguage} recentActivity={recentActivity} />
                </>
              )}
            </div>
          </div>

          {/* Mobile Pull-to-Refresh */}
          {isRefreshing && (
            <div className="fixed z-40 transform -translate-x-1/2 lg:hidden top-32 left-1/2">
              <div className="flex items-center px-4 py-2 space-x-2 border rounded-full bg-card border-border shadow-warm-lg">
                <Icon name="RefreshCw" size={16} className="text-primary animate-spin" />
                <span className="text-sm text-text-primary">
                  {currentLanguage === "am" ? "በመጫን ላይ..." : "Refreshing..."}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DashboardFarmerHome;
