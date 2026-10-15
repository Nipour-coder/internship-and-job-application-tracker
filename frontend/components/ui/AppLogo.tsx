import React from "react";

interface AppLogoProps {
  size?: number | string;
  className?: string;
  variant?: "mark" | "full" | "watermark";
  textClassName?: string;
  subtextClassName?: string;
}

export function AppLogo({
  size = 36,
  className = "",
  variant = "mark",
  textClassName = "",
  subtextClassName = "",
}: AppLogoProps) {
  const pixelSize = typeof size === "number" ? `${size}px` : size;

  // Watermark version for hero background
  if (variant === "watermark") {
    return (
      <svg
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
        style={{ width: pixelSize, height: pixelSize }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="watermark-grad" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.8" />
            <stop offset="50%" stopColor="currentColor" stopOpacity="0.4" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0.1" />
          </linearGradient>
        </defs>

        {/* Outer Shield & Compass Ring */}
        <circle cx="60" cy="60" r="54" stroke="url(#watermark-grad)" strokeWidth="2" strokeDasharray="6 6" />
        <rect
          x="12"
          y="12"
          width="96"
          height="96"
          rx="28"
          stroke="url(#watermark-grad)"
          strokeWidth="3"
        />

        {/* Graduation Mortarboard Peak */}
        <path
          d="M60 22L98 40L60 58L22 40Z"
          fill="url(#watermark-grad)"
          stroke="currentColor"
          strokeWidth="2"
        />
        <path
          d="M90 44V60C90 60 84 72 60 72C36 72 30 60 30 60V44"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Dynamic Career Trajectory Arrow */}
        <path
          d="M26 94C38 88 52 74 74 46L96 24"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M78 24H96V42"
          stroke="currentColor"
          strokeWidth="5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 4 Pipeline Stage Nodes */}
        <circle cx="28" cy="92" r="6" fill="currentColor" />
        <circle cx="46" cy="78" r="6" fill="currentColor" />
        <circle cx="68" cy="56" r="6" fill="currentColor" />
        <circle cx="94" cy="26" r="8" fill="currentColor" />
      </svg>
    );
  }

  // Standard Mark
  const logoMark = (
    <svg
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: pixelSize, height: pixelSize }}
      className={`shrink-0 ${className}`}
      aria-label="Application Tracker Logo"
    >
      <defs>
        {/* Dynamic Brand Gradients */}
        <linearGradient id="logo-bg-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#1E2230" />
          <stop offset="100%" stopColor="#111318" />
        </linearGradient>
        <linearGradient id="logo-border-grad" x1="0" y1="0" x2="100" y2="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="50%" stopColor="#6366F1" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>
        <linearGradient id="logo-cap-grad" x1="20" y1="20" x2="80" y2="60" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#4F46E5" />
        </linearGradient>
        <linearGradient id="logo-swoosh-grad" x1="20" y1="80" x2="85" y2="25" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="50%" stopColor="#818CF8" />
          <stop offset="100%" stopColor="#A855F7" />
        </linearGradient>
        <filter id="logo-glow" x="-10%" y="-10%" width="120%" height="120%" filterUnits="userSpaceOnUse">
          <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#6366F1" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Rounded Squircle Container */}
      <rect
        x="6"
        y="6"
        width="88"
        height="88"
        rx="24"
        fill="url(#logo-bg-grad)"
        stroke="url(#logo-border-grad)"
        strokeWidth="2.5"
      />

      {/* Inner Cap Silhouette */}
      <path
        d="M50 20L78 33L50 46L22 33Z"
        fill="url(#logo-cap-grad)"
        filter="url(#logo-glow)"
      />
      <path
        d="M74 37V48C74 48 68 57 50 57C32 57 26 48 26 48V37"
        stroke="#818CF8"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.8"
      />

      {/* Upward Career Trajectory Arrow */}
      <path
        d="M24 78C34 72 46 60 62 42L80 22"
        stroke="url(#logo-swoosh-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
      <path
        d="M66 22H80V36"
        stroke="url(#logo-swoosh-grad)"
        strokeWidth="3.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Stage Nodes: Applied, Interview, Offer, Target */}
      <circle cx="26" cy="76" r="3" fill="#38BDF8" />
      <circle cx="40" cy="65" r="3" fill="#818CF8" />
      <circle cx="56" cy="49" r="3" fill="#A855F7" />
      <circle cx="78" cy="24" r="4.5" fill="#38BDF8" stroke="#FFFFFF" strokeWidth="1.5" />
    </svg>
  );

  if (variant === "mark") {
    return logoMark;
  }

  // Full variant with brand typography
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {logoMark}
      <div className="flex flex-col">
        <span className={`font-bold text-charcoal-100 leading-tight tracking-tight ${textClassName || "text-base sm:text-lg"}`}>
          Internship & Job Tracker
        </span>
        <span className={`text-xs text-charcoal-400 font-medium ${subtextClassName || "hidden sm:block"}`}>
          Early-Career & Student Platform
        </span>
      </div>
    </div>
  );
}
