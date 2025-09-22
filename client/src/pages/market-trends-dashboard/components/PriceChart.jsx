import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart, ReferenceLine } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const PriceChart = ({ currentLanguage = 'en' }) => {
  const [selectedCrop, setSelectedCrop] = useState('teff');
  const [timeRange, setTimeRange] = useState('30d');

  const crops = [
    { value: 'teff', label: 'Teff', labelAm: 'ጤፍ' },
    { value: 'coffee', label: 'Coffee', labelAm: 'ቡና' },
    { value: 'maize', label: 'Maize', labelAm: 'በቆሎ' },
    { value: 'wheat', label: 'Wheat', labelAm: 'ስንዴ' },
    { value: 'barley', label: 'Barley', labelAm: 'ገብስ' },
    { value: 'sorghum', label: 'Sorghum', labelAm: 'ማሽላ' },
    { value: 'chickpea', label: 'Chickpea', labelAm: 'ሻምበል' },
    { value: 'lentil', label: 'Lentil', labelAm: 'ምስር' }
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
      { date: '2025-08-25', price: 85.50, volume: 2450 },
      { date: '2025-08-28', price: 87.20, volume: 2520 },
      { date: '2025-08-31', price: 89.10, volume: 2480 },
      { date: '2025-09-03', price: 91.50, volume: 2550 },
      { date: '2025-09-06', price: 94.20, volume: 2620 },
      { date: '2025-09-09', price: 96.80, volume: 2580 },
      { date: '2025-09-12', price: 98.50, volume: 2650 },
      { date: '2025-09-15', price: 99.20, volume: 2700 },
      { date: '2025-09-18', price: 97.80, volume: 2680 },
      { date: '2025-09-21', price: 95.40, volume: 2600 },
      { date: '2025-09-24', price: 93.60, volume: 2550 }
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
      { date: '2025-08-25', price: 320.75, volume: 1850 },
      { date: '2025-08-28', price: 315.20, volume: 1920 },
      { date: '2025-08-31', price: 310.80, volume: 1950 },
      { date: '2025-09-03', price: 305.40, volume: 1980 },
      { date: '2025-09-06', price: 300.20, volume: 2000 },
      { date: '2025-09-09', price: 295.60, volume: 2020 },
      { date: '2025-09-12', price: 290.80, volume: 2050 },
      { date: '2025-09-15', price: 285.40, volume: 2080 },
      { date: '2025-09-18', price: 280.20, volume: 2100 },
      { date: '2025-09-21', price: 275.60, volume: 2120 },
      { date: '2025-09-24', price: 270.80, volume: 2150 }
    ],
    maize: [
      { date: '2025-07-28', price: 28.50, volume: 3200 },
      { date: '2025-07-30', price: 29.20, volume: 3250 },
      { date: '2025-08-02', price: 30.10, volume: 3180 },
      { date: '2025-08-05', price: 31.30, volume: 3350 },
      { date: '2025-08-08', price: 32.80, volume: 3420 },
      { date: '2025-08-12', price: 33.90, volume: 3380 },
      { date: '2025-08-15', price: 34.20, volume: 3450 },
      { date: '2025-08-18', price: 35.10, volume: 3500 },
      { date: '2025-08-22', price: 34.80, volume: 3480 },
      { date: '2025-08-25', price: 35.50, volume: 3450 },
      { date: '2025-08-28', price: 36.20, volume: 3520 },
      { date: '2025-08-31', price: 37.10, volume: 3480 },
      { date: '2025-09-03', price: 38.50, volume: 3550 },
      { date: '2025-09-06', price: 39.20, volume: 3620 },
      { date: '2025-09-09', price: 40.80, volume: 3580 },
      { date: '2025-09-12', price: 41.50, volume: 3650 },
      { date: '2025-09-15', price: 42.20, volume: 3700 },
      { date: '2025-09-18', price: 41.80, volume: 3680 },
      { date: '2025-09-21', price: 40.40, volume: 3600 },
      { date: '2025-09-24', price: 39.60, volume: 3550 }
    ],
    wheat: [
      { date: '2025-07-28', price: 42.50, volume: 2800 },
      { date: '2025-07-30', price: 43.20, volume: 2850 },
      { date: '2025-08-02', price: 44.10, volume: 2780 },
      { date: '2025-08-05', price: 45.30, volume: 2950 },
      { date: '2025-08-08', price: 46.80, volume: 3020 },
      { date: '2025-08-12', price: 47.90, volume: 2980 },
      { date: '2025-08-15', price: 48.20, volume: 3050 },
      { date: '2025-08-18', price: 49.10, volume: 3100 },
      { date: '2025-08-22', price: 48.80, volume: 3080 },
      { date: '2025-08-25', price: 49.50, volume: 3050 },
      { date: '2025-08-28', price: 50.20, volume: 3120 },
      { date: '2025-08-31', price: 51.10, volume: 3080 },
      { date: '2025-09-03', price: 52.50, volume: 3150 },
      { date: '2025-09-06', price: 53.20, volume: 3220 },
      { date: '2025-09-09', price: 54.80, volume: 3180 },
      { date: '2025-09-12', price: 55.50, volume: 3250 },
      { date: '2025-09-15', price: 56.20, volume: 3300 },
      { date: '2025-09-18', price: 55.80, volume: 3280 },
      { date: '2025-09-21', price: 54.40, volume: 3200 },
      { date: '2025-09-24', price: 53.60, volume: 3150 }
    ],
    barley: [
      { date: '2025-07-28', price: 35.50, volume: 1800 },
      { date: '2025-07-30', price: 36.20, volume: 1850 },
      { date: '2025-08-02', price: 37.10, volume: 1780 },
      { date: '2025-08-05', price: 38.30, volume: 1950 },
      { date: '2025-08-08', price: 39.80, volume: 2020 },
      { date: '2025-08-12', price: 40.90, volume: 1980 },
      { date: '2025-08-15', price: 41.20, volume: 2050 },
      { date: '2025-08-18', price: 42.10, volume: 2100 },
      { date: '2025-08-22', price: 41.80, volume: 2080 },
      { date: '2025-08-25', price: 42.50, volume: 2050 },
      { date: '2025-08-28', price: 43.20, volume: 2120 },
      { date: '2025-08-31', price: 44.10, volume: 2080 },
      { date: '2025-09-03', price: 45.50, volume: 2150 },
      { date: '2025-09-06', price: 46.20, volume: 2220 },
      { date: '2025-09-09', price: 47.80, volume: 2180 },
      { date: '2025-09-12', price: 48.50, volume: 2250 },
      { date: '2025-09-15', price: 49.20, volume: 2300 },
      { date: '2025-09-18', price: 48.80, volume: 2280 },
      { date: '2025-09-21', price: 47.40, volume: 2200 },
      { date: '2025-09-24', price: 46.60, volume: 2150 }
    ],
    sorghum: [
      { date: '2025-07-28', price: 25.50, volume: 1500 },
      { date: '2025-07-30', price: 26.20, volume: 1550 },
      { date: '2025-08-02', price: 27.10, volume: 1480 },
      { date: '2025-08-05', price: 28.30, volume: 1650 },
      { date: '2025-08-08', price: 29.80, volume: 1720 },
      { date: '2025-08-12', price: 30.90, volume: 1680 },
      { date: '2025-08-15', price: 31.20, volume: 1750 },
      { date: '2025-08-18', price: 32.10, volume: 1800 },
      { date: '2025-08-22', price: 31.80, volume: 1780 },
      { date: '2025-08-25', price: 32.50, volume: 1750 },
      { date: '2025-08-28', price: 33.20, volume: 1820 },
      { date: '2025-08-31', price: 34.10, volume: 1780 },
      { date: '2025-09-03', price: 35.50, volume: 1850 },
      { date: '2025-09-06', price: 36.20, volume: 1920 },
      { date: '2025-09-09', price: 37.80, volume: 1880 },
      { date: '2025-09-12', price: 38.50, volume: 1950 },
      { date: '2025-09-15', price: 39.20, volume: 2000 },
      { date: '2025-09-18', price: 38.80, volume: 1980 },
      { date: '2025-09-21', price: 37.40, volume: 1900 },
      { date: '2025-09-24', price: 36.60, volume: 1850 }
    ],
    chickpea: [
      { date: '2025-07-28', price: 62.50, volume: 1200 },
      { date: '2025-07-30', price: 63.20, volume: 1250 },
      { date: '2025-08-02', price: 64.10, volume: 1180 },
      { date: '2025-08-05', price: 65.30, volume: 1350 },
      { date: '2025-08-08', price: 66.80, volume: 1420 },
      { date: '2025-08-12', price: 67.90, volume: 1380 },
      { date: '2025-08-15', price: 68.20, volume: 1450 },
      { date: '2025-08-18', price: 69.10, volume: 1500 },
      { date: '2025-08-22', price: 68.80, volume: 1480 },
      { date: '2025-08-25', price: 69.50, volume: 1450 },
      { date: '2025-08-28', price: 70.20, volume: 1520 },
      { date: '2025-08-31', price: 71.10, volume: 1480 },
      { date: '2025-09-03', price: 72.50, volume: 1550 },
      { date: '2025-09-06', price: 73.20, volume: 1620 },
      { date: '2025-09-09', price: 74.80, volume: 1580 },
      { date: '2025-09-12', price: 75.50, volume: 1650 },
      { date: '2025-09-15', price: 76.20, volume: 1700 },
      { date: '2025-09-18', price: 75.80, volume: 1680 },
      { date: '2025-09-21', price: 74.40, volume: 1600 },
      { date: '2025-09-24', price: 73.60, volume: 1550 }
    ],
    lentil: [
      { date: '2025-07-28', price: 55.50, volume: 1000 },
      { date: '2025-07-30', price: 56.20, volume: 1050 },
      { date: '2025-08-02', price: 57.10, volume: 980 },
      { date: '2025-08-05', price: 58.30, volume: 1150 },
      { date: '2025-08-08', price: 59.80, volume: 1220 },
      { date: '2025-08-12', price: 60.90, volume: 1180 },
      { date: '2025-08-15', price: 61.20, volume: 1250 },
      { date: '2025-08-18', price: 62.10, volume: 1300 },
      { date: '2025-08-22', price: 61.80, volume: 1280 },
      { date: '2025-08-25', price: 62.50, volume: 1250 },
      { date: '2025-08-28', price: 63.20, volume: 1320 },
      { date: '2025-08-31', price: 64.10, volume: 1280 },
      { date: '2025-09-03', price: 65.50, volume: 1350 },
      { date: '2025-09-06', price: 66.20, volume: 1420 },
      { date: '2025-09-09', price: 67.80, volume: 1380 },
      { date: '2025-09-12', price: 68.50, volume: 1450 },
      { date: '2025-09-15', price: 69.20, volume: 1500 },
      { date: '2025-09-18', price: 68.80, volume: 1480 },
      { date: '2025-09-21', price: 67.40, volume: 1400 },
      { date: '2025-09-24', price: 66.60, volume: 1350 }
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
      const data = payload?.[0]?.payload;
      const priceChange = data?.priceChange || 0;
      const volume = data?.volume || 0;
      
      return (
        <div className="bg-surface p-4 rounded-xl border border-border shadow-warm-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-2">
            <div className="w-3 h-3 rounded-full bg-primary"></div>
            <p className="text-sm font-semibold text-text-primary">
              {formatDate(label)}
            </p>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {currentLanguage === 'am' ? 'ዋጋ፡' : 'Price:'}
              </span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(payload?.[0]?.value)} ETB
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {currentLanguage === 'am' ? 'መጠን፡' : 'Volume:'}
              </span>
              <span className="text-sm font-medium text-text-primary">
                {volume?.toLocaleString()} {currentLanguage === 'am' ? 'ቶን' : 'tons'}
              </span>
            </div>
            {priceChange !== 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">
                  {currentLanguage === 'am' ? 'ለውጥ፡' : 'Change:'}
                </span>
                <span className={`text-sm font-medium ${priceChange >= 0 ? 'text-success' : 'text-error'}`}>
                  {priceChange >= 0 ? '+' : ''}{priceChange.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
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
      <div className="h-96 w-full relative chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={currentData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.05}/>
              </linearGradient>
              <linearGradient id="volumeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--color-border)" 
              opacity={0.3}
              vertical={false}
            />
            <XAxis 
              dataKey="date" 
              tickFormatter={formatDate}
              stroke="var(--color-text-secondary)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <YAxis 
              tickFormatter={(value) => `${formatPrice(value)}`}
              stroke="var(--color-text-secondary)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="price"
              stroke="var(--color-primary)"
              strokeWidth={3}
              fill="url(#priceGradient)"
              dot={{ fill: 'var(--color-primary)', strokeWidth: 2, r: 5 }}
              activeDot={{ 
                r: 8, 
                fill: 'var(--color-primary)',
                stroke: 'white',
                strokeWidth: 3,
                style: { filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }
              }}
            />
            <ReferenceLine 
              y={currentData?.[0]?.price} 
              stroke="var(--color-text-secondary)" 
              strokeDasharray="2 2" 
              opacity={0.5}
              label={{ 
                value: currentLanguage === 'am' ? 'የመጀመሪያ ዋጋ' : 'Starting Price', 
                position: 'topRight',
                style: { fontSize: '12px', fill: 'var(--color-text-secondary)' }
              }}
            />
          </AreaChart>
        </ResponsiveContainer>
        
        {/* Chart overlay with stats */}
        <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm rounded-lg p-3 border border-border shadow-warm chart-overlay">
          <div className="text-xs text-text-secondary mb-1">
            {currentLanguage === 'am' ? 'አማካይ ዋጋ' : 'Average Price'}
          </div>
          <div className="text-lg font-bold text-primary">
            {formatPrice(currentData?.reduce((sum, item) => sum + item.price, 0) / currentData?.length || 0)} ETB
          </div>
        </div>
        
        {/* Price change indicator */}
        <div className="absolute top-4 left-4 bg-surface/90 backdrop-blur-sm rounded-lg p-3 border border-border shadow-warm chart-overlay">
          <div className="text-xs text-text-secondary mb-1">
            {currentLanguage === 'am' ? 'የዋጋ ለውጥ' : 'Price Change'}
          </div>
          <div className={`text-sm font-bold ${(currentData?.[currentData.length - 1]?.price - currentData?.[0]?.price) >= 0 ? 'text-success' : 'text-error'}`}>
            {(currentData?.[currentData.length - 1]?.price - currentData?.[0]?.price) >= 0 ? '+' : ''}
            {formatPrice(currentData?.[currentData.length - 1]?.price - currentData?.[0]?.price || 0)} ETB
          </div>
        </div>
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