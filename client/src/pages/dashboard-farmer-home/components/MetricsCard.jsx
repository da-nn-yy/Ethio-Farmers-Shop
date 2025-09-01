import React from 'react';
import Icon from '../../../components/AppIcon';

const MetricsCard = ({
  title,
  titleAm,
  value,
  icon,
  trend,
  trendValue,
  currency = false,
  currentLanguage = 'en'
}) => {
  const getTitle = () => {
    return currentLanguage === 'am' && titleAm ? titleAm : title;
  };

  const formatValue = (val) => {
    if (currency) {
      return `${val?.toLocaleString()} ETB`;
    }
    return val?.toLocaleString();
  };

  const getTrendColor = () => {
    if (!trend) return 'text-text-secondary';
    return trend === 'up' ? 'text-success' : trend === 'down' ? 'text-error' : 'text-text-secondary';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend === 'up' ? 'TrendingUp' : trend === 'down' ? 'TrendingDown' : 'Minus';
  };

  return (
    <div className="p-4 border rounded-lg bg-card border-border lg:p-6 shadow-warm hover:shadow-warm-md transition-smooth">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="mb-1 text-sm font-medium text-text-secondary">
            {getTitle()}
          </p>
          <p className="mb-2 text-2xl font-bold lg:text-3xl text-text-primary">
            {formatValue(value)}
          </p>
          {trend && trendValue && (
            <div className={`flex items-center space-x-1 ${getTrendColor()}`}>
              <Icon name={getTrendIcon()} size={16} />
              <span className="text-sm font-medium">
                {trendValue}%
              </span>
              <span className="text-xs text-text-secondary">
                {currentLanguage === 'am' ? 'ከዚህ ሳምንት በፊት' : 'vs last week'}
              </span>
            </div>
          )}
        </div>
        <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10">
          <Icon name={icon} size={24} className="text-primary" />
        </div>
      </div>
    </div>
  );
};

export default MetricsCard;
