
import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';

const MarketTrendsWidget = ({ currentLanguage = 'en' }) => {
  const [selectedProduce, setSelectedProduce] = useState('tomatoes');

  const marketData = {
    tomatoes: [
      { month: 'Jan', price: 45 },
      { month: 'Feb', price: 52 },
      { month: 'Mar', price: 48 },
      { month: 'Apr', price: 61 },
      { month: 'May', price: 55 },
      { month: 'Jun', price: 67 }
    ],
    onions: [
      { month: 'Jan', price: 32 },
      { month: 'Feb', price: 28 },
      { month: 'Mar', price: 35 },
      { month: 'Apr', price: 42 },
      { month: 'May', price: 38 },
      { month: 'Jun', price: 45 }
    ],
    potatoes: [
      { month: 'Jan', price: 25 },
      { month: 'Feb', price: 30 },
      { month: 'Mar', price: 28 },
      { month: 'Apr', price: 35 },
      { month: 'May', price: 32 },
      { month: 'Jun', price: 38 }
    ]
  };

  const produceOptions = [
    { value: 'tomatoes', label: currentLanguage === 'en' ? 'Tomatoes' : 'ቲማቲም' },
    { value: 'onions', label: currentLanguage === 'en' ? 'Onions' : 'ሽንኩርት' },
    { value: 'potatoes', label: currentLanguage === 'en' ? 'Potatoes' : 'ድንች' }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-text-primary">
          {currentLanguage === 'en' ? 'Market Trends' : 'የገበያ አዝማሚያዎች'}
        </h3>
        <select
          value={selectedProduce}
          onChange={(e) => setSelectedProduce(e.target.value)}
          className="text-sm border border-border rounded px-2 py-1 bg-background"
        >
          {produceOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="h-48 mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={marketData[selectedProduce]}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="price" stroke="#059669" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
      
      <div className="flex items-center justify-between text-sm">
        <span className="text-text-secondary">
          {currentLanguage === 'en' ? 'Price per kg (ETB)' : 'በኪሎ ግራም ዋጋ (ብር)'}
        </span>
        <div className="flex items-center space-x-1 text-green-600">
          <Icon name="TrendingUp" className="w-4 h-4" />
          <span className="font-medium">+12.5%</span>
        </div>
      </div>
    </div>
  );
};

export default MarketTrendsWidget;
