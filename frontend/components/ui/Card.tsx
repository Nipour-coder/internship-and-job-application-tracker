import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className = "", onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-charcoal-850 rounded-xl border border-charcoal-700 shadow-lg shadow-black/20 p-5 transition-all text-charcoal-100 ${
        onClick ? "cursor-pointer hover:border-charcoal-600 hover:bg-charcoal-800/80 hover:shadow-xl" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}
