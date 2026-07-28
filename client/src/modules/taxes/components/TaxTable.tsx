import React from "react";
import {
  MoreVertical,
  Eye,
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Percent,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Pagination } from "../../invoices/components/Pagination";
import { Skeleton } from "../../../components/ui/skeleton";
import type { Tax, PaginationMeta } from "../types/tax.types";

interface TaxTableProps {
  taxes: Tax[];
  pagination: PaginationMeta;
  isLoading: boolean;
  selectedIds: string[];
  onSelectAll: (checked: boolean) => void;
  onSelectOne: (id: string, checked: boolean) => void;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  onViewDetails: (tax: Tax) => void;
  onEdit: (tax: Tax) => void;
  onToggleStatus: (tax: Tax, newStatus: boolean) => void;
  onSetDefault?: (tax: Tax) => void;
  onDelete: (tax: Tax) => void;
}

export const TaxTable: React.FC<TaxTableProps> = ({
  taxes,
  pagination,
  isLoading,
  selectedIds,
  onSelectAll,
  onSelectOne,
  onPageChange,
  onLimitChange,
  onViewDetails,
  onEdit,
  onToggleStatus,
  onSetDefault,
  onDelete,
}) => {
  const isAllSelected = taxes.length > 0 && taxes.every((t) => selectedIds.includes(t.id));
  const isSomeSelected = taxes.some((t) => selectedIds.includes(t.id)) && !isAllSelected;

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const getTaxTypeBadgeColor = (type: string) => {
    switch (type) {
      case "GST":
      case "CGST":
      case "SGST":
      case "IGST":
        return "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800";
      case "TDS":
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800";
      case "VAT":
        return "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800";
      default:
        return "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700";
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-[#111827] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/50 border-b border-slate-200/80 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 select-none">
                <th className="py-3.5 px-4 w-10 text-center">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    ref={(input) => {
                      if (input) input.indeterminate = isSomeSelected;
                    }}
                    onChange={(e) => onSelectAll(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#F97316] focus:ring-[#F97316]/20 bg-white dark:bg-slate-900 cursor-pointer"
                  />
                </th>
                <th className="py-3.5 px-4">Tax Name & Code</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Rate / Value</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Last Updated</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
              {isLoading ? (
                Array.from({ length: 5 }).map((_, idx) => (
                  <tr key={idx} className="animate-pulse">
                    <td className="py-4 px-4 text-center">
                      <Skeleton className="w-4 h-4 mx-auto rounded" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="w-32 h-4 mb-1" />
                      <Skeleton className="w-20 h-3" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="w-16 h-5 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="w-16 h-4" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="w-16 h-5 rounded-full" />
                    </td>
                    <td className="py-4 px-4">
                      <Skeleton className="w-20 h-4" />
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Skeleton className="w-8 h-8 rounded-xl ml-auto" />
                    </td>
                  </tr>
                ))
              ) : taxes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <div className="w-12 h-12 rounded-2xl bg-orange-50 dark:bg-orange-950/30 flex items-center justify-center text-[#F97316]">
                        <Percent className="w-6 h-6" />
                      </div>
                      <span className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                        No Tax Rates Found
                      </span>
                      <p className="text-xs text-slate-400 max-w-sm">
                        No tax configurations match your filters. Create a new tax rate to start applying taxes across invoices and expenses.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                taxes.map((tax) => {
                  const isSelected = selectedIds.includes(tax.id);

                  return (
                    <tr
                      key={tax.id}
                      className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 transition-colors ${
                        isSelected ? "bg-orange-50/40 dark:bg-orange-950/10" : ""
                      }`}
                    >
                      <td className="py-3.5 px-4 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => onSelectOne(tax.id, e.target.checked)}
                          className="w-4 h-4 rounded border-slate-300 dark:border-slate-700 text-[#F97316] focus:ring-[#F97316]/20 bg-white dark:bg-slate-900 cursor-pointer"
                        />
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900 dark:text-slate-100">
                            {tax.name}
                          </span>
                          <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500">
                            {tax.code}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <Badge
                          variant="outline"
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${getTaxTypeBadgeColor(
                            tax.type
                          )}`}
                        >
                          {tax.type}
                        </Badge>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="font-extrabold text-slate-900 dark:text-slate-100">
                          {tax.valueType === "PERCENTAGE" ? `${tax.rate}%` : `₹${tax.rate.toLocaleString("en-IN")}`}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => onToggleStatus(tax, !tax.isActive)}
                          className="cursor-pointer group focus:outline-hidden"
                          title="Click to toggle status"
                        >
                          {tax.isActive ? (
                            <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 group-hover:bg-emerald-100">
                              <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active
                            </Badge>
                          ) : (
                            <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-lg flex items-center gap-1 group-hover:bg-slate-200">
                              <XCircle className="w-3 h-3 text-slate-400" /> Inactive
                            </Badge>
                          )}
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400 font-medium">
                        {formatDate(tax.updatedAt)}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="w-8 h-8 rounded-xl text-slate-500 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44 rounded-xl">
                            <DropdownMenuItem
                              onClick={() => onViewDetails(tax)}
                              className="cursor-pointer gap-2"
                            >
                              <Eye className="w-4 h-4 text-slate-400" /> View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => onEdit(tax)}
                              className="cursor-pointer gap-2"
                            >
                              <Edit2 className="w-4 h-4 text-slate-400" /> Edit Tax
                            </DropdownMenuItem>
                             <DropdownMenuItem
                               onClick={() => onToggleStatus(tax, !tax.isActive)}
                               className="cursor-pointer gap-2"
                             >
                               {tax.isActive ? (
                                 <>
                                   <XCircle className="w-4 h-4 text-amber-500" /> Disable Tax
                                 </>
                               ) : (
                                 <>
                                   <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Enable Tax
                                 </>
                               )}
                             </DropdownMenuItem>
                             {!tax.isDefault && onSetDefault && (
                               <DropdownMenuItem
                                 onClick={() => onSetDefault(tax)}
                                 className="cursor-pointer gap-2 text-indigo-600 dark:text-indigo-400"
                               >
                                 <ShieldCheck className="w-4 h-4" /> Set as Default
                               </DropdownMenuItem>
                             )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => onDelete(tax)}
                              className="cursor-pointer gap-2 text-rose-600 dark:text-rose-400 focus:text-rose-600"
                            >
                              <Trash2 className="w-4 h-4" /> Delete Tax
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Standard Pagination Component */}
        <div className="px-4 pb-4">
          <Pagination
            pagination={pagination}
            onPageChange={onPageChange}
            onLimitChange={onLimitChange}
          />
        </div>
      </div>
    </div>
  );
};
