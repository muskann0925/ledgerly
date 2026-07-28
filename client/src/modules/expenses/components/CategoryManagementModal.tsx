import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Edit2,
  Trash2,
  RotateCcw,
  Tag,
  Search,
  CheckCircle2,
} from "lucide-react";
import { categoryFormSchema, type CategoryFormValues } from "../validation/expenseSchema";
import type { ExpenseCategory } from "../types/expense.types";
import {
  useExpenseCategories,
  useCreateCategory,
  useUpdateCategory,
  useDeleteCategory,
  useRestoreCategory,
} from "../hooks/useExpenses";

interface CategoryManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export const CategoryManagementModal: React.FC<CategoryManagementModalProps> = ({
  isOpen,
  onClose,
  userRole,
}) => {
  const [search, setSearch] = useState("");
  const [editingCategory, setEditingCategory] = useState<ExpenseCategory | null>(null);

  const { data, isLoading } = useExpenseCategories({ search, includeDeleted: true, limit: 50 });
  const createMutation = useCreateCategory();
  const updateMutation = useUpdateCategory();
  const deleteMutation = useDeleteCategory();
  const restoreMutation = useRestoreCategory();

  const canEdit = userRole === "OWNER" || userRole === "ADMIN" || userRole === "FINANCE";
  const canDelete = userRole === "OWNER" || userRole === "ADMIN";

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema) as any,
    defaultValues: {
      name: "",
      description: "",
      color: "#3B82F6",
    },
  });

  if (!isOpen) return null;

  const handleEditClick = (cat: ExpenseCategory) => {
    setEditingCategory(cat);
    reset({
      name: cat.name,
      description: cat.description || "",
      color: cat.color || "#3B82F6",
    });
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    reset({ name: "", description: "", color: "#3B82F6" });
  };

  const handleSaveCategory = async (values: CategoryFormValues) => {
    if (editingCategory) {
      await updateMutation.mutateAsync({
        id: editingCategory.id,
        payload: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
    handleCancelEdit();
  };

  const colorSwatches = [
    "#3B82F6",
    "#EF4444",
    "#8B5CF6",
    "#F59E0B",
    "#EC4899",
    "#10B981",
    "#6366F1",
    "#14B8A6",
    "#64748B",
    "#F97316",
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <Tag className="w-5 h-5 text-orange-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Expense Categories Management
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Organize expenses into custom categories and custom color codes.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form & List Container */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Create / Edit Form */}
          {canEdit && (
            <form
              onSubmit={handleSubmit(handleSaveCategory)}
              className="bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3"
            >
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                {editingCategory ? "Edit Category" : "Add New Category"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Category Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Server Infrastructure"
                    {...register("name")}
                    className="w-full text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                  {errors.name && (
                    <span className="text-[11px] text-rose-500 mt-1 block">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Description
                  </label>
                  <input
                    type="text"
                    placeholder="Brief description"
                    {...register("description")}
                    className="w-full text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>

              {/* Color Swatch Selection */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Color Tag Swatch
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {colorSwatches.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setValue("color", color)}
                      className="w-6 h-6 rounded-full border-2 border-white dark:border-slate-800 transition-transform hover:scale-110 shadow-xs"
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>

              {/* Form Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                {editingCategory && (
                  <button
                    type="button"
                    onClick={handleCancelEdit}
                    className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-4 py-1.5 rounded-xl text-xs font-semibold bg-[#F97316] text-white hover:bg-orange-600 transition-all flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {editingCategory ? "Update Category" : "Add Category"}
                </button>
              </div>
            </form>
          )}

          {/* Search Bar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search categories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          {/* Categories List */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-6 text-xs text-slate-400">Loading categories...</div>
            ) : data?.data.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No categories found.</div>
            ) : (
              data?.data.map((cat) => (
                <div
                  key={cat.id}
                  className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                    cat.isDeleted
                      ? "bg-rose-50/20 border-rose-200/50 dark:bg-rose-950/10 dark:border-rose-900/30 opacity-60"
                      : "bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800/80 hover:border-orange-500/30"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color || "#4F46E5" }}
                    />
                    <div>
                      <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                        {cat.name}
                        {cat.isDeleted && (
                          <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-bold">
                            Deleted
                          </span>
                        )}
                      </div>
                      {cat.description && (
                        <div className="text-[11px] text-slate-400 dark:text-slate-500">
                          {cat.description}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 font-semibold mt-0.5">
                        Expenses logged: {cat._count?.expenses || 0}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {canEdit && !cat.isDeleted && (
                      <button
                        type="button"
                        onClick={() => handleEditClick(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canDelete && !cat.isDeleted && (
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(cat.id)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        title={
                          (cat._count?.expenses || 0) > 0
                            ? "Category has active expenses"
                            : "Delete category"
                        }
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canDelete && cat.isDeleted && (
                      <button
                        type="button"
                        onClick={() => restoreMutation.mutate(cat.id)}
                        disabled={restoreMutation.isPending}
                        className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
