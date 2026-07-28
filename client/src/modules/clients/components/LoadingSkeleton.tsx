import React from "react";
import { Skeleton } from "../../../components/ui/skeleton";

interface LoadingSkeletonProps {
  rowCount?: number;
}

export const TableLoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ rowCount = 5 }) => {
  return (
    <div className="w-full space-y-3">
      {/* Header skeleton */}
      <div className="flex items-center justify-between p-4 bg-slate-50/50 dark:bg-slate-800/30 rounded-xl border border-slate-100 dark:border-slate-800">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-16" />
      </div>

      {/* Row skeletons */}
      {Array.from({ length: rowCount }).map((_, idx) => (
        <div
          key={idx}
          className="flex items-center justify-between p-4 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-white dark:bg-[#111827]"
        >
          <div className="flex items-center gap-3 w-48">
            <Skeleton className="h-9 w-9 rounded-full shrink-0" />
            <div className="space-y-1.5 flex-1">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-20 rounded-full" />
          <Skeleton className="h-8 w-8 rounded-lg" />
        </div>
      ))}
    </div>
  );
};

export const ClientDetailsSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 p-2">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-2xl" />
        <div className="space-y-2 flex-1">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-36" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-20 w-full rounded-xl" />
      </div>
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  );
};
