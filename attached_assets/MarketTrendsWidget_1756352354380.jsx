import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const MarketTrendsWidget = ({ currentLanguage = 'en' }) => {
  const [selectedProduce, setSelectedProduce] = useState('tomatoes');

  const marketData = {
    tomatoes: {
      name: currentLanguage === 'en' ? 'Tomatoes' : 'ቲማቲም',
      currentPrice: 30,
      change: +5.2,
      unit: 'kg',
      data: [
        { day: 'Mon', price: 28 },
        { day: 'Tue', price: 29 },
        { day: 'Wed', price: 27 },
        { day: 'Thu', price: 30 },
        { day: 'Fri', price: 32 },
        { day: 'Sat', price: 30 },
        { day: 'Sun', price: 30 }
      ]
    },
    onions: {
      name: currentLanguage === 'en' ? 'Onions' : 'ሽንኩርት',
      currentPrice: 25,
      change: -2.1,
      unit: 'kg',
      data: [
        { day: 'Mon', price: 26 },
        { day: 'Tue', price: 25 },
        { day: 'Wed', price: 27 },
        { day: 'Thu', price: 24 },
        { day: 'Fri', price: 23 },
        { day: 'Sat', price: 25 },
        { day: 'Sun', price: 25 }
      ]
    },
    carrots: {
      name: currentLanguage === 'en' ? 'Carrots' : 'ካሮት',
      currentPrice: 35,
      change: +1.8,
      unit: 'kg',
      data: [
        { day: 'Mon', price: 34 },
        { day: 'Tue', price: 35 },
        { day: 'Wed', price: 33 },
        { day: 'Thu', price: 36 },
        { day: 'Fri', price: 35 },
        { day: 'Sat', price: 35 },
        { day: 'Sun', price: 35 }
      ]
    }
  };

  const produceOptions = [
    { id: 'tomatoes', name: currentLanguage === 'en' ? 'Tomatoes' : 'ቲማቲም', icon: 'Cherry' },
    { id: 'onions', name: currentLanguage === 'en' ? 'Onions' : 'ሽንኩርት', icon: 'Circle' },
    { id: 'carrots', name: currentLanguage === 'en' ? 'Carrots' : 'ካሮት', icon: 'Carrot' }
  ];

  const currentData = marketData?.[selectedProduce];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    })?.format(price)?.replace('ETB', 'ETB');
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-popover border border-border rounded-lg shadow-floating p-3">
          <p className="font-body text-sm font-medium text-popover-foreground">
            {label}
          </p>
          <p className="font-body text-sm text-primary">
            {formatPrice(payload?.[0]?.value)}/{currentData?.unit}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-subtle">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-heading text-lg font-semibold text-foreground">
          {currentLanguage === 'en' ? 'Market Trends' : 'የገበያ አዝማሚያዎች'}
        </h3>
        <Icon name="TrendingUp" size={20} color="var(--color-primary)" />
      </div>
      {/* Produce Selector */}
      <div className="flex space-x-2 mb-4 overflow-x-auto scrollbar-hide">
        {produceOptions?.map((produce) => (
          <button
            key={produce?.id}
            onClick={() => setSelectedProduce(produce?.id)}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border transition-all duration-200 whitespace-nowrap ${
              selectedProduce === produce?.id
                ? 'bg-primary text-primary-foreground border-primary'
                : 'bg-background text-foreground border-border hover:border-primary/30'
            }`}
          >
            <Icon 
              name={produce?.icon} 
              size={16} 
              color="currentColor" 
            />
            <span className="font-body text-sm font-medium">
              {produce?.name}
            </span>
          </button>
        ))}
      </div>
      {/* Current Price Display */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-body text-sm font-medium text-muted-foreground mb-1">
              {currentLanguage === 'en' ? 'Current Average Price' : 'አሁን ያለው አማካይ ዋጋ'}
            </h4>
            <div className="flex items-center space-x-2">
              <span className="font-heading text-2xl font-bold text-foreground">
                {formatPrice(currentData?.currentPrice)}
              </span>
              <span className="font-body text-sm text-muted-foreground">
                /{currentData?.unit}
              </span>
            </div>
          </div>
          <div className={`flex items-center space-x-1 px-2 py-1 rounded-full ${
            currentData?.change > 0 
              ? 'bg-success/10 text-success' :'bg-error/10 text-error'
          }`}>
            <Icon 
              name={currentData?.change > 0 ? "TrendingUp" : "TrendingDown"} 
              size={14} 
              color="currentColor" 
            />
            <span className="font-caption text-xs font-medium">
              {Math.abs(currentData?.change)}%
            </span>
          </div>
        </div>
      </div>
      {/* Price Chart */}
      <div className="h-32 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData?.data}>
            <XAxis 
              dataKey="day" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 12, fill: 'var(--color-muted-foreground)' }}
            />
            <YAxis hide />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="price" 
              stroke="var(--color-primary)" 
              strokeWidth={2}
              dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, fill: 'var(--color-primary)' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Market Insights */}
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="Info" size={16} color="var(--color-primary)" />
            <span className="font-body text-sm font-medium text-foreground">
              {currentLanguage === 'en' ? 'Best Time to Buy' : 'ለመግዛት ጥሩ ጊዜ'}
            </span>
          </div>
          <span className="font-body text-sm text-primary font-medium">
            {currentLanguage === 'en' ? 'Wednesday' : 'ረቡዕ'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="MapPin" size={16} color="var(--color-success)" />
            <span className="font-body text-sm font-medium text-foreground">
              {currentLanguage === 'en' ? 'Cheapest Location' : 'ርካሽ ቦታ'}
            </span>
          </div>
          <span className="font-body text-sm text-success font-medium">
            {currentLanguage === 'en' ? 'Debre Zeit' : 'ደብረ ዘይት'}
          </span>
        </div>

        <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
          <div className="flex items-center space-x-2">
            <Icon name="Users" size={16} color="var(--color-warning)" />
            <span className="font-body text-sm font-medium text-foreground">
              {currentLanguage === 'en' ? 'Active Farmers' : 'ንቁ አርሶ አደሮች'}
            </span>
          </div>
          <span className="font-body text-sm text-warning font-medium">
            24 {currentLanguage === 'en' ? 'nearby' : 'በአቅራቢያ'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MarketTrendsWidget;