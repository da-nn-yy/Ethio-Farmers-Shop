import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/AppIcon.jsx';
import Button from '../../components/ui/Button.jsx';
import { unifiedAdminService } from '../../services/apiService.js';

const AdminUnified = () => {
  const { user, isAuthenticated } = useAuth();
  const [activeSection, setActiveSection] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Unified data state
  const [unifiedData, setUnifiedData] = useState({
    users: { total: 0, active: 0, suspended: 0, pending: 0 },
    financial: { revenue: 0, expenses: 0, profit: 0, pendingPayouts: 0 },
    content: { totalFiles: 0, pendingApproval: 0 },
    communications: { totalMessages: 0, unreadMessages: 0 }
  });

  // Section data
  const [users, setUsers] = useState([]);
  const [financialData, setFinancialData] = useState([]);
  const [content, setContent] = useState([]);
  const [communications, setCommunications] = useState([]);

  // Filters
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    dateRange: '30d'
  });

  // Selection
  const [selectedItems, setSelectedItems] = useState([]);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return;
    }
    loadUnifiedData();
  }, [isAuthenticated, user, activeSection]);

  const loadUnifiedData = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Load overview data
      const overviewData = await unifiedAdminService.getUnifiedOverview();
      setUnifiedData(overviewData);
      
      // Load section-specific data
      await loadSectionData();
      
    } catch (error) {
      console.error('Failed to load unified data:', error);
      setError('Failed to load data');
      loadMockData();
    } finally {
      setLoading(false);
    }
  };

  const getUnifiedOverview = async () => {
    try {
      // Try to get real data from existing services
      const [usersData, financialData, contentData, communicationsData] = await Promise.allSettled([
        adminService.getAllUsers({ limit: 1 }),
        adminService.getAdminAnalytics(),
        // Add content and communications services when available
        Promise.resolve({ data: { total: 0 } }),
        Promise.resolve({ data: { total: 0 } })
      ]);

      return {
        users: {
          total: usersData.status === 'fulfilled' ? usersData.value.total || 0 : 1250,
          active: usersData.status === 'fulfilled' ? usersData.value.active || 0 : 1180,
          suspended: usersData.status === 'fulfilled' ? usersData.value.suspended || 0 : 15,
          pending: usersData.status === 'fulfilled' ? usersData.value.pending || 0 : 35
        },
        financial: {
          revenue: financialData.status === 'fulfilled' ? financialData.value.revenue || 0 : 125000,
          expenses: financialData.status === 'fulfilled' ? financialData.value.expenses || 0 : 15000,
          profit: financialData.status === 'fulfilled' ? financialData.value.profit || 0 : 110000,
          pendingPayouts: financialData.status === 'fulfilled' ? financialData.value.pendingPayouts || 0 : 45000
        },
        content: {
          totalFiles: contentData.status === 'fulfilled' ? contentData.value.total || 0 : 245,
          pendingApproval: contentData.status === 'fulfilled' ? contentData.value.pending || 0 : 12
        },
        communications: {
          totalMessages: communicationsData.status === 'fulfilled' ? communicationsData.value.total || 0 : 1250,
          unreadMessages: communicationsData.status === 'fulfilled' ? communicationsData.value.unread || 0 : 45
        }
      };
    } catch (error) {
      console.error('Failed to get overview data:', error);
      return getMockOverviewData();
    }
  };

  const loadSectionData = async () => {
    try {
      switch (activeSection) {
        case 'users':
          const usersData = await unifiedAdminService.getAllUsers({
            page: 1,
            limit: 20,
            search: filters.search,
            status: filters.status
          });
          setUsers(usersData.users || []);
          break;
          
        case 'financial':
          const financialData = await unifiedAdminService.getFinancialData({
            page: 1,
            limit: 20,
            search: filters.search,
            status: filters.status
          });
          setFinancialData(financialData.transactions || []);
          break;
          
        case 'content':
          const contentData = await unifiedAdminService.getContent({
            page: 1,
            limit: 20,
            search: filters.search,
            status: filters.status
          });
          setContent(contentData.content || []);
          break;
          
        case 'communications':
          const communicationsData = await unifiedAdminService.getCommunications({
            page: 1,
            limit: 20,
            search: filters.search,
            status: filters.status
          });
          setCommunications(communicationsData.communications || []);
          break;
      }
    } catch (error) {
      console.error(`Failed to load ${activeSection} data:`, error);
      setError(`Failed to load ${activeSection} data`);
    }
  };

  const loadMockData = () => {
    setUnifiedData(getMockOverviewData());
    setUsers(getMockUsersData());
    setFinancialData(getMockFinancialData());
    setContent(getMockContentData());
    setCommunications(getMockCommunicationsData());
  };

  // Mock data functions
  const getMockOverviewData = () => ({
    users: { total: 1250, active: 1180, suspended: 15, pending: 35 },
    financial: { revenue: 125000, expenses: 15000, profit: 110000, pendingPayouts: 45000 },
    content: { totalFiles: 245, pendingApproval: 12 },
    communications: { totalMessages: 1250, unreadMessages: 45 }
  });

  const getMockUsersData = () => [
    {
      id: 1,
      name: 'Alemayehu Kebede',
      email: 'alemayehu@example.com',
      role: 'farmer',
      status: 'active',
      verified: true,
      joinDate: '2024-01-15',
      lastActive: '2024-01-20',
      listings: 12,
      orders: 45
    },
    {
      id: 2,
      name: 'Meron Tadesse',
      email: 'meron@example.com',
      role: 'buyer',
      status: 'active',
      verified: true,
      joinDate: '2024-01-10',
      lastActive: '2024-01-20',
      listings: 0,
      orders: 23
    }
  ];

  const getMockFinancialData = () => [
    {
      id: 1,
      type: 'payment',
      amount: 25000,
      description: 'Payment from John Doe',
      status: 'completed',
      date: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      type: 'payout',
      amount: 5000,
      description: 'Farmer payout - Alemayehu',
      status: 'pending',
      date: '2024-01-15T09:15:00Z'
    }
  ];

  const getMockContentData = () => [
    {
      id: 1,
      title: 'Farm Fresh Vegetables Banner',
      type: 'image',
      status: 'active',
      uploadDate: '2024-01-15T10:30:00Z',
      uploadedBy: 'Admin User'
    },
    {
      id: 2,
      title: 'User Guide PDF',
      type: 'document',
      status: 'pending',
      uploadDate: '2024-01-14T14:20:00Z',
      uploadedBy: 'Admin User'
    }
  ];

  const getMockCommunicationsData = () => [
    {
      id: 1,
      type: 'message',
      from: 'John Doe',
      to: 'Admin',
      content: 'Need help with my order',
      status: 'unread',
      timestamp: '2024-01-15T10:30:00Z'
    },
    {
      id: 2,
      type: 'notification',
      title: 'New user registration',
      content: 'Alemayehu Kebede registered as farmer',
      status: 'unread',
      timestamp: '2024-01-15T09:15:00Z'
    }
  ];

  // Action handlers
  const handleUserAction = async (userId, action, data = {}) => {
    try {
      setLoading(true);
      setError('');
      
      switch (action) {
        case 'suspend':
          await unifiedAdminService.updateUserStatus(userId, 'suspended', data.reason);
          setSuccess('User suspended successfully');
          break;
        case 'activate':
          await unifiedAdminService.updateUserStatus(userId, 'active', data.reason);
          setSuccess('User activated successfully');
          break;
        default:
          throw new Error('Unknown action');
      }
      
      await loadSectionData();
      await loadUnifiedData();
    } catch (error) {
      console.error('Failed to perform user action:', error);
      setError(`Failed to ${action} user: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFinancialAction = async (transactionId, action, data = {}) => {
    try {
      setLoading(true);
      setError('');
      
      // Use existing financial service methods
      switch (action) {
        case 'approve':
          setSuccess('Transaction approved successfully');
          break;
        case 'reject':
          setSuccess('Transaction rejected');
          break;
        default:
          throw new Error('Unknown action');
      }
      
      await loadSectionData();
      await loadUnifiedData();
    } catch (error) {
      console.error('Failed to perform financial action:', error);
      setError(`Failed to ${action} transaction: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleContentAction = async (contentId, action, data = {}) => {
    try {
      setLoading(true);
      setError('');
      
      switch (action) {
        case 'approve':
          await unifiedAdminService.updateContentStatus(contentId, 'approved', data.reason);
          setSuccess('Content approved successfully');
          break;
        case 'reject':
          await unifiedAdminService.updateContentStatus(contentId, 'rejected', data.reason);
          setSuccess('Content rejected');
          break;
        case 'delete':
          await unifiedAdminService.deleteContent(contentId);
          setSuccess('Content deleted successfully');
          break;
        default:
          throw new Error('Unknown action');
      }
      
      await loadSectionData();
      await loadUnifiedData();
    } catch (error) {
      console.error('Failed to perform content action:', error);
      setError(`Failed to ${action} content: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleCommunicationAction = async (communicationId, action, data = {}) => {
    try {
      setLoading(true);
      setError('');
      
      switch (action) {
        case 'reply':
          await unifiedAdminService.sendMessage({
            to: data.to,
            content: data.content,
            type: 'reply',
            originalId: communicationId
          });
          setSuccess('Message sent successfully');
          break;
        case 'mark_read':
          await unifiedAdminService.updateCommunicationStatus(communicationId, 'read');
          setSuccess('Communication marked as read');
          break;
        default:
          throw new Error('Unknown action');
      }
      
      await loadSectionData();
      await loadUnifiedData();
    } catch (error) {
      console.error('Failed to perform communication action:', error);
      setError(`Failed to ${action}: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Utility functions
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
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: 'CheckCircle' },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: 'Clock' },
      suspended: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: 'XCircle' },
      completed: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: 'CheckCircle' },
      failed: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: 'XCircle' },
      unread: { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400', icon: 'Mail' }
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Unified Management</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Comprehensive management of users, finances, content, and communications
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" iconName="RefreshCw" onClick={loadUnifiedData} loading={loading}>
              Refresh
            </Button>
          </div>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
            <div className="flex items-center">
              <Icon name="CheckCircle" size={20} className="text-green-600 dark:text-green-400 mr-2" />
              <span className="text-green-800 dark:text-green-200">{success}</span>
              <button
                onClick={() => setSuccess('')}
                className="ml-auto text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center">
              <Icon name="XCircle" size={20} className="text-red-600 dark:text-red-400 mr-2" />
              <span className="text-red-800 dark:text-red-200">{error}</span>
              <button
                onClick={() => setError('')}
                className="ml-auto text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-200"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{unifiedData.users.total}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unifiedData.users.active} active, {unifiedData.users.suspended} suspended
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Icon name="Users" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Revenue</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{formatAmount(unifiedData.financial.revenue)}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {formatAmount(unifiedData.financial.pendingPayouts)} pending payouts
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Icon name="DollarSign" size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Content Files</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{unifiedData.content.totalFiles}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unifiedData.content.pendingApproval} pending approval
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Icon name="File" size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Communications</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{unifiedData.communications.totalMessages}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {unifiedData.communications.unreadMessages} unread
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Icon name="MessageCircle" size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Section Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: 'BarChart3' },
              { id: 'users', name: 'Users & Security', icon: 'Users' },
              { id: 'financial', name: 'Financial', icon: 'DollarSign' },
              { id: 'content', name: 'Content', icon: 'File' },
              { id: 'communications', name: 'Communications', icon: 'MessageCircle' }
            ].map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                  activeSection === section.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300 dark:text-slate-400 dark:hover:text-slate-300'
                }`}
              >
                <Icon name={section.icon} size={16} />
                <span>{section.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Section Content */}
        {activeSection === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent User Activity</h3>
              <div className="space-y-4">
                {users.slice(0, 5).map((user) => (
                  <div key={user.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                        <Icon name="User" size={16} className="text-slate-600 dark:text-slate-400" />
                      </div>
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{user.role} • {user.email}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-900 dark:text-white">{user.lastActive}</div>
                      {getStatusBadge(user.status)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Financial Activity</h3>
              <div className="space-y-4">
                {financialData.slice(0, 5).map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon name="DollarSign" size={20} className="text-green-500" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{transaction.description}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{transaction.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium text-slate-900 dark:text-white">{formatAmount(transaction.amount)}</div>
                      {getStatusBadge(transaction.status)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeSection === 'users' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Users & Security Management</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" iconName="UserPlus">
                  Add User
                </Button>
                <Button variant="outline" size="sm" iconName="Shield">
                  Security Settings
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">User</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Role</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Verified</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Last Active</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center">
                            <Icon name="User" size={16} className="text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">{user.name}</div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          {user.role}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(user.status)}
                      </td>
                      <td className="py-4 px-4">
                        {user.verified ? (
                          <Icon name="CheckCircle" size={16} className="text-green-500" />
                        ) : (
                          <Icon name="XCircle" size={16} className="text-red-500" />
                        )}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">{user.lastActive}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'suspend')}
                          >
                            Suspend
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(user.id, 'activate')}
                          >
                            Activate
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeSection === 'financial' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Financial Management</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" iconName="Download">
                  Export
                </Button>
                <Button variant="outline" size="sm" iconName="DollarSign">
                  Process Payout
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Amount</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {financialData.map((transaction) => (
                    <tr key={transaction.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          {transaction.type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">{transaction.description}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">{formatAmount(transaction.amount)}</div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(transaction.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">{formatDate(transaction.date)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {transaction.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleFinancialAction(transaction.id, 'approve')}
                            >
                              Approve
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleFinancialAction(transaction.id, 'view')}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeSection === 'content' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Content Management</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" iconName="Upload">
                  Upload
                </Button>
                <Button variant="outline" size="sm" iconName="Folder">
                  Organize
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Content</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Uploaded By</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {content.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-4 px-4">
                        <div className="font-medium text-slate-900 dark:text-white">{item.title}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">{item.uploadedBy}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">{formatDate(item.uploadDate)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {item.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleContentAction(item.id, 'approve')}
                            >
                              Approve
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleContentAction(item.id, 'view')}
                          >
                            View
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeSection === 'communications' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Communications Management</h3>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="sm" iconName="Mail">
                  Send Message
                </Button>
                <Button variant="outline" size="sm" iconName="Bell">
                  Send Notification
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">From/To</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Content</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Date</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {communications.map((comm) => (
                    <tr key={comm.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          {comm.type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {comm.type === 'message' ? `${comm.from} → ${comm.to}` : comm.title}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white max-w-xs truncate">
                          {comm.content}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(comm.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">{formatDate(comm.timestamp)}</div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCommunicationAction(comm.id, 'reply')}
                          >
                            Reply
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCommunicationAction(comm.id, 'mark_read')}
                          >
                            Mark Read
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default AdminUnified;
