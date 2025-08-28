
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CategoryFilter = ({ currentLanguage = 'en', onCategoryChange }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { 
      id: 'all', 
      name: currentLanguage === 'en' ? 'All' : 'ሁሉም', 
      icon: 'Grid' 
    },
    { 
      id: 'vegetables', 
      name: currentLanguage === 'en' ? 'Vegetables' : 'አትክልቶች', 
      icon: 'Leaf' 
    },
    { 
      id: 'fruits', 
      name: currentLanguage === 'en' ? 'Fruits' : 'ፍራፍሬዎች', 
      icon: 'Apple' 
    },
    { 
      id: 'grains', 
      name: currentLanguage === 'en' ? 'Grains' : 'እህሎች', 
      icon: 'Wheat' 
    },
    { 
      id: 'livestock', 
      name: currentLanguage === 'en' ? 'Livestock' : 'የከብት እርባታ', 
      icon: 'Cow' 
    }
  ];

  const handleCategoryClick = (categoryId) => {
    setActiveCategory(categoryId);
    onCategoryChange?.(categoryId);
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {currentLanguage === 'en' ? 'Categories' : 'ምድቦች'}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => handleCategoryClick(category.id)}
            className={`p-3 rounded-lg border transition-colors ${
              activeCategory === category.id
                ? 'bg-primary text-white border-primary'
                : 'bg-card border-border hover:bg-muted'
            }`}
          >
            <Icon name={category.icon} className="w-5 h-5 mx-auto mb-2" />
            <span className="text-xs font-medium">{category.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;
