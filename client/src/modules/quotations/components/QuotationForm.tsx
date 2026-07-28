import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  quotationFormSchema,
  type QuotationFormValues,
} from "../validation/quotation.schema";
import type { Quotation } from "../types/quotation.types";
import { QuotationLineItems } from "./QuotationLineItems";
import { useClientsQuery } from "../../clients/hooks/useClients";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Loader2, Save, X, Calendar, Building2, Calculator } from "lucide-react";

interface QuotationFormProps {
  initialData?: Quotation | null;
  onSubmit: (values: QuotationFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const QuotationForm: React.FC<QuotationFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const { data: clientsData, isLoading: isLoadingClients } = useClientsQuery({
    limit: 100,
    isDeleted: false,
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const in30DaysStr = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const methods = useForm<QuotationFormValues>({
    resolver: zodResolver(quotationFormSchema) as any,
    defaultValues: {
      clientId: initialData?.clientId || "",
      issueDate: initialData?.issueDate
        ? new Date(initialData.issueDate).toISOString().split("T")[0]
        : todayStr,
      expiryDate: initialData?.expiryDate
        ? new Date(initialData.expiryDate).toISOString().split("T")[0]
        : in30DaysStr,
      currency: initialData?.currency || "INR",
      notes: initialData?.notes || "",
      terms: initialData?.terms || "",
      items: initialData?.items?.length
        ? initialData.items.map((item) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxRate: item.taxRate || 0,
            discount: item.discount || 0,
          }))
        : [
            {
              description: "",
              quantity: 1,
              unitPrice: 0,
              taxRate: 0,
              discount: 0,
            },
          ],
    },
  });

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = methods;

  const selectedClientId = watch("clientId");
  const currency = watch("currency");
  const watchedItems = watch("items") || [];

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        clientId: initialData.clientId,
        issueDate: new Date(initialData.issueDate).toISOString().split("T")[0],
        expiryDate: new Date(initialData.expiryDate).toISOString().split("T")[0],
        currency: initialData.currency || "INR",
        notes: initialData.notes || "",
        terms: initialData.terms || "",
        items: initialData.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate || 0,
          discount: item.discount || 0,
        })),
      });
    }
  }, [initialData, reset]);

  // Live Summary Calculations (never trust frontend math on server, but preview for UX)
  let subtotal = 0;
  let totalTax = 0;
  let totalDiscount = 0;

  watchedItems.forEach((item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    const taxRate = Number(item.taxRate) || 0;
    const discount = Number(item.discount) || 0;

    const itemSub = qty * price;
    const itemTax = itemSub * (taxRate / 100);

    subtotal += itemSub;
    totalTax += itemTax;
    totalDiscount += discount;
  });

  const grandTotal = Math.max(0, subtotal - totalDiscount + totalTax);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 select-none">
        {/* Header Metadata: Client, Currency & Dates */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4 shadow-xs">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-4 h-4 text-[#F97316]" />
            Proposal Header Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Client Select */}
            <div className="space-y-1 md:col-span-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Target Client <span className="text-rose-500">*</span>
              </label>
              <Select
                value={selectedClientId}
                onValueChange={(val) => setValue("clientId", val, { shouldValidate: true })}
                disabled={isLoadingClients}
              >
                <SelectTrigger className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Choose client"} />
                </SelectTrigger>
                <SelectContent>
                  {clientsData?.clients.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.companyName} ({c.contactPerson})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.clientId && (
                <p className="text-xs text-rose-500 font-medium">{errors.clientId.message}</p>
              )}
            </div>

            {/* Issue Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Issue Date
              </label>
              <Input
                type="date"
                {...register("issueDate")}
                className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800"
              />
              {errors.issueDate && (
                <p className="text-xs text-rose-500 font-medium">{errors.issueDate.message}</p>
              )}
            </div>

            {/* Expiry Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                Expiry Date <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                {...register("expiryDate")}
                className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 font-semibold"
              />
              {errors.expiryDate && (
                <p className="text-xs text-rose-500 font-medium">{errors.expiryDate.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Dynamic Line Items Section */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs">
          <QuotationLineItems currency={currency} />
        </div>

        {/* Summary Card & Scope Terms */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Notes & Terms (Left 2 cols) */}
          <div className="lg:col-span-2 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-3 shadow-xs">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Scope of Work / Notes
              </label>
              <textarea
                {...register("notes")}
                rows={2}
                placeholder="Detail proposal scope, milestones, or deliverables..."
                className="w-full text-xs p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Terms & Conditions
              </label>
              <textarea
                {...register("terms")}
                rows={2}
                placeholder="Payment terms, validity period (30 days), IP rights..."
                className="w-full text-xs p-3 rounded-xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F97316]"
              />
            </div>
          </div>

          {/* Live Calculations Summary Box (Right col) */}
          <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex flex-col justify-between space-y-3 shadow-xs">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-1.5 pb-2 border-b border-slate-200/80 dark:border-slate-800">
              <Calculator className="w-4 h-4 text-[#F97316]" />
              Proposal Summary Preview
            </h4>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Subtotal:</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formatCurrency(subtotal)}
                </span>
              </div>

              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-600 dark:text-emerald-400">
                  <span>Total Discount:</span>
                  <span className="font-semibold">-{formatCurrency(totalDiscount)}</span>
                </div>
              )}

              {totalTax > 0 && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400">
                  <span>GST / Tax Total:</span>
                  <span className="font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(totalTax)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex justify-between items-center font-bold">
                <span className="text-slate-900 dark:text-white text-xs">Grand Total:</span>
                <span className="text-lg font-black text-[#F97316]">
                  {formatCurrency(grandTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
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
            disabled={isLoading || (initialData ? !isDirty : false)}
            className="bg-[#F97316] hover:bg-orange-600 rounded-xl text-xs font-semibold px-6 shadow-sm shadow-orange-500/20 text-white disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                Saving Proposal...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                {initialData ? "Save Proposal Changes" : "Create Quotation Proposal"}
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
