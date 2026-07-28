import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import type { QuotationFormValues } from "../validation/quotation.schema";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Plus, Trash2, Package } from "lucide-react";

interface QuotationLineItemsProps {
  currency?: string;
}

export const QuotationLineItems: React.FC<QuotationLineItemsProps> = ({ currency = "INR" }) => {
  const {
    register,
    control,
    watch,
    formState: { errors },
  } = useFormContext<QuotationFormValues>();

  const { fields, append, remove } = useFieldArray({
    control,
    name: "items",
  });

  const watchedItems = watch("items");

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency || "INR",
      maximumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div className="space-y-4 select-none">
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
          <Package className="w-4 h-4 text-[#F97316]" />
          Proposal Items & Deliverables ({fields.length})
        </h3>
        <Button
          type="button"
          size="sm"
          onClick={() =>
            append({
              description: "",
              quantity: 1,
              unitPrice: 0,
              taxRate: 0,
              discount: 0,
            })
          }
          className="bg-[#F97316]/10 text-[#F97316] hover:bg-[#F97316]/20 rounded-xl text-xs font-semibold h-8 px-3"
        >
          <Plus className="w-3.5 h-3.5 mr-1" />
          Add Item Row
        </Button>
      </div>

      {errors.items?.root && (
        <p className="text-xs text-rose-500 font-medium">{errors.items.root.message}</p>
      )}

      {/* Item Rows List */}
      <div className="space-y-3">
        {fields.map((field, index) => {
          const itemVal = watchedItems?.[index] || {
            quantity: 1,
            unitPrice: 0,
            taxRate: 0,
            discount: 0,
          };

          const qty = Number(itemVal.quantity) || 0;
          const price = Number(itemVal.unitPrice) || 0;
          const taxRate = Number(itemVal.taxRate) || 0;
          const discount = Number(itemVal.discount) || 0;

          const itemSubtotal = qty * price;
          const itemTax = itemSubtotal * (taxRate / 100);
          const itemTotal = Math.max(0, itemSubtotal - discount + itemTax);

          return (
            <div
              key={field.id}
              className="p-3.5 rounded-2xl bg-slate-50/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3 text-xs"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-extrabold text-[11px] text-slate-400">
                  Item #{index + 1}
                </span>

                {fields.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => remove(index)}
                    className="h-7 w-7 p-0 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>

              {/* Description */}
              <div className="space-y-1">
                <Input
                  {...register(`items.${index}.description`)}
                  placeholder="Service description / deliverable details (e.g. Mobile App UI UX Design)"
                  className="h-9 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800"
                />
                {errors.items?.[index]?.description && (
                  <p className="text-[11px] text-rose-500 font-medium">
                    {errors.items[index]?.description?.message}
                  </p>
                )}
              </div>

              {/* Quantity, Unit Price, Tax, Discount & Total Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 items-center">
                {/* Quantity */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Qty</label>
                  <Input
                    type="number"
                    step="any"
                    min="1"
                    {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                    className="h-9 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 font-semibold"
                  />
                  {errors.items?.[index]?.quantity && (
                    <p className="text-[10px] text-rose-500">
                      {errors.items[index]?.quantity?.message}
                    </p>
                  )}
                </div>

                {/* Unit Price */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Rate ({currency})</label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                    className="h-9 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 font-semibold"
                  />
                  {errors.items?.[index]?.unitPrice && (
                    <p className="text-[10px] text-rose-500">
                      {errors.items[index]?.unitPrice?.message}
                    </p>
                  )}
                </div>

                {/* Tax % */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">GST Rate %</label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    {...register(`items.${index}.taxRate`, { valueAsNumber: true })}
                    className="h-9 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800"
                  />
                </div>

                {/* Discount */}
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500">Disc. ({currency})</label>
                  <Input
                    type="number"
                    step="any"
                    min="0"
                    {...register(`items.${index}.discount`, { valueAsNumber: true })}
                    className="h-9 text-xs rounded-xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800"
                  />
                </div>

                {/* Row Total Preview */}
                <div className="space-y-1 col-span-2 sm:col-span-1 text-right sm:text-right">
                  <span className="text-[11px] font-bold text-slate-500 block">Row Total</span>
                  <span className="font-extrabold text-[#F97316] text-xs leading-9 block">
                    {formatCurrency(itemTotal)}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
