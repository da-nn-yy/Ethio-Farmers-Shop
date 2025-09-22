import React, { useState } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import PaymentMethods from '../../components/payment/PaymentMethods';
import PaymentVerification from '../../components/payment/PaymentVerification';
import PaymentHistory from '../../components/payment/PaymentHistory';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';

const PaymentSettings = () => {
  const { currentLanguage } = useLanguage();
  const [activeTab, setActiveTab] = useState('methods');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [verificationStep, setVerificationStep] = useState('select'); // 'select', 'verify', 'complete'
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);

  // Mock user type - in real app, get from auth context
  const userType = 'buyer'; // or 'farmer'

  const handlePaymentMethodSelect = (paymentMethod) => {
    setSelectedPaymentMethod(paymentMethod);
    setVerificationStep('verify');
  };

  const handleVerificationComplete = (verifiedMethod) => {
    setSavedPaymentMethods(prev => [...prev, verifiedMethod]);
    setVerificationStep('complete');
    setSelectedPaymentMethod(null);
  };

  const handleVerificationFailed = (error) => {
    console.error('Verification failed:', error);
    setVerificationStep('select');
    setSelectedPaymentMethod(null);
  };

  const handleRemovePaymentMethod = (methodId) => {
    setSavedPaymentMethods(prev => prev.filter(method => method.id !== methodId));
  };

  const tabs = [
    {
      id: 'methods',
      label: currentLanguage === 'am' ? 'የክፍያ ዘዴዎች' : 'Payment Methods',
      icon: 'CreditCard',
      description: currentLanguage === 'am' ? 'የክፍያ ዘዴዎችን ያስተዳድሩ' : 'Manage payment methods'
    },
    {
      id: 'history',
      label: currentLanguage === 'am' ? 'የክፍያ ታሪክ' : 'Payment History',
      icon: 'Receipt',
      description: currentLanguage === 'am' ? 'የክፍያ ታሪክ ይመልከቱ' : 'View payment history'
    },
    {
      id: 'security',
      label: currentLanguage === 'am' ? 'ደህንነት' : 'Security',
      icon: 'Shield',
      description: currentLanguage === 'am' ? 'የክፍያ ደህንነት ቅንብሮች' : 'Payment security settings'
    }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'methods':
        if (verificationStep === 'select') {
          return (
            <div className="space-y-6">
              {/* Saved Payment Methods */}
              {savedPaymentMethods.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-text-primary mb-4">
                    {currentLanguage === 'am' ? 'የተቀመጡ የክፍያ ዘዴዎች' : 'Saved Payment Methods'}
                  </h3>
                  <div className="space-y-3">
                    {savedPaymentMethods.map((method, index) => (
                      <div key={index} className="bg-surface p-4 rounded-lg border border-border">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                              <Icon 
                                name={
                                  method.type === 'bank' ? 'Building2' :
                                  method.type === 'mobile' ? 'Smartphone' :
                                  method.type === 'cash' ? 'Banknote' : 'CreditCard'
                                } 
                                size={20} 
                                className="text-primary" 
                              />
                            </div>
                            <div>
                              <p className="font-medium text-text-primary">
                                {method.type === 'bank' ? (currentLanguage === 'am' ? 'ባንክ ሂሳብ' : 'Bank Account') :
                                 method.type === 'mobile' ? (currentLanguage === 'am' ? 'ሞባይል ባንኪንግ' : 'Mobile Banking') :
                                 method.type === 'cash' ? (currentLanguage === 'am' ? 'የሚደርስ ጊዜ ክፍያ' : 'Cash on Delivery') :
                                 (currentLanguage === 'am' ? 'ክሬዲት ካርድ' : 'Credit Card')}
                              </p>
                              <p className="text-sm text-text-secondary">
                                {method.type === 'bank' ? `${method.details.bankName} - ${method.details.accountNumber}` :
                                 method.type === 'mobile' ? `${method.details.provider} - ${method.details.phoneNumber}` :
                                 method.type === 'cash' ? (currentLanguage === 'am' ? 'በማድረሻ ጊዜ' : 'On delivery') :
                                 '**** **** **** 1234'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                              {currentLanguage === 'am' ? 'ተረጋግጧል' : 'Verified'}
                            </span>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleRemovePaymentMethod(index)}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Add New Payment Method */}
              <div>
                <h3 className="text-lg font-semibold text-text-primary mb-4">
                  {currentLanguage === 'am' ? 'አዲስ የክፍያ ዘዴ ያክሉ' : 'Add New Payment Method'}
                </h3>
                <PaymentMethods
                  currentLanguage={currentLanguage}
                  userType={userType}
                  onPaymentMethodSelect={handlePaymentMethodSelect}
                />
              </div>
            </div>
          );
        }

        if (verificationStep === 'verify') {
          return (
            <PaymentVerification
              currentLanguage={currentLanguage}
              paymentMethod={selectedPaymentMethod}
              onVerificationComplete={handleVerificationComplete}
              onVerificationFailed={handleVerificationFailed}
            />
          );
        }

        if (verificationStep === 'complete') {
          return (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="CheckCircle" size={32} className="text-success" />
              </div>
              <h3 className="text-lg font-semibold text-success mb-2">
                {currentLanguage === 'am' ? 'ተረጋግጧል!' : 'Verified!'}
              </h3>
              <p className="text-text-secondary mb-6">
                {currentLanguage === 'am' 
                  ? 'የክፍያ ዘዴዎ በተሳካ ሁኔታ ተጨመረ።'
                  : 'Your payment method has been successfully added.'
                }
              </p>
              <Button onClick={() => setVerificationStep('select')}>
                {currentLanguage === 'am' ? 'ተጨማሪ የክፍያ ዘዴ ያክሉ' : 'Add Another Payment Method'}
              </Button>
            </div>
          );
        }

        return null;

      case 'history':
        return (
          <PaymentHistory
            currentLanguage={currentLanguage}
            userType={userType}
          />
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-surface p-6 rounded-lg border border-border">
              <div className="flex items-center space-x-3 mb-4">
                <Icon name="Shield" size={24} className="text-primary" />
                <h3 className="text-lg font-semibold text-text-primary">
                  {currentLanguage === 'am' ? 'የክፍያ ደህንነት' : 'Payment Security'}
                </h3>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg border border-success/20">
                  <div className="flex items-center space-x-3">
                    <Icon name="CheckCircle" size={20} className="text-success" />
                    <div>
                      <p className="font-medium text-text-primary">
                        {currentLanguage === 'am' ? 'SSL ምስጢር' : 'SSL Encryption'}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {currentLanguage === 'am' 
                          ? 'ሁሉም የክፍያ ውሂቦች በSSL ይምስጢር ይሰራሉ'
                          : 'All payment data is encrypted with SSL'
                        }
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                    {currentLanguage === 'am' ? 'ንቁ' : 'Active'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-success/5 rounded-lg border border-success/20">
                  <div className="flex items-center space-x-3">
                    <Icon name="CheckCircle" size={20} className="text-success" />
                    <div>
                      <p className="font-medium text-text-primary">
                        {currentLanguage === 'am' ? 'የባንክ ደረጃ ደህንነት' : 'Bank-Level Security'}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {currentLanguage === 'am' 
                          ? 'የባንክ ደረጃ የደህንነት መስፈርቶች'
                          : 'Bank-level security standards'
                        }
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                    {currentLanguage === 'am' ? 'ንቁ' : 'Active'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-warning/5 rounded-lg border border-warning/20">
                  <div className="flex items-center space-x-3">
                    <Icon name="AlertTriangle" size={20} className="text-warning" />
                    <div>
                      <p className="font-medium text-text-primary">
                        {currentLanguage === 'am' ? '2FA ማረጋገጫ' : 'Two-Factor Authentication'}
                      </p>
                      <p className="text-sm text-text-secondary">
                        {currentLanguage === 'am' 
                          ? 'ለክፍያዎች ተጨማሪ ደህንነት'
                          : 'Additional security for payments'
                        }
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {currentLanguage === 'am' ? 'አንቃ' : 'Enable'}
                  </Button>
                </div>
              </div>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-border">
              <h4 className="text-lg font-semibold text-text-primary mb-4">
                {currentLanguage === 'am' ? 'የክፍያ ደህንነት ምክሮች' : 'Payment Security Tips'}
              </h4>
              <ul className="space-y-3 text-sm text-text-secondary">
                <li className="flex items-start space-x-2">
                  <Icon name="Check" size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <span>
                    {currentLanguage === 'am' 
                      ? 'የክፍያ ዘዴዎችን በተደጋጋሚ ያረጋግጡ'
                      : 'Regularly verify your payment methods'
                    }
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Icon name="Check" size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <span>
                    {currentLanguage === 'am' 
                      ? 'የስልክ ቁጥሮችን በጥንቃቄ ያረጋግጡ'
                      : 'Always verify phone numbers before payment'
                    }
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Icon name="Check" size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <span>
                    {currentLanguage === 'am' 
                      ? 'የማረጋገጫ ኮዶችን ከማንም አይጋሩ'
                      : 'Never share verification codes with anyone'
                    }
                  </span>
                </li>
                <li className="flex items-start space-x-2">
                  <Icon name="Check" size={16} className="text-success mt-0.5 flex-shrink-0" />
                  <span>
                    {currentLanguage === 'am' 
                      ? 'የክፍያ ታሪክዎን በተደጋጋሚ ይመልከቱ'
                      : 'Regularly review your payment history'
                    }
                  </span>
                </li>
              </ul>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text-primary mb-2">
            {currentLanguage === 'am' ? 'የክፍያ ቅንብሮች' : 'Payment Settings'}
          </h1>
          <p className="text-text-secondary">
            {currentLanguage === 'am' 
              ? 'የክፍያ ዘዴዎችን፣ ታሪክን እና ደህንነትን ያስተዳድሩ'
              : 'Manage your payment methods, history, and security'
            }
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-surface rounded-lg border border-border p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary text-white'
                        : 'text-text-secondary hover:bg-muted hover:text-text-primary'
                    }`}
                  >
                    <Icon name={tab.icon} size={18} />
                    <div>
                      <p className="font-medium">{tab.label}</p>
                      <p className="text-xs opacity-75">{tab.description}</p>
                    </div>
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSettings;
