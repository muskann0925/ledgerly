import React from "react";
import { ArrowUpDown, Filter, Download, FilterX } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import type { Client, ClientType } from "../types/client.types";
import { toast } from "sonner";

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
  const handleExportCSV = () => {
    if (!clientsData.length) {
      toast.error("Export Error", { description: "No client records available to export." });
      return;
    }
    const headers = ["Company Name", "Contact Person", "Email", "Phone", "Client Type", "GSTIN", "PAN", "Status", "Created Date"];
    const rows = clientsData.map((c) => [
      `"${(c.companyName || "").replace(/"/g, '""')}"`,
      `"${(c.contactPerson || "").replace(/"/g, '""')}"`,
      `"${(c.email || "").replace(/"/g, '""')}"`,
      `"${(c.phone || "").replace(/"/g, '""')}"`,
      `"${(c.clientType || "").replace(/"/g, '""')}"`,
      `"${(c.gstNumber || "").replace(/"/g, '""')}"`,
      `"${(c.panNumber || "").replace(/"/g, '""')}"`,
      `"${(c.status || "ACTIVE").replace(/"/g, '""')}"`,
      new Date(c.createdAt).toISOString().slice(0, 10),
    ]);

    const csvString = [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Clients_Directory_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV Exported", { description: "Client records downloaded to CSV." });
  };

  return (
    <div className="flex items-center gap-2 select-none shrink-0">
      {/* Status Filter Dropdown */}
      <div className="flex items-center gap-1 shrink-0">
        <Filter className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
        <Select value={statusFilter} onValueChange={(val) => onStatusChange(val as FilterStatus)}>
          <SelectTrigger className="h-9 w-[130px] text-xs font-semibold rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shrink-0">
            <SelectValue placeholder="All Status" />
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
        <SelectTrigger className="h-9 w-[130px] text-xs font-semibold rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shrink-0">
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
        <SelectTrigger className="h-9 w-[145px] text-xs font-semibold rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shrink-0">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Sort: Created Date</SelectItem>
          <SelectItem value="companyName">Sort: Company Name</SelectItem>
          <SelectItem value="email">Sort: Email</SelectItem>
          <SelectItem value="status">Sort: Status</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Direction Toggle Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onSortOrderToggle}
        className="h-9 w-9 p-0 rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shrink-0"
        title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
      </Button>

      {/* Export CSV Button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={handleExportCSV}
        className="h-9 px-3.5 text-xs font-semibold rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shrink-0 gap-1.5 shadow-xs"
        title="Export CSV"
      >
        <Download className="w-3.5 h-3.5 text-[#F97316]" />
        <span>Export CSV</span>
      </Button>

      {/* Reset Filters Button */}
      {isFilteredOrSorted && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="h-9 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl shrink-0"
        >
          <FilterX className="w-3.5 h-3.5 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
};
