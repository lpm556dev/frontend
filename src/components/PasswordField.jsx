import React from 'react';

const PasswordField = ({ 
  id, 
  label, 
  value, 
  onChange, 
  placeholder, 
  isVisible, 
  setIsVisible, 
  required = true,
  formSubmitted,
  formErrors
}) => {
  const hasError = formSubmitted && formErrors[id];
  
  return (
    <div className="mb-3">
      <label htmlFor={id} className="block text-xs font-medium text-gray-500 uppercase mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="relative">
        <input
          id={id}
          name={id}
          type={isVisible ? "text" : "password"}
          autoComplete={id === 'kataSandi' ? 'new-password' : 'current-password'}
          required={required}
          value={value}
          onChange={onChange}
          className={`appearance-none block w-full px-3 py-2 border ${hasError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-sm pr-10`}
          placeholder={placeholder}
        />
        <button 
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
          onClick={() => setIsVisible(!isVisible)}
        >
          {isVisible ? (
            // Eye-off icon (for hiding password)
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
              <line x1="1" y1="1" x2="23" y2="23"></line>
            </svg>
          ) : (
            // Eye icon (for showing password)
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
              <circle cx="12" cy="12" r="3"></circle>
            </svg>
          )}
        </button>
      </div>
      {hasError && (
        <p className="mt-1 text-xs text-red-500">{formErrors[id]}</p>
      )}
    </div>
  );
};

export default PasswordField;