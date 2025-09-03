import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';

const CategoryFilter = ({ currentLanguage = 'en', onCategoryChange }) => {
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { 
      id: 'all', 
      name: currentLanguage === 'en' ? 'All' : 'ሁሉም', 
      icon: 'Grid3X3',
      count: 156
    },
    { 
      id: 'vegetables', 
      name: currentLanguage === 'en' ? 'Vegetables' : 'አትክልቶች', 
      icon: 'Carrot',
      count: 45
    },
    { 
      id: 'fruits', 
      name: currentLanguage === 'en' ? 'Fruits' : 'ፍራፍሬዎች', 
      icon: 'Apple',
      count: 38
    },
    { 
      id: 'grains', 
      name: currentLanguage === 'en' ? 'Grains' : 'እህሎች', 
      icon: 'Wheat',
      count: 29
    },
    { 
      id: 'spices', 
      name: currentLanguage === 'en' ? 'Spices' : 'ቅመማ ቅመሞች', 
      icon: 'Leaf',
      count: 22
    },
    { 
      id: 'dairy', 
      name: currentLanguage === 'en' ? 'Dairy' : 'የወተት ተዋጽኦዎች', 
      icon: 'Milk',
      count: 18
    },
    { 
      id: 'herbs', 
      name: currentLanguage === 'en' ? 'Herbs' : 'መድኃኒት እጽዋት', 
      icon: 'Sprout',
      count: 14
    }
  ];

  const handleCategorySelect = (category) => {
    setActiveCategory(category?.id);
    if (onCategoryChange) {
      onCategoryChange(category);
    }
  };

  return (
    <div className="bg-background px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          {currentLanguage === 'en' ? 'Categories' : 'ምድቦች'}
        </h3>
        <button className="font-body text-sm text-primary hover:text-primary/80 transition-colors duration-200">
          {currentLanguage === 'en' ? 'View All' : 'ሁሉንም ይመልከቱ'}
        </button>
      </div>
      <div className="flex space-x-3 overflow-x-auto scrollbar-hide pb-2">
        {categories?.map((category) => (
          <button
            key={category?.id}
            onClick={() => handleCategorySelect(category)}
            className={`flex-shrink-0 flex flex-col items-center p-3 rounded-xl border transition-all duration-200 min-w-[80px] ${
              activeCategory === category?.id
                ? 'bg-primary text-primary-foreground border-primary shadow-subtle'
                : 'bg-card text-card-foreground border-border hover:border-primary/30 hover:bg-muted'
            }`}
          >
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-2 ${
              activeCategory === category?.id
                ? 'bg-primary-foreground/20'
                : 'bg-muted'
            }`}>
              <Icon 
                name={category?.icon} 
                size={20} 
                color="currentColor"
                strokeWidth={activeCategory === category?.id ? 2.5 : 2}
              />
            </div>
            <span className="font-body text-xs font-medium text-center leading-tight">
              {category?.name}
            </span>
            <span className={`font-caption text-xs mt-1 ${
              activeCategory === category?.id
                ? 'text-primary-foreground/70'
                : 'text-muted-foreground'
            }`}>
              {category?.count}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoryFilter;