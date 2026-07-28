import React from "react";
import type { Quotation } from "../types/quotation.types";
import { QuotationRow } from "./QuotationRow";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../components/ui/table";

interface QuotationsTableProps {
  quotations: Quotation[];
  onView: (quotation: Quotation) => void;
  onEdit: (quotation: Quotation) => void;
  onDelete: (quotation: Quotation) => void;
  onRestore: (quotation: Quotation) => void;
  onDuplicate: (quotation: Quotation) => void;
  onApprove: (quotation: Quotation) => void;
  onReject: (quotation: Quotation) => void;
  onConvert: (quotation: Quotation) => void;
  onDownloadPdf: (quotation: Quotation) => void;
  onPreview?: (quotation: Quotation) => void;
  onPrint?: (quotation: Quotation) => void;
  onEmail?: (quotation: Quotation) => void;
}

export const QuotationsTable: React.FC<QuotationsTableProps> = ({
  quotations,
  onView,
  onEdit,
  onDelete,
  onRestore,
  onDuplicate,
  onApprove,
  onReject,
  onConvert,
  onDownloadPdf,
  onPreview,
  onPrint,
  onEmail,
}) => {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs">
      <div className="overflow-x-auto">
        <Table className="w-full select-none">
          <TableHeader>
            <TableRow className="bg-slate-50/80 dark:bg-slate-900/60 hover:bg-slate-50/80 dark:hover:bg-slate-900/60 border-b border-slate-200 dark:border-slate-800">
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Quotation No.
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Client
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Issue Date
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Expiry Date
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Total Proposal
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Status
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4">
                Created Date
              </TableHead>
              <TableHead className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 py-3.5 px-4 text-right">
                Actions
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {quotations.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={8}
                  className="text-center py-8 text-xs text-slate-500 dark:text-slate-400"
                >
                  No quotation proposals found.
                </TableCell>
              </TableRow>
            ) : (
              quotations.map((quotation) => (
                <QuotationRow
                  key={quotation.id}
                  quotation={quotation}
                  onView={onView}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onRestore={onRestore}
                  onDuplicate={onDuplicate}
                  onApprove={onApprove}
                  onReject={onReject}
                  onConvert={onConvert}
                  onDownloadPdf={onDownloadPdf}
                  onPreview={onPreview}
                  onPrint={onPrint}
                  onEmail={onEmail}
                />
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
