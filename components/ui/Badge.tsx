import { ReactNode } from "react";

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "success" | "warning" | "error" | "info" | "you";
  size?: "sm" | "md";
  className?: string;
}

export function Badge({
  children,
  variant = "default",
  size = "sm",
  className = "",
}: BadgeProps) {
  // Use inline styles for exact color control from Figma
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: "transparent",
      border: "1px solid #414651",
      color: "#FFFFFF",
    },
    success: {
      backgroundColor: "transparent",
      border: "1px solid rgba(34, 197, 94, 0.5)",
      color: "#4ade80",
    },
    warning: {
      backgroundColor: "transparent",
      border: "1px solid rgba(245, 158, 11, 0.5)",
      color: "#fbbf24",
    },
    error: {
      backgroundColor: "transparent",
      border: "1px solid rgba(239, 68, 68, 0.5)",
      color: "#f87171",
    },
    info: {
      backgroundColor: "transparent",
      border: "1px solid rgba(59, 130, 246, 0.5)",
      color: "#60a5fa",
    },
    you: {
      backgroundColor: "transparent",
      border: "1px solid #414651",
      color: "#FFFFFF",
    },
  };

  const sizes = {
    sm: "text-xs px-2 py-0.5",
    md: "text-sm px-3 py-1",
  };

  return (
    <span
      className={`inline-flex items-center font-bold uppercase ${sizes[size]} ${className}`}
      style={variantStyles[variant]}
    >
      {children}
    </span>
  );
}
