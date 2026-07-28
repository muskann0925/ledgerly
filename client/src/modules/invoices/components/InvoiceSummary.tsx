import React from "react";
import { useFormContext } from "react-hook-form";
import type { InvoiceFormValues } from "../validation/invoice.schema";
import { Calculator, ArrowUpRight, ArrowDownRight, CheckCircle2 } from "lucide-react";
import type { ActiveTax } from "../../../shared/utils/taxCalculator";
import { calculateClientInvoiceTaxes } from "../../../shared/utils/taxCalculator";

interface InvoiceSummaryProps {
  currency?: string;
  availableTaxes?: ActiveTax[];
}

export const InvoiceSummary: React.FC<InvoiceSummaryProps> = ({
  currency = "INR",
  availableTaxes = [],
}) => {
  const { watch } = useFormContext<InvoiceFormValues>();
  const items = watch("items") || [];

  const calculation = calculateClientInvoiceTaxes(
    items.map((i) => ({
      description: i.description || "",
      quantity: Number(i.quantity) || 0,
      unitPrice: Number(i.unitPrice) || 0,
      taxIds: i.taxIds || [],
    })),
    availableTaxes
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(Math.round(val * 100) / 100);
  };

  const additiveBreakdown = calculation.taxBreakdown.filter((t) => t.calculationType === "ADD");
  const deductionBreakdown = calculation.taxBreakdown.filter((t) => t.calculationType === "DEDUCT");

  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4 shadow-xs">
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
              Invoice Summary & Tax Engine
            </h4>
            <p className="text-[11px] text-slate-400">Automatic real-time calculation</p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
          <CheckCircle2 className="w-3 h-3" /> Live Verified
        </span>
      </div>

      <div className="space-y-2.5 text-xs">
        {/* Subtotal */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span className="font-medium">Subtotal (Sum of items):</span>
          <span className="font-bold text-slate-900 dark:text-white">
            {formatCurrency(calculation.subtotal)}
          </span>
        </div>

        {/* Additive Taxes Breakdown */}
        {additiveBreakdown.length > 0 && (
          <div className="pl-3 border-l-2 border-emerald-500/40 space-y-1.5 py-1">
            {additiveBreakdown.map((tax) => (
              <div key={tax.taxId} className="flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400">
                <span className="flex items-center gap-1">
                  <ArrowUpRight className="w-3 h-3" /> {tax.taxName} ({tax.taxRate}%):
                </span>
                <span className="font-semibold">+ {formatCurrency(tax.totalAmount)}</span>
              </div>
            ))}
          </div>
        )}

        {/* Total Additive Tax */}
        <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
          <span className="font-medium">Total Additive Tax:</span>
          <span className="font-bold text-emerald-600 dark:text-emerald-400">
            + {formatCurrency(calculation.totalAdditiveTax)}
          </span>
        </div>

        {/* Grand Total */}
        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between font-bold text-slate-900 dark:text-white">
          <span>Grand Total:</span>
          <span className="text-slate-900 dark:text-white text-sm font-extrabold">
            {formatCurrency(calculation.grandTotal)}
          </span>
        </div>

        {/* Deduction Taxes Breakdown (e.g. TDS) */}
        {deductionBreakdown.length > 0 && (
          <div className="pl-3 border-l-2 border-rose-500/40 space-y-1.5 py-1">
            {deductionBreakdown.map((tax) => (
              <div key={tax.taxId} className="flex items-center justify-between text-[11px] text-rose-600 dark:text-rose-400">
                <span className="flex items-center gap-1">
                  <ArrowDownRight className="w-3 h-3" /> {tax.taxName} ({tax.taxRate}% Deduction):
                </span>
                <span className="font-semibold">- {formatCurrency(tax.totalAmount)}</span>
              </div>
            ))}
          </div>
        )}

        {calculation.totalDeductionTax > 0 && (
          <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
            <span className="font-medium">Total Deduction Tax (TDS):</span>
            <span className="font-bold text-rose-600 dark:text-rose-400">
              - {formatCurrency(calculation.totalDeductionTax)}
            </span>
          </div>
        )}

        {/* Net Payable */}
        <div className="pt-3 border-t-2 border-orange-500/20 flex items-center justify-between font-black text-base text-slate-900 dark:text-white">
          <span className="text-xs uppercase tracking-wide text-orange-600 dark:text-orange-400 font-extrabold">
            Net Payable:
          </span>
          <span className="text-orange-600 dark:text-orange-400 text-lg">
            {formatCurrency(calculation.netPayable)}
          </span>
        </div>
      </div>

      <p className="text-[10px] text-slate-400 dark:text-slate-500 italic text-right">
        * Deductions (TDS) reduce Net Payable without affecting Grand Total.
      </p>
    </div>
  );
};
