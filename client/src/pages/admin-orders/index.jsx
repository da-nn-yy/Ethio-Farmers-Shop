import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AdminPage from '../../components/ui/AdminPage.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/AppIcon.jsx';
import Button from '../../components/ui/Button.jsx';
import { adminService } from '../../services/apiService.js';

const AdminOrders = () => {
  const { user, isAuthenticated } = useAuth();
  const [orders, setOrders] = useState([]);
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    return (
      <AdminPage
        title="Order Management"
        subtitle="Track and manage orders placed on the platform"
        actions={<>
          <Button variant="outline" size="sm" iconName="Download">Export</Button>
        </>}
      >
    {
      id: 'ORD-002',
      buyer: 'Hanna Wolde',
      farmer: 'Getachew Molla',
      items: [
        { name: 'Organic Coffee Beans', quantity: 10, price: 320, total: 3200 }
      ],
      status: 'confirmed',
      total: 3200,
      createdAt: '2024-01-19',
      deliveryDate: '2024-01-24',
      paymentMethod: 'Mobile Money',
      address: 'Bahir Dar, Ethiopia'
    },
    {
      id: 'ORD-003',
      buyer: 'Dawit Haile',
      farmer: 'Meron Tadesse',
      items: [
        { name: 'Yellow Maize', quantity: 100, price: 35, total: 3500 }
      ],
      status: 'shipped',
      total: 3500,
      createdAt: '2024-01-18',
      deliveryDate: '2024-01-23',
      paymentMethod: 'Cash on Delivery',
      address: 'Hawassa, Ethiopia'
    },
    {
      id: 'ORD-004',
      buyer: 'Tigist Bekele',
      farmer: 'Alemayehu Kebede',
      items: [
        { name: 'Red Kidney Beans', quantity: 25, price: 95, total: 2375 }
      ],
      status: 'delivered',
      total: 2375,
      createdAt: '2024-01-15',
      deliveryDate: '2024-01-20',
      paymentMethod: 'Bank Transfer',
      address: 'Gondar, Ethiopia'
    }
  ];

  useEffect(() => {
    loadOrders();
  }, [pagination.page, statusFilter, dateFilter]);

  const loadOrders = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        dateFrom: dateFilter === 'today' ? new Date().toISOString().split('T')[0] : undefined,
        dateTo: dateFilter === 'today' ? new Date().toISOString().split('T')[0] : undefined
      };
      
      const data = await adminService.getAllOrders(params);
      setOrders(data.orders || []);
      setFilteredOrders(data.orders || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Failed to load orders:', error);
      // Fallback to mock data
      setOrders(mockOrders);
      setFilteredOrders(mockOrders);
    } finally {
      setIsLoading(false);
    }
  };

  const filterOrders = () => {
    let filtered = [...orders];

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.buyer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.farmer.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      
      filtered = filtered.filter(order => {
        const orderDate = new Date(order.createdAt);
        switch (dateFilter) {
          case 'today':
            return orderDate >= today;
          case 'week':
            const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
            return orderDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
            return orderDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    setFilteredOrders(filtered);
  };

  const handleOrderAction = (orderId, action) => {
    setOrders(prev => prev.map(order => {
      if (order.id === orderId) {
        switch (action) {
          case 'confirm':
            return { ...order, status: 'confirmed' };
          case 'ship':
            return { ...order, status: 'shipped' };
          case 'deliver':
            return { ...order, status: 'delivered' };
          case 'cancel':
            return { ...order, status: 'cancelled' };
          default:
            return order;
        }
      }
      return order;
    }));
  };

  const getStatusBadge = (status) => {
    // Handle undefined, null, or empty status
    if (!status || typeof status !== 'string') {
      status = 'pending'; // Default fallback
    }
    
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: 'Clock' },
      confirmed: { color: 'bg-blue-100 text-blue-800', icon: 'CheckCircle' },
      shipped: { color: 'bg-purple-100 text-purple-800', icon: 'Truck' },
      delivered: { color: 'bg-green-100 text-green-800', icon: 'CheckCircle' },
      cancelled: { color: 'bg-red-100 text-red-800', icon: 'XCircle' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon name={config.icon} size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getTotalRevenue = () => {
    return orders
      .filter(order => order.status === 'delivered')
      .reduce((sum, order) => sum + order.total, 0);
  };

  const getPendingOrders = () => {
    return orders.filter(order => order.status === 'pending').length;
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Icon name="Shield" size={48} className="mx-auto mb-4 text-red-500" />
          <p className="text-gray-600">Access Denied</p>
        </div>
      </div>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        {/* Header */}
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-700">
          <div className="px-4 mx-auto max-w-7xl lg:px-6 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Order Management</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Track and manage orders, payments, and deliveries
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" iconName="Download">Export</Button>
                <Button variant="primary" size="sm" iconName="Plus">Create Order</Button>
              </div>
            </div>
          </div>
        </div>

        <div className="px-4 mx-auto max-w-7xl lg:px-6 py-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Orders</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{orders.length}</p>
                </div>
                <Icon name="ShoppingCart" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Orders</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{getPendingOrders()}</p>
                </div>
                <Icon name="Clock" size={24} className="text-yellow-600 dark:text-yellow-400" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Delivered</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {orders.filter(o => o.status === 'delivered').length}
                  </p>
                </div>
                <Icon name="CheckCircle" size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Revenue</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">ETB {getTotalRevenue().toLocaleString()}</p>
                </div>
                <Icon name="DollarSign" size={24} className="text-emerald-600 dark:text-emerald-400" />
              </div>
            </Card>
          </div>

          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search orders by ID, buyer, or farmer..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  />
                </div>
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
                <select
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                  className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            </div>
          </Card>

          {/* Orders List */}
          <div className="space-y-4">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="p-6 animate-pulse">
                  <div className="flex items-center space-x-4">
                    <div className="h-12 w-12 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
                      <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/2"></div>
                    </div>
                    <div className="h-8 bg-slate-200 dark:bg-slate-700 rounded w-20"></div>
                  </div>
                </Card>
              ))
            ) : filteredOrders.length === 0 ? (
              <Card className="p-12 text-center">
                <Icon name="ShoppingCart" size={48} className="mx-auto mb-4 text-slate-400" />
                <p className="text-slate-600 dark:text-slate-400">No orders found</p>
              </Card>
            ) : (
              filteredOrders.map((order) => (
                <Card key={order.id} className="p-6 hover:shadow-lg transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <Icon name="ShoppingCart" size={24} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{order.id}</h3>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            {order.buyer} → {order.farmer}
                          </p>
                        </div>
                        <div className="ml-auto">
                          {getStatusBadge(order.status)}
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Order Items</p>
                          <div className="space-y-1">
                            {order.items.map((item, index) => (
                              <p key={index} className="text-sm text-slate-900 dark:text-white">
                                {item.name} × {item.quantity} kg
                              </p>
                            ))}
                          </div>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Payment</p>
                          <p className="text-sm text-slate-900 dark:text-white">{order.paymentMethod}</p>
                          <p className="text-lg font-bold text-green-600 dark:text-green-400">ETB {order.total.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Delivery</p>
                          <p className="text-sm text-slate-900 dark:text-white">{order.address}</p>
                          <p className="text-sm text-slate-600 dark:text-slate-400">
                            Due: {new Date(order.deliveryDate).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
                        <span>Created: {new Date(order.createdAt).toLocaleDateString()}</span>
                        <div className="flex space-x-2">
                          {order.status === 'pending' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOrderAction(order.id, 'confirm')}
                              iconName="CheckCircle"
                            >
                              Confirm
                            </Button>
                          )}
                          {order.status === 'confirmed' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOrderAction(order.id, 'ship')}
                              iconName="Truck"
                            >
                              Ship
                            </Button>
                          )}
                          {order.status === 'shipped' && (
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleOrderAction(order.id, 'deliver')}
                              iconName="CheckCircle"
                            >
                              Mark Delivered
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" iconName="Eye">View Details</Button>
                          <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default AdminOrders;
