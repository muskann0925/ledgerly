import React, { useState } from "react";
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
import {
  DollarSign,
  Receipt,
  Wallet,
  Percent,
  Users,
  FileSpreadsheet,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Search,
  FileText,
  Download,
  ShieldCheck,
} from "lucide-react";
import type {
  FullRevenueReport,
  FullInvoiceReport,
  FullTaxReport,
  ProfitAndLossReport,
  ClientPerformanceReport,
} from "../types/reports.types";

interface ReportsTabsViewProps {
  revenue?: FullRevenueReport;
  invoices?: FullInvoiceReport;
  tax?: FullTaxReport;
  profit?: ProfitAndLossReport;
  clients?: ClientPerformanceReport;
  isLoading?: boolean;
  onExport?: (format: "pdf" | "excel" | "csv") => void;
}

export const ReportsTabsView: React.FC<ReportsTabsViewProps> = ({
  revenue,
  invoices,
  tax,
  profit,
  clients,
  isLoading,
  onExport,
}) => {
  const [activeTab, setActiveTab] = useState<
    "revenue" | "invoices" | "expenses" | "taxes" | "clients" | "exports"
  >("revenue");

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const formatCurrency = (val: any = 0) => `₹${Number(val || 0).toLocaleString("en-IN")}`;

  if (isLoading) {
    return (
      <div className="space-y-4 my-6">
        <div className="h-12 bg-slate-100 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
        <div className="h-72 bg-slate-100 dark:bg-slate-800/60 rounded-2xl animate-pulse" />
      </div>
    );
  }

  // Consistent Colors
  const COLORS = {
    revenue: "#10B981",
    paid: "#3B82F6",
    profit: "#3B82F6",
    expense: "#F97316",
    outstanding: "#F59E0B",
    tax: "#8B5CF6",
  };

  const statusPieColors = ["#10B981", "#3B82F6", "#F59E0B", "#EF4444", "#8B5CF6"];

  const statusPieData = invoices?.summary.statusBreakdown
    ? Object.entries(invoices.summary.statusBreakdown).map(([status, item]) => ({
        name: status,
        value: item.totalAmount,
        count: item.count,
      }))
    : [];

  // Tab Table Data Resolver
  let rawRows: any[] = [];
  if (activeTab === "revenue") {
    rawRows = (revenue?.byClient || []).filter((r) =>
      r.clientName.toLowerCase().includes(search.toLowerCase())
    );
  } else if (activeTab === "invoices") {
    rawRows = invoices?.agingBuckets || [];
  } else if (activeTab === "expenses") {
    rawRows = profit?.monthlyPnlTrend || [];
  } else if (activeTab === "taxes") {
    rawRows = tax?.taxByRate || [];
  } else if (activeTab === "clients") {
    rawRows = (clients?.topClients || []).filter((c) =>
      c.companyName.toLowerCase().includes(search.toLowerCase())
    );
  }

  const total = rawRows.length;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const currentPage = Math.min(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, total);
  const currentRows = rawRows.slice(startIndex, endIndex);

  const startRecord = total > 0 ? startIndex + 1 : 0;
  const endRecord = endIndex;

  return (
    <div className="space-y-6">
      {/* 6 Tabs Header Bar */}
      <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-2 shadow-xs flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: "revenue", label: "1. Revenue Analytics", icon: DollarSign },
            { id: "invoices", label: "2. Invoices & Aging", icon: Receipt },
            { id: "expenses", label: "3. Expenses & Profit", icon: Wallet },
            { id: "taxes", label: "4. Tax Liabilities", icon: Percent },
            { id: "clients", label: "5. Client Revenue", icon: Users },
            { id: "exports", label: "6. Reports & Exports", icon: FileSpreadsheet },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => {
                  setActiveTab(tab.id as any);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all ${
                  activeTab === tab.id
                    ? "bg-[#F97316] text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {activeTab !== "exports" && (
          <div className="relative w-full sm:w-56 px-2">
            <Search className="w-3.5 h-3.5 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search table rows..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>
        )}
      </div>

      {/* TAB 1: REVENUE */}
      {activeTab === "revenue" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend Line Chart */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Revenue Trend vs Settled Collections
              </h3>
              <div className="h-64">
                {!revenue?.trend || revenue.trend.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No trend data available
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={revenue.trend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="periodLabel" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip formatter={(val: any) => [formatCurrency(val), "Amount"]} />
                      <Legend />
                      <Line name="Total Billed" type="monotone" dataKey="totalRevenue" stroke={COLORS.revenue} strokeWidth={3} dot={{ r: 4 }} />
                      <Line name="Paid Revenue" type="monotone" dataKey="paidRevenue" stroke={COLORS.paid} strokeWidth={2} strokeDasharray="4 4" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Revenue by Client Bar Chart */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Revenue Share by Client
              </h3>
              <div className="h-64">
                {!revenue?.byClient || revenue.byClient.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No client revenue data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={revenue.byClient.slice(0, 6)} layout="vertical" margin={{ top: 10, right: 10, left: 30, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#334155" opacity={0.2} />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `₹${v}`} />
                      <YAxis type="category" dataKey="clientName" tick={{ fontSize: 10, fill: "#94a3b8" }} width={110} />
                      <Tooltip formatter={(val: any) => [formatCurrency(val), "Revenue"]} />
                      <Bar dataKey="totalRevenue" fill={COLORS.revenue} radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: INVOICES */}
      {activeTab === "invoices" && (
        <div className="space-y-6">
          {/* Upcoming Due Banner Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Due Today</span>
              <div className="text-xl font-extrabold text-rose-600 dark:text-rose-400 mt-1">
                {formatCurrency(invoices?.upcomingDue?.dueToday?.totalAmount)}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {invoices?.upcomingDue?.dueToday?.count || 0} Invoices pending
              </span>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Due This Week</span>
              <div className="text-xl font-extrabold text-amber-600 dark:text-amber-400 mt-1">
                {formatCurrency(invoices?.upcomingDue?.dueThisWeek?.totalAmount)}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {invoices?.upcomingDue?.dueThisWeek?.count || 0} Invoices pending
              </span>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Due This Month</span>
              <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
                {formatCurrency(invoices?.upcomingDue?.dueThisMonth?.totalAmount)}
              </div>
              <span className="text-[11px] text-slate-400 font-medium">
                {invoices?.upcomingDue?.dueThisMonth?.count || 0} Invoices pending
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Status Donut */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Invoice Status Distribution
              </h3>
              <div className="h-64 flex items-center justify-center">
                {statusPieData.length === 0 ? (
                  <div className="text-xs text-slate-400">No status data</div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={statusPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4}>
                        {statusPieData.map((_, idx) => (
                          <Cell key={`cell-${idx}`} fill={statusPieColors[idx % statusPieColors.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(val: any) => [formatCurrency(val), "Total Value"]} />
                      <Legend formatter={(val) => <span className="text-xs font-medium text-slate-600 dark:text-slate-300">{val}</span>} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Aging Bar Chart */}
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
                Overdue Invoice Aging Buckets
              </h3>
              <div className="h-64">
                {!invoices?.agingBuckets || invoices.agingBuckets.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-xs text-slate-400">
                    No aging data
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={invoices.agingBuckets} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                      <XAxis dataKey="bucketLabel" tick={{ fontSize: 9, fill: "#94a3b8" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `₹${v}`} />
                      <Tooltip formatter={(val: any) => [formatCurrency(val), "Outstanding"]} />
                      <Bar dataKey="totalOutstanding" fill={COLORS.outstanding} radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: EXPENSES & PROFIT */}
      {activeTab === "expenses" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Monthly Profit & Expense Trend (P&L)
            </h3>
            <div className="h-64">
              {!profit?.monthlyPnlTrend || profit.monthlyPnlTrend.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No P&L data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={profit.monthlyPnlTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={COLORS.profit} stopOpacity={0.4} />
                        <stop offset="95%" stopColor={COLORS.profit} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="monthName" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(val: any) => [formatCurrency(val), "Net Profit"]} />
                    <Area type="monotone" dataKey="netProfit" stroke={COLORS.profit} fillOpacity={1} fill="url(#profitGrad)" strokeWidth={2.5} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TAXES */}
      {activeTab === "taxes" && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Tax Collected (Sales)</span>
              <div className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400 mt-1">
                {formatCurrency(tax?.summary?.taxCollected)}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Tax Paid (Expenses)</span>
              <div className="text-xl font-extrabold text-sky-600 dark:text-sky-400 mt-1">
                {formatCurrency(tax?.summary?.taxPaid)}
              </div>
            </div>

            <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-slate-400">Net Tax Liability</span>
              <div className="text-xl font-extrabold text-violet-600 dark:text-violet-400 mt-1">
                {formatCurrency(tax?.summary?.netTaxLiability)}
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Tax Collected by Rate Slab
            </h3>
            <div className="h-64">
              {!tax?.taxByRate || tax.taxByRate.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No tax slab data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tax.taxByRate} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="taxRate" tickFormatter={(v) => `${v}% Slab`} tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(val: any) => [formatCurrency(val), "Tax Collected"]} />
                    <Bar dataKey="taxCollected" fill={COLORS.tax} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: CLIENTS */}
      {activeTab === "clients" && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs">
            <h3 className="text-xs font-extrabold text-slate-900 dark:text-white uppercase tracking-wider mb-4">
              Top Clients Revenue Ranking
            </h3>
            <div className="h-64">
              {!clients?.topClients || clients.topClients.length === 0 ? (
                <div className="h-full flex items-center justify-center text-xs text-slate-400">
                  No client data
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={clients.topClients.slice(0, 6)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#334155" opacity={0.2} />
                    <XAxis dataKey="companyName" tick={{ fontSize: 10, fill: "#94a3b8" }} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickFormatter={(v) => `₹${v}`} />
                    <Tooltip formatter={(val: any) => [formatCurrency(val), "Total Billed"]} />
                    <Bar dataKey="totalBilled" fill={COLORS.revenue} radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 6: REPORTS & EXPORTS */}
      {activeTab === "exports" && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-6 shadow-xs space-y-6">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-orange-500" />
              Download Standardized Audit Reports
            </h3>
            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
              Select desired document format to download live audit spreadsheets and PDFs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <button
              type="button"
              onClick={() => onExport?.("pdf")}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 bg-slate-50/50 dark:bg-slate-900/40 text-left transition-all group"
            >
              <FileText className="w-8 h-8 text-orange-500 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">PDF Executive Summary</h4>
              <p className="text-xs text-slate-400 mt-0.5">Formatted PDF report document</p>
            </button>

            <button
              type="button"
              onClick={() => onExport?.("excel")}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/50 bg-slate-50/50 dark:bg-slate-900/40 text-left transition-all group"
            >
              <FileSpreadsheet className="w-8 h-8 text-emerald-500 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">Excel Spreadsheet (.xlsx)</h4>
              <p className="text-xs text-slate-400 mt-0.5">Multi-sheet Excel workbook</p>
            </button>

            <button
              type="button"
              onClick={() => onExport?.("csv")}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 bg-slate-50/50 dark:bg-slate-900/40 text-left transition-all group"
            >
              <Download className="w-8 h-8 text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
              <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">CSV Raw Export</h4>
              <p className="text-xs text-slate-400 mt-0.5">Comma-separated data file</p>
            </button>
          </div>
        </div>
      )}

      {/* Detailed Tabular Data Table (Shown for Tabs 1-5) */}
      {activeTab !== "exports" && (
        <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4">
          <div className="overflow-x-auto">
            {activeTab === "revenue" && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Client Name</th>
                    <th className="pb-2 text-center">Invoices</th>
                    <th className="pb-2 text-right">Total Revenue</th>
                    <th className="pb-2 text-right">Paid Amount</th>
                    <th className="pb-2 text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentRows.map((r: any) => (
                    <tr key={r.clientId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white">{r.clientName}</td>
                      <td className="py-2.5 text-center font-medium text-slate-500">{r.invoiceCount}</td>
                      <td className="py-2.5 text-right font-extrabold text-slate-900 dark:text-white">{formatCurrency(r.totalRevenue)}</td>
                      <td className="py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">{formatCurrency(r.paidRevenue)}</td>
                      <td className="py-2.5 text-right font-bold text-amber-600 dark:text-amber-400">{formatCurrency(r.outstandingRevenue)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "invoices" && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Aging Bucket Label</th>
                    <th className="pb-2 text-center">Invoice Count</th>
                    <th className="pb-2 text-right">Total Outstanding Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentRows.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white">{r.bucketLabel}</td>
                      <td className="py-2.5 text-center font-medium text-slate-500">{r.invoiceCount}</td>
                      <td className="py-2.5 text-right font-extrabold text-rose-600 dark:text-rose-400">{formatCurrency(r.totalOutstanding)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "expenses" && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Month</th>
                    <th className="pb-2 text-right">Gross Revenue</th>
                    <th className="pb-2 text-right">Total Expenses</th>
                    <th className="pb-2 text-right">Net Profit</th>
                    <th className="pb-2 text-right">Margin %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentRows.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white">{r.monthName}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(r.revenue)}</td>
                      <td className="py-2.5 text-right font-semibold text-orange-600 dark:text-orange-400">{formatCurrency(r.expenses)}</td>
                      <td className="py-2.5 text-right font-extrabold text-emerald-600 dark:text-emerald-400">{formatCurrency(r.netProfit)}</td>
                      <td className="py-2.5 text-right font-bold text-indigo-600 dark:text-indigo-400">{r.marginPercentage}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "taxes" && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Tax Rate Slab</th>
                    <th className="pb-2 text-center">Txn Count</th>
                    <th className="pb-2 text-right">Taxable Subtotal</th>
                    <th className="pb-2 text-right">Tax Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentRows.map((r: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white">{r.taxRate}% Slab</td>
                      <td className="py-2.5 text-center font-medium text-slate-500">{r.invoiceCount}</td>
                      <td className="py-2.5 text-right font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(r.taxableInvoiceSubtotal)}</td>
                      <td className="py-2.5 text-right font-extrabold text-indigo-600 dark:text-indigo-400">{formatCurrency(r.taxCollected)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {activeTab === "clients" && (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                    <th className="pb-2">Company Name</th>
                    <th className="pb-2">Contact Person</th>
                    <th className="pb-2 text-center">Invoices</th>
                    <th className="pb-2 text-right">Total Billed</th>
                    <th className="pb-2 text-right">Outstanding</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {currentRows.map((c: any) => (
                    <tr key={c.clientId} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 font-bold text-slate-900 dark:text-white">{c.companyName}</td>
                      <td className="py-2.5 text-slate-500">{c.contactPerson}</td>
                      <td className="py-2.5 text-center font-medium text-slate-500">{c.totalInvoices}</td>
                      <td className="py-2.5 text-right font-extrabold text-slate-900 dark:text-white">{formatCurrency(c.totalBilled)}</td>
                      <td className="py-2.5 text-right font-bold text-amber-600 dark:text-amber-400">{formatCurrency(c.outstandingBalance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Standard Pagination Pattern from AGENTS.md */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
            <div className="text-slate-500 dark:text-slate-400 font-medium">
              Showing <span className="font-semibold text-slate-900 dark:text-white">{startRecord}–{endRecord}</span> of{" "}
              <span className="font-semibold text-slate-900 dark:text-white">{total}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage(1)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronsLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="px-3 py-1 font-semibold text-slate-700 dark:text-slate-300">
                Page {currentPage} of {totalPages}
              </span>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() => setPage(totalPages)}
                className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronsRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
