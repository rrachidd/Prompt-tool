import React from 'react';

export const MiscToolIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h8.25v8.25h-8.25V6.75z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v3.75m0 10.5V21m5.25-12l-2.625 2.625M6.375 17.625l2.625-2.625M21 12h-3.75m-10.5 0H3" />
  </svg>
);