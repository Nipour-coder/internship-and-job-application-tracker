import React from "react";

export function LoadingSkeleton({
  type = "card",
  count = 3,
  message = "Loading...",
}: {
  type?: "card" | "table" | "list";
  count?: number;
  message?: string;
}) {
  return (
    <div className="w-full space-y-4 animate-pulse">
      {message && (
        <div className="flex items-center gap-2 text-sm text-charcoal-400 font-medium mb-3">
          <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
          {message}
        </div>
      )}
      {type === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="bg-charcoal-850 border border-charcoal-700 rounded-xl p-5 space-y-3">
              <div className="h-4 bg-charcoal-750 rounded w-2/3" />
              <div className="h-3 bg-charcoal-800 rounded w-1/2" />
              <div className="h-12 bg-charcoal-800/60 rounded" />
              <div className="h-3 bg-charcoal-750 rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {type === "table" && (
        <div className="bg-charcoal-850 border border-charcoal-700 rounded-xl overflow-hidden p-4 space-y-4">
          <div className="h-8 bg-charcoal-800 rounded w-full" />
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-10 bg-charcoal-800/50 rounded w-full flex items-center px-4 gap-4">
              <div className="h-3 bg-charcoal-750 rounded w-1/4" />
              <div className="h-3 bg-charcoal-750 rounded w-1/4" />
              <div className="h-3 bg-charcoal-750 rounded w-1/4" />
              <div className="h-3 bg-charcoal-750 rounded w-1/4" />
            </div>
          ))}
        </div>
      )}

      {type === "list" && (
        <div className="space-y-3">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="h-16 bg-charcoal-850 border border-charcoal-700 rounded-xl p-4 flex items-center justify-between">
              <div className="space-y-2 w-1/3">
                <div className="h-3.5 bg-charcoal-750 rounded" />
                <div className="h-2.5 bg-charcoal-800 rounded w-2/3" />
              </div>
              <div className="h-6 w-16 bg-charcoal-750 rounded-full" />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
