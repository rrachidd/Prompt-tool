import React from 'react';

export const BarcodeScanIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 8V6a2 2 0 012-2h2M4 16v2a2 2 0 002 2h2M16 4h2a2 2 0 012 2v2M16 20h2a2 2 0 002-2v-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 12h10" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 8h2m4 0h2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 16h2m4 0h2" />
  </svg>
);