// File: src/components/common/FintasticLogo.jsx
// Create this new file for the Fintastic logo component

import React from 'react';

const FintasticLogo = ({ size = 40 }) => (
  <div style={{ width: size, height: size }}>
    <svg width={size} height={size} viewBox="0 0 40 40">
      <defs>
        <linearGradient id="fintasticGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#a855f7" />
          <stop offset="100%" stopColor="#7c3aed" />
        </linearGradient>
      </defs>
      <rect width="40" height="40" rx="12" fill="url(#fintasticGradient)" />
      {/* Rounded F */}
      <path d="M10 10 Q10 8 12 8 L26 8 Q28 8 28 10 Q28 12 26 12 L16 12 L16 18 L24 18 Q26 18 26 20 Q26 22 24 22 L16 22 L16 30 Q16 32 14 32 Q12 32 12 30 L12 12 Q12 10 10 10" 
            fill="white" />
    </svg>
  </div>
);

export default FintasticLogo;