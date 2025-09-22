import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const PaymentMethods = ({ 
  currentLanguage = 'en', 
  userType = 'buyer', // 'buyer' or 'farmer'
  onPaymentMethodSelect,
  selectedMethod = null 
}) => {
  const [selectedPaymentType, setSelectedPaymentType] = useState('bank');
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    accountNumber: '',
    accountHolderName: '',
    branchName: '',
    swiftCode: ''
  });
  const [mobileBankingDetails, setMobileBankingDetails] = useState({
    provider: '',
    phoneNumber: '',
    accountName: ''
  });

  // Ethiopian Banks
  const banks = [
    { value: 'cbe', label: 'Commercial Bank of Ethiopia', labelAm: 'የኢትዮጵያ ንግድ ባንክ', code: 'CBE' },
    { value: 'dashen', label: 'Dashen Bank', labelAm: 'ዳሸን ባንክ', code: 'DASH' },
    { value: 'awash', label: 'Awash Bank', labelAm: 'አዋሽ ባንክ', code: 'AWASH' },
    { value: 'abyssinia', label: 'Abyssinia Bank', labelAm: 'አቢሲንያ ባንክ', code: 'ABY' },
    { value: 'nib', label: 'Nib International Bank', labelAm: 'ኒብ ኢንተርናሽናል ባንክ', code: 'NIB' },
    { value: 'boon', label: 'Bank of Abyssinia', labelAm: 'ባንክ ኦፍ አቢሲንያ', code: 'BOA' },
    { value: 'wegagen', label: 'Wegagen Bank', labelAm: 'ወጋገን ባንክ', code: 'WEG' },
    { value: 'united', label: 'United Bank', labelAm: 'ዩናይትድ ባንክ', code: 'UB' },
    { value: 'zemen', label: 'Zemen Bank', labelAm: 'ዘመን ባንክ', code: 'ZEM' },
    { value: 'berhan', label: 'Berhan International Bank', labelAm: 'ብርሃን ኢንተርናሽናል ባንክ', code: 'BIB' }
  ];

  // Mobile Banking Providers
  const mobileProviders = [
    { value: 'telebirr', label: 'Telebirr', labelAm: 'ቴሌብር', provider: 'Ethio Telecom' },
    { value: 'mpesa', label: 'M-Pesa', labelAm: 'ኤም-ፔሳ', provider: 'Safaricom' },
    { value: 'cbe-birr', label: 'CBE Birr', labelAm: 'ሲቢኢ ብር', provider: 'CBE' },
    { value: 'amole', label: 'Amole', labelAm: 'አሞሌ', provider: 'Dashen Bank' },
    { value: 'hello-cash', label: 'HelloCash', labelAm: 'ሄሎካሽ', provider: 'CBE' },
    { value: 'm-birr', label: 'M-Birr', labelAm: 'ኤም-ብር', provider: 'Various Banks' },
    { value: 'kacha', label: 'Kacha', labelAm: 'ካቻ', provider: 'Awash Bank' },
    { value: 'chapa', label: 'Chapa', labelAm: 'ቻፓ', provider: 'Chapa' }
  ];

  // Payment Types
  const paymentTypes = [
    { 
      value: 'bank', 
      label: currentLanguage === 'am' ? 'ባንክ ሂሳብ' : 'Bank Account',
      icon: 'Building2',
      description: currentLanguage === 'am' ? 'ባንክ ሂሳብ በመጠቀም ክፍያ' : 'Pay using bank account'
    },
    { 
      value: 'mobile', 
      label: currentLanguage === 'am' ? 'ሞባይል ባንኪንግ' : 'Mobile Banking',
      icon: 'Smartphone',
      description: currentLanguage === 'am' ? 'ሞባይል ባንኪንግ በመጠቀም ክፍያ' : 'Pay using mobile banking'
    },
    { 
      value: 'card', 
      label: currentLanguage === 'am' ? 'የክሬዲት ካርድ' : 'Credit/Debit Card',
      icon: 'CreditCard',
      description: currentLanguage === 'am' ? 'ክሬዲት/ዴቢት ካርድ በመጠቀም ክፍያ' : 'Pay using credit/debit card'
    },
    { 
      value: 'cash', 
      label: currentLanguage === 'am' ? 'ጥሬ ገንዘብ' : 'Cash on Delivery',
      icon: 'Banknote',
      description: currentLanguage === 'am' ? 'የሚደርስ ጊዜ ክፍያ' : 'Pay when product is delivered'
    }
  ];

  const handleBankDetailsChange = (field, value) => {
    setBankDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMobileBankingChange = (field, value) => {
    setMobileBankingDetails(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePaymentMethodSelect = (type, details) => {
    const paymentMethod = {
      type,
      details,
      timestamp: new Date().toISOString(),
      userType
    };
    onPaymentMethodSelect?.(paymentMethod);
  };

  const validateBankDetails = () => {
    const required = ['bankName', 'accountNumber', 'accountHolderName'];
    return required.every(field => bankDetails[field]);
  };

  const validateMobileBankingDetails = () => {
    const required = ['provider', 'phoneNumber'];
    return required.every(field => mobileBankingDetails[field]);
  };

  const getBankCode = (bankValue) => {
    const bank = banks.find(b => b.value === bankValue);
    return bank?.code || '';
  };

  return (
    <div className="space-y-6">
      {/* Payment Type Selection */}
      <div>
        <h3 className="text-lg font-semibold text-text-primary mb-4">
          {currentLanguage === 'am' ? 'የክፍያ ዘዴ ይምረጡ' : 'Select Payment Method'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {paymentTypes.map((type) => (
            <div
              key={type.value}
              className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                selectedPaymentType === type.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/50'
              }`}
              onClick={() => setSelectedPaymentType(type.value)}
            >
              <div className="flex items-center space-x-3 mb-2">
                <Icon name={type.icon} size={20} className="text-primary" />
                <span className="font-medium text-text-primary">
                  {type.label}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                {type.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Bank Account Details */}
      {selectedPaymentType === 'bank' && (
        <div className="bg-surface p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="Building2" size={20} className="text-primary" />
            <h4 className="text-lg font-semibold text-text-primary">
              {currentLanguage === 'am' ? 'ባንክ ሂሳብ ዝርዝሮች' : 'Bank Account Details'}
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {currentLanguage === 'am' ? 'ባንክ ስም' : 'Bank Name'} *
              </label>
              <Select
                value={bankDetails.bankName}
                onValueChange={(value) => handleBankDetailsChange('bankName', value)}
                placeholder={currentLanguage === 'am' ? 'ባንክ ይምረጡ' : 'Select Bank'}
              >
                {banks.map((bank) => (
                  <option key={bank.value} value={bank.value}>
                    {currentLanguage === 'am' ? bank.labelAm : bank.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {currentLanguage === 'am' ? 'ሂሳብ ቁጥር' : 'Account Number'} *
              </label>
              <Input
                type="text"
                value={bankDetails.accountNumber}
                onChange={(e) => handleBankDetailsChange('accountNumber', e.target.value)}
                placeholder={currentLanguage === 'am' ? 'ሂሳብ ቁጥር ያስገቡ' : 'Enter account number'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {currentLanguage === 'am' ? 'የሂሳብ ባለቤት ስም' : 'Account Holder Name'} *
              </label>
              <Input
                type="text"
                value={bankDetails.accountHolderName}
                onChange={(e) => handleBankDetailsChange('accountHolderName', e.target.value)}
                placeholder={currentLanguage === 'am' ? 'የሂሳብ ባለቤት ስም ያስገቡ' : 'Enter account holder name'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {currentLanguage === 'am' ? 'የባንክ ቅርንጫፍ' : 'Bank Branch'}
              </label>
              <Input
                type="text"
                value={bankDetails.branchName}
                onChange={(e) => handleBankDetailsChange('branchName', e.target.value)}
                placeholder={currentLanguage === 'am' ? 'የባንክ ቅርንጫፍ ያስገቡ' : 'Enter bank branch'}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {currentLanguage === 'am' ? 'SWIFT ኮድ' : 'SWIFT Code'}
              </label>
              <Input
                type="text"
                value={bankDetails.swiftCode}
                onChange={(e) => handleBankDetailsChange('swiftCode', e.target.value)}
                placeholder={currentLanguage === 'am' ? 'SWIFT ኮድ ያስገቡ' : 'Enter SWIFT code'}
              />
            </div>
          </div>

          {bankDetails.bankName && (
            <div className="mt-4 p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Info" size={16} className="text-primary" />
                <span className="text-sm font-medium text-primary">
                  {currentLanguage === 'am' ? 'ባንክ ኮድ' : 'Bank Code'}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                {getBankCode(bankDetails.bankName)} - {banks.find(b => b.value === bankDetails.bankName)?.label}
              </p>
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={() => handlePaymentMethodSelect('bank', bankDetails)}
              disabled={!validateBankDetails()}
              className="w-full"
            >
              {currentLanguage === 'am' ? 'ባንክ ሂሳብ አስቀምጥ' : 'Save Bank Account'}
            </Button>
          </div>
        </div>
      )}

      {/* Mobile Banking Details */}
      {selectedPaymentType === 'mobile' && (
        <div className="bg-surface p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="Smartphone" size={20} className="text-primary" />
            <h4 className="text-lg font-semibold text-text-primary">
              {currentLanguage === 'am' ? 'ሞባይል ባንኪንግ ዝርዝሮች' : 'Mobile Banking Details'}
            </h4>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {currentLanguage === 'am' ? 'ሞባይል ባንኪንግ አቅራቢ' : 'Mobile Banking Provider'} *
              </label>
              <Select
                value={mobileBankingDetails.provider}
                onValueChange={(value) => handleMobileBankingChange('provider', value)}
                placeholder={currentLanguage === 'am' ? 'አቅራቢ ይምረጡ' : 'Select Provider'}
              >
                {mobileProviders.map((provider) => (
                  <option key={provider.value} value={provider.value}>
                    {currentLanguage === 'am' ? provider.labelAm : provider.label}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                {currentLanguage === 'am' ? 'ስልክ ቁጥር' : 'Phone Number'} *
              </label>
              <Input
                type="tel"
                value={mobileBankingDetails.phoneNumber}
                onChange={(e) => handleMobileBankingChange('phoneNumber', e.target.value)}
                placeholder={currentLanguage === 'am' ? 'ስልክ ቁጥር ያስገቡ' : 'Enter phone number'}
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-text-primary mb-2">
                {currentLanguage === 'am' ? 'የሂሳብ ስም' : 'Account Name'}
              </label>
              <Input
                type="text"
                value={mobileBankingDetails.accountName}
                onChange={(e) => handleMobileBankingChange('accountName', e.target.value)}
                placeholder={currentLanguage === 'am' ? 'የሂሳብ ስም ያስገቡ' : 'Enter account name'}
              />
            </div>
          </div>

          {mobileBankingDetails.provider && (
            <div className="mt-4 p-4 bg-success/5 rounded-lg border border-success/20">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Smartphone" size={16} className="text-success" />
                <span className="text-sm font-medium text-success">
                  {currentLanguage === 'am' ? 'አቅራቢ መረጃ' : 'Provider Information'}
                </span>
              </div>
              <p className="text-sm text-text-secondary">
                {mobileProviders.find(p => p.value === mobileBankingDetails.provider)?.provider}
              </p>
            </div>
          )}

          <div className="mt-6">
            <Button
              onClick={() => handlePaymentMethodSelect('mobile', mobileBankingDetails)}
              disabled={!validateMobileBankingDetails()}
              className="w-full"
            >
              {currentLanguage === 'am' ? 'ሞባይል ባንኪንግ አስቀምጥ' : 'Save Mobile Banking'}
            </Button>
          </div>
        </div>
      )}

      {/* Credit/Debit Card */}
      {selectedPaymentType === 'card' && (
        <div className="bg-surface p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="CreditCard" size={20} className="text-primary" />
            <h4 className="text-lg font-semibold text-text-primary">
              {currentLanguage === 'am' ? 'ክሬዲት/ዴቢት ካርድ' : 'Credit/Debit Card'}
            </h4>
          </div>
          
          <div className="text-center py-8">
            <Icon name="CreditCard" size={48} className="text-text-secondary mx-auto mb-4" />
            <p className="text-text-secondary mb-4">
              {currentLanguage === 'am' 
                ? 'ክሬዲት/ዴቢት ካርድ ክፍያ በቅርቡ ይገኛል' 
                : 'Credit/Debit card payment will be available soon'
              }
            </p>
            <Button variant="outline" disabled>
              {currentLanguage === 'am' ? 'በቅርቡ ይገኛል' : 'Coming Soon'}
            </Button>
          </div>
        </div>
      )}

      {/* Cash on Delivery */}
      {selectedPaymentType === 'cash' && (
        <div className="bg-surface p-6 rounded-lg border border-border">
          <div className="flex items-center space-x-2 mb-4">
            <Icon name="Banknote" size={20} className="text-primary" />
            <h4 className="text-lg font-semibold text-text-primary">
              {currentLanguage === 'am' ? 'የሚደርስ ጊዜ ክፍያ' : 'Cash on Delivery'}
            </h4>
          </div>
          
          <div className="space-y-4">
            <div className="p-4 bg-warning/5 rounded-lg border border-warning/20">
              <div className="flex items-center space-x-2 mb-2">
                <Icon name="Info" size={16} className="text-warning" />
                <span className="text-sm font-medium text-warning">
                  {currentLanguage === 'am' ? 'ጠቃሚ መረጃ' : 'Important Information'}
                </span>
              </div>
              <ul className="text-sm text-text-secondary space-y-1">
                <li>• {currentLanguage === 'am' ? 'ክፍያ የሚከናወንበት ጊዜ ምርቱ የሚደርስበት ጊዜ ነው' : 'Payment is made when the product is delivered'}</li>
                <li>• {currentLanguage === 'am' ? 'ተጨማሪ የማድረሻ ክፍያ ሊኖር ይችላል' : 'Additional delivery charges may apply'}</li>
                <li>• {currentLanguage === 'am' ? 'የክፍያ ማረጋገጫ ያስፈልጋል' : 'Payment verification is required'}</li>
              </ul>
            </div>

            <div className="mt-6">
              <Button
                onClick={() => handlePaymentMethodSelect('cash', { method: 'cash_on_delivery' })}
                className="w-full"
              >
                {currentLanguage === 'am' ? 'የሚደርስ ጊዜ ክፍያ አስቀምጥ' : 'Save Cash on Delivery'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentMethods;
