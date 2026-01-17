import { ReactNode, CSSProperties } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "highlight" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
  style?: CSSProperties;
}

export function Card({
  children,
  className = "",
  variant = "default",
  padding = "md",
  style,
}: CardProps) {
  // Use inline styles for exact color control from Figma
  const variantStyles: Record<string, React.CSSProperties> = {
    default: {
      backgroundColor: "#181D27",
      border: "1px solid #252B37",
    },
    highlight: {
      backgroundColor: "#181D27",
      border: "1px solid #FAC515",
    },
    ghost: {
      backgroundColor: "transparent",
    },
  };

  const paddings = {
    none: "",
    sm: "px-3 py-2",
    md: "p-4",
    lg: "p-6",
  };

  return (
    <div
      className={`${paddings[padding]} ${className}`}
      style={{ ...variantStyles[variant], ...style }}
    >
      {children}
    </div>
  );
}
