import React from 'react';
import AppImage from '../AppImage';

const FullScreenLoader = ({ label = 'Loading…', logoSrc = '/assets/images/no_image.png' }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
      <div className="flex flex-col items-center">
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
          <div className="absolute inset-0 h-14 w-14 rounded-full border-4 border-emerald-200 animate-ping opacity-30" />
        </div>
        <AppImage src={logoSrc} alt="logo" className="mt-4 h-8 w-8 rounded" />
        <div className="mt-2 text-sm font-medium text-gray-700">{label}</div>
      </div>
    </div>
  );
};

export default FullScreenLoader;


