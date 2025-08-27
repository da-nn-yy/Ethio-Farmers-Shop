import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import { Checkbox } from '../../../components/ui/Checkbox';
import RoleSelector from './RoleSelector';
import LocationSelector from './LocationSelector';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { auth } from '../../../firebase';
import axios from 'axios';

const RegisterForm = ({ currentLanguage, onAuthSuccess }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    role: '',
    fullName: '',
    phoneNumber: '',
    email: '',
    region: '',
    woreda: '',
    password: '',
    confirmPassword: '',
    agreeToTerms: false
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

  const handleRoleChange = (role) => {
    setFormData(prev => ({ ...prev, role }));
    if (errors?.role) {
      setErrors(prev => ({ ...prev, role: '' }));
    }
  };

  const handleRegionChange = (region) => {
    setFormData(prev => ({ ...prev, region, woreda: '' }));
    if (errors?.region) {
      setErrors(prev => ({ ...prev, region: '' }));
    }
  };

  const handleWoredaChange = (woreda) => {
    setFormData(prev => ({ ...prev, woreda }));
    if (errors?.woreda) {
      setErrors(prev => ({ ...prev, woreda: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData?.role) newErrors.role = currentLanguage === 'am' ? 'ሚና መምረጥ ያስፈልጋል' : 'Role selection is required';
    if (!formData?.fullName?.trim()) newErrors.fullName = currentLanguage === 'am' ? 'ሙሉ ስም ያስፈልጋል' : 'Full name is required';
    if (!formData?.phoneNumber?.trim()) newErrors.phoneNumber = currentLanguage === 'am' ? 'ስልክ ቁጥር ያስፈልጋል' : 'Phone number is required';
    else if (!/^\+251[0-9]{9}$/.test(formData?.phoneNumber)) newErrors.phoneNumber = currentLanguage === 'am' ? 'ትክክለኛ የኢትዮጵያ ስልክ ቁጥር ያስገቡ (+251xxxxxxxxx)' : 'Enter valid Ethiopian phone number (+251xxxxxxxxx)';
    if (formData?.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData?.email)) newErrors.email = currentLanguage === 'am' ? 'ትክክለኛ ኢሜይል አድራሻ ያስገቡ' : 'Enter valid email address';
    if (!formData?.region) newErrors.region = currentLanguage === 'am' ? 'ክልል መምረጥ ያስፈልጋል' : 'Region selection is required';
    if (!formData?.woreda) newErrors.woreda = currentLanguage === 'am' ? 'ወረዳ መምረጥ ያስፈልጋል' : 'Woreda selection is required';
    if (!formData?.password) newErrors.password = currentLanguage === 'am' ? 'የይለፍ ቃል ያስፈልጋል' : 'Password is required';
    else if (formData?.password?.length < 6) newErrors.password = currentLanguage === 'am' ? 'የይለፍ ቃል ቢያንስ 6 ቁምፊ መሆን አለበት' : 'Password must be at least 6 characters';
    if (formData?.password !== formData?.confirmPassword) newErrors.confirmPassword = currentLanguage === 'am' ? 'የይለፍ ቃሎች አይዛመዱም' : 'Passwords do not match';
    if (!formData?.agreeToTerms) newErrors.agreeToTerms = currentLanguage === 'am' ? 'የአገልግሎት ውሎችን መቀበል ያስፈልጋል' : 'You must agree to the terms of service';
    setErrors(newErrors);
    return Object.keys(newErrors)?.length === 0;
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    try {
      // Require email for Firebase email/password. If missing, derive a pseudo-email from phone
      const email = formData.email?.trim();
      if (!email) {
        setErrors({ email: currentLanguage === 'am' ? 'ኢሜይል ያስፈልጋል ለመጀመር' : 'Email is required to register' });
        setIsLoading(false);
        return;
      }
      const { user } = await createUserWithEmailAndPassword(auth, email, formData.password);
      if (formData.fullName) {
        try { await updateProfile(user, { displayName: formData.fullName }); } catch (_) {}
      }
      const idToken = await user.getIdToken();
      const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
      await axios.post(`${API_BASE}/users`, {
        role: formData.role,
        fullName: formData.fullName,
        phoneNumber: formData.phoneNumber,
        email: email,
        region: formData.region,
        woreda: formData.woreda
      }, { headers: { Authorization: `Bearer ${idToken}` } });

      localStorage.setItem('isAuthenticated', 'true');
      localStorage.setItem('userRole', formData?.role);
      localStorage.setItem('currentLanguage', currentLanguage);
      onAuthSuccess(formData?.role);
      navigate(formData?.role === 'farmer' ? '/dashboard-farmer-home' : '/browse-listings-buyer-home');
    } catch (error) {
      setErrors({ general: currentLanguage === 'am' ? 'ምዝገባ አልተሳካም' : 'Registration failed' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {errors?.general && (
        <div className="p-4 border rounded-lg bg-error/10 border-error/20">
          <p className="text-sm text-error">{errors?.general}</p>
        </div>
      )}
      <RoleSelector
        selectedRole={formData?.role}
        onRoleChange={handleRoleChange}
        currentLanguage={currentLanguage}
      />
      {errors?.role && (
        <p className="-mt-4 text-sm text-error">{errors?.role}</p>
      )}
      <Input
        label={currentLanguage === 'am' ? 'ሙሉ ስም' : 'Full Name'}
        type="text"
        name="fullName"
        placeholder={currentLanguage === 'am' ? 'የእርስዎን ሙሉ ስም ያስገቡ' : 'Enter your full name'}
        value={formData?.fullName}
        onChange={handleInputChange}
        error={errors?.fullName}
        required
      />
      <Input
        label={currentLanguage === 'am' ? 'ስልክ ቁጥር' : 'Phone Number'}
        type="tel"
        name="phoneNumber"
        placeholder="+251911234567"
        value={formData?.phoneNumber}
        onChange={handleInputChange}
        error={errors?.phoneNumber}
        description={currentLanguage === 'am' ? 'ዋና የመገናኛ ዘዴ' : 'Primary contact method'}
        required
      />
      <Input
        label={currentLanguage === 'am' ? 'ኢሜይል አድራሻ' : 'Email Address'}
        type="email"
        name="email"
        placeholder={currentLanguage === 'am' ? 'email@example.com' : 'email@example.com'}
        value={formData?.email}
        onChange={handleInputChange}
        error={errors?.email}
        required
      />
      <LocationSelector
        selectedRegion={formData?.region}
        selectedWoreda={formData?.woreda}
        onRegionChange={handleRegionChange}
        onWoredaChange={handleWoredaChange}
        currentLanguage={currentLanguage}
      />
      {(errors?.region || errors?.woreda) && (
        <div className="space-y-1">
          {errors?.region && <p className="text-sm text-error">{errors?.region}</p>}
          {errors?.woreda && <p className="text-sm text-error">{errors?.woreda}</p>}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input
          label={currentLanguage === 'am' ? 'የይለፍ ቃል' : 'Password'}
          type="password"
          name="password"
          placeholder={currentLanguage === 'am' ? 'የይለፍ ቃል ይፍጠሩ' : 'Create password'}
          value={formData?.password}
          onChange={handleInputChange}
          error={errors?.password}
          required
        />
        <Input
          label={currentLanguage === 'am' ? 'የይለፍ ቃል ያረጋግጡ' : 'Confirm Password'}
          type="password"
          name="confirmPassword"
          placeholder={currentLanguage === 'am' ? 'የይለፍ ቃል ያረጋግጡ' : 'Confirm password'}
          value={formData?.confirmPassword}
          onChange={handleInputChange}
          error={errors?.confirmPassword}
          required
        />
      </div>
      <Checkbox
        label={
          currentLanguage === 'am' ? 'የአገልግሎት ውሎችን እና የግላዊነት ፖሊሲን እቀበላለሁ' : 'I agree to the Terms of Service and Privacy Policy'
        }
        checked={formData?.agreeToTerms}
        onChange={handleInputChange}
        name="agreeToTerms"
        error={errors?.agreeToTerms}
        required
      />
      <Button
        type="submit"
        variant="default"
        size="lg"
        loading={isLoading}
        className="w-full"
      >
        {currentLanguage === 'am' ? 'ተመዝገብ' : 'Create Account'}
      </Button>
    </form>
  );
};

export default RegisterForm;
