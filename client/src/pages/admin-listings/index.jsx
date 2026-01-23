import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AdminPage from '../../components/ui/AdminPage.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/AppIcon.jsx';
import Button from '../../components/ui/Button.jsx';
import { adminService } from '../../services/apiService.js';
import { getListingImages } from '../../utils/imageUtils';

const mockListings = [
  {
    id: 1,
    title: 'Premium Teff',
    farmer: 'Alemayehu Kebede',
    category: 'grains',
    price: 85,
    quantity: 150,
    status: 'active',
    verified: true,
    createdAt: '2024-01-15',
    image: 'https://images.pexels.com/photos/4110256/pexels-photo-4110256.jpeg',
    views: 234,
    orders: 12
  },
  {
    id: 2,
    title: 'Organic Coffee Beans',
    farmer: 'Meron Tadesse',
    category: 'coffee',
    price: 320,
    quantity: 75,
    status: 'pending',
    verified: false,
    createdAt: '2024-01-18',
    image: 'https://images.pexels.com/photos/894695/pexels-photo-894695.jpeg',
    views: 156,
    orders: 8
  },
  {
    id: 3,
    title: 'Fresh Wheat',
    farmer: 'Getachew Molla',
    category: 'grains',
    price: 45,
    quantity: 200,
    status: 'active',
    verified: true,
    createdAt: '2024-01-10',
    image: 'https://images.pexels.com/photos/1595104/pexels-photo-1595104.jpeg',
    views: 189,
    orders: 15
  },
  {
    id: 4,
    title: 'Yellow Maize',
    farmer: 'Hanna Wolde',
    category: 'grains',
    price: 35,
    quantity: 300,
    status: 'suspended',
    verified: false,
    createdAt: '2024-01-12',
    image: 'https://images.pexels.com/photos/265216/pexels-photo-265216.jpeg',
    views: 88,
    orders: 2
  }
];

const AdminListings = () => {
  const { user, isAuthenticated } = useAuth();
  const [listings, setListings] = useState([]);
  const [filteredListings, setFilteredListings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    loadListings();
  }, []);

  useEffect(() => {
    filterListings();
  }, [listings, searchQuery, statusFilter, categoryFilter]);

  const loadListings = async () => {
    setIsLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        status: statusFilter,
        category: categoryFilter,
        search: searchQuery
      };

      const data = await adminService.getAllListings(params);
      setListings(data.listings || []);
      setFilteredListings(data.listings || []);
      setPagination(data.pagination || pagination);
    } catch (error) {
      console.error('Failed to load listings:', error);
      setListings(mockListings);
      setFilteredListings(mockListings);
    } finally {
      setIsLoading(false);
    }
  };

  const filterListings = () => {
    let next = [...listings];

    if (searchQuery) {
      const term = searchQuery.toLowerCase();
      next = next.filter((listing) =>
        listing.title.toLowerCase().includes(term) ||
        listing.farmer.toLowerCase().includes(term)
      );
    }

    if (statusFilter !== 'all') {
      next = next.filter((listing) => listing.status === statusFilter);
    }

    if (categoryFilter !== 'all') {
      next = next.filter((listing) => listing.category === categoryFilter);
    }

    setFilteredListings(next);
  };

  const handleListingAction = (listingId, action) => {
    setListings((prev) => prev.map((listing) => {
      if (listing.id !== listingId) return listing;

      switch (action) {
        case 'approve':
          return { ...listing, status: 'active', verified: true };
        case 'suspend':
          return { ...listing, status: 'suspended' };
        case 'reject':
          return { ...listing, status: 'rejected' };
        case 'delete':
          return { ...listing, status: 'deleted' };
        default:
          return listing;
      }
    }));
  };

  const getStatusBadge = (status) => {
    const normalized = status && typeof status === 'string' ? status : 'pending';
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800', icon: 'CheckCircle' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: 'Clock' },
      suspended: { color: 'bg-red-100 text-red-800', icon: 'XCircle' },
      rejected: { color: 'bg-gray-100 text-gray-800', icon: 'X' },
      deleted: { color: 'bg-gray-100 text-gray-800', icon: 'Trash2' }
    };
    const config = statusConfig[normalized] || statusConfig.pending;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon name={config.icon} size={12} className="mr-1" />
        {normalized.charAt(0).toUpperCase() + normalized.slice(1)}
      </span>
    );
  };

  const getCategoryBadge = (category) => {
    const normalized = category && typeof category === 'string' ? category : 'grains';
    const categoryConfig = {
      grains: { color: 'bg-amber-100 text-amber-800', icon: 'Wheat' },
      coffee: { color: 'bg-amber-100 text-amber-800', icon: 'Coffee' },
      vegetables: { color: 'bg-green-100 text-green-800', icon: 'Carrot' },
      fruits: { color: 'bg-orange-100 text-orange-800', icon: 'Apple' },
      spices: { color: 'bg-red-100 text-red-800', icon: 'Pepper' }
    };
    const config = categoryConfig[normalized] || categoryConfig.grains;

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
      title="Listings"
      subtitle="Manage product listings across the marketplace"
      actions={(
        <>
          <Button variant="outline" size="sm" iconName="Download">Export</Button>
          <Button variant="primary" size="sm" iconName="Plus">Add Listing</Button>
        </>
      )}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Listings</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{listings.length}</p>
            </div>
            <Icon name="Package" size={24} className="text-blue-600 dark:text-blue-400" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Listings</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {listings.filter((l) => l.status === 'active').length}
              </p>
            </div>
            <Icon name="CheckCircle" size={24} className="text-green-600 dark:text-green-400" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Pending Review</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {listings.filter((l) => l.status === 'pending').length}
              </p>
            </div>
            <Icon name="Clock" size={24} className="text-yellow-600 dark:text-yellow-400" />
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Suspended</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {listings.filter((l) => l.status === 'suspended').length}
              </p>
            </div>
            <Icon name="XCircle" size={24} className="text-red-600 dark:text-red-400" />
          </div>
        </Card>
      </div>

      <Card className="p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search listings by title or farmer..."
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
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="suspended">Suspended</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-slate-700 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="grains">Grains</option>
              <option value="coffee">Coffee</option>
              <option value="vegetables">Vegetables</option>
              <option value="fruits">Fruits</option>
              <option value="spices">Spices</option>
            </select>
          </div>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-48 bg-slate-200 dark:bg-slate-700 rounded-lg mb-4"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded mb-2"></div>
              <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-2/3"></div>
            </Card>
          ))
        ) : filteredListings.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <Icon name="Package" size={48} className="mx-auto mb-4 text-slate-400" />
            <p className="text-slate-600 dark:text-slate-400">No listings found</p>
          </div>
        ) : (
          filteredListings.map((listing) => {
            const listingImages = getListingImages(listing);
            const primaryImage = listingImages[0] || '/assets/images/no_image.png';

            return (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative">
                <img src={primaryImage} alt={listing.title} className="w-full h-48 object-cover" onError={(e) => { e.target.src = '/assets/images/no_image.png'; }} />
                <div className="absolute top-4 right-4">{getStatusBadge(listing.status)}</div>
                {listing.verified && (
                  <div className="absolute top-4 left-4">
                    <Icon name="CheckCircle" size={20} className="text-green-500 bg-white rounded-full" />
                  </div>
                )}
                {listingImages.length > 1 && (
                  <div className="absolute bottom-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs">
                    {listingImages.length} images
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-1">{listing.title}</h3>
                  <span className="text-xl font-bold text-green-600 dark:text-green-400">ETB {listing.price}</span>
                </div>

                <div className="flex items-center text-sm text-slate-600 dark:text-slate-400 mb-3">
                  <Icon name="User" size={16} className="mr-1" />
                  {listing.farmer}
                </div>

                <div className="flex items-center justify-between mb-4">
                  {getCategoryBadge(listing.category)}
                  <span className="text-sm text-slate-600 dark:text-slate-400">{listing.quantity} kg available</span>
                </div>

                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <div className="flex items-center">
                    <Icon name="Eye" size={16} className="mr-1" />
                    {listing.views} views
                  </div>
                  <div className="flex items-center">
                    <Icon name="ShoppingCart" size={16} className="mr-1" />
                    {listing.orders} orders
                  </div>
                </div>

                <div className="flex space-x-2">
                  {listing.status === 'pending' && (
                    <>
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handleListingAction(listing.id, 'approve')}
                        iconName="CheckCircle"
                        className="flex-1"
                      >
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleListingAction(listing.id, 'reject')}
                        iconName="X"
                        className="flex-1"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {listing.status === 'active' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleListingAction(listing.id, 'suspend')}
                      iconName="Pause"
                      className="flex-1"
                    >
                      Suspend
                    </Button>
                  )}
                  {listing.status === 'suspended' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleListingAction(listing.id, 'approve')}
                      iconName="Play"
                      className="flex-1"
                    >
                      Activate
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" iconName="MoreHorizontal" />
                </div>
              </div>
              </Card>
            );
          })
        )}
      </div>
    </AdminPage>
  );
};

export default AdminListings;
