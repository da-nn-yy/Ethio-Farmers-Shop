import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Button from '../../components/ui/Button.jsx';
import Icon from '../../components/AppIcon.jsx';
import { useLanguage } from '../../hooks/useLanguage.jsx';
import { authService } from '../../services/apiService.js';

const AdminRegister = () => {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    adminRole: 'admin',
    agreeToTerms: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const currentLanguage = language || 'en';

  const translations = {
    en: {
      title: 'Admin Registration',
      subtitle: 'Create a new administrative account',
      fullName: 'Full Name',
      email: 'Admin Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      phone: 'Phone Number',
      adminRole: 'Admin Role',
      agreeToTerms: 'I agree to the terms and conditions',
      register: 'Register Admin',
      registerSuccess: 'Admin registered successfully!',
      registerError: 'Failed to register admin',
      backToLogin: 'Back to Admin Login',
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      passwordMismatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
      termsRequired: 'You must agree to the terms and conditions',
      admin: 'Admin',
      superadmin: 'Super Admin',
      moderator: 'Moderator'
    },
    am: {
      title: 'የአስተዳደር ምዝገባ',
      subtitle: 'አዲስ የአስተዳደር መለያ ይፍጠሩ',
      fullName: 'ሙሉ ስም',
      email: 'የአስተዳደር ኢሜይል',
      password: 'የይለፍ ቃል',
      confirmPassword: 'የይለፍ ቃል አረጋግጥ',
      phone: 'ስልክ ቁጥር',
      adminRole: 'የአስተዳደር ሚና',
      agreeToTerms: 'በውሎች እና ሁኔታዎች ተስማምቻለሁ',
      register: 'አስተዳዳሪ ይመዝግቡ',
      registerSuccess: 'አስተዳዳሪ በተሳካ ሁኔታ ተመዝግቧል!',
      registerError: 'አስተዳዳሪን ማመዝገብ አልተሳካም',
      backToLogin: 'ወደ አስተዳደር መግቢያ ተመለስ',
      required: 'ይህ መስክ ያስፈልጋል',
      invalidEmail: 'እባክዎ ትክክለኛ ኢሜይል ያስገቡ',
      passwordMismatch: 'የይለፍ ቃሎች አይዛመዱም',
      passwordTooShort: 'የይለፍ ቃል ቢያንስ 6 ቁምፊዎች ሊኖሩት ይገባል',
      termsRequired: 'በውሎች እና ሁኔታዎች መስማማት አለብዎት',
      admin: 'አስተዳዳሪ',
      superadmin: 'ከፍተኛ አስተዳዳሪ',
      moderator: 'ተቆጣጣሪ'
    }
  };

  const t = translations[currentLanguage];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user types
    setSuccess(''); // Clear success message
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      setError(t.required);
      return false;
    }
    if (!formData.email.trim()) {
      setError(t.required);
      return false;
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError(t.invalidEmail);
      return false;
    }
    if (!formData.password.trim()) {
      setError(t.required);
      return false;
    }
    if (formData.password.length < 6) {
      setError(t.passwordTooShort);
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError(t.passwordMismatch);
      return false;
    }
    if (!formData.phone.trim()) {
      setError(t.required);
      return false;
    }
    if (!formData.agreeToTerms) {
      setError(t.termsRequired);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const registrationData = {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        role: 'admin',
        adminRole: formData.adminRole
      };

      const response = await authService.registerAdmin(registrationData);

      if (response.success) {
        setSuccess(t.registerSuccess);
        // Clear form
        setFormData({
          fullName: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          adminRole: 'admin',
          agreeToTerms: false
        });

        // Redirect to admin login after 2 seconds
        setTimeout(() => {
          navigate('/admin-login');
        }, 2000);
      } else {
        setError(response.message || t.registerError);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError(error.response?.data?.message || t.registerError);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate('/admin-login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-surface to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Icon name="UserPlus" size={32} className="text-primary" />
          </div>
          <h1 className="text-3xl font-bold text-text-primary mb-2">{t.title}</h1>
          <p className="text-text-secondary">{t.subtitle}</p>
        </div>

        {/* Registration Form */}
        <div className="bg-white rounded-xl shadow-warm-md border border-border p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Full Name Field */}
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-text-primary mb-2">
                {t.fullName}
              </label>
              <div className="relative">
                <Icon
                  name="User"
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                />
                <input
                  type="text"
                  id="fullName"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-smooth"
                  placeholder="John Doe"
                  disabled={isLoading}
                />
              </div>
            </div>

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

            {/* Phone Field */}
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-text-primary mb-2">
                {t.phone}
              </label>
              <div className="relative">
                <Icon
                  name="Phone"
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                />
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-smooth"
                  placeholder="+251 9XX XXX XXX"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Admin Role Field */}
            <div>
              <label htmlFor="adminRole" className="block text-sm font-medium text-text-primary mb-2">
                {t.adminRole}
              </label>
              <div className="relative">
                <Icon
                  name="Shield"
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                />
                <select
                  id="adminRole"
                  name="adminRole"
                  value={formData.adminRole}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-smooth"
                  disabled={isLoading}
                >
                  <option value="admin">{t.admin}</option>
                  <option value="superadmin">{t.superadmin}</option>
                  <option value="moderator">{t.moderator}</option>
                </select>
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

            {/* Confirm Password Field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
                {t.confirmPassword}
              </label>
              <div className="relative">
                <Icon
                  name="Lock"
                  size={18}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-text-secondary"
                />
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-smooth"
                  placeholder="••••••••"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleInputChange}
                className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                disabled={isLoading}
              />
              <label htmlFor="agreeToTerms" className="ml-2 text-sm text-text-secondary">
                {t.agreeToTerms}
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

            {/* Success Message */}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center">
                  <Icon name="CheckCircle" size={16} className="text-green-500 mr-2" />
                  <span className="text-sm text-green-700">{success}</span>
                </div>
              </div>
            )}

            {/* Register Button */}
            <Button
              type="submit"
              className="w-full"
              size="lg"
              loading={isLoading}
              disabled={isLoading}
            >
              <Icon name="UserPlus" size={20} className="mr-2" />
              {t.register}
            </Button>
          </form>

          {/* Back to Login */}
          <div className="mt-6 text-center">
            <Button
              variant="ghost"
              onClick={handleBackToLogin}
              className="text-text-secondary hover:text-primary"
            >
              <Icon name="ArrowLeft" size={16} className="mr-2" />
              {t.backToLogin}
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-sm text-text-secondary">
            {currentLanguage === 'am'
              ? 'የአስተዳደር ምዝገባ ብቻ'
              : 'Administrative registration only'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminRegister;
