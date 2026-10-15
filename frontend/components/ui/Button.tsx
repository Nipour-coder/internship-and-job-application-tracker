"use client";

import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  icon?: React.ReactNode;
}

export function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading = false,
  icon,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles =
    "inline-flex items-center justify-center font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-charcoal-900 disabled:opacity-50 disabled:cursor-not-allowed";

  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs gap-1.5",
    md: "px-4 py-2 text-sm gap-2",
    lg: "px-5 py-2.5 text-base gap-2.5",
  };

  const variantStyles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-500 focus:ring-indigo-400 shadow-md shadow-indigo-950/50",
    secondary: "bg-charcoal-750 text-charcoal-100 hover:bg-charcoal-700 border border-charcoal-600 focus:ring-charcoal-500",
    danger: "bg-rose-600 text-white hover:bg-rose-500 focus:ring-rose-500 shadow-md shadow-rose-950/40",
    outline: "border border-charcoal-600 text-charcoal-200 hover:bg-charcoal-800 hover:border-charcoal-500 focus:ring-indigo-500 bg-charcoal-850/90",
    ghost: "text-charcoal-400 hover:text-charcoal-100 hover:bg-charcoal-800 focus:ring-charcoal-600",
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : icon}
      {children}
    </button>
  );
}
