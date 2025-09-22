import React, { useState, useEffect } from 'react';
import { useAuth } from '../../hooks/useAuth.jsx';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Icon from '../../components/AppIcon.jsx';
import Button from '../../components/ui/Button.jsx';

const AdminMarketplace = () => {
  const { user, isAuthenticated } = useAuth();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [categoryData, setCategoryData] = useState({
    name: '',
    nameAm: '',
    description: '',
    descriptionAm: '',
    icon: 'Package',
    color: '#3B82F6',
    parentId: null,
    isActive: true,
    sortOrder: 0
  });

  // Mock categories data
  const mockCategories = [
    {
      id: 1,
      name: 'Vegetables',
      nameAm: 'አትክልት',
      description: 'Fresh vegetables and greens',
      descriptionAm: 'ትኩስ አትክልት እና አረንጓዴ',
      icon: 'Carrot',
      color: '#10B981',
      parentId: null,
      isActive: true,
      sortOrder: 1,
      productCount: 45,
      subcategories: [
        { id: 11, name: 'Leafy Greens', nameAm: 'አረንጓዴ ቅጠሎች', productCount: 12 },
        { id: 12, name: 'Root Vegetables', nameAm: 'ሥር አትክልት', productCount: 18 },
        { id: 13, name: 'Tomatoes', nameAm: 'ቲማቲም', productCount: 15 }
      ]
    },
    {
      id: 2,
      name: 'Fruits',
      nameAm: 'ፍራፍሬ',
      description: 'Fresh and seasonal fruits',
      descriptionAm: 'ትኩስ እና ወተት ፍራፍሬ',
      icon: 'Apple',
      color: '#F59E0B',
      parentId: null,
      isActive: true,
      sortOrder: 2,
      productCount: 32,
      subcategories: [
        { id: 21, name: 'Citrus Fruits', nameAm: 'ሲትረስ ፍራፍሬ', productCount: 8 },
        { id: 22, name: 'Tropical Fruits', nameAm: 'ትሮፒካል ፍራፍሬ', productCount: 12 },
        { id: 23, name: 'Berries', nameAm: 'ቤሪ', productCount: 12 }
      ]
    },
    {
      id: 3,
      name: 'Grains',
      nameAm: 'እህል',
      description: 'Cereals and grains',
      descriptionAm: 'እህል እና እህል',
      icon: 'Wheat',
      color: '#8B5CF6',
      parentId: null,
      isActive: true,
      sortOrder: 3,
      productCount: 28,
      subcategories: [
        { id: 31, name: 'Rice', nameAm: 'ሩዝ', productCount: 8 },
        { id: 32, name: 'Wheat', nameAm: 'ስንዴ', productCount: 10 },
        { id: 33, name: 'Barley', nameAm: 'ስንዴ', productCount: 10 }
      ]
    },
    {
      id: 4,
      name: 'Livestock',
      nameAm: 'እንስሳት',
      description: 'Farm animals and products',
      descriptionAm: 'የግብርና እንስሳት እና ምርቶች',
      icon: 'Cow',
      color: '#EF4444',
      parentId: null,
      isActive: true,
      sortOrder: 4,
      productCount: 15,
      subcategories: [
        { id: 41, name: 'Cattle', nameAm: 'ከብት', productCount: 5 },
        { id: 42, name: 'Poultry', nameAm: 'የአይጥ', productCount: 6 },
        { id: 43, name: 'Sheep & Goats', nameAm: 'በግ እና ፍየል', productCount: 4 }
      ]
    }
  ];

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'admin') {
      return;
    }
    loadCategories();
  }, [isAuthenticated, user]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      setError('');
      setCategories(mockCategories);
    } catch (error) {
      console.error('Failed to load categories:', error);
      setError('Failed to load categories');
      setCategories(mockCategories);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveCategory = async () => {
    if (!categoryData.name.trim()) {
      setError('Please provide category name');
      return;
    }

    try {
      if (editingCategory) {
        // Update existing category
        setCategories(prev => prev.map(cat => 
          cat.id === editingCategory.id 
            ? { ...cat, ...categoryData }
            : cat
        ));
      } else {
        // Add new category
        const newCategory = {
          id: Date.now(),
          ...categoryData,
          productCount: 0,
          subcategories: []
        };
        setCategories(prev => [newCategory, ...prev]);
      }
      
      setShowCategoryModal(false);
      setEditingCategory(null);
      setCategoryData({
        name: '',
        nameAm: '',
        description: '',
        descriptionAm: '',
        icon: 'Package',
        color: '#3B82F6',
        parentId: null,
        isActive: true,
        sortOrder: 0
      });
    } catch (error) {
      console.error('Failed to save category:', error);
      setError('Failed to save category');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setCategoryData({
      name: category.name,
      nameAm: category.nameAm,
      description: category.description,
      descriptionAm: category.descriptionAm,
      icon: category.icon,
      color: category.color,
      parentId: category.parentId,
      isActive: category.isActive,
      sortOrder: category.sortOrder
    });
    setShowCategoryModal(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Are you sure you want to delete this category? This will also delete all subcategories.')) {
      try {
        setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      } catch (error) {
        console.error('Failed to delete category:', error);
        setError('Failed to delete category');
      }
    }
  };

  const handleToggleStatus = async (categoryId) => {
    try {
      setCategories(prev => prev.map(cat => 
        cat.id === categoryId 
          ? { ...cat, isActive: !cat.isActive }
          : cat
      ));
    } catch (error) {
      console.error('Failed to toggle category status:', error);
      setError('Failed to toggle category status');
    }
  };

  const getStatusBadge = (isActive) => {
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
        isActive 
          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
      }`}>
        <Icon name={isActive ? 'CheckCircle' : 'XCircle'} size={12} className="mr-1" />
        {isActive ? 'Active' : 'Inactive'}
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
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Marketplace Management</h1>
            <p className="text-slate-600 dark:text-slate-400">
              Manage categories, subcategories, and marketplace settings
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <Button variant="outline" size="sm" iconName="RefreshCw" onClick={loadCategories} loading={loading}>
              Refresh
            </Button>
            <Button size="sm" iconName="Plus" onClick={() => setShowCategoryModal(true)}>
              Add Category
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Categories</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">{categories.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                <Icon name="Package" size={24} className="text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Active Categories</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {categories.filter(c => c.isActive).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-lg flex items-center justify-center">
                <Icon name="CheckCircle" size={24} className="text-green-600 dark:text-green-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Total Products</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {categories.reduce((sum, cat) => sum + cat.productCount, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-lg flex items-center justify-center">
                <Icon name="ShoppingBag" size={24} className="text-purple-600 dark:text-purple-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Subcategories</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {categories.reduce((sum, cat) => sum + cat.subcategories.length, 0)}
                </p>
              </div>
              <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                <Icon name="Layers" size={24} className="text-orange-600 dark:text-orange-400" />
              </div>
            </div>
          </Card>
        </div>

        {/* Categories List */}
        <Card className="p-6">
          <div className="space-y-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="flex items-center justify-center">
                  <div className="w-6 h-6 border-2 border-slate-300 border-t-blue-600 rounded-full animate-spin"></div>
                  <span className="ml-2 text-slate-600 dark:text-slate-400">Loading categories...</span>
                </div>
              </div>
            ) : categories.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="Package" size={48} className="mx-auto mb-4 text-slate-400" />
                <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">
                  No categories found
                </h3>
                <p className="text-slate-600 dark:text-slate-400">
                  Start by creating your first category.
                </p>
              </div>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="border border-slate-200 dark:border-slate-700 rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div 
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        <Icon name={category.icon} size={24} style={{ color: category.color }} />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                          {category.name}
                        </h3>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      {getStatusBadge(category.isActive)}
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditCategory(category)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleToggleStatus(category.id)}
                        >
                          {category.isActive ? 'Deactivate' : 'Activate'}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDeleteCategory(category.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                  
                  {/* Subcategories */}
                  {category.subcategories.length > 0 && (
                    <div className="mt-4">
                      <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">
                        Subcategories ({category.subcategories.length})
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {category.subcategories.map((subcategory) => (
                          <div key={subcategory.id} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-3">
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-slate-900 dark:text-white">
                                  {subcategory.name}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  {subcategory.productCount} products
                                </div>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm">
                                  Edit
                                </Button>
                                <Button variant="outline" size="sm">
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Category Modal */}
        {showCategoryModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white dark:bg-slate-800 rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
                {editingCategory ? 'Edit Category' : 'Add New Category'}
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category Name (English)
                  </label>
                  <input
                    type="text"
                    value={categoryData.name}
                    onChange={(e) => setCategoryData(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Enter category name..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Category Name (Amharic)
                  </label>
                  <input
                    type="text"
                    value={categoryData.nameAm}
                    onChange={(e) => setCategoryData(prev => ({ ...prev, nameAm: e.target.value }))}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Enter category name in Amharic..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Description
                  </label>
                  <textarea
                    value={categoryData.description}
                    onChange={(e) => setCategoryData(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    placeholder="Enter category description..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Icon
                    </label>
                    <select
                      value={categoryData.icon}
                      onChange={(e) => setCategoryData(prev => ({ ...prev, icon: e.target.value }))}
                      className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    >
                      <option value="Package">Package</option>
                      <option value="Carrot">Carrot</option>
                      <option value="Apple">Apple</option>
                      <option value="Wheat">Wheat</option>
                      <option value="Cow">Cow</option>
                      <option value="Leaf">Leaf</option>
                      <option value="TreePine">Tree</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                      Color
                    </label>
                    <input
                      type="color"
                      value={categoryData.color}
                      onChange={(e) => setCategoryData(prev => ({ ...prev, color: e.target.value }))}
                      className="w-full h-10 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-800"
                    />
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={categoryData.isActive}
                      onChange={(e) => setCategoryData(prev => ({ ...prev, isActive: e.target.checked }))}
                      className="rounded border-slate-300 dark:border-slate-600"
                    />
                    <span className="ml-2 text-sm text-slate-700 dark:text-slate-300">Active</span>
                  </label>
                </div>
              </div>
              <div className="flex items-center justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowCategoryModal(false);
                    setEditingCategory(null);
                    setCategoryData({
                      name: '',
                      nameAm: '',
                      description: '',
                      descriptionAm: '',
                      icon: 'Package',
                      color: '#3B82F6',
                      parentId: null,
                      isActive: true,
                      sortOrder: 0
                    });
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={handleSaveCategory}>
                  {editingCategory ? 'Update' : 'Create'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthenticatedLayout>
  );
};

export default AdminMarketplace;
