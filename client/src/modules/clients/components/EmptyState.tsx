import React from "react";
import { Users, SearchX, UserPlus } from "lucide-react";
import { Button } from "../../../components/ui/button";

interface EmptyStateProps {
  isSearchOrFilterActive?: boolean;
  onCreateClient?: () => void;
  onClearFilters?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isSearchOrFilterActive = false,
  onCreateClient,
  onClearFilters,
}) => {
  if (isSearchOrFilterActive) {
    return (
      <div className="p-12 text-center flex flex-col items-center justify-center space-y-4 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#111827]/50 my-6">
        <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-[#F97316]">
          <SearchX className="w-7 h-7" />
        </div>
        <div className="max-w-sm space-y-1">
          <h3 className="text-base font-bold text-slate-900 dark:text-white">
            No matching clients found.
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            We couldn't find any clients matching your search query or filter parameters.
          </p>
        </div>
        <div className="flex items-center gap-3 pt-2">
          {onClearFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters} className="rounded-xl text-xs">
              Clear Filters
            </Button>
          )}
          {onCreateClient && (
            <Button size="sm" onClick={onCreateClient} className="bg-[#F97316] hover:bg-orange-600 rounded-xl text-xs">
              <UserPlus className="w-4 h-4 mr-1.5" />
              Add New Client
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="p-14 text-center flex flex-col items-center justify-center space-y-5 rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#111827]/50 my-6">
      <div className="w-16 h-16 rounded-2xl bg-orange-100/70 dark:bg-orange-950/40 flex items-center justify-center text-[#F97316] shadow-sm">
        <Users className="w-8 h-8" />
      </div>
      <div className="max-w-md space-y-1.5">
        <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
          No clients in database yet
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          Create corporate or individual client profiles to issue invoices, manage payments, and track customer accounts.
        </p>
      </div>
      {onCreateClient && (
        <Button onClick={onCreateClient} className="bg-[#F97316] hover:bg-orange-600 rounded-xl font-semibold text-xs px-5 shadow-sm shadow-orange-500/20">
          <UserPlus className="w-4 h-4 mr-2" />
          Create First Client
        </Button>
      )}
    </div>
  );
};
