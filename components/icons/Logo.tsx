
import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M20 80V20H50C66.5685 20 80 33.4315 80 50C80 66.5685 66.5685 80 50 80H20Z" fill="currentColor" fillOpacity="0.2"/>
    <path d="M45 65V35H52.5C59.4036 35 65 40.5964 65 47.5V47.5C65 54.4036 59.4036 60 52.5 60H49.5" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
    <path d="M20 65V35" stroke="currentColor" strokeWidth="10" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);
