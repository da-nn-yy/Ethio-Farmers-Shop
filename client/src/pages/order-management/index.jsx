import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { auth } from '../../firebase';
import { useAuth } from '../../hooks/useAuth.jsx';
import GlobalHeader from '../../components/ui/GlobalHeader';
import TabNavigation from '../../components/ui/TabNavigation';
import MobileMenu from '../../components/ui/MobileMenu';
import OrderCard from './components/OrderCard';
import OrderFilters from './components/OrderFilters';
import OrderStats from './components/OrderStats';
import OrderTabs from './components/OrderTabs';
import EmptyOrderState from './components/EmptyOrderState';

import Button from '../../components/ui/Button';

const OrderManagement = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
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

  // Load language preference and real orders
  useEffect(() => {
    const load = async () => {
      const savedLanguage = localStorage.getItem('farmconnect_language') || 'en';
      setCurrentLanguage(savedLanguage);
      try {
        setIsLoading(true);
        const currentUser = auth.currentUser;
        const idToken = await currentUser.getIdToken();
        const RAW = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
        const API_BASE = RAW.endsWith('/api') ? RAW : `${RAW}/api`;
        const statusParam = activeTab === 'all' ? '' : `?status=${activeTab}`;
        // Role-aware fetch
        const path = (user?.role === 'buyer') ? `/orders/buyer${statusParam}` : `/orders/farmer${statusParam}`;
        const res = await axios.get(`${API_BASE}${path}` , {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        const data = Array.isArray(res.data) ? { orders: res.data } : res.data;
        // Normalize to UI model using server farmer fields
        const normalized = (data?.orders || []).map((o) => {
          const createdAt = o.createdAt || o.created_at;
          const totalAmount = Number(
            o.totalPrice ?? o.subtotal ?? o.total_amount ?? 0
          );
          const items = (o.items || []).map((it) => ({
            id: it.id || `item-${it.order_id || o.id}-${it.listing_id || ''}`,
            name: it.listing_title || it.name || 'Item',
            quantity: it.quantity ?? 0,
            unit: it.unit || 'unit',
            pricePerUnit: Number(it.unit_price ?? it.pricePerUnit ?? 0),
            total: Number(
              it.total_price ?? (it.quantity && it.unit_price ? it.quantity * it.unit_price : 0)
            ),
            image: it.image_url || ''
          }));
          return {
            id: o.id,
            orderNumber: String(o.id),
            status: o.status,
            createdAt,
            totalAmount,
            buyer: {
              name: o.buyer_name || o.buyerName || 'Buyer',
              avatar: '',
              phone: o.buyer_phone || o.buyerPhone || '',
              location: [o.buyer_region || o.buyerRegion, o.buyer_woreda || o.buyerWoreda].filter(Boolean).join(', '),
              verified: true
            },
            items,
            specialInstructions: o.notes || ''
          };
        });
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
      const currentUser = auth.currentUser;
      const idToken = await currentUser.getIdToken();
      const RAW = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const API_BASE = RAW.endsWith('/api') ? RAW : `${RAW}/api`;
      await axios.patch(
        `${API_BASE}/orders/${orderId}/status`,
        { status: 'confirmed' },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'confirmed' } : o));
    } catch (e) {
      console.error('Accept failed', e);
    }
  };

  const handleDeclineOrder = async (orderId) => {
    try {
      const currentUser = auth.currentUser;
      const idToken = await currentUser.getIdToken();
      const RAW = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const API_BASE = RAW.endsWith('/api') ? RAW : `${RAW}/api`;
      await axios.patch(
        `${API_BASE}/orders/${orderId}/status`,
        { status: 'cancelled' },
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (e) {
      console.error('Cancel failed', e);
    }
  };

  // Buyer cancel pending order
  const handleBuyerCancel = async (orderId) => {
    try {
      const currentUser = auth.currentUser;
      const idToken = await currentUser.getIdToken();
      const RAW = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const API_BASE = RAW.endsWith('/api') ? RAW : `${RAW}/api`;
      await axios.patch(
        `${API_BASE}/orders/${orderId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${idToken}` } }
      );
      setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'cancelled' } : o));
    } catch (e) {
      console.error('Buyer cancel failed', e);
    }
  };

  const handleContactBuyer = (phoneNumber) => {
    // Open phone dialer
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleViewDetails = async (orderId) => {
    try {
      const currentUser = auth.currentUser;
      const idToken = await currentUser.getIdToken();
      const RAW = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5001';
      const API_BASE = RAW.endsWith('/api') ? RAW : `${RAW}/api`;
      const res = await axios.get(`${API_BASE}/orders/${orderId}`, { headers: { Authorization: `Bearer ${idToken}` } });
      console.log('Order details', res.data);
      alert((currentLanguage === 'am' ? 'ዝርዝር: ' : 'Details: ') + JSON.stringify(res.data, null, 2));
    } catch (e) {
      console.error('View details failed', e);
    }
  };

  const handleExport = () => {
    // Export orders to CSV
    console.log('Exporting orders...');
  };

  const handleCreateListing = () => {
    navigate('/dashboard-farmer-home');
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
      <div className="min-h-screen bg-background">
        <GlobalHeader
          userRole="farmer"
          isAuthenticated={true}
          onLanguageChange={handleLanguageChange}
          currentLanguage={currentLanguage}
        />
        <TabNavigation
          userRole="farmer"
          notificationCounts={notificationCounts}
        />
        <div className="pt-32 lg:pt-36">
          <div className="flex items-center justify-center py-20">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 border-4 rounded-full border-primary border-t-transparent animate-spin"></div>
              <p className="text-text-secondary">
                {currentLanguage === 'am' ? 'ትዕዛዞች በመጫን ላይ...' : 'Loading orders...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <GlobalHeader
        userRole={user?.role || 'buyer'}
        isAuthenticated={true}
        onLanguageChange={handleLanguageChange}
        currentLanguage={currentLanguage}
      />
      <TabNavigation
        userRole={user?.role || 'buyer'}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        userRole={user?.role || 'buyer'}
        isAuthenticated={true}
        notificationCounts={notificationCounts}
        currentLanguage={currentLanguage}
      />
      <main className="pt-32 pb-8 lg:pt-36">
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
                  iconName="Plus"
                  iconPosition="left"
                >
                  {currentLanguage === 'am' ? 'ዝርዝር ይፍጠሩ' : 'Create Listing'}
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

          {/* Filters */}
          <div className="mb-6">
            <OrderFilters
              filters={filters}
              onFiltersChange={setFilters}
              onExport={handleExport}
              currentLanguage={currentLanguage}
            />
          </div>

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
                      onAccept={user?.role === 'farmer' ? handleAcceptOrder : undefined}
                      onDecline={user?.role === 'farmer' ? handleDeclineOrder : (user?.role === 'buyer' ? handleBuyerCancel : undefined)}
                      onViewDetails={handleViewDetails}
                      onContactBuyer={user?.role === 'farmer' ? handleContactBuyer : undefined}
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
      </main>
      {/* Mobile FAB */}
      <div className="fixed z-40 lg:hidden bottom-6 right-6">
        <Button
          variant="default"
          size="lg"
          onClick={handleCreateListing}
          className="rounded-full shadow-warm-lg"
          iconName="Plus"
        >
          {currentLanguage === 'am' ? 'ዝርዝር' : 'List'}
        </Button>
      </div>
    </div>
  );
};

export default OrderManagement;
