import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth.jsx';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/AppIcon.jsx';
import { useLanguage } from '../../hooks/useLanguage.jsx';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, user } = useAuth();
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const currentLanguage = language || 'en';

  const translations = {
    en: {
      title: 'Admin Login',
      subtitle: 'Access the administrative dashboard',
      email: 'Admin Email',
      password: 'Password',
      rememberMe: 'Remember me',
      login: 'Login as Admin',
      loginError: 'Invalid admin credentials',
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      backToHome: 'Back to Home',
      devMode: 'Development Mode',
      devLogin: 'Quick Dev Login'
    },
    am: {
      title: 'የአስተዳደር መግቢያ',
      subtitle: 'የአስተዳደር ዳሽቦርድ ይደርሱ',
      email: 'የአስተዳደር ኢሜይል',
      password: 'የይለፍ ቃል',
      rememberMe: 'አስታውሰኝ',
      login: 'እንደ አስተዳዳሪ ይግቡ',
      loginError: 'የማይሰራ የአስተዳደር ምስክር',
      required: 'ይህ መስክ ያስፈልጋል',
      invalidEmail: 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ',
      backToHome: 'ወደ ቤት ተመለስ',
      devMode: 'የልማት ሁነታ',
      devLogin: 'ፈጣን የልማት መግቢያ'
    }
  };

  const t = translations[currentLanguage];

  // Redirect if already authenticated as admin
  React.useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      navigate('/admin-dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.email.trim()) {
      setError(t.required);
      return false;
    }
    if (!formData.password.trim()) {
      setError(t.required);
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError(t.invalidEmail);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');

    try {
      await login(formData.email, formData.password, formData.rememberMe);

      // Check if user is admin after login
      if (user?.role === 'admin') {
        navigate('/admin-dashboard');
      } else {
        setError(t.loginError);
      }
    } catch (error) {
      console.error('Login error:', error);
      setError(t.loginError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDevLogin = () => {
    // Quick dev login for admin
    setFormData({
      email: 'admin@ethiofarm.com',
      password: 'admin123',
      rememberMe: false
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-surface to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="Shield" size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">{t.title}</h1>
          <p className="text-text-secondary">{t.subtitle}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-xl shadow-warm-md border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                {t.email}
              </label>
              <div className="relative">
                <Icon
                  name="Mail"
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-smooth"
                  placeholder="admin@example.com"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                {t.password}
              </label>
              <div className="relative">
                <Icon
                  name="Lock"
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                />
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-smooth"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                disabled={isLoading}
              />
              <label htmlFor="rememberMe" className="ml-2 text-sm text-text-secondary">
                {t.rememberMe}
              </label>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <div className="flex items-center">
                  <Icon name="AlertCircle" size={16} className="text-red-500 mr-2" />
                  <span className="text-sm text-red-700">{error}</span>
                </div>
              </div>
            )}

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              <Icon name="LogIn" size={20} className="mr-2" />
              {t.login}
            </Button>
          </form>

          {/* Dev Mode Section */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-sm text-text-secondary mb-3">{t.devMode}</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDevLogin}
                  className="w-full"
                >
                  <Icon name="Zap" size={16} className="mr-2" />
                  {t.devLogin}
                </Button>
              </div>
            </div>
          )}

          {/* Back to Home and Register */}
          <div className="mt-6 space-y-3">
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/admin-register')}
                className="text-primary hover:text-primary/80"
              >
                <Icon name="UserPlus" size={16} className="mr-2" />
                {currentLanguage === 'am' ? 'አዲስ አስተዳዳሪ ይመዝግቡ' : 'Register New Admin'}
              </Button>
            </div>
            <div className="text-center">
              <Button
                variant="ghost"
                onClick={() => navigate('/')}
                className="text-text-secondary hover:text-primary"
              >
                <Icon name="ArrowLeft" size={16} className="mr-2" />
                {t.backToHome}
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-text-secondary">
            {currentLanguage === 'am'
              ? 'የአስተዳደር መግቢያ ብቻ'
              : 'Administrative access only'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
