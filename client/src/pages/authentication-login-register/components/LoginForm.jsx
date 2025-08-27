import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../../../firebase';
import axios from 'axios';

const LoginForm = ({ currentLanguage, onAuthSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    identifier: '',
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
    if (!formData?.identifier?.trim()) {
      newErrors.identifier = currentLanguage === 'am' ? 'ስልክ ቁጥር ወይም ኢሜይል ያስፈልጋል' : 'Phone number or email is required';
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
      const { user } = await signInWithEmailAndPassword(auth, formData.identifier, formData.password);
      const idToken = await user.getIdToken();
      try {
        await axios.post(`${import.meta.env.VITE_API_BASE_URL}/auth/sync`, {}, {
          headers: { Authorization: `Bearer ${idToken}` }
        });
      } catch (_) {}

      // Fetch profile to get role
      let userRole = 'buyer';
      try {
        const { data: profile } = await axios.get(`${import.meta.env.VITE_API_BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${idToken}` }
        });
        if (profile?.role) userRole = profile.role;
      } catch (_) {}

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('currentLanguage', currentLanguage);
      localStorage.setItem('userRole', userRole);
      onAuthSuccess(userRole);
      if (userRole === 'farmer') {
        navigate('/dashboard-farmer-home');
      } else {
        navigate('/dashboard-buyer-home');
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
        label={currentLanguage === 'am' ? 'ስልክ ቁጥር ወይም ኢሜይል' : 'Phone Number or Email'}
        type="text"
        name="identifier"
        placeholder={currentLanguage === 'am' ? '+251911234567 ወይም email@example.com' : '+251911234567 or email@example.com'}
        value={formData?.identifier}
        onChange={handleInputChange}
        error={errors?.identifier}
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
