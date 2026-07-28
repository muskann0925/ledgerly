import React, { useState } from "react";
import { ArrowUpDown, Filter, RotateCcw, Download, FileSpreadsheet, FileText } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import type { Client, ClientType } from "../types/client.types";
import { toast } from "sonner";
import { useOutsideClick } from "../../../hooks/useOutsideClick";

export type FilterStatus = "ALL" | "ACTIVE" | "DELETED";

interface FilterBarProps {
  statusFilter: FilterStatus;
  onStatusChange: (status: FilterStatus) => void;
  typeFilter: "ALL" | ClientType;
  onTypeChange: (type: "ALL" | ClientType) => void;
  sortBy: "companyName" | "createdAt" | "status" | "email";
  onSortByChange: (sortBy: "companyName" | "createdAt" | "status" | "email") => void;
  sortOrder: "asc" | "desc";
  onSortOrderToggle: () => void;
  onResetFilters: () => void;
  isFilteredOrSorted: boolean;
  clientsData?: Client[];
}

export const FilterBar: React.FC<FilterBarProps> = ({
  statusFilter,
  onStatusChange,
  typeFilter,
  onTypeChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderToggle,
  onResetFilters,
  isFilteredOrSorted,
  clientsData = [],
}) => {
  const [showExportMenu, setShowExportMenu] = useState(false);
  const exportMenuRef = useOutsideClick<HTMLDivElement>(
    () => setShowExportMenu(false),
    showExportMenu
  );

  const handleExportCSV = () => {
    setShowExportMenu(false);
    if (!clientsData.length) {
      toast.error("Export Error", { description: "No client records available to export." });
      return;
    }
    const headers = ["Company Name", "Contact Person", "Email", "Phone", "Client Type", "GSTIN", "PAN", "Status", "Created Date"];
    const rows = clientsData.map((c) => [
      `"${(c.companyName || "").replace(/"/g, '""')}"`,
      `"${(c.contactPerson || "").replace(/"/g, '""')}"`,
      c.email || "",
      c.phone || "",
      c.clientType || "",
      c.gstNumber || "",
      c.panNumber || "",
      c.status || "ACTIVE",
      new Date(c.createdAt).toISOString().slice(0, 10),
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Clients_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Exported", { description: "Client records downloaded to CSV." });
  };

  const handleExportExcel = () => {
    setShowExportMenu(false);
    if (!clientsData.length) {
      toast.error("Export Error", { description: "No client records available to export." });
      return;
    }
    const headers = ["Company Name", "Contact Person", "Email", "Phone", "Client Type", "GSTIN", "PAN", "Status", "Created Date"];
    const rows = clientsData.map((c) => [
      c.companyName || "",
      c.contactPerson || "",
      c.email || "",
      c.phone || "",
      c.clientType || "",
      c.gstNumber || "",
      c.panNumber || "",
      c.status || "ACTIVE",
      new Date(c.createdAt).toISOString().slice(0, 10),
    ]);

    const excelContent = "data:application/vnd.ms-excel;charset=utf-8," + encodeURIComponent([headers.join("\t"), ...rows.map((e) => e.join("\t"))].join("\n"));
    const link = document.createElement("a");
    link.setAttribute("href", excelContent);
    link.setAttribute("download", `Clients_Directory_${new Date().toISOString().slice(0, 10)}.xls`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Excel Exported", { description: "Client records downloaded to Excel sheet." });
  };

  return (
    <div className="flex items-center gap-2.5 select-none shrink-0">
      {/* Status Filter Dropdown */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Filter className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 hidden sm:inline" />
        <Select value={statusFilter} onValueChange={(val) => onStatusChange(val as FilterStatus)}>
          <SelectTrigger className="h-10 w-[120px] text-xs font-semibold rounded-xl bg-white dark:bg-[#111827] shrink-0">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Status</SelectItem>
            <SelectItem value="ACTIVE">Active</SelectItem>
            <SelectItem value="DELETED">Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client Type Filter */}
      <Select value={typeFilter} onValueChange={(val) => onTypeChange(val as "ALL" | ClientType)}>
        <SelectTrigger className="h-10 w-[130px] text-xs font-semibold rounded-xl bg-white dark:bg-[#111827]">
          <SelectValue placeholder="Client Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Types</SelectItem>
          <SelectItem value="BUSINESS">Business</SelectItem>
          <SelectItem value="INDIVIDUAL">Individual</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort By Select */}
      <Select
        value={sortBy}
        onValueChange={(val) =>
          onSortByChange(val as "companyName" | "createdAt" | "status" | "email")
        }
      >
        <SelectTrigger className="h-10 w-[145px] text-xs font-semibold rounded-xl bg-white dark:bg-[#111827]">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Created Date</SelectItem>
          <SelectItem value="companyName">Company Name</SelectItem>
          <SelectItem value="email">Email</SelectItem>
          <SelectItem value="status">Status</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Direction Toggle Button */}
      <button
        type="button"
        onClick={onSortOrderToggle}
        className="h-10 px-3 flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
        title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
      >
        <ArrowUpDown className="w-3.5 h-3.5 text-[#F97316]" />
        <span className="uppercase text-[10px] font-bold">{sortOrder}</span>
      </button>

      {/* Export Options Dropdown */}
      <div className="relative" ref={exportMenuRef}>
        <button
          type="button"
          onClick={() => setShowExportMenu(!showExportMenu)}
          className="h-10 px-3 flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
          title="Export Client Data"
        >
          <Download className="w-3.5 h-3.5 text-[#F97316]" />
          <span>Export</span>
        </button>

        {showExportMenu && (
          <div className="absolute right-0 mt-1 w-44 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xl p-1.5 z-50 text-left">
            <button
              onClick={handleExportCSV}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <FileText className="w-3.5 h-3.5 text-slate-400" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={handleExportExcel}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-slate-400" />
              <span>Export Excel (.xls)</span>
            </button>
          </div>
        )}
      </div>

      {/* Reset Filters Button */}
      {isFilteredOrSorted && (
        <button
          type="button"
          onClick={onResetFilters}
          className="h-10 px-3 flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
          title="Reset all filters"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Reset</span>
        </button>
      )}
    </div>
  );
};
