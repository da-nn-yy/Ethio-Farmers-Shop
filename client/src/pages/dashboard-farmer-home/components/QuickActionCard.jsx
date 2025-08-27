import React from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';

const QuickActionCard = ({ 
  title, 
  titleAm, 
  description, 
  descriptionAm, 
  icon, 
  onClick, 
  variant = 'default',
  currentLanguage = 'en' 
}) => {
  const getTitle = () => {
    return currentLanguage === 'am' && titleAm ? titleAm : title;
  };

  const getDescription = () => {
    return currentLanguage === 'am' && descriptionAm ? descriptionAm : description;
  };

  return (
    <div className="bg-card border border-border rounded-lg p-4 lg:p-6 shadow-warm hover:shadow-warm-md transition-smooth">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center ${
          variant === 'primary' ? 'bg-primary text-primary-foreground' : 
          variant === 'secondary' ? 'bg-secondary text-secondary-foreground' :
          'bg-accent text-accent-foreground'
        }`}>
          <Icon name={icon} size={28} />
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-text-primary">
            {getTitle()}
          </h3>
          <p className="text-sm text-text-secondary">
            {getDescription()}
          </p>
        </div>
        <Button 
          variant={variant} 
          onClick={onClick}
          className="w-full"
          iconName="ArrowRight"
          iconPosition="right"
        >
          {currentLanguage === 'am' ? 'ይጀምሩ' : 'Get Started'}
        </Button>
      </div>
    </div>
  );
};

export default QuickActionCard;