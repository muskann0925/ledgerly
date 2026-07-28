import React, { useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp, BarChart2 } from "lucide-react";
import type { RevenueChartPoint } from "../../modules/dashboard/api/dashboard.api";

interface RevenueChartProps {
  data?: RevenueChartPoint[];
}

const formatCurrency = (val: number) => {
  if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
  if (val >= 100000) return `₹${(val / 100000).toFixed(0)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
  return `₹${val}`;
};

export const RevenueChart: React.FC<RevenueChartProps> = ({ data = [] }) => {
  const [metric, setMetric] = useState<"revenue" | "profit" | "expenses">("revenue");
  const [timeframe, setTimeframe] = useState<"12M" | "6M" | "30D">("12M");

  const filteredData =
    timeframe === "6M"
      ? data.slice(Math.max(0, data.length - 6))
      : timeframe === "30D"
      ? data.slice(Math.max(0, data.length - 1))
      : data;

  const getMetricColor = () => {
    switch (metric) {
      case "profit":
        return "#16A34A";
      case "expenses":
        return "#DC2626";
      default:
        return "#F97316";
    }
  };

  const metricColor = getMetricColor();

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 h-full">
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
              Revenue Analytics
            </h2>
            {data.length > 0 && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 dark:bg-emerald-950/40 text-[#16A34A]">
                <TrendingUp className="w-3 h-3" /> Real-time DB
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Revenue trends, operational costs, and profit margin analysis.
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Metric Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
            <button
              onClick={() => setMetric("revenue")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                metric === "revenue"
                  ? "bg-white dark:bg-slate-700 text-[#F97316] shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Revenue
            </button>
            <button
              onClick={() => setMetric("profit")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                metric === "profit"
                  ? "bg-white dark:bg-slate-700 text-[#16A34A] shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Profit
            </button>
            <button
              onClick={() => setMetric("expenses")}
              className={`px-2.5 py-1 rounded-lg transition-all ${
                metric === "expenses"
                  ? "bg-white dark:bg-slate-700 text-[#DC2626] shadow-xs"
                  : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              }`}
            >
              Expenses
            </button>
          </div>

          {/* Timeframe Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
            {(["30D", "6M", "12M"] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-2 py-1 rounded-lg transition-all ${
                  timeframe === tf
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart Canvas or Honest Empty State */}
      <div className="h-60 w-full">
        {filteredData.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={filteredData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={metricColor} stopOpacity={0.25} />
                  <stop offset="95%" stopColor={metricColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                vertical={false}
                stroke="rgba(156, 163, 175, 0.15)"
              />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                dy={10}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: "#9CA3AF", fontSize: 11 }}
                tickFormatter={formatCurrency}
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const dataVal = payload[0].value as number;
                    return (
                      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 shadow-lg text-xs space-y-1">
                        <p className="font-semibold text-slate-400 text-[11px]">{label}</p>
                        <p className="text-xs font-bold text-[#F97316]">
                          {metric.toUpperCase()}: ₹{dataVal.toLocaleString("en-IN")}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey={metric}
                stroke={metricColor}
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#chartGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-2 p-6 text-center">
            <BarChart2 className="w-8 h-8 text-slate-400" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No Revenue Records Found
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Revenue trends will populate automatically once paid invoices are recorded in the database.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
