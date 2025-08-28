import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import GlobalHeader from '../../components/ui/GlobalHeader';
import TabNavigation from '../../components/ui/TabNavigation';
import MobileMenu from '../../components/ui/MobileMenu';
import OrderCard from './components/OrderCard';
import OrderFilters from './components/OrderFilters';
import OrderStats from './components/OrderStats';
import OrderTabs from './components/OrderTabs';
import EmptyOrderState from './components/EmptyOrderState';

import Button from '../../components/ui/Button';
import { OrdersApi } from '../../utils/api';

const OrderManagement = () => {
  const navigate = useNavigate();
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

  // Mock data for orders (fallback)
  const mockOrders = [
    {
      id: 'ORD-2024-001',
      orderNumber: '2024-001',
      buyer: {
        id: 'buyer-1',
        name: 'Almaz Tesfaye',
        avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
        phone: '+251911234567',
        location: 'Addis Ababa, Bole',
        businessType: 'Restaurant Owner',
        verified: true
      },
      items: [
        {
          id: 'item-1',
          name: 'Fresh Tomatoes',
          quantity: 50,
          unit: 'kg',
          pricePerUnit: 25,
          total: 1250,
          image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg'
        },
        {
          id: 'item-2',
          name: 'Red Onions',
          quantity: 30,
          unit: 'kg',
          pricePerUnit: 20,
          total: 600,
          image: 'https://images.pexels.com/photos/144248/potatoes-vegetables-erdfrucht-bio-144248.jpeg'
        }
      ],
      totalAmount: 1850,
      status: 'pending',
      createdAt: new Date('2024-08-27T10:30:00'),
      specialInstructions: 'Please ensure tomatoes are firm and ripe. Delivery needed by 2 PM.',
      pickupDetails: null
    },
    {
      id: 'ORD-2024-002',
      orderNumber: '2024-002',
      buyer: {
        id: 'buyer-2',
        name: 'Dawit Bekele',
        avatar: 'https://randomuser.me/api/portraits/men/45.jpg',
        phone: '+251922345678',
        location: 'Addis Ababa, Merkato',
        businessType: 'Grocery Store',
        verified: true
      },
      items: [
        {
          id: 'item-3',
          name: 'Green Cabbage',
          quantity: 25,
          unit: 'kg',
          pricePerUnit: 15,
          total: 375,
          image: 'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg'
        }
      ],
      totalAmount: 375,
      status: 'confirmed',
      createdAt: new Date('2024-08-26T14:20:00'),
      specialInstructions: 'Regular weekly order. Same quality as last time.',
      pickupDetails: {
        scheduledDate: new Date('2024-08-28T09:00:00'),
        location: 'Farm Gate, Debre Zeit Road'
      }
    },
    {
      id: 'ORD-2024-003',
      orderNumber: '2024-003',
      buyer: {
        id: 'buyer-3',
        name: 'Sara Johnson',
        avatar: 'https://randomuser.me/api/portraits/women/28.jpg',
        phone: '+251933456789',
        location: 'Addis Ababa, Kazanchis',
        businessType: 'Individual Consumer',
        verified: false
      },
      items: [
        {
          id: 'item-4',
          name: 'Organic Carrots',
          quantity: 10,
          unit: 'kg',
          pricePerUnit: 30,
          total: 300,
          image: 'https://images.pexels.com/photos/143133/pexels-photo-143133.jpeg'
        },
        {
          id: 'item-5',
          name: 'Fresh Lettuce',
          quantity: 5,
          unit: 'kg',
          pricePerUnit: 35,
          total: 175,
          image: 'https://images.pexels.com/photos/1656663/pexels-photo-1656663.jpeg'
        }
      ],
      totalAmount: 475,
      status: 'completed',
      createdAt: new Date('2024-08-25T16:45:00'),
      specialInstructions: 'First time buyer. Please pack carefully.',
      pickupDetails: {
        scheduledDate: new Date('2024-08-26T11:00:00'),
        location: 'Farm Gate, Debre Zeit Road'
      }
    },
    {
      id: 'ORD-2024-004',
      orderNumber: '2024-004',
      buyer: {
        id: 'buyer-4',
        name: 'Meron Tadesse',
        avatar: 'https://randomuser.me/api/portraits/women/41.jpg',
        phone: '+251944567890',
        location: 'Addis Ababa, Piassa',
        businessType: 'Hotel Manager',
        verified: true
      },
      items: [
        {
          id: 'item-6',
          name: 'Bell Peppers',
          quantity: 20,
          unit: 'kg',
          pricePerUnit: 40,
          total: 800,
          image: 'https://images.pexels.com/photos/1268101/pexels-photo-1268101.jpeg'
        }
      ],
      totalAmount: 800,
      status: 'cancelled',
      createdAt: new Date('2024-08-24T12:15:00'),
      specialInstructions: 'Mixed colors preferred - red, yellow, green.',
      pickupDetails: null
    }
  ];

  // Load language preference and orders
  useEffect(() => {
    const savedLanguage = localStorage.getItem('farmconnect_language') || 'en';
    setCurrentLanguage(savedLanguage);
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await OrdersApi.mine();
        // Map API into UI shape
        const mapped = (data?.items || []).map((o, idx) => ({
          id: o.id,
          orderNumber: String(o.id).padStart(6, '0'),
          buyer: {
            id: o.buyer_user_id,
            name: 'Buyer',
            avatar: 'https://randomuser.me/api/portraits/women/32.jpg',
            phone: '',
            location: '',
            businessType: '',
            verified: true
          },
          items: [
            {
              id: 'item-1',
              name: 'Item',
              quantity: 1,
              unit: 'kg',
              pricePerUnit: Number(o.subtotal || 0),
              total: Number(o.subtotal || 0),
              image: 'https://images.pexels.com/photos/1327838/pexels-photo-1327838.jpeg'
            }
          ],
          totalAmount: Number(o.total || o.subtotal || 0),
          status: o.status,
          createdAt: o.created_at,
          specialInstructions: o.notes || ''
        }));
        setOrders(mapped);
      } catch (_) {
        setOrders(mockOrders);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, []);

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
    try { await OrdersApi.updateStatus(orderId, 'confirmed'); } catch (_) {}
    setOrders(prevOrders => prevOrders?.map(order => order?.id === orderId ? { ...order, status: 'confirmed' } : order));
  };

  const handleDeclineOrder = async (orderId, reason) => {
    try { await OrdersApi.updateStatus(orderId, 'cancelled'); } catch (_) {}
    setOrders(prevOrders => prevOrders?.map(order => order?.id === orderId ? { ...order, status: 'cancelled' } : order));
  };

  const handleContactBuyer = (phoneNumber) => {
    // Open phone dialer
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const handleViewDetails = (orderId) => {
    // Navigate to order details or open modal
    console.log(`View details for order ${orderId}`);
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
        userRole="farmer"
        isAuthenticated={true}
        onLanguageChange={handleLanguageChange}
        currentLanguage={currentLanguage}
      />
      <TabNavigation
        userRole="farmer"
        notificationCounts={notificationCounts}
      />
      <MobileMenu
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
        userRole="farmer"
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
                      onAccept={handleAcceptOrder}
                      onDecline={handleDeclineOrder}
                      onViewDetails={handleViewDetails}
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
