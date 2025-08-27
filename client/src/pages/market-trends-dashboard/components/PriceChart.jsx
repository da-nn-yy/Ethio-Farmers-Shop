import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PriceChart = ({ currentLanguage = 'en' }) => {
  const [selectedCrop, setSelectedCrop] = useState('teff');
  const [timeRange, setTimeRange] = useState('30d');

  const crops = [
    { value: 'teff', label: 'Teff', labelAm: 'ጤፍ' },
    { value: 'coffee', label: 'Coffee', labelAm: 'ቡና' },
    { value: 'maize', label: 'Maize', labelAm: 'በቆሎ' },
    { value: 'wheat', label: 'Wheat', labelAm: 'ስንዴ' }
  ];

  const timeRanges = [
    { value: '7d', label: '7 Days', labelAm: '7 ቀናት' },
    { value: '30d', label: '30 Days', labelAm: '30 ቀናት' },
    { value: '90d', label: '90 Days', labelAm: '90 ቀናት' },
    { value: '1y', label: '1 Year', labelAm: '1 አመት' }
  ];

  const chartData = {
    teff: [
      { date: '2025-07-28', price: 78.50, volume: 2100 },
      { date: '2025-07-30', price: 79.20, volume: 2250 },
      { date: '2025-08-02', price: 80.10, volume: 2180 },
      { date: '2025-08-05', price: 81.30, volume: 2350 },
      { date: '2025-08-08', price: 82.80, volume: 2420 },
      { date: '2025-08-12', price: 83.90, volume: 2380 },
      { date: '2025-08-15', price: 84.20, volume: 2450 },
      { date: '2025-08-18', price: 85.10, volume: 2500 },
      { date: '2025-08-22', price: 84.80, volume: 2480 },
      { date: '2025-08-25', price: 85.50, volume: 2450 }
    ],
    coffee: [
      { date: '2025-07-28', price: 340.20, volume: 1650 },
      { date: '2025-07-30', price: 338.50, volume: 1700 },
      { date: '2025-08-02', price: 335.80, volume: 1720 },
      { date: '2025-08-05', price: 332.40, volume: 1800 },
      { date: '2025-08-08', price: 328.90, volume: 1850 },
      { date: '2025-08-12', price: 325.60, volume: 1820 },
      { date: '2025-08-15', price: 322.30, volume: 1880 },
      { date: '2025-08-18', price: 318.70, volume: 1900 },
      { date: '2025-08-22', price: 321.40, volume: 1870 },
      { date: '2025-08-25', price: 320.75, volume: 1850 }
    ]
  };

  const formatDate = (dateStr) => {
    const date = new Date(dateStr);
    return date?.toLocaleDateString('en-GB', { 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(price);
  };

  const getLabel = (item, field) => {
    return currentLanguage === 'am' && item?.[`${field}Am`] ? item?.[`${field}Am`] : item?.[field];
  };

  const currentData = chartData?.[selectedCrop] || chartData?.teff;
  const currentCrop = crops?.find(c => c?.value === selectedCrop);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      return (
        <div className="bg-surface p-3 rounded-lg border border-border shadow-warm-md">
          <p className="text-sm font-medium text-text-primary mb-1">
            {formatDate(label)}
          </p>
          <p className="text-sm text-primary">
            {currentLanguage === 'am' ? 'ዋጋ፡' : 'Price:'} {formatPrice(payload?.[0]?.value)} ETB
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-surface p-4 lg:p-6 rounded-lg border border-border shadow-warm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-2">
          <Icon name="BarChart3" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            {currentLanguage === 'am' ? 'የዋጋ አዝማሚያ' : 'Price Trends'}
          </h3>
        </div>
        
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-3">
          <div className="flex space-x-2">
            {crops?.map((crop) => (
              <Button
                key={crop?.value}
                variant={selectedCrop === crop?.value ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedCrop(crop?.value)}
                className="text-xs"
              >
                {getLabel(crop, 'label')}
              </Button>
            ))}
          </div>
          
          <div className="flex space-x-2">
            {timeRanges?.map((range) => (
              <Button
                key={range?.value}
                variant={timeRange === range?.value ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setTimeRange(range?.value)}
                className="text-xs"
              >
                {getLabel(range, 'label')}
              </Button>
            ))}
          </div>
        </div>
      </div>
      <div className="mb-4">
        <h4 className="text-xl font-bold text-text-primary">
          {getLabel(currentCrop, 'label')} {currentLanguage === 'am' ? 'ዋጋ አዝማሚያ' : 'Price Trend'}
        </h4>
        <p className="text-sm text-text-secondary">
          {currentLanguage === 'am' ? 'ባለፉት 30 ቀናት' : 'Last 30 days performance'}
        </p>
      </div>
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={currentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => `${formatPrice(value)}`}
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
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
      <div className="mt-4 flex items-center justify-between text-sm text-text-secondary">
        <span>
          {currentLanguage === 'am' ? 'ዋጋ በ ETB ኪግ' : 'Price in ETB per kg'}
        </span>
        <span>
          {currentLanguage === 'am' ? 'መረጃ ምንጭ፡ የኢትዮጵያ ገበያ' : 'Data source: Ethiopian Markets'}
        </span>
      </div>
    </div>
  );
};

export default PriceChart;