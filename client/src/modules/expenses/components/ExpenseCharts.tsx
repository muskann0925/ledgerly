import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import type {
  MonthlyTrendReport,
  CategoryExpenseReport,
  VendorExpenseReport,
  TaxSummaryReport,
} from "../types/expense.types";

interface ExpenseChartsProps {
  monthlyTrend?: MonthlyTrendReport[];
  categories?: CategoryExpenseReport[];
  vendors?: VendorExpenseReport[];
  taxSummary?: TaxSummaryReport;
  isLoading?: boolean;
}

export const ExpenseCharts: React.FC<ExpenseChartsProps> = ({
  monthlyTrend = [],
  categories = [],
  vendors = [],
  taxSummary,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 my-6">
        <div className="h-72 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
        <div className="h-72 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse" />
      </div>
    );
  }

  const formatCurrency = (val: number = 0) => `₹${val.toLocaleString("en-IN")}`;

  const defaultPieColors = [
    "#3B82F6",
    "#F59E0B",
    "#10B981",
    "#8B5CF6",
    "#EC4899",
    "#6366F1",
    "#14B8A6",
    "#F97316",
  ];

  return (
    <div className="space-y-6 my-6">
      {/* Top Row: Line Chart + Pie Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Expense Trend */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Monthly Expense Trend
          </h3>
          <div className="h-64">
            {monthlyTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No monthly data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="monthName" tick={{ fontSize: 11, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val || 0)), "Total Spend"]}
                    contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "12px", color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="totalAmount"
                    stroke="#F97316"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#F97316" }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="taxAmount"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    strokeDasharray="4 4"
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Category Expense Distribution (Donut) */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Category Share Breakdown
          </h3>
          <div className="h-64 flex items-center justify-center">
            {categories.length === 0 ? (
              <div className="text-xs text-slate-400">No category share data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={categories}
                    dataKey="totalAmount"
                    nameKey="categoryName"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                  >
                    {categories.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.categoryColor || defaultPieColors[index % defaultPieColors.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val || 0)), "Amount"]}
                    contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "12px", color: "#fff" }}
                  />
                  <Legend
                    formatter={(val) => <span className="text-xs text-slate-600 dark:text-slate-300 font-medium">{val}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Row: Vendor Bar Chart + Tax Summary Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Vendor Top Spend Bar Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Top Vendors Spending
          </h3>
          <div className="h-64">
            {vendors.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No vendor spending data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={vendors.slice(0, 7)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="vendorName" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickFormatter={(val) => `₹${val}`} />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(Number(val || 0)), "Spend"]}
                    contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "12px", color: "#fff" }}
                  />
                  <Bar dataKey="totalAmount" fill="#6366F1" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Tax Summary Overview Card */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Tax Summary Overview
            </h3>

            <div className="space-y-3">
              <div className="bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-400 dark:text-slate-500 block">
                  Total Tax Paid
                </span>
                <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                  {formatCurrency(taxSummary?.totalTaxPaid || 0)}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-semibold block">Inclusive Tax</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(taxSummary?.inclusiveTaxAmount || 0)}
                  </span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-900/40 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/60">
                  <span className="text-[10px] text-slate-400 font-semibold block">Exclusive Tax</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatCurrency(taxSummary?.exclusiveTaxAmount || 0)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Tax Slabs summary */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-3">
            <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 block mb-2">
              Tax Slabs Breakdown
            </span>
            <div className="space-y-1 max-h-24 overflow-y-auto text-xs">
              {(taxSummary?.taxByRate || []).length === 0 ? (
                <div className="text-[11px] text-slate-400 italic py-1">
                  No tax slabs recorded
                </div>
              ) : (
                (taxSummary?.taxByRate || []).map((slab) => (
                  <div key={slab.taxRate} className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>{slab.taxRate}% Rate ({slab.count} txns)</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(slab.taxAmount)}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
