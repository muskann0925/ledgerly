import React, { useState } from "react";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Download,
  Calendar as CalendarIcon,
  Receipt,
} from "lucide-react";
import type { DashboardInvoiceItem } from "../../modules/dashboard/api/dashboard.api";
import { exportInvoicesCsvApi } from "../../modules/dashboard/api/dashboard.api";
import { toast } from "sonner";

interface RecentInvoicesTableProps {
  invoices?: DashboardInvoiceItem[];
  onExportCsv?: () => void;
}

export const RecentInvoicesTable: React.FC<RecentInvoicesTableProps> = ({
  invoices = [],
  onExportCsv,
}) => {
  const currentMonthStr = new Date().toISOString().slice(0, 7);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [dateFilter, setDateFilter] = useState<string>(currentMonthStr);
  const [currentPage, setCurrentPage] = useState(1);
  const [isExporting, setIsExporting] = useState(false);

  const itemsPerPage = 5;

  const formatDateDDMMYY = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const day = String(d.getDate()).padStart(2, "0");
      const month = String(d.getMonth() + 1).padStart(2, "0");
      const year = String(d.getFullYear()).slice(-2);
      return `${day}/${month}/${year}`;
    } catch {
      return dateStr;
    }
  };

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.client.toLowerCase().includes(search.toLowerCase()) ||
      inv.number.toLowerCase().includes(search.toLowerCase()) ||
      inv.clientEmail.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === "All" ? true : inv.status === statusFilter;

    const matchesDate = dateFilter ? inv.issueDate.startsWith(dateFilter) : true;

    return matchesSearch && matchesStatus && matchesDate;
  });

  const totalPages = Math.ceil(filteredInvoices.length / itemsPerPage) || 1;
  const paginatedInvoices = filteredInvoices.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleCsvExport = async () => {
    if (onExportCsv) {
      onExportCsv();
      return;
    }
    try {
      setIsExporting(true);
      const blob = await exportInvoicesCsvApi();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `invoices-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("CSV Exported Successfully", {
        description: "Invoice records exported to CSV file.",
      });
    } catch (err: any) {
      toast.error("Export Failed", {
        description: err?.message || "Failed to export CSV from server.",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const getStatusBadge = (status: DashboardInvoiceItem["status"]) => {
    switch (status) {
      case "Paid":
        return "bg-emerald-50 text-[#16A34A] dark:bg-emerald-950/60 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50";
      case "Pending":
        return "bg-amber-50 text-[#F59E0B] dark:bg-amber-950/60 dark:text-amber-400 border-amber-200 dark:border-amber-900/50";
      case "Overdue":
        return "bg-red-50 text-[#DC2626] dark:bg-red-950/60 dark:text-red-400 border-red-200 dark:border-red-900/50";
      case "Draft":
        return "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border-slate-200 dark:border-slate-700";
    }
  };

  const formatCurrency = (val: number) =>
    `₹${(val ?? 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden flex flex-col justify-between h-full">
      {/* Table Header Controls */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-base sm:text-lg font-semibold text-slate-900 dark:text-white">
            Recent Invoices
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real billing activity and invoices retrieved from database.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setCurrentPage(1);
              }}
              placeholder="Search invoices..."
              className="pl-9 pr-3 py-1.5 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          {/* Month Filter */}
          <div className="relative flex items-center gap-1">
            <div className="relative flex items-center">
              <CalendarIcon className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none" />
              <input
                type="month"
                value={dateFilter}
                onChange={(e) => {
                  setDateFilter(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-2 py-1.5 text-xs rounded-xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-[#F97316]"
                title="Filter by Issue Month"
              />
            </div>
            {dateFilter && (
              <button
                type="button"
                onClick={() => {
                  setDateFilter("");
                  setCurrentPage(1);
                }}
                className="text-[11px] font-semibold text-slate-500 hover:text-[#F97316] dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                title="Show all months"
              >
                All Months
              </button>
            )}
          </div>

          {/* Status filter tabs */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold">
            {["All", "Paid", "Pending", "Overdue", "Draft"].map((st) => (
              <button
                key={st}
                onClick={() => {
                  setStatusFilter(st);
                  setCurrentPage(1);
                }}
                className={`px-2 py-1 rounded-lg transition-all ${
                  statusFilter === st
                    ? "bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* CSV Export Button */}
          <button
            onClick={handleCsvExport}
            disabled={isExporting}
            className="btn-secondary flex items-center gap-1.5 text-xs px-3 py-1.5 h-auto rounded-xl disabled:opacity-50"
            title="Download Invoices CSV"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span className="hidden sm:inline">{isExporting ? "Exporting..." : "CSV"}</span>
          </button>
        </div>
      </div>

      {/* Table Container with Internal Scroll */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[250px]">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50/80 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800/80 sticky top-0 bg-white dark:bg-[#111827] z-10">
              <th className="py-3 px-5">Invoice Number</th>
              <th className="py-3 px-5">Client</th>
              <th className="py-3 px-5">Issue Date</th>
              <th className="py-3 px-5">Due Date</th>
              <th className="py-3 px-5">Amount</th>
              <th className="py-3 px-5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
            {paginatedInvoices.length > 0 ? (
              paginatedInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors"
                >
                  <td className="py-3 px-5 font-mono font-bold text-[#F97316]">
                    #{inv.number}
                  </td>
                  <td className="py-3 px-5">
                    <div className="flex flex-col">
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {inv.client}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {inv.clientEmail}
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-5 text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap">
                    {formatDateDDMMYY(inv.issueDate)}
                  </td>
                  <td className="py-3 px-5 text-slate-700 dark:text-slate-200 font-medium whitespace-nowrap">
                    {formatDateDDMMYY(inv.dueDate)}
                  </td>
                  <td className="py-3 px-5 font-bold text-slate-900 dark:text-white">
                    {formatCurrency(inv.amount)}
                  </td>
                  <td className="py-3.5 px-5">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${getStatusBadge(
                        inv.status
                      )}`}
                    >
                      {inv.status}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="py-12 text-center text-slate-400 text-xs space-y-2"
                >
                  <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <p className="font-semibold text-slate-700 dark:text-slate-300">
                    No invoices found
                  </p>
                  <p className="text-[11px] text-slate-400">
                    {invoices.length === 0
                      ? "No invoice records in database yet."
                      : "No invoices match the current search or filter."}
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-3.5 border-t border-slate-200/80 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400 select-none">
        <span>
          Showing {filteredInvoices.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0}–
          {Math.min(currentPage * itemsPerPage, filteredInvoices.length)} of {filteredInvoices.length}
        </span>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            disabled={currentPage <= 1}
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs"
            title="First Page"
          >
            <ChevronsLeft className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs"
            title="Previous Page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 px-2">
            Page {currentPage} of {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs"
            title="Next Page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          <button
            type="button"
            onClick={() => setCurrentPage(totalPages)}
            disabled={currentPage >= totalPages || totalPages === 0}
            className="w-8 h-8 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed transition-all shadow-2xs"
            title="Last Page"
          >
            <ChevronsRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
