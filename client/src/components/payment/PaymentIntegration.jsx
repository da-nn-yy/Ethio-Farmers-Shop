import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import PaymentMethods from './PaymentMethods';
import PaymentVerification from './PaymentVerification';

const PaymentIntegration = ({ 
  currentLanguage = 'en',
  orderTotal,
  orderItems = [],
  onPaymentSuccess,
  onPaymentFailed,
  userType = 'buyer'
}) => {
  const [paymentStep, setPaymentStep] = useState('select'); // 'select', 'verify', 'processing', 'success', 'failed'
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [paymentDetails, setPaymentDetails] = useState({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  // Mock saved payment methods
  const savedPaymentMethods = [
    {
      id: 'pm_1',
      type: 'bank',
      label: currentLanguage === 'am' ? 'CBE ባንክ ሂሳብ' : 'CBE Bank Account',
      details: {
        bankName: 'cbe',
        accountNumber: '1000123456789',
        accountHolderName: 'John Doe',
        bankCode: 'CBE'
      },
      isVerified: true
    },
    {
      id: 'pm_2',
      type: 'mobile',
      label: currentLanguage === 'am' ? 'ቴሌብር' : 'Telebirr',
      details: {
        provider: 'telebirr',
        phoneNumber: '+251912345678',
        accountName: 'John Doe'
      },
      isVerified: true
    },
    {
      id: 'pm_3',
      type: 'cash',
      label: currentLanguage === 'am' ? 'የሚደርስ ጊዜ ክፍያ' : 'Cash on Delivery',
      details: {
        method: 'cash_on_delivery'
      },
      isVerified: true
    }
  ];

  const handlePaymentMethodSelect = (method) => {
    setSelectedPaymentMethod(method);
    setPaymentStep('verify');
  };

  const handleVerificationComplete = (verifiedMethod) => {
    setPaymentDetails(verifiedMethod);
    setPaymentStep('processing');
    processPayment(verifiedMethod);
  };

  const handleVerificationFailed = (error) => {
    setError(error);
    setPaymentStep('failed');
  };

  const processPayment = async (paymentMethod) => {
    setIsProcessing(true);
    setError('');

    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Mock payment processing logic
      const paymentResult = await simulatePaymentProcessing(paymentMethod, orderTotal);

      if (paymentResult.success) {
        setPaymentStep('success');
        onPaymentSuccess?.({
          paymentId: paymentResult.paymentId,
          amount: orderTotal,
          method: paymentMethod,
          timestamp: new Date().toISOString(),
          orderItems
        });
      } else {
        throw new Error(paymentResult.error || 'Payment processing failed');
      }
    } catch (err) {
      setError(err.message);
      setPaymentStep('failed');
      onPaymentFailed?.(err);
    } finally {
      setIsProcessing(false);
    }
  };

  const simulatePaymentProcessing = async (paymentMethod, amount) => {
    // Simulate different payment processing based on method
    switch (paymentMethod.type) {
      case 'bank':
        return {
          success: true,
          paymentId: `BANK_${Date.now()}`,
          transactionId: `TXN_${Date.now()}`,
          message: currentLanguage === 'am' ? 'የባንክ ክፍያ ተሳክቷል' : 'Bank payment successful'
        };
      
      case 'mobile':
        return {
          success: true,
          paymentId: `MOBILE_${Date.now()}`,
          transactionId: `TXN_${Date.now()}`,
          message: currentLanguage === 'am' ? 'የሞባይል ክፍያ ተሳክቷል' : 'Mobile payment successful'
        };
      
      case 'cash':
        return {
          success: true,
          paymentId: `CASH_${Date.now()}`,
          transactionId: `TXN_${Date.now()}`,
          message: currentLanguage === 'am' ? 'የሚደርስ ጊዜ ክፍያ ተቀመጠ' : 'Cash on delivery scheduled'
        };
      
      default:
        return {
          success: false,
          error: currentLanguage === 'am' ? 'ያልታወቀ የክፍያ ዘዴ' : 'Unknown payment method'
        };
    }
  };

  const formatAmount = (amount) => {
    return new Intl.NumberFormat('en-ET', {
      style: 'currency',
      currency: 'ETB',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const getPaymentMethodIcon = (type) => {
    switch (type) {
      case 'bank':
        return 'Building2';
      case 'mobile':
        return 'Smartphone';
      case 'cash':
        return 'Banknote';
      case 'card':
        return 'CreditCard';
      default:
        return 'DollarSign';
    }
  };

  const renderPaymentStep = () => {
    switch (paymentStep) {
      case 'select':
        return (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-surface p-6 rounded-lg border border-border">
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                {currentLanguage === 'am' ? 'የትዕዛዝ ማጠቃለያ' : 'Order Summary'}
              </h3>
              <div className="space-y-3">
                {orderItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                        <Icon name="Package" size={20} className="text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-text-primary">{item.name}</p>
                        <p className="text-sm text-text-secondary">
                          {item.quantity} {currentLanguage === 'am' ? 'ቁጥር' : 'qty'} × {formatAmount(item.price)}
                        </p>
                      </div>
                    </div>
                    <p className="font-medium text-text-primary">
                      {formatAmount(item.quantity * item.price)}
                    </p>
                  </div>
                ))}
                <div className="border-t border-border pt-3">
                  <div className="flex items-center justify-between text-lg font-semibold text-text-primary">
                    <span>{currentLanguage === 'am' ? 'ጠቅላላ' : 'Total'}</span>
                    <span>{formatAmount(orderTotal)}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method Selection */}
            <div>
              <h3 className="text-lg font-semibold text-text-primary mb-4">
                {currentLanguage === 'am' ? 'የክፍያ ዘዴ ይምረጡ' : 'Select Payment Method'}
              </h3>
              
              {/* Saved Payment Methods */}
              <div className="space-y-3 mb-6">
                {savedPaymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className="p-4 border border-border rounded-lg cursor-pointer hover:border-primary/50 transition-colors"
                    onClick={() => handlePaymentMethodSelect(method)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Icon name={getPaymentMethodIcon(method.type)} size={20} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-medium text-text-primary">{method.label}</p>
                          <p className="text-sm text-text-secondary">
                            {method.type === 'bank' ? `${method.details.bankCode} - ${method.details.accountNumber}` :
                             method.type === 'mobile' ? method.details.phoneNumber :
                             method.type === 'cash' ? (currentLanguage === 'am' ? 'በማድረሻ ጊዜ' : 'On delivery') :
                             '**** **** **** 1234'}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-1 bg-success/10 text-success text-xs rounded-full">
                          {currentLanguage === 'am' ? 'ተረጋግጧል' : 'Verified'}
                        </span>
                        <Icon name="ChevronRight" size={16} className="text-text-secondary" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add New Payment Method */}
              <div className="border-t border-border pt-6">
                <h4 className="text-md font-semibold text-text-primary mb-4">
                  {currentLanguage === 'am' ? 'አዲስ የክፍያ ዘዴ ያክሉ' : 'Add New Payment Method'}
                </h4>
                <PaymentMethods
                  currentLanguage={currentLanguage}
                  userType={userType}
                  onPaymentMethodSelect={handlePaymentMethodSelect}
                />
              </div>
            </div>
          </div>
        );

      case 'verify':
        return (
          <PaymentVerification
            currentLanguage={currentLanguage}
            paymentMethod={selectedPaymentMethod}
            onVerificationComplete={handleVerificationComplete}
            onVerificationFailed={handleVerificationFailed}
          />
        );

      case 'processing':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
            <h3 className="text-lg font-semibold text-text-primary mb-2">
              {currentLanguage === 'am' ? 'ክፍያ በማስኬድ ላይ...' : 'Processing Payment...'}
            </h3>
            <p className="text-text-secondary">
              {currentLanguage === 'am' 
                ? 'እባክዎ ይጠብቁ። ክፍያዎ በማስኬድ ላይ ነው።'
                : 'Please wait. Your payment is being processed.'
              }
            </p>
          </div>
        );

      case 'success':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="CheckCircle" size={32} className="text-success" />
            </div>
            <h3 className="text-lg font-semibold text-success mb-2">
              {currentLanguage === 'am' ? 'ክፍያ ተሳክቷል!' : 'Payment Successful!'}
            </h3>
            <p className="text-text-secondary mb-6">
              {currentLanguage === 'am' 
                ? 'ክፍያዎ በተሳካ ሁኔታ ተጠናቋል። የትዕዛዝ ማረጋገጫ ወደ ኢሜይልዎ ተላክቷል።'
                : 'Your payment has been processed successfully. Order confirmation has been sent to your email.'
              }
            </p>
            <div className="bg-surface p-4 rounded-lg border border-border mb-6">
              <div className="flex items-center justify-between text-sm">
                <span className="text-text-secondary">
                  {currentLanguage === 'am' ? 'የክፍያ ID፡' : 'Payment ID:'}
                </span>
                <span className="font-mono text-text-primary">
                  {paymentDetails.paymentId || 'PAY_' + Date.now()}
                </span>
              </div>
            </div>
            <Button onClick={() => window.location.href = '/dashboard'}>
              {currentLanguage === 'am' ? 'ወደ ዳሽቦርድ ይሂዱ' : 'Go to Dashboard'}
            </Button>
          </div>
        );

      case 'failed':
        return (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Icon name="XCircle" size={32} className="text-error" />
            </div>
            <h3 className="text-lg font-semibold text-error mb-2">
              {currentLanguage === 'am' ? 'ክፍያ አልተሳካም' : 'Payment Failed'}
            </h3>
            <p className="text-text-secondary mb-6">
              {error || (currentLanguage === 'am' 
                ? 'ክፍያዎ አልተሳካም። እባክዎ እንደገና ይሞክሩ።'
                : 'Your payment could not be processed. Please try again.'
              )}
            </p>
            <div className="flex space-x-3">
              <Button onClick={() => setPaymentStep('select')}>
                {currentLanguage === 'am' ? 'እንደገና ሞክር' : 'Try Again'}
              </Button>
              <Button variant="outline" onClick={() => window.location.href = '/cart'}>
                {currentLanguage === 'am' ? 'ወደ ጋሪ ይመለሱ' : 'Back to Cart'}
              </Button>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {renderPaymentStep()}
    </div>
  );
};

export default PaymentIntegration;
