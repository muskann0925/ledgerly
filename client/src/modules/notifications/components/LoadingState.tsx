import React from "react";

interface LoadingStateProps {
  count?: number;
}

export const LoadingState: React.FC<LoadingStateProps> = ({ count = 3 }) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827] flex gap-3 animate-pulse"
        >
          <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-800 shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex items-center justify-between">
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-1/3" />
              <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-16" />
            </div>
            <div className="h-3 bg-slate-200 dark:bg-slate-800 rounded w-4/5" />
          </div>
        </div>
      ))}
    </div>
  );
};
