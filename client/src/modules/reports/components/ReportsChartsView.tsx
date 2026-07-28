import React from "react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from "recharts";
import type {
  FullRevenueReport,
  FullInvoiceReport,
  FullTaxReport,
  ProfitAndLossReport,
  ClientPerformanceReport,
} from "../types/reports.types";

interface ReportsChartsViewProps {
  revenue?: FullRevenueReport;
  invoices?: FullInvoiceReport;
  tax?: FullTaxReport;
  profit?: ProfitAndLossReport;
  clients?: ClientPerformanceReport;
  isLoading?: boolean;
}

export const ReportsChartsView: React.FC<ReportsChartsViewProps> = ({
  revenue,
  invoices,
  profit,
  clients,
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

  const formatCurrency = (val: any) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

  const pieColors = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6", "#6366F1"];

  const statusPieData = invoices?.summary.statusBreakdown
    ? Object.entries(invoices.summary.statusBreakdown).map(([status, item]) => ({
        name: status,
        value: item.totalAmount,
        count: item.count,
      }))
    : [];

  return (
    <div className="space-y-6 my-6">
      {/* Row 1: Revenue Trend & Revenue vs Expense */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue Trend Line Chart */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Revenue Trend & Collections
          </h3>
          <div className="h-64">
            {!revenue?.trend || revenue.trend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No revenue trend data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={revenue.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="periodLabel" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(val), "Revenue"]}
                    contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "12px", color: "#fff" }}
                  />
                  <Line type="monotone" dataKey="totalRevenue" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} />
                  <Line type="monotone" dataKey="paidRevenue" stroke="#3B82F6" strokeWidth={2} strokeDasharray="3 3" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Profit Trend Area Chart */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Profit & Loss Monthly Trend (P&L)
          </h3>
          <div className="h-64">
            {!profit?.monthlyPnlTrend || profit.monthlyPnlTrend.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No P&L trend data available
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={profit.monthlyPnlTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F97316" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#F97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                  <XAxis dataKey="monthName" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    formatter={(val: any) => [formatCurrency(val), "Net Profit"]}
                    contentStyle={{ backgroundColor: "#1f2937", border: "none", borderRadius: "12px", color: "#fff" }}
                  />
                  <Area type="monotone" dataKey="netProfit" stroke="#F97316" fillOpacity={1} fill="url(#profitGrad)" strokeWidth={2.5} />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      {/* Row 2: Status Donut Chart + Top Clients Bar Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Status Distribution Donut */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Invoice Status Share
          </h3>
          <div className="h-64 flex items-center justify-center">
            {statusPieData.length === 0 ? (
              <div className="text-xs text-slate-400">No status data</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                    {statusPieData.map((_, idx) => (
                      <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(val: any) => [formatCurrency(val), "Total Value"]} />
                  <Legend formatter={(val) => <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300">{val}</span>} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Top Clients Revenue Horizontal Bar */}
        <div className="lg:col-span-2 bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
          <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
            Top Clients by Revenue
          </h3>
          <div className="h-64">
            {!clients?.topClients || clients.topClients.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-slate-400">
                No client performance data
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clients.topClients.slice(0, 6)} layout="vertical" margin={{ top: 10, right: 10, left: 40, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `₹${v}`} />
                  <YAxis type="category" dataKey="companyName" tick={{ fontSize: 10, fill: "#94a3b8" }} width={120} />
                  <Tooltip formatter={(val: any) => [formatCurrency(val), "Revenue"]} />
                  <Bar dataKey="totalBilled" fill="#3B82F6" radius={[0, 8, 8, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
