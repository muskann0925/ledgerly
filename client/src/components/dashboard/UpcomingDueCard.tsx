import React from "react";
import { Calendar, CalendarX } from "lucide-react";
import type { UpcomingInvoiceItem } from "../../modules/dashboard/api/dashboard.api";

interface UpcomingDueCardProps {
  upcomingInvoices?: UpcomingInvoiceItem[];
}

export const UpcomingDueCard: React.FC<UpcomingDueCardProps> = ({
  upcomingInvoices = [],
}) => {
  const formatDateDDMMYY = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = String(d.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 h-full">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-[#111827] dark:text-white">
            Upcoming Due Invoices
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Invoices approaching payment deadline this week.
          </p>
        </div>
        <div className="w-8 h-8 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 flex items-center justify-center text-slate-700 dark:text-slate-200">
          <Calendar className="w-4 h-4 text-[#F97316]" />
        </div>
      </div>

      {upcomingInvoices.length > 0 ? (
        <div className="space-y-2.5 flex-1 overflow-y-auto max-h-[310px] pr-1">
          {upcomingInvoices.map((inv) => (
            <div
              key={inv.id}
              className="p-3 rounded-xl border border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-800/30 flex items-center justify-between gap-3 hover:bg-slate-100/50 dark:hover:bg-slate-800/60 transition-colors text-xs"
            >
              <div className="space-y-0.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-900 dark:text-white truncate">
                    {inv.client}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${inv.badgeColor || "bg-amber-50 text-[#F59E0B]"}`}
                  >
                    {formatDateDDMMYY(inv.dueDate)}
                  </span>
                </div>
                <p className="text-slate-400 text-[11px] font-mono">{inv.id}</p>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="font-bold text-slate-900 dark:text-white">
                  {inv.amount}
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-8 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-2 text-center flex-1">
          <CalendarX className="w-7 h-7 text-slate-400" />
          <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
            No Upcoming Due Invoices
          </p>
          <p className="text-[11px] text-slate-400 max-w-xs px-4">
            Pending invoices with approaching due dates will appear here automatically.
          </p>
        </div>
      )}
    </div>
  );
};
