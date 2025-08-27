import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';


const RecentActivityFeed = ({ currentLanguage = 'en' }) => {
  const activities = [
    {
      id: 1,
      type: 'order',
      title: 'New order received',
      titleAm: 'አዲስ ትዕዛዝ ተቀብሏል',
      description: 'Sarah Johnson ordered 5kg of Teff',
      descriptionAm: 'ሳራ ጆንሰን 5 ኪሎ ጤፍ አዘዘች',
      timestamp: new Date(Date.now() - 1800000), // 30 minutes ago
      icon: 'ShoppingBag',
      iconColor: 'text-success',
      iconBg: 'bg-success/10'
    },
    {
      id: 2,
      type: 'listing',
      title: 'Listing updated',
      titleAm: 'ዝርዝር ተዘምኗል',
      description: 'Updated price for Wheat to 50 ETB/kg',
      descriptionAm: 'የስንዴ ዋጋ ወደ 50 ብር/ኪሎ ተዘምኗል',
      timestamp: new Date(Date.now() - 3600000), // 1 hour ago
      icon: 'Edit',
      iconColor: 'text-primary',
      iconBg: 'bg-primary/10'
    },
    {
      id: 3,
      type: 'payment',
      title: 'Payment received',
      titleAm: 'ክፍያ ተቀብሏል',
      description: 'Received 450 ETB from order #ORD-001',
      descriptionAm: 'ከትዕዛዝ #ORD-001 450 ብር ተቀብሏል',
      timestamp: new Date(Date.now() - 7200000), // 2 hours ago
      icon: 'CreditCard',
      iconColor: 'text-accent',
      iconBg: 'bg-accent/10'
    },
    {
      id: 4,
      type: 'stock',
      title: 'Low stock alert',
      titleAm: 'ዝቅተኛ ክምችት ማንቂያ',
      description: 'Barley stock is running low (2kg remaining)',
      descriptionAm: 'የገብስ ክምችት እየቀነሰ ነው (2 ኪሎ ቀርቷል)',
      timestamp: new Date(Date.now() - 10800000), // 3 hours ago
      icon: 'AlertTriangle',
      iconColor: 'text-warning',
      iconBg: 'bg-warning/10'
    },
    {
      id: 5,
      type: 'review',
      title: 'New review received',
      titleAm: 'አዲስ ግምገማ ተቀብሏል',
      description: 'Ahmed Hassan left a 5-star review',
      descriptionAm: 'አህመድ ሃሰን 5 ኮከብ ግምገማ ተወ',
      timestamp: new Date(Date.now() - 14400000), // 4 hours ago
      icon: 'Star',
      iconColor: 'text-accent',
      iconBg: 'bg-accent/10'
    }
  ];

  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (currentLanguage === 'am') {
      if (minutes < 60) {
        return `${minutes} ደቂቃ በፊት`;
      } else if (hours < 24) {
        return `${hours} ሰዓት በፊት`;
      } else {
        return `${days} ቀን በፊት`;
      }
    } else {
      if (minutes < 60) {
        return `${minutes}m ago`;
      } else if (hours < 24) {
        return `${hours}h ago`;
      } else {
        return `${days}d ago`;
      }
    }
  };

  const getTitle = (activity) => {
    return currentLanguage === 'am' && activity?.titleAm ? activity?.titleAm : activity?.title;
  };

  const getDescription = (activity) => {
    return currentLanguage === 'am' && activity?.descriptionAm ? activity?.descriptionAm : activity?.description;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 lg:p-6 shadow-warm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="Activity" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {currentLanguage === 'am' ? 'የቅርብ ጊዜ እንቅስቃሴዎች' : 'Recent Activity'}
            </h3>
            <p className="text-sm text-text-secondary">
              {currentLanguage === 'am' ? 'የእርስዎ የንግድ እንቅስቃሴ' : 'Your business activity'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" iconName="MoreHorizontal">
          {currentLanguage === 'am' ? 'ሁሉም' : 'View All'}
        </Button>
      </div>
      {/* Activity List */}
      <div className="space-y-4">
        {activities?.map((activity) => (
          <div key={activity?.id} className="flex items-start space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-smooth">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center ${activity?.iconBg}`}>
              <Icon name={activity?.icon} size={18} className={activity?.iconColor} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-text-primary mb-1">
                    {getTitle(activity)}
                  </p>
                  <p className="text-sm text-text-secondary">
                    {getDescription(activity)}
                  </p>
                </div>
                <span className="text-xs text-text-secondary ml-2 flex-shrink-0">
                  {formatTimestamp(activity?.timestamp)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* View All Button */}
      <div className="mt-6 pt-4 border-t border-border">
        <Button variant="outline" className="w-full" iconName="ArrowRight" iconPosition="right">
          {currentLanguage === 'am' ? 'ሁሉንም እንቅስቃሴዎች ይመልከቱ' : 'View All Activities'}
        </Button>
      </div>
    </div>
  );
};

export default RecentActivityFeed;