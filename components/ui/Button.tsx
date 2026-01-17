"use client";

import { forwardRef, ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = "primary",
      size = "md",
      loading = false,
      disabled,
      className = "",
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-xl transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-stage-400 focus-visible:ring-offset-2 focus-visible:ring-offset-backdrop-950 disabled:opacity-50 disabled:cursor-not-allowed";

    const variants = {
      primary:
        "bg-gradient-to-r from-stage-500 to-stage-600 text-white hover:from-stage-400 hover:to-stage-500 active:from-stage-600 active:to-stage-700 shadow-lg shadow-stage-500/25",
      secondary:
        "bg-backdrop-800 text-backdrop-100 hover:bg-backdrop-700 active:bg-backdrop-900 border border-backdrop-700",
      ghost:
        "text-backdrop-300 hover:text-backdrop-100 hover:bg-backdrop-800/50 active:bg-backdrop-800",
      danger:
        "bg-red-500/20 text-red-400 hover:bg-red-500/30 active:bg-red-500/40 border border-red-500/30",
    };

    const sizes = {
      sm: "text-sm py-2 px-4 min-h-[36px]",
      md: "text-base py-3 px-6 min-h-[48px]",
      lg: "text-lg py-4 px-8 min-h-[56px]",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        {...props}
      >
        {loading ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-2 h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            Loading...
          </>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
