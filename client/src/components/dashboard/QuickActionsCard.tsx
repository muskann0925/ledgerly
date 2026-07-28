import React, { useState } from "react";
import { Plus, UserPlus, Download, RefreshCw, Zap } from "lucide-react";
import { exportInvoicesCsvApi } from "../../modules/dashboard/api/dashboard.api";
import { toast } from "sonner";

interface QuickActionsProps {
  onOpenCreateInvoice?: () => void;
  onOpenCreateClient?: () => void;
  onRefresh?: () => void;
}

export const QuickActionsCard: React.FC<QuickActionsProps> = ({
  onOpenCreateInvoice,
  onOpenCreateClient,
  onRefresh,
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportCsv = async () => {
    try {
      setIsExporting(true);
      const blob = await exportInvoicesCsvApi();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("CSV Exported", {
        description: "Invoice report downloaded successfully.",
      });
    } catch (err: any) {
      toast.error("Export Failed", {
        description: err?.message || "Could not export CSV from server.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 p-6 shadow-sm flex flex-col justify-between space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Quick Actions</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Accelerate your workflow with one-click billing tasks.
          </p>
        </div>
        <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300">
          <Zap className="w-4 h-4 text-[#F97316]" />
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Primary Action Button */}
        <button
          onClick={onOpenCreateInvoice}
          className="btn-primary flex items-center justify-center gap-2 text-xs font-semibold"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Create Invoice</span>
        </button>

        {/* Secondary Action Buttons */}
        <button
          onClick={onOpenCreateClient}
          className="btn-secondary flex items-center justify-center gap-2 text-xs font-semibold"
        >
          <UserPlus className="w-4 h-4 text-slate-500" />
          <span>New Client</span>
        </button>

        <button
          onClick={onRefresh}
          className="btn-secondary flex items-center justify-center gap-2 text-xs font-semibold"
        >
          <RefreshCw className="w-4 h-4 text-slate-500" />
          <span>Refresh</span>
        </button>

        <button
          onClick={handleExportCsv}
          disabled={isExporting}
          className="btn-secondary flex items-center justify-center gap-2 text-xs font-semibold disabled:opacity-50"
        >
          <Download className="w-4 h-4 text-slate-500" />
          <span>{isExporting ? "Exporting..." : "Export CSV"}</span>
        </button>
      </div>
    </div>
  );
};
