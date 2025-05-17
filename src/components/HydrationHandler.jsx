"use client";

import React, { useEffect, useState } from 'react';

export default function HydrationHandler({ children }) {
  const [isHydrated, setIsHydrated] = useState(false);
  
  // Wait for hydration to complete
  useEffect(() => {
    setIsHydrated(true);
  }, []);
  
  return (
    <>
      {/* Render a hidden div when not hydrated to prevent layout shift */}
      <div style={{ visibility: isHydrated ? 'visible' : 'hidden' }}>
        {children}
      </div>
      
      {/* Show loading if not hydrated */}
      {!isHydrated && (
        <div className="fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-800"></div>
        </div>
      )}
    </>
  );
}