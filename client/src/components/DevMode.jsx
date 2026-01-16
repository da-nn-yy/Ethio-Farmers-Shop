import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.jsx';
import Button from './ui/Button.jsx';
import Icon from './AppIcon.jsx';
import Modal from './ui/Modal.jsx';
import Input from './ui/Input.jsx';

const DevMode = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [devKey, setDevKey] = useState('');
  const [isDevMode, setIsDevMode] = useState(false);
  const [selectedRole, setSelectedRole] = useState('admin');
  const { login, clearAuth } = useAuth();
  const navigate = useNavigate();

  // Check if dev mode is already active
  useEffect(() => {
    const devModeActive = localStorage.getItem('devMode') === 'true';
    const devRole = localStorage.getItem('devRole');
    if (devModeActive && devRole) {
      setIsDevMode(true);
      setSelectedRole(devRole);
    }
  }, []);

  const handleDevModeToggle = () => {
    if (isDevMode) {
      // Exit dev mode
      clearAuth();
      localStorage.removeItem('devMode');
      localStorage.removeItem('devRole');
      localStorage.removeItem('devUserData');
      setIsDevMode(false);
      setSelectedRole('admin');
      navigate('/');
    } else {
      // Open dev mode modal
      setIsOpen(true);
    }
  };

  const handleDevLogin = async () => {
    // Simple dev key validation (in production, this would be more secure)
    const validKeys = ['dev123', 'admin123', 'test123', 'ethiofarm'];

    if (!validKeys.includes(devKey)) {
      alert('Invalid dev key. Try: dev123, admin123, test123, or ethiofarm');
      return;
    }

    // Create dev user data based on selected role
    const devUserData = createDevUserData(selectedRole);

    // Set dev mode in localStorage
    localStorage.setItem('devMode', 'true');
    localStorage.setItem('devRole', selectedRole);
    localStorage.setItem('devUserData', JSON.stringify(devUserData));
    localStorage.setItem('isAuthenticated', 'true');
    localStorage.setItem('userRole', selectedRole);
    localStorage.setItem('userData', JSON.stringify(devUserData));
    localStorage.setItem('authToken', `dev-token-${devUserData.id}`);

    // Use the login function to properly update auth context
    try {
      // Small delay to ensure localStorage is set
      await new Promise(resolve => setTimeout(resolve, 100));
      console.log('Calling login with devMode: true');
      const result = await login({ devMode: true });
      console.log('Login result:', result);

      setIsDevMode(true);
      setIsOpen(false);
      setDevKey('');

      // Navigate to appropriate dashboard
      if (selectedRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (selectedRole === 'farmer') {
        navigate('/dashboard-farmer-home');
      } else if (selectedRole === 'buyer') {
        navigate('/dashboard-buyer-home');
      }
    } catch (error) {
      console.error('Dev login failed:', error);
      // Clear localStorage on error
      localStorage.removeItem('devMode');
      localStorage.removeItem('devRole');
      localStorage.removeItem('devUserData');
      localStorage.removeItem('isAuthenticated');
      localStorage.removeItem('userRole');
      localStorage.removeItem('userData');
      localStorage.removeItem('authToken');
    }
  };

  const createDevUserData = (role) => {
    const baseData = {
      id: role === 'admin' ? 999 : (role === 'farmer' ? 998 : 997),
      firebase_uid: `dev-uid-${role}`,
      email: `dev-${role}@ethiofarm.com`,
      full_name: `Dev ${role.charAt(0).toUpperCase() + role.slice(1)}`,
      phone: '+251900000000',
      region: 'Addis Ababa',
      woreda: 'Bole',
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (role === 'admin') {
      return {
        ...baseData,
        role: 'admin',
        admin_role: 'superadmin',
        permissions: {
          users: true,
          listings: true,
          orders: true,
          analytics: true,
          settings: true,
          notifications: true
        }
      };
    } else if (role === 'farmer') {
      return {
        ...baseData,
        role: 'farmer',
        farm_name: 'Dev Farm',
        farm_size_ha: 5.0,
        experience_years: 10,
        certifications: ['Organic', 'Fair Trade'],
        crops: ['Teff', 'Wheat', 'Barley']
      };
    } else {
      return {
        ...baseData,
        role: 'buyer',
        business_name: 'Dev Trading Co.',
        business_type: 'Retailer'
      };
    }
  };

  const getDevModeStatus = () => {
    if (isDevMode) {
      return `Dev Mode: ${selectedRole.charAt(0).toUpperCase() + selectedRole.slice(1)}`;
    }
    return 'Dev Mode';
  };

  return (
    <>
      {/* Dev Mode Toggle Button */}
      <Button
        variant={isDevMode ? "destructive" : "outline"}
        size="sm"
        onClick={handleDevModeToggle}
        className="fixed bottom-4 right-4 z-50 shadow-lg"
      >
        <Icon name={isDevMode ? "X" : "Settings"} size={16} className="mr-2" />
        {getDevModeStatus()}
      </Button>

      {/* Dev Mode Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Development Mode Access"
        size="md"
      >
        <div className="space-y-6">
          <div className="text-center">
            <Icon name="Settings" size={48} className="mx-auto mb-4 text-blue-500" />
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              Development Mode
            </h3>
            <p className="text-gray-600 text-sm">
              Access admin and testing features with pre-configured accounts
            </p>
          </div>

          <div className="space-y-4">
            {/* Role Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['admin', 'farmer', 'buyer'].map((role) => (
                  <Button
                    key={role}
                    variant={selectedRole === role ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedRole(role)}
                    className="capitalize"
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>

            {/* Dev Key Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dev Key
              </label>
              <Input
                type="password"
                value={devKey}
                onChange={(e) => setDevKey(e.target.value)}
                placeholder="Enter dev key"
                className="w-full"
              />
              <p className="text-xs text-gray-500 mt-1">
                Try: dev123, admin123, test123, or ethiofarm
              </p>
            </div>

            {/* Role Description */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-800 mb-2 capitalize">
                {selectedRole} Access
              </h4>
              <p className="text-sm text-gray-600">
                {selectedRole === 'admin' &&
                  'Full admin access to all features: user management, listings, orders, analytics, and system settings.'
                }
                {selectedRole === 'farmer' &&
                  'Farmer dashboard with listing management, order tracking, and market trends.'
                }
                {selectedRole === 'buyer' &&
                  'Buyer dashboard with product browsing, cart management, and order history.'
                }
              </p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleDevLogin}
              disabled={!devKey}
              className="flex-1"
            >
              <Icon name="LogIn" size={16} className="mr-2" />
              Enter Dev Mode
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default DevMode;
