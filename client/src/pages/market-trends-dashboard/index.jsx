import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import AuthenticatedLayout from '../../components/ui/AuthenticatedLayout.jsx';
import LocationSelector from './components/LocationSelector';
import PriceOverviewCard from './components/PriceOverviewCard';
import PriceChart from './components/PriceChart';
import MarketComparison from './components/MarketComparison';
import SeasonalInsights from './components/SeasonalInsights';
import PopularProduce from './components/PopularProduce';
import PriceAlerts from './components/PriceAlerts';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import { useLanguage } from '../../hooks/useLanguage.jsx';

const MarketTrendsDashboard = () => {
  const { language } = useLanguage();
  const [currentLanguage, setCurrentLanguage] = useState('en');
  const [selectedLocation, setSelectedLocation] = useState({
    region: 'addis-ababa',
    woreda: 'bole'
  });
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Load language preference from localStorage
  useEffect(() => {
    const savedLanguage = localStorage.getItem('farmconnect_language') || 'en';
    setCurrentLanguage(savedLanguage);
  }, []);

  useEffect(() => { if (language !== currentLanguage) setCurrentLanguage(language); }, [language]);

  // Handle language change
  const handleLanguageChange = (newLanguage) => {
    setCurrentLanguage(newLanguage);
    localStorage.setItem('farmconnect_language', newLanguage);
  };

  // Handle location change
  const handleLocationChange = (location) => {
    setSelectedLocation(location);
  };

  // Handle manual refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLastUpdated(new Date());
    setIsRefreshing(false);
  };

  // Format last updated time
  const formatLastUpdated = (date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now - date) / (1000 * 60));
    
    if (diffInMinutes < 1) {
      return currentLanguage === 'am' ? 'አሁን' : 'Just now';
    } else if (diffInMinutes < 60) {
      return currentLanguage === 'am' 
        ? `${diffInMinutes} ደቂቃ በፊት`
        : `${diffInMinutes} minutes ago`;
    } else {
      return date?.toLocaleTimeString(currentLanguage === 'am' ? 'am-ET' : 'en-US', {
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const pageTitle = currentLanguage === 'am' ? 'የገበያ አዝማሚያዎች ዳሽቦርድ' : 'Market Trends Dashboard';
  const pageDescription = currentLanguage === 'am' ?'የኢትዮጵያ የግብርና ምርቶች የገበያ ዋጋዎች፣ አዝማሚያዎች እና ትንተናዎች' :'Ethiopian agricultural market prices, trends and insights for informed farming decisions';

  return (
    <AuthenticatedLayout>
      <Helmet>
        <title>{pageTitle} - Ke geberew Ethiopia</title>
        <meta name="description" content={pageDescription} />
        <meta name="keywords" content="Ethiopia, agriculture, market prices, farming, trends, teff, coffee, maize" />
        <meta property="og:title" content={`${pageTitle} - Ke geberew Ethiopia`} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
      </Helmet>

      {/* Main Content */}
      <main className="pb-8">
        <div className="max-w-7xl mx-auto px-4 lg:px-6">
          {/* Page Header */}
          <div className="mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-text-primary mb-2">
                  {pageTitle}
                </h1>
                <p className="text-text-secondary">
                  {currentLanguage === 'am' ?'የኢትዮጵያ የግብርና ምርቶች የገበያ መረጃ እና ትንተና' :'Real-time market intelligence for Ethiopian agricultural products'
                  }
                </p>
              </div>

              <div className="flex items-center space-x-4">
                <div className="text-sm text-text-secondary">
                  {currentLanguage === 'am' ? 'ለመጨረሻ ጊዜ የተዘመነ፡' : 'Last updated:'} {formatLastUpdated(lastUpdated)}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRefresh}
                  disabled={isRefreshing}
                  iconName={isRefreshing ? "Loader2" : "RefreshCw"}
                  iconPosition="left"
                  className={isRefreshing ? "animate-spin" : ""}
                >
                  {currentLanguage === 'am' ? 'አድስ' : 'Refresh'}
                </Button>
              </div>
            </div>
          </div>

          {/* Location Selector */}
          <div className="mb-8">
            <LocationSelector
              onLocationChange={handleLocationChange}
              currentLanguage={currentLanguage}
            />
          </div>

          {/* Price Overview */}
          <div className="mb-8">
            <PriceOverviewCard currentLanguage={currentLanguage} />
          </div>

          {/* Charts and Analysis - stacked */}
          <div className="grid grid-cols-1 gap-8 mb-8">
            <PriceChart currentLanguage={currentLanguage} />
            <MarketComparison currentLanguage={currentLanguage} />
          </div>

          {/* Seasonal Insights */}
          <div className="mb-8">
            <SeasonalInsights currentLanguage={currentLanguage} />
          </div>

          {/* Popular Produce and Price Alerts Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-8">
            <PopularProduce currentLanguage={currentLanguage} />
            <PriceAlerts currentLanguage={currentLanguage} />
          </div>

          {/* Market Summary Footer */}
          <div className="bg-surface p-6 rounded-lg border border-border shadow-warm">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Icon name="BarChart3" size={24} className="text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-text-primary mb-2">
                  {currentLanguage === 'am' ? 'የገበያ ማጠቃለያ' : 'Market Summary'}
                </h3>
                <p className="text-text-secondary mb-4">
                  {currentLanguage === 'am' ?'በዚህ ሳምንት የተመዘገቡ ዋና ዋና የገበያ እንቅስቃሴዎች እና አዝማሚያዎች፡' :'Key market movements and trends recorded this week:'
                  }
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Icon name="TrendingUp" size={16} className="text-success" />
                    <span className="text-text-secondary">
                      {currentLanguage === 'am' ? '3 ምርቶች ዋጋ ጨምሯል' : '3 crops increased in price'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="TrendingDown" size={16} className="text-error" />
                    <span className="text-text-secondary">
                      {currentLanguage === 'am' ? '2 ምርቶች ዋጋ ቀንሷል' : '2 crops decreased in price'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Icon name="Activity" size={16} className="text-primary" />
                    <span className="text-text-secondary">
                      {currentLanguage === 'am' ? '12,430 ቶን ተሸጧል' : '12,430 tons traded'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </AuthenticatedLayout>
  );
};

export default MarketTrendsDashboard;