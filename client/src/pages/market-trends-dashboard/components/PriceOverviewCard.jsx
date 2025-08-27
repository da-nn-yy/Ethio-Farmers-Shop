import React from 'react';
import Icon from '../../../components/AppIcon';

const PriceOverviewCard = ({ currentLanguage = 'en' }) => {
  const priceData = [
    {
      id: 1,
      name: "Teff",
      nameAm: "ጤፍ",
      currentPrice: 85.50,
      previousPrice: 82.30,
      unit: "kg",
      unitAm: "ኪግ",
      change: 3.89,
      trend: "up",
      volume: "2,450 tons",
      volumeAm: "2,450 ቶን"
    },
    {
      id: 2,
      name: "Coffee",
      nameAm: "ቡና",
      currentPrice: 320.75,
      previousPrice: 335.20,
      unit: "kg",
      unitAm: "ኪግ",
      change: -4.31,
      trend: "down",
      volume: "1,850 tons",
      volumeAm: "1,850 ቶን"
    },
    {
      id: 3,
      name: "Maize",
      nameAm: "በቆሎ",
      currentPrice: 28.90,
      previousPrice: 27.15,
      unit: "kg",
      unitAm: "ኪግ",
      change: 6.45,
      trend: "up",
      volume: "3,200 tons",
      volumeAm: "3,200 ቶን"
    },
    {
      id: 4,
      name: "Wheat",
      nameAm: "ስንዴ",
      currentPrice: 45.60,
      previousPrice: 46.80,
      unit: "kg",
      unitAm: "ኪግ",
      change: -2.56,
      trend: "down",
      volume: "1,950 tons",
      volumeAm: "1,950 ቶን"
    }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(price);
  };

  const getLabel = (item, field) => {
    return currentLanguage === 'am' && item?.[`${field}Am`] ? item?.[`${field}Am`] : item?.[field];
  };

  return (
    <div className="bg-surface p-4 lg:p-6 rounded-lg border border-border shadow-warm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="TrendingUp" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            {currentLanguage === 'am' ? 'የዋጋ አጠቃላይ እይታ' : 'Price Overview'}
          </h3>
        </div>
        <div className="text-xs text-text-secondary">
          {currentLanguage === 'am' ? 'ለመጨረሻ ጊዜ የተዘመነ፡ ዛሬ 2:30 PM' : 'Last updated: Today 2:30 PM'}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {priceData?.map((item) => (
          <div key={item?.id} className="p-4 bg-muted rounded-lg border border-border">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="Wheat" size={20} className="text-primary" />
                </div>
                <div>
                  <h4 className="font-medium text-text-primary">
                    {getLabel(item, 'name')}
                  </h4>
                  <p className="text-sm text-text-secondary">
                    {getLabel(item, 'volume')}
                  </p>
                </div>
              </div>
              
              <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                item?.trend === 'up' ?'bg-success/10 text-success' :'bg-error/10 text-error'
              }`}>
                <Icon 
                  name={item?.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} 
                  size={12} 
                />
                <span>{Math.abs(item?.change)}%</span>
              </div>
            </div>

            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold text-text-primary">
                  {formatPrice(item?.currentPrice)} 
                  <span className="text-sm font-normal text-text-secondary ml-1">
                    ETB/{getLabel(item, 'unit')}
                  </span>
                </div>
                <div className="text-sm text-text-secondary">
                  {currentLanguage === 'am' ? 'ከ' : 'from'} {formatPrice(item?.previousPrice)} ETB
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-sm font-medium ${
                  item?.trend === 'up' ? 'text-success' : 'text-error'
                }`}>
                  {item?.trend === 'up' ? '+' : ''}{formatPrice(item?.currentPrice - item?.previousPrice)} ETB
                </div>
                <div className="text-xs text-text-secondary">
                  {currentLanguage === 'am' ? 'ከዚህ ሳምንት በፊት' : 'vs last week'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PriceOverviewCard;