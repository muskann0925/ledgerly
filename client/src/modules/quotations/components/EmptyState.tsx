import React from "react";
import { Button } from "../../../components/ui/button";
import { FileText, PlusCircle } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onAction?: () => void;
  actionText?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Quotation Proposals Found",
  description = "Create price estimates, formal proposals, and contract scopes to dispatch to potential clients.",
  onAction,
  actionText = "Create New Proposal",
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-[#111827]/50 select-none my-4">
      <div className="w-14 h-14 rounded-3xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-[#F97316] mb-4 shadow-sm">
        <FileText className="w-7 h-7" />
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
          className="bg-[#F97316] hover:bg-orange-600 rounded-xl text-xs font-semibold px-5 shadow-sm shadow-orange-500/20 text-white"
        >
          <PlusCircle className="w-4 h-4 mr-1.5" />
          {actionText}
        </Button>
      )}
    </div>
  );
};
