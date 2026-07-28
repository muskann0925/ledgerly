import React from "react";
import { BellOff } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No notifications yet",
  description = "When billing activity occurs (like payments, invoice views, or quote approvals), alerts will show up here.",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 my-4">
      <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/40 text-[#F97316] flex items-center justify-center mb-3 border border-orange-100 dark:border-orange-900/40">
        <BellOff className="w-6 h-6" />
      </div>
      <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-1">{title}</h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">{description}</p>
    </div>
  );
};
