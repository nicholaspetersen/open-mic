import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  variant?: "default" | "highlight" | "ghost";
  padding?: "none" | "sm" | "md" | "lg";
}

export function Card({
  children,
  className = "",
  variant = "default",
  padding = "md",
}: CardProps) {
  const variants = {
    default: "bg-backdrop-800/50 border border-backdrop-700",
    highlight:
      "bg-gradient-to-br from-stage-500/10 to-stage-600/5 border border-stage-500/30",
    ghost: "bg-transparent",
  };

  const paddings = {
    none: "",
    sm: "p-3",
    md: "p-4 sm:p-6",
    lg: "p-6 sm:p-8",
  };

  return (
    <div
      className={`rounded-2xl ${variants[variant]} ${paddings[padding]} ${className}`}
    >
      {children}
    </div>
  );
}
