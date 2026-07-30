import React from "react";
import type { Payment } from "../types/payment.types";
import { PaymentRow } from "./PaymentRow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

interface PaymentsTableProps {
  payments: Payment[];
  onView: (payment: Payment) => void;
  onDelete: (payment: Payment) => void;
  onRestore: (payment: Payment) => void;
  onRetryPayment?: (payment: Payment) => void;
  onRefreshStatus?: (payment: Payment) => void;
  onDownloadReceipt?: (payment: Payment) => void;
  onPreviewReceipt?: (payment: Payment) => void;
  onPrintReceipt?: (payment: Payment) => void;
  onEmailReceipt?: (payment: Payment) => void;
}

export const PaymentsTable: React.FC<PaymentsTableProps> = ({
  payments,
  onView,
  onDelete,
  onRestore,
  onRetryPayment,
  onRefreshStatus,
  onDownloadReceipt,
  onPreviewReceipt,
  onPrintReceipt,
  onEmailReceipt,
}) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs">
      <div className="overflow-x-auto">
        <Table className="w-full select-none">
          <TableHeader>
            <TableRow className="bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Payment Date
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Invoice No.
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Client Name
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Amount Paid
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Method
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Transaction ID
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {payments.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-xs text-slate-500 dark:text-slate-400"
                >
                  No payment transactions found.
                </TableCell>
              </TableRow>
            ) : (
              payments.map((payment) => (
                <PaymentRow
                  key={payment.id}
                  payment={payment}
                  onView={onView}
                  onDelete={onDelete}
                  onRestore={onRestore}
                  onRetryPayment={onRetryPayment}
                  onRefreshStatus={onRefreshStatus}
                  onDownloadReceipt={onDownloadReceipt}
                  onPreviewReceipt={onPreviewReceipt}
                  onPrintReceipt={onPrintReceipt}
                  onEmailReceipt={onEmailReceipt}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
