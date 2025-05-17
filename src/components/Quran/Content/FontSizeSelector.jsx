import React from 'react';

const FontSizeSelector = ({ title, currentSize, onChange }) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">{title}:</span>
      <div className="flex bg-gray-100 rounded-md">
        <button
          onClick={() => onChange('small')}
          className={`px-3 py-1 text-xs rounded-l-md ${
            currentSize === 'small' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
          }`}
        >
          Kecil
        </button>
        <button
          onClick={() => onChange('medium')}
          className={`px-3 py-1 text-xs ${
            currentSize === 'medium' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
          }`}
        >
          Sedang
        </button>
        <button
          onClick={() => onChange('large')}
          className={`px-3 py-1 text-xs rounded-r-md ${
            currentSize === 'large' ? 'bg-blue-600 text-white' : 'hover:bg-gray-200'
          }`}
        >
          Besar
        </button>
      </div>
    </div>
  );
};

export default FontSizeSelector;