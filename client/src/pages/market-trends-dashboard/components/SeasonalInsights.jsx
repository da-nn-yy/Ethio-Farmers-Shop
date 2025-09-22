import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SeasonalInsights = ({ currentLanguage = 'en' }) => {
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

  const seasonalData = {
    teff: [
      { month: 'Jan', monthAm: 'ጃንዩ', avgPrice: 78.50, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Feb', monthAm: 'ፌብሩ', avgPrice: 79.20, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Mar', monthAm: 'ማርች', avgPrice: 82.10, season: 'post-harvest', seasonAm: 'ከመከር በኋላ' },
      { month: 'Apr', monthAm: 'ኤፕሪ', avgPrice: 85.30, season: 'planting', seasonAm: 'መዝራት' },
      { month: 'May', monthAm: 'ሜይ', avgPrice: 88.80, season: 'planting', seasonAm: 'መዝራት' },
      { month: 'Jun', monthAm: 'ጁን', avgPrice: 92.20, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Jul', monthAm: 'ጁላይ', avgPrice: 95.10, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Aug', monthAm: 'ኦገስ', avgPrice: 93.80, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Sep', monthAm: 'ሴፕቴ', avgPrice: 89.50, season: 'pre-harvest', seasonAm: 'ከመከር በፊት' },
      { month: 'Oct', monthAm: 'ኦክቶ', avgPrice: 85.20, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Nov', monthAm: 'ኖቬም', avgPrice: 81.40, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Dec', monthAm: 'ዲሴም', avgPrice: 79.90, season: 'harvest', seasonAm: 'መከር' }
    ],
    coffee: [
      { month: 'Jan', monthAm: 'ጃንዩ', avgPrice: 310.50, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Feb', monthAm: 'ፌብሩ', avgPrice: 315.20, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Mar', monthAm: 'ማርች', avgPrice: 325.10, season: 'post-harvest', seasonAm: 'ከመከር በኋላ' },
      { month: 'Apr', monthAm: 'ኤፕሪ', avgPrice: 335.30, season: 'dry', seasonAm: 'ደረቅ' },
      { month: 'May', monthAm: 'ሜይ', avgPrice: 345.80, season: 'dry', seasonAm: 'ደረቅ' },
      { month: 'Jun', monthAm: 'ጁን', avgPrice: 355.20, season: 'rainy', seasonAm: 'ዝናብ' },
      { month: 'Jul', monthAm: 'ጁላይ', avgPrice: 360.10, season: 'rainy', seasonAm: 'ዝናብ' },
      { month: 'Aug', monthAm: 'ኦገስ', avgPrice: 358.80, season: 'rainy', seasonAm: 'ዝናብ' },
      { month: 'Sep', monthAm: 'ሴፕቴ', avgPrice: 350.50, season: 'pre-harvest', seasonAm: 'ከመከር በፊት' },
      { month: 'Oct', monthAm: 'ኦክቶ', avgPrice: 340.20, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Nov', monthAm: 'ኖቬም', avgPrice: 325.40, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Dec', monthAm: 'ዲሴም', avgPrice: 318.90, season: 'harvest', seasonAm: 'መከር' }
    ],
    maize: [
      { month: 'Jan', monthAm: 'ጃንዩ', avgPrice: 28.50, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Feb', monthAm: 'ፌብሩ', avgPrice: 29.20, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Mar', monthAm: 'ማርች', avgPrice: 31.10, season: 'post-harvest', seasonAm: 'ከመከር በኋላ' },
      { month: 'Apr', monthAm: 'ኤፕሪ', avgPrice: 33.30, season: 'planting', seasonAm: 'መዝራት' },
      { month: 'May', monthAm: 'ሜይ', avgPrice: 35.80, season: 'planting', seasonAm: 'መዝራት' },
      { month: 'Jun', monthAm: 'ጁን', avgPrice: 38.20, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Jul', monthAm: 'ጁላይ', avgPrice: 40.10, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Aug', monthAm: 'ኦገስ', avgPrice: 39.80, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Sep', monthAm: 'ሴፕቴ', avgPrice: 37.50, season: 'pre-harvest', seasonAm: 'ከመከር በፊት' },
      { month: 'Oct', monthAm: 'ኦክቶ', avgPrice: 35.20, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Nov', monthAm: 'ኖቬም', avgPrice: 32.40, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Dec', monthAm: 'ዲሴም', avgPrice: 30.90, season: 'harvest', seasonAm: 'መከር' }
    ],
    wheat: [
      { month: 'Jan', monthAm: 'ጃንዩ', avgPrice: 42.50, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Feb', monthAm: 'ፌብሩ', avgPrice: 43.20, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Mar', monthAm: 'ማርች', avgPrice: 45.10, season: 'post-harvest', seasonAm: 'ከመከር በኋላ' },
      { month: 'Apr', monthAm: 'ኤፕሪ', avgPrice: 47.30, season: 'planting', seasonAm: 'መዝራት' },
      { month: 'May', monthAm: 'ሜይ', avgPrice: 49.80, season: 'planting', seasonAm: 'መዝራት' },
      { month: 'Jun', monthAm: 'ጁን', avgPrice: 52.20, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Jul', monthAm: 'ጁላይ', avgPrice: 54.10, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Aug', monthAm: 'ኦገስ', avgPrice: 53.80, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Sep', monthAm: 'ሴፕቴ', avgPrice: 51.50, season: 'pre-harvest', seasonAm: 'ከመከር በፊት' },
      { month: 'Oct', monthAm: 'ኦክቶ', avgPrice: 49.20, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Nov', monthAm: 'ኖቬም', avgPrice: 46.40, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Dec', monthAm: 'ዲሴም', avgPrice: 44.90, season: 'harvest', seasonAm: 'መከር' }
    ],
    barley: [
      { month: 'Jan', monthAm: 'ጃንዩ', avgPrice: 35.50, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Feb', monthAm: 'ፌብሩ', avgPrice: 36.20, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Mar', monthAm: 'ማርች', avgPrice: 38.10, season: 'post-harvest', seasonAm: 'ከመከር በኋላ' },
      { month: 'Apr', monthAm: 'ኤፕሪ', avgPrice: 40.30, season: 'planting', seasonAm: 'መዝራት' },
      { month: 'May', monthAm: 'ሜይ', avgPrice: 42.80, season: 'planting', seasonAm: 'መዝራት' },
      { month: 'Jun', monthAm: 'ጁን', avgPrice: 45.20, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Jul', monthAm: 'ጁላይ', avgPrice: 47.10, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Aug', monthAm: 'ኦገስ', avgPrice: 46.80, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Sep', monthAm: 'ሴፕቴ', avgPrice: 44.50, season: 'pre-harvest', seasonAm: 'ከመከር በፊት' },
      { month: 'Oct', monthAm: 'ኦክቶ', avgPrice: 42.20, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Nov', monthAm: 'ኖቬም', avgPrice: 39.40, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Dec', monthAm: 'ዲሴም', avgPrice: 37.90, season: 'harvest', seasonAm: 'መከር' }
    ],
    sorghum: [
      { month: 'Jan', monthAm: 'ጃንዩ', avgPrice: 25.50, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Feb', monthAm: 'ፌብሩ', avgPrice: 26.20, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Mar', monthAm: 'ማርች', avgPrice: 28.10, season: 'post-harvest', seasonAm: 'ከመከር በኋላ' },
      { month: 'Apr', monthAm: 'ኤፕሪ', avgPrice: 30.30, season: 'planting', seasonAm: 'መዝራት' },
      { month: 'May', monthAm: 'ሜይ', avgPrice: 32.80, season: 'planting', seasonAm: 'መዝራት' },
      { month: 'Jun', monthAm: 'ጁን', avgPrice: 35.20, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Jul', monthAm: 'ጁላይ', avgPrice: 37.10, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Aug', monthAm: 'ኦገስ', avgPrice: 36.80, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Sep', monthAm: 'ሴፕቴ', avgPrice: 34.50, season: 'pre-harvest', seasonAm: 'ከመከር በፊት' },
      { month: 'Oct', monthAm: 'ኦክቶ', avgPrice: 32.20, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Nov', monthAm: 'ኖቬም', avgPrice: 29.40, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Dec', monthAm: 'ዲሴም', avgPrice: 27.90, season: 'harvest', seasonAm: 'መከር' }
    ],
    chickpea: [
      { month: 'Jan', monthAm: 'ጃንዩ', avgPrice: 62.50, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Feb', monthAm: 'ፌብሩ', avgPrice: 63.20, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Mar', monthAm: 'ማርች', avgPrice: 65.10, season: 'post-harvest', seasonAm: 'ከመከር በኋላ' },
      { month: 'Apr', monthAm: 'ኤፕሪ', avgPrice: 67.30, season: 'planting', seasonAm: 'መዝራት' },
      { month: 'May', monthAm: 'ሜይ', avgPrice: 69.80, season: 'planting', seasonAm: 'መዝራት' },
      { month: 'Jun', monthAm: 'ጁን', avgPrice: 72.20, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Jul', monthAm: 'ጁላይ', avgPrice: 74.10, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Aug', monthAm: 'ኦገስ', avgPrice: 73.80, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Sep', monthAm: 'ሴፕቴ', avgPrice: 71.50, season: 'pre-harvest', seasonAm: 'ከመከር በፊት' },
      { month: 'Oct', monthAm: 'ኦክቶ', avgPrice: 69.20, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Nov', monthAm: 'ኖቬም', avgPrice: 66.40, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Dec', monthAm: 'ዲሴም', avgPrice: 64.90, season: 'harvest', seasonAm: 'መከር' }
    ],
    lentil: [
      { month: 'Jan', monthAm: 'ጃንዩ', avgPrice: 55.50, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Feb', monthAm: 'ፌብሩ', avgPrice: 56.20, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Mar', monthAm: 'ማርች', avgPrice: 58.10, season: 'post-harvest', seasonAm: 'ከመከር በኋላ' },
      { month: 'Apr', monthAm: 'ኤፕሪ', avgPrice: 60.30, season: 'planting', seasonAm: 'መዝራት' },
      { month: 'May', monthAm: 'ሜይ', avgPrice: 62.80, season: 'planting', seasonAm: 'መዝራት' },
      { month: 'Jun', monthAm: 'ጁን', avgPrice: 65.20, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Jul', monthAm: 'ጁላይ', avgPrice: 67.10, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Aug', monthAm: 'ኦገስ', avgPrice: 66.80, season: 'growing', seasonAm: 'እድገት' },
      { month: 'Sep', monthAm: 'ሴፕቴ', avgPrice: 64.50, season: 'pre-harvest', seasonAm: 'ከመከር በፊት' },
      { month: 'Oct', monthAm: 'ኦክቶ', avgPrice: 62.20, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Nov', monthAm: 'ኖቬም', avgPrice: 59.40, season: 'harvest', seasonAm: 'መከር' },
      { month: 'Dec', monthAm: 'ዲሴም', avgPrice: 57.90, season: 'harvest', seasonAm: 'መከር' }
    ]
  };

  const insights = {
    teff: {
      bestSelling: { months: ['Jul', 'Aug'], monthsAm: ['ጁላይ', 'ኦገስ'] },
      bestBuying: { months: ['Jan', 'Feb'], monthsAm: ['ጃንዩ', 'ፌብሩ'] },
      peak: 'July',
      peakAm: 'ጁላይ',
      low: 'January',
      lowAm: 'ጃንዩ'
    },
    coffee: {
      bestSelling: { months: ['Jul', 'Aug'], monthsAm: ['ጁላይ', 'ኦገስ'] },
      bestBuying: { months: ['Dec', 'Jan'], monthsAm: ['ዲሴም', 'ጃንዩ'] },
      peak: 'July',
      peakAm: 'ጁላይ',
      low: 'December',
      lowAm: 'ዲሴም'
    },
    maize: {
      bestSelling: { months: ['Jul', 'Aug'], monthsAm: ['ጁላይ', 'ኦገስ'] },
      bestBuying: { months: ['Jan', 'Feb'], monthsAm: ['ጃንዩ', 'ፌብሩ'] },
      peak: 'July',
      peakAm: 'ጁላይ',
      low: 'January',
      lowAm: 'ጃንዩ'
    },
    wheat: {
      bestSelling: { months: ['Jul', 'Aug'], monthsAm: ['ጁላይ', 'ኦገስ'] },
      bestBuying: { months: ['Jan', 'Feb'], monthsAm: ['ጃንዩ', 'ፌብሩ'] },
      peak: 'July',
      peakAm: 'ጁላይ',
      low: 'January',
      lowAm: 'ጃንዩ'
    },
    barley: {
      bestSelling: { months: ['Jul', 'Aug'], monthsAm: ['ጁላይ', 'ኦገስ'] },
      bestBuying: { months: ['Jan', 'Feb'], monthsAm: ['ጃንዩ', 'ፌብሩ'] },
      peak: 'July',
      peakAm: 'ጁላይ',
      low: 'January',
      lowAm: 'ጃንዩ'
    },
    sorghum: {
      bestSelling: { months: ['Jul', 'Aug'], monthsAm: ['ጁላይ', 'ኦገስ'] },
      bestBuying: { months: ['Jan', 'Feb'], monthsAm: ['ጃንዩ', 'ፌብሩ'] },
      peak: 'July',
      peakAm: 'ጁላይ',
      low: 'January',
      lowAm: 'ጃንዩ'
    },
    chickpea: {
      bestSelling: { months: ['Jul', 'Aug'], monthsAm: ['ጁላይ', 'ኦገስ'] },
      bestBuying: { months: ['Jan', 'Feb'], monthsAm: ['ጃንዩ', 'ፌብሩ'] },
      peak: 'July',
      peakAm: 'ጁላይ',
      low: 'January',
      lowAm: 'ጃንዩ'
    },
    lentil: {
      bestSelling: { months: ['Jul', 'Aug'], monthsAm: ['ጁላይ', 'ኦገስ'] },
      bestBuying: { months: ['Jan', 'Feb'], monthsAm: ['ጃንዩ', 'ፌብሩ'] },
      peak: 'July',
      peakAm: 'ጁላይ',
      low: 'January',
      lowAm: 'ጃንዩ'
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    })?.format(price);
  };

  const getLabel = (item, field) => {
    return currentLanguage === 'am' && item?.[`${field}Am`] ? item?.[`${field}Am`] : item?.[field];
  };

  const currentData = seasonalData?.[selectedCrop] || seasonalData?.teff;
  const currentCrop = crops?.find(c => c?.value === selectedCrop);
  const currentInsights = insights?.[selectedCrop] || insights?.teff;

  // Add peak and low indicators to data
  const enhancedData = currentData?.map((item, index) => {
    const prices = currentData?.map(d => d.avgPrice);
    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);
    
    return {
      ...item,
      isPeak: item.avgPrice === maxPrice,
      isLow: item.avgPrice === minPrice,
      priceChange: index > 0 ? ((item.avgPrice - currentData[index - 1].avgPrice) / currentData[index - 1].avgPrice) * 100 : 0
    };
  });

  // Color function for bars
  const getBarColor = (entry) => {
    if (entry.isPeak) return '#10B981'; // success color
    if (entry.isLow) return '#F59E0B'; // warning color
    return '#3B82F6'; // primary color
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      const isPeak = data?.isPeak;
      const isLow = data?.isLow;
      
      return (
        <div className="bg-surface p-4 rounded-xl border border-border shadow-warm-lg backdrop-blur-sm">
          <div className="flex items-center space-x-2 mb-3">
            <div className={`w-3 h-3 rounded-full ${isPeak ? 'bg-success' : isLow ? 'bg-warning' : 'bg-primary'}`}></div>
            <p className="text-sm font-semibold text-text-primary">
              {getLabel(data, 'month')}
            </p>
            {isPeak && (
              <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full font-medium">
                {currentLanguage === 'am' ? 'ከፍተኛ' : 'Peak'}
              </span>
            )}
            {isLow && (
              <span className="px-2 py-1 bg-warning/10 text-warning text-xs rounded-full font-medium">
                {currentLanguage === 'am' ? 'ዝቅተኛ' : 'Low'}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {currentLanguage === 'am' ? 'አማካይ ዋጋ፡' : 'Avg Price:'}
              </span>
              <span className="text-lg font-bold text-primary">
                {formatPrice(payload?.[0]?.value)} ETB
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-text-secondary">
                {currentLanguage === 'am' ? 'ወቅት፡' : 'Season:'}
              </span>
              <span className="text-sm font-medium text-text-primary">
                {getLabel(data, 'season')}
              </span>
            </div>
            <div className="pt-2 border-t border-border">
              <div className="text-xs text-text-secondary">
                {currentLanguage === 'am' ? 'የገበያ ምክር፡' : 'Market Tip:'}
              </div>
              <div className="text-xs text-text-primary mt-1">
                {isPeak ? 
                  (currentLanguage === 'am' ? 'ለሽያጭ ጥሩ ጊዜ' : 'Best time to sell') :
                  isLow ? 
                  (currentLanguage === 'am' ? 'ለግዢ ጥሩ ጊዜ' : 'Best time to buy') :
                  (currentLanguage === 'am' ? 'መካከለኛ ዋጋ' : 'Moderate pricing')
                }
              </div>
            </div>
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
          <Icon name="Calendar" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            {currentLanguage === 'am' ? 'የወቅት ግንዛቤዎች' : 'Seasonal Insights'}
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
      <div className="mb-6">
        <h4 className="text-lg font-medium text-text-primary mb-2">
          {getLabel(currentCrop, 'label')} {currentLanguage === 'am' ? 'አመታዊ ዋጋ ንድፍ' : 'Annual Price Pattern'}
        </h4>
        <p className="text-sm text-text-secondary">
          {currentLanguage === 'am' ? 'ባለፉት 3 አመታት አማካይ' : 'Average over the last 3 years'}
        </p>
      </div>
      <div className="h-96 w-full mb-6 relative chart-container">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={enhancedData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
            <defs>
              <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0.4}/>
              </linearGradient>
              <linearGradient id="peakGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#10B981" stopOpacity={0.4}/>
              </linearGradient>
              <linearGradient id="lowGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.8}/>
                <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.4}/>
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="var(--color-border)" 
              opacity={0.3}
              horizontal={false}
            />
            <XAxis 
              dataKey={currentLanguage === 'am' ? 'monthAm' : 'month'}
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
            <Bar 
              dataKey="avgPrice" 
              radius={[6, 6, 0, 0]}
              strokeWidth={0}
            >
              {enhancedData?.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={
                    entry.isPeak ? 'url(#peakGradient)' : 
                    entry.isLow ? 'url(#lowGradient)' : 
                    'url(#barGradient)'
                  }
                />
              ))}
            </Bar>
            <ReferenceLine 
              y={enhancedData?.reduce((sum, item) => sum + item.avgPrice, 0) / enhancedData?.length} 
              stroke="var(--color-text-secondary)" 
              strokeDasharray="2 2" 
              opacity={0.5}
              label={{ 
                value: currentLanguage === 'am' ? 'አማካይ' : 'Average', 
                position: 'topRight',
                style: { fontSize: '12px', fill: 'var(--color-text-secondary)' }
              }}
            />
          </BarChart>
        </ResponsiveContainer>
        
        {/* Chart overlay with peak/low indicators */}
        <div className="absolute top-4 right-4 bg-surface/90 backdrop-blur-sm rounded-lg p-3 border border-border shadow-warm chart-overlay">
          <div className="text-xs text-text-secondary mb-2">
            {currentLanguage === 'am' ? 'የወቅት ማጠቃለያ' : 'Seasonal Summary'}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-success"></div>
              <span className="text-xs text-text-primary">
                {currentLanguage === 'am' ? 'ከፍተኛ፡' : 'Peak:'} {formatPrice(Math.max(...enhancedData?.map(d => d.avgPrice) || [0]))} ETB
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 rounded-full bg-warning"></div>
              <span className="text-xs text-text-primary">
                {currentLanguage === 'am' ? 'ዝቅተኛ፡' : 'Low:'} {formatPrice(Math.min(...enhancedData?.map(d => d.avgPrice) || [0]))} ETB
              </span>
            </div>
          </div>
        </div>
        
        {/* Price range indicator */}
        <div className="absolute bottom-4 left-4 bg-surface/90 backdrop-blur-sm rounded-lg p-3 border border-border shadow-warm chart-overlay">
          <div className="text-xs text-text-secondary mb-1">
            {currentLanguage === 'am' ? 'የዋጋ ክልል' : 'Price Range'}
          </div>
          <div className="text-sm font-bold text-primary">
            {formatPrice(Math.min(...enhancedData?.map(d => d.avgPrice) || [0]))} - {formatPrice(Math.max(...enhancedData?.map(d => d.avgPrice) || [0]))} ETB
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="p-4 bg-success/5 rounded-lg border border-success/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="TrendingUp" size={18} className="text-success" />
            <h5 className="font-medium text-success">
              {currentLanguage === 'am' ? 'ለሽያጭ ምርጥ ጊዜ' : 'Best Time to Sell'}
            </h5>
          </div>
          <p className="text-sm text-text-secondary mb-2">
            {currentLanguage === 'am' 
              ? `${currentInsights?.bestSelling?.monthsAm?.join(', ')} - ከፍተኛ ዋጋዎች`
              : `${currentInsights?.bestSelling?.months?.join(', ')} - Peak prices`
            }
          </p>
          <p className="text-xs text-text-secondary">
            {currentLanguage === 'am' ?'በዚህ ወቅት ዋጋዎች በጣም ከፍተኛ ናቸው' :'Prices are typically highest during this period'
            }
          </p>
        </div>

        <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-center space-x-2 mb-2">
            <Icon name="ShoppingCart" size={18} className="text-primary" />
            <h5 className="font-medium text-primary">
              {currentLanguage === 'am' ? 'ለግዢ ምርጥ ጊዜ' : 'Best Time to Buy'}
            </h5>
          </div>
          <p className="text-sm text-text-secondary mb-2">
            {currentLanguage === 'am' 
              ? `${currentInsights?.bestBuying?.monthsAm?.join(', ')} - ዝቅተኛ ዋጋዎች`
              : `${currentInsights?.bestBuying?.months?.join(', ')} - Lowest prices`
            }
          </p>
          <p className="text-xs text-text-secondary">
            {currentLanguage === 'am' ?'በዚህ ወቅት ዋጋዎች በጣም ዝቅተኛ ናቸው' :'Prices are typically lowest during this period'
            }
          </p>
        </div>
      </div>
      <div className="mt-4 p-4 bg-muted rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="Info" size={20} className="text-primary mt-0.5" />
          <div>
            <h6 className="font-medium text-text-primary mb-1">
              {currentLanguage === 'am' ? 'የወቅት ምክር' : 'Seasonal Tip'}
            </h6>
            <p className="text-sm text-text-secondary">
              {currentLanguage === 'am' 
                ? `${getLabel(currentCrop, 'label')} ዋጋዎች በ${currentInsights?.peakAm} ወር ከፍተኛ ሲሆን በ${currentInsights?.lowAm} ወር ዝቅተኛ ናቸው። የእርስዎን የሽያጭ ስትራቴጂ በዚህ መሰረት ያቅዱ።`
                : `${getLabel(currentCrop, 'label')} prices peak in ${currentInsights?.peak} and are lowest in ${currentInsights?.low}. Plan your selling strategy accordingly.`
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SeasonalInsights;