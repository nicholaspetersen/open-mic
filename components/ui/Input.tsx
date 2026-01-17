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
            className="block text-sm font-bold uppercase mb-2"
            style={{ color: "#A4A7AE" }}
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-4 py-3 min-h-[48px] transition-all focus:outline-none focus:ring-2 focus:ring-[#FAC515] focus:border-transparent ${className}`}
          style={{
            backgroundColor: "#181D27",
            border: error ? "1px solid #ef4444" : "1px solid #252B37",
            color: "#FFFFFF",
          }}
          {...props}
        />
        {error && <p className="mt-2 text-sm" style={{ color: "#f87171" }}>{error}</p>}
        {hint && !error && (
          <p className="mt-2 text-sm" style={{ color: "#A4A7AE" }}>{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
