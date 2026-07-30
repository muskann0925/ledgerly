import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";
import type { Invoice } from "../../invoices/types/invoice.types";
import type { GatewayInvoiceTarget } from "./SimulatedPaymentGatewayModal";

interface AwaitingInvoicesTableProps {
  invoices: Invoice[];
  isLoading?: boolean;
  onPayNow: (target: GatewayInvoiceTarget) => void;
}

export const AwaitingInvoicesTable: React.FC<AwaitingInvoicesTableProps> = ({
  invoices,
  isLoading = false,
  onPayNow,
}) => {
  const formatCurrency = (val: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "-";
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs">
      <div className="overflow-x-auto">
        <Table className="w-full select-none text-xs">
          <TableHeader>
            <TableRow className="bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Invoice No.
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Client Name
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Due Date
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Total Billed
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Balance Due
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4 text-right">
                Action
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-xs text-slate-500 dark:text-slate-400"
                >
                  Loading awaiting invoices...
                </TableCell>
              </TableRow>
            ) : invoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={7}
                  className="text-center py-8 text-xs text-slate-500 dark:text-slate-400"
                >
                  No outstanding invoices awaiting payment.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((inv) => (
                <TableRow
                  key={inv.id}
                  className="hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800/60 transition-colors"
                >
                  {/* Invoice Number */}
                  <TableCell className="font-extrabold py-3.5 px-4 text-slate-900 dark:text-white whitespace-nowrap">
                    {inv.number}
                  </TableCell>

                  {/* Client Name */}
                  <TableCell className="font-semibold py-3.5 px-4 text-slate-800 dark:text-slate-200">
                    {inv.client?.companyName || inv.client?.contactPerson || "Unknown Client"}
                  </TableCell>

                  {/* Due Date */}
                  <TableCell className="py-3.5 px-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
                    <span className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {formatDate(inv.dueDate)}
                    </span>
                  </TableCell>

                  {/* Total Billed */}
                  <TableCell className="py-3.5 px-4 font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
                    {formatCurrency(inv.total, inv.currency)}
                  </TableCell>

                  {/* Balance Due */}
                  <TableCell className="py-3.5 px-4 font-black text-rose-600 dark:text-rose-400 whitespace-nowrap">
                    {formatCurrency(inv.balanceDue, inv.currency)}
                  </TableCell>

                  {/* Status Badge */}
                  <TableCell className="py-3.5 px-4 whitespace-nowrap">
                    <Badge
                      variant="outline"
                      className={`text-[11px] font-bold py-0.5 px-2.5 ${
                        inv.status === "OVERDUE"
                          ? "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30"
                          : inv.status === "PARTIALLY_PAID"
                          ? "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30"
                          : "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30"
                      }`}
                    >
                      {inv.status === "OVERDUE"
                        ? "Overdue"
                        : inv.status === "PARTIALLY_PAID"
                        ? "Partial"
                        : "Pending"}
                    </Badge>
                  </TableCell>

                  {/* Action Button */}
                  <TableCell className="py-3.5 px-4 text-right whitespace-nowrap">
                    <Button
                      size="sm"
                      onClick={() =>
                        onPayNow({
                          id: inv.id,
                          number: inv.number,
                          clientName:
                            inv.client?.companyName ||
                            inv.client?.contactPerson ||
                            "Client",
                          amount: inv.balanceDue,
                          currency: inv.currency,
                        })
                      }
                      className="h-8 px-3 bg-[#F97316] hover:bg-orange-600 text-white rounded-xl font-bold text-xs shadow-xs transition-all inline-flex items-center gap-1.5"
                    >
                      <span>Pay Now</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
