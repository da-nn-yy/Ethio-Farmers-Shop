import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Select from '../../../components/ui/Select';

const PriceAlerts = ({ currentLanguage = 'en' }) => {
  const [showAddAlert, setShowAddAlert] = useState(false);
  const [newAlert, setNewAlert] = useState({
    crop: '',
    targetPrice: '',
    condition: 'above',
    region: ''
  });

  const existingAlerts = [
    {
      id: 1,
      crop: "Teff",
      cropAm: "ጤፍ",
      targetPrice: 90.00,
      condition: "above",
      conditionAm: "በላይ",
      region: "Addis Ababa",
      regionAm: "አዲስ አበባ",
      isActive: true,
      currentPrice: 85.50,
      created: "2025-08-20"
    },
    {
      id: 2,
      crop: "Coffee",
      cropAm: "ቡና",
      targetPrice: 300.00,
      condition: "below",
      conditionAm: "በታች",
      region: "Oromia",
      regionAm: "ኦሮሚያ",
      isActive: true,
      currentPrice: 320.75,
      created: "2025-08-18"
    },
    {
      id: 3,
      crop: "Maize",
      cropAm: "በቆሎ",
      targetPrice: 35.00,
      condition: "above",
      conditionAm: "በላይ",
      region: "Amhara",
      regionAm: "አማራ",
      isActive: false,
      currentPrice: 28.90,
      created: "2025-08-15",
      triggered: "2025-08-22"
    }
  ];

  const cropOptions = [
    { value: 'teff', label: 'Teff', labelAm: 'ጤፍ' },
    { value: 'coffee', label: 'Coffee', labelAm: 'ቡና' },
    { value: 'maize', label: 'Maize', labelAm: 'በቆሎ' },
    { value: 'wheat', label: 'Wheat', labelAm: 'ስንዴ' }
  ];

  const conditionOptions = [
    { value: 'above', label: 'Above', labelAm: 'በላይ' },
    { value: 'below', label: 'Below', labelAm: 'በታች' }
  ];

  const regionOptions = [
    { value: 'addis-ababa', label: 'Addis Ababa', labelAm: 'አዲስ አበባ' },
    { value: 'oromia', label: 'Oromia', labelAm: 'ኦሮሚያ' },
    { value: 'amhara', label: 'Amhara', labelAm: 'አማራ' },
    { value: 'snnpr', label: 'SNNPR', labelAm: 'ደቡብ ብሔሮች' }
  ];

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })?.format(price);
  };

  const getLabel = (item, field) => {
    return currentLanguage === 'am' && item?.[`${field}Am`] ? item?.[`${field}Am`] : item?.[field];
  };

  const getSelectOptions = (options) => {
    return options?.map(option => ({
      value: option?.value,
      label: getLabel(option, 'label')
    }));
  };

  const handleAddAlert = () => {
    // Handle adding new alert
    console.log('Adding alert:', newAlert);
    setShowAddAlert(false);
    setNewAlert({
      crop: '',
      targetPrice: '',
      condition: 'above',
      region: ''
    });
  };

  const handleToggleAlert = (alertId) => {
    // Handle toggling alert active state
    console.log('Toggling alert:', alertId);
  };

  const handleDeleteAlert = (alertId) => {
    // Handle deleting alert
    console.log('Deleting alert:', alertId);
  };

  const getAlertStatus = (alert) => {
    const { condition, targetPrice, currentPrice } = alert;
    const isTriggered = condition === 'above' 
      ? currentPrice >= targetPrice 
      : currentPrice <= targetPrice;
    
    return isTriggered;
  };

  return (
    <div className="bg-surface p-4 lg:p-6 rounded-lg border border-border shadow-warm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Icon name="Bell" size={20} className="text-primary" />
          <h3 className="text-lg font-semibold text-text-primary">
            {currentLanguage === 'am' ? 'የዋጋ ማንቂያዎች' : 'Price Alerts'}
          </h3>
        </div>
        <Button
          variant="default"
          size="sm"
          onClick={() => setShowAddAlert(!showAddAlert)}
          iconName="Plus"
          iconPosition="left"
        >
          {currentLanguage === 'am' ? 'ማንቂያ ጨምር' : 'Add Alert'}
        </Button>
      </div>
      {/* Add Alert Form */}
      {showAddAlert && (
        <div className="mb-6 p-4 bg-muted rounded-lg border border-border">
          <h4 className="font-medium text-text-primary mb-4">
            {currentLanguage === 'am' ? 'አዲስ ዋጋ ማንቂያ ፍጠር' : 'Create New Price Alert'}
          </h4>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Select
              label={currentLanguage === 'am' ? 'ምርት' : 'Crop'}
              options={getSelectOptions(cropOptions)}
              value={newAlert?.crop}
              onChange={(value) => setNewAlert({...newAlert, crop: value})}
              placeholder={currentLanguage === 'am' ? 'ምርት ምረጥ' : 'Select crop'}
            />
            
            <Select
              label={currentLanguage === 'am' ? 'ክልል' : 'Region'}
              options={getSelectOptions(regionOptions)}
              value={newAlert?.region}
              onChange={(value) => setNewAlert({...newAlert, region: value})}
              placeholder={currentLanguage === 'am' ? 'ክልል ምረጥ' : 'Select region'}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
            <Select
              label={currentLanguage === 'am' ? 'ሁኔታ' : 'Condition'}
              options={getSelectOptions(conditionOptions)}
              value={newAlert?.condition}
              onChange={(value) => setNewAlert({...newAlert, condition: value})}
            />
            
            <Input
              label={currentLanguage === 'am' ? 'ዒላማ ዋጋ (ETB)' : 'Target Price (ETB)'}
              type="number"
              value={newAlert?.targetPrice}
              onChange={(e) => setNewAlert({...newAlert, targetPrice: e?.target?.value})}
              placeholder="0.00"
            />
          </div>

          <div className="flex space-x-3">
            <Button
              variant="default"
              onClick={handleAddAlert}
              disabled={!newAlert?.crop || !newAlert?.targetPrice || !newAlert?.region}
            >
              {currentLanguage === 'am' ? 'ማንቂያ ፍጠር' : 'Create Alert'}
            </Button>
            <Button
              variant="ghost"
              onClick={() => setShowAddAlert(false)}
            >
              {currentLanguage === 'am' ? 'ሰርዝ' : 'Cancel'}
            </Button>
          </div>
        </div>
      )}
      {/* Existing Alerts */}
      <div className="space-y-3">
        {existingAlerts?.length === 0 ? (
          <div className="text-center py-8">
            <Icon name="Bell" size={48} className="text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary">
              {currentLanguage === 'am' ?'ምንም ዋጋ ማንቂያዎች የሉም። አንዱን ለመፍጠር ከላይ ያለውን ቁልፍ ይጫኑ።' :'No price alerts set. Click the button above to create one.'
              }
            </p>
          </div>
        ) : (
          existingAlerts?.map((alert) => {
            const isTriggered = getAlertStatus(alert);
            
            return (
              <div 
                key={alert?.id}
                className={`p-4 rounded-lg border transition-smooth ${
                  isTriggered && alert?.isActive
                    ? 'bg-success/5 border-success/20'
                    : alert?.isActive
                    ? 'bg-muted border-border' :'bg-muted/50 border-border opacity-60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      isTriggered && alert?.isActive
                        ? 'bg-success/20 text-success' :'bg-primary/10 text-primary'
                    }`}>
                      <Icon 
                        name={isTriggered && alert?.isActive ? "BellRing" : "Bell"} 
                        size={20} 
                      />
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-text-primary">
                        {getLabel(alert, 'crop')} {currentLanguage === 'am' ? 'ዋጋ ማንቂያ' : 'Price Alert'}
                      </h4>
                      <p className="text-sm text-text-secondary">
                        {currentLanguage === 'am' ? 'ዋጋ ሲሆን' : 'When price goes'} {getLabel(alert, 'condition')} {formatPrice(alert?.targetPrice)} ETB
                      </p>
                      <p className="text-xs text-text-secondary">
                        {getLabel(alert, 'region')} • {currentLanguage === 'am' ? 'የአሁን ዋጋ፡' : 'Current:'} {formatPrice(alert?.currentPrice)} ETB
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {isTriggered && alert?.isActive && (
                      <div className="flex items-center space-x-1 px-2 py-1 bg-success/10 text-success rounded-full text-xs font-medium">
                        <Icon name="CheckCircle" size={12} />
                        <span>{currentLanguage === 'am' ? 'ተነሳ' : 'Triggered'}</span>
                      </div>
                    )}
                    
                    <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${
                      alert?.isActive 
                        ? 'bg-primary/10 text-primary' :'bg-muted text-text-secondary'
                    }`}>
                      <Icon name={alert?.isActive ? "Play" : "Pause"} size={12} />
                      <span>{alert?.isActive ? (currentLanguage === 'am' ? 'ንቁ' : 'Active') : (currentLanguage === 'am' ? 'ቆሟል' : 'Paused')}</span>
                    </div>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleAlert(alert?.id)}
                      className="text-text-secondary hover:text-primary"
                    >
                      <Icon name={alert?.isActive ? "Pause" : "Play"} size={16} />
                    </Button>

                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteAlert(alert?.id)}
                      className="text-text-secondary hover:text-error"
                    >
                      <Icon name="Trash2" size={16} />
                    </Button>
                  </div>
                </div>
                {alert?.triggered && (
                  <div className="mt-3 p-2 bg-success/10 rounded text-xs text-success">
                    {currentLanguage === 'am' ? 'ተነሳ፡' : 'Triggered:'} {new Date(alert.triggered)?.toLocaleDateString()}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
      {existingAlerts?.length > 0 && (
        <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
          <div className="flex items-start space-x-3">
            <Icon name="Info" size={20} className="text-primary mt-0.5" />
            <div>
              <h6 className="font-medium text-text-primary mb-1">
                {currentLanguage === 'am' ? 'ማንቂያ መረጃ' : 'Alert Information'}
              </h6>
              <p className="text-sm text-text-secondary">
                {currentLanguage === 'am' ?'ማንቂያዎች በየ15 ደቂቃው ይፈተሻሉ። የተነሳ ማንቂያ በስልክ እና በኢሜል ይላካል።' :'Alerts are checked every 15 minutes. Triggered alerts will be sent via SMS and email.'
                }
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PriceAlerts;