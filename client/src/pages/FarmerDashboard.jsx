import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContexts";
import { Plus, Package, ShoppingCart, TrendingUp, Edit, Trash2 } from "lucide-react";

const FarmerDashboard = () => {
  const { currentUser } = useAuth();
  const [listings, setListings] = useState([]);
  const [orders, setOrders] = useState([]);
  const [activeTab, setActiveTab] = useState("listings");
  const [loadingData, setLoadingData] = useState(true);

  // Redirect if not authenticated or not a farmer
  useEffect(() => {
    if (!currentUser || !currentUser.email?.includes("farmer")) {
      window.location.href = "/";
    }
  }, [currentUser]);

  // Load farmer's data
  useEffect(() => {
    if (currentUser && currentUser.email?.includes("farmer")) {
      loadFarmerData();
    }
  }, [currentUser]);

  const loadFarmerData = async () => {
    try {
      setLoadingData(true);
      // TODO: Replace with actual service calls
      // const [farmerListings, farmerOrders] = await Promise.all([
      //   listingService.getAll({ farmerId: currentUser.uid }),
      //   orderService.getByFarmer(currentUser.uid),
      // ]);
      // setListings(farmerListings);
      // setOrders(farmerOrders);

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
          status: "available",
          images: []
        },
        {
          id: "2",
          title: "Sweet Potatoes",
          description: "Fresh sweet potatoes from our farm",
          pricePerKg: 30,
          unit: "kg",
          availableQuantity: 30,
          category: "tubers",
          status: "available",
          images: []
        }
      ];

      const mockOrders = [
        {
          id: "1",
          status: "pending",
          totalAmount: 150.00,
          items: ["Tomatoes", "Onions"],
          createdAt: new Date().toISOString(),
          buyerName: "Alemayehu Tadesse"
        },
        {
          id: "2",
          status: "delivered",
          totalAmount: 200.00,
          items: ["Potatoes", "Carrots"],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          buyerName: "Bethel Haile"
        }
      ];

      setListings(mockListings);
      setOrders(mockOrders);
    } catch (error) {
      console.error("Error loading farmer data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDeleteListing = async (listingId) => {
    if (confirm("Are you sure you want to delete this listing?")) {
      try {
        // TODO: Replace with actual delete call
        // await listingService.delete(listingId);
        setListings(listings.filter((l) => l.id !== listingId));
      } catch (error) {
        console.error("Error deleting listing:", error);
      }
    }
  };

  // Calculate stats
  const stats = {
    totalListings: listings.length,
    activeListings: listings.filter((l) => l.status === "available").length,
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    totalRevenue: orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.totalAmount, 0),
  };

  if (loadingData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#006C36] mx-auto mb-4"></div>
          <p className="text-[#006C36]">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {currentUser?.displayName || "Farmer"}!
          </h1>
          <p className="text-gray-700">Manage your products and track your sales</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Listings</h3>
              <Package className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalListings}</div>
            <p className="text-xs text-gray-500">{stats.activeListings} active</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
              <ShoppingCart className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
            <p className="text-xs text-gray-500">{stats.pendingOrders} pending</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Revenue</h3>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalRevenue.toFixed(2)} ETB</div>
            <p className="text-xs text-gray-500">From delivered orders</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Success Rate</h3>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {stats.totalOrders > 0
                ? Math.round((orders.filter((o) => o.status === "delivered").length / stats.totalOrders) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-gray-500">Orders delivered</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-6">
          {/* Tab Navigation */}
          <div className="flex border-b border-gray-200">
            <button
              onClick={() => setActiveTab("listings")}
              className={`px-4 py-2 font-medium ${
                activeTab === "listings"
                  ? "border-b-2 border-[#006C36] text-[#006C36]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              My Listings
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`px-4 py-2 font-medium ${
                activeTab === "orders"
                  ? "border-b-2 border-[#006C36] text-[#006C36]"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              Orders
            </button>
          </div>

          {/* Listings Tab */}
          {activeTab === "listings" && (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-900">Product Listings</h2>
                <button className="bg-[#006C36] text-white px-4 py-2 rounded-lg hover:bg-[#006C36]/90 transition-colors flex items-center">
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Product
                </button>
              </div>

              {listings.length === 0 ? (
                <div className="bg-white rounded-lg shadow text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No listings yet</h3>
                  <p className="text-gray-600 mb-4">Start by adding your first product listing</p>
                  <button className="bg-[#006C36] text-white px-4 py-2 rounded-lg hover:bg-[#006C36]/90 transition-colors flex items-center mx-auto">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Your First Product
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} onDelete={handleDeleteListing} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-gray-900">Recent Orders</h2>

              {orders.length === 0 ? (
                <div className="bg-white rounded-lg shadow text-center py-12">
                  <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                  <p className="text-gray-600">Orders from buyers will appear here</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Listing Card Component
const ListingCard = ({ listing, onDelete }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-800";
      case "sold":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-red-100 text-red-800";
    }
  };

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="aspect-video bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center">
        {listing.images && listing.images.length > 0 ? (
          <img
            src={listing.images[0] || "/placeholder.svg"}
            alt={listing.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Package className="h-12 w-12 text-[#006C36]" />
        )}
      </div>
      <div className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{listing.title}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
            {listing.status}
          </span>
        </div>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2">{listing.description}</p>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Price:</span>
            <span className="font-semibold">
              {listing.pricePerKg} ETB/{listing.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Available:</span>
            <span>
              {listing.availableQuantity} {listing.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Category:</span>
            <span className="capitalize">{listing.category}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <button className="flex-1 border border-gray-300 text-gray-700 px-3 py-2 rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center">
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </button>
          <button
            onClick={() => onDelete(listing.id)}
            className="border border-red-300 text-red-600 px-3 py-2 rounded-md hover:bg-red-50 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Order Card Component
const OrderCard = ({ order }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "delivered":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "pending":
        return "Pending";
      case "delivered":
        return "Delivered";
      default:
        return "Unknown";
    }
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h4 className="font-semibold text-gray-900">Order #{order.id}</h4>
          <p className="text-sm text-gray-600">From {order.buyerName}</p>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
          {getStatusText(order.status)}
        </span>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">
            Items: {order.items.join(", ")}
          </p>
          <p className="text-sm text-gray-500">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
        </div>
        <div className="text-right">
          <p className="font-semibold text-gray-900">{order.totalAmount.toFixed(2)} ETB</p>
        </div>
      </div>
    </div>
  );
};

export default FarmerDashboard;
