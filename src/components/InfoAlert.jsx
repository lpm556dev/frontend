import React from 'react';

const InfoAlert = ({ message, bgColor = 'bg-blue-50', textColor = 'text-blue-800', borderColor = '' }) => {
  return (
    <div className={`${bgColor} ${borderColor} rounded-md p-3 mb-3`}>
      <div className="flex items-start">
        <div className="flex-shrink-0 text-blue-800">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        </div>
        <div className="ml-2">
          <p className={`text-xs ${textColor}`}>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default InfoAlert;