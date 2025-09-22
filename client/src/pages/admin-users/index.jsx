import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/AppIcon.jsx';
import Button from '../../components/ui/Button.jsx';
import { adminService } from '../../services/apiService.js';

const AdminUsers = () => {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  // Mock user data
  const mockUsers = [
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
      orders: 45,
      avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg'
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
      orders: 23,
      avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg'
    },
    {
      id: 3,
      name: 'Getachew Molla',
      email: 'getachew@example.com',
      role: 'farmer',
      status: 'pending',
      verified: false,
      joinDate: '2024-01-18',
      lastActive: '2024-01-19',
      listings: 3,
      orders: 8,
      avatar: 'https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg'
    }
  ];

  useEffect(() => {
    loadUsers();
  }, [pagination.page, roleFilter, statusFilter, searchQuery]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        role: roleFilter,
        status: statusFilter,
        search: searchQuery
      };
      
      const data = await adminService.getAllUsers(params);
      setUsers(data.users || []);
      setFilteredUsers(data.users || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Failed to load users:', error);
      // Fallback to mock data
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUserStatusUpdate = async (userId, newStatus, reason = '') => {
    try {
      await adminService.updateUserStatus(userId, newStatus, reason);
      // Reload users to get updated data
      loadUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const getStatusBadge = (status) => {
    // Handle undefined, null, or empty status
    if (!status || typeof status !== 'string') {
      status = 'pending'; // Default fallback
    }
    
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: 'CheckCircle' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: 'Clock' },
      suspended: { color: 'bg-red-100 text-red-800', icon: 'XCircle' }
    };
    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon name={config.icon} size={12} className="mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    // Handle undefined, null, or empty role
    if (!role || typeof role !== 'string') {
      role = 'farmer'; // Default fallback
    }
    
    const roleConfig = {
      farmer: { color: 'bg-blue-100 text-blue-800', icon: 'Tractor' },
      buyer: { color: 'bg-purple-100 text-purple-800', icon: 'ShoppingCart' },
      admin: { color: 'bg-gray-100 text-gray-800', icon: 'Shield' }
    };
    const config = roleConfig[role] || roleConfig.farmer;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon name={config.icon} size={12} className="mr-1" />
        {role.charAt(0).toUpperCase() + role.slice(1)}
      </span>
    );
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
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white">User Management</h1>
                <p className="mt-2 text-slate-600 dark:text-slate-400">
                  Manage users, roles, and permissions across the platform
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <Button variant="outline" size="sm" iconName="Download">Export</Button>
                <Button variant="primary" size="sm" iconName="UserPlus">Add User</Button>
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
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Users</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">{users.length}</p>
                </div>
                <Icon name="Users" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Users</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {users.filter(u => u.status === 'active').length}
                  </p>
                </div>
                <Icon name="CheckCircle" size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Farmers</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {users.filter(u => u.role === 'farmer').length}
                  </p>
                </div>
                <Icon name="Tractor" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Buyers</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white">
                    {users.filter(u => u.role === 'buyer').length}
                  </p>
                </div>
                <Icon name="ShoppingCart" size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </Card>
          </div>

          {/* Users Table */}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
                <thead className="bg-slate-50 dark:bg-slate-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Role
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Activity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-slate-900 divide-y divide-slate-200 dark:divide-slate-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <Icon name="Loader2" size={32} className="animate-spin mx-auto mb-4 text-blue-500" />
                        <p className="text-slate-600 dark:text-slate-400">Loading users...</p>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="px-6 py-12 text-center">
                        <Icon name="Users" size={48} className="mx-auto mb-4 text-slate-400" />
                        <p className="text-slate-600 dark:text-slate-400">No users found</p>
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={user.avatar}
                              alt={user.name}
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-slate-900 dark:text-white">
                                {user.name}
                                {user.verified && (
                                  <Icon name="CheckCircle" size={16} className="inline ml-1 text-green-500" />
                                )}
                              </div>
                              <div className="text-sm text-slate-500 dark:text-slate-400">{user.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getRoleBadge(user.role)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(user.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                          <div>Joined: {new Date(user.joinDate).toLocaleDateString()}</div>
                          <div>Last active: {new Date(user.lastActive).toLocaleDateString()}</div>
                          {user.role === 'farmer' && <div>{user.listings} listings</div>}
                          {user.role === 'buyer' && <div>{user.orders} orders</div>}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button variant="ghost" size="sm" iconName="Eye">View</Button>
                            <Button variant="ghost" size="sm" iconName="Edit">Edit</Button>
                            <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default AdminUsers;
