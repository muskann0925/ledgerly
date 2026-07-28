import React from "react";
import { Button } from "../../../components/ui/button";
import { CreditCard, PlusCircle } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onAction?: () => void;
  actionText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Payment Records Found",
  description = "Record customer payment transactions against active invoices to track revenue and balance due automatically.",
  onAction,
  actionText = "Record New Payment",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#111827]/50 select-none my-4">
      <div className="w-14 h-14 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#F97316] mb-4 shadow-sm">
        <CreditCard className="w-7 h-7" />
      </div>

      <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
        {title}
      </h3>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-6 leading-relaxed">
        {description}
      </p>

      {onAction && (
        <Button
          onClick={onAction}
          className="bg-[#F97316] hover:bg-orange-600 rounded-xl text-xs font-semibold px-5 shadow-sm shadow-orange-500/20"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          {actionText}
        </Button>
      )}
    </div>
  );
};
