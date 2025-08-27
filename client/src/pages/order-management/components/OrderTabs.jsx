import React from 'react';
import Icon from '../../../components/AppIcon';
import NotificationBadge from '../../../components/ui/NotificationBadge';

const OrderTabs = ({ 
  activeTab, 
  onTabChange, 
  orderCounts, 
  currentLanguage = 'en' 
}) => {
  const tabs = [
    {
      id: 'all',
      label: currentLanguage === 'am' ? 'ሁሉም' : 'All Orders',
      icon: 'List',
      count: orderCounts?.all || 0
    },
    {
      id: 'pending',
      label: currentLanguage === 'am' ? 'በመጠባበቅ ላይ' : 'Pending',
      icon: 'Clock',
      count: orderCounts?.pending || 0,
      variant: 'warning'
    },
    {
      id: 'confirmed',
      label: currentLanguage === 'am' ? 'ተረጋግጧል' : 'Confirmed',
      icon: 'CheckCircle',
      count: orderCounts?.confirmed || 0,
      variant: 'primary'
    },
    {
      id: 'completed',
      label: currentLanguage === 'am' ? 'ተጠናቅቋል' : 'Completed',
      icon: 'CheckCircle2',
      count: orderCounts?.completed || 0,
      variant: 'success'
    },
    {
      id: 'cancelled',
      label: currentLanguage === 'am' ? 'ተሰርዟል' : 'Cancelled',
      icon: 'XCircle',
      count: orderCounts?.cancelled || 0,
      variant: 'error'
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg shadow-warm">
      <div className="flex overflow-x-auto">
        {tabs?.map((tab, index) => {
          const isActive = activeTab === tab?.id;
          
          return (
            <button
              key={tab?.id}
              onClick={() => onTabChange(tab?.id)}
              className={`
                flex-1 min-w-0 flex flex-col items-center justify-center
                px-4 py-4 space-y-2 transition-smooth
                ${isActive 
                  ? 'text-primary bg-primary/5 border-b-2 border-primary' :'text-text-secondary hover:text-primary hover:bg-primary/5'
                }
                ${index > 0 ? 'border-l border-border' : ''}
              `}
            >
              <div className="flex items-center space-x-2">
                <Icon 
                  name={tab?.icon} 
                  size={20} 
                  className={isActive ? 'text-primary' : 'text-current'}
                />
                {tab?.count > 0 && (
                  <NotificationBadge 
                    count={tab?.count} 
                    variant={tab?.variant || 'default'}
                    size="sm"
                  />
                )}
              </div>
              <span className={`text-sm font-medium ${isActive ? 'text-primary' : 'text-current'}`}>
                {tab?.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default OrderTabs;