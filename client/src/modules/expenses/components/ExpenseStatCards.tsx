import React from "react";
import {
  Wallet,
  CheckCircle2,
  Clock,
  Tag,
  TrendingUp,
} from "lucide-react";
import type { DashboardSummaryReport } from "../types/expense.types";

interface ExpenseStatCardsProps {
  summary?: DashboardSummaryReport;
  isLoading?: boolean;
}

export const ExpenseStatCards: React.FC<ExpenseStatCardsProps> = ({ summary, isLoading }) => {
  const formatCurrency = (val: number = 0) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-100 dark:bg-slate-800/60 animate-pulse border border-slate-200/50 dark:border-slate-800/50"
          />
        ))}
      </div>
    );
  }

  const currentMonthTotal = summary?.currentMonth?.totalAmount || 0;
  const percentageChange = summary?.currentMonth?.percentageChangeFromLastMonth || 0;
  const pendingTotal = summary?.pendingExpenses?.totalAmount || 0;
  const pendingCount = summary?.pendingExpenses?.count || 0;
  const paidTotal = summary?.paidExpenses?.totalAmount || 0;
  const topCategory = summary?.topCategories?.[0]?.categoryName || "N/A";
  const topCategoryAmount = summary?.topCategories?.[0]?.totalAmount || 0;
  const topVendor = summary?.topVendors?.[0]?.vendorName || "N/A";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Current Month Expenses */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs relative overflow-hidden group hover:border-orange-500/40 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            This Month's Expenses
          </span>
          <div className="w-9 h-9 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {formatCurrency(currentMonthTotal)}
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-[11px] font-medium">
          <span
            className={`inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
              percentageChange >= 0
                ? "bg-rose-100 text-rose-700 dark:bg-rose-950/50 dark:text-rose-400"
                : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-400"
            }`}
          >
            <TrendingUp className="w-3 h-3" />
            {percentageChange >= 0 ? `+${percentageChange}%` : `${percentageChange}%`}
          </span>
          <span className="text-slate-400 dark:text-slate-500">vs last month</span>
        </div>
      </div>

      {/* Paid Expenses */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs relative overflow-hidden group hover:border-emerald-500/40 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Total Paid Expenses
          </span>
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {formatCurrency(paidTotal)}
        </div>
        <div className="mt-2 text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          Fully settled transactions
        </div>
      </div>

      {/* Pending Expenses */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs relative overflow-hidden group hover:border-amber-500/40 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Pending / Due Expenses
          </span>
          <div className="w-9 h-9 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>
        <div className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {formatCurrency(pendingTotal)}
        </div>
        <div className="mt-2 text-[11px] font-semibold text-amber-600 dark:text-amber-400">
          {pendingCount} pending payment{pendingCount === 1 ? "" : "s"}
        </div>
      </div>

      {/* Top Expense Category & Vendor */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs relative overflow-hidden group hover:border-indigo-500/40 transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            Top Spend Category
          </span>
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Tag className="w-5 h-5" />
          </div>
        </div>
        <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
          {topCategory}
        </div>
        <div className="mt-1 text-[11px] font-medium text-slate-400 dark:text-slate-500 flex items-center gap-2">
          <span className="truncate">Vendor: {topVendor}</span>
          <span>•</span>
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {formatCurrency(topCategoryAmount)}
          </span>
        </div>
      </div>
    </div>
  );
};
