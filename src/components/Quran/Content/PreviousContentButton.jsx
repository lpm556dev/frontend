import React from 'react';

const PreviousContentButton = ({ currentType, previousItem, onGoBack }) => {
  if (!previousItem) return null;
  
  let buttonText = '';
  switch (currentType) {
    case 'surah':
      buttonText = `Kembali ke Surah ${previousItem.name}`;
      break;
    case 'page':
      buttonText = `Kembali ke Halaman ${previousItem.number}`;
      break;
    case 'juz':
      buttonText = `Kembali ke Juz ${previousItem.number}`;
      break;
    default:
      buttonText = 'Kembali';
  }
  
  return (
    <div className="mb-8 text-center">
      <button
        onClick={onGoBack}
        className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 shadow-md flex items-center justify-center mx-auto"
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
            d="M9 15l7-7-7-7" 
          />
        </svg>
        <span>{buttonText}</span>
      </button>
    </div>
  );
};

export default PreviousContentButton;