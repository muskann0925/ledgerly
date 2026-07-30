import React from "react";
import type { PaymentMethod } from "../types/payment.types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import { Filter, RotateCcw, ArrowUpDown } from "lucide-react";

interface FilterBarProps {
  paymentMethod: PaymentMethod | "ALL";
  onPaymentMethodChange: (method: PaymentMethod | "ALL") => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  endDate: string;
  onEndDateChange: (date: string) => void;
  isDeleted: boolean;
  onIsDeletedChange: (deleted: boolean) => void;
  sortBy: "paymentDate" | "amount" | "createdAt";
  onSortByChange: (sort: "paymentDate" | "amount" | "createdAt") => void;
  sortOrder: "asc" | "desc";
  onSortOrderChange: (order: "asc" | "desc") => void;
  onResetFilters: () => void;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  paymentMethod,
  onPaymentMethodChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  isDeleted,
  onIsDeletedChange,
  sortBy,
  onSortByChange,
  sortOrder,
  onSortOrderChange,
  onResetFilters,
}) => {
  const hasActiveFilters =
    paymentMethod !== "ALL" ||
    startDate !== "" ||
    endDate !== "" ||
    isDeleted ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  return (
    <div className="flex items-center gap-2 select-none shrink-0">
      {/* Payment Method Filter */}
      <div className="flex items-center gap-1 shrink-0">
        <Select value={paymentMethod} onValueChange={(val) => onPaymentMethodChange(val as any)}>
          <SelectTrigger className="h-9 text-xs font-semibold rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-xs w-36 shrink-0">
            <Filter className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <SelectValue placeholder="Payment Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Methods</SelectItem>
            <SelectItem value="CASH">Cash</SelectItem>
            <SelectItem value="UPI">UPI / GPay</SelectItem>
            <SelectItem value="BANK_TRANSFER">Bank Wire</SelectItem>
            <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
            <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
            <SelectItem value="CHEQUE">Cheque</SelectItem>
            <SelectItem value="OTHER">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Date Range Start */}
      <div className="flex items-center gap-1 shrink-0">
        <Input
          type="date"
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
          placeholder="Start Date"
          className="h-9 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-xs w-36 shrink-0"
        />
      </div>

      {/* Date Range End */}
      <div className="flex items-center gap-1 shrink-0">
        <Input
          type="date"
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
          placeholder="End Date"
          className="h-9 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-xs w-36 shrink-0"
        />
      </div>

      {/* Sort By */}
      <Select value={sortBy} onValueChange={(val) => onSortByChange(val as any)}>
        <SelectTrigger className="h-9 text-xs font-semibold rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-xs w-36 shrink-0">
          <SelectValue placeholder="Sort By" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="createdAt">Sort: Created Date</SelectItem>
          <SelectItem value="paymentDate">Sort: Payment Date</SelectItem>
          <SelectItem value="amount">Sort: Amount Paid</SelectItem>
        </SelectContent>
      </Select>

      {/* Sort Order Toggle */}
      <Button
        variant="outline"
        size="sm"
        onClick={() => onSortOrderChange(sortOrder === "desc" ? "asc" : "desc")}
        className="h-9 w-9 p-0 rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 shrink-0"
        title={`Sort ${sortOrder === "asc" ? "Ascending" : "Descending"}`}
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
      </Button>

      {/* Soft Deleted Toggle */}
      <Button
        variant={isDeleted ? "default" : "outline"}
        size="sm"
        onClick={() => onIsDeletedChange(!isDeleted)}
        className={`h-9 rounded-xl text-xs font-semibold px-3 shrink-0 ${
          isDeleted
            ? "bg-rose-600 hover:bg-rose-700 text-white"
            : "bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300"
        }`}
      >
        {isDeleted ? "Showing Trash" : "Trash"}
      </Button>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onResetFilters}
          className="h-9 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl shrink-0"
        >
          <RotateCcw className="w-3.5 h-3.5 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
};
