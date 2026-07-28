import React from "react";
import { Button } from "../../../components/ui/button";
import { Receipt, Plus, FilterX } from "lucide-react";

interface EmptyStateProps {
  isSearchOrFilterActive: boolean;
  onCreateInvoice: () => void;
  onClearFilters: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  isSearchOrFilterActive,
  onCreateInvoice,
  onClearFilters,
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs select-none">
      <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-900/50 flex items-center justify-center text-[#F97316] mb-4 shadow-sm">
        <Receipt className="w-7 h-7" />
      </div>

      <h3 className="text-lg font-bold text-slate-900 dark:text-white">
        {isSearchOrFilterActive ? "No matching invoices found" : "No invoices created yet"}
      </h3>

      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6">
        {isSearchOrFilterActive
          ? "No billing invoices match your current search query or filter parameters. Try clearing filters or altering search terms."
          : "Start issuing customer invoices for your billing operations. Create your first service invoice now."}
      </p>

      <div className="flex items-center gap-3">
        {isSearchOrFilterActive ? (
          <Button
            onClick={onClearFilters}
            variant="outline"
            className="rounded-xl text-xs font-semibold px-4"
          >
            <FilterX className="w-4 h-4 mr-1.5" />
            Clear Filters
          </Button>
        ) : (
          <Button
            onClick={onCreateInvoice}
            className="bg-[#F97316] hover:bg-orange-600 rounded-xl text-xs font-semibold px-5 shadow-sm shadow-orange-500/20"
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Create First Invoice
          </Button>
        )}
      </div>
    </div>
  );
};
