import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/AppIcon.jsx';
import Button from '../../components/ui/Button.jsx';

const AdminSecurity = () => {
  const { user, isAuthenticated } = useAuth();
  const [securityData, setSecurityData] = useState({
    totalUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    failedLogins: 0,
    securityAlerts: 0
  });
  const [securityLogs, setSecurityLogs] = useState([]);
  const [userVerifications, setUserVerifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verificationData, setVerificationData] = useState({
    userId: '',
    type: 'identity',
    status: 'pending',
    notes: ''
  });

  // Mock security data
  const mockSecurityData = {
    totalUsers: 1250,
    activeUsers: 1180,
    suspendedUsers: 15,
    failedLogins: 45,
    securityAlerts: 8
  };

  const mockSecurityLogs = [
    {
      id: 1,
      type: 'login_failed',
      userId: 123,
      userName: 'John Doe',
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-01-15T10:30:00Z',
      severity: 'medium',
      description: 'Multiple failed login attempts'
    },
    {
      id: 2,
      type: 'suspicious_activity',
      userId: 456,
      userName: 'Jane Smith',
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      timestamp: '2024-01-15T09:15:00Z',
      severity: 'high',
      description: 'Unusual access pattern detected'
    },
    {
      id: 3,
      type: 'account_suspended',
      userId: 789,
      userName: 'Mike Johnson',
      ipAddress: '192.168.1.102',
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36',
      timestamp: '2024-01-15T08:45:00Z',
      severity: 'high',
      description: 'Account suspended due to policy violation'
    },
    {
      id: 4,
      type: 'password_reset',
      userId: 321,
      userName: 'Sarah Wilson',
      ipAddress: '192.168.1.103',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      timestamp: '2024-01-15T07:20:00Z',
      severity: 'low',
      description: 'Password reset requested'
    }
  ];

  const mockUserVerifications = [
    {
      id: 1,
      userId: 123,
      userName: 'John Doe',
      type: 'identity',
      status: 'pending',
      submittedAt: '2024-01-15T10:30:00Z',
      documents: ['id_card.jpg', 'selfie.jpg'],
      notes: 'Waiting for document review'
    },
    {
      id: 2,
      userId: 456,
      userName: 'Jane Smith',
      type: 'business',
      status: 'approved',
      submittedAt: '2024-01-14T14:20:00Z',
      documents: ['business_license.pdf', 'tax_certificate.pdf'],
      notes: 'All documents verified'
    },
    {
      id: 3,
      userId: 789,
      userName: 'Mike Johnson',
      type: 'identity',
      status: 'rejected',
      submittedAt: '2024-01-13T09:45:00Z',
      documents: ['id_card.jpg'],
      notes: 'Document quality insufficient'
    }
  ];

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return;
    }
    loadSecurityData();
  }, [isAuthenticated, user]);

  const loadSecurityData = async () => {
    try {
      setLoading(true);
      setError('');
      setSecurityData(mockSecurityData);
      setSecurityLogs(mockSecurityLogs);
      setUserVerifications(mockUserVerifications);
    } catch (error) {
      console.error('Failed to load security data:', error);
      setError('Failed to load security data');
    } finally {
      setLoading(false);
    }
  };

  const handleVerificationUpdate = async (verificationId, newStatus, notes = '') => {
    try {
      setUserVerifications(prev => prev.map(verification => 
        verification.id === verificationId 
          ? { ...verification, status: newStatus, notes }
          : verification
      ));
    } catch (error) {
      console.error('Failed to update verification status:', error);
      setError('Failed to update verification status');
    }
  };

  const handleUserAction = async (userId, action, reason = '') => {
    try {
      console.log(`Performing ${action} on user ${userId}`, reason);
      // Here you would make API calls to perform the action
      loadSecurityData(); // Refresh data
    } catch (error) {
      console.error('Failed to perform user action:', error);
      setError('Failed to perform user action');
    }
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

  const getSeverityBadge = (severity) => {
    const severityConfig = {
      low: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: 'Info' },
      medium: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: 'AlertTriangle' },
      high: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: 'AlertCircle' }
    };
    
    const config = severityConfig[severity] || severityConfig.low;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon name={config.icon} size={12} className="mr-1" />
        {severity.charAt(0).toUpperCase() + severity.slice(1)}
      </span>
    );
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      approved: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: 'CheckCircle' },
      pending: { color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400', icon: 'Clock' },
      rejected: { color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400', icon: 'XCircle' }
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Security Management</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Monitor security events, user verifications, and system security
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" iconName="RefreshCw" onClick={loadSecurityData} loading={loading}>
              Refresh
            </Button>
            <Button size="sm" iconName="Shield" onClick={() => setShowVerificationModal(true)}>
              Verify User
            </Button>
          </div>
        </div>

        {/* Security Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{securityData.totalUsers}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Icon name="Users" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Users</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{securityData.activeUsers}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Icon name="CheckCircle" size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Suspended Users</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{securityData.suspendedUsers}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <Icon name="XCircle" size={24} className="text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Failed Logins</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{securityData.failedLogins}</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Icon name="AlertTriangle" size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Security Alerts</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{securityData.securityAlerts}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Icon name="Shield" size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Tabs */}
        <div className="border-b border-slate-200 dark:border-slate-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { id: 'overview', name: 'Overview', icon: 'BarChart3' },
              { id: 'logs', name: 'Security Logs', icon: 'FileText' },
              { id: 'verifications', name: 'User Verifications', icon: 'UserCheck' }
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
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Security Events</h3>
              <div className="space-y-4">
                {securityLogs.slice(0, 5).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon name="AlertCircle" size={20} className="text-red-500" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{log.description}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{log.userName}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-900 dark:text-white">{formatDate(log.timestamp)}</div>
                      {getSeverityBadge(log.severity)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Pending Verifications</h3>
              <div className="space-y-4">
                {userVerifications.filter(v => v.status === 'pending').slice(0, 5).map((verification) => (
                  <div key={verification.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Icon name="User" size={20} className="text-blue-500" />
                      <div>
                        <div className="font-medium text-slate-900 dark:text-white">{verification.userName}</div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">{verification.type} verification</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-slate-900 dark:text-white">{formatDate(verification.submittedAt)}</div>
                      {getStatusBadge(verification.status)}
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'logs' && (
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">User</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Description</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">IP Address</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Severity</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Timestamp</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {securityLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          {log.type.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {log.userName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          ID: {log.userId}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {log.description}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {log.ipAddress}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getSeverityBadge(log.severity)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {formatDate(log.timestamp)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {log.severity === 'high' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleUserAction(log.userId, 'suspend', 'Security violation')}
                            >
                              Suspend
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleUserAction(log.userId, 'investigate')}
                          >
                            Investigate
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

        {activeTab === 'verifications' && (
          <Card className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-slate-700">
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">User</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Type</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Documents</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Submitted</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {userVerifications.map((verification) => (
                    <tr key={verification.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-4 px-4">
                        <div className="text-sm font-medium text-slate-900 dark:text-white">
                          {verification.userName}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          ID: {verification.userId}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          {verification.type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(verification.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {verification.documents.length} files
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {formatDate(verification.submittedAt)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {verification.status === 'pending' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVerificationUpdate(verification.id, 'approved', 'Documents verified')}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleVerificationUpdate(verification.id, 'rejected', 'Document quality insufficient')}
                              >
                                Reject
                              </Button>
                            </>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => console.log('View documents for', verification.id)}
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

        {/* Verification Modal */}
        {showVerificationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Verify User
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    User ID
                  </label>
                  <input
                    type="text"
                    value={verificationData.userId}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, userId: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Enter user ID..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Verification Type
                  </label>
                  <select
                    value={verificationData.type}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="identity">Identity Verification</option>
                    <option value="business">Business Verification</option>
                    <option value="address">Address Verification</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Status
                  </label>
                  <select
                    value={verificationData.status}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, status: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Notes
                  </label>
                  <textarea
                    value={verificationData.notes}
                    onChange={(e) => setVerificationData(prev => ({ ...prev, notes: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Enter verification notes..."
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowVerificationModal(false);
                    setVerificationData({ userId: '', type: 'identity', status: 'pending', notes: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => console.log('Process verification:', verificationData)}>
                  Process
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default AdminSecurity;
