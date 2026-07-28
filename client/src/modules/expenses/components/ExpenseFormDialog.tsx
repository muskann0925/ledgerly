import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  UploadCloud,
  FileText,
  Plus,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import { expenseFormSchema, type ExpenseFormValues } from "../validation/expenseSchema";
import type { Expense, ExpenseCategory, Vendor } from "../types/expense.types";

interface ExpenseFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (formData: FormData) => Promise<void>;
  expenseToEdit?: Expense | null;
  categories: ExpenseCategory[];
  vendors: Vendor[];
  isSubmitting?: boolean;
  onOpenCategoryModal?: () => void;
  onOpenVendorModal?: () => void;
}

export const ExpenseFormDialog: React.FC<ExpenseFormDialogProps> = ({
  isOpen,
  onClose,
  onSubmit,
  expenseToEdit,
  categories,
  vendors,
  isSubmitting = false,
  onOpenCategoryModal,
  onOpenVendorModal,
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [filePreviewUrl, setFilePreviewUrl] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);

  const defaultValues: ExpenseFormValues = {
    title: "",
    categoryId: categories[0]?.id || "",
    vendorId: "",
    amount: 0,
    taxRate: 0,
    isTaxInclusive: false,
    paymentMethod: "CASH",
    status: "PENDING",
    expenseDate: new Date().toISOString().slice(0, 10),
    dueDate: "",
    referenceNumber: "",
    notes: "",
  };

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ExpenseFormValues>({
    resolver: zodResolver(expenseFormSchema) as any,
    defaultValues,
  });

  const amount = watch("amount") || 0;
  const taxRate = watch("taxRate") || 0;
  const isTaxInclusive = watch("isTaxInclusive") || false;

  const calculateTotals = () => {
    const rate = Math.max(0, taxRate);
    const base = Math.max(0, amount);

    let taxAmount = 0;
    let totalAmount = base;

    if (rate > 0) {
      if (isTaxInclusive) {
        totalAmount = base;
        taxAmount = base - base / (1 + rate / 100);
      } else {
        taxAmount = base * (rate / 100);
        totalAmount = base + taxAmount;
      }
    }

    return {
      taxAmount: Math.round(taxAmount * 100) / 100,
      totalAmount: Math.round(totalAmount * 100) / 100,
    };
  };

  const totals = calculateTotals();

  useEffect(() => {
    if (expenseToEdit) {
      reset({
        title: expenseToEdit.title,
        categoryId: expenseToEdit.categoryId,
        vendorId: expenseToEdit.vendorId || "",
        amount: expenseToEdit.amount,
        taxRate: expenseToEdit.taxRate,
        isTaxInclusive: expenseToEdit.isTaxInclusive,
        paymentMethod: expenseToEdit.paymentMethod,
        status: expenseToEdit.status,
        expenseDate: new Date(expenseToEdit.expenseDate).toISOString().slice(0, 10),
        dueDate: expenseToEdit.dueDate
          ? new Date(expenseToEdit.dueDate).toISOString().slice(0, 10)
          : "",
        referenceNumber: expenseToEdit.referenceNumber || "",
        notes: expenseToEdit.notes || "",
      });
      if (expenseToEdit.receiptUrl) {
        setFilePreviewUrl(expenseToEdit.receiptUrl);
      }
    } else {
      reset(defaultValues);
      setSelectedFile(null);
      setFilePreviewUrl(null);
    }
  }, [expenseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      alert("Invalid file format. Only PDF, JPG, JPEG, and PNG files are allowed.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert("File size exceeds maximum limit of 10MB.");
      return;
    }
    setSelectedFile(file);

    if (file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setFilePreviewUrl(url);
    } else {
      setFilePreviewUrl(null);
    }
  };

  const handleFormSubmit = async (values: ExpenseFormValues) => {
    const formData = new FormData();
    Object.entries(values).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== "") {
        formData.append(key, String(val));
      }
    });

    if (selectedFile) {
      formData.append("receipt", selectedFile);
    }

    await onSubmit(formData);
  };

  const handleCloseDialog = () => {
    if (isDirty) {
      if (window.confirm("You have unsaved changes. Are you sure you want to close?")) {
        onClose();
      }
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              {expenseToEdit ? "Edit Expense" : "Record New Expense"}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Enter expense details, category, vendor, tax settings, and receipt file.
            </p>
          </div>
          <button
            onClick={handleCloseDialog}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body Form */}
        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Main Info Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Title */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expense Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. AWS Cloud Server Renewal July 2026"
                {...register("title")}
                className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
              {errors.title && (
                <span className="text-[11px] text-rose-500 mt-1 block">{errors.title.message}</span>
              )}
            </div>

            {/* Category Select */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Category <span className="text-rose-500">*</span>
                </label>
                {onOpenCategoryModal && (
                  <button
                    type="button"
                    onClick={onOpenCategoryModal}
                    className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> New
                  </button>
                )}
              </div>
              <select
                {...register("categoryId")}
                className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
              {errors.categoryId && (
                <span className="text-[11px] text-rose-500 mt-1 block">{errors.categoryId.message}</span>
              )}
            </div>

            {/* Vendor Select */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Vendor / Supplier
                </label>
                {onOpenVendorModal && (
                  <button
                    type="button"
                    onClick={onOpenVendorModal}
                    className="text-[11px] font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-0.5"
                  >
                    <Plus className="w-3 h-3" /> New
                  </button>
                )}
              </div>
              <select
                {...register("vendorId")}
                className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3.5 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <option value="">Direct Expense / No Vendor</option>
                {vendors.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Amount & Tax Calculation Box */}
          <div className="bg-slate-50/70 dark:bg-slate-900/50 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl p-4 space-y-4">
            <h3 className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-orange-500" />
              Amount & Tax Computation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {/* Base Amount */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Base Amount (INR) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  {...register("amount")}
                  className="w-full text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50 font-semibold"
                />
                {errors.amount && (
                  <span className="text-[11px] text-rose-500 mt-1 block">{errors.amount.message}</span>
                )}
              </div>

              {/* Tax Rate % */}
              <div>
                <label className="block text-xs font-medium text-slate-600 dark:text-slate-400 mb-1">
                  Tax Rate (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="e.g. 18"
                  {...register("taxRate")}
                  className="w-full text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                />
              </div>

              {/* Tax Type Toggle */}
              <div className="flex flex-col justify-end">
                <label className="flex items-center gap-2 cursor-pointer select-none text-xs font-medium text-slate-700 dark:text-slate-300 py-2.5">
                  <input
                    type="checkbox"
                    {...register("isTaxInclusive")}
                    className="rounded border-slate-300 text-orange-600 focus:ring-orange-500 w-4 h-4"
                  />
                  <span>Tax Inclusive</span>
                </label>
              </div>
            </div>

            {/* Calculated Breakdown Display */}
            <div className="flex items-center justify-between text-xs bg-white dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
              <span className="text-slate-500 dark:text-slate-400">
                Tax Amount: <strong className="text-slate-800 dark:text-slate-200">₹{totals.taxAmount.toFixed(2)}</strong>
              </span>
              <span className="text-slate-900 dark:text-white font-extrabold text-sm">
                Total Expense Amount: ₹{totals.totalAmount.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Dates & Payment Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            {/* Expense Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Expense Date <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                {...register("expenseDate")}
                className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Due Date
              </label>
              <input
                type="date"
                {...register("dueDate")}
                className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            {/* Payment Method */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Payment Method
              </label>
              <select
                {...register("paymentMethod")}
                className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <option value="CASH">Cash</option>
                <option value="UPI">UPI</option>
                <option value="BANK_TRANSFER">Bank Transfer</option>
                <option value="CREDIT_CARD">Credit Card</option>
                <option value="DEBIT_CARD">Debit Card</option>
                <option value="CHEQUE">Cheque</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Status
              </label>
              <select
                {...register("status")}
                className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              >
                <option value="PENDING">Pending</option>
                <option value="PAID">Paid</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Reference & Notes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Reference / Bill Number
              </label>
              <input
                type="text"
                placeholder="e.g. INV-99821 or TXN-44910"
                {...register("referenceNumber")}
                className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Notes / Purpose
              </label>
              <input
                type="text"
                placeholder="Brief justification or notes"
                {...register("notes")}
                className="w-full text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
            </div>
          </div>

          {/* Receipt Upload Section */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Attach Receipt (PDF, JPG, PNG - Max 10MB)
            </label>

            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={() => setDragActive(false)}
              onDrop={handleFileDrop}
              className={`border-2 border-dashed rounded-2xl p-4 text-center cursor-pointer transition-all ${
                dragActive
                  ? "border-orange-500 bg-orange-50/50 dark:bg-orange-950/20"
                  : "border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/40 dark:bg-slate-900/30"
              }`}
            >
              <input
                type="file"
                accept="application/pdf,image/jpeg,image/jpg,image/png"
                onChange={handleFileSelect}
                className="hidden"
                id="receipt-file-input"
              />

              {selectedFile || filePreviewUrl ? (
                <div className="flex flex-col items-center gap-2">
                  {filePreviewUrl ? (
                    <img
                      src={filePreviewUrl}
                      alt="Receipt Preview"
                      className="max-h-36 rounded-xl object-contain border border-slate-200 dark:border-slate-800"
                    />
                  ) : (
                    <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-semibold text-xs">
                      <FileText className="w-6 h-6 text-orange-500" />
                      <span>{selectedFile?.name || "Receipt Document attached"}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mt-1">
                    <label
                      htmlFor="receipt-file-input"
                      className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline cursor-pointer"
                    >
                      Replace File
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedFile(null);
                        setFilePreviewUrl(null);
                      }}
                      className="text-xs font-bold text-rose-500 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ) : (
                <label htmlFor="receipt-file-input" className="cursor-pointer block">
                  <UploadCloud className="w-8 h-8 text-slate-400 mx-auto mb-1" />
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 block">
                    Click to upload or drag & drop receipt file
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block mt-0.5">
                    Supports PDF, JPG, PNG (up to 10MB)
                  </span>
                </label>
              )}
            </div>
          </div>

          {/* Modal Actions Footer */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleCloseDialog}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[#F97316] text-white hover:bg-orange-600 disabled:opacity-50 transition-all shadow-sm shadow-orange-500/30 flex items-center gap-2"
            >
              {isSubmitting ? (
                <span>Saving Expense...</span>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{expenseToEdit ? "Update Expense" : "Save Expense"}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
