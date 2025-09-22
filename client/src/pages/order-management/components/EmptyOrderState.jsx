import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const EmptyOrderState = ({ 
  activeTab, 
  onCreateListing,
  currentLanguage = 'en' 
}) => {
  const getEmptyStateContent = () => {
    switch (activeTab) {
      case 'pending':
        return {
          icon: 'Clock',
          title: currentLanguage === 'am' ? 'በመጠባበቅ ላይ ያሉ ትዕዛዞች የሉም' : 'No Pending Orders',
          description: currentLanguage === 'am' ? 'አዲስ ትዕዛዞች ሲመጡ እዚህ ይታያሉ። ለግዛት አሁን ዝርዝሮችን ይመልከቱ።' : 'New orders will show up here. Browse listings to start buying now.',
          actionText: currentLanguage === 'am' ? 'ዝርዝሮችን ይመልከቱ' : 'Browse Listings'
        };
      case 'confirmed':
        return {
          icon: 'CheckCircle',
          title: currentLanguage === 'am' ? 'የተረጋገጡ ትዕዛዞች የሉም' : 'No Confirmed Orders',
          description: currentLanguage === 'am' ?'የተቀበሏቸው ትዕዛዞች እዚህ ይታያሉ። ትዕዛዞችን ለመቀበል በመጠባበቅ ላይ ያሉትን ይመልከቱ።' :'Orders you have accepted will appear here. Check pending orders to accept new requests.',
          actionText: currentLanguage === 'am' ? 'በመጠባበቅ ላይ ያሉትን ይመልከቱ' : 'View Pending'
        };
      case 'completed':
        return {
          icon: 'CheckCircle2',
          title: currentLanguage === 'am' ? 'የተጠናቀቁ ትዕዛዞች የሉም' : 'No Completed Orders',
          description: currentLanguage === 'am' ? 'የተጠናቀቁ ትዕዛዞች እዚህ ይታያሉ። አዲስ ግዛት ለመጀምር ዝርዝሮችን ይመልከቱ።' : 'Completed orders will appear here. Browse listings to place your first order.',
          actionText: currentLanguage === 'am' ? 'ዝርዝሮችን ይመልከቱ' : 'Browse Listings'
        };
      case 'cancelled':
        return {
          icon: 'XCircle',
          title: currentLanguage === 'am' ? 'የተሰረዙ ትዕዛዞች የሉም' : 'No Cancelled Orders',
          description: currentLanguage === 'am' ?'የተሰረዙ ትዕዛዞች እዚህ ይታያሉ። ይህ ጥሩ ነገር ነው!' :'Cancelled orders will appear here. This is a good thing!',
          actionText: null
        };
      default:
        return {
          icon: 'ShoppingBag',
          title: currentLanguage === 'am' ? 'ትዕዛዞች የሉም' : 'No Orders Yet',
          description: currentLanguage === 'am' ? 'እርስዎ ገና ትዕዛዝ አልሰጡም። ለመጀመር ዝርዝሮችን ይመልከቱ።' : "You haven't placed any orders yet. Browse listings to get started.",
          actionText: currentLanguage === 'am' ? 'ዝርዝሮችን ይመልከቱ' : 'Browse Listings'
        };
    }
  };

  const content = getEmptyStateContent();

  const handleAction = () => {
    if (activeTab === 'confirmed') {
      // Switch to pending tab
      return;
    }
    onCreateListing();
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-6">
        <Icon name={content?.icon} size={48} className="text-text-secondary" />
      </div>
      <h3 className="text-xl font-semibold text-text-primary mb-3 text-center">
        {content?.title}
      </h3>
      <p className="text-text-secondary text-center max-w-md mb-8 leading-relaxed">
        {content?.description}
      </p>
      {content?.actionText && (
        <Button
          variant="default"
          onClick={handleAction}
          iconName="Plus"
          iconPosition="left"
        >
          {content?.actionText}
        </Button>
      )}
      {/* Tips removed on buyer side per request */}
    </div>
  );
};

export default EmptyOrderState;