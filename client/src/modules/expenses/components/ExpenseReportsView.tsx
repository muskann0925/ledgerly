import React, { useState } from "react";
import {
  BarChart3,
  FileSpreadsheet,
  Tag,
  Building2,
} from "lucide-react";
import { useExpenseReports } from "../hooks/useExpenses";
import type { ExpenseCategory, Vendor } from "../types/expense.types";

interface ExpenseReportsViewProps {
  categories: ExpenseCategory[];
  vendors: Vendor[];
}

export const ExpenseReportsView: React.FC<ExpenseReportsViewProps> = ({
  categories,
  vendors,
}) => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [vendorId, setVendorId] = useState("");

  const filters = {
    ...(startDate ? { startDate } : {}),
    ...(endDate ? { endDate } : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(vendorId ? { vendorId } : {}),
  };

  const { totals, byCategory, byVendor } = useExpenseReports(filters);

  const formatCurrency = (val: number = 0) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);

  const handleExportCsv = () => {
    if (!byCategory.data?.data) return;

    const rows = [
      ["Category Name", "Total Amount (INR)", "Count", "Percentage Share"],
      ...byCategory.data.data.map((c) => [
        `"${c.categoryName.replace(/"/g, '""')}"`,
        c.totalAmount,
        c.count,
        `${c.percentage}%`,
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((e) => e.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Expense_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Filter Controls */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-orange-500" />
              Financial & Tax Expense Reports
            </h2>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
              Comprehensive date-range reporting, tax audit breakdown, category & vendor share.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExportCsv}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-500" /> Export CSV
            </button>
          </div>
        </div>

        {/* Date & Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Category Filter
            </label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="">All Categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-600 dark:text-slate-400 mb-1">
              Vendor Filter
            </label>
            <select
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
              className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            >
              <option value="">All Vendors</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Total Report Expenses
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(totals.data?.data?.totalAmount || 0)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Count: {totals.data?.data?.totalCount || 0} transactions
          </span>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Total Tax Paid
          </span>
          <div className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
            {formatCurrency(totals.data?.data?.totalTaxAmount || 0)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Inclusive & Exclusive taxes
          </span>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Paid Settlement Ratio
          </span>
          <div className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(totals.data?.data?.paidAmount || 0)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">
            Pending: {formatCurrency(totals.data?.data?.pendingAmount || 0)}
          </span>
        </div>

        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
          <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
            Average Expense Amount
          </span>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
            {formatCurrency(totals.data?.data?.averageAmount || 0)}
          </div>
          <span className="text-[11px] text-slate-400 font-medium">per recorded bill</span>
        </div>
      </div>

      {/* Reports Tables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Table */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Tag className="w-4 h-4 text-orange-500" />
            Expenses by Category
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Category</th>
                  <th className="pb-2 text-center">Txns</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {byCategory.data?.data.map((c) => (
                  <tr key={c.categoryId}>
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: c.categoryColor || "#3B82F6" }}
                      />
                      {c.categoryName}
                    </td>
                    <td className="py-2.5 text-center text-slate-500">{c.count}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(c.totalAmount)}
                    </td>
                    <td className="py-2.5 text-right text-orange-600 dark:text-orange-400 font-bold">
                      {c.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Vendor Breakdown Table */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4 flex items-center gap-2">
            <Building2 className="w-4 h-4 text-orange-500" />
            Expenses by Vendor
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-2">Vendor Name</th>
                  <th className="pb-2 text-center">Txns</th>
                  <th className="pb-2 text-right">Amount</th>
                  <th className="pb-2 text-right">Share</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {byVendor.data?.data.map((v) => (
                  <tr key={v.vendorId || "no-vendor"}>
                    <td className="py-2.5 font-semibold text-slate-800 dark:text-slate-200">
                      {v.vendorName}
                    </td>
                    <td className="py-2.5 text-center text-slate-500">{v.count}</td>
                    <td className="py-2.5 text-right font-bold text-slate-900 dark:text-white">
                      {formatCurrency(v.totalAmount)}
                    </td>
                    <td className="py-2.5 text-right text-indigo-600 dark:text-indigo-400 font-bold">
                      {v.percentage}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
