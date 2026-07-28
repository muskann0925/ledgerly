import React from "react";
import type { InvoiceStatus } from "../types/invoice.types";
import { useClientsQuery } from "../../clients/hooks/useClients";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  ArrowUpDown,
  FilterX,
  Calendar,
  Building2,
  Tag,
} from "lucide-react";

export type FilterStatus = InvoiceStatus | "ALL" | "DELETED";

interface FilterBarProps {
  statusFilter: FilterStatus;
  onStatusChange: (status: FilterStatus) => void;
  clientIdFilter: string;
  onClientIdChange: (clientId: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  sortBy: "number" | "issueDate" | "dueDate" | "createdAt" | "total" | "status";
  onSortByChange: (
    sortBy: "number" | "issueDate" | "dueDate" | "createdAt" | "total" | "status"
  ) => void;
  sortOrder: "asc" | "desc";
  onSortOrderToggle: () => void;
  onResetFilters: () => void;
  isFilteredOrSorted: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  statusFilter,
  onStatusChange,
  clientIdFilter,
  onClientIdChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderToggle,
  onResetFilters,
  isFilteredOrSorted,
}) => {
  const { data: clientsData } = useClientsQuery({
    limit: 100,
    isDeleted: false,
  });

  return (
    <div className="flex items-center gap-2 select-none shrink-0">
      {/* Status Filter */}
      <div className="flex items-center gap-1 shrink-0">
        <Tag className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
        <Select value={statusFilter} onValueChange={(val) => onStatusChange(val as FilterStatus)}>
          <SelectTrigger className="h-9 w-[135px] text-xs font-semibold rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shrink-0">
            <SelectValue placeholder="All Statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="DRAFT">Draft</SelectItem>
            <SelectItem value="PENDING">Pending</SelectItem>
            <SelectItem value="SENT">Sent</SelectItem>
            <SelectItem value="VIEWED">Viewed</SelectItem>
            <SelectItem value="PARTIALLY_PAID">Partially Paid</SelectItem>
            <SelectItem value="PAID">Paid</SelectItem>
            <SelectItem value="OVERDUE">Overdue</SelectItem>
            <SelectItem value="CANCELLED">Cancelled</SelectItem>
            <SelectItem value="REFUNDED">Refunded</SelectItem>
            <SelectItem value="DELETED">Soft Deleted</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Client Filter */}
      <div className="flex items-center gap-1 shrink-0">
        <Building2 className="w-3.5 h-3.5 text-slate-400 hidden sm:inline" />
        <Select value={clientIdFilter} onValueChange={(val) => onClientIdChange(val)}>
          <SelectTrigger className="h-9 w-[140px] text-xs font-semibold rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shrink-0">
            <SelectValue placeholder="All Clients" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Clients</SelectItem>
            {clientsData?.clients.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.companyName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Start */}
      <div className="flex items-center gap-1 shrink-0">
        <Calendar className="w-3.5 h-3.5 text-slate-400 hidden lg:inline" />
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          placeholder="From Issue Date"
          className="h-9 w-[130px] text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shrink-0"
        />
      </div>

      {/* Date Range End */}
      <div className="flex items-center gap-1 shrink-0">
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          placeholder="To Issue Date"
          className="h-9 w-[130px] text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shrink-0"
        />
      </div>

      {/* Sort By Field */}
      <div className="flex items-center gap-1 shrink-0">
        <Select
          value={sortBy}
          onValueChange={(val) =>
            onSortByChange(
              val as "number" | "issueDate" | "dueDate" | "createdAt" | "total" | "status"
            )
          }
        >
          <SelectTrigger className="h-9 w-[145px] text-xs font-semibold rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Sort: Created Date</SelectItem>
            <SelectItem value="number">Sort: Invoice No</SelectItem>
            <SelectItem value="issueDate">Sort: Issue Date</SelectItem>
            <SelectItem value="dueDate">Sort: Due Date</SelectItem>
            <SelectItem value="total">Sort: Total Amount</SelectItem>
            <SelectItem value="status">Sort: Status</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Order Toggle */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSortOrderToggle}
          className="h-9 w-9 p-0 rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shrink-0"
          title={`Order: ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
        >
          <ArrowUpDown className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Reset Filters */}
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
