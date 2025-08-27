import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MarketComparison = ({ currentLanguage = 'en' }) => {
  const [selectedCrop, setSelectedCrop] = useState('teff');

  const crops = [
    { value: 'teff', label: 'Teff', labelAm: 'ጤፍ' },
    { value: 'coffee', label: 'Coffee', labelAm: 'ቡና' },
    { value: 'maize', label: 'Maize', labelAm: 'በቆሎ' },
    { value: 'wheat', label: 'Wheat', labelAm: 'ስንዴ' }
  ];

  const marketData = {
    teff: [
      {
        region: 'Addis Ababa',
        regionAm: 'አዲስ አበባ',
        price: 85.50,
        change: 3.2,
        trend: 'up',
        volume: '2,450 tons',
        volumeAm: '2,450 ቶን',
        isHighest: true
      },
      {
        region: 'Oromia',
        regionAm: 'ኦሮሚያ',
        price: 82.30,
        change: 2.8,
        trend: 'up',
        volume: '3,200 tons',
        volumeAm: '3,200 ቶን',
        isHighest: false
      },
      {
        region: 'Amhara',
        regionAm: 'አማራ',
        price: 79.80,
        change: -1.5,
        trend: 'down',
        volume: '2,800 tons',
        volumeAm: '2,800 ቶን',
        isLowest: true
      },
      {
        region: 'SNNPR',
        regionAm: 'ደቡብ ብሔሮች',
        price: 81.20,
        change: 1.9,
        trend: 'up',
        volume: '1,950 tons',
        volumeAm: '1,950 ቶን',
        isHighest: false
      }
    ],
    coffee: [
      {
        region: 'Oromia',
        regionAm: 'ኦሮሚያ',
        price: 325.80,
        change: -2.1,
        trend: 'down',
        volume: '1,850 tons',
        volumeAm: '1,850 ቶን',
        isHighest: true
      },
      {
        region: 'SNNPR',
        regionAm: 'ደቡብ ብሔሮች',
        price: 318.50,
        change: -3.2,
        trend: 'down',
        volume: '2,100 tons',
        volumeAm: '2,100 ቶን',
        isHighest: false
      },
      {
        region: 'Sidama',
        regionAm: 'ሲዳማ',
        price: 312.40,
        change: -4.1,
        trend: 'down',
        volume: '1,650 tons',
        volumeAm: '1,650 ቶን',
        isLowest: true
      },
      {
        region: 'Addis Ababa',
        regionAm: 'አዲስ አበባ',
        price: 320.75,
        change: -2.8,
        trend: 'down',
        volume: '980 tons',
        volumeAm: '980 ቶን',
        isHighest: false
      }
    ]
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

  const currentData = marketData?.[selectedCrop] || marketData?.teff;
  const currentCrop = crops?.find(c => c?.value === selectedCrop);

  return (
    <div className="bg-surface p-4 lg:p-6 rounded-lg border border-border shadow-warm">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 space-y-4 lg:space-y-0">
        <div className="flex items-center space-x-2">
          <Icon name="BarChart2" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            {currentLanguage === 'am' ? 'የክልል ዋጋ ንፅፅር' : 'Regional Price Comparison'}
          </h3>
        </div>
        
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
      </div>
      <div className="mb-4">
        <h4 className="text-lg font-medium text-text-primary">
          {getLabel(currentCrop, 'label')} {currentLanguage === 'am' ? 'በተለያዩ ክልሎች' : 'Across Regions'}
        </h4>
        <p className="text-sm text-text-secondary">
          {currentLanguage === 'am' ? 'የዛሬ አማካይ ዋጋዎች' : 'Today\'s average prices'}
        </p>
      </div>
      <div className="space-y-3">
        {currentData?.map((market, index) => (
          <div 
            key={index}
            className={`p-4 rounded-lg border transition-smooth ${
              market?.isHighest 
                ? 'bg-success/5 border-success/20' 
                : market?.isLowest 
                ? 'bg-warning/5 border-warning/20' :'bg-muted border-border'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                  <Icon name="MapPin" size={18} className="text-primary" />
                </div>
                <div>
                  <h5 className="font-medium text-text-primary">
                    {getLabel(market, 'region')}
                  </h5>
                  <p className="text-sm text-text-secondary">
                    {currentLanguage === 'am' ? 'መጠን፡' : 'Volume:'} {getLabel(market, 'volume')}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="flex items-center space-x-2">
                  <span className="text-xl font-bold text-text-primary">
                    {formatPrice(market?.price)}
                  </span>
                  <span className="text-sm text-text-secondary">ETB</span>
                  
                  {market?.isHighest && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                      <Icon name="Crown" size={12} />
                      <span>{currentLanguage === 'am' ? 'ከፍተኛ' : 'Highest'}</span>
                    </div>
                  )}
                  
                  {market?.isLowest && (
                    <div className="flex items-center space-x-1 px-2 py-1 bg-warning/10 text-warning rounded-full text-xs font-medium">
                      <Icon name="TrendingDown" size={12} />
                      <span>{currentLanguage === 'am' ? 'ዝቅተኛ' : 'Lowest'}</span>
                    </div>
                  )}
                </div>
                
                <div className={`flex items-center space-x-1 text-sm ${
                  market?.trend === 'up' ? 'text-success' : 'text-error'
                }`}>
                  <Icon 
                    name={market?.trend === 'up' ? 'TrendingUp' : 'TrendingDown'} 
                    size={14} 
                  />
                  <span>
                    {market?.trend === 'up' ? '+' : ''}{market?.change}%
                  </span>
                  <span className="text-text-secondary">
                    {currentLanguage === 'am' ? 'ከዚህ ሳምንት' : 'vs last week'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
        <div className="flex items-start space-x-3">
          <Icon name="Lightbulb" size={20} className="text-primary mt-0.5" />
          <div>
            <h6 className="font-medium text-text-primary mb-1">
              {currentLanguage === 'am' ? 'የገበያ ምክር' : 'Market Insight'}
            </h6>
            <p className="text-sm text-text-secondary">
              {currentLanguage === 'am' 
                ? `${getLabel(currentCrop, 'label')} በአዲስ አበባ ከፍተኛ ዋጋ አለው። ለሽያጭ ጥሩ ጊዜ ሊሆን ይችላል።`
                : `${getLabel(currentCrop, 'label')} prices are highest in Addis Ababa. Consider this for your selling strategy.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MarketComparison;