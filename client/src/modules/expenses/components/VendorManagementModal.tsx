import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  X,
  Edit2,
  Trash2,
  RotateCcw,
  Building2,
  Search,
  CheckCircle2,
  Mail,
  Phone,
} from "lucide-react";
import { vendorFormSchema, type VendorFormValues } from "../validation/expenseSchema";
import type { Vendor } from "../types/expense.types";
import {
  useVendors,
  useCreateVendor,
  useUpdateVendor,
  useDeleteVendor,
  useRestoreVendor,
} from "../hooks/useExpenses";

interface VendorManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  userRole?: string;
}

export const VendorManagementModal: React.FC<VendorManagementModalProps> = ({
  isOpen,
  onClose,
  userRole,
}) => {
  const [search, setSearch] = useState("");
  const [editingVendor, setEditingVendor] = useState<Vendor | null>(null);

  const { data, isLoading } = useVendors({ search, includeDeleted: true, limit: 50 });
  const createMutation = useCreateVendor();
  const updateMutation = useUpdateVendor();
  const deleteMutation = useDeleteVendor();
  const restoreMutation = useRestoreVendor();

  const canEdit = userRole === "OWNER" || userRole === "ADMIN" || userRole === "FINANCE";
  const canDelete = userRole === "OWNER" || userRole === "ADMIN";

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<VendorFormValues>({
    resolver: zodResolver(vendorFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      gstNumber: "",
      panNumber: "",
      notes: "",
    },
  });

  if (!isOpen) return null;

  const handleEditClick = (ven: Vendor) => {
    setEditingVendor(ven);
    reset({
      name: ven.name,
      email: ven.email || "",
      phone: ven.phone || "",
      address: ven.address || "",
      gstNumber: ven.gstNumber || "",
      panNumber: ven.panNumber || "",
      notes: ven.notes || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingVendor(null);
    reset({
      name: "",
      email: "",
      phone: "",
      address: "",
      gstNumber: "",
      panNumber: "",
      notes: "",
    });
  };

  const handleSaveVendor = async (values: VendorFormValues) => {
    if (editingVendor) {
      await updateMutation.mutateAsync({
        id: editingVendor.id,
        payload: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
    handleCancelEdit();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/40">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-orange-500" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white">
                Vendor & Supplier Directory
              </h2>
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Manage vendor profiles, tax identification, and contact info.
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

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Create / Edit Form */}
          {canEdit && (
            <form
              onSubmit={handleSubmit(handleSaveVendor)}
              className="bg-slate-50/70 dark:bg-slate-900/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 space-y-3"
            >
              <h3 className="text-xs font-bold text-slate-900 dark:text-white">
                {editingVendor ? "Edit Vendor Profile" : "Add New Vendor"}
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* Vendor Name */}
                <div className="sm:col-span-2 md:col-span-1">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Vendor Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. AWS Cloud Services"
                    {...register("name")}
                    className="w-full text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                  {errors.name && (
                    <span className="text-[11px] text-rose-500 mt-1 block">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="billing@vendor.com"
                    {...register("email")}
                    className="w-full text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    {...register("phone")}
                    className="w-full text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>

                {/* GSTIN */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    GSTIN / Tax ID
                  </label>
                  <input
                    type="text"
                    placeholder="27AAACA0000A1Z5"
                    {...register("gstNumber")}
                    className="w-full text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50 uppercase"
                  />
                </div>

                {/* Address */}
                <div className="sm:col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Billing Address
                  </label>
                  <input
                    type="text"
                    placeholder="Office or registered business address"
                    {...register("address")}
                    className="w-full text-xs rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                {editingVendor && (
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
                  {editingVendor ? "Update Vendor" : "Add Vendor"}
                </button>
              </div>
            </form>
          )}

          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search vendors by name, email, phone, GSTIN..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
          </div>

          {/* Vendor List */}
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center py-6 text-xs text-slate-400">Loading vendors...</div>
            ) : data?.data.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">No vendors found.</div>
            ) : (
              data?.data.map((ven) => (
                <div
                  key={ven.id}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-2xl border gap-2 transition-all ${
                    ven.isDeleted
                      ? "bg-rose-50/20 border-rose-200/50 dark:bg-rose-950/10 dark:border-rose-900/30 opacity-60"
                      : "bg-white dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800/80 hover:border-orange-500/30"
                  }`}
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-2">
                      {ven.name}
                      {ven.isDeleted && (
                        <span className="text-[10px] bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-400 px-1.5 py-0.5 rounded-full font-bold">
                          Deleted
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-1 flex-wrap">
                      {ven.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="w-3 h-3 text-slate-400" /> {ven.email}
                        </span>
                      )}
                      {ven.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="w-3 h-3 text-slate-400" /> {ven.phone}
                        </span>
                      )}
                      {ven.gstNumber && (
                        <span className="font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md text-[10px]">
                          GST: {ven.gstNumber}
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-semibold mt-1">
                      Expenses linked: {ven._count?.expenses || 0}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 justify-end shrink-0">
                    {canEdit && !ven.isDeleted && (
                      <button
                        type="button"
                        onClick={() => handleEditClick(ven)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canDelete && !ven.isDeleted && (
                      <button
                        type="button"
                        onClick={() => deleteMutation.mutate(ven.id)}
                        disabled={deleteMutation.isPending}
                        className="p-1.5 rounded-lg text-rose-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}

                    {canDelete && ven.isDeleted && (
                      <button
                        type="button"
                        onClick={() => restoreMutation.mutate(ven.id)}
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
