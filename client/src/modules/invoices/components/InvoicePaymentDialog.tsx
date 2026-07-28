import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  markPaidFormSchema,
  markPartialFormSchema,
  type MarkPaidFormValues,
  type MarkPartialFormValues,
} from "../validation/invoice.schema";
import type { Invoice } from "../types/invoice.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { DollarSign, CheckCircle2, Loader2 } from "lucide-react";

interface InvoicePaymentDialogProps {
  invoice: Invoice | null;
  mode: "FULL" | "PARTIAL" | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmFull: (id: string, values: MarkPaidFormValues) => Promise<void>;
  onConfirmPartial: (id: string, values: MarkPartialFormValues) => Promise<void>;
  isLoading?: boolean;
}

export const InvoicePaymentDialog: React.FC<InvoicePaymentDialogProps> = ({
  invoice,
  mode,
  isOpen,
  onClose,
  onConfirmFull,
  onConfirmPartial,
  isLoading = false,
}) => {
  const isFull = mode === "FULL";

  // Form for Full Payment
  const fullForm = useForm<MarkPaidFormValues>({
    resolver: zodResolver(markPaidFormSchema),
    defaultValues: {
      paymentMethod: "Razorpay",
      notes: "",
    },
  });

  // Form for Partial Payment
  const partialForm = useForm<MarkPartialFormValues>({
    resolver: zodResolver(markPartialFormSchema),
    defaultValues: {
      amount: invoice?.balanceDue || 0,
      paymentMethod: "Razorpay",
      notes: "",
    },
  });

  useEffect(() => {
    if (invoice && mode === "PARTIAL") {
      partialForm.reset({
        amount: invoice.balanceDue,
        paymentMethod: "Razorpay",
        notes: "",
      });
    }
  }, [invoice, mode, partialForm]);

  if (!invoice || !mode) return null;

  const formatCurrency = (val: number, currency: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleFullSubmit = (values: MarkPaidFormValues) => {
    return onConfirmFull(invoice.id, values);
  };

  const handlePartialSubmit = (values: MarkPartialFormValues) => {
    if (values.amount > invoice.balanceDue) {
      partialForm.setError("amount", {
        message: `Amount cannot exceed balance due (${formatCurrency(invoice.balanceDue, invoice.currency)})`,
      });
      return;
    }
    return onConfirmPartial(invoice.id, values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md p-6 rounded-2xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800">
        <DialogHeader className="space-y-2">
          <div
            className={`w-10 h-10 rounded-2xl border flex items-center justify-center mb-2 ${
              isFull
                ? "bg-emerald-50 dark:bg-emerald-950/50 border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400"
                : "bg-purple-50 dark:bg-purple-950/50 border-purple-200 dark:border-purple-900/50 text-purple-600 dark:text-purple-400"
            }`}
          >
            {isFull ? <CheckCircle2 className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
          </div>
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
            {isFull ? "Mark Invoice as Fully Paid" : "Record Partial Payment"}
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
            Invoice: <span className="font-semibold text-slate-700 dark:text-slate-200">{invoice.number}</span> · Balance Due:{" "}
            <span className="font-bold text-rose-600 dark:text-rose-400">
              {formatCurrency(invoice.balanceDue, invoice.currency)}
            </span>
          </DialogDescription>
        </DialogHeader>

        {isFull ? (
          <form onSubmit={fullForm.handleSubmit(handleFullSubmit)} className="space-y-4 pt-2 select-none">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs flex justify-between items-center">
              <span className="text-slate-600 dark:text-slate-400">Full Payment Amount:</span>
              <span className="font-black text-sm text-emerald-600 dark:text-emerald-400">
                {formatCurrency(invoice.balanceDue, invoice.currency)}
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Payment Method
              </label>
              <Select
                value={fullForm.watch("paymentMethod")}
                onValueChange={(val) => fullForm.setValue("paymentMethod", val)}
              >
                <SelectTrigger className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Razorpay">Razorpay Gateway</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Wire Transfer (NEFT/IMPS)</SelectItem>
                  <SelectItem value="UPI">UPI / GPay / PhonePe</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Payment Notes / Reference ID
              </label>
              <Input
                {...fullForm.register("notes")}
                placeholder="e.g. Transaction Ref #TXN-998823"
                className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-xl text-xs font-semibold px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold px-5 shadow-sm shadow-emerald-500/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 mr-1.5" />
                    Confirm Full Payment
                  </>
                )}
              </Button>
            </div>
          </form>
        ) : (
          <form onSubmit={partialForm.handleSubmit(handlePartialSubmit)} className="space-y-4 pt-2 select-none">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Payment Amount ({invoice.currency}) <span className="text-rose-500">*</span>
              </label>
              <Input
                type="number"
                step="any"
                min="0.01"
                max={invoice.balanceDue}
                {...partialForm.register("amount", { valueAsNumber: true })}
                className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 font-bold"
              />
              {partialForm.formState.errors.amount && (
                <p className="text-xs text-rose-500 font-medium">
                  {partialForm.formState.errors.amount.message}
                </p>
              )}
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Payment Method
              </label>
              <Select
                value={partialForm.watch("paymentMethod")}
                onValueChange={(val) => partialForm.setValue("paymentMethod", val)}
              >
                <SelectTrigger className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Razorpay">Razorpay Gateway</SelectItem>
                  <SelectItem value="Bank Transfer">Bank Wire Transfer (NEFT/IMPS)</SelectItem>
                  <SelectItem value="UPI">UPI / GPay / PhonePe</SelectItem>
                  <SelectItem value="Cash">Cash</SelectItem>
                  <SelectItem value="Cheque">Cheque</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Payment Notes / Reference ID
              </label>
              <Input
                {...partialForm.register("notes")}
                placeholder="e.g. Advance payment installment 1"
                className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onClose}
                disabled={isLoading}
                className="rounded-xl text-xs font-semibold px-4"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isLoading}
                className="bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-semibold px-5 shadow-sm shadow-purple-500/20"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                    Recording...
                  </>
                ) : (
                  <>
                    <DollarSign className="w-4 h-4 mr-1.5" />
                    Record Partial Payment
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
