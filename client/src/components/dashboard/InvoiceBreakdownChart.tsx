import React from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
} from "recharts";
import { Receipt } from "lucide-react";
import type { InvoiceChartPoint } from "../../modules/dashboard/api/dashboard.api";

interface InvoiceBreakdownChartProps {
  data?: InvoiceChartPoint[];
}

export const InvoiceBreakdownChart: React.FC<InvoiceBreakdownChartProps> = ({
  data = [],
}) => {
  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs flex flex-col justify-between space-y-4 h-full">
      <div>
        <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
          Monthly Invoices
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Volume distribution by invoice payment status.
        </p>
      </div>

      <div className="flex-1 min-h-[240px] w-full">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
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
              />
              <Tooltip
                cursor={{ fill: "rgba(249, 115, 22, 0.05)" }}
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 shadow-lg text-xs space-y-1">
                        <p className="font-semibold text-slate-500 text-[11px]">{label}</p>
                        {payload.map((entry: any) => (
                          <div
                            key={entry.name}
                            className="flex items-center justify-between gap-3 text-xs"
                          >
                            <span className="capitalize text-slate-600 dark:text-slate-400 font-medium">
                              {entry.name}:
                            </span>
                            <span
                              className="font-bold"
                              style={{ color: entry.color }}
                            >
                              {entry.value} invoices
                            </span>
                          </div>
                        ))}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                wrapperStyle={{ paddingBottom: 10, fontSize: 11 }}
              />
              <Bar dataKey="paid" name="Paid" fill="#16A34A" radius={[4, 4, 0, 0]} />
              <Bar
                dataKey="outstanding"
                name="Outstanding"
                fill="#F97316"
                radius={[4, 4, 0, 0]}
              />
              <Bar dataKey="overdue" name="Overdue" fill="#DC2626" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-full border border-dashed border-slate-200 dark:border-slate-800 rounded-xl flex flex-col items-center justify-center space-y-2 p-6 text-center">
            <Receipt className="w-8 h-8 text-slate-400" />
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              No Monthly Invoices Found
            </p>
            <p className="text-[11px] text-slate-400 max-w-xs">
              Invoice volume breakdown will display here when invoices are generated.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
