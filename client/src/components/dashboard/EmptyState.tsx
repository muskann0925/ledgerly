import React from "react";
import { FolderPlus, Plus, UserPlus, Sparkles } from "lucide-react";

interface EmptyStateProps {
  title?: string;
  description?: string;
  onCreateInvoice?: () => void;
  onAddClient?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No Invoices or Financial Data Yet",
  description = "Get started by issuing your first invoice or onboarding a client to unlock real-time revenue analytics.",
  onCreateInvoice,
  onAddClient,
}) => {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-3xl border border-dashed border-slate-200 dark:border-slate-800 p-10 text-center flex flex-col items-center justify-center space-y-4 my-6 shadow-xs">
      <div className="w-14 h-14 rounded-2xl bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900/40 text-[#F97316] flex items-center justify-center shadow-xs">
        <FolderPlus className="w-7 h-7" />
      </div>

      <div className="max-w-md space-y-1">
        <h3 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
          {title}
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
          {description}
        </p>
      </div>

      <div className="flex items-center gap-3 pt-2">
        <button
          onClick={onCreateInvoice}
          className="btn-primary flex items-center gap-2 text-xs font-semibold"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create First Invoice</span>
        </button>

        <button
          onClick={onAddClient}
          className="btn-secondary flex items-center gap-2 text-xs font-semibold"
        >
          <UserPlus className="w-4 h-4 text-slate-500" />
          <span>Add Client</span>
        </button>
      </div>

      <div className="pt-4 flex items-center gap-2 text-[11px] text-slate-400">
        <Sparkles className="w-3.5 h-3.5 text-[#F97316]" />
        <span>Ledgerly automatically computes GST, aging metrics, and revenue charts upon invoice issue.</span>
      </div>
    </div>
  );
};
