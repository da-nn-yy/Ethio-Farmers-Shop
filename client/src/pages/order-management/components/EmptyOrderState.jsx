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
          description: currentLanguage === 'am' ?'አዲስ ትዕዛዞች ሲመጡ እዚህ ይታያሉ። የእርስዎን ምርቶች ለመሸጥ ዝርዝር ይፍጠሩ።' :'New orders will appear here when buyers place them. Create listings to start selling your produce.',
          actionText: currentLanguage === 'am' ? 'ዝርዝር ይፍጠሩ' : 'Create Listing'
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
          description: currentLanguage === 'am' ?'የተጠናቀቁ ትዕዛዞች እዚህ ይታያሉ። የመጀመሪያ ትዕዛዝዎን ለማጠናቀቅ ዝርዝር ይፍጠሩ።' :'Completed orders will appear here. Create listings to complete your first order.',
          actionText: currentLanguage === 'am' ? 'ዝርዝር ይፍጠሩ' : 'Create Listing'
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
          description: currentLanguage === 'am' ?'ገዢዎች ትዕዛዝ ሲያደርጉ እዚህ ይታያሉ። የእርስዎን ምርቶች ለመሸጥ ዝርዝር ይፍጠሩ።' :'Orders from buyers will appear here. Create listings to start selling your produce.',
          actionText: currentLanguage === 'am' ? 'ዝርዝር ይፍጠሩ' : 'Create Listing'
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
      {/* Additional Tips */}
      <div className="mt-12 max-w-lg">
        <h4 className="text-sm font-medium text-text-primary mb-3 text-center">
          {currentLanguage === 'am' ? 'ምክሮች' : 'Tips for Success'}
        </h4>
        <div className="space-y-2">
          <div className="flex items-start space-x-3">
            <Icon name="CheckCircle" size={16} className="text-success mt-0.5 flex-shrink-0" />
            <p className="text-sm text-text-secondary">
              {currentLanguage === 'am' ?'ጥራት ያላቸውን ምስሎች ይጠቀሙ' :'Use high-quality photos of your produce'
              }
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <Icon name="CheckCircle" size={16} className="text-success mt-0.5 flex-shrink-0" />
            <p className="text-sm text-text-secondary">
              {currentLanguage === 'am' ?'ተወዳዳሪ ዋጋዎችን ያስቀምጡ' :'Set competitive prices based on market trends'
              }
            </p>
          </div>
          <div className="flex items-start space-x-3">
            <Icon name="CheckCircle" size={16} className="text-success mt-0.5 flex-shrink-0" />
            <p className="text-sm text-text-secondary">
              {currentLanguage === 'am' ?'ትዕዛዞችን በፍጥነት ይመልሱ' :'Respond to orders quickly to build trust'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmptyOrderState;