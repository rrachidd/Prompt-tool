import React from 'react';

export const MazeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 4.875A.375.375 0 014.125 4.5h15.75a.375.375 0 01.375.375v14.25a.375.375 0 01-.375.375H4.125a.375.375 0 01-.375-.375V4.875z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v3.75m-3.75 0H12m0 0h3.75M12 8.25v3.75m0 0H8.25m3.75 0h3.75M12 12v3.75m0 0H8.25m3.75 0h3.75m-7.5-3.75h3.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5v3.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 4.5v3.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 15.75v3.75" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 15.75v3.75" />
  </svg>
);
