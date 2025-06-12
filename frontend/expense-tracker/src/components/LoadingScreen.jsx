// File: src/components/common/LoadingScreen.jsx
// Create this new file for a branded loading screen

import React from 'react';
import FintasticLogo from './FintasticLogo';

const LoadingScreen = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="animate-pulse mb-6">
        <FintasticLogo size={100} />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">Fintastic</h2>
      <p className="text-gray-600 mb-4">Loading your financial dashboard...</p>
      <div className="flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
      </div>
    </div>
  </div>
);

export default LoadingScreen;