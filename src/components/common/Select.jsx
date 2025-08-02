import React, { useState, useRef, useEffect } from 'react';
import { clsx } from 'clsx';

const Select = ({
  label,
  options = [],
  value,
  onChange,
  placeholder = 'Select an option...',
  error,
  helperText,
  required = false,
  disabled = false,
  size = 'md',
  fullWidth = true,
  searchable = false,
  multiple = false,
  className = '',
  containerClassName = '',
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const selectRef = useRef(null);
  const inputRef = useRef(null);

  const sizes = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const filteredOptions = searchable
    ? options.filter(option => 
        option.label.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (selectRef.current && !selectRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOptionClick = (option) => {
    if (multiple) {
      const currentValues = Array.isArray(value) ? value : [];
      const isSelected = currentValues.some(v => v.value === option.value);
      
      if (isSelected) {
        onChange(currentValues.filter(v => v.value !== option.value));
      } else {
        onChange([...currentValues, option]);
      }
    } else {
      onChange(option);
      setIsOpen(false);
      setSearchTerm('');
    }
  };

  const handleRemoveTag = (optionToRemove, e) => {
    e.stopPropagation();
    const currentValues = Array.isArray(value) ? value : [];
    onChange(currentValues.filter(v => v.value !== optionToRemove.value));
  };

  const getDisplayValue = () => {
    if (multiple) {
      if (Array.isArray(value) && value.length > 0) {
        return value;
      }
      return [];
    }
    return value?.label || '';
  };

  const selectClasses = clsx(
    'relative block w-full border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:border-transparent cursor-pointer',
    'bg-white text-neutral-900 placeholder-neutral-400',
    error 
      ? 'border-error-300 focus:ring-error-500' 
      : 'border-neutral-300 focus:ring-primary-500',
    disabled && 'bg-neutral-50 cursor-not-allowed opacity-50',
    sizes[size],
    className
  );

  const containerClasses = clsx(
    'relative',
    { 'w-full': fullWidth },
    containerClassName
  );

  return (
    <div className={containerClasses}>
      {label && (
        <label className="block text-sm font-medium text-neutral-700 mb-2">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <div ref={selectRef} className="relative">
        <div
          className={selectClasses}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          {...props}
        >
          <div className="flex items-center justify-between">
            <div className="flex-1 flex items-center flex-wrap gap-1">
              {multiple ? (
                getDisplayValue().length > 0 ? (
                  getDisplayValue().map((selectedOption) => (
                    <span
                      key={selectedOption.value}
                      className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800"
                    >
                      {selectedOption.label}
                      <button
                        type="button"
                        onClick={(e) => handleRemoveTag(selectedOption, e)}
                        className="ml-1 hover:text-primary-600"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </span>
                  ))
                ) : (
                  <span className="text-neutral-400">{placeholder}</span>
                )
              ) : (
                <span className={getDisplayValue() ? 'text-neutral-900' : 'text-neutral-400'}>
                  {getDisplayValue() || placeholder}
                </span>
              )}
            </div>
            
            <div className="flex items-center">
              <svg
                className={clsx(
                  'w-5 h-5 text-neutral-400 transition-transform duration-200',
                  isOpen && 'rotate-180'
                )}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white border border-neutral-300 rounded-lg shadow-elegant-lg max-h-60 overflow-auto">
            {searchable && (
              <div className="p-2 border-b border-neutral-200">
                <input
                  ref={inputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search options..."
                  className="w-full px-3 py-2 text-sm border border-neutral-300 rounded focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  autoFocus
                />
              </div>
            )}
            
            <div className="py-1">
              {filteredOptions.length === 0 ? (
                <div className="px-3 py-2 text-sm text-neutral-500">
                  No options found
                </div>
              ) : (
                filteredOptions.map((option) => {
                  const isSelected = multiple
                    ? Array.isArray(value) && value.some(v => v.value === option.value)
                    : value?.value === option.value;

                  return (
                    <div
                      key={option.value}
                      className={clsx(
                        'px-3 py-2 text-sm cursor-pointer flex items-center justify-between',
                        'hover:bg-neutral-100 transition-colors',
                        isSelected && 'bg-primary-50 text-primary-900'
                      )}
                      onClick={() => handleOptionClick(option)}
                    >
                      <span>{option.label}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <div className="mt-1">
          {error && (
            <p className="text-sm text-error-600 flex items-center">
              <svg className="w-4 h-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </p>
          )}
          {!error && helperText && (
            <p className="text-sm text-neutral-500">{helperText}</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Select;