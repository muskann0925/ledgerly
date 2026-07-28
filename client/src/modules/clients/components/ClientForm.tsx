import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { clientFormSchema, type ClientFormValues } from "../validation/client.schema";
import type { Client } from "../types/client.types";
import { Input } from "../../../components/ui/input";
import { Button } from "../../../components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Building, User, Mail, Phone, FileText, MapPin, Loader2 } from "lucide-react";

interface ClientFormProps {
  initialData?: Client | null;
  onSubmit: (data: ClientFormValues) => Promise<void> | void;
  onCancel: () => void;
  isLoading?: boolean;
}

export const ClientForm: React.FC<ClientFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  isLoading = false,
}) => {
  const isEditMode = !!initialData;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isDirty },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema) as any,
    defaultValues: {
      companyName: initialData?.companyName || "",
      clientType: initialData?.clientType || "BUSINESS",
      contactPerson: initialData?.contactPerson || "",
      email: initialData?.email || "",
      phone: initialData?.phone || "",
      gstNumber: initialData?.gstNumber || "",
      panNumber: initialData?.panNumber || "",
      billingAddress: initialData?.billingAddress || "",
      shippingAddress: initialData?.shippingAddress || "",
      status: initialData?.status || "ACTIVE",
      notes: initialData?.notes || "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        companyName: initialData.companyName || "",
        clientType: initialData.clientType || "BUSINESS",
        contactPerson: initialData.contactPerson || "",
        email: initialData.email || "",
        phone: initialData.phone || "",
        gstNumber: initialData.gstNumber || "",
        panNumber: initialData.panNumber || "",
        billingAddress: initialData.billingAddress || "",
        shippingAddress: initialData.shippingAddress || "",
        status: initialData.status || "ACTIVE",
        notes: initialData.notes || "",
      });
    }
  }, [initialData, reset]);

  const clientType = watch("clientType");
  const status = watch("status");

  return (
    <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4 text-xs">
      {/* Client Type & Status Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Client Type <span className="text-red-500">*</span>
          </label>
          <Select
            value={clientType}
            onValueChange={(val) => setValue("clientType", val as "BUSINESS" | "INDIVIDUAL", { shouldDirty: true })}
          >
            <SelectTrigger className="h-9 text-xs rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="Select type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="BUSINESS">Corporate / Business</SelectItem>
              <SelectItem value="INDIVIDUAL">Individual Client</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Account Status <span className="text-red-500">*</span>
          </label>
          <Select
            value={status}
            onValueChange={(val) => setValue("status", val as "ACTIVE" | "INACTIVE", { shouldDirty: true })}
          >
            <SelectTrigger className="h-9 text-xs rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border-slate-200 dark:border-slate-800">
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="INACTIVE">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Company Name & Contact Person Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Company / Organization <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              {...register("companyName")}
              placeholder="e.g. Acme Innovations Pvt Ltd"
              className="pl-9 h-9 text-xs rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border-slate-200 dark:border-slate-800"
            />
          </div>
          {errors.companyName && (
            <p className="text-[11px] text-red-500 font-medium mt-1">{errors.companyName.message}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Contact Person <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              {...register("contactPerson")}
              placeholder="e.g. Jane Doe"
              className="pl-9 h-9 text-xs rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border-slate-200 dark:border-slate-800"
            />
          </div>
          {errors.contactPerson && (
            <p className="text-[11px] text-red-500 font-medium mt-1">{errors.contactPerson.message}</p>
          )}
        </div>
      </div>

      {/* Email & Phone Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Email Address <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              {...register("email")}
              type="email"
              placeholder="billing@company.com"
              className="pl-9 h-9 text-xs rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border-slate-200 dark:border-slate-800"
            />
          </div>
          {errors.email && (
            <p className="text-[11px] text-red-500 font-medium mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Phone Number <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              {...register("phone")}
              placeholder="+919876543210"
              className="pl-9 h-9 text-xs rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border-slate-200 dark:border-slate-800"
            />
          </div>
          {errors.phone && (
            <p className="text-[11px] text-red-500 font-medium mt-1">{errors.phone.message}</p>
          )}
        </div>
      </div>

      {/* GST & PAN Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            GSTIN / Tax ID <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <Input
              {...register("gstNumber")}
              placeholder="27AAACG00001Z5"
              className="pl-9 h-9 text-xs uppercase rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border-slate-200 dark:border-slate-800"
            />
          </div>
          {errors.gstNumber && (
            <p className="text-[11px] text-red-500 font-medium mt-1">{errors.gstNumber.message}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            PAN Number <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <Input
            {...register("panNumber")}
            placeholder="ABCDE1234F"
            className="h-9 text-xs uppercase rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border-slate-200 dark:border-slate-800"
          />
          {errors.panNumber && (
            <p className="text-[11px] text-red-500 font-medium mt-1">{errors.panNumber.message}</p>
          )}
        </div>
      </div>

      {/* Billing & Shipping Address */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Billing Address <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <div className="relative">
            <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <textarea
              {...register("billingAddress")}
              rows={2}
              placeholder="Full registered billing address..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#F97316] outline-none"
            />
          </div>
          {errors.billingAddress && (
            <p className="text-[11px] text-red-500 font-medium mt-1">{errors.billingAddress.message}</p>
          )}
        </div>

        <div>
          <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
            Shipping Address <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            {...register("shippingAddress")}
            rows={2}
            placeholder="Delivery / shipping location address..."
            className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#F97316] outline-none"
          />
          {errors.shippingAddress && (
            <p className="text-[11px] text-red-500 font-medium mt-1">{errors.shippingAddress.message}</p>
          )}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
          Internal Notes <span className="text-slate-400 font-normal">(Optional)</span>
        </label>
        <textarea
          {...register("notes")}
          rows={2}
          placeholder="Special billing terms, payment preferences, or internal remarks..."
          className="w-full px-3 py-2 rounded-xl bg-[#F8FAFC] dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:ring-2 focus:ring-[#F97316] outline-none"
        />
        {errors.notes && (
          <p className="text-[11px] text-red-500 font-medium mt-1">{errors.notes.message}</p>
        )}
      </div>

      {/* Form Action Buttons */}
      <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100 dark:border-slate-800">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="rounded-xl text-xs"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading || (isEditMode && !isDirty)}
          className="bg-[#F97316] hover:bg-orange-600 rounded-xl font-semibold text-xs px-5 shadow-sm"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              {isEditMode ? "Saving Changes..." : "Creating Client..."}
            </>
          ) : isEditMode ? (
            "Save Changes"
          ) : (
            "Register Client"
          )}
        </Button>
      </div>
    </form>
  );
};
