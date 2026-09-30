import React from 'react';

interface NufcCrestProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const NufcCrest: React.FC<NufcCrestProps> = ({ className = '', size = 'md' }) => {
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24'
  };

  const dim = sizeMap[size] || sizeMap.md;

  return (
    <div className={`relative flex items-center justify-center shrink-0 ${dim} ${className}`}>
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-[0_4px_12px_rgba(218,41,28,0.45)]"
      >
        <defs>
          <linearGradient id="shieldGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#DA291C" />
            <stop offset="50%" stopColor="#9B111E" />
            <stop offset="100%" stopColor="#0B0E14" />
          </linearGradient>
          <linearGradient id="goldGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFE066" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="ballGrad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#D1D5DB" />
          </linearGradient>
        </defs>

        {/* Outer Shield with Gold Border */}
        <path
          d="M50 4 L88 15 C88 56 68 85 50 96 C32 85 12 56 12 15 Z"
          fill="url(#shieldGrad)"
          stroke="url(#goldGrad)"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* Inner Shield Inset */}
        <path
          d="M50 10 L82 19 C82 52 65 77 50 88 C35 77 18 52 18 19 Z"
          fill="#0B0E14"
          fillOpacity="0.85"
          stroke="url(#goldGrad)"
          strokeWidth="1.2"
        />

        {/* Vertical Red & Gold Club Stripes */}
        <path d="M43 12 L43 83 C45.3 84.7 47.6 86 50 87.2 C52.4 86 54.7 84.7 57 83 L57 12 Z" fill="#DA291C" opacity="0.85" />
        <line x1="50" y1="11" x2="50" y2="87" stroke="url(#goldGrad)" strokeWidth="1" strokeDasharray="2 2" />

        {/* Center Football Emblem */}
        <g transform="translate(50, 46)">
          {/* Football Circle */}
          <circle cx="0" cy="0" r="16" fill="url(#ballGrad)" stroke="#111827" strokeWidth="1.5" />
          
          {/* Classic Football Pentagon & Seams */}
          <polygon points="0,-6 5.7,-1.8 3.5,4.8 -3.5,4.8 -5.7,-1.8" fill="#111827" />
          <line x1="0" y1="-6" x2="0" y2="-16" stroke="#111827" strokeWidth="1.2" />
          <line x1="5.7" y1="-1.8" x2="15" y2="-5" stroke="#111827" strokeWidth="1.2" />
          <line x1="3.5" y1="4.8" x2="10" y2="12" stroke="#111827" strokeWidth="1.2" />
          <line x1="-3.5" y1="4.8" x2="-10" y2="12" stroke="#111827" strokeWidth="1.2" />
          <line x1="-5.7" y1="-1.8" x2="-15" y2="-5" stroke="#111827" strokeWidth="1.2" />
        </g>

        {/* Top Two Championship Stars */}
        <g fill="url(#goldGrad)">
          <path d="M38 18 L39.5 21.5 L43 21.8 L40.3 24.1 L41.2 27.5 L38 25.5 L34.8 27.5 L35.7 24.1 L33 21.8 L36.5 21.5 Z" />
          <path d="M62 18 L63.5 21.5 L67 21.8 L64.3 24.1 L65.2 27.5 L62 25.5 L58.8 27.5 L59.7 24.1 L57 21.8 L60.5 21.5 Z" />
        </g>

        {/* Bottom Banner Ribbon */}
        <rect x="22" y="70" width="56" height="12" rx="3" fill="#DA291C" stroke="url(#goldGrad)" strokeWidth="1" />
        <text
          x="50"
          y="79"
          textAnchor="middle"
          fill="#FFFFFF"
          fontSize="7.5"
          fontWeight="900"
          fontFamily="system-ui, sans-serif"
          letterSpacing="0.8"
        >
          NUFC 2569
        </text>

        {/* Top Text Arc */}
        <text
          x="50"
          y="28"
          textAnchor="middle"
          fill="url(#goldGrad)"
          fontSize="5"
          fontWeight="800"
          letterSpacing="1.2"
        >
          NARESUAN
        </text>
      </svg>
    </div>
  );
};
