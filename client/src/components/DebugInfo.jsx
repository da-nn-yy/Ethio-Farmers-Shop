import React, { useState, useEffect } from 'react';

const DebugInfo = ({ isVisible = false }) => {
  const [debugInfo, setDebugInfo] = useState({});

  useEffect(() => {
    if (isVisible) {
      const info = {
        isAuthenticated: localStorage.getItem('isAuthenticated') === 'true',
        userRole: localStorage.getItem('userRole'),
        userName: localStorage.getItem('userName'),
        authToken: localStorage.getItem('authToken') ? 'Present' : 'Missing',
        apiBase: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
        timestamp: new Date().toISOString()
      };
      setDebugInfo(info);
    }
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 p-4 bg-black bg-opacity-75 text-white text-xs rounded-lg max-w-sm z-50">
      <h3 className="font-bold mb-2">Debug Info</h3>
      <div className="space-y-1">
        {Object.entries(debugInfo).map(([key, value]) => (
          <div key={key}>
            <span className="font-semibold">{key}:</span> {String(value)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DebugInfo;
