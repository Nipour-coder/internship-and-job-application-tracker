import React from "react";
import { LucideIcon, Inbox } from "lucide-react";
import { Button } from "./Button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionText?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center p-8 text-center bg-charcoal-850/80 rounded-xl border border-dashed border-charcoal-700 my-4 text-charcoal-100 ${className}`}
    >
      <div className="w-12 h-12 rounded-full bg-charcoal-800 border border-charcoal-700 flex items-center justify-center text-charcoal-400 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <h3 className="text-base font-semibold text-charcoal-100 mb-1">{title}</h3>
      {description && <p className="text-sm text-charcoal-400 max-w-sm mb-4">{description}</p>}
      {actionText && onAction && (
        <Button variant="primary" onClick={onAction}>
          {actionText}
        </Button>
      )}
    </div>
  );
}
