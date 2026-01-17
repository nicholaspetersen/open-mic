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
      style,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold uppercase tracking-tight transition-all focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed";

    const variantStyles = {
      primary: "",
      secondary: "",
      ghost: "",
      danger: "",
    };

    const sizes = {
      sm: "text-xs py-2 px-4 min-h-[36px]",
      md: "text-sm py-3 px-6 min-h-[48px]",
      lg: "text-base py-3 px-4 min-h-[48px]",
    };

    // Use inline styles for exact color control
    const variantInlineStyles: Record<string, React.CSSProperties> = {
      primary: {
        backgroundColor: "#FAC515",
        color: "#0A0D12",
        boxShadow: "1px 1px 0px 0px #C09800, 2px 2px 0px 0px #C09800, 3px 3px 0px 0px #C09800, 4px 4px 0px 0px #C09800",
      },
      secondary: {
        backgroundColor: "#181D27",
        color: "#FFFFFF",
        border: "1px solid #252B37",
      },
      ghost: {
        backgroundColor: "transparent",
        color: "#A4A7AE",
      },
      danger: {
        backgroundColor: "#181D27",
        color: "#f87171",
        border: "1px solid rgba(248, 113, 113, 0.3)",
      },
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={`${baseStyles} ${variantStyles[variant]} ${sizes[size]} ${className}`}
        style={{ ...variantInlineStyles[variant], ...style }}
        onMouseDown={(e) => {
          if (variant === "primary") {
            e.currentTarget.style.boxShadow = "none";
            e.currentTarget.style.transform = "translate(4px, 4px)";
          }
        }}
        onMouseUp={(e) => {
          if (variant === "primary") {
            e.currentTarget.style.boxShadow = "1px 1px 0px 0px #C09800, 2px 2px 0px 0px #C09800, 3px 3px 0px 0px #C09800, 4px 4px 0px 0px #C09800";
            e.currentTarget.style.transform = "none";
          }
        }}
        onMouseLeave={(e) => {
          if (variant === "primary") {
            e.currentTarget.style.boxShadow = "1px 1px 0px 0px #C09800, 2px 2px 0px 0px #C09800, 3px 3px 0px 0px #C09800, 4px 4px 0px 0px #C09800";
            e.currentTarget.style.transform = "none";
          }
        }}
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
