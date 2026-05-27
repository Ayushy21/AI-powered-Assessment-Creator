'use client';

import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  icon?: React.ReactNode;
  required?: boolean;
}

export default function Input({
  label,
  error,
  hint,
  icon,
  required,
  className = '',
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className="form-group">
      {label && (
        <label htmlFor={inputId} className="form-label">
          {label}
          {required && <span className="form-label-required">*</span>}
        </label>
      )}
      <div className={icon ? 'form-input-wrapper' : ''}>
        {icon && <span className="form-input-icon">{icon}</span>}
        <input
          id={inputId}
          className={`form-input ${icon ? 'form-input-with-icon' : ''} ${error ? 'form-input-error' : ''} ${className}`}
          {...props}
        />
      </div>
      {error && (
        <span className="form-error">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="15" y1="9" x2="9" y2="15" />
            <line x1="9" y1="9" x2="15" y2="15" />
          </svg>
          {error}
        </span>
      )}
      {hint && !error && <span className="form-hint">{hint}</span>}
    </div>
  );
}
