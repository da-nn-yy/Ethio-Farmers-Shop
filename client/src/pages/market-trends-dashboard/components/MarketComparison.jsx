import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const MarketComparison = ({ currentLanguage = 'en' }) => {
  const [selectedCrop, setSelectedCrop] = useState('teff');

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

  const marketData = {
    teff: [
      {
        region: 'Addis Ababa',
        regionAm: 'አዲስ አበባ',
        price: 98.50,
        change: 3.2,
        trend: 'up',
        volume: '2,650 tons',
        volumeAm: '2,650 ቶን',
        isHighest: true
      },
      {
        region: 'Oromia',
        regionAm: 'ኦሮሚያ',
        price: 94.30,
        change: 2.8,
        trend: 'up',
        volume: '3,200 tons',
        volumeAm: '3,200 ቶን',
        isHighest: false
      },
      {
        region: 'Amhara',
        regionAm: 'አማራ',
        price: 91.80,
        change: -1.5,
        trend: 'down',
        volume: '2,800 tons',
        volumeAm: '2,800 ቶን',
        isLowest: true
      },
      {
        region: 'SNNPR',
        regionAm: 'ደቡብ ብሔሮች',
        price: 93.20,
        change: 1.9,
        trend: 'up',
        volume: '1,950 tons',
        volumeAm: '1,950 ቶን',
        isHighest: false
      },
      {
        region: 'Tigray',
        regionAm: 'ትግራይ',
        price: 89.40,
        change: 0.8,
        trend: 'up',
        volume: '1,200 tons',
        volumeAm: '1,200 ቶን',
        isHighest: false
      }
    ],
    coffee: [
      {
        region: 'Oromia',
        regionAm: 'ኦሮሚያ',
        price: 285.80,
        change: -2.1,
        trend: 'down',
        volume: '1,850 tons',
        volumeAm: '1,850 ቶን',
        isHighest: true
      },
      {
        region: 'SNNPR',
        regionAm: 'ደቡብ ብሔሮች',
        price: 278.50,
        change: -3.2,
        trend: 'down',
        volume: '2,100 tons',
        volumeAm: '2,100 ቶን',
        isHighest: false
      },
      {
        region: 'Sidama',
        regionAm: 'ሲዳማ',
        price: 272.40,
        change: -4.1,
        trend: 'down',
        volume: '1,650 tons',
        volumeAm: '1,650 ቶን',
        isLowest: true
      },
      {
        region: 'Addis Ababa',
        regionAm: 'አዲስ አበባ',
        price: 280.75,
        change: -2.8,
        trend: 'down',
        volume: '980 tons',
        volumeAm: '980 ቶን',
        isHighest: false
      }
    ],
    maize: [
      {
        region: 'Oromia',
        regionAm: 'ኦሮሚያ',
        price: 42.20,
        change: 6.4,
        trend: 'up',
        volume: '3,200 tons',
        volumeAm: '3,200 ቶን',
        isHighest: true
      },
      {
        region: 'Amhara',
        regionAm: 'አማራ',
        price: 39.80,
        change: 5.2,
        trend: 'up',
        volume: '2,800 tons',
        volumeAm: '2,800 ቶን',
        isHighest: false
      },
      {
        region: 'SNNPR',
        regionAm: 'ደቡብ ብሔሮች',
        price: 38.50,
        change: 4.8,
        trend: 'up',
        volume: '2,100 tons',
        volumeAm: '2,100 ቶን',
        isHighest: false
      },
      {
        region: 'Addis Ababa',
        regionAm: 'አዲስ አበባ',
        price: 40.20,
        change: 5.8,
        trend: 'up',
        volume: '1,950 tons',
        volumeAm: '1,950 ቶን',
        isHighest: false
      },
      {
        region: 'Tigray',
        regionAm: 'ትግራይ',
        price: 37.60,
        change: 3.9,
        trend: 'up',
        volume: '1,200 tons',
        volumeAm: '1,200 ቶን',
        isLowest: true
      }
    ],
    wheat: [
      {
        region: 'Addis Ababa',
        regionAm: 'አዲስ አበባ',
        price: 56.20,
        change: 4.8,
        trend: 'up',
        volume: '1,950 tons',
        volumeAm: '1,950 ቶን',
        isHighest: true
      },
      {
        region: 'Amhara',
        regionAm: 'አማራ',
        price: 53.80,
        change: 3.5,
        trend: 'up',
        volume: '2,800 tons',
        volumeAm: '2,800 ቶን',
        isHighest: false
      },
      {
        region: 'Oromia',
        regionAm: 'ኦሮሚያ',
        price: 51.40,
        change: 2.9,
        trend: 'up',
        volume: '2,200 tons',
        volumeAm: '2,200 ቶን',
        isHighest: false
      },
      {
        region: 'Tigray',
        regionAm: 'ትግራይ',
        price: 49.60,
        change: 1.8,
        trend: 'up',
        volume: '1,100 tons',
        volumeAm: '1,100 ቶን',
        isLowest: true
      }
    ],
    barley: [
      {
        region: 'Tigray',
        regionAm: 'ትግራይ',
        price: 46.60,
        change: 2.1,
        trend: 'up',
        volume: '1,200 tons',
        volumeAm: '1,200 ቶን',
        isHighest: true
      },
      {
        region: 'Amhara',
        regionAm: 'አማራ',
        price: 44.20,
        change: 1.8,
        trend: 'up',
        volume: '1,800 tons',
        volumeAm: '1,800 ቶን',
        isHighest: false
      },
      {
        region: 'Oromia',
        regionAm: 'ኦሮሚያ',
        price: 42.80,
        change: 1.5,
        trend: 'up',
        volume: '1,500 tons',
        volumeAm: '1,500 ቶን',
        isHighest: false
      },
      {
        region: 'Addis Ababa',
        regionAm: 'አዲስ አበባ',
        price: 45.40,
        change: 2.3,
        trend: 'up',
        volume: '800 tons',
        volumeAm: '800 ቶን',
        isHighest: false
      }
    ],
    sorghum: [
      {
        region: 'SNNPR',
        regionAm: 'ደቡብ ብሔሮች',
        price: 36.60,
        change: 2.8,
        trend: 'up',
        volume: '980 tons',
        volumeAm: '980 ቶን',
        isHighest: true
      },
      {
        region: 'Oromia',
        regionAm: 'ኦሮሚያ',
        price: 34.20,
        change: 2.1,
        trend: 'up',
        volume: '1,200 tons',
        volumeAm: '1,200 ቶን',
        isHighest: false
      },
      {
        region: 'Amhara',
        regionAm: 'አማራ',
        price: 32.80,
        change: 1.5,
        trend: 'up',
        volume: '1,100 tons',
        volumeAm: '1,100 ቶን',
        isHighest: false
      },
      {
        region: 'Tigray',
        regionAm: 'ትግራይ',
        price: 31.40,
        change: 0.9,
        trend: 'up',
        volume: '750 tons',
        volumeAm: '750 ቶን',
        isLowest: true
      }
    ],
    chickpea: [
      {
        region: 'Harari',
        regionAm: 'ሀረሪ',
        price: 73.60,
        change: 1.9,
        trend: 'up',
        volume: '750 tons',
        volumeAm: '750 ቶን',
        isHighest: true
      },
      {
        region: 'Dire Dawa',
        regionAm: 'ድሬ ዳዋ',
        price: 71.20,
        change: 1.5,
        trend: 'up',
        volume: '650 tons',
        volumeAm: '650 ቶን',
        isHighest: false
      },
      {
        region: 'Oromia',
        regionAm: 'ኦሮሚያ',
        price: 69.80,
        change: 1.2,
        trend: 'up',
        volume: '1,100 tons',
        volumeAm: '1,100 ቶን',
        isHighest: false
      },
      {
        region: 'Amhara',
        regionAm: 'አማራ',
        price: 67.40,
        change: 0.8,
        trend: 'up',
        volume: '900 tons',
        volumeAm: '900 ቶን',
        isLowest: true
      }
    ],
    lentil: [
      {
        region: 'Dire Dawa',
        regionAm: 'ድሬ ዳዋ',
        price: 66.60,
        change: 3.4,
        trend: 'up',
        volume: '650 tons',
        volumeAm: '650 ቶን',
        isHighest: true
      },
      {
        region: 'Harari',
        regionAm: 'ሀረሪ',
        price: 64.20,
        change: 2.8,
        trend: 'up',
        volume: '580 tons',
        volumeAm: '580 ቶን',
        isHighest: false
      },
      {
        region: 'Oromia',
        regionAm: 'ኦሮሚያ',
        price: 62.80,
        change: 2.1,
        trend: 'up',
        volume: '950 tons',
        volumeAm: '950 ቶን',
        isHighest: false
      },
      {
        region: 'Amhara',
        regionAm: 'አማራ',
        price: 60.40,
        change: 1.5,
        trend: 'up',
        volume: '800 tons',
        volumeAm: '800 ቶን',
        isLowest: true
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