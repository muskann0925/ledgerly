import React, { useEffect, useState, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  invoiceFormSchema,
  type InvoiceFormValues,
} from "../validation/invoice.schema";
import type { Invoice } from "../types/invoice.types";
import { useClientsQuery } from "../../clients/hooks/useClients";
import { InvoiceLineItems } from "./InvoiceLineItems";
import { InvoiceSummary } from "./InvoiceSummary";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Loader2, Save, X, Building2, Calendar, Sparkles } from "lucide-react";
import type { ActiveTax } from "../../../shared/utils/taxCalculator";
import { getSuggestedTaxes } from "../../../shared/utils/taxCalculator";
import { toast } from "sonner";

interface InvoiceFormProps {
  initialData?: Invoice | null;
  onSubmit: (values: InvoiceFormValues) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export const InvoiceForm: React.FC<InvoiceFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const [availableTaxes, setAvailableTaxes] = useState<ActiveTax[]>([]);

  // Fetch active clients for dropdown selector
  const { data: clientsData, isLoading: isLoadingClients } = useClientsQuery({
    limit: 100,
    isDeleted: false,
    status: "ACTIVE",
  });

  const todayStr = new Date().toISOString().split("T")[0];
  const defaultDueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const methods = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema) as any,
    defaultValues: {
      clientId: initialData?.clientId || "",
      issueDate: initialData?.issueDate
        ? new Date(initialData.issueDate).toISOString().split("T")[0]
        : todayStr,
      dueDate: initialData?.dueDate
        ? new Date(initialData.dueDate).toISOString().split("T")[0]
        : defaultDueDate,
      currency: initialData?.currency || "INR",
      notes: initialData?.notes || "",
      terms: initialData?.terms || "Payment is due within 14 days of issue.",
      items: initialData?.items?.length
        ? initialData.items.map((item) => ({
            id: item.id,
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            taxIds: item.taxIds || item.appliedTaxes?.map((t) => t.taxId) || [],
            discount: item.discount || 0,
          }))
        : [
            {
              description: "",
              quantity: 1,
              unitPrice: 0,
              taxIds: [],
              discount: 0,
            },
          ],
    },
  });

  const {
    handleSubmit,
    register,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = methods;

  const selectedClientId = watch("clientId");
  const selectedCurrency = watch("currency");
  const items = watch("items") || [];

  // Reset values when initialData changes
  useEffect(() => {
    if (initialData) {
      reset({
        clientId: initialData.clientId,
        issueDate: new Date(initialData.issueDate).toISOString().split("T")[0],
        dueDate: new Date(initialData.dueDate).toISOString().split("T")[0],
        currency: initialData.currency || "INR",
        notes: initialData.notes || "",
        terms: initialData.terms || "Payment is due within 14 days of issue.",
        items: initialData.items.map((item) => ({
          id: item.id,
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxIds: item.taxIds || item.appliedTaxes?.map((t) => t.taxId) || [],
          discount: item.discount || 0,
        })),
      });
    }
  }, [initialData, reset]);

  const selectedClient = clientsData?.clients.find((c) => c.id === selectedClientId);

  const handleApplySmartTaxSuggestions = useCallback(() => {
    if (!availableTaxes || availableTaxes.length === 0) {
      toast.error("No active tax definitions loaded from Tax module");
      return;
    }

    const companyState = "Karnataka"; // Default company state
    const clientState = selectedClient?.state || null;

    const suggested = getSuggestedTaxes(availableTaxes, companyState, clientState);
    const suggestedIds = suggested.map((t) => t.id);

    if (suggestedIds.length === 0) {
      toast.info("No matching tax suggestions found");
      return;
    }

    // Apply suggested tax IDs to all line items
    const updatedItems = items.map((item) => ({
      ...item,
      taxIds: suggestedIds,
    }));

    setValue("items", updatedItems, { shouldDirty: true, shouldValidate: true });
    toast.success(
      `Applied suggested taxes: ${suggested.map((t) => t.code).join(" + ")}`
    );
  }, [availableTaxes, selectedClient, items, setValue]);

  const handleFormSubmit = (values: InvoiceFormValues) => {
    return onSubmit(values);
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6 select-none">
        {/* Basic Information Grid */}
        <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-4 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-500" />
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white">
                Invoice Details & Client Selection
              </h3>
            </div>

            {selectedClient && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleApplySmartTaxSuggestions}
                className="rounded-xl text-xs font-semibold bg-orange-50 dark:bg-orange-950/40 text-orange-600 border-orange-200 dark:border-orange-900/50 hover:bg-orange-100"
              >
                <Sparkles className="w-3.5 h-3.5 mr-1 text-orange-500" />
                Suggest Taxes ({selectedClient.state || "Default"})
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Client Select */}
            <div className="space-y-1 md:col-span-2">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Client <span className="text-rose-500">*</span>
              </label>
              <Select
                value={selectedClientId}
                onValueChange={(val) => setValue("clientId", val, { shouldValidate: true })}
                disabled={isLoadingClients}
              >
                <SelectTrigger className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800">
                  <SelectValue placeholder={isLoadingClients ? "Loading clients..." : "Choose client profile"} />
                </SelectTrigger>
                <SelectContent>
                  {clientsData?.clients.map((c) => (
                    <SelectItem key={c.id} value={c.id} className="text-xs">
                      {c.companyName} ({c.contactPerson}) {c.state ? `[${c.state}]` : ""}
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
                Issue Date <span className="text-rose-500">*</span>
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

            {/* Due Date */}
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Due Date <span className="text-rose-500">*</span>
              </label>
              <Input
                type="date"
                {...register("dueDate")}
                className="h-10 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800"
              />
              {errors.dueDate && (
                <p className="text-xs text-rose-500 font-medium">{errors.dueDate.message}</p>
              )}
            </div>
          </div>
        </div>

        {/* Line Items Component */}
        <InvoiceLineItems
          currency={selectedCurrency}
          onTaxesLoaded={(loaded) => setAvailableTaxes(loaded)}
        />

        {/* Notes, Terms & Summary Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-3 shadow-xs">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Notes / Customer Message
                </label>
                <Input
                  {...register("notes")}
                  placeholder="Thank you for your business. Please remit payment via bank transfer or UPI."
                  className="mt-1 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Terms & Conditions
                </label>
                <Input
                  {...register("terms")}
                  placeholder="Payment due within 14 days. Late fee of 1.5% per month applies on overdue balances."
                  className="mt-1 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800"
                />
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <InvoiceSummary
              currency={selectedCurrency}
              availableTaxes={availableTaxes}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-800">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading}
            className="rounded-xl text-xs font-semibold px-5"
          >
            <X className="w-4 h-4 mr-1.5" />
            Cancel
          </Button>

          <Button
            type="submit"
            disabled={isLoading}
            className="rounded-xl text-xs font-semibold px-6 bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving Invoice...
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-1.5" />
                {initialData ? "Update Invoice" : "Create Invoice"}
              </>
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
