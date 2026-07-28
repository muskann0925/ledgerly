import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { SystemSettings } from "../types/settings.types";
import {
  useUpdateInvoiceMutation,
  useResetSectionMutation,
} from "../hooks/useSettings";
import { Receipt, RotateCcw, Save, Sparkles } from "lucide-react";

const invoiceSchema = z.object({
  invoicePrefix: z.string().min(1, "Invoice prefix required"),
  quotationPrefix: z.string().min(1, "Quotation prefix required"),
  receiptPrefix: z.string().min(1, "Receipt prefix required"),
  includeYearInNumber: z.boolean(),
  numberSeparator: z.string(),
  startingNumber: z.number().int().min(1, "Starting number must be at least 1"),
  zeroPaddingLength: z.number().int().min(3).max(10),
  defaultPaymentTerms: z.string().min(2, "Default payment terms required"),
  defaultDueDays: z.number().int().min(0, "Due days cannot be negative"),
  defaultCurrency: z.string().optional(),
  timezone: z.string().optional(),
  dateFormat: z.string().optional(),
  numberFormat: z.string().optional(),
  decimalPrecision: z.number().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

interface InvoiceTabProps {
  settings: SystemSettings;
  canEdit: boolean;
}

export const InvoiceTab: React.FC<InvoiceTabProps> = ({ settings, canEdit }) => {
  const updateInvoiceMutation = useUpdateInvoiceMutation();
  const resetSectionMutation = useResetSectionMutation();

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isDirty },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      invoicePrefix: settings.invoicePrefix || "INV",
      quotationPrefix: settings.quotationPrefix || "QTN",
      receiptPrefix: settings.receiptPrefix || "RCT",
      includeYearInNumber: settings.includeYearInNumber ?? true,
      numberSeparator: settings.numberSeparator ?? "-",
      startingNumber: settings.startingNumber || 1,
      zeroPaddingLength: settings.zeroPaddingLength || 6,
      defaultPaymentTerms: settings.defaultPaymentTerms || "Net 30",
      defaultDueDays: settings.defaultDueDays ?? 30,
      defaultCurrency: (settings.defaultCurrency || "INR") as any,
      timezone: settings.timezone || "Asia/Kolkata",
      dateFormat: (settings.dateFormat || "DD/MM/YYYY") as any,
      numberFormat: (settings.numberFormat || "en-IN") as any,
      decimalPrecision: settings.decimalPrecision ?? 2,
    },
  });

  useEffect(() => {
    reset({
      invoicePrefix: settings.invoicePrefix || "INV",
      quotationPrefix: settings.quotationPrefix || "QTN",
      receiptPrefix: settings.receiptPrefix || "RCT",
      includeYearInNumber: settings.includeYearInNumber ?? true,
      numberSeparator: settings.numberSeparator ?? "-",
      startingNumber: settings.startingNumber || 1,
      zeroPaddingLength: settings.zeroPaddingLength || 6,
      defaultPaymentTerms: settings.defaultPaymentTerms || "Net 30",
      defaultDueDays: settings.defaultDueDays ?? 30,
      defaultCurrency: (settings.defaultCurrency || "INR") as any,
      timezone: settings.timezone || "Asia/Kolkata",
      dateFormat: (settings.dateFormat || "DD/MM/YYYY") as any,
      numberFormat: (settings.numberFormat || "en-IN") as any,
      decimalPrecision: settings.decimalPrecision ?? 2,
    });
  }, [settings, reset]);

  const invoicePrefix = watch("invoicePrefix");
  const quotationPrefix = watch("quotationPrefix");
  const includeYearInNumber = watch("includeYearInNumber");
  const numberSeparator = watch("numberSeparator");
  const startingNumber = watch("startingNumber");
  const zeroPaddingLength = watch("zeroPaddingLength");

  const year = new Date().getFullYear();
  const cleanPrefix = (invoicePrefix || "INV").trim().replace(new RegExp(`\\${numberSeparator || "-"}+$`), "");
  const paddedSeq = String(startingNumber || 1).padStart(zeroPaddingLength || 6, "0");
  const sampleInvoiceNumber = includeYearInNumber
    ? `${cleanPrefix}${numberSeparator || "-"}${year}${numberSeparator || "-"}${paddedSeq}`
    : `${cleanPrefix}${numberSeparator || "-"}${paddedSeq}`;

  const cleanQtnPrefix = (quotationPrefix || "QTN").trim().replace(new RegExp(`\\${numberSeparator || "-"}+$`), "");
  const sampleQuotationNumber = includeYearInNumber
    ? `${cleanQtnPrefix}${numberSeparator || "-"}${year}${numberSeparator || "-"}${paddedSeq}`
    : `${cleanQtnPrefix}${numberSeparator || "-"}${paddedSeq}`;

  const onSubmit = (data: InvoiceFormValues) => {
    updateInvoiceMutation.mutate(data);
  };

  const handleResetSection = () => {
    resetSectionMutation.mutate("invoice");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#F97316]" />
            <span>Invoice & Billing Preferences</span>
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure default document prefixes, sequential starting numbers, payment terms, and currency formatting.
          </p>
        </div>

        {canEdit && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleResetSection}
              disabled={resetSectionMutation.isPending}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold transition-all flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset Defaults</span>
            </button>
            <button
              type="submit"
              disabled={!isDirty || updateInvoiceMutation.isPending}
              className="px-4 py-2 rounded-xl bg-[#F97316] text-white hover:bg-orange-600 disabled:opacity-50 text-xs font-bold shadow-xs transition-all flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Save Changes</span>
            </button>
          </div>
        )}
      </div>

      {/* Live Numbering Format Preview Banner */}
      <div className="p-4 rounded-2xl border border-orange-200 dark:border-orange-900/40 bg-orange-50/50 dark:bg-orange-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 dark:bg-orange-900/50 text-[#F97316] flex items-center justify-center shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-extrabold text-slate-900 dark:text-slate-100 block">
              Configured Document Numbering Format
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              Future documents will automatically use this sequential format
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono font-bold text-slate-800 dark:text-slate-200 bg-white dark:bg-[#111827] px-3 py-1.5 rounded-xl border border-orange-200 dark:border-orange-900/50">
          <div>
            <span className="text-[10px] font-sans font-semibold text-slate-400 block">Invoice Sample</span>
            <span className="text-[#F97316]">{sampleInvoiceNumber}</span>
          </div>
          <div className="h-6 w-px bg-slate-200 dark:bg-slate-800" />
          <div>
            <span className="text-[10px] font-sans font-semibold text-slate-400 block">Quotation Sample</span>
            <span>{sampleQuotationNumber}</span>
          </div>
        </div>
      </div>

      {/* Prefixes & Numbering Settings */}
      <div className="space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Document Numbering & Format Setup
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Invoice Prefix *
            </label>
            <input
              type="text"
              {...register("invoicePrefix")}
              disabled={!canEdit}
              placeholder="INV"
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
            {errors.invoicePrefix && (
              <span className="text-[10px] text-rose-500 font-semibold mt-1 block">
                {errors.invoicePrefix.message}
              </span>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Quotation Prefix *
            </label>
            <input
              type="text"
              {...register("quotationPrefix")}
              disabled={!canEdit}
              placeholder="QTN"
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Receipt Prefix *
            </label>
            <input
              type="text"
              {...register("receiptPrefix")}
              disabled={!canEdit}
              placeholder="RCT"
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center justify-between p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">Include Year</span>
              <span className="text-[10px] text-slate-400">Embed YYYY ({year})</span>
            </div>
            <input
              type="checkbox"
              checked={includeYearInNumber}
              disabled={!canEdit}
              onChange={(e) => setValue("includeYearInNumber", e.target.checked, { shouldDirty: true })}
              className="w-4 h-4 text-[#F97316] rounded border-slate-300 focus:ring-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Number Separator
            </label>
            <select
              {...register("numberSeparator")}
              disabled={!canEdit}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            >
              <option value="-">Dash (-)</option>
              <option value="/">Slash (/)</option>
              <option value=".">Dot (.)</option>
              <option value="">None (None)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Starting Sequence Number *
            </label>
            <input
              type="number"
              {...register("startingNumber", { valueAsNumber: true })}
              disabled={!canEdit}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Zero Padding Digits
            </label>
            <select
              {...register("zeroPaddingLength", { valueAsNumber: true })}
              disabled={!canEdit}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            >
              <option value={4}>4 Digits (0001)</option>
              <option value={5}>5 Digits (00001)</option>
              <option value={6}>6 Digits (000001 - Default)</option>
              <option value={8}>8 Digits (00000001)</option>
            </select>
          </div>
        </div>
      </div>

      {/* Default Payment Terms & Due Policy */}
      <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Payment Terms & Due Policy
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Default Due Days *
            </label>
            <input
              type="number"
              {...register("defaultDueDays", { valueAsNumber: true })}
              disabled={!canEdit}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Default Payment Terms & Policy Notice
            </label>
            <textarea
              rows={2}
              {...register("defaultPaymentTerms")}
              disabled={!canEdit}
              className="w-full text-xs p-2.5 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-[#F97316]"
            />
          </div>
        </div>
      </div>
    </form>
  );
};
