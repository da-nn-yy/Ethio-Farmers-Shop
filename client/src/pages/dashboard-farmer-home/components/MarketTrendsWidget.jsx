import React from 'react';
import Icon from '../../../components/AppIcon';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Button from '../../../components/ui/Button';


const MarketTrendsWidget = ({ currentLanguage = 'en' }) => {
  const marketData = [
    { date: '2025-08-20', teff: 85, wheat: 45, barley: 38, maize: 32 },
    { date: '2025-08-21', teff: 87, wheat: 46, barley: 39, maize: 33 },
    { date: '2025-08-22', teff: 89, wheat: 47, barley: 40, maize: 34 },
    { date: '2025-08-23', teff: 86, wheat: 45, barley: 38, maize: 32 },
    { date: '2025-08-24', teff: 88, wheat: 48, barley: 41, maize: 35 },
    { date: '2025-08-25', teff: 90, wheat: 49, barley: 42, maize: 36 },
    { date: '2025-08-26', teff: 92, wheat: 50, barley: 43, maize: 37 }
  ];

  const cropPrices = [
    {
      name: 'Teff',
      nameAm: 'ጤፍ',
      currentPrice: 92,
      change: '+2.2',
      trend: 'up',
      color: '#2D5A27'
    },
    {
      name: 'Wheat',
      nameAm: 'ስንዴ',
      currentPrice: 50,
      change: '+4.2',
      trend: 'up',
      color: '#DAA520'
    },
    {
      name: 'Barley',
      nameAm: 'ገብስ',
      currentPrice: 43,
      change: '+2.4',
      trend: 'up',
      color: '#8B4513'
    },
    {
      name: 'Maize',
      nameAm: 'በቆሎ',
      currentPrice: 37,
      change: '+5.7',
      trend: 'up',
      color: '#059669'
    }
  ];

  const formatTooltipLabel = (label) => {
    const date = new Date(label);
    return date?.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short' 
    });
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-card border border-border rounded-lg p-3 shadow-warm-lg">
          <p className="text-sm font-medium text-text-primary mb-2">
            {formatTooltipLabel(label)}
          </p>
          {payload?.map((entry, index) => (
            <div key={index} className="flex items-center justify-between space-x-4">
              <div className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: entry?.color }}
                />
                <span className="text-sm text-text-secondary capitalize">
                  {entry?.dataKey}
                </span>
              </div>
              <span className="text-sm font-medium text-text-primary">
                {entry?.value} ETB
              </span>
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 lg:p-6 shadow-warm">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
            <Icon name="TrendingUp" size={20} className="text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-text-primary">
              {currentLanguage === 'am' ? 'የገበያ አዝማሚያዎች' : 'Market Trends'}
            </h3>
            <p className="text-sm text-text-secondary">
              {currentLanguage === 'am' ? 'የቅርብ ጊዜ ዋጋዎች' : 'Recent prices in your area'}
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" iconName="ExternalLink">
          {currentLanguage === 'am' ? 'ሙሉ ዘገባ' : 'Full Report'}
        </Button>
      </div>
      {/* Price Chart */}
      <div className="h-48 lg:h-64 mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={marketData}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatTooltipLabel}
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
            <YAxis 
              stroke="var(--color-text-secondary)"
              fontSize={12}
              tickFormatter={(value) => `${value} ETB`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="teff" 
              stroke="#2D5A27" 
              strokeWidth={2}
              dot={{ fill: '#2D5A27', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#2D5A27', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="wheat" 
              stroke="#DAA520" 
              strokeWidth={2}
              dot={{ fill: '#DAA520', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#DAA520', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="barley" 
              stroke="#8B4513" 
              strokeWidth={2}
              dot={{ fill: '#8B4513', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8B4513', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="maize" 
              stroke="#059669" 
              strokeWidth={2}
              dot={{ fill: '#059669', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#059669', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Price Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {cropPrices?.map((crop, index) => (
          <div key={index} className="text-center">
            <div className="flex items-center justify-center space-x-1 mb-1">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: crop?.color }}
              />
              <span className="text-sm font-medium text-text-primary">
                {currentLanguage === 'am' && crop?.nameAm ? crop?.nameAm : crop?.name}
              </span>
            </div>
            <p className="text-lg font-bold text-text-primary">
              {crop?.currentPrice} ETB
            </p>
            <div className="flex items-center justify-center space-x-1">
              <Icon 
                name={crop?.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} 
                size={14} 
                className={crop?.trend === 'up' ? 'text-success' : 'text-error'}
              />
              <span className={`text-xs font-medium ${crop?.trend === 'up' ? 'text-success' : 'text-error'}`}>
                {crop?.change}%
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MarketTrendsWidget;