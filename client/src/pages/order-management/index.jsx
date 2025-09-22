import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { orderService } from '../../services/apiService';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import OrderCard from './components/OrderCard';
import ReviewForm from '../../components/ReviewForm.jsx';
import OrderStats from './components/OrderStats';
import OrderTabs from './components/OrderTabs';
import EmptyOrderState from './components/EmptyOrderState';

import Button from '../../components/ui/Button';
import { useLanguage } from '../../hooks/useLanguage.jsx';

const OrderManagement = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    dateFrom: '',
    dateTo: '',
    minValue: '',
    maxValue: '',
    buyerLocation: '',
    sortBy: 'newest'
  });
  const [reviewTarget, setReviewTarget] = useState(null); // { listingId, farmerId }

  // Load language preference and real orders
  useEffect(() => {
    const load = async () => {
      const savedLanguage = localStorage.getItem('farmconnect_language') || 'en';
      setCurrentLanguage(savedLanguage);
      try {
        setIsLoading(true);
        const status = activeTab === 'all' ? undefined : activeTab;
        const userRole = (JSON.parse(localStorage.getItem('user') || '{}')?.role) || localStorage.getItem('userRole') || 'buyer';
        const res = userRole === 'farmer'
          ? await orderService.getFarmerOrders({ status })
          : await orderService.getBuyerOrders({ status });
        // Normalize to UI model based on user role
        let normalized;
        if (userRole === 'farmer') {
          // Farmer orders - res.data.orders contains the orders
          const orders = res.orders || res;
          normalized = orders.map((o) => ({
            id: o.id,
            orderNumber: String(o.id),
            status: o.status,
            createdAt: o.created_at || o.createdAt,
            totalAmount: Number(o.subtotal || o.total || o.total_amount || 0),
            buyer: {
              name: o.buyer_name || 'Unknown Buyer',
              avatar: '',
              phone: o.buyer_phone || '',
              location: o.buyer_region || 'Unknown',
              verified: true
            },
            items: o.items ? o.items.map(item => ({
              id: `item-${item.id}`,
              name: item.listing_title || 'Unknown Item',
              quantity: item.quantity,
              unit: item.unit || 'kg',
              pricePerUnit: Number(item.price_per_unit || 0),
              total: Number(item.price_per_unit || 0) * Number(item.quantity || 0),
              image: item.image_url || 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg'
            })) : [],
            specialInstructions: o.notes || ''
          }));
        } else {
          // Buyer orders - direct array
          normalized = res.map((o) => ({
            id: o.id,
            orderNumber: String(o.id),
            status: o.status,
            createdAt: o.createdAt,
            totalAmount: Number(o.totalPrice),
            buyer: {
              name: 'You',
              avatar: '',
              phone: '',
              location: o.location,
              verified: true
            },
            items: [
              {
                id: `listing-${o.id}`,
                name: o.name,
                quantity: o.quantity,
                unit: 'kg',
                pricePerUnit: Number(o.pricePerKg),
                total: Number(o.totalPrice),
                image: o.image || 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg'
              }
            ],
            specialInstructions: o.notes || ''
          }));
        }
        setOrders(normalized);
      } catch (e) {
        console.error('Failed to load orders', e);
      } finally {
        setIsLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  useEffect(() => { if (language !== currentLanguage) setCurrentLanguage(language); }, [language]);

  // Filter orders based on active tab and filters
  useEffect(() => {
    let filtered = [...orders];

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered?.filter(order => order?.status === activeTab);
    }

    // Apply additional filters
    if (filters?.status && filters?.status !== activeTab) {
      filtered = filtered?.filter(order => order?.status === filters?.status);
    }

    if (filters?.dateFrom) {
      filtered = filtered?.filter(order =>
        new Date(order.createdAt) >= new Date(filters.dateFrom)
      );
    }

    if (filters?.dateTo) {
      filtered = filtered?.filter(order =>
        new Date(order.createdAt) <= new Date(filters.dateTo)
      );
    }

    if (filters?.minValue) {
      filtered = filtered?.filter(order =>
        order?.totalAmount >= parseFloat(filters?.minValue)
      );
    }

    if (filters?.maxValue) {
      filtered = filtered?.filter(order =>
        order?.totalAmount <= parseFloat(filters?.maxValue)
      );
    }

    if (filters?.buyerLocation) {
      filtered = filtered?.filter(order =>
        order?.buyer?.location?.toLowerCase()?.includes(filters?.buyerLocation?.toLowerCase())
      );
    }

    // Sort orders
    filtered?.sort((a, b) => {
      switch (filters?.sortBy) {
        case 'oldest':
          return new Date(a.createdAt) - new Date(b.createdAt);
        case 'highest_value':
          return b?.totalAmount - a?.totalAmount;
        case 'lowest_value':
          return a?.totalAmount - b?.totalAmount;
        default: // newest
          return new Date(b.createdAt) - new Date(a.createdAt);
      }
    });

    setFilteredOrders(filtered);
  }, [orders, activeTab, filters]);

  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('farmconnect_language', newLanguage);
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await orderService.updateOrderStatus(orderId, 'confirmed');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'confirmed' } : o));
    } catch (e) { console.error('Accept failed', e); }
  };

  const handleDeclineOrder = async (orderId) => {
    try {
      await orderService.cancelOrder(orderId);
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (e) {
      console.error('Cancel failed', e);
    }
  };

  const handleMarkShipped = async (orderId) => {
    try {
      await orderService.updateOrderStatus(orderId, 'shipped');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'shipped' } : o));
    } catch (e) { console.error('Mark shipped failed', e); }
  };

  const handleMarkCompleted = async (orderId) => {
    try {
      await orderService.updateOrderStatus(orderId, 'completed');
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'completed' } : o));
    } catch (e) { console.error('Mark completed failed', e); }
  };

  const handleContactBuyer = (phoneNumber) => {
    // Open phone dialer
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleViewDetails = (orderId) => {
    // Navigate to order details or open modal
    console.log(`View details for order ${orderId}`);
  };

  const handleWriteReview = (order) => {
    const item = order?.items?.[0];
    const inferredListingId = order?.listing_id || (item && item.id && String(item.id).startsWith('listing-') ? Number(String(item.id).split('-')[1]) : undefined);
    setReviewTarget({ listingId: inferredListingId, farmerId: order?.farmer_id });
  };

  const handleExport = () => {
    // Export orders to CSV
    console.log('Exporting orders...');
  };

  const handleCreateListing = () => {
    navigate('/browse-listings-buyer-home');
  };

  // Calculate order statistics
  const orderStats = {
    pending: orders?.filter(order => order?.status === 'pending')?.length,
    confirmed: orders?.filter(order => order?.status === 'confirmed')?.length,
    completed: orders?.filter(order => order?.status === 'completed')?.length,
    cancelled: orders?.filter(order => order?.status === 'cancelled')?.length,
    totalRevenue: orders?.filter(order => order?.status === 'completed')?.reduce((sum, order) => sum + order?.totalAmount, 0)
  };

  const orderCounts = {
    all: orders?.length,
    pending: orderStats?.pending,
    confirmed: orderStats?.confirmed,
    completed: orderStats?.completed,
    cancelled: orderStats?.cancelled
  };

  const notificationCounts = {
    orders: orderStats?.pending,
    total: orderStats?.pending
  };

  if (isLoading) {
    return (
      <AuthenticatedLayout>
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="w-12 h-12 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
            <p className="text-text-secondary">
              {currentLanguage === 'am' ? 'ትዕዛዞች በመጫን ላይ...' : 'Loading orders...'}
            </p>
          </div>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="px-4 mx-auto max-w-7xl lg:px-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold lg:text-3xl text-text-primary">
                  {currentLanguage === 'am' ? 'የትዕዛዝ አስተዳደር' : 'Order Management'}
                </h1>
                <p className="mt-1 text-text-secondary">
                  {currentLanguage === 'am' ?'የገዢዎች ትዕዛዞችን ይቆጣጠሩ እና ያስተዳድሩ' :'Monitor and manage buyer orders'
                  }
                </p>
              </div>

              <div className="items-center hidden space-x-3 lg:flex">
                <Button
                  variant="outline"
                  onClick={handleExport}
                  iconName="Download"
                  iconPosition="left"
                >
                  {currentLanguage === 'am' ? 'ወደ ውጪ ላክ' : 'Export'}
                </Button>
                <Button
                  variant="default"
                  onClick={handleCreateListing}
                  iconName="ShoppingBag"
                  iconPosition="left"
                >
                  {currentLanguage === 'am' ? 'ዝርዝሮችን ይመልከቱ' : 'Browse Listings'}
                </Button>
              </div>
            </div>

            {/* Order Statistics */}
            <OrderStats stats={orderStats} currentLanguage={currentLanguage} />
          </div>

          {/* Order Tabs */}
          <div className="mb-6">
            <OrderTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              orderCounts={orderCounts}
              currentLanguage={currentLanguage}
            />
          </div>

          {/* Filters removed for buyer orders per request */}

          {/* Orders List */}
          <div className="space-y-4">
            {filteredOrders?.length > 0 ? (
              <>
                {/* Results Header */}
                <div className="flex items-center justify-between">
                  <p className="text-sm text-text-secondary">
                    {currentLanguage === 'am'
                      ? `${filteredOrders?.length} ትዕዛዞች ተገኝተዋል`
                      : `${filteredOrders?.length} orders found`
                    }
                  </p>

                  {/* Mobile Actions */}
                  <div className="flex items-center space-x-2 lg:hidden">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExport}
                      iconName="Download"
                    >
                      {currentLanguage === 'am' ? 'ወደ ውጪ ላክ' : 'Export'}
                    </Button>
                  </div>
                </div>

                {/* Order Cards */}
                <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                  {filteredOrders?.map((order) => (
                    <OrderCard
                      key={order?.id}
                      order={order}
                      onAccept={handleAcceptOrder}
                      onDecline={handleDeclineOrder}
                      onViewDetails={handleViewDetails}
                      onWriteReview={handleWriteReview}
                      onShip={handleMarkShipped}
                      onComplete={handleMarkCompleted}
                      onContactBuyer={handleContactBuyer}
                      currentLanguage={currentLanguage}
                    />
                  ))}
                </div>
              </>
            ) : (
              <EmptyOrderState
                activeTab={activeTab}
                onCreateListing={handleCreateListing}
                currentLanguage={currentLanguage}
              />
            )}
          </div>
        </div>
      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-lg shadow-warm max-w-lg w-full mx-4 p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold text-text-primary">Write a Review</h3>
              <button onClick={() => setReviewTarget(null)} className="text-text-secondary hover:text-text-primary">×</button>
            </div>
            <ReviewForm
              listingId={reviewTarget.listingId}
              farmerId={reviewTarget.farmerId}
              onReviewSubmitted={() => { setReviewTarget(null); }}
              onCancel={() => setReviewTarget(null)}
            />
          </div>
        </div>
      )}
      {/* Mobile FAB removed for buyer order page */}
    </AuthenticatedLayout>
  );
};

export default OrderManagement;
