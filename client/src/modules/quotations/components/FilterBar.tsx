import React from "react";
import type { QuotationStatus } from "../types/quotation.types";
import { useClientsQuery } from "../../clients/hooks/useClients";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Filter, RotateCcw, ArrowUpDown, Building2 } from "lucide-react";

interface FilterBarProps {
  status: QuotationStatus | "ALL";
  onStatusChange: (status: QuotationStatus | "ALL") => void;
  clientId: string;
  onClientIdChange: (clientId: string) => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  isExpired: boolean;
  onIsExpiredChange: (expired: boolean) => void;
  isDeleted: boolean;
  onIsDeletedChange: (deleted: boolean) => void;
  sortBy: "quotationNumber" | "issueDate" | "expiryDate" | "total" | "status" | "createdAt";
  onSortByChange: (sort: "quotationNumber" | "issueDate" | "expiryDate" | "total" | "status" | "createdAt") => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (order: "asc" | "desc") => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  status,
  onStatusChange,
  clientId,
  onClientIdChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  isExpired,
  onIsExpiredChange,
  isDeleted,
  onIsDeletedChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onResetFilters,
}) => {
  const { data: clientsData } = useClientsQuery({ limit: 100, isDeleted: false });

  const hasActiveFilters =
    status !== "ALL" ||
    clientId !== "ALL" ||
    startDate !== "" ||
    endDate !== "" ||
    isExpired ||
    isDeleted ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  return (
    <div className="flex items-center gap-2 select-none shrink-0">
      {/* Status Filter */}
      <Select value={status} onValueChange={(val) => onStatusChange(val as any)}>
        <SelectTrigger className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-xs w-36 shrink-0">
          <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Statuses</SelectItem>
          <SelectItem value="DRAFT">Draft</SelectItem>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="APPROVED">Approved</SelectItem>
          <SelectItem value="REJECTED">Rejected</SelectItem>
          <SelectItem value="CONVERTED">Converted</SelectItem>
          <SelectItem value="EXPIRED">Expired</SelectItem>
        </SelectContent>
      </Select>

      {/* Client Filter */}
      <Select value={clientId} onValueChange={onClientIdChange}>
        <SelectTrigger className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-xs w-40 shrink-0">
          <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
          <SelectValue placeholder="All Clients" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="ALL">All Clients</SelectItem>
          {clientsData?.clients.map((c) => (
            <SelectItem key={c.id} value={c.id} className="text-xs">
              {c.companyName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Date Range Start */}
      <Input
        type="date"
        value={startDate}
        onChange={(e) => onStartDateChange(e.target.value)}
        placeholder="Start Date"
        className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-xs w-36 shrink-0"
      />

      {/* Date Range End */}
      <Input
        type="date"
        value={endDate}
        onChange={(e) => onEndDateChange(e.target.value)}
        placeholder="End Date"
        className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-xs w-36 shrink-0"
      />

      {/* Sort By */}
      <Select value={sortBy} onValueChange={(val) => onSortByChange(val as any)}>
        <SelectTrigger className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-xs w-36 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 mr-1 text-slate-400" />
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Created Date</SelectItem>
          <SelectItem value="quotationNumber">Quotation No.</SelectItem>
          <SelectItem value="issueDate">Issue Date</SelectItem>
          <SelectItem value="expiryDate">Expiry Date</SelectItem>
          <SelectItem value="total">Total Amount</SelectItem>
          <SelectItem value="status">Status</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Order Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSortOrderChange(sortOrder === "desc" ? "asc" : "desc")}
        className="h-10 rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-xs font-semibold px-3 shrink-0"
      >
        {sortOrder.toUpperCase()}
      </Button>

      {/* Expired Toggle */}
      <Button
        variant={isExpired ? "default" : "outline"}
        size="sm"
        onClick={() => onIsExpiredChange(!isExpired)}
        className={`h-10 rounded-xl text-xs font-semibold px-3 shrink-0 ${
          isExpired
            ? "bg-amber-600 hover:bg-amber-700 text-white"
            : "bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
        }`}
      >
        {isExpired ? "Showing Expired" : "Expired"}
      </Button>

      {/* Trash Toggle */}
      <Button
        variant={isDeleted ? "default" : "outline"}
        size="sm"
        onClick={() => onIsDeletedChange(!isDeleted)}
        className={`h-10 rounded-xl text-xs font-semibold px-3 shrink-0 ${
          isDeleted
            ? "bg-red-600 hover:bg-red-700 text-white"
            : "bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
        }`}
      >
        {isDeleted ? "Showing Deleted" : "Trash"}
      </Button>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="h-10 rounded-xl text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white px-2.5 shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
};
