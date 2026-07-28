import React from "react";
import { Skeleton } from "../../../components/ui/skeleton";

interface TableLoadingSkeletonProps {
  rowCount?: number;
}

export const TableLoadingSkeleton: React.FC<TableLoadingSkeletonProps> = ({
  rowCount = 5,
}) => {
  return (
    <div className="w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] overflow-hidden shadow-xs">
      <div className="p-4 space-y-3">
        {Array.from({ length: rowCount }).map((_, idx) => (
          <div key={idx} className="flex items-center justify-between gap-4">
            <Skeleton className="h-4 w-28 rounded-lg" />
            <Skeleton className="h-4 w-40 rounded-lg" />
            <Skeleton className="h-4 w-24 rounded-lg hidden sm:block" />
            <Skeleton className="h-4 w-24 rounded-lg hidden md:block" />
            <Skeleton className="h-4 w-20 rounded-lg" />
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-8 w-8 rounded-xl shrink-0" />
          </div>
        ))}
      </div>
    </div>
  );
};
