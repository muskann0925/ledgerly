import React from "react";
import type { Invoice } from "../types/invoice.types";
import { InvoiceRow } from "./InvoiceRow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

interface InvoiceTableProps {
  invoices: Invoice[];
  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onRestore: (invoice: Invoice) => void;
  onDuplicate: (invoice: Invoice) => void;
  onDownloadPdf: (invoice: Invoice) => void;
  onPreview?: (invoice: Invoice) => void;
  onPrint: (invoice: Invoice) => void;
  onEmail?: (invoice: Invoice) => void;
  onMarkPaid: (invoice: Invoice) => void;
  onMarkPartial: (invoice: Invoice) => void;
  onChangeStatus: (invoice: Invoice) => void;
}

export const InvoiceTable: React.FC<InvoiceTableProps> = ({
  invoices,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onDuplicate,
  onDownloadPdf,
  onPreview,
  onPrint,
  onEmail,
  onMarkPaid,
  onMarkPartial,
  onChangeStatus,
}) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs">
      <div className="overflow-x-auto">
        <Table className="w-full select-none">
          <TableHeader>
            <TableRow className="bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Invoice No.
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Client Name
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Issue Date
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Due Date
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Total
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Paid
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Balance Due
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
            {invoices.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-xs text-slate-500 dark:text-slate-400"
                >
                  No invoices found.
                </TableCell>
              </TableRow>
            ) : (
              invoices.map((invoice) => (
                <InvoiceRow
                  key={invoice.id}
                  invoice={invoice}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onRestore={onRestore}
                  onDuplicate={onDuplicate}
                  onDownloadPdf={onDownloadPdf}
                  onPreview={onPreview}
                  onPrint={onPrint}
                  onEmail={onEmail}
                  onMarkPaid={onMarkPaid}
                  onMarkPartial={onMarkPartial}
                  onChangeStatus={onChangeStatus}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
