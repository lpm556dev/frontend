import React from 'react';

const FormField = ({ 
  id, 
  label, 
  type, 
  value, 
  onChange, 
  placeholder, 
  required = true, 
  maxLength, 
  readOnly = false,
  formSubmitted,
  formErrors,

  additionalClassName = "", // Tambahkan prop untuk kelas tambahan
  options = [] // Add options parameter for dropdown
}) => {
  const hasError = formSubmitted && formErrors[id];
  
  return (
    <div className="mb-3">
      <label htmlFor={id} className="block text-xs font-medium text-gray-500 uppercase mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {type === 'textarea' ? (
        <textarea
          id={id}
          name={id}
          required={required}
          value={value}
          onChange={onChange}
          rows={2}
          className={`appearance-none block w-full px-3 py-2 border ${hasError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-sm ${readOnly ? 'bg-gray-100' : ''} ${additionalClassName}`}
          placeholder={placeholder}
          maxLength={maxLength}
          readOnly={readOnly}
        />
      ) : type === 'select' ? (
        <select
          id={id}
          name={id}
          required={required}
          value={value}
          onChange={onChange}
          className={`appearance-none block w-full px-3 py-2 border ${hasError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-sm ${readOnly ? 'bg-gray-100' : ''} ${additionalClassName}`}
          disabled={readOnly}
        >
          {options.length > 0 ? (
            options.map((option, index) => (
              <option key={index} value={option.value}>{option.label}</option>
            ))
          ) : (
            // Fallback for compatibility with old code
            <>
              <option value="">Select Gender</option>
              <option value="L">Male</option>
              <option value="P">Female</option>
            </>
          )}
        </select>
      ) : (
        <input
          id={id}
          name={id}
          type={type}
          autoComplete={type === 'email' ? 'email' : type === 'tel' ? 'tel' : type === 'password' ? (id === 'passwordSignup' ? 'new-password' : 'current-password') : undefined}
          required={required}
          value={value}
          onChange={onChange}
          className={`appearance-none block w-full px-3 py-2 border ${hasError ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-800 focus:border-blue-800 text-sm ${readOnly ? 'bg-gray-100' : ''} ${additionalClassName}`}
          placeholder={placeholder}
          maxLength={maxLength}
          readOnly={readOnly}
        />
      )}
      {hasError && (
        <p className="mt-1 text-xs text-red-500">{formErrors[id]}</p>
      )}
    </div>
  );
};

export default FormField;