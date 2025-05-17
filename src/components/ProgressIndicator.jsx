import React from 'react';

const ProgressIndicator = ({ currentStep }) => {
  return (
    <div className="flex mb-4">
      <div className={`flex-1 text-center pb-2 relative ${currentStep >= 1 ? 'text-blue-800 font-medium' : 'text-gray-400'}`}>
        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center mb-1 text-xs ${currentStep >= 1 ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-500'}`}>1</div>
        <div className="text-xs md:text-sm">Personal Data</div>
        <div className="absolute w-1/2 h-1 bg-gray-300 top-3 right-0 z-0"></div>
      </div>
      <div className={`flex-1 text-center pb-2 relative ${currentStep >= 2 ? 'text-blue-800 font-medium' : 'text-gray-400'}`}>
        <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center mb-1 text-xs ${currentStep >= 2 ? 'bg-blue-800 text-white' : 'bg-gray-200 text-gray-500'}`}>2</div>
        <div className="text-xs md:text-sm">Address Data</div>
        <div className="absolute w-1/2 h-1 bg-gray-300 top-3 left-0 z-0"></div>
      </div>
    </div>
  );
};

export default ProgressIndicator;