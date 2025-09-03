import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionsGrid = ({ currentLanguage = 'en' }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'browse-all',
      title: currentLanguage === 'en' ? 'Browse All' : 'ሁሉንም አስሱ',
      description: currentLanguage === 'en' ? 'Explore all available produce' : 'ሁሉንም የሚገኙ ምርቶች ይመልከቱ',
      icon: 'Search',
      color: 'bg-primary text-primary-foreground',
      action: () => navigate('/browse-listings')
    },
    {
      id: 'fresh-today',
      title: currentLanguage === 'en' ? 'Fresh Today' : 'ዛሬ ትኩስ',
      description: currentLanguage === 'en' ? 'Today\'s fresh arrivals' : 'የዛሬ ትኩስ ምርቶች',
      icon: 'Sparkles',
      color: 'bg-success text-success-foreground',
      action: () => navigate('/browse-listings', { state: { filter: 'fresh-today' } })
    },
    {
      id: 'nearby-farmers',
      title: currentLanguage === 'en' ? 'Nearby Farmers' : 'በአቅራቢያ ያሉ አርሶ አደሮች',
      description: currentLanguage === 'en' ? 'Find farmers near you' : 'በአቅራቢያዎ ያሉ አርሶ አደሮችን ያግኙ',
      icon: 'MapPin',
      color: 'bg-accent text-accent-foreground',
      action: () => navigate('/browse-listings', { state: { filter: 'nearby' } })
    },
    {
      id: 'bulk-orders',
      title: currentLanguage === 'en' ? 'Bulk Orders' : 'በጅምላ ትዕዛዞች',
      description: currentLanguage === 'en' ? 'Order in large quantities' : 'በብዛት ይዘዙ',
      icon: 'Package',
      color: 'bg-secondary text-secondary-foreground',
      action: () => navigate('/browse-listings', { state: { filter: 'bulk' } })
    },
    {
      id: 'organic-only',
      title: currentLanguage === 'en' ? 'Organic Only' : 'ኦርጋኒክ ብቻ',
      description: currentLanguage === 'en' ? 'Certified organic produce' : 'የተረጋገጠ ኦርጋኒክ ምርት',
      icon: 'Leaf',
      color: 'bg-success text-success-foreground',
      action: () => navigate('/browse-listings', { state: { filter: 'organic' } })
    },
    {
      id: 'price-alerts',
      title: currentLanguage === 'en' ? 'Price Alerts' : 'የዋጋ ማንቂያዎች',
      description: currentLanguage === 'en' ? 'Set price drop notifications' : 'የዋጋ ቅናሽ ማሳወቂያዎችን ያዘጋጁ',
      icon: 'Bell',
      color: 'bg-warning text-warning-foreground',
      action: () => navigate('/user-profile', { state: { activeTab: 'notifications' } })
    }
  ];

  return (
    <div className="bg-background px-4 py-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          {currentLanguage === 'en' ? 'Quick Actions' : 'ፈጣን እርምጃዎች'}
        </h3>
        <Icon name="Zap" size={20} color="var(--color-primary)" />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
        {quickActions?.map((action) => (
          <Button
            key={action?.id}
            variant="ghost"
            onClick={action?.action}
            className={`h-auto p-4 flex flex-col items-center text-center space-y-2 rounded-xl border border-border hover:shadow-subtle transition-all duration-200 ${action?.color}`}
          >
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center">
              <Icon 
                name={action?.icon} 
                size={24} 
                color="currentColor"
                strokeWidth={2}
              />
            </div>
            
            <div className="space-y-1">
              <h4 className="font-body text-sm font-semibold leading-tight">
                {action?.title}
              </h4>
              <p className="font-caption text-xs opacity-80 leading-tight">
                {action?.description}
              </p>
            </div>
          </Button>
        ))}
      </div>
      {/* Featured Action Banner */}
      <div className="mt-6 p-4 bg-gradient-to-r from-primary to-primary/80 rounded-xl text-primary-foreground">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-heading text-lg font-semibold mb-1">
              {currentLanguage === 'en' ? 'Weekend Special' : 'የሳምንት መጨረሻ ልዩ'}
            </h4>
            <p className="font-body text-sm opacity-90 mb-3">
              {currentLanguage === 'en' ?'Get 15% off on all fresh vegetables this weekend!' :'በዚህ ሳምንት መጨረሻ በሁሉም ትኩስ አትክልቶች ላይ 15% ቅናሽ ያግኙ!'
              }
            </p>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => navigate('/browse-listings', { state: { filter: 'weekend-special' } })}
              className="bg-white text-primary hover:bg-white/90"
            >
              {currentLanguage === 'en' ? 'Shop Now' : 'አሁን ይግዙ'}
            </Button>
          </div>
          <div className="ml-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              <Icon name="Gift" size={32} color="currentColor" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuickActionsGrid;