import React from 'react';
import Icon from '../../../components/AppIcon';

const RoleSelector = ({ selectedRole, onRoleChange, currentLanguage }) => {
  const roles = [
    {
      id: 'farmer',
      label: 'Farmer',
      labelAm: 'ገበሬ',
      description: 'Sell your produce directly to buyers',
      descriptionAm: 'ምርትዎን በቀጥታ ለገዢዎች ይሽጡ',
      icon: 'Sprout',
      color: 'text-success'
    },
    {
      id: 'buyer',
      label: 'Buyer',
      labelAm: 'ገዢ',
      description: 'Buy fresh produce from local farmers',
      descriptionAm: 'ከአካባቢ ገበሬዎች ትኩስ ምርት ይግዙ',
      icon: 'ShoppingBag',
      color: 'text-primary'
    }
  ];

  const getLabel = (role) => {
    return currentLanguage === 'am' && role?.labelAm ? role?.labelAm : role?.label;
  };

  const getDescription = (role) => {
    return currentLanguage === 'am' && role?.descriptionAm ? role?.descriptionAm : role?.description;
  };

  return (
    <div className="space-y-3 mb-6">
      <label className="block text-sm font-medium text-text-primary">
        {currentLanguage === 'am' ? 'የእርስዎ ሚና ይምረጡ' : 'Choose your role'}
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {roles?.map((role) => (
          <button
            key={role?.id}
            type="button"
            onClick={() => onRoleChange(role?.id)}
            className={`
              p-4 border-2 rounded-lg transition-smooth text-left
              ${selectedRole === role?.id
                ? 'border-primary bg-primary/5' :'border-border hover:border-primary/50'
              }
            `}
          >
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg bg-muted ${role?.color}`}>
                <Icon name={role?.icon} size={20} />
              </div>
              <div className="flex-1">
                <h3 className="font-medium text-text-primary">
                  {getLabel(role)}
                </h3>
                <p className="text-sm text-text-secondary mt-1">
                  {getDescription(role)}
                </p>
              </div>
              {selectedRole === role?.id && (
                <Icon name="Check" size={20} className="text-primary" />
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

export default RoleSelector;