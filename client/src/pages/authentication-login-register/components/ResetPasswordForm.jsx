import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { authService } from '../../../services/apiService';

const ResetPasswordForm = ({ currentLanguage }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(true);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    const tokenFromUrl = searchParams.get('token');
    if (tokenFromUrl) {
      setToken(tokenFromUrl);
      validateToken(tokenFromUrl);
    } else {
      setError('Invalid reset link');
      setIsValidating(false);
    }
  }, [searchParams]);

  const validateToken = async (tokenToValidate) => {
    try {
      const response = await authService.verifyResetToken(tokenToValidate);
      setEmail(response.email);
      setIsValidating(false);
    } catch (error) {
      setError('Invalid or expired reset token');
      setIsValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setIsLoading(false);
      return;
    }

    try {
      const response = await authService.resetPassword({ 
        token, 
        newPassword: password 
      });
      setMessage(response.message);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/authentication-login-register');
      }, 3000);
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const t = {
    en: {
      title: 'Reset Password',
      subtitle: 'Enter your new password below.',
      passwordLabel: 'New Password',
      passwordPlaceholder: 'Enter new password',
      confirmPasswordLabel: 'Confirm Password',
      confirmPasswordPlaceholder: 'Confirm new password',
      resetButton: 'Reset Password',
      backToLogin: 'Back to Login',
      successMessage: 'Password has been reset successfully. Redirecting to login...',
      errorMessage: 'Failed to reset password. Please try again.',
      passwordsNotMatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters long',
      invalidToken: 'Invalid or expired reset token',
      validating: 'Validating reset token...'
    },
    am: {
      title: 'ፓስዎርድ አስተካከል',
      subtitle: 'ከዚህ በታች አዲሱን ፓስዎርድ ያስገቡ።',
      passwordLabel: 'አዲስ ፓስዎርድ',
      passwordPlaceholder: 'አዲስ ፓስዎርድ ያስገቡ',
      confirmPasswordLabel: 'ፓስዎርድ አረጋግጥ',
      confirmPasswordPlaceholder: 'አዲሱን ፓስዎርድ አረጋግጥ',
      resetButton: 'ፓስዎርድ አስተካከል',
      backToLogin: 'ወደ መግባት ተመለስ',
      successMessage: 'ፓስዎርድ በተሳካ ሁኔታ ተስተካክሏል። ወደ መግባት ተመለስ...',
      errorMessage: 'ፓስዎርድ ማስተካከል አልተሳካም። እባክዎ እንደገና ይሞክሩ።',
      passwordsNotMatch: 'ፓስዎርዶች አይጣጣሙም',
      passwordTooShort: 'ፓስዎርድ ቢያንስ 6 ቁምፊዎች መሆን አለበት',
      invalidToken: 'ልክ ያልሆነ ወይም የተጠናቀቀ የማስተካከያ ቶከን',
      validating: 'የማስተካከያ ቶከን እያረጋገጠ...'
    }
  };

  const text = t[currentLanguage] || t.en;

  if (isValidating) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
        <p className="text-gray-600">{text.validating}</p>
      </div>
    );
  }

  if (error && !token) {
    return (
      <div className="w-full max-w-md mx-auto text-center">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md mb-6">
          {text.invalidToken}
        </div>
        <Button
          onClick={() => navigate('/authentication-login-register')}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {text.backToLogin}
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {text.title}
        </h1>
        <p className="text-gray-600">
          {text.subtitle}
        </p>
        {email && (
          <p className="text-sm text-gray-500 mt-2">
            Resetting password for: {email}
          </p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
            {text.passwordLabel}
          </label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={text.passwordPlaceholder}
            required
            className="w-full"
            minLength={6}
          />
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
            {text.confirmPasswordLabel}
          </label>
          <Input
            id="confirmPassword"
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder={text.confirmPasswordPlaceholder}
            required
            className="w-full"
            minLength={6}
          />
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
            {message}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md">
            {error}
          </div>
        )}

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          {isLoading ? 'Resetting...' : text.resetButton}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={() => navigate('/authentication-login-register')}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {text.backToLogin}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResetPasswordForm;















