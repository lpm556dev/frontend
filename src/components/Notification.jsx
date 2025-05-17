import React, { useEffect } from 'react';

const Notification = ({ message, type = 'success', onClose, duration = 3000 }) => {
  useEffect(() => {
    // Auto-close notification after the specified duration
    if (duration > 0) {
      const timer = setTimeout(() => {
        if (onClose) onClose();
      }, duration);
      
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  // Determine background color based on type
  const getBgColor = () => {
    switch (type) {
      case 'success':
        return 'bg-green-500';
      case 'error':
        return 'bg-red-500';
      case 'warning':
        return 'bg-yellow-500';
      case 'info':
        return 'bg-blue-500';
      default:
        return 'bg-green-500';
    }
  };

  return (
    <div 
      className={`fixed top-4 right-4 ${getBgColor()} text-white px-4 py-3 rounded shadow-lg z-50 max-w-sm animate-fadeIn`}
      style={{ animation: 'fadeIn 0.3s ease-in-out' }}
    >
      <div className="flex items-center justify-between">
        <span>{message}</span>
        <button 
          onClick={onClose} 
          className="ml-4 text-white hover:text-gray-200 focus:outline-none"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

export default Notification;