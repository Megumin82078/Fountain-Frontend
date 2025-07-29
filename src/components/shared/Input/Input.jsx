import React, { useState, forwardRef } from 'react';
import styles from './Input.module.css';

const Input = forwardRef(({
  label,
  type = 'text',
  error,
  helperText,
  disabled = false,
  required = false,
  placeholder,
  value,
  onChange,
  onFocus,
  onBlur,
  className = '',
  ...props
}, ref) => {
  const [focused, setFocused] = useState(false);
  const [hasValue, setHasValue] = useState(Boolean(value));

  const handleFocus = (e) => {
    setFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setFocused(false);
    onBlur?.(e);
  };

  const handleChange = (e) => {
    setHasValue(Boolean(e.target.value));
    onChange?.(e);
  };

  const inputClass = [
    styles.input,
    error && styles.error,
    disabled && styles.disabled,
    className
  ].filter(Boolean).join(' ');

  const containerClass = [
    styles.container,
    (focused || hasValue) && styles.active,
    error && styles.hasError,
    disabled && styles.disabled
  ].filter(Boolean).join(' ');

  return (
    <div className={containerClass}>
      <div className={styles.inputWrapper}>
        <input
          ref={ref}
          type={type}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={inputClass}
          disabled={disabled}
          placeholder={!label ? placeholder : ''}
          {...props}
        />
        {label && (
          <label className={styles.label}>
            {label}
            {required && <span className={styles.required}>*</span>}
          </label>
        )}
      </div>
      {(error || helperText) && (
        <div className={styles.helperText}>
          {error || helperText}
        </div>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;