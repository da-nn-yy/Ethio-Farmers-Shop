import React from 'react';
import Icon from '../../../components/AppIcon';

const OrderStats = ({ stats, currentLanguage = 'en' }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(amount);
  };

  const statCards = [
    {
      id: 'pending',
      label: currentLanguage === 'am' ? 'በመጠባበቅ ላይ' : 'Pending Orders',
      value: stats?.pending || 0,
      icon: 'Clock',
      color: 'text-warning',
      bgColor: 'bg-warning/10',
      borderColor: 'border-warning/20'
    },
    {
      id: 'confirmed',
      label: currentLanguage === 'am' ? 'ተረጋግጧል' : 'Confirmed Orders',
      value: stats?.confirmed || 0,
      icon: 'CheckCircle',
      color: 'text-primary',
      bgColor: 'bg-primary/10',
      borderColor: 'border-primary/20'
    },
    {
      id: 'completed',
      label: currentLanguage === 'am' ? 'ተጠናቅቋል' : 'Completed Orders',
      value: stats?.completed || 0,
      icon: 'CheckCircle2',
      color: 'text-success',
      bgColor: 'bg-success/10',
      borderColor: 'border-success/20'
    },
    {
      id: 'total_revenue',
      label: currentLanguage === 'am' ? 'ጠቅላላ ገቢ' : 'Total Revenue',
      value: formatCurrency(stats?.totalRevenue || 0),
      icon: 'DollarSign',
      color: 'text-accent',
      bgColor: 'bg-accent/10',
      borderColor: 'border-accent/20',
      isRevenue: true
    }
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {statCards?.map((stat) => (
        <div
          key={stat?.id}
          className={`bg-card border rounded-lg p-4 shadow-warm ${stat?.borderColor}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-text-secondary mb-1">
                {stat?.label}
              </p>
              <p className={`text-2xl font-bold ${stat?.color}`}>
                {stat?.isRevenue ? stat?.value : stat?.value?.toLocaleString()}
              </p>
            </div>
            <div className={`w-12 h-12 rounded-lg ${stat?.bgColor} flex items-center justify-center`}>
              <Icon name={stat?.icon} size={24} className={stat?.color} />
            </div>
          </div>
          
          {/* Trend indicator (mock data) */}
          <div className="flex items-center mt-3 pt-3 border-t border-border">
            <Icon 
              name={stat?.id === 'total_revenue' ? 'TrendingUp' : 'TrendingUp'} 
              size={14} 
              className="text-success mr-1" 
            />
            <span className="text-xs text-success font-medium">
              +{Math.floor(Math.random() * 20 + 5)}%
            </span>
            <span className="text-xs text-text-secondary ml-1">
              {currentLanguage === 'am' ? 'ከዚህ ወር' : 'from last month'}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderStats;