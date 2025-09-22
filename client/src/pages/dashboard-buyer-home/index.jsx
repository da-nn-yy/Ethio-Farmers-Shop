import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboardService, orderService, favoriteService } from '../../services/apiService';
import { useAuth } from '../../hooks/useAuth.jsx';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import { useLanguage } from '../../hooks/useLanguage.jsx';
import { useCart } from '../../hooks/useCart.jsx';
import TabNavigation from '../../components/ui/TabNavigation';
import ProduceListingCard from './components/ProduceListingCard';
import MarketTrendsWidget from './components/MarketTrendsWidget';

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { items: cartItems, totalCost: cartTotal } = useCart();

  useEffect(() => {
    const savedLanguage = localStorage.getItem('farmconnect_language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  useEffect(() => { if (language !== currentLanguage) setCurrentLanguage(language); }, [language]);

  useEffect(() => {
    if (isAuthenticated) {
      loadDashboardData();
    }
  }, [isAuthenticated]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await dashboardService.getBuyerDashboard();
      setDashboardData(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('farmconnect_language', newLanguage);
  };

  if (!isAuthenticated) {
    navigate('/authentication-login-register');
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="container mx-auto px-4 py-2">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-text-primary mb-1">
            {currentLanguage === 'am' ? 'እንኳን ደህና መጣህ' : 'Welcome back'}, {user?.fullName || user?.name || 'Buyer'}
          </h1>
          <p className="text-text-secondary">
            {currentLanguage === 'am' ? 'የእርስዎን ትዕዛዞች እና የገበያ አዝማሚያዎች ይመልከቱ' : 'Here is an overview of your activity and market trends'}
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">
                  {currentLanguage === 'am' ? 'ጠቅላላ ትዕዛዞች' : 'Total Orders'}
                </p>
                <p className="text-2xl font-bold text-text-primary">
                  {dashboardData?.orderStats?.total_orders || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <span className="text-primary text-xl">📦</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">
                  {currentLanguage === 'am' ? 'ጠቅላላ ወጪ' : 'Total Spent'}
                </p>
                <p className="text-2xl font-bold text-text-primary">
                  ETB {dashboardData?.orderStats?.total_spent || 0}
                </p>
                {cartTotal > 0 && (
                  <p className="text-xs text-text-secondary mt-1">
                    {currentLanguage === 'am'
                      ? `+ ETB ${cartTotal} በጋሪ ውስጥ`
                      : `+ ETB ${cartTotal} in cart`}
                  </p>
                )}
              </div>
              <div className="w-12 h-12 bg-success/10 rounded-lg flex items-center justify-center">
                <span className="text-success text-xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">
                  {currentLanguage === 'am' ? 'የሚጠበቁ ትዕዛዞች' : 'Pending Orders'}
                </p>
                <p className="text-2xl font-bold text-text-primary">
                  {dashboardData?.orderStats?.pending_orders || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-warning/10 rounded-lg flex items-center justify-center">
                <span className="text-warning text-xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">
                  {currentLanguage === 'am' ? 'የሚወዱት' : 'Favorites'}
                </p>
                <p className="text-2xl font-bold text-text-primary">
                  {dashboardData?.favoriteStats?.total_favorites || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                <span className="text-accent text-xl">❤️</span>
              </div>
            </div>
          </div>

          {/* Cart summary (client-side only) */}
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-secondary mb-1">
                  {currentLanguage === 'am' ? 'የጋሪ እቃዎች' : 'Cart Items'}
                </p>
                <p className="text-2xl font-bold text-text-primary">
                  {cartItems?.length || 0}
                </p>
              </div>
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center">
                <span className="text-indigo-600 text-xl">🛒</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Orders and Market Trends stacked vertically */}
        <div className="space-y-6 mb-8">
          <div className="bg-white rounded-lg p-6 shadow-sm border">
            <h2 className="text-lg font-semibold text-text-primary mb-4">
              {currentLanguage === 'am' ? 'የቅርብ ጊዜ ትዕዛዞች' : 'Recent Orders'}
            </h2>
            <div className="space-y-3">
              {dashboardData?.recentOrders?.slice(0, 3).map((order) => (
                <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-text-primary">Order #{order.id}</p>
                    <p className="text-sm text-text-secondary">
                      {new Date(order.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-text-primary">ETB {order.total}</p>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      order.status === 'completed' ? 'bg-success/10 text-success' :
                      order.status === 'pending' ? 'bg-warning/10 text-warning' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))}
              {(!dashboardData?.recentOrders || dashboardData.recentOrders.length === 0) && (
                cartItems?.length > 0 ? (
                  <div className="space-y-3">
                    {cartItems.slice(0, 3).map((ci) => (
                      <div key={ci.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium text-text-primary">{ci.name}</p>
                          <p className="text-sm text-text-secondary">{ci.quantity} × ETB {ci.pricePerKg}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2 py-1 rounded-full text-xs bg-info/10 text-info`}>
                            {currentLanguage === 'am' ? 'በጋሪ ውስጥ' : 'In Cart'}
                          </span>
                        </div>
                      </div>
                    ))}
                    <p className="text-sm text-text-secondary text-center">
                      {currentLanguage === 'am' ? 'እቃዎች በጋሪ ውስጥ ናቸው። ትዕዛዝ ለመፍጠር ዝግጁ ሲሆኑ ይግባዱ።' : 'Items are in your cart. Checkout to place an order.'}
                    </p>
                  </div>
                ) : (
                  <p className="text-text-secondary text-center py-4">
                    {currentLanguage === 'am' ? 'ምንም ትዕዛዞች የሉም' : 'No orders yet'}
                  </p>
                )
              )}
            </div>
          </div>
          {/* Market Trends Widget */}
          <MarketTrendsWidget currentLanguage={currentLanguage} />
        </div>

        {/* Recommended Listings */}
        <div className="bg-white rounded-lg p-6 shadow-sm border">
          <h2 className="text-lg font-semibold text-text-primary mb-4">
            {currentLanguage === 'am' ? 'የሚመከሩ ዝርዝሮች' : 'Recommended Listings'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dashboardData?.recommendations?.slice(0, 6).map((listing) => (
              <ProduceListingCard
                key={listing.id}
                listing={listing}
                currentLanguage={currentLanguage}
              />
            ))}
            {(!dashboardData?.recommendations || dashboardData.recommendations.length === 0) && (
              <div className="col-span-full text-center py-8">
                <p className="text-text-secondary mb-4">
                  {currentLanguage === 'am' ? 'ምንም የሚመከሩ ዝርዝሮች የሉም' : 'No recommendations available'}
                </p>
                <button
                  onClick={() => navigate('/browse-listings-buyer-home')}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
                >
                  {currentLanguage === 'am' ? 'ዝርዝሮችን ይመልከቱ' : 'Browse Listings'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default BuyerDashboard;
