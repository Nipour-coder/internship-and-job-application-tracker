import React from "react";

export type StatusType = "APPLIED" | "INTERVIEW" | "OFFER" | "REJECTED" | string;

interface BadgeProps {
  status: StatusType;
  className?: string;
}

export function Badge({ status, className = "" }: BadgeProps) {
  const norm = status?.toUpperCase();

  const getStyle = () => {
    switch (norm) {
      case "APPLIED":
        return "bg-blue-950/60 text-blue-300 border-blue-800/70";
      case "INTERVIEW":
        return "bg-amber-950/60 text-amber-300 border-amber-800/70";
      case "OFFER":
        return "bg-emerald-950/60 text-emerald-300 border-emerald-800/70";
      case "REJECTED":
        return "bg-rose-950/60 text-rose-300 border-rose-800/70";
      case "INTERNSHIP":
        return "bg-purple-950/60 text-purple-300 border-purple-800/70";
      case "GRADUATE":
        return "bg-cyan-950/60 text-cyan-300 border-cyan-800/70";
      default:
        return "bg-charcoal-800 text-charcoal-300 border-charcoal-700";
    }
  };

  const getLabel = () => {
    switch (norm) {
      case "APPLIED":
        return "Applied";
      case "INTERVIEW":
        return "Interview";
      case "OFFER":
        return "Offer";
      case "REJECTED":
        return "Rejected";
      default:
        return status;
    }
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle()} ${className}`}
    >
      {getLabel()}
    </span>
  );
}
