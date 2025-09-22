import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/AppIcon.jsx';
import Button from '../../components/ui/Button.jsx';
import { adminPaymentService } from '../../services/apiService.js';

const AdminPayments = () => {
  const { user, isAuthenticated } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({
    totalPayments: 0,
    totalAmount: 0,
    completedPayments: 0,
    pendingPayments: 0,
    failedPayments: 0,
    refundedPayments: 0
  });
  const [filters, setFilters] = useState({
    status: 'all',
    paymentMethod: 'all',
    dateRange: '30d',
    search: ''
  });
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    hasNext: false
  });
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundData, setRefundData] = useState({ paymentId: null, amount: 0, reason: '' });

  // Mock payment data for demonstration
  const mockPayments = [
    {
      id: 1,
      user_id: 1,
      user_name: 'John Doe',
      user_role: 'buyer',
      order_id: 1,
      payment_method_id: 1,
      payment_method: {
        type: 'bank',
        details: { bankName: 'cbe', accountNumber: '1000123456789' }
      },
      amount: 2500.00,
      currency: 'ETB',
      status: 'completed',
      transaction_id: 'TXN123456789',
      payment_id: 'PAY123456789',
      description: 'Payment for agricultural products',
      failure_reason: null,
      processed_at: '2024-01-15T10:30:00Z',
      created_at: '2024-01-15T10:25:00Z',
      updated_at: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      user_id: 2,
      user_name: 'Jane Smith',
      user_role: 'farmer',
      order_id: 2,
      payment_method_id: 2,
      payment_method: {
        type: 'mobile',
        details: { provider: 'telebirr', phoneNumber: '+251912345678' }
      },
      amount: 1200.00,
      currency: 'ETB',
      status: 'completed',
      transaction_id: 'TXN123456790',
      payment_id: 'PAY123456790',
      description: 'Mobile payment for seeds',
      failure_reason: null,
      processed_at: '2024-01-14T14:20:00Z',
      created_at: '2024-01-14T14:15:00Z',
      updated_at: '2024-01-14T14:20:00Z'
    },
    {
      id: 3,
      user_id: 3,
      user_name: 'Mike Johnson',
      user_role: 'buyer',
      order_id: 3,
      payment_method_id: 3,
      payment_method: {
        type: 'cash',
        details: { method: 'cash_on_delivery' }
      },
      amount: 1800.00,
      currency: 'ETB',
      status: 'failed',
      transaction_id: 'TXN123456791',
      payment_id: 'PAY123456791',
      description: 'Cash on delivery payment',
      failure_reason: 'Delivery address not accessible',
      processed_at: null,
      created_at: '2024-01-13T09:45:00Z',
      updated_at: '2024-01-13T09:50:00Z'
    },
    {
      id: 4,
      user_id: 4,
      user_name: 'Sarah Wilson',
      user_role: 'farmer',
      order_id: 4,
      payment_method_id: 4,
      payment_method: {
        type: 'bank',
        details: { bankName: 'dashen', accountNumber: '2000987654321' }
      },
      amount: 3500.00,
      currency: 'ETB',
      status: 'pending',
      transaction_id: 'TXN123456792',
      payment_id: 'PAY123456792',
      description: 'Payment for farming equipment',
      failure_reason: null,
      processed_at: null,
      created_at: '2024-01-12T16:30:00Z',
      updated_at: '2024-01-12T16:30:00Z'
    },
    {
      id: 5,
      user_id: 5,
      user_name: 'David Brown',
      user_role: 'buyer',
      order_id: 5,
      payment_method_id: 5,
      payment_method: {
        type: 'mobile',
        details: { provider: 'amole', phoneNumber: '+251911234567' }
      },
      amount: 950.00,
      currency: 'ETB',
      status: 'refunded',
      transaction_id: 'TXN123456793',
      payment_id: 'PAY123456793',
      description: 'Mobile payment for fertilizer',
      failure_reason: null,
      processed_at: '2024-01-11T11:15:00Z',
      created_at: '2024-01-11T11:10:00Z',
      updated_at: '2024-01-11T11:20:00Z'
    }
  ];

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return;
    }
    loadPayments();
  }, [isAuthenticated, user, filters, pagination.page]);

  const loadPayments = async () => {
    try {
      setLoading(true);
      setError('');
      
      // For now, use mock data
      // const response = await adminPaymentService.getAllPayments({
      //   page: pagination.page,
      //   limit: pagination.limit,
      //   ...filters
      // });
      
      // Filter mock data based on current filters
      let filteredPayments = [...mockPayments];
      
      if (filters.status !== 'all') {
        filteredPayments = filteredPayments.filter(p => p.status === filters.status);
      }
      
      if (filters.paymentMethod !== 'all') {
        filteredPayments = filteredPayments.filter(p => p.payment_method.type === filters.paymentMethod);
      }
      
      if (filters.search) {
        filteredPayments = filteredPayments.filter(p => 
          p.user_name.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.transaction_id.toLowerCase().includes(filters.search.toLowerCase()) ||
          p.payment_id.toLowerCase().includes(filters.search.toLowerCase())
        );
      }
      
      setPayments(filteredPayments);
      setPagination(prev => ({
        ...prev,
        total: filteredPayments.length,
        hasNext: false
      }));
      
      // Calculate stats
      const totalAmount = filteredPayments.reduce((sum, p) => sum + p.amount, 0);
      const completedCount = filteredPayments.filter(p => p.status === 'completed').length;
      const pendingCount = filteredPayments.filter(p => p.status === 'pending').length;
      const failedCount = filteredPayments.filter(p => p.status === 'failed').length;
      const refundedCount = filteredPayments.filter(p => p.status === 'refunded').length;
      
      setStats({
        totalPayments: filteredPayments.length,
        totalAmount,
        completedPayments: completedCount,
        pendingPayments: pendingCount,
        failedPayments: failedCount,
        refundedPayments: refundedCount
      });
      
    } catch (error) {
      console.error('Failed to load payments:', error);
      setError('Failed to load payments');
      setPayments(mockPayments);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handleStatusUpdate = async (paymentId, newStatus, reason = '') => {
    try {
      // await adminPaymentService.updatePaymentStatus(paymentId, newStatus, reason);
      console.log(`Updating payment ${paymentId} to ${newStatus}`, reason);
      
      // Update local state
      setPayments(prev => prev.map(p => 
        p.id === paymentId 
          ? { ...p, status: newStatus, failure_reason: reason }
          : p
      ));
      
      // Reload to get updated stats
      loadPayments();
    } catch (error) {
      console.error('Failed to update payment status:', error);
      setError('Failed to update payment status');
    }
  };

  const handleRefund = async () => {
    if (!refundData.paymentId || !refundData.amount) {
      setError('Please provide refund amount');
      return;
    }

    try {
      // await adminPaymentService.processRefund(refundData.paymentId, refundData.amount, refundData.reason);
      console.log('Processing refund:', refundData);
      
      // Update local state
      setPayments(prev => prev.map(p => 
        p.id === refundData.paymentId 
          ? { ...p, status: 'refunded' }
          : p
      ));
      
      setShowRefundModal(false);
      setRefundData({ paymentId: null, amount: 0, reason: '' });
      loadPayments();
    } catch (error) {
      console.error('Failed to process refund:', error);
      setError('Failed to process refund');
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: 'CheckCircle' },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: 'Clock' },
      failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: 'XCircle' },
      cancelled: { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400', icon: 'X' },
      refunded: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: 'RefreshCw' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon name={config.icon} size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPaymentMethodIcon = (type) => {
    const icons = {
      bank: 'Building2',
      mobile: 'Smartphone',
      card: 'CreditCard',
      cash: 'Banknote'
    };
    return icons[type] || 'DollarSign';
  };

  const getPaymentMethodLabel = (method) => {
    if (method.type === 'bank') {
      return `${method.details.bankName?.toUpperCase()} - ${method.details.accountNumber}`;
    } else if (method.type === 'mobile') {
      return `${method.details.provider} - ${method.details.phoneNumber}`;
    } else if (method.type === 'cash') {
      return 'Cash on Delivery';
    }
    return method.type;
  };

  const formatAmount = (amount, currency = 'ETB') => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isAuthenticated || user?.role !== 'admin') {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <AuthenticatedLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Payment Management</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Monitor and manage all payment transactions
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" iconName="RefreshCw" onClick={loadPayments} loading={loading}>
              Refresh
            </Button>
            <Button variant="outline" size="sm" iconName="Download">
              Export
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Payments</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalPayments}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Icon name="DollarSign" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Amount</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatAmount(stats.totalAmount)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Icon name="TrendingUp" size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Completed</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completedPayments}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Icon name="CheckCircle" size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.pendingPayments}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg flex items-center justify-center">
                <Icon name="Clock" size={24} className="text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Status
              </label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="all">All Status</option>
                <option value="completed">Completed</option>
                <option value="pending">Pending</option>
                <option value="failed">Failed</option>
                <option value="cancelled">Cancelled</option>
                <option value="refunded">Refunded</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Payment Method
              </label>
              <select
                value={filters.paymentMethod}
                onChange={(e) => handleFilterChange('paymentMethod', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="all">All Methods</option>
                <option value="bank">Bank Transfer</option>
                <option value="mobile">Mobile Banking</option>
                <option value="card">Card Payment</option>
                <option value="cash">Cash on Delivery</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Date Range
              </label>
              <select
                value={filters.dateRange}
                onChange={(e) => handleFilterChange('dateRange', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search payments..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </Card>

        {/* Bulk Actions */}
        {selectedPayments.length > 0 && (
          <Card className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {selectedPayments.length} payments selected
              </span>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    selectedPayments.forEach(id => handleStatusUpdate(id, 'completed'));
                    setSelectedPayments([]);
                  }}
                >
                  Mark as Completed
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    selectedPayments.forEach(id => handleStatusUpdate(id, 'failed', 'Admin action'));
                    setSelectedPayments([]);
                  }}
                >
                  Mark as Failed
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Payments List */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedPayments.length === payments.length && payments.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedPayments(payments.map(p => p.id));
                        } else {
                          setSelectedPayments([]);
                        }
                      }}
                      className="rounded border-slate-300 dark:border-slate-600"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Transaction</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">User</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Amount</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Method</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                        <span className="ml-2 text-slate-600 dark:text-slate-400">Loading payments...</span>
                      </div>
                    </td>
                  </tr>
                ) : payments.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="text-center py-8">
                      <Icon name="CreditCard" size={48} className="mx-auto mb-4 text-slate-400" />
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                        No payments found
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        No payments match your current filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedPayments.includes(payment.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedPayments(prev => [...prev, payment.id]);
                            } else {
                              setSelectedPayments(prev => prev.filter(id => id !== payment.id));
                            }
                          }}
                          className="rounded border-slate-300 dark:border-slate-600"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {payment.transaction_id}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {payment.payment_id}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div>
                          <div className="font-medium text-slate-900 dark:text-white">
                            {payment.user_name}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {payment.user_role}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {formatAmount(payment.amount, payment.currency)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <Icon name={getPaymentMethodIcon(payment.payment_method.type)} size={16} className="mr-2 text-slate-500" />
                          <span className="text-sm text-slate-900 dark:text-white">
                            {getPaymentMethodLabel(payment.payment_method)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {formatDate(payment.created_at)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {payment.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(payment.id, 'completed')}
                            >
                              Complete
                            </Button>
                          )}
                          {payment.status === 'completed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setRefundData({ paymentId: payment.id, amount: payment.amount, reason: '' });
                                setShowRefundModal(true);
                              }}
                            >
                              Refund
                            </Button>
                          )}
                          {payment.status === 'failed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(payment.id, 'pending')}
                            >
                              Retry
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Refund Modal */}
        {showRefundModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Process Refund
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Refund Amount
                  </label>
                  <input
                    type="number"
                    value={refundData.amount}
                    onChange={(e) => setRefundData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Reason
                  </label>
                  <textarea
                    value={refundData.reason}
                    onChange={(e) => setRefundData(prev => ({ ...prev, reason: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Reason for refund..."
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRefundModal(false);
                    setRefundData({ paymentId: null, amount: 0, reason: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleRefund}>
                  Process Refund
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default AdminPayments;
