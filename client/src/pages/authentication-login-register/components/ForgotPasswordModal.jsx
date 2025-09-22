import React, { useState } from 'react';
import { authService } from '../../../services/apiService';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import Icon from '../../../components/AppIcon';

const ForgotPasswordModal = ({ isOpen, onClose, currentLanguage }) => {
  const [step, setStep] = useState('request'); // 'request', 'sent', 'reset'
  const [email, setEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [token, setToken] = useState('');
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

  const getLabel = (text, textAm) => {
    return currentLanguage === 'am' ? textAm : text;
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password) => {
    return password.length >= 6;
  };

  const handleRequestReset = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');

    if (!email.trim()) {
      setErrors({ email: getLabel('Email is required', 'ኢሜይል ያስፈልጋል') });
      return;
    }

    if (!validateEmail(email)) {
      setErrors({ email: getLabel('Please enter a valid email address', 'ትክክለኛ ኢሜይል አድራሻ ያስገቡ') });
      return;
    }

    setIsLoading(true);
    try {
      await authService.requestPasswordReset(email);
      setStep('sent');
      setMessage(getLabel(
        'Password reset instructions have been sent to your email address.',
        'የይለፍ ቃል ማደስ መመሪያዎች ወደ ኢሜይል አድራሻዎ ተላክተዋል።'
      ));
    } catch (error) {
      setErrors({
        general: error.response?.data?.error || getLabel(
          'Failed to send reset email. Please try again.',
          'የማደስ ኢሜይል ማስተላልፍ አልተሳካም። እባክዎ እንደገና ይሞክሩ።'
        )
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();
    setErrors({});
    setMessage('');

    if (!token.trim()) {
      setErrors({ token: getLabel('Reset token is required', 'የማደስ ቶከን ያስፈልጋል') });
      return;
    }

    if (!newPassword.trim()) {
      setErrors({ newPassword: getLabel('New password is required', 'አዲስ የይለፍ ቃል ያስፈልጋል') });
      return;
    }

    if (!validatePassword(newPassword)) {
      setErrors({ newPassword: getLabel('Password must be at least 6 characters', 'የይለፍ ቃል ቢያንስ 6 ቁምፊ መሆን አለበት') });
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrors({ confirmPassword: getLabel('Passwords do not match', 'የይለፍ ቃሎች አይዛመዱም') });
      return;
    }

    setIsLoading(true);
    try {
      await authService.resetPassword(token, newPassword);
      setMessage(getLabel(
        'Password has been reset successfully. You can now sign in with your new password.',
        'የይለፍ ቃል በተሳካ ሁኔታ ተደስቷል። አሁን በአዲሱ የይለፍ ቃል መግባት ይችላሉ።'
      ));
      setTimeout(() => {
        onClose();
        setStep('request');
        setEmail('');
        setNewPassword('');
        setConfirmPassword('');
        setToken('');
        setMessage('');
      }, 3000);
    } catch (error) {
      setErrors({
        general: error.response?.data?.error || getLabel(
          'Failed to reset password. Please check your token and try again.',
          'የይለፍ ቃል ማደስ አልተሳካም። ቶከንዎን ያረጋግጡ እና እንደገና ይሞክሩ።'
        )
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setStep('request');
    setEmail('');
    setNewPassword('');
    setConfirmPassword('');
    setToken('');
    setMessage('');
    setErrors({});
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">
            {getLabel('Reset Password', 'የይለፍ ቃል ማደስ')}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Icon name="X" size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'request' && (
            <form onSubmit={handleRequestReset} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Lock" size={32} className="text-blue-600" />
                </div>
                <p className="text-gray-600">
                  {getLabel(
                    'Enter your email address and we\'ll send you a link to reset your password.',
                    'ኢሜይል አድራሻዎን ያስገቡ እና የይለፍ ቃልዎን ለማደስ አገናኝ እንላክልዎታለን።'
                  )}
                </p>
              </div>

              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              <Input
                label={getLabel('Email Address', 'ኢሜይል አድራሻ')}
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={getLabel('Enter your email', 'ኢሜይልዎን ያስገቡ')}
                error={errors.email}
                required
              />

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClose}
                  className="flex-1"
                >
                  {getLabel('Cancel', 'ሰርዝ')}
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  className="flex-1"
                >
                  {getLabel('Send Reset Link', 'የማደስ አገናኝ ላክ')}
                </Button>
              </div>
            </form>
          )}

          {step === 'sent' && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <Icon name="CheckCircle" size={32} className="text-green-600" />
              </div>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {getLabel('Check Your Email', 'ኢሜይልዎን ያረጋግጡ')}
                </h3>
                <p className="text-gray-600 text-sm">
                  {message}
                </p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={() => setStep('reset')}
                  className="w-full"
                >
                  {getLabel('I Have the Reset Token', 'የማደስ ቶከን አለኝ')}
                </Button>
              </div>

              <div className="pt-2">
                <Button
                  variant="outline"
                  onClick={handleClose}
                  className="w-full"
                >
                  {getLabel('Close', 'ዝጋ')}
                </Button>
              </div>
            </div>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icon name="Key" size={32} className="text-blue-600" />
                </div>
                <p className="text-gray-600">
                  {getLabel(
                    'Enter the reset token from your email and your new password.',
                    'ከኢሜይልዎ የማደስ ቶከን እና አዲሱን የይለፍ ቃል ያስገቡ።'
                  )}
                </p>
              </div>

              {errors.general && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-600">{errors.general}</p>
                </div>
              )}

              {message && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-600">{message}</p>
                </div>
              )}

              <Input
                label={getLabel('Reset Token', 'የማደስ ቶከን')}
                type="text"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder={getLabel('Enter reset token', 'የማደስ ቶከን ያስገቡ')}
                error={errors.token}
                required
              />

              <Input
                label={getLabel('New Password', 'አዲስ የይለፍ ቃል')}
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={getLabel('Enter new password', 'አዲስ የይለፍ ቃል ያስገቡ')}
                error={errors.newPassword}
                required
              />

              <Input
                label={getLabel('Confirm New Password', 'አዲሱን የይለፍ ቃል ያረጋግጡ')}
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={getLabel('Confirm new password', 'አዲሱን የይለፍ ቃል ያረጋግጡ')}
                error={errors.confirmPassword}
                required
              />

              <div className="flex space-x-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep('request')}
                  className="flex-1"
                >
                  {getLabel('Back', 'ተመለስ')}
                </Button>
                <Button
                  type="submit"
                  loading={isLoading}
                  className="flex-1"
                >
                  {getLabel('Reset Password', 'የይለፍ ቃል ማደስ')}
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;
