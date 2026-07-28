import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  paymentFormSchema,
  type PaymentFormValues,
} from "../validation/payment.schema";
import type { Payment } from "../types/payment.types";
import { useInvoicesQuery } from "../../invoices/hooks/useInvoices";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Loader2, Save, X, FileText, Calendar, DollarSign, Building2, AlertTriangle } from "lucide-react";
import { InvoiceStatusBadge } from "../../invoices/components/InvoiceStatusBadge";

interface PaymentFormProps {
  initialData?: Payment | null;
  onSubmit: (values: PaymentFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  // Fetch invoices for dropdown
  const { data: invoicesData, isLoading: isLoadingInvoices } = useInvoicesQuery({
    limit: 100,
    isDeleted: false,
  });

  const todayStr = new Date().toISOString().split("T")[0];

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    setError,
    formState: { errors, isDirty },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      invoiceId: initialData?.invoiceId || "",
      amount: initialData?.amount || 0,
      paymentDate: initialData?.paymentDate
        ? new Date(initialData.paymentDate).toISOString().split("T")[0]
        : todayStr,
      paymentMethod: initialData?.paymentMethod || "CASH",
      referenceNumber: initialData?.referenceNumber || "",
      notes: initialData?.notes || "",
    },
  });

  const selectedInvoiceId = watch("invoiceId");
  const selectedMethod = watch("paymentMethod");

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        invoiceId: initialData.invoiceId,
        amount: initialData.amount,
        paymentDate: new Date(initialData.paymentDate).toISOString().split("T")[0],
        paymentMethod: initialData.paymentMethod || "CASH",
        referenceNumber: initialData.referenceNumber || "",
        notes: initialData.notes || "",
      });
    }
  }, [initialData, reset]);

  // Find selected invoice object
  const selectedInvoice = invoicesData?.invoices.find(
    (inv) => inv.id === selectedClientIdOrInvoiceId(selectedInvoiceId)
  );

  function selectedClientIdOrInvoiceId(id: string) {
    return id;
  }

  // Pre-fill amount with balance due when invoice is selected in create mode
  useEffect(() => {
    if (!initialData && selectedInvoice) {
      if (selectedInvoice.balanceDue > 0) {
        setValue("amount", selectedInvoice.balanceDue, { shouldValidate: true });
      }
    }
  }, [selectedInvoice, initialData, setValue]);

  const isCancelledOrRefunded =
    selectedInvoice?.status === "CANCELLED" || selectedInvoice?.status === "REFUNDED";
  const isFullyPaidWithoutEdit =
    !initialData && selectedInvoice && (selectedInvoice.status === "PAID" || selectedInvoice.balanceDue <= 0);

  const isSubmitDisabled =
    isLoading ||
    isCancelledOrRefunded ||
    isFullyPaidWithoutEdit ||
    (initialData ? !isDirty : false);

  const formatCurrency = (val?: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  const handleFormSubmit = async (values: PaymentFormValues) => {
    if (selectedInvoice) {
      const remainingLimit = initialData
        ? selectedInvoice.balanceDue + initialData.amount
        : selectedInvoice.balanceDue;

      if (values.amount > remainingLimit) {
        setError("amount", {
          message: `Amount cannot exceed remaining balance (${formatCurrency(remainingLimit, selectedInvoice.currency)})`,
        });
        return;
      }
    }

    await onSubmit(values);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 select-none">
      {/* Invoice Select & Details Card */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4 shadow-xs">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <FileText className="w-4 h-4 text-[#F97316]" />
          Target Invoice Selection
        </h3>

        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Select Invoice <span className="text-rose-500">*</span>
          </label>
          <Select
            value={selectedInvoiceId}
            onValueChange={(val) => setValue("invoiceId", val, { shouldValidate: true })}
            disabled={isLoadingInvoices || !!initialData}
          >
            <SelectTrigger className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800">
              <SelectValue placeholder={isLoadingInvoices ? "Loading invoices..." : "Choose target invoice"} />
            </SelectTrigger>
            <SelectContent>
              {invoicesData?.invoices.map((inv) => (
                <SelectItem key={inv.id} value={inv.id} className="text-xs">
                  {inv.number} - {inv.client?.companyName} ({formatCurrency(inv.balanceDue, inv.currency)} due)
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.invoiceId && (
            <p className="text-xs text-rose-500 font-medium">{errors.invoiceId.message}</p>
          )}
        </div>

        {/* Selected Invoice Overview Card */}
        {selectedInvoice && (
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {selectedInvoice.client?.companyName}
              </span>
              <InvoiceStatusBadge status={selectedInvoice.status as any} />
            </div>

            <div className="grid grid-cols-3 gap-2 pt-1 border-t border-slate-200/60 dark:border-slate-800/60 text-[11px]">
              <div>
                <span className="text-slate-500 block">Total Amount:</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {formatCurrency(selectedInvoice.total, selectedInvoice.currency)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Amount Paid:</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  {formatCurrency(selectedInvoice.amountPaid, selectedInvoice.currency)}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Balance Due:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">
                  {formatCurrency(selectedInvoice.balanceDue, selectedInvoice.currency)}
                </span>
              </div>
            </div>

            {isCancelledOrRefunded && (
              <div className="p-2 rounded-lg bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 text-[11px] flex items-center gap-1.5 font-medium">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 text-rose-500" />
                Payments cannot be recorded for {selectedInvoice.status.toLowerCase()} invoices.
              </div>
            )}

            {isFullyPaidWithoutEdit && (
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 text-[11px] flex items-center gap-1.5 font-medium">
                This invoice is already fully paid.
              </div>
            )}
          </div>
        )}
      </div>

      {/* Payment Details Input Grid */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4 shadow-xs">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
          <DollarSign className="w-4 h-4 text-[#F97316]" />
          Payment Information
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Amount */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Payment Amount ({selectedInvoice?.currency || "INR"}) <span className="text-rose-500">*</span>
            </label>
            <Input
              type="number"
              step="any"
              min="0.01"
              {...register("amount", { valueAsNumber: true })}
              className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 font-bold"
            />
            {errors.amount && (
              <p className="text-xs text-rose-500 font-medium">{errors.amount.message}</p>
            )}
          </div>

          {/* Payment Date */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              Payment Date <span className="text-rose-500">*</span>
            </label>
            <Input
              type="date"
              {...register("paymentDate")}
              className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800"
            />
            {errors.paymentDate && (
              <p className="text-xs text-rose-500 font-medium">{errors.paymentDate.message}</p>
            )}
          </div>

          {/* Payment Method */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Payment Method <span className="text-rose-500">*</span>
            </label>
            <Select
              value={selectedMethod}
              onValueChange={(val) => setValue("paymentMethod", val as any, { shouldValidate: true })}
            >
              <SelectTrigger className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CASH">Cash</SelectItem>
                <SelectItem value="UPI">UPI / GPay / PhonePe</SelectItem>
                <SelectItem value="BANK_TRANSFER">Bank Wire Transfer (NEFT/IMPS)</SelectItem>
                <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                <SelectItem value="DEBIT_CARD">Debit Card</SelectItem>
                <SelectItem value="CHEQUE">Cheque</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.paymentMethod && (
              <p className="text-xs text-rose-500 font-medium">{errors.paymentMethod.message}</p>
            )}
          </div>
        </div>

        {/* Reference Number */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Transaction Reference ID / Cheque No. (Optional)
          </label>
          <Input
            {...register("referenceNumber")}
            placeholder="e.g. TXN-99884422 or CHQ-001923"
            className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 font-mono"
          />
          {errors.referenceNumber && (
            <p className="text-xs text-rose-500 font-medium">{errors.referenceNumber.message}</p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1">
          <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
            Payment Remarks / Internal Notes (Optional)
          </label>
          <textarea
            {...register("notes")}
            rows={2}
            placeholder="e.g. Received partial installment 1 via HDFC Bank wire transfer."
            className="w-full text-xs p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
          />
          {errors.notes && (
            <p className="text-xs text-rose-500 font-medium">{errors.notes.message}</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-xl text-xs font-semibold px-4"
        >
          <X className="w-4 h-4 mr-1.5" />
          Cancel
        </Button>

        <Button
          type="submit"
          disabled={isSubmitDisabled}
          className="bg-[#F97316] hover:bg-orange-600 rounded-xl text-xs font-semibold px-6 shadow-sm shadow-orange-500/20 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
              Saving Payment...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-1.5" />
              {initialData ? "Save Changes" : "Record Payment"}
            </>
          )}
        </Button>
      </div>
    </form>
  );
};
