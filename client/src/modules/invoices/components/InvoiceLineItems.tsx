import React, { useEffect, useState } from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { InvoiceFormValues } from "../validation/invoice.schema";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Plus, Trash2, Tag, Percent } from "lucide-react";
import { taxApi } from "../../taxes/api/taxApi";
import type { ActiveTax } from "../../../shared/utils/taxCalculator";
import { calculateClientInvoiceTaxes } from "../../../shared/utils/taxCalculator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";

interface InvoiceLineItemsProps {
  currency?: string;
  onTaxesLoaded?: (taxes: ActiveTax[]) => void;
}

export const InvoiceLineItems: React.FC<InvoiceLineItemsProps> = ({
  currency = "INR",
  onTaxesLoaded,
}) => {
  const {
    control,
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext<InvoiceFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const [availableTaxes, setAvailableTaxes] = useState<ActiveTax[]>([]);
  const [loadingTaxes, setLoadingTaxes] = useState<boolean>(true);

  useEffect(() => {
    let isMounted = true;
    taxApi
      .getActiveTaxes()
      .then((taxes) => {
        if (!isMounted) return;
        setAvailableTaxes(taxes);
        if (onTaxesLoaded) onTaxesLoaded(taxes);
      })
      .catch((err) => console.error("Failed to load active taxes", err))
      .finally(() => {
        if (isMounted) setLoadingTaxes(false);
      });
    return () => {
      isMounted = false;
    };
  }, [onTaxesLoaded]);

  const watchItems = watch("items") || [];
  const calculationResult = calculateClientInvoiceTaxes(
    watchItems.map((item) => ({
      description: item.description || "",
      quantity: Number(item.quantity) || 0,
      unitPrice: Number(item.unitPrice) || 0,
      taxIds: item.taxIds || [],
    })),
    availableTaxes
  );

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleToggleTaxOnItem = (itemIndex: number, taxId: string, isChecked: boolean) => {
    const currentTaxIds = watchItems[itemIndex]?.taxIds || [];
    let updated: string[];
    if (isChecked) {
      updated = Array.from(new Set([...currentTaxIds, taxId]));
    } else {
      updated = currentTaxIds.filter((id) => id !== taxId);
    }
    setValue(`items.${itemIndex}.taxIds`, updated, { shouldValidate: true, shouldDirty: true });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <Percent className="w-4 h-4 text-orange-500" />
            Invoice Line Items & Tax Selection
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Select taxes for each item directly from the central Tax module. Manual tax % editing is disabled.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          onClick={() =>
            append({
              description: "",
              quantity: 1,
              unitPrice: 0,
              taxIds: [],
              discount: 0,
            })
          }
          className="bg-orange-500 hover:bg-orange-600 rounded-xl text-xs font-semibold shadow-xs text-white"
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Line Item
        </Button>
      </div>

      {errors.items?.root && (
        <p className="text-xs text-rose-500 font-medium">
          {errors.items.root.message}
        </p>
      )}

      {fields.length === 0 ? (
        <div className="p-6 text-center rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            No line items added yet.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              append({
                description: "",
                quantity: 1,
                unitPrice: 0,
                taxIds: [],
                discount: 0,
              })
            }
            className="rounded-xl text-xs font-semibold"
          >
            Add First Item
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {fields.map((field, index) => {
            const itemError = errors.items?.[index];
            const calculatedItem = calculationResult.items[index];
            const currentSelectedTaxIds = watchItems[index]?.taxIds || [];

            const lineAmount = calculatedItem ? calculatedItem.lineAmount : 0;
            const appliedSnapshots = calculatedItem ? calculatedItem.appliedTaxes : [];

            const totalItemTaxAmount = appliedSnapshots.reduce((acc, t) => {
              return t.calculationType === "DEDUCT" ? acc - t.taxAmount : acc + t.taxAmount;
            }, 0);

            return (
              <div
                key={field.id}
                className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 space-y-3 transition-colors shadow-xs"
              >
                {/* Row 1: Description & Remove */}
                <div className="flex items-start gap-3">
                  <div className="flex-1 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Description <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      {...register(`items.${index}.description`)}
                      placeholder="e.g. Website Development / Professional Consulting Services"
                      className="h-9 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800"
                    />
                    {itemError?.description && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {itemError.description.message}
                      </p>
                    )}
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    disabled={fields.length === 1}
                    className="mt-6 h-9 w-9 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl shrink-0 disabled:opacity-30"
                    title="Remove Item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Row 2: Quantity, Unit Price, Tax Multi-Select Dropdown, Tax Amount, Line Total */}
                <div className="grid grid-cols-2 sm:grid-cols-12 gap-3 pt-1 items-end">
                  {/* Quantity (Col 2) */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Quantity <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="any"
                      min="0.01"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      className="h-9 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  {/* Unit Price (Col 3) */}
                  <div className="sm:col-span-3 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Unit Price ({currency}) <span className="text-rose-500">*</span>
                    </label>
                    <Input
                      type="number"
                      step="any"
                      min="0"
                      {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                      className="h-9 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800"
                    />
                  </div>

                  {/* Taxes Multi-Select Dropdown (Col 4) */}
                  <div className="sm:col-span-4 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                      <span>Applied Taxes</span>
                      <span className="text-[10px] text-orange-600 dark:text-orange-400 font-semibold">
                        Tax Module Rule
                      </span>
                    </label>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          className="h-9 w-full justify-between text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 px-3"
                        >
                          <span className="truncate">
                            {currentSelectedTaxIds.length === 0
                              ? "No Tax"
                              : availableTaxes
                                  .filter((t) => currentSelectedTaxIds.includes(t.id))
                                  .map((t) => `${t.code} (${t.rate}${t.valueType === "PERCENTAGE" ? "%" : ""})`)
                                  .join(", ")}
                          </span>
                          <Tag className="w-3.5 h-3.5 ml-1 text-slate-400 shrink-0" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-64 max-h-60 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-1 shadow-lg">
                        {loadingTaxes ? (
                          <div className="p-2 text-xs text-slate-400">Loading taxes...</div>
                        ) : availableTaxes.length === 0 ? (
                          <div className="p-2 text-xs text-slate-400">No active tax definitions found</div>
                        ) : (
                          availableTaxes.map((tax) => {
                            const isSelected = currentSelectedTaxIds.includes(tax.id);
                            return (
                              <DropdownMenuCheckboxItem
                                key={tax.id}
                                checked={isSelected}
                                onCheckedChange={(checked) => handleToggleTaxOnItem(index, tax.id, checked)}
                                className="text-xs rounded-lg cursor-pointer"
                              >
                                <div className="flex items-center justify-between w-full">
                                  <span className="font-semibold text-slate-900 dark:text-white">
                                    {tax.name} ({tax.code})
                                  </span>
                                  <span
                                    className={`ml-2 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                                      tax.calculationType === "DEDUCT"
                                        ? "bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400"
                                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400"
                                    }`}
                                  >
                                    {tax.rate}{tax.valueType === "PERCENTAGE" ? "%" : " fixed"} [{tax.calculationType}]
                                  </span>
                                </div>
                              </DropdownMenuCheckboxItem>
                            );
                          })
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {/* Calculated Tax Amount (Read-Only) (Col 1) */}
                  <div className="sm:col-span-1 space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400">
                      Tax Amt
                    </label>
                    <div
                      className={`h-9 px-2 rounded-xl flex items-center justify-center font-bold text-xs border ${
                        totalItemTaxAmount < 0
                          ? "bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-900/50"
                          : "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700"
                      }`}
                      title="Read-only calculated tax amount for line item"
                    >
                      {formatCurrency(totalItemTaxAmount)}
                    </div>
                  </div>

                  {/* Line Total (Col 2) */}
                  <div className="sm:col-span-2 space-y-1">
                    <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                      Line Total
                    </label>
                    <div className="h-9 px-3 rounded-xl bg-orange-50/50 dark:bg-orange-950/20 flex items-center justify-end font-bold text-xs text-orange-600 dark:text-orange-400 border border-orange-200/60 dark:border-orange-900/50">
                      {formatCurrency(lineAmount)}
                    </div>
                  </div>
                </div>

                {/* Applied Tax Badges display */}
                {appliedSnapshots.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[10px] text-slate-400 font-semibold">Active Rules:</span>
                    {appliedSnapshots.map((snap) => (
                      <span
                        key={snap.taxId}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${
                          snap.calculationType === "DEDUCT"
                            ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border-rose-200 dark:border-rose-900/50"
                            : "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-300 border-indigo-200 dark:border-indigo-900/50"
                        }`}
                      >
                        {snap.taxCode} ({snap.taxRate}{snap.type === "PERCENTAGE" ? "%" : ""}) = {formatCurrency(snap.taxAmount)} [{snap.calculationType}]
                      </span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
