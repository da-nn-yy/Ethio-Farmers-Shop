import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Button from '../../components/ui/Button';
import Icon from '../../components/AppIcon';
import InstagramStyleGallery from '../../components/ui/InstagramStyleGallery.jsx';
import { farmerService } from '../../services/apiService';

const FarmerMyListings = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('active');
  const [listings, setListings] = useState({
    active: [],
    inactive: [],
    draft: []
  });
  const [isLoading, setIsLoading] = useState({
    active: false,
    inactive: false,
    draft: false
  });
  const [error, setError] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedListings, setSelectedListings] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [showBulkActions, setShowBulkActions] = useState(false);

  const tabs = [
    { id: 'active', label: 'Active Listings', count: listings.active.length },
    { id: 'inactive', label: 'Inactive Listings', count: listings.inactive.length },
    { id: 'draft', label: 'Draft Listings', count: listings.draft.length }
  ];

  useEffect(() => {
    loadListings();
  }, []);

  const loadListings = async () => {
    try {
      setError(null);

      // Load all listings for each status
      const [activeRes, inactiveRes, draftRes] = await Promise.all([
        farmerService.getFarmerListingsByStatus('active'),
        farmerService.getFarmerListingsByStatus('inactive'),
        farmerService.getFarmerListingsByStatus('draft')
      ]);

      setListings({
        active: activeRes.listings || [],
        inactive: inactiveRes.listings || [],
        draft: draftRes.listings || []
      });
    } catch (e) {
      setError('Failed to load your listings');
    }
  };

  const loadTabListings = async (status) => {
    try {
      setIsLoading(prev => ({ ...prev, [status]: true }));
      const res = await farmerService.getFarmerListingsByStatus(status);
      setListings(prev => ({ ...prev, [status]: res.listings || [] }));
    } catch (e) {
      setError(`Failed to load ${status} listings`);
    } finally {
      setIsLoading(prev => ({ ...prev, [status]: false }));
    }
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSelectedListings([]);
    setShowBulkActions(false);

    // Load listings for the tab if not already loaded
    if (listings[tabId].length === 0 && !isLoading[tabId]) {
      loadTabListings(tabId);
    }
  };

  const toggleStatus = async (listing, newStatus) => {
    try {
      setUpdatingId(listing.id);
      await farmerService.updateListingStatus(listing.id, newStatus);

      // Update the listings state
      setListings(prev => {
        const updated = { ...prev };
        const currentTab = Object.keys(updated).find(key =>
          updated[key].some(l => l.id === listing.id)
        );

        if (currentTab) {
          updated[currentTab] = updated[currentTab].filter(l => l.id !== listing.id);
        }

        if (newStatus === 'active') {
          updated.active = [{ ...listing, status: newStatus }, ...updated.active];
        } else if (newStatus === 'inactive') {
          updated.inactive = [{ ...listing, status: newStatus }, ...updated.inactive];
        }

        return updated;
      });
    } catch (e) {
      setError('Failed to update status');
    } finally {
      setUpdatingId(null);
    }
  };

  const deleteListing = async (listingId) => {
    if (!window.confirm('Are you sure you want to delete this listing?')) {
      return;
    }

    try {
      setUpdatingId(listingId);
      await farmerService.deleteListing(listingId);

      // Remove from all tabs
      setListings(prev => ({
        active: prev.active.filter(l => l.id !== listingId),
        inactive: prev.inactive.filter(l => l.id !== listingId),
        draft: prev.draft.filter(l => l.id !== listingId)
      }));
    } catch (e) {
      setError('Failed to delete listing');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleSelectListing = (listingId) => {
    setSelectedListings(prev =>
      prev.includes(listingId)
        ? prev.filter(id => id !== listingId)
        : [...prev, listingId]
    );
  };

  const handleSelectAll = () => {
    const currentListings = listings[activeTab];
    if (selectedListings.length === currentListings.length) {
      setSelectedListings([]);
    } else {
      setSelectedListings(currentListings.map(l => l.id));
    }
  };

  const handleBulkAction = async (action) => {
    if (selectedListings.length === 0) return;

    try {
      setUpdatingId('bulk');

      switch (action) {
        case 'activate':
          await farmerService.bulkUpdateListingStatus(selectedListings, 'active');
          break;
        case 'deactivate':
          await farmerService.bulkUpdateListingStatus(selectedListings, 'inactive');
          break;
        case 'delete':
          if (!window.confirm(`Are you sure you want to delete ${selectedListings.length} listings?`)) {
            return;
          }
          await farmerService.bulkDeleteListings(selectedListings);
          break;
      }

      // Reload the current tab
      await loadTabListings(activeTab);
      setSelectedListings([]);
      setShowBulkActions(false);
    } catch (e) {
      setError(`Failed to ${action} listings`);
    } finally {
      setUpdatingId(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-green-600 bg-green-100';
      case 'inactive': return 'text-yellow-600 bg-yellow-100';
      case 'draft': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'active': return 'CheckCircle';
      case 'inactive': return 'PauseCircle';
      case 'draft': return 'Edit3';
      default: return 'Circle';
    }
  };

  const filteredListings = listings[activeTab].filter(listing =>
    listing.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    listing.location?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentListings = filteredListings;
  const allSelected = currentListings.length > 0 && selectedListings.length === currentListings.length;
  const someSelected = selectedListings.length > 0 && selectedListings.length < currentListings.length;

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl px-4 py-6 mx-auto sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-text-primary">My Listings</h1>
            <p className="text-text-secondary">Manage your product listings</p>
          </div>
          <Button
            variant="primary"
            iconName="Plus"
            iconPosition="left"
            onClick={() => navigate('/add-listing')}
          >
            Add New Listing
          </Button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-4 mb-6 border border-red-200 rounded-lg bg-red-50">
            <div className="flex items-center space-x-2">
              <Icon name="AlertCircle" size={20} className="text-red-500" />
              <span className="text-red-700">{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto text-red-500 hover:text-red-700"
              >
                <Icon name="X" size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-border mb-6">
          <nav className="-mb-px flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => handleTabChange(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-secondary hover:text-text-primary hover:border-gray-300'
                }`}
              >
                {tab.label}
                <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {tab.count}
                </span>
              </button>
            ))}
          </nav>
        </div>

        {/* Search and Bulk Actions */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex-1 max-w-md">
            <div className="relative">
              <Icon name="Search" size={20} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search listings..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>

          {selectedListings.length > 0 && (
            <div className="flex items-center space-x-3">
              <span className="text-sm text-text-secondary">
                {selectedListings.length} selected
              </span>
              <div className="flex space-x-2">
                {activeTab === 'inactive' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('activate')}
                    loading={updatingId === 'bulk'}
                    iconName="CheckCircle"
                  >
                    Activate
                  </Button>
                )}
                {activeTab === 'active' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('deactivate')}
                    loading={updatingId === 'bulk'}
                    iconName="PauseCircle"
                  >
                    Deactivate
                  </Button>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('delete')}
                  loading={updatingId === 'bulk'}
                  iconName="Trash2"
                  className="text-red-600 hover:text-red-700"
                >
                  Delete
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Listings Grid */}
        {isLoading[activeTab] ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : currentListings.length === 0 ? (
          <div className="py-16 text-center">
            <Icon name="Package" size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="mb-4 text-gray-500">
              {searchQuery ? 'No listings match your search.' : `You have no ${activeTab} listings.`}
            </p>
            {!searchQuery && (
              <Button
                variant="primary"
                iconName="Plus"
                iconPosition="left"
                onClick={() => navigate('/add-listing')}
              >
                Create Your First Listing
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Select All Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={allSelected}
                ref={input => {
                  if (input) input.indeterminate = someSelected;
                }}
                onChange={handleSelectAll}
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label className="text-sm text-text-secondary">
                Select all ({currentListings.length} listings)
              </label>
            </div>

            {/* Listings Grid */}
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
              {currentListings.map((listing) => (
                <div key={listing.id} className="overflow-hidden border rounded-lg bg-card border-border">
                  {/* Selection Checkbox */}
                  <div className="absolute top-2 left-2 z-10">
                    <input
                      type="checkbox"
                      checked={selectedListings.includes(listing.id)}
                      onChange={() => handleSelectListing(listing.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                  </div>

                  {/* Image */}
                  <div className="relative">
                    <InstagramStyleGallery
                      images={listing?.images || (listing?.image ? [listing.image] : [])}
                      alt={listing.name || 'Product Image'}
                      className="w-full h-40"
                      showFullscreen={true}
                      showThumbnails={false}
                      autoPlay={false}
                      currentLanguage={currentLanguage}
                    />
                    {/* Status Badge */}
                    <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(listing.status)}`}>
                      <Icon name={getStatusIcon(listing.status)} size={12} className="inline mr-1" />
                      {listing.status}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold text-text-primary mb-1">{listing.name}</h3>
                    <p className="text-sm text-text-secondary mb-2">
                      {listing.category} • {listing.location}
                    </p>
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-medium text-primary">
                        ETB {listing.pricePerKg || listing.price_per_unit}
                      </span>
                      <span className="text-sm text-text-secondary">
                        {listing.availableQuantity || listing.quantity} {listing.unit || 'kg'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/add-listing?edit=${listing.id}`)}
                          iconName="Edit2"
                          title="Edit listing"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/add-listing?duplicate=${listing.id}`)}
                          iconName="Copy"
                          title="Duplicate listing"
                        />
                        {listing.status === 'active' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatus(listing, 'inactive')}
                            loading={updatingId === listing.id}
                            iconName="PauseCircle"
                          >
                            Pause
                          </Button>
                        )}
                        {listing.status === 'inactive' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatus(listing, 'active')}
                            loading={updatingId === listing.id}
                            iconName="PlayCircle"
                          >
                            Activate
                          </Button>
                        )}
                        {listing.status === 'draft' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => toggleStatus(listing, 'active')}
                            loading={updatingId === listing.id}
                            iconName="CheckCircle"
                          >
                            Publish
                          </Button>
                        )}
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => deleteListing(listing.id)}
                        loading={updatingId === listing.id}
                        iconName="Trash2"
                        className="text-red-600 hover:text-red-700"
                        title="Delete listing"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default FarmerMyListings;
