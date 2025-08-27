import React from 'react';
import Icon from '../../../components/AppIcon';

const PopularProduce = ({ currentLanguage = 'en' }) => {
  const popularItems = [
    {
      id: 1,
      name: "Teff",
      nameAm: "ጤፍ",
      volume: "2,450 tons",
      volumeAm: "2,450 ቶን",
      price: 85.50,
      change: 3.2,
      trend: "up",
      rank: 1,
      marketShare: 28.5,
      icon: "Wheat"
    },
    {
      id: 2,
      name: "Maize",
      nameAm: "በቆሎ",
      volume: "3,200 tons",
      volumeAm: "3,200 ቶን",
      price: 28.90,
      change: 6.4,
      trend: "up",
      rank: 2,
      marketShare: 24.8,
      icon: "Wheat"
    },
    {
      id: 3,
      name: "Coffee",
      nameAm: "ቡና",
      volume: "1,850 tons",
      volumeAm: "1,850 ቶን",
      price: 320.75,
      change: -2.1,
      trend: "down",
      rank: 3,
      marketShare: 18.2,
      icon: "Coffee"
    },
    {
      id: 4,
      name: "Wheat",
      nameAm: "ስንዴ",
      volume: "1,950 tons",
      volumeAm: "1,950 ቶን",
      price: 45.60,
      change: -1.8,
      trend: "down",
      rank: 4,
      marketShare: 15.3,
      icon: "Wheat"
    },
    {
      id: 5,
      name: "Barley",
      nameAm: "ገብስ",
      volume: "1,200 tons",
      volumeAm: "1,200 ቶን",
      price: 38.20,
      change: 2.7,
      trend: "up",
      rank: 5,
      marketShare: 8.9,
      icon: "Wheat"
    },
    {
      id: 6,
      name: "Sorghum",
      nameAm: "ማሽላ",
      volume: "980 tons",
      volumeAm: "980 ቶን",
      price: 32.40,
      change: 1.5,
      trend: "up",
      rank: 6,
      marketShare: 4.3,
      icon: "Wheat"
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

  const getRankColor = (rank) => {
    switch (rank) {
      case 1: return 'bg-yellow-500 text-white';
      case 2: return 'bg-gray-400 text-white';
      case 3: return 'bg-amber-600 text-white';
      default: return 'bg-primary text-primary-foreground';
    }
  };

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1: return 'Crown';
      case 2: return 'Medal';
      case 3: return 'Award';
      default: return 'Hash';
    }
  };

  return (
    <div className="bg-surface p-4 lg:p-6 rounded-lg border border-border shadow-warm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="TrendingUp" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            {currentLanguage === 'am' ? 'ተወዳጅ ምርቶች' : 'Popular Produce'}
          </h3>
        </div>
        <div className="text-xs text-text-secondary">
          {currentLanguage === 'am' ? 'በዚህ ሳምንት' : 'This week'}
        </div>
      </div>
      <div className="mb-4">
        <p className="text-sm text-text-secondary">
          {currentLanguage === 'am' ?'በመጠን እና በገበያ ድርሻ ላይ በመመስረት ከፍተኛ የንግድ እንቅስቃሴ ያላቸው ምርቶች' :'Most traded items based on volume and market activity'
          }
        </p>
      </div>
      <div className="space-y-3">
        {popularItems?.map((item) => (
          <div key={item?.id} className="p-4 bg-muted rounded-lg border border-border hover:shadow-warm-md transition-smooth">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${getRankColor(item?.rank)}`}>
                  {item?.rank <= 3 ? (
                    <Icon name={getRankIcon(item?.rank)} size={16} />
                  ) : (
                    item?.rank
                  )}
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Icon name={item?.icon} size={20} className="text-primary" />
                  </div>
                  <div>
                    <h4 className="font-medium text-text-primary">
                      {getLabel(item, 'name')}
                    </h4>
                    <p className="text-sm text-text-secondary">
                      {getLabel(item, 'volume')} • {item?.marketShare}% {currentLanguage === 'am' ? 'ድርሻ' : 'share'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-lg font-bold text-text-primary">
                    {formatPrice(item?.price)}
                  </span>
                  <span className="text-sm text-text-secondary">ETB</span>
                </div>
                
                <div className={`flex items-center space-x-1 text-sm ${
                  item?.trend === 'up' ? 'text-success' : 'text-error'
                }`}>
                  <Icon 
                    name={item?.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} 
                    size={14} 
                  />
                  <span>
                    {item?.trend === 'up' ? '+' : ''}{item?.change}%
                  </span>
                </div>
              </div>
            </div>

            {/* Market share bar */}
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs text-text-secondary mb-1">
                <span>{currentLanguage === 'am' ? 'የገበያ ድርሻ' : 'Market Share'}</span>
                <span>{item?.marketShare}%</span>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-smooth"
                  style={{ width: `${item?.marketShare}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-start space-x-3">
          <Icon name="TrendingUp" size={20} className="text-primary mt-0.5" />
          <div>
            <h6 className="font-medium text-text-primary mb-1">
              {currentLanguage === 'am' ? 'የገበያ ትንተና' : 'Market Analysis'}
            </h6>
            <p className="text-sm text-text-secondary">
              {currentLanguage === 'am' ?'ጤፍ እና በቆሎ በዚህ ሳምንት ከፍተኛ የንግድ እንቅስቃሴ አሳይተዋል። ቡና ዋጋ መቀነሱ የወቅቱ ሁኔታ ነው።' :'Teff and Maize show strong trading activity this week. Coffee price decline is seasonal.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularProduce;