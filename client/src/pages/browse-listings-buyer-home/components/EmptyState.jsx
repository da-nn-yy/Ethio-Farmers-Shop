import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyState = ({ 
  type = 'no-results', 
  onClearFilters, 
  onRetry,
  currentLanguage = 'en' 
}) => {
  const translations = {
    en: {
      noResults: {
        title: 'No produce found',
        description: 'Try adjusting your filters or search terms to find what you\'re looking for.',
        action: 'Clear Filters'
      },
      noListings: {
        title: 'No listings available',
        description: 'There are currently no produce listings available. Check back later for fresh produce from local farmers.',
        action: 'Refresh'
      },
      error: {
        title: 'Something went wrong',
        description: 'We couldn\'t load the listings. Please check your connection and try again.',
        action: 'Try Again'
      }
    },
    am: {
      noResults: {
        title: 'ምንም ምርት አልተገኘም',
        description: 'የሚፈልጉትን ለማግኘት ማጣሪያዎችዎን ወይም የፍለጋ ቃላትዎን ማስተካከል ይሞክሩ።',
        action: 'ማጣሪያዎችን አጽዳ'
      },
      noListings: {
        title: 'ምንም ዝርዝር የለም',
        description: 'በአሁኑ ጊዜ ምንም የምርት ዝርዝሮች የሉም። ከአካባቢ ገበሬዎች ትኩስ ምርቶችን ለማግኘት በኋላ ይመለሱ።',
        action: 'አድስ'
      },
      error: {
        title: 'የሆነ ችግር ተፈጥሯል',
        description: 'ዝርዝሮቹን መጫን አልቻልንም። ግንኙነትዎን ይፈትሹ እና እንደገና ይሞክሩ።',
        action: 'እንደገና ሞክር'
      }
    }
  };

  const t = translations?.[currentLanguage];

  const getEmptyStateConfig = () => {
    switch (type) {
      case 'no-results':
        return {
          icon: 'Search',
          ...t?.noResults,
          action: onClearFilters
        };
      case 'no-listings':
        return {
          icon: 'Package',
          ...t?.noListings,
          action: onRetry
        };
      case 'error':
        return {
          icon: 'AlertCircle',
          ...t?.error,
          action: onRetry
        };
      default:
        return {
          icon: 'Search',
          ...t?.noResults,
          action: onClearFilters
        };
    }
  };

  const config = getEmptyStateConfig();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-6">
        <Icon 
          name={config?.icon} 
          size={32} 
          className="text-text-secondary" 
        />
      </div>
      <h3 className="font-heading font-semibold text-xl text-text-primary mb-3">
        {config?.title}
      </h3>
      <p className="text-text-secondary max-w-md mb-8 leading-relaxed">
        {config?.description}
      </p>
      {config?.action && (
        <Button
          variant="outline"
          onClick={config?.action}
          iconName={type === 'error' ? 'RefreshCw' : type === 'no-listings' ? 'RefreshCw' : 'X'}
          iconPosition="left"
        >
          {config?.action}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;