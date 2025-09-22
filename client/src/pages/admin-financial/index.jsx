import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/AppIcon.jsx';
import Button from '../../components/ui/Button.jsx';

const AdminFinancial = () => {
  const { user, isAuthenticated } = useAuth();
  const [financialData, setFinancialData] = useState({
    revenue: 0,
    expenses: 0,
    profit: 0,
    commission: 0,
    pendingPayouts: 0
  });
  const [transactions, setTransactions] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutData, setPayoutData] = useState({
    farmerId: '',
    amount: 0,
    method: 'bank',
    description: ''
  });

  // Mock financial data
  const mockFinancialData = {
    revenue: 125000,
    expenses: 15000,
    profit: 110000,
    commission: 6250,
    pendingPayouts: 45000
  };

  const mockTransactions = [
    {
      id: 1,
      type: 'revenue',
      amount: 25000,
      description: 'Commission from orders',
      date: '2024-01-15T10:30:00Z',
      status: 'completed'
    },
    {
      id: 2,
      type: 'expense',
      amount: 5000,
      description: 'Server maintenance',
      date: '2024-01-14T14:20:00Z',
      status: 'completed'
    },
    {
      id: 3,
      type: 'revenue',
      amount: 15000,
      description: 'Commission from orders',
      date: '2024-01-13T09:45:00Z',
      status: 'completed'
    },
    {
      id: 4,
      type: 'expense',
      amount: 2000,
      description: 'Marketing campaign',
      date: '2024-01-12T16:30:00Z',
      status: 'completed'
    }
  ];

  const mockPayouts = [
    {
      id: 1,
      farmerId: 1,
      farmerName: 'John Doe',
      amount: 5000,
      method: 'bank',
      status: 'pending',
      requestDate: '2024-01-15T10:30:00Z',
      processedDate: null
    },
    {
      id: 2,
      farmerId: 2,
      farmerName: 'Jane Smith',
      amount: 3000,
      method: 'mobile',
      status: 'completed',
      requestDate: '2024-01-14T14:20:00Z',
      processedDate: '2024-01-14T15:30:00Z'
    },
    {
      id: 3,
      farmerId: 3,
      farmerName: 'Mike Johnson',
      amount: 7500,
      method: 'bank',
      status: 'pending',
      requestDate: '2024-01-13T09:45:00Z',
      processedDate: null
    }
  ];

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return;
    }
    loadFinancialData();
  }, [isAuthenticated, user]);

  const loadFinancialData = async () => {
    try {
      setLoading(true);
      setError('');
      setFinancialData(mockFinancialData);
      setTransactions(mockTransactions);
      setPayouts(mockPayouts);
    } catch (error) {
      console.error('Failed to load financial data:', error);
      setError('Failed to load financial data');
    } finally {
      setLoading(false);
    }
  };

  const handleProcessPayout = async () => {
    if (!payoutData.farmerId || !payoutData.amount) {
      setError('Please provide farmer ID and amount');
      return;
    }

    try {
      const newPayout = {
        id: Date.now(),
        farmerId: payoutData.farmerId,
        farmerName: 'Farmer Name', // Would be fetched from API
        amount: payoutData.amount,
        method: payoutData.method,
        status: 'pending',
        requestDate: new Date().toISOString(),
        processedDate: null
      };
      
      setPayouts(prev => [newPayout, ...prev]);
      setShowPayoutModal(false);
      setPayoutData({ farmerId: '', amount: 0, method: 'bank', description: '' });
    } catch (error) {
      console.error('Failed to process payout:', error);
      setError('Failed to process payout');
    }
  };

  const handlePayoutStatusUpdate = async (payoutId, newStatus) => {
    try {
      setPayouts(prev => prev.map(payout => 
        payout.id === payoutId 
          ? { 
              ...payout, 
              status: newStatus,
              processedDate: newStatus === 'completed' ? new Date().toISOString() : payout.processedDate
            }
          : payout
      ));
    } catch (error) {
      console.error('Failed to update payout status:', error);
      setError('Failed to update payout status');
    }
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: 'CheckCircle' },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: 'Clock' },
      failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: 'XCircle' }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon name={config.icon} size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Financial Management</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Monitor revenue, expenses, and manage payouts
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" iconName="RefreshCw" onClick={loadFinancialData} loading={loading}>
              Refresh
            </Button>
            <Button size="sm" iconName="DollarSign" onClick={() => setShowPayoutModal(true)}>
              Process Payout
            </Button>
          </div>
        </div>

        {/* Financial Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatAmount(financialData.revenue)}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Icon name="TrendingUp" size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Expenses</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatAmount(financialData.expenses)}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <Icon name="TrendingDown" size={24} className="text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Net Profit</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatAmount(financialData.profit)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Icon name="DollarSign" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Commission</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatAmount(financialData.commission)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Icon name="Percent" size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Payouts</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatAmount(financialData.pendingPayouts)}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Icon name="Clock" size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: 'BarChart3' },
              { id: 'transactions', name: 'Transactions', icon: 'CreditCard' },
              { id: 'payouts', name: 'Payouts', icon: 'DollarSign' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Icon name={tab.icon} size={16} />
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Revenue Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Commission Revenue</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatAmount(financialData.commission)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Other Revenue</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatAmount(financialData.revenue - financialData.commission)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">Total Revenue</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatAmount(financialData.revenue)}</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Expense Breakdown</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Server Costs</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatAmount(8000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Marketing</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatAmount(4000)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-600 dark:text-slate-400">Other</span>
                  <span className="font-medium text-slate-900 dark:text-white">{formatAmount(3000)}</span>
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700 pt-4">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-white">Total Expenses</span>
                    <span className="font-bold text-slate-900 dark:text-white">{formatAmount(financialData.expenses)}</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'transactions' && (
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          transaction.type === 'revenue' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                        }`}>
                          {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {transaction.description}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className={`font-medium ${
                          transaction.type === 'revenue' 
                            ? 'text-green-600 dark:text-green-400'
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.type === 'revenue' ? '+' : '-'}{formatAmount(transaction.amount)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {formatDate(transaction.date)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'payouts' && (
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Farmer</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Method</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Request Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map((payout) => (
                    <tr key={payout.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {payout.farmerName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          ID: {payout.farmerId}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">
                          {formatAmount(payout.amount)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          {payout.method}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(payout.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {formatDate(payout.requestDate)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {payout.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePayoutStatusUpdate(payout.id, 'completed')}
                            >
                              Approve
                            </Button>
                          )}
                          {payout.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handlePayoutStatusUpdate(payout.id, 'failed')}
                            >
                              Reject
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Payout Modal */}
        {showPayoutModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Process Payout
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Farmer ID
                  </label>
                  <input
                    type="text"
                    value={payoutData.farmerId}
                    onChange={(e) => setPayoutData(prev => ({ ...prev, farmerId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Enter farmer ID..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Amount
                  </label>
                  <input
                    type="number"
                    value={payoutData.amount}
                    onChange={(e) => setPayoutData(prev => ({ ...prev, amount: parseFloat(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Enter amount..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Payment Method
                  </label>
                  <select
                    value={payoutData.method}
                    onChange={(e) => setPayoutData(prev => ({ ...prev, method: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="bank">Bank Transfer</option>
                    <option value="mobile">Mobile Money</option>
                    <option value="cash">Cash</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={payoutData.description}
                    onChange={(e) => setPayoutData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Enter description..."
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowPayoutModal(false);
                    setPayoutData({ farmerId: '', amount: 0, method: 'bank', description: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleProcessPayout}>
                  Process Payout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default AdminFinancial;
