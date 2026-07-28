import React, { useState } from "react";
import {
  Tag,
  Building2,
  Receipt,
  Percent,
  TrendingUp,
  ChevronsLeft,
  ChevronLeft,
  ChevronRight,
  ChevronsRight,
  Search,
} from "lucide-react";
import type {
  FullRevenueReport,
  FullInvoiceReport,
  FullTaxReport,
  ProfitAndLossReport,
  ClientPerformanceReport,
} from "../types/reports.types";

interface ReportsTablesViewProps {
  revenue?: FullRevenueReport;
  invoices?: FullInvoiceReport;
  tax?: FullTaxReport;
  profit?: ProfitAndLossReport;
  clients?: ClientPerformanceReport;
  isLoading?: boolean;
}

export const ReportsTablesView: React.FC<ReportsTablesViewProps> = ({
  revenue,
  invoices,
  tax,
  profit,
  clients,
  isLoading,
}) => {
  const [activeTab, setActiveTab] = useState<"revenue" | "invoices" | "tax" | "profit" | "clients">("revenue");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const formatCurrency = (val: number = 0) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val);

  if (isLoading) {
    return <div className="h-64 bg-slate-100 dark:bg-slate-800/50 rounded-2xl animate-pulse my-6" />;
  }

  // Filter Active Tab Rows
  let rawRows: any[] = [];

  if (activeTab === "revenue") {
    rawRows = (revenue?.byClient || []).filter((r) =>
      r.clientName.toLowerCase().includes(search.toLowerCase())
    );
  } else if (activeTab === "tax") {
    rawRows = tax?.taxByRate || [];
  } else if (activeTab === "profit") {
    rawRows = profit?.monthlyPnlTrend || [];
  } else if (activeTab === "clients") {
    rawRows = (clients?.topClients || []).filter((c) =>
      c.companyName.toLowerCase().includes(search.toLowerCase())
    );
  } else if (activeTab === "invoices") {
    rawRows = invoices?.agingBuckets || [];
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
    <div className="bg-white dark:bg-[#111827] border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-5 shadow-xs space-y-4 my-6">
      {/* Tab Navigation + Search */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-1.5 flex-wrap">
          {[
            { id: "revenue", label: "Revenue by Client", icon: Building2 },
            { id: "invoices", label: "Invoice Aging", icon: Receipt },
            { id: "tax", label: "Tax Liability Slabs", icon: Percent },
            { id: "profit", label: "P&L Monthly Breakdown", icon: TrendingUp },
            { id: "clients", label: "Client Directory Rankings", icon: Tag },
          ].map((t) => {
            const Icon = t.icon;
            return (
              <button
                key={t.id}
                type="button"
                onClick={() => {
                  setActiveTab(t.id as any);
                  setPage(1);
                }}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                  activeTab === t.id
                    ? "bg-[#F97316] text-white shadow-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{t.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search report rows..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
        </div>
      </div>

      {/* Table Body */}
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

        {activeTab === "tax" && (
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[10px]">
                <th className="pb-2">Tax Rate (%)</th>
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

        {activeTab === "profit" && (
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

      {/* Pagination Enforcing Standard Pattern from AGENTS.md */}
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
  );
};
