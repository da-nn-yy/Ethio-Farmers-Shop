import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { auth } from "../../firebase"; // ✅ make sure you have firebase config
import GlobalHeader from "../../components/ui/GlobalHeader";
import TabNavigation from "../../components/ui/TabNavigation";
import MobileMenu from "../../components/ui/MobileMenu";
import Icon from "../../components/AppIcon";
import Button from "../../components/ui/Button";
import ImageUpload from "../../components/ui/ImageUpload";
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

  // Submission/loading state for edit/update
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
          import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

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
        const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

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

  // Add New Listing functions
  const handleAddNewListing = () => {
    navigate('/add-listing');
  };

  const handleInputChange = () => {};

  const quickActions = [
    { title: "Add New Listing", titleAm: "አዲስ ዝርዝር ጨምር", description: "List your fresh produce for buyers", descriptionAm: "ለገዢዎች ትኩስ ምርትዎን ዘርዝር", icon: "Plus", variant: "primary", onClick: handleAddNewListing },
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
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

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

    // Edit Listing functionality
  const [isEditListingModalOpen, setIsEditListingModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);

  const handleEditListing = (listingId) => {
    const listing = produceListings.find(l => l.id === listingId);
    if (listing) {
      setEditingListing({
        id: listing.id,
        name: listing.name || '',
        nameAm: listing.nameAm || '',
        description: listing.description || '',
        descriptionAm: listing.descriptionAm || '',
        category: listing.category || 'vegetables',
        pricePerKg: listing.pricePerKg || '',
        availableQuantity: listing.availableQuantity || '',
        location: listing.location || 'Addis Ababa',
        image: listing.image || ''
      });
      setIsEditListingModalOpen(true);
    }
  };

  const handleUpdateListing = async (e) => {
    e.preventDefault();
    if (!isAuthenticated || !user || !editingListing) return;

    try {
      setIsSubmitting(true);
      const currentUser = auth.currentUser;
      const idToken = await currentUser.getIdToken();
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

      const listingData = {
        ...editingListing,
        pricePerKg: Number(editingListing.pricePerKg),
        availableQuantity: Number(editingListing.availableQuantity)
      };

      const response = await axios.put(`${API_BASE}/farmer/listings/${editingListing.id}`, listingData, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      // Update the listing in the list
      setProduceListings(prev => prev.map(listing =>
        listing.id === editingListing.id ? response.data : listing
      ));

      // Close modal and reset
      setIsEditListingModalOpen(false);
      setEditingListing(null);

      // Show success message
      if (currentLanguage === 'am') {
        alert('የእርስዎ ዝርዝር በተሳካቸ ሁኔታ ተሻሽሏል!');
      } else {
        alert('Your listing has been updated successfully!');
      }

    } catch (error) {
      console.error('Failed to update listing:', error);
      if (currentLanguage === 'am') {
        alert('ዝርዝር ማሻሻል አልተሳካም። እባክዎ እንደገና ይሞክሩ።');
      } else {
        alert('Failed to update listing. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Duplicate Listing functionality
  const handleDuplicateListing = () => {
    navigate('/add-listing');
  };

  // Toggle Listing Status functionality
  const handleToggleListingStatus = async (listingId) => {
    if (!isAuthenticated || !user) return;

    try {
      const currentUser = auth.currentUser;
      const idToken = await currentUser.getIdToken();
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";

      const listing = produceListings.find(l => l.id === listingId);
      const newStatus = listing.status === 'sold_out' ? 'active' : 'sold_out';

      const response = await axios.patch(`${API_BASE}/farmer/listings/${listingId}/status`, {
        status: newStatus
      }, {
        headers: { Authorization: `Bearer ${idToken}` }
      });

      // Update the listing status in the list
      setProduceListings(prev => prev.map(listing =>
        listing.id === listingId ? { ...listing, status: newStatus } : listing
      ));

      // Show success message
      if (currentLanguage === 'am') {
        alert(`የእርስዎ ዝርዝር ሁኔታ ተሻሽሏል!`);
      } else {
        alert(`Your listing status has been updated!`);
      }

    } catch (error) {
      console.error('Failed to update listing status:', error);
      if (currentLanguage === 'am') {
        alert('የዝርዝር ሁኔታ ማሻሻል አልተሳካም። እባክዎ እንደገና ይሞክሩ።');
      } else {
        alert('Failed to update listing status. Please try again.');
      }
    }
  };

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
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={handleAddNewListing}
                  >
                    {currentLanguage === "am" ? "አዲስ ጨምር" : "Add New"}
                  </Button>
                </div>
<<<<<<< HEAD
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:gap-6">
                  {isLoading ? (
                    // Loading skeleton for listings
                    Array.from({ length: 4 }).map((_, index) => (
                      <div key={index} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
                    ))
                  ) : produceListings?.length > 0 ? (
                    produceListings?.slice(0, 4)?.map((listing) => (
=======

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6">
                  {produceListings?.slice(0, 4)?.map((listing) => (
>>>>>>> 3eda38a82d432751664176e4f857952c5804203a
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
                      <Button
                        variant="primary"
                        iconName="Plus"
                        iconPosition="left"
                        onClick={handleAddNewListing}
                      >
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

      {/* Add New Listing now navigates to dedicated page; modal removed */}

       {/* Edit Listing Modal */}
       {isEditListingModalOpen && editingListing && (
         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
           <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
             <div className="p-6 border-b border-border">
               <div className="flex items-center justify-between">
                 <h3 className="text-xl font-semibold text-text-primary">
                   {currentLanguage === "am" ? "ዝርዝር አርም" : "Edit Listing"}
                 </h3>
                 <Button
                   variant="ghost"
                   size="sm"
                   onClick={() => {
                     setIsEditListingModalOpen(false);
                     setEditingListing(null);
                   }}
                   iconName="X"
                 />
               </div>
             </div>

             <form onSubmit={handleUpdateListing} className="p-6 overflow-y-auto max-h-96">
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 {/* English Name */}
                 <div>
                   <label className="block mb-2 text-sm font-medium text-text-secondary">
                     {currentLanguage === "am" ? "የምርት ስም (English)" : "Product Name (English)"}
                   </label>
                   <input
                     type="text"
                     value={editingListing.name}
                     onChange={(e) => setEditingListing(prev => ({ ...prev, name: e.target.value }))}
                     required
                     className="w-full px-3 py-2 border rounded-lg border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                     placeholder={currentLanguage === "am" ? "ለምሳሌ: Fresh Tomatoes" : "e.g., Fresh Tomatoes"}
                   />
                 </div>

                 {/* Amharic Name */}
                 <div>
                   <label className="block mb-2 text-sm font-medium text-text-secondary">
                     {currentLanguage === "am" ? "የምርት ስም (አማርኛ)" : "Product Name (Amharic)"}
                   </label>
                   <input
                     type="text"
                     value={editingListing.nameAm}
                     onChange={(e) => setEditingListing(prev => ({ ...prev, nameAm: e.target.value }))}
                     className="w-full px-3 py-2 border rounded-lg border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                     placeholder={currentLanguage === "am" ? "ለምሳሌ: ትኩስ ቲማቲም" : "e.g., ትኩስ ቲማቲም"}
                   />
                 </div>

                 {/* Category */}
                 <div>
                   <label className="block mb-2 text-sm font-medium text-text-secondary">
                     {currentLanguage === "am" ? "ምድብ" : "Category"}
                   </label>
                   <select
                     value={editingListing.category}
                     onChange={(e) => setEditingListing(prev => ({ ...prev, category: e.target.value }))}
                     required
                     className="w-full px-3 py-2 border rounded-lg border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                   >
                     <option value="vegetables">{currentLanguage === "am" ? "አትክልቶች" : "Vegetables"}</option>
                     <option value="fruits">{currentLanguage === "am" ? "ፍራፍሬዎች" : "Fruits"}</option>
                     <option value="grains">{currentLanguage === "am" ? "እህሎች" : "Grains"}</option>
                     <option value="legumes">{currentLanguage === "am" ? "ጥራጥሮች" : "Legumes"}</option>
                     <option value="spices">{currentLanguage === "am" ? "ቅመሞች" : "Spices"}</option>
                   </select>
                 </div>

                 {/* Location */}
                 <div>
                   <label className="block mb-2 text-sm font-medium text-text-secondary">
                     {currentLanguage === "am" ? "ክልል" : "Region"}
                   </label>
                   <select
                     value={editingListing.location}
                     onChange={(e) => setEditingListing(prev => ({ ...prev, location: e.target.value }))}
                     required
                     className="w-full px-3 py-2 border rounded-lg border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                   >
                     <option value="Addis Ababa">{currentLanguage === "am" ? "አዲስ አበባ" : "Addis Ababa"}</option>
                     <option value="Oromia">{currentLanguage === "am" ? "ኦሮሚያ" : "Oromia"}</option>
                     <option value="Amhara">{currentLanguage === "am" ? "አማራ" : "Amhara"}</option>
                     <option value="Tigray">{currentLanguage === "am" ? "ትግራይ" : "Tigray"}</option>
                     <option value="SNNP">{currentLanguage === "am" ? "ደቡብ ብሔሮች" : "SNNP"}</option>
                     <option value="Somali">{currentLanguage === "am" ? "ሶማሌ" : "Somali"}</option>
                     <option value="Afar">{currentLanguage === "am" ? "አፋር" : "Afar"}</option>
                   </select>
                 </div>

                 {/* Price per kg */}
                 <div>
                   <label className="block mb-2 text-sm font-medium text-text-secondary">
                     {currentLanguage === "am" ? "ዋጋ በኪሎ (ETB)" : "Price per kg (ETB)"}
                   </label>
                   <input
                     type="number"
                     value={editingListing.pricePerKg}
                     onChange={(e) => setEditingListing(prev => ({ ...prev, pricePerKg: e.target.value }))}
                     required
                     min="0"
                     step="0.01"
                     className="w-full px-3 py-2 border rounded-lg border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                     placeholder="25.00"
                   />
                 </div>

                 {/* Available Quantity */}
                 <div>
                   <label className="block mb-2 text-sm font-medium text-text-secondary">
                     {currentLanguage === "am" ? "የሚገኝ መጠን (kg)" : "Available Quantity (kg)"}
                   </label>
                   <input
                     type="number"
                     value={editingListing.availableQuantity}
                     onChange={(e) => setEditingListing(prev => ({ ...prev, availableQuantity: e.target.value }))}
                     required
                     min="0"
                     step="0.1"
                     className="w-full px-3 py-2 border rounded-lg border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                     placeholder="100.0"
                   />
                 </div>

                 {/* Image Upload */}
                 <div className="md:col-span-2">
                   <label className="block mb-2 text-sm font-medium text-text-secondary">
                     {currentLanguage === "am" ? "የምርት ምስት" : "Product Image"}
                   </label>
                   <ImageUpload
                     onImageUpload={(imageUrl) => setEditingListing(prev => ({ ...prev, image: imageUrl }))}
                     currentImage={editingListing.image}
                     currentLanguage={currentLanguage}
                   />
                 </div>

                 {/* Description */}
                 <div className="md:col-span-2">
                   <label className="block mb-2 text-sm font-medium text-text-secondary">
                     {currentLanguage === "am" ? "መግለጫ (English)" : "Description (English)"}
                   </label>
                   <textarea
                     value={editingListing.description}
                     onChange={(e) => setEditingListing(prev => ({ ...prev, description: e.target.value }))}
                     rows="3"
                     className="w-full px-3 py-2 border rounded-lg border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                     placeholder={currentLanguage === "am" ? "የምርትዎን ጥራት እና ባህሪያት ይግለጹ" : "Describe the quality and characteristics of your produce"}
                   />
                 </div>

                 {/* Amharic Description */}
                 <div className="md:col-span-2">
                   <label className="block mb-2 text-sm font-medium text-text-secondary">
                     {currentLanguage === "am" ? "መግለጫ (አማርኛ)" : "Description (Amharic)"}
                   </label>
                   <textarea
                     value={editingListing.descriptionAm}
                     onChange={(e) => setEditingListing(prev => ({ ...prev, descriptionAm: e.target.value }))}
                     rows="3"
                     className="w-full px-3 py-2 border rounded-lg border-border focus:ring-2 focus:ring-primary focus:border-transparent"
                     placeholder={currentLanguage === "am" ? "የምርትዎን ጥራት እና ባህሪያት ይግለጹ" : "Describe the quality and characteristics of your produce"}
                   />
                 </div>
               </div>
             </form>

             <div className="p-6 border-t border-border">
               <div className="flex justify-end space-x-3">
                 <Button
                   variant="outline"
                   onClick={() => {
                     setIsEditListingModalOpen(false);
                     setEditingListing(null);
                   }}
                   disabled={isSubmitting}
                 >
                   {currentLanguage === "am" ? "ያቋርጡ" : "Cancel"}
                 </Button>
                 <Button
                   variant="primary"
                   onClick={handleUpdateListing}
                   loading={isSubmitting}
                   disabled={isSubmitting}
                   iconName="Save"
                   iconPosition="left"
                 >
                   {currentLanguage === "am" ? "ዝርዝር አርም" : "Update Listing"}
                 </Button>
               </div>
             </div>
           </div>
         </div>
       )}
    </div>
  );
};

export default DashboardFarmerHome;
