import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const SeasonalInsights = ({ currentLanguage = 'en' }) => {
  const [selectedCrop, setSelectedCrop] = useState('teff');

  const crops = [
    { value: 'teff', label: 'Teff', labelAm: 'ጤፍ' },
    { value: 'coffee', label: 'Coffee', labelAm: 'ቡና' },
    { value: 'maize', label: 'Maize', labelAm: 'በቆሎ' }
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload?.length) {
      const data = payload?.[0]?.payload;
      return (
        <div className="bg-surface p-3 rounded-lg border border-border shadow-warm-md">
          <p className="text-sm font-medium text-text-primary mb-1">
            {getLabel(data, 'month')}
          </p>
          <p className="text-sm text-primary">
            {currentLanguage === 'am' ? 'አማካይ ዋጋ፡' : 'Avg Price:'} {formatPrice(payload?.[0]?.value)} ETB
          </p>
          <p className="text-xs text-text-secondary">
            {currentLanguage === 'am' ? 'ወቅት፡' : 'Season:'} {getLabel(data, 'season')}
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
      <div className="h-80 w-full mb-6">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={currentData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
            <XAxis 
              dataKey={currentLanguage === 'am' ? 'monthAm' : 'month'}
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
            <YAxis 
              tickFormatter={(value) => `${formatPrice(value)}`}
              stroke="var(--color-text-secondary)"
              fontSize={12}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="avgPrice" 
              fill="var(--color-primary)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
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