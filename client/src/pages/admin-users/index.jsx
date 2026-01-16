import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AdminPage from '../../components/ui/AdminPage.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/AppIcon.jsx';
import Button from '../../components/ui/Button.jsx';
import { adminService } from '../../services/apiService.js';

const mockUsers = [
  {
    id: 1,
    name: 'Alemayehu Kebede',
    email: 'alemayehu@example.com',
    role: 'farmer',
    status: 'active',
    verified: true,
    joinDate: '2023-11-12',
    lastActive: '2024-01-22',
    listings: 12,
    orders: 0,
    avatar: 'https://images.pexels.com/photos/775999/pexels-photo-775999.jpeg'
  },
  {
    id: 2,
    name: 'Meron Tadesse',
    email: 'meron@example.com',
    role: 'buyer',
    status: 'active',
    verified: true,
    joinDate: '2023-08-04',
    lastActive: '2024-01-21',
    listings: 0,
    orders: 34,
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
  },
  {
    id: 3,
    name: 'Getachew Molla',
    email: 'getachew@example.com',
    role: 'farmer',
    status: 'pending',
    verified: false,
    joinDate: '2024-01-02',
    lastActive: '2024-01-18',
    listings: 5,
    orders: 0,
    avatar: 'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg'
  },
  {
    id: 4,
    name: 'Hanna Wolde',
    email: 'hanna@example.com',
    role: 'buyer',
    status: 'active',
    verified: false,
    joinDate: '2023-09-17',
    lastActive: '2024-01-19',
    listings: 0,
    orders: 12,
    avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg'
  },
  {
    id: 5,
    name: 'Dawit Haile',
    email: 'dawit@example.com',
    role: 'admin',
    status: 'active',
    verified: true,
    joinDate: '2022-06-01',
    lastActive: '2024-01-22',
    listings: 0,
    orders: 0,
    avatar: 'https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg'
  }
];

const AdminUsers = () => {
  const { user, isAuthenticated } = useAuth();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchQuery, roleFilter, statusFilter]);

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
      setUsers(mockUsers);
      setFilteredUsers(mockUsers);
    } finally {
      setIsLoading(false);
    }
  };

  const filterUsers = () => {
    let next = [...users];

    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      next = next.filter((u) =>
        u.name.toLowerCase().includes(term) || u.email.toLowerCase().includes(term)
      );
    }

    if (roleFilter !== 'all') {
      next = next.filter((u) => u.role === roleFilter);
    }

    if (statusFilter !== 'all') {
      next = next.filter((u) => u.status === statusFilter);
    }

    setFilteredUsers(next);
  };

  const handleUserStatusUpdate = async (userId, newStatus, reason = '') => {
    try {
      await adminService.updateUserStatus(userId, newStatus, reason);
      loadUsers();
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const normalized = status && typeof status === 'string' ? status : 'pending';
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: 'CheckCircle' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: 'Clock' },
      suspended: { color: 'bg-red-100 text-red-800', icon: 'XCircle' }
    };
    const config = statusConfig[normalized] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon name={config.icon} size={12} className="mr-1" />
        {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
      </span>
    );
  };

  const getRoleBadge = (role) => {
    const normalized = role && typeof role === 'string' ? role : 'farmer';
    const roleConfig = {
      farmer: { color: 'bg-blue-100 text-blue-800', icon: 'Tractor' },
      buyer: { color: 'bg-purple-100 text-purple-800', icon: 'ShoppingCart' },
      admin: { color: 'bg-gray-100 text-gray-800', icon: 'Shield' }
    };
    const config = roleConfig[normalized] || roleConfig.farmer;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon name={config.icon} size={12} className="mr-1" />
        {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
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
    <AdminPage
      title="User Management"
      subtitle="Manage users, roles, and permissions across the platform"
      actions={(
        <>
          <Button variant="outline" size="sm" iconName="Download">Export</Button>
          <Button variant="primary" size="sm" iconName="UserPlus">Add User</Button>
        </>
      )}
    >
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

      <Card className="p-4 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search by name or email"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
              />
            </div>
          </div>
          <div className="flex gap-3">
            <select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="farmer">Farmer</option>
              <option value="buyer">Buyer</option>
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>
      </Card>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
            <thead className="bg-slate-50 dark:bg-slate-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Activity</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">Actions</th>
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
                filteredUsers.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50 dark:hover:bg-slate-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img className="h-10 w-10 rounded-full object-cover" src={entry.avatar} alt={entry.name} />
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900 dark:text-white">
                            {entry.name}
                            {entry.verified && (
                              <Icon name="CheckCircle" size={16} className="inline ml-1 text-green-500" />
                            )}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">{entry.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{getRoleBadge(entry.role)}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(entry.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 dark:text-slate-400">
                      <div>Joined: {new Date(entry.joinDate).toLocaleDateString()}</div>
                      <div>Last active: {new Date(entry.lastActive).toLocaleDateString()}</div>
                      {entry.role === 'farmer' && <div>{entry.listings} listings</div>}
                      {entry.role === 'buyer' && <div>{entry.orders} orders</div>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="sm" iconName="Eye">View</Button>
                        <Button variant="ghost" size="sm" iconName="Edit">Edit</Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          iconName="MoreHorizontal"
                          onClick={() => handleUserStatusUpdate(entry.id, 'active')}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </AdminPage>
  );
};

export default AdminUsers;
