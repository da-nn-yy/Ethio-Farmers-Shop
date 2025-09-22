import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../../components/ui/Button';
import Input from '../../../components/ui/Input';
import { authService } from '../../../services/apiService';

const ForgotPasswordForm = ({ currentLanguage, onBack }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authService.forgotPassword({ email });
      setMessage(response.message);
      
      // In development, show the reset URL
      if (response.resetUrl) {
        console.log('Reset URL:', response.resetUrl);
      }
    } catch (error) {
      setError(error.response?.data?.error || 'Failed to send reset email');
    } finally {
      setIsLoading(false);
    }
  };

  const t = {
    en: {
      title: 'Forgot Password',
      subtitle: 'Enter your email address and we\'ll send you a link to reset your password.',
      emailLabel: 'Email Address',
      emailPlaceholder: 'Enter your email',
      sendButton: 'Send Reset Link',
      backToLogin: 'Back to Login',
      successMessage: 'If an account with that email exists, a password reset link has been sent.',
      errorMessage: 'Failed to send reset email. Please try again.'
    },
    am: {
      title: 'ፓስዎርድ ረሳሁ',
      subtitle: 'ኢሜል አድራሻዎን ያስገቡ እና የፓስዎርድ ማስተካከያ ሊንክ እንላክልዎታለን።',
      emailLabel: 'ኢሜል አድራሻ',
      emailPlaceholder: 'ኢሜልዎን ያስገቡ',
      sendButton: 'ማስተካከያ ሊንክ ላክ',
      backToLogin: 'ወደ መግባት ተመለስ',
      successMessage: 'ከዚያ ኢሜል ጋር መለያ ካለ የፓስዎርድ ማስተካከያ ሊንክ ተልኳል።',
      errorMessage: 'የማስተካከያ ኢሜል ላክ አልተሳካም። እባክዎ እንደገና ይሞክሩ።'
    }
  };

  const text = t[currentLanguage] || t.en;

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {text.title}
        </h1>
        <p className="text-gray-600">
          {text.subtitle}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            {text.emailLabel}
          </label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={text.emailPlaceholder}
            required
            className="w-full"
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
          {isLoading ? 'Sending...' : text.sendButton}
        </Button>

        <div className="text-center">
          <button
            type="button"
            onClick={onBack}
            className="text-emerald-600 hover:text-emerald-700 font-medium"
          >
            {text.backToLogin}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ForgotPasswordForm;















