import React from "react";
import { Clock, FileCheck } from "lucide-react";
import type { OutstandingAgingBreakdown } from "../../modules/dashboard/api/dashboard.api";

interface OutstandingPaymentsCardProps {
  agingData?: OutstandingAgingBreakdown;
}

export const OutstandingPaymentsCard: React.FC<OutstandingPaymentsCardProps> = ({
  agingData,
}) => {
  const totalReceivable = agingData?.totalReceivable ?? 0;
  const buckets = agingData?.buckets || [
    { label: "Current (0-30 Days)", amount: 0, percentage: 0, color: "bg-emerald-500" },
    { label: "31-60 Days", amount: 0, percentage: 0, color: "bg-amber-500" },
    { label: "61-90 Days", amount: 0, percentage: 0, color: "bg-orange-500" },
    { label: "90+ Days Overdue", amount: 0, percentage: 0, color: "bg-red-500" },
  ];

  const formatCurrency = (val: number) =>
    `₹${(val ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Outstanding Payments</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Accounts receivable aging breakdown from live database.
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 flex items-center justify-center text-slate-700 dark:text-slate-200">
          <Clock className="w-4 h-4 text-[#F97316]" />
        </div>
      </div>

      <div className="p-3.5 rounded-xl bg-orange-50/60 dark:bg-orange-950/20 border border-orange-100 dark:border-orange-900/30 flex items-center justify-between">
        <div className="space-y-0.5">
          <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Receivable
          </span>
          <p className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
            {formatCurrency(totalReceivable)}
          </p>
        </div>
      </div>

      {/* Progress Stack vs Empty State */}
      {totalReceivable === 0 ? (
        <div className="py-6 text-center flex flex-col items-center justify-center space-y-2 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl bg-slate-50/50 dark:bg-slate-900/20">
          <FileCheck className="w-8 h-8 text-emerald-500" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            No Outstanding Payments
          </p>
          <p className="text-[11px] text-slate-400">
            All customer invoices are cleared or settled.
          </p>
        </div>
      ) : (
        <div className="space-y-2.5">
          {buckets.map((bucket) => (
            <div key={bucket.label} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-medium text-slate-700 dark:text-slate-300">
                  {bucket.label}
                </span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(bucket.amount)} ({bucket.percentage}%)
                </span>
              </div>
              <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className={`h-full ${bucket.color} transition-all duration-500 rounded-full`}
                  style={{ width: `${Math.max(bucket.percentage, bucket.amount > 0 ? 3 : 0)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
