import React, { useState } from 'react';
import Icon from '../AppIcon';
import Button from '../ui/Button';
import Input from '../ui/Input';

const PaymentVerification = ({ 
  currentLanguage = 'en',
  paymentMethod,
  onVerificationComplete,
  onVerificationFailed 
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState('pending'); // 'pending', 'sent', 'verified', 'failed'
  const [error, setError] = useState('');

  const handleSendVerification = async () => {
    setIsVerifying(true);
    setError('');
    
    try {
      // Simulate sending verification code
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setVerificationStep('sent');
      
      // Show success message
      setTimeout(() => {
        setVerificationStep('pending');
      }, 3000);
      
    } catch (err) {
      setError(currentLanguage === 'am' ? 'የማረጋገጫ ኮድ መላክ አልተሳካም' : 'Failed to send verification code');
      setIsVerifying(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!verificationCode) {
      setError(currentLanguage === 'am' ? 'የማረጋገጫ ኮድ ያስገቡ' : 'Please enter verification code');
      return;
    }

    setIsVerifying(true);
    setError('');
    
    try {
      // Simulate verification
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock verification - accept codes starting with '123'
      if (verificationCode.startsWith('123')) {
        setVerificationStep('verified');
        onVerificationComplete?.({
          paymentMethod,
          verificationCode,
          timestamp: new Date().toISOString(),
          status: 'verified'
        });
      } else {
        setVerificationStep('failed');
        setError(currentLanguage === 'am' ? 'የማረጋገጫ ኮድ ትክክል አይደለም' : 'Invalid verification code');
        onVerificationFailed?.(error);
      }
    } catch (err) {
      setVerificationStep('failed');
      setError(currentLanguage === 'am' ? 'የማረጋገጫ ሂደት አልተሳካም' : 'Verification failed');
      onVerificationFailed?.(error);
    } finally {
      setIsVerifying(false);
    }
  };

  const getVerificationMethod = () => {
    switch (paymentMethod?.type) {
      case 'bank':
        return {
          method: currentLanguage === 'am' ? 'ባንክ ሂሳብ' : 'Bank Account',
          description: currentLanguage === 'am' 
            ? 'የባንክ ሂሳብዎ በማረጋገጫ ኮድ ይረጋገጣል' 
            : 'Your bank account will be verified with a code',
          icon: 'Building2'
        };
      case 'mobile':
        return {
          method: currentLanguage === 'am' ? 'ሞባይል ባንኪንግ' : 'Mobile Banking',
          description: currentLanguage === 'am' 
            ? 'የሞባይል ባንኪንግ ሂሳብዎ በማረጋገጫ ኮድ ይረጋገጣል' 
            : 'Your mobile banking account will be verified with a code',
          icon: 'Smartphone'
        };
      case 'cash':
        return {
          method: currentLanguage === 'am' ? 'የሚደርስ ጊዜ ክፍያ' : 'Cash on Delivery',
          description: currentLanguage === 'am' 
            ? 'የክፍያ ዘዴዎ ተረጋግጧል' 
            : 'Your payment method has been verified',
          icon: 'Banknote'
        };
      default:
        return {
          method: currentLanguage === 'am' ? 'ክፍያ' : 'Payment',
          description: currentLanguage === 'am' 
            ? 'የክፍያ ዘዴዎ ይረጋገጣል' 
            : 'Your payment method will be verified',
          icon: 'Shield'
        };
    }
  };

  const verificationInfo = getVerificationMethod();

  if (paymentMethod?.type === 'cash') {
    return (
      <div className="bg-surface p-6 rounded-lg border border-border">
        <div className="text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={32} className="text-success" />
          </div>
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            {currentLanguage === 'am' ? 'ክፍያ ዘዴ ተረጋግጧል' : 'Payment Method Verified'}
          </h3>
          <p className="text-text-secondary mb-6">
            {currentLanguage === 'am' 
              ? 'የሚደርስ ጊዜ ክፍያ እንደ የክፍያ ዘዴ ተረጋግጧል። ክፍያ የሚከናወንበት ጊዜ ምርቱ የሚደርስበት ጊዜ ነው።'
              : 'Cash on delivery has been set as your payment method. Payment will be made when the product is delivered.'
            }
          </p>
          <Button onClick={() => onVerificationComplete?.(paymentMethod)}>
            {currentLanguage === 'am' ? 'ቀጥል' : 'Continue'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface p-6 rounded-lg border border-border">
      <div className="text-center mb-6">
        <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Icon name={verificationInfo.icon} size={32} className="text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-text-primary mb-2">
          {currentLanguage === 'am' ? 'የክፍያ ዘዴ ማረጋገጫ' : 'Payment Method Verification'}
        </h3>
        <p className="text-text-secondary">
          {verificationInfo.description}
        </p>
      </div>

      {verificationStep === 'pending' && (
        <div className="space-y-4">
          <div className="p-4 bg-primary/5 rounded-lg border border-primary/20">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="Info" size={16} className="text-primary" />
              <span className="text-sm font-medium text-primary">
                {currentLanguage === 'am' ? 'ማረጋገጫ ኮድ' : 'Verification Code'}
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              {currentLanguage === 'am' 
                ? 'የማረጋገጫ ኮድ ወደ ስልክዎ ይላካል። ለማስቀመጥ የሚላክበት ቁጥር: 1234567890'
                : 'A verification code will be sent to your phone. For testing, use: 1234567890'
              }
            </p>
          </div>

          <Button
            onClick={handleSendVerification}
            disabled={isVerifying}
            className="w-full"
          >
            {isVerifying ? (
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>{currentLanguage === 'am' ? 'በመላክ ላይ...' : 'Sending...'}</span>
              </div>
            ) : (
              currentLanguage === 'am' ? 'የማረጋገጫ ኮድ ላክ' : 'Send Verification Code'
            )}
          </Button>
        </div>
      )}

      {verificationStep === 'sent' && (
        <div className="space-y-4">
          <div className="p-4 bg-success/5 rounded-lg border border-success/20">
            <div className="flex items-center space-x-2 mb-2">
              <Icon name="CheckCircle" size={16} className="text-success" />
              <span className="text-sm font-medium text-success">
                {currentLanguage === 'am' ? 'ኮድ ተላክቷል' : 'Code Sent'}
              </span>
            </div>
            <p className="text-sm text-text-secondary">
              {currentLanguage === 'am' 
                ? 'የማረጋገጫ ኮድ ወደ ስልክዎ ተላክቷል።'
                : 'Verification code has been sent to your phone.'
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              {currentLanguage === 'am' ? 'የማረጋገጫ ኮድ' : 'Verification Code'}
            </label>
            <Input
              type="text"
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value)}
              placeholder={currentLanguage === 'am' ? '6-ዲጂት ኮድ ያስገቡ' : 'Enter 6-digit code'}
              maxLength={6}
              className="text-center text-lg tracking-widest"
            />
          </div>

          {error && (
            <div className="p-3 bg-error/5 rounded-lg border border-error/20">
              <div className="flex items-center space-x-2">
                <Icon name="AlertCircle" size={16} className="text-error" />
                <span className="text-sm text-error">{error}</span>
              </div>
            </div>
          )}

          <div className="flex space-x-3">
            <Button
              onClick={handleVerifyCode}
              disabled={isVerifying || !verificationCode}
              className="flex-1"
            >
              {isVerifying ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>{currentLanguage === 'am' ? 'በማረጋገጥ ላይ...' : 'Verifying...'}</span>
                </div>
              ) : (
                currentLanguage === 'am' ? 'አረጋግጥ' : 'Verify'
              )}
            </Button>
            <Button
              variant="outline"
              onClick={() => setVerificationStep('pending')}
              className="flex-1"
            >
              {currentLanguage === 'am' ? 'ኮድ እንደገና ላክ' : 'Resend Code'}
            </Button>
          </div>
        </div>
      )}

      {verificationStep === 'verified' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="CheckCircle" size={32} className="text-success" />
          </div>
          <h3 className="text-lg font-semibold text-success mb-2">
            {currentLanguage === 'am' ? 'ተረጋግጧል!' : 'Verified!'}
          </h3>
          <p className="text-text-secondary mb-6">
            {currentLanguage === 'am' 
              ? 'የክፍያ ዘዴዎ በተሳካ ሁኔታ ተረጋግጧል።'
              : 'Your payment method has been successfully verified.'
            }
          </p>
          <Button onClick={() => onVerificationComplete?.(paymentMethod)}>
            {currentLanguage === 'am' ? 'ቀጥል' : 'Continue'}
          </Button>
        </div>
      )}

      {verificationStep === 'failed' && (
        <div className="text-center">
          <div className="w-16 h-16 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Icon name="XCircle" size={32} className="text-error" />
          </div>
          <h3 className="text-lg font-semibold text-error mb-2">
            {currentLanguage === 'am' ? 'ማረጋገጫ አልተሳካም' : 'Verification Failed'}
          </h3>
          <p className="text-text-secondary mb-6">
            {error || (currentLanguage === 'am' 
              ? 'የማረጋገጫ ሂደት አልተሳካም። እባክዎ እንደገና ይሞክሩ።'
              : 'Verification process failed. Please try again.'
            )}
          </p>
          <div className="flex space-x-3">
            <Button
              onClick={() => {
                setVerificationStep('pending');
                setError('');
                setVerificationCode('');
              }}
              className="flex-1"
            >
              {currentLanguage === 'am' ? 'እንደገና ሞክር' : 'Try Again'}
            </Button>
            <Button
              variant="outline"
              onClick={() => onVerificationFailed?.(error)}
              className="flex-1"
            >
              {currentLanguage === 'am' ? 'ይሂዱ' : 'Skip'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;
