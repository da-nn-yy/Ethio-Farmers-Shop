import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContexts";
import { ShoppingCart, Package, TrendingUp, Clock } from "lucide-react";

const BuyerDashboard = () => {
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loadingData, setLoadingData] = useState(true);

  // Redirect if not authenticated or not a buyer
  useEffect(() => {
    if (!currentUser || currentUser.email?.includes("farmer")) {
      window.location.href = "/";
    }
  }, [currentUser]);

  // Load buyer's orders
  useEffect(() => {
    if (currentUser && !currentUser.email?.includes("farmer")) {
      loadBuyerData();
    }
  }, [currentUser]);

  const loadBuyerData = async () => {
    try {
      setLoadingData(true);
      // TODO: Replace with actual order service call
      // const buyerOrders = await orderService.getByBuyer(currentUser.uid);
      // setOrders(buyerOrders);

      // Mock data for now
      const mockOrders = [
        {
          id: "1",
          status: "pending",
          totalAmount: 150.00,
          items: ["Tomatoes", "Onions"],
          createdAt: new Date().toISOString(),
          farmerName: "Abebe Kebede"
        },
        {
          id: "2",
          status: "delivered",
          totalAmount: 200.00,
          items: ["Potatoes", "Carrots"],
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          farmerName: "Tigist Haile"
        }
      ];
      setOrders(mockOrders);
    } catch (error) {
      console.error("Error loading buyer data:", error);
    } finally {
      setLoadingData(false);
    }
  };

  // Calculate stats
  const stats = {
    totalOrders: orders.length,
    pendingOrders: orders.filter((o) => o.status === "pending").length,
    deliveredOrders: orders.filter((o) => o.status === "delivered").length,
    totalSpent: orders.filter((o) => o.status === "delivered").reduce((sum, o) => sum + o.totalAmount, 0),
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
            Welcome back, {currentUser?.displayName || "Buyer"}!
          </h1>
          <p className="text-gray-700">Track your orders and discover fresh produce</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Orders</h3>
              <ShoppingCart className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalOrders}</div>
            <p className="text-xs text-gray-500">All time</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Pending Orders</h3>
              <Clock className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.pendingOrders}</div>
            <p className="text-xs text-gray-500">Awaiting confirmation</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Delivered</h3>
              <Package className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.deliveredOrders}</div>
            <p className="text-xs text-gray-500">Successfully completed</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Spent</h3>
              <TrendingUp className="h-4 w-4 text-gray-400" />
            </div>
            <div className="text-2xl font-bold text-gray-900">{stats.totalSpent.toFixed(2)} ETB</div>
            <p className="text-xs text-gray-500">On delivered orders</p>
          </div>
        </div>

        {/* Orders Section */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Your Orders</h2>
            <p className="text-gray-600">Track and manage your produce orders</p>
          </div>
          <div className="p-6">
            {orders.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No orders yet</h3>
                <p className="text-gray-600 mb-4">Start shopping for fresh produce from local farmers</p>
                <a
                  href="/marketplace"
                  className="inline-flex items-center px-4 py-2 bg-[#006C36] text-white rounded-md hover:bg-[#006C36]/90 transition-colors"
                >
                  Browse Marketplace
                </a>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </div>
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
          <p className="text-sm text-gray-600">From {order.farmerName}</p>
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

export default BuyerDashboard;
