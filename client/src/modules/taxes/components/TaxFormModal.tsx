import React, { useState, useEffect } from "react";
import { Loader2, Percent, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogFooter,
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
import type { Tax, CreateTaxInput, UpdateTaxInput, TaxType, TaxValueType, TaxCalculationType } from "../types/tax.types";

interface TaxFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  tax?: Tax | null;
  onSubmitCreate: (data: CreateTaxInput) => Promise<boolean>;
  onSubmitUpdate: (id: string, data: UpdateTaxInput) => Promise<boolean>;
}

const AVAILABLE_MODULES = [
  { id: "INVOICE", label: "Invoices" },
  { id: "QUOTATION", label: "Quotations" },
  { id: "EXPENSE", label: "Expenses" },
];

export const TaxFormModal: React.FC<TaxFormModalProps> = ({
  isOpen,
  onClose,
  tax,
  onSubmitCreate,
  onSubmitUpdate,
}) => {
  const isEditMode = !!tax;

  const [formData, setFormData] = useState<{
    name: string;
    code: string;
    type: TaxType;
    category: string;
    valueType: TaxValueType;
    calculationType: TaxCalculationType;
    rate: string;
    country: string;
    state: string;
    description: string;
    isDefault: boolean;
    isActive: boolean;
    applicableModules: string[];
  }>({
    name: "",
    code: "",
    type: "GST",
    category: "",
    valueType: "PERCENTAGE",
    calculationType: "ADD",
    rate: "",
    country: "India",
    state: "",
    description: "",
    isDefault: false,
    isActive: true,
    applicableModules: ["INVOICE", "QUOTATION", "EXPENSE"],
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  useEffect(() => {
    if (tax) {
      setFormData({
        name: tax.name || "",
        code: tax.code || "",
        type: tax.type || "GST",
        category: tax.category || "",
        valueType: tax.valueType || "PERCENTAGE",
        calculationType: tax.calculationType || (tax.type === "TDS" ? "DEDUCT" : "ADD"),
        rate: tax.rate ? String(tax.rate) : "0",
        country: tax.country || "India",
        state: tax.state || "",
        description: tax.description || "",
        isDefault: tax.isDefault || false,
        isActive: tax.isActive ?? true,
        applicableModules: tax.applicableModules ? tax.applicableModules.filter(m => m !== "CREDIT_NOTE") : ["INVOICE", "QUOTATION", "EXPENSE"],
      });
    } else {
      setFormData({
        name: "",
        code: "",
        type: "GST",
        category: "",
        valueType: "PERCENTAGE",
        calculationType: "ADD",
        rate: "",
        country: "India",
        state: "",
        description: "",
        isDefault: false,
        isActive: true,
        applicableModules: ["INVOICE", "QUOTATION", "EXPENSE"],
      });
    }
    setErrors({});
    setIsDirty(false);
    setShowUnsavedWarning(false);
  }, [tax, isOpen]);

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      const next = { ...prev, [field]: value };
      if (field === "type" && value === "TDS") {
        next.calculationType = "DEDUCT";
      }
      return next;
    });
    setIsDirty(true);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleModuleToggle = (moduleId: string) => {
    setFormData((prev) => {
      const exists = prev.applicableModules.includes(moduleId);
      const updated = exists
        ? prev.applicableModules.filter((m) => m !== moduleId)
        : [...prev.applicableModules, moduleId];
      return { ...prev, applicableModules: updated };
    });
    setIsDirty(true);
  };

  const validate = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Tax name is required";
    }

    if (!formData.code.trim()) {
      newErrors.code = "Tax code is required";
    }

    const numericRate = parseFloat(formData.rate);
    if (isNaN(numericRate) || numericRate < 0) {
      newErrors.rate = "Rate must be a positive number";
    } else if (formData.valueType === "PERCENTAGE" && numericRate > 100) {
      newErrors.rate = "Percentage rate cannot exceed 100%";
    }

    if (formData.applicableModules.length === 0) {
      newErrors.applicableModules = "Select at least one applicable module";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    const numericRate = parseFloat(formData.rate) || 0;

    if (isEditMode && tax) {
      await onSubmitUpdate(tax.id, {
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        category: formData.category ? formData.category.trim() : null,
        valueType: formData.valueType,
        calculationType: formData.calculationType,
        rate: numericRate,
        country: formData.country ? formData.country.trim() : "India",
        state: formData.state ? formData.state.trim() : null,
        description: formData.description.trim() || null,
        isDefault: formData.isDefault,
        isActive: formData.isActive,
        applicableModules: formData.applicableModules,
      });
    } else {
      await onSubmitCreate({
        name: formData.name.trim(),
        code: formData.code.trim().toUpperCase(),
        type: formData.type,
        category: formData.category ? formData.category.trim() : null,
        valueType: formData.valueType,
        calculationType: formData.calculationType,
        rate: numericRate,
        country: formData.country ? formData.country.trim() : "India",
        state: formData.state ? formData.state.trim() : null,
        description: formData.description.trim() || undefined,
        isDefault: formData.isDefault,
        applicableModules: formData.applicableModules,
      });
    }
    setIsSubmitting(false);
  };

  const handleModalClose = () => {
    if (isDirty) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
        <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden">
          <div className="p-6 pb-4 border-b border-slate-100 dark:border-slate-800 shrink-0 bg-white dark:bg-[#111827] flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white">
                {isEditMode ? "Edit Tax Definition" : "Create New Tax Definition"}
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Central tax rule definitions used automatically by invoices.
              </DialogDescription>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tax Name <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  placeholder="e.g. GST 18%, TDS 10%"
                  className="rounded-xl"
                />
                {errors.name && <p className="text-[11px] text-rose-500 mt-1">{errors.name}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tax Code <span className="text-rose-500">*</span>
                </label>
                <Input
                  value={formData.code}
                  onChange={(e) => handleChange("code", e.target.value)}
                  placeholder="e.g. GST18, TDS10"
                  className="rounded-xl uppercase font-mono text-xs"
                />
                {errors.code && <p className="text-[11px] text-rose-500 mt-1">{errors.code}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Tax Category / Type
                </label>
                <Select value={formData.type} onValueChange={(val) => handleChange("type", val as TaxType)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="GST">GST (Standard)</SelectItem>
                    <SelectItem value="CGST">CGST (Central)</SelectItem>
                    <SelectItem value="SGST">SGST (State)</SelectItem>
                    <SelectItem value="IGST">IGST (Integrated)</SelectItem>
                    <SelectItem value="TDS">TDS (Deduction)</SelectItem>
                    <SelectItem value="VAT">VAT (International)</SelectItem>
                    <SelectItem value="CUSTOM">Custom Tax</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Value Type
                </label>
                <Select value={formData.valueType} onValueChange={(val) => handleChange("valueType", val as TaxValueType)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select value type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PERCENTAGE">Percentage (%)</SelectItem>
                    <SelectItem value="FIXED">Fixed Amount</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Calculation Type <span className="text-rose-500">*</span>
                </label>
                <Select value={formData.calculationType} onValueChange={(val) => handleChange("calculationType", val as TaxCalculationType)}>
                  <SelectTrigger className="rounded-xl">
                    <SelectValue placeholder="Select calculation mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ADD">Additive (Increases total)</SelectItem>
                    <SelectItem value="DEDUCT">Deduction (e.g. TDS)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Rate / Value <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.rate}
                    onChange={(e) => handleChange("rate", e.target.value)}
                    placeholder="e.g. 18"
                    className="rounded-xl pr-8 font-semibold"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {formData.valueType === "PERCENTAGE" ? "%" : "₹"}
                  </span>
                </div>
                {errors.rate && <p className="text-[11px] text-rose-500 mt-1">{errors.rate}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Country
                </label>
                <Input
                  value={formData.country}
                  onChange={(e) => handleChange("country", e.target.value)}
                  placeholder="e.g. India"
                  className="rounded-xl"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  State (for Smart Suggestion)
                </label>
                <Input
                  value={formData.state}
                  onChange={(e) => handleChange("state", e.target.value)}
                  placeholder="e.g. Karnataka"
                  className="rounded-xl"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Description
              </label>
              <Input
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
                placeholder="Optional details or legal references"
                className="rounded-xl"
              />
            </div>

            <div className="pt-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                Applicable Modules
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {AVAILABLE_MODULES.map((mod) => {
                  const isChecked = formData.applicableModules.includes(mod.id);
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => handleModuleToggle(mod.id)}
                      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                        isChecked
                          ? "bg-orange-50 dark:bg-orange-950/40 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-900/50"
                          : "bg-slate-50 dark:bg-slate-800/40 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800"
                      }`}
                    >
                      <span>{mod.label}</span>
                      {isChecked && <Check className="w-3.5 h-3.5 text-orange-500" />}
                    </button>
                  );
                })}
              </div>
              {errors.applicableModules && (
                <p className="text-[11px] text-rose-500 mt-1">{errors.applicableModules}</p>
              )}
            </div>

            <DialogFooter className="pt-4 border-t border-slate-100 dark:border-slate-800 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleModalClose}
                disabled={isSubmitting}
                className="rounded-xl"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 shadow-md shadow-orange-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : isEditMode ? (
                  "Update Tax Definition"
                ) : (
                  "Create Tax Definition"
                )}
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
      </Dialog>

      {/* Unsaved warning dialog */}
      <Dialog open={showUnsavedWarning} onOpenChange={setShowUnsavedWarning}>
        <DialogContent className="sm:max-w-md bg-white dark:bg-slate-900 rounded-2xl p-6">
          <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
            Discard unsaved changes?
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            You have unsaved changes. Closing will discard them.
          </DialogDescription>
          <DialogFooter className="mt-4 gap-2">
            <Button variant="outline" onClick={() => setShowUnsavedWarning(false)} className="rounded-xl">
              Keep Editing
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setShowUnsavedWarning(false);
                onClose();
              }}
              className="rounded-xl"
            >
              Discard Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};
