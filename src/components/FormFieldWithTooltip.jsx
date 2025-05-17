import React from 'react';

const FormFieldWithTooltip = ({ 
  id, 
  label, 
  type, 
  value, 
  onChange, 
  placeholder, 
  tooltip, 
  required = true, 
  maxLength,
  formSubmitted,
  formErrors
}) => {
  const hasError = formSubmitted && formErrors[id];
  
  return (
    <div className="mb-3">
      <div className="flex items-center mb-1">
        <label htmlFor={id} className="block text-xs font-medium text-gray-500 uppercase">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        <div className="relative ml-1 group">
          <div className="cursor-help text-gray-400">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="12" y1="16" x2="12" y2="12"></line>
              <line x1="12" y1="8" x2="12.01" y2="8"></line>
            </svg>
          </div>
          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 bg-gray-800 text-white text-xs rounded p-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity z-10">
            {tooltip}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-2 h-2 bg-gray-800 rotate-45"></div>
          </div>
        </div>
      </div>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={type === 'email' ? 'email' : type === 'tel' ? 'tel' : undefined}
        required={required}
        value={value}
        onChange={onChange}
        className={`appearance-none block w-full px-3 py-2 border ${hasError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-sm`}
        placeholder={placeholder}
        maxLength={maxLength}
      />
      {hasError && (
        <p className="mt-1 text-xs text-red-500">{formErrors[id]}</p>
      )}
    </div>
  );
};

export default FormFieldWithTooltip;