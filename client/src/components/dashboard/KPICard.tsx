import React from "react";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface KPICardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "positive" | "negative" | "neutral";
  subtitle?: string;
  icon: LucideIcon;
  delay?: number;
}

export const KPICard: React.FC<KPICardProps> = ({
  title,
  value,
  change,
  changeType = "positive",
  subtitle,
  icon: Icon,
}) => {
  return (
    <div
      className="group relative bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs hover:shadow-md hover:border-[#F97316]/50 dark:hover:border-slate-700 transition-all duration-200 flex flex-col justify-between min-w-0"
    >
      {/* Top row: Label & Soft circular icon pill */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-extrabold text-slate-500 dark:text-slate-400 tracking-wider uppercase">
          {title}
        </span>
        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-slate-50 dark:bg-slate-800/80 border border-slate-100 dark:border-slate-700/50 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-orange-50 group-hover:text-[#F97316] dark:group-hover:bg-orange-950/40 dark:group-hover:text-orange-400 transition-colors shrink-0">
          <Icon className="w-4 h-4 stroke-[2]" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mt-2 sm:mt-3">
        <h3 className="text-xl sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white truncate">
          {value}
        </h3>
      </div>

      {/* Bottom Trend & Context */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-1.5 text-xs pt-1">
        {change && (
          <span
            className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-md text-[10px] sm:text-[11px] shrink-0 ${
              changeType === "positive"
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-[#16A34A] dark:text-emerald-400 border border-emerald-200/60 dark:border-emerald-900/50"
                : changeType === "negative"
                ? "bg-red-50 dark:bg-red-950/50 text-[#DC2626] dark:text-red-400 border border-red-200/60 dark:border-red-900/50"
                : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200/60 dark:border-slate-700/50"
            }`}
          >
            {changeType === "positive" && <TrendingUp className="w-3 h-3" />}
            {changeType === "negative" && <TrendingDown className="w-3 h-3" />}
            {changeType === "neutral" && <Minus className="w-3 h-3" />}
            {change}
          </span>
        )}
        {subtitle && (
          <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  );
};
