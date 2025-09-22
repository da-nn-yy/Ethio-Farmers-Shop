import React from 'react';
import Icon from '../../../components/AppIcon';

const TrustSignals = ({ currentLanguage }) => {
  const trustElements = [
    {
      icon: 'Shield',
      title: 'Secure Platform',
      titleAm: 'ደህንነቱ የተጠበቀ መድረክ',
      description: 'Your data is protected with bank-level security',
      descriptionAm: 'የእርስዎ መረጃ በባንክ ደረጃ ደህንነት የተጠበቀ ነው'
    },
    {
      icon: 'Users',
      title: 'Verified Farmers',
      titleAm: 'የተረጋገጡ ገበሬዎች',
      description: 'All farmers are verified with local certifications',
      descriptionAm: 'ሁሉም ገበሬዎች በአካባቢያዊ ማረጋገጫዎች የተረጋገጡ ናቸው'
    },
    {
      icon: 'Handshake',
      title: 'Fair Trade',
      titleAm: 'ፍትሃዊ ንግድ',
      description: 'Direct connection ensures fair prices for all',
      descriptionAm: 'ቀጥተኛ ግንኙነት ለሁሉም ፍትሃዊ ዋጋ ያረጋግጣል'
    }
  ];

  const getTitle = (element) => {
    return currentLanguage === 'am' && element?.titleAm ? element?.titleAm : element?.title;
  };

  const getDescription = (element) => {
    return currentLanguage === 'am' && element?.descriptionAm ? element?.descriptionAm : element?.description;
  };

  return (
    <div className="mt-8 pt-8 border-t border-border">
      <h3 className="text-lg font-semibold text-text-primary text-center mb-6">
        {currentLanguage === 'am' ? 'ለምን Ke geberew?' : 'Why Ke geberew?'}
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {trustElements?.map((element, index) => (
          <div key={index} className="text-center">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <Icon name={element?.icon} size={24} className="text-primary" />
            </div>
            <h4 className="font-medium text-text-primary mb-2">
              {getTitle(element)}
            </h4>
            <p className="text-sm text-text-secondary">
              {getDescription(element)}
            </p>
          </div>
        ))}
      </div>
      {/* Ethiopian Market Context */}
      <div className="mt-8 p-4 bg-success/5 border border-success/20 rounded-lg">
        <div className="flex items-start space-x-3">
          <Icon name="MapPin" size={20} className="text-success mt-0.5" />
          <div>
            <h4 className="font-medium text-success mb-1">
              {currentLanguage === 'am' ? 'የኢትዮጵያ ገበያ' : 'Ethiopian Market'}
            </h4>
            <p className="text-sm text-text-secondary">
              {currentLanguage === 'am' ?'ከአካባቢያዊ ገበሬዎች ጋር በቀጥታ ይገናኙ እና ትኩስ ምርት በተመጣጣኝ ዋጋ ያግኙ።' :'Connect directly with local farmers and get fresh produce at fair prices.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrustSignals;