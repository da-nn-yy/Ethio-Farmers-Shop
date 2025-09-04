import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { useAuth } from '../../../hooks/useAuth';

const LoginForm = ({ currentLanguage, onAuthSuccess }) => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e?.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors?.[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.email?.trim()) {
      newErrors.email = currentLanguage === 'am' ? 'ኢሜይል ያስፈልጋል' : 'Email is required';
    }
    if (!formData?.password) {
      newErrors.password = currentLanguage === 'am' ? 'የይለፍ ቃል ያስፈልጋል' : 'Password is required';
    }
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);

    try {
      const result = await login(formData);

      if (result.success) {
        localStorage.setItem('currentLanguage', currentLanguage);
        onAuthSuccess(result.user.role);

        if (result.user.role === 'farmer') {
          navigate('/dashboard-farmer-home');
        } else {
          navigate('/dashboard-buyer-home');
        }
      } else {
        setErrors({
          general: result.error || (currentLanguage === 'am' ? 'የተሳሳተ መለያ ወይም የይለፍ ቃል' : 'Invalid credentials')
        });
      }
    } catch (error) {
      setErrors({
        general: currentLanguage === 'am' ? 'የተሳሳተ መለያ ወይም የይለፍ ቃል' : 'Invalid credentials'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors?.general && (
        <div className="p-4 bg-error/10 border border-error/20 rounded-lg">
          <p className="text-sm text-error">{errors?.general}</p>
        </div>
      )}
      <Input
        label={currentLanguage === 'am' ? 'ኢሜይል' : 'Email'}
        type="email"
        name="email"
        placeholder={currentLanguage === 'am' ? 'email@example.com' : 'email@example.com'}
        value={formData?.email}
        onChange={handleInputChange}
        error={errors?.email}
        required
      />
      <Input
        label={currentLanguage === 'am' ? 'የይለፍ ቃል' : 'Password'}
        type="password"
        name="password"
        placeholder={currentLanguage === 'am' ? 'የይለፍ ቃልዎን ያስገቡ' : 'Enter your password'}
        value={formData?.password}
        onChange={handleInputChange}
        error={errors?.password}
        required
      />
      <div className="flex items-center justify-between">
        <Checkbox
          label={currentLanguage === 'am' ? 'አስታውሰኝ' : 'Remember me'}
          checked={formData?.rememberMe}
          onChange={handleInputChange}
          name="rememberMe"
        />
        <button
          type="button"
          className="text-sm text-primary hover:text-primary/80 transition-smooth"
        >
          {currentLanguage === 'am' ? 'የይለፍ ቃል ረሳኽ?' : 'Forgot password?'}
        </button>
      </div>
      <Button
        type="submit"
        variant="default"
        size="lg"
        loading={isLoading}
        className="w-full"
      >
        {currentLanguage === 'am' ? 'ግባ' : 'Sign In'}
      </Button>
    </form>
  );
};

export default LoginForm;
