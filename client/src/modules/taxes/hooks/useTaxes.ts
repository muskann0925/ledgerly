import { useState, useCallback, useEffect } from "react";
import { toast } from "sonner";
import { taxApi } from "../api/taxApi";
import type {
  Tax,
  CreateTaxInput,
  UpdateTaxInput,
  TaxQueryFilters,
  PaginationMeta,
} from "../types/tax.types";

export const useTaxes = () => {
  const [taxes, setTaxes] = useState<Tax[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: false,
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [filters, setFilters] = useState<TaxQueryFilters>({
    page: 1,
    limit: 10,
    search: "",
    type: undefined,
    isActive: undefined,
    module: undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  // Bulk Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);
  const [selectedTax, setSelectedTax] = useState<Tax | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<boolean>(false);
  const [taxToDelete, setTaxToDelete] = useState<Tax | null>(null);
  const [isBulkDelete, setIsBulkDelete] = useState<boolean>(false);

  const fetchTaxes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await taxApi.getTaxes(filters);
      setTaxes(data.taxes);
      setPagination({
        ...data.pagination,
        hasNextPage: data.pagination.page < data.pagination.totalPages,
        hasPrevPage: data.pagination.page > 1,
      });
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to load tax rates";
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchTaxes();
  }, [fetchTaxes]);

  const handleFilterChange = (newFilters: Partial<TaxQueryFilters>) => {
    setFilters((prev) => ({
      ...prev,
      ...newFilters,
      page: newFilters.page !== undefined ? newFilters.page : 1, // Reset page on filter change
    }));
    setSelectedIds([]);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(taxes.map((t) => t.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds((prev) => [...prev, id]);
    } else {
      setSelectedIds((prev) => prev.filter((i) => i !== id));
    }
  };

  const handleCreateTax = async (data: CreateTaxInput) => {
    try {
      const created = await taxApi.createTax(data);
      toast.success(`Tax rate '${created.name}' (${created.code}) created successfully`);
      setIsFormOpen(false);
      fetchTaxes();
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to create tax rate");
      return false;
    }
  };

  const handleUpdateTax = async (id: string, data: UpdateTaxInput) => {
    try {
      const updated = await taxApi.updateTax(id, data);
      toast.success(`Tax rate '${updated.name}' updated successfully`);
      setIsFormOpen(false);
      setSelectedTax(null);
      fetchTaxes();
      return true;
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update tax rate");
      return false;
    }
  };

  const handleToggleStatus = async (tax: Tax, newStatus: boolean) => {
    try {
      // Optimistic update
      setTaxes((prev) =>
        prev.map((t) => (t.id === tax.id ? { ...t, isActive: newStatus } : t))
      );

      await taxApi.toggleTaxStatus(tax.id, newStatus);
      toast.success(`Tax '${tax.code}' set to ${newStatus ? "ACTIVE" : "INACTIVE"}`);
      fetchTaxes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to update status");
      fetchTaxes(); // Revert
    }
  };

  const handleDeleteTax = async (tax: Tax) => {
    try {
      await taxApi.softDeleteTax(tax.id);
      toast.success(`Tax '${tax.name}' soft deleted`);
      setIsDeleteOpen(false);
      setTaxToDelete(null);
      setSelectedIds((prev) => prev.filter((id) => id !== tax.id));
      fetchTaxes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to delete tax rate");
    }
  };

  const handleBulkToggleStatus = async (isActive: boolean) => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map((id) => taxApi.toggleTaxStatus(id, isActive)));
      toast.success(`${selectedIds.length} tax rates updated to ${isActive ? "ACTIVE" : "INACTIVE"}`);
      setSelectedIds([]);
      fetchTaxes();
    } catch (err: any) {
      toast.error("Failed to update status for selected taxes");
      fetchTaxes();
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    try {
      await Promise.all(selectedIds.map((id) => taxApi.softDeleteTax(id)));
      toast.success(`${selectedIds.length} tax rates deleted successfully`);
      setSelectedIds([]);
      setIsDeleteOpen(false);
      setIsBulkDelete(false);
      fetchTaxes();
    } catch (err: any) {
      toast.error("Failed to delete selected taxes");
    }
  };

  const handleSetDefaultTax = async (tax: Tax) => {
    try {
      await taxApi.updateTax(tax.id, { isDefault: true });
      toast.success(`Tax '${tax.name}' (${tax.rate}%) set as System Default`);
      fetchTaxes();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Failed to set default tax");
    }
  };

  return {
    taxes,
    pagination,
    isLoading,
    error,
    filters,
    selectedIds,
    isFormOpen,
    selectedTax,
    isDetailsOpen,
    isDeleteOpen,
    taxToDelete,
    isBulkDelete,
    setIsFormOpen,
    setSelectedTax,
    setIsDetailsOpen,
    setIsDeleteOpen,
    setTaxToDelete,
    setIsBulkDelete,
    fetchTaxes,
    handleFilterChange,
    handleSelectAll,
    handleSelectOne,
    handleCreateTax,
    handleUpdateTax,
    handleToggleStatus,
    handleSetDefaultTax,
    handleDeleteTax,
    handleBulkToggleStatus,
    handleBulkDelete,
  };
};
