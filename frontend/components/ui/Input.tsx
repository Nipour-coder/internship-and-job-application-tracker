import React, { forwardRef } from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, helperText, className = "", id, ...props }, ref) => {
    const inputId = id || props.name;

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-charcoal-200 mb-1">
            {label}
            {props.required && <span className="text-rose-400 ml-0.5">*</span>}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3 py-2 border rounded-lg shadow-inner text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/40 bg-charcoal-900 text-charcoal-100 placeholder-charcoal-500 transition-colors ${
            error
              ? "border-rose-500/80 focus:border-rose-500 focus:ring-rose-500/30"
              : "border-charcoal-700 hover:border-charcoal-600 focus:border-indigo-500"
          } ${className}`}
          {...props}
        />
        {error ? (
          <p className="mt-1 text-xs text-rose-400">{error}</p>
        ) : helperText ? (
          <p className="mt-1 text-xs text-charcoal-400">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
