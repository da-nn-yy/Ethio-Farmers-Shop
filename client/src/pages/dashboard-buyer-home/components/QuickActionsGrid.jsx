
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionsGrid = ({ currentLanguage = 'en' }) => {
  const navigate = useNavigate();

  const quickActions = [
    {
      id: 'browse-all',
      title: currentLanguage === 'en' ? 'Browse All Listings' : 'ሁሉንም ዝርዝሮች አስሳ',
      description: currentLanguage === 'en' ? 'Explore all available produce' : 'ሁሉንም የሚገኙ ምርቶች ያስሳሉ',
      icon: 'Search',
      color: 'bg-blue-500',
      action: () => navigate('/browse-listings-buyer-home')
    },
    {
      id: 'market-trends',
      title: currentLanguage === 'en' ? 'Market Trends' : 'የገበያ አዝማሚያዎች',
      description: currentLanguage === 'en' ? 'View price trends & analytics' : 'የዋጋ አዝማሚያዎችን እና ትንታኔዎችን ይመልከቱ',
      icon: 'TrendingUp',
      color: 'bg-green-500',
      action: () => navigate('/market-trends-dashboard')
    },
    {
      id: 'orders',
      title: currentLanguage === 'en' ? 'My Orders' : 'የእኔ ትዕዛዞች',
      description: currentLanguage === 'en' ? 'Track your orders & deliveries' : 'ትዕዛዞችዎን እና ማድረሻዎችን ይከታተሉ',
      icon: 'ShoppingBag',
      color: 'bg-purple-500',
      action: () => navigate('/order-management')
    },
    {
      id: 'profile',
      title: currentLanguage === 'en' ? 'Profile Settings' : 'የመገለጫ ቅንብሮች',
      description: currentLanguage === 'en' ? 'Update your buyer profile' : 'የገዢ መገለጫዎን ያዘምኑ',
      icon: 'User',
      color: 'bg-orange-500',
      action: () => navigate('/user-profile-management')
    }
  ];

  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">
        {currentLanguage === 'en' ? 'Quick Actions' : 'ፈጣን እርምጃዎች'}
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {quickActions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className="p-4 border border-border rounded-lg hover:shadow-md transition-all hover:border-primary group"
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${action.color} text-white group-hover:scale-110 transition-transform`}>
                <Icon name={action.icon} className="w-5 h-5" />
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-medium text-text-primary group-hover:text-primary transition-colors">
                  {action.title}
                </h4>
                <p className="text-sm text-text-secondary mt-1">
                  {action.description}
                </p>
              </div>
              <Icon name="ChevronRight" className="w-4 h-4 text-text-secondary group-hover:text-primary transition-colors" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default QuickActionsGrid;
