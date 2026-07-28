import React from "react";
import {
  DollarSign,
  Clock,
  Wallet,
  TrendingUp,
  Receipt,
  PieChart as PieIcon,
} from "lucide-react";
import type { DashboardMetricsReport } from "../types/reports.types";

interface ReportsKpiCardsProps {
  metrics?: DashboardMetricsReport;
  isLoading?: boolean;
}

export const ReportsKpiCards: React.FC<ReportsKpiCardsProps> = ({ metrics, isLoading }) => {
  const formatCurrency = (val: number = 0) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200/50 dark:border-slate-800/50"
          />
        ))}
      </div>
    );
  }

  const kpis = [
    {
      title: "Total Revenue",
      value: formatCurrency(metrics?.totalRevenue),
      subtext: `Billed Overall`,
      icon: DollarSign,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    },
    {
      title: "Net Profit",
      value: formatCurrency(metrics?.netProfit),
      subtext: `Margin: ${metrics?.netProfitMargin || 0}%`,
      icon: TrendingUp,
      color: (metrics?.netProfit || 0) >= 0 ? "text-blue-600 dark:text-blue-400" : "text-rose-600 dark:text-rose-400",
      bg: (metrics?.netProfit || 0) >= 0 ? "bg-blue-500/10 dark:bg-blue-500/20" : "bg-rose-500/10 dark:bg-rose-500/20",
    },
    {
      title: "Outstanding Amount",
      value: formatCurrency(metrics?.outstandingAmount),
      subtext: `Overdue: ${formatCurrency(metrics?.overdueAmount)}`,
      icon: Clock,
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-500/10 dark:bg-amber-500/20",
    },
    {
      title: "Total Expenses",
      value: formatCurrency(metrics?.totalExpenses),
      subtext: "Operating Costs",
      icon: Wallet,
      color: "text-orange-600 dark:text-orange-400",
      bg: "bg-orange-500/10 dark:bg-orange-500/20",
    },
    {
      title: "Total Invoices",
      value: String(metrics?.totalInvoicesCount || 0),
      subtext: `Avg: ${formatCurrency(metrics?.averageInvoiceValue)}`,
      icon: Receipt,
      color: "text-indigo-600 dark:text-indigo-400",
      bg: "bg-indigo-500/10 dark:bg-indigo-500/20",
    },
    {
      title: "Collection Rate",
      value: `${metrics?.collectionRate || 0}%`,
      subtext: "Paid vs Billed",
      icon: PieIcon,
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-500/10 dark:bg-emerald-500/20",
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 mb-6">
      {kpis.map((kpi, idx) => {
        const Icon = kpi.icon;
        return (
          <div
            key={idx}
            className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-3.5 shadow-xs relative overflow-hidden group hover:border-orange-500/40 transition-all"
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 truncate">
                {kpi.title}
              </span>
              <div className={`w-7 h-7 rounded-lg ${kpi.bg} ${kpi.color} flex items-center justify-center shrink-0`}>
                <Icon className="w-3.5 h-3.5" />
              </div>
            </div>
            <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white tracking-tight truncate">
              {kpi.value}
            </div>
            <div className="text-[10px] font-medium text-slate-400 dark:text-slate-500 mt-0.5 truncate">
              {kpi.subtext}
            </div>
          </div>
        );
      })}
    </div>
  );
};
