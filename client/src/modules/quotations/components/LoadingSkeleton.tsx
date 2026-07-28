import React from "react";
import { Skeleton } from "../../../components/ui/skeleton";

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-3"
          >
            <div className="flex items-center justify-between">
              <Skeleton className="h-3 w-24 bg-slate-200 dark:bg-slate-800 rounded-lg" />
              <Skeleton className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
            </div>
            <Skeleton className="h-7 w-32 bg-slate-200 dark:bg-slate-800 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Toolbar Skeleton */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <Skeleton className="h-10 w-full max-w-sm rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Skeleton className="h-10 w-36 rounded-xl bg-slate-200 dark:bg-slate-800" />
          <Skeleton className="h-10 w-36 rounded-xl bg-slate-200 dark:bg-slate-800" />
        </div>
      </div>

      {/* Table Skeleton */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] p-4 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <Skeleton className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded-md" />
          <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
        </div>
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <Skeleton className="h-4 w-28 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <Skeleton className="h-4 w-36 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <Skeleton className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <Skeleton className="h-4 w-20 bg-slate-200 dark:bg-slate-800 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
        ))}
      </div>
    </div>
  );
};
