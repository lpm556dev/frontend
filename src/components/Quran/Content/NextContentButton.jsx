import React from 'react';

const NextContentButton = ({ currentType, nextItem, onContinue }) => {
  if (!nextItem) return null;
  
  let buttonText = '';
  switch (currentType) {
    case 'surah':
      buttonText = `Lanjutkan ke Surah ${nextItem.name}`;
      break;
    case 'page':
      buttonText = `Lanjutkan ke Halaman ${nextItem.number}`;
      break;
    case 'juz':
      buttonText = `Lanjutkan ke Juz ${nextItem.number}`;
      break;
    default:
      buttonText = 'Lanjutkan';
  }
  
  return (
    <div className="mt-8 text-center">
      <button
        onClick={onContinue}
        className="px-6 py-3 bg-blue-900 text-white rounded-lg hover:bg-blue-800 transition-colors duration-200 shadow-md flex items-center justify-center mx-auto"
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          className="h-5 w-5 mr-2" 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M15 19l-7-7 7-7" 
          />
        </svg>
        <span>{buttonText}</span>
      </button>
    </div>
  );
};

export default NextContentButton;