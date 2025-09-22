import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/AppIcon.jsx';
import Button from '../../components/ui/Button.jsx';

const AdminContent = () => {
  const { user, isAuthenticated } = useAuth();
  const [content, setContent] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    search: ''
  });
  const [selectedContent, setSelectedContent] = useState([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadData, setUploadData] = useState({
    file: null,
    title: '',
    description: '',
    category: 'general',
    tags: ''
  });

  // Mock content data
  const mockContent = [
    {
      id: 1,
      title: 'Farm Fresh Vegetables Banner',
      type: 'image',
      category: 'banner',
      status: 'active',
      size: '2.5 MB',
      dimensions: '1920x1080',
      uploadDate: '2024-01-15T10:30:00Z',
      uploadedBy: 'Admin User',
      url: '/uploads/banners/vegetables-banner.jpg',
      tags: ['banner', 'vegetables', 'promotion']
    },
    {
      id: 2,
      title: 'User Guide PDF',
      type: 'document',
      category: 'guide',
      status: 'active',
      size: '1.2 MB',
      dimensions: 'PDF',
      uploadDate: '2024-01-14T14:20:00Z',
      uploadedBy: 'Admin User',
      url: '/uploads/guides/user-guide.pdf',
      tags: ['guide', 'documentation', 'help']
    },
    {
      id: 3,
      title: 'Product Category Icons',
      type: 'image',
      category: 'icon',
      status: 'pending',
      size: '500 KB',
      dimensions: '64x64',
      uploadDate: '2024-01-13T09:45:00Z',
      uploadedBy: 'Admin User',
      url: '/uploads/icons/category-icons.png',
      tags: ['icon', 'category', 'ui']
    },
    {
      id: 4,
      title: 'Marketplace Rules Document',
      type: 'document',
      category: 'policy',
      status: 'active',
      size: '800 KB',
      dimensions: 'PDF',
      uploadDate: '2024-01-12T16:30:00Z',
      uploadedBy: 'Admin User',
      url: '/uploads/policies/marketplace-rules.pdf',
      tags: ['policy', 'rules', 'legal']
    },
    {
      id: 5,
      title: 'Seasonal Promotion Video',
      type: 'video',
      category: 'promotion',
      status: 'active',
      size: '15.2 MB',
      dimensions: '1280x720',
      uploadDate: '2024-01-11T11:15:00Z',
      uploadedBy: 'Admin User',
      url: '/uploads/videos/seasonal-promo.mp4',
      tags: ['video', 'promotion', 'seasonal']
    }
  ];

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return;
    }
    loadContent();
  }, [isAuthenticated, user, filters]);

  const loadContent = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Filter mock data based on current filters
      let filteredContent = [...mockContent];
      
      if (filters.type !== 'all') {
        filteredContent = filteredContent.filter(c => c.type === filters.type);
      }
      
      if (filters.status !== 'all') {
        filteredContent = filteredContent.filter(c => c.status === filters.status);
      }
      
      if (filters.search) {
        filteredContent = filteredContent.filter(c => 
          c.title.toLowerCase().includes(filters.search.toLowerCase()) ||
          c.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()))
        );
      }
      
      setContent(filteredContent);
    } catch (error) {
      console.error('Failed to load content:', error);
      setError('Failed to load content');
      setContent(mockContent);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFileUpload = async () => {
    if (!uploadData.file || !uploadData.title) {
      setError('Please provide file and title');
      return;
    }

    try {
      // Simulate file upload
      console.log('Uploading file:', uploadData);
      
      // Add to content list
      const newContent = {
        id: Date.now(),
        title: uploadData.title,
        type: uploadData.file.type.startsWith('image/') ? 'image' : 
              uploadData.file.type.startsWith('video/') ? 'video' : 'document',
        category: uploadData.category,
        status: 'pending',
        size: `${(uploadData.file.size / 1024 / 1024).toFixed(1)} MB`,
        dimensions: 'Unknown',
        uploadDate: new Date().toISOString(),
        uploadedBy: user?.full_name || 'Admin User',
        url: URL.createObjectURL(uploadData.file),
        tags: uploadData.tags.split(',').map(tag => tag.trim())
      };
      
      setContent(prev => [newContent, ...prev]);
      setShowUploadModal(false);
      setUploadData({ file: null, title: '', description: '', category: 'general', tags: '' });
    } catch (error) {
      console.error('Failed to upload file:', error);
      setError('Failed to upload file');
    }
  };

  const handleStatusUpdate = async (contentId, newStatus) => {
    try {
      setContent(prev => prev.map(c => 
        c.id === contentId 
          ? { ...c, status: newStatus }
          : c
      ));
    } catch (error) {
      console.error('Failed to update content status:', error);
      setError('Failed to update content status');
    }
  };

  const handleDelete = async (contentId) => {
    if (window.confirm('Are you sure you want to delete this content?')) {
      try {
        setContent(prev => prev.filter(c => c.id !== contentId));
      } catch (error) {
        console.error('Failed to delete content:', error);
        setError('Failed to delete content');
      }
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      active: { color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400', icon: 'CheckCircle' },
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

  const getTypeIcon = (type) => {
    const icons = {
      image: 'Image',
      video: 'Video',
      document: 'FileText',
      audio: 'Music'
    };
    return icons[type] || 'File';
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Content Management</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage media files, documents, and content
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" iconName="RefreshCw" onClick={loadContent} loading={loading}>
              Refresh
            </Button>
            <Button size="sm" iconName="Upload" onClick={() => setShowUploadModal(true)}>
              Upload Content
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Files</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{content.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Icon name="File" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Images</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {content.filter(c => c.type === 'image').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Icon name="Image" size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Documents</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {content.filter(c => c.type === 'document').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Icon name="FileText" size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Videos</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {content.filter(c => c.type === 'video').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-lg flex items-center justify-center">
                <Icon name="Video" size={24} className="text-red-600 dark:text-red-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Filters */}
        <Card className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Content Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              >
                <option value="all">All Types</option>
                <option value="image">Images</option>
                <option value="video">Videos</option>
                <option value="document">Documents</option>
                <option value="audio">Audio</option>
              </select>
            </div>

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
                <option value="active">Active</option>
                <option value="pending">Pending</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search content..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
              />
            </div>
          </div>
        </Card>

        {/* Content List */}
        <Card className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 dark:border-slate-700">
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      checked={selectedContent.length === content.length && content.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedContent(content.map(c => c.id));
                        } else {
                          setSelectedContent([]);
                        }
                      }}
                      className="rounded border-slate-300 dark:border-slate-600"
                    />
                  </th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Content</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Type</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Size</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Status</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Upload Date</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-900 dark:text-white">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <div className="flex items-center justify-center">
                        <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                        <span className="ml-2 text-slate-600 dark:text-slate-400">Loading content...</span>
                      </div>
                    </td>
                  </tr>
                ) : content.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="text-center py-8">
                      <Icon name="File" size={48} className="mx-auto mb-4 text-slate-400" />
                      <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                        No content found
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400">
                        No content matches your current filters.
                      </p>
                    </td>
                  </tr>
                ) : (
                  content.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                      <td className="py-4 px-4">
                        <input
                          type="checkbox"
                          checked={selectedContent.includes(item.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedContent(prev => [...prev, item.id]);
                            } else {
                              setSelectedContent(prev => prev.filter(id => id !== item.id));
                            }
                          }}
                          className="rounded border-slate-300 dark:border-slate-600"
                        />
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                            <Icon name={getTypeIcon(item.type)} size={20} className="text-slate-600 dark:text-slate-400" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 dark:text-white">
                              {item.title}
                            </div>
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                              {item.category} • {item.uploadedBy}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200">
                          {item.type}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {item.size}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {item.dimensions}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="text-sm text-slate-900 dark:text-white">
                          {formatDate(item.uploadDate)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-2">
                          {item.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(item.id, 'active')}
                            >
                              Approve
                            </Button>
                          )}
                          {item.status === 'active' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleStatusUpdate(item.id, 'pending')}
                            >
                              Deactivate
                            </Button>
                          )}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(item.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* Upload Modal */}
        {showUploadModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                Upload Content
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    File
                  </label>
                  <input
                    type="file"
                    onChange={(e) => setUploadData(prev => ({ ...prev, file: e.target.files[0] }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={uploadData.title}
                    onChange={(e) => setUploadData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Enter content title..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category
                  </label>
                  <select
                    value={uploadData.category}
                    onChange={(e) => setUploadData(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                  >
                    <option value="general">General</option>
                    <option value="banner">Banner</option>
                    <option value="icon">Icon</option>
                    <option value="guide">Guide</option>
                    <option value="policy">Policy</option>
                    <option value="promotion">Promotion</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Tags
                  </label>
                  <input
                    type="text"
                    value={uploadData.tags}
                    onChange={(e) => setUploadData(prev => ({ ...prev, tags: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Enter tags separated by commas..."
                  />
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadModal(false);
                    setUploadData({ file: null, title: '', description: '', category: 'general', tags: '' });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleFileUpload}>
                  Upload
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default AdminContent;
