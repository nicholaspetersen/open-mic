"use client";

import { forwardRef, InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className = "", id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-backdrop-200 mb-2"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`
            w-full px-4 py-3 min-h-[48px]
            bg-backdrop-800/50 border border-backdrop-700
            rounded-xl text-backdrop-100 placeholder-backdrop-500
            focus:outline-none focus:ring-2 focus:ring-stage-400 focus:border-transparent
            transition-all
            ${error ? "border-red-500 focus:ring-red-500" : ""}
            ${className}
          `}
          {...props}
        />
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
        {hint && !error && (
          <p className="mt-2 text-sm text-backdrop-500">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
