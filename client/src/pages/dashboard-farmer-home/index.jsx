import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { dashboardService, farmerService } from "../../services/apiService";
import { useAuth } from "../../hooks/useAuth.jsx";
import { auth } from "../../firebase";
import { navigateToDuplicateListing, navigateToEditListing } from "../../utils/duplicateListing";
import axios from "axios";
import AuthenticatedLayout from "../../components/ui/AuthenticatedLayout.jsx";
import { useLanguage } from "../../hooks/useLanguage.jsx";
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
  const { user, isAuthenticated } = useAuth();
  const { language, toggle } = useLanguage();
  const [currentLanguage, setCurrentLanguage] = useState("en");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

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
  useEffect(() => { if (currentLanguage !== language) setCurrentLanguage(language); }, [language]);

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem("farmconnect_language", newLanguage);
  };

  // ✅ Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!isAuthenticated) return;

      try {
        setIsLoading(true);
        setError(null);

        // Fetch all dashboard data in parallel using new API service
        const [metricsRes, listingsRes, activityRes] = await Promise.all([
          farmerService.getFarmerMetrics(),
          farmerService.getFarmerListings({ limit: 6 }),
          farmerService.getFarmerActivity({ limit: 5 })
        ]);

        setFarmerMetrics(metricsRes || []);
        setProduceListings(listingsRes.listings || []);
        setRecentActivity(activityRes || []);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        console.error("Error details:", error.response?.data || error.message);
        setError(`Failed to load dashboard data: ${error.response?.data?.error || error.message}`);
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
    { title: "View All Orders", titleAm: "ሁሉንም ትዕዛዞች ይመልከቱ", description: "Manage your incoming orders", descriptionAm: "የሚመጡ ትዕዛዞችዎን ያስተዳድሩ", icon: "ShoppingBag", variant: "secondary", onClick: () => navigate("/orders-farmer") }
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
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

      // Refresh all dashboard data
      const [metricsRes, listingsRes, activityRes] = await Promise.all([
        axios.get(`${API_BASE}/farmers/metrics`, {
          headers: { Authorization: `Bearer ${idToken}` }
        }),
        axios.get(`${API_BASE}/farmers/listings?limit=6`, {
          headers: { Authorization: `Bearer ${idToken}` }
        }),
        axios.get(`${API_BASE}/farmers/activity?limit=5`, {
          headers: { Authorization: `Bearer ${idToken}` }
        })
      ]);

      setFarmerMetrics(metricsRes.data || []);
      setProduceListings(listingsRes.data.listings || []);
      setRecentActivity(activityRes.data || []);
      setError(null);
    } catch (error) {
      console.error("Failed to refresh dashboard data:", error);
      console.error("Error details:", error.response?.data || error.message);
      setError(`Failed to refresh data: ${error.response?.data?.error || error.message}`);
    } finally {
    setIsRefreshing(false);
    }
  };

    // Edit Listing functionality (legacy modal - keeping for backward compatibility)
  const [isEditListingModalOpen, setIsEditListingModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState(null);

  const handleEditListingModal = (listingId) => {
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
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

      const listingData = {
        ...editingListing,
        pricePerKg: Number(editingListing.pricePerKg),
        availableQuantity: Number(editingListing.availableQuantity)
      };

      const response = await axios.put(`${API_BASE}/farmers/listings/${editingListing.id}`, listingData, {
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
  const handleDuplicateListing = (listingId) => {
    navigateToDuplicateListing(navigate, listingId);
  };

  // Edit Listing functionality
  const handleEditListing = (listingId) => {
    navigateToEditListing(navigate, listingId);
  };

  // Toggle Listing Status functionality
  const handleToggleListingStatus = async (listingId) => {
    if (!isAuthenticated || !user) return;

    try {
      const currentUser = auth.currentUser;
      const idToken = await currentUser.getIdToken();
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

      const listing = produceListings.find(l => l.id === listingId);
      const newStatus = listing.status === 'sold_out' ? 'active' : 'sold_out';

      const response = await axios.patch(`${API_BASE}/farmers/listings/${listingId}/status`, {
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
    <AuthenticatedLayout>
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

          {/* Main Content: Stack Active Listings, Market Trends, and Recent Activity vertically */}
          <div className="space-y-8">
            {/* Active Listings */}
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
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
                  ))
                ) : produceListings?.length > 0 ? (
                  produceListings?.slice(0, 6)?.map((listing) => (
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
                  <div className="col-span-full py-12 text-center">
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
                <Button variant="outline" iconName="ArrowRight" iconPosition="right" onClick={() => navigate('/farmer-my-listings')}>
                  {currentLanguage === "am" ? "ሁሉንም ዝርዝሮች ይመልከቱ" : "View All Listings"} ({produceListings?.length || 0})
                </Button>
              </div>
            </div>

            {/* Market Trends */}
            <div>
              {isLoading ? (
                <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
              ) : (
                <MarketTrendsWidget currentLanguage={currentLanguage} />
              )}
            </div>

            {/* Recent Activity */}
            <div>
              {isLoading ? (
                <div className="h-48 bg-gray-200 rounded-lg animate-pulse" />
              ) : (
                <RecentActivityFeed currentLanguage={currentLanguage} recentActivity={recentActivity} />
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
    </AuthenticatedLayout>
  );
};

export default DashboardFarmerHome;

