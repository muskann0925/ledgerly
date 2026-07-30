import React, { useState } from "react";
import {
  Percent,
  Plus,
  Search,
  RefreshCw,
  ShieldCheck,
  CheckCircle2,
  Layers,
  Trash2,
  Power,
  XCircle,
} from "lucide-react";
import { Sidebar } from "../../../components/layout/Sidebar";
import { Header } from "../../../components/layout/Header";
import { CreateInvoiceModal } from "../../../components/modals/CreateInvoiceModal";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../../components/ui/select";
import { Card, CardContent } from "../../../components/ui/card";
import { useTaxes } from "../hooks/useTaxes";
import { TaxTable } from "../components/TaxTable";
import { TaxFormModal } from "../components/TaxFormModal";
import { TaxDetailsModal } from "../components/TaxDetailsModal";
import { TaxDeleteDialog } from "../components/TaxDeleteDialog";
import type { TaxType } from "../types/tax.types";
import { usePermission } from "../../../hooks/usePermission";

export const TaxesPage: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const permission = usePermission();

  const {
    taxes,
    pagination,
    isLoading,
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
  } = useTaxes();

  // Summary Metrics
  const totalTaxSlabs = pagination.total || taxes.length;
  const activeSlabs = taxes.filter((t) => t.isActive).length;
  const defaultTax = taxes.find((t) => t.isDefault);
  const gstTaxCount = taxes.filter((t) =>
    ["GST", "CGST", "SGST", "IGST"].includes(t.type)
  ).length;

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-[#111827] dark:text-[#F9FAFB] flex transition-colors duration-200">
      {/* Navigation Sidebar */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Layout Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenCreateInvoice={() => setIsInvoiceModalOpen(true)}
          onRefresh={fetchTaxes}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 text-[#F97316] flex items-center justify-center shrink-0">
                <Percent className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Taxes & Statutory Slabs
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate max-w-xl">
                  Centralized tax management system for GST, TDS, VAT, and custom statutory rules.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchTaxes}
                className="h-9 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
                title="Refresh Tax List"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400 ${isLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
              {permission.can("taxes", "create") && (
                <Button
                  onClick={() => {
                    setSelectedTax(null);
                    setIsFormOpen(true);
                  }}
                  className="h-9 px-4 text-xs font-semibold bg-[#F97316] hover:bg-orange-600 text-white rounded-xl shadow-sm shadow-orange-500/20 shrink-0"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>Configure Tax Rate</span>
                </Button>
              )}
            </div>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827] shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Total Tax Slabs
                  </p>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {totalTaxSlabs}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/30 text-[#F97316] flex items-center justify-center">
                  <Percent className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827] shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Active Slabs
                  </p>
                  <h3 className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">
                    {activeSlabs}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827] shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    Default System Tax
                  </p>
                  {defaultTax ? (
                    <h3 className="text-base font-bold text-indigo-600 dark:text-indigo-400 mt-1 truncate max-w-[150px]" title={`${defaultTax.name} (${defaultTax.rate}%)`}>
                      {defaultTax.name} ({defaultTax.rate}%)
                    </h3>
                  ) : (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs font-semibold text-slate-400">None Set</span>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedTax(null);
                          setIsFormOpen(true);
                        }}
                        className="text-[11px] font-extrabold text-[#F97316] hover:underline"
                      >
                        + Set Default
                      </button>
                    </div>
                  )}
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 flex items-center justify-center">
                  <ShieldCheck className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl border-slate-200/80 dark:border-slate-800/80 bg-white dark:bg-[#111827] shadow-xs">
              <CardContent className="p-4 flex items-center justify-between">
                <div>
                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                    GST / CGST Slabs
                  </p>
                  <h3 className="text-xl font-black text-slate-900 dark:text-white mt-1">
                    {gstTaxCount}
                  </h3>
                </div>
                <div className="w-10 h-10 rounded-xl bg-sky-50 dark:bg-sky-950/30 text-sky-500 flex items-center justify-center">
                  <Layers className="w-5 h-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white dark:bg-[#111827] p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-xs">
            <div className="flex flex-1 flex-col sm:flex-row items-center gap-3">
              {/* Search Box */}
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search tax name, code..."
                  value={filters.search || ""}
                  onChange={(e) => handleFilterChange({ search: e.target.value })}
                  className="pl-9 h-9 text-xs rounded-xl bg-slate-50/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800"
                />
              </div>

              {/* Tax Type Filter */}
              <Select
                value={filters.type || "ALL"}
                onValueChange={(val) =>
                  handleFilterChange({ type: val === "ALL" ? undefined : (val as TaxType) })
                }
              >
                <SelectTrigger className="h-9 w-full sm:w-36 text-xs rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Types</SelectItem>
                  <SelectItem value="GST">GST</SelectItem>
                  <SelectItem value="CGST">CGST</SelectItem>
                  <SelectItem value="SGST">SGST</SelectItem>
                  <SelectItem value="IGST">IGST</SelectItem>
                  <SelectItem value="TDS">TDS</SelectItem>
                  <SelectItem value="VAT">VAT</SelectItem>
                  <SelectItem value="CUSTOM">CUSTOM</SelectItem>
                </SelectContent>
              </Select>

              {/* Status Filter */}
              <Select
                value={
                  filters.isActive === true
                    ? "ACTIVE"
                    : filters.isActive === false
                    ? "INACTIVE"
                    : "ALL"
                }
                onValueChange={(val) =>
                  handleFilterChange({
                    isActive: val === "ACTIVE" ? true : val === "INACTIVE" ? false : undefined,
                  })
                }
              >
                <SelectTrigger className="h-9 w-full sm:w-36 text-xs rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Status</SelectItem>
                  <SelectItem value="ACTIVE">Active Only</SelectItem>
                  <SelectItem value="INACTIVE">Inactive Only</SelectItem>
                </SelectContent>
              </Select>

              {/* Module Filter */}
              <Select
                value={filters.module || "ALL"}
                onValueChange={(val) =>
                  handleFilterChange({ module: val === "ALL" ? undefined : val })
                }
              >
                <SelectTrigger className="h-9 w-full sm:w-40 text-xs rounded-xl bg-slate-50/50 dark:bg-slate-900/50">
                  <SelectValue placeholder="All Modules" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">All Modules</SelectItem>
                  <SelectItem value="INVOICE">Invoices</SelectItem>
                  <SelectItem value="QUOTATION">Quotations</SelectItem>
                  <SelectItem value="EXPENSE">Expenses</SelectItem>
                  <SelectItem value="CREDIT_NOTE">Credit Notes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Clear Filters Button */}
            {(filters.search || filters.type || filters.isActive !== undefined || filters.module) && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() =>
                  handleFilterChange({
                    search: "",
                    type: undefined,
                    isActive: undefined,
                    module: undefined,
                  })
                }
                className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Bulk Operations Toolbar */}
          {selectedIds.length > 0 && (
            <div className="flex items-center justify-between p-3.5 bg-orange-500/10 dark:bg-orange-950/30 border border-orange-500/20 rounded-2xl text-xs text-slate-900 dark:text-white animate-in fade-in duration-200">
              <div className="flex items-center gap-2 font-semibold">
                <span className="w-5 h-5 rounded-full bg-[#F97316] text-white flex items-center justify-center text-[10px]">
                  {selectedIds.length}
                </span>
                <span>Tax rates selected for bulk action</span>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkToggleStatus(true)}
                  className="h-8 text-xs bg-white dark:bg-slate-900 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50"
                >
                  <Power className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Enable Selected
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleBulkToggleStatus(false)}
                  className="h-8 text-xs bg-white dark:bg-slate-900 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 hover:bg-amber-50"
                >
                  <XCircle className="w-3.5 h-3.5 mr-1 text-amber-500" /> Disable Selected
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => {
                    setIsBulkDelete(true);
                    setIsDeleteOpen(true);
                  }}
                  className="h-8 text-xs bg-rose-600 hover:bg-rose-700 text-white"
                >
                  <Trash2 className="w-3.5 h-3.5 mr-1" /> Delete Selected
                </Button>
              </div>
            </div>
          )}

          {/* Main Tax Table */}
          <TaxTable
            taxes={taxes}
            pagination={pagination}
            isLoading={isLoading}
            selectedIds={selectedIds}
            onSelectAll={handleSelectAll}
            onSelectOne={handleSelectOne}
            onPageChange={(page) => handleFilterChange({ page })}
            onLimitChange={(limit) => handleFilterChange({ limit })}
            onViewDetails={(tax) => {
              setSelectedTax(tax);
              setIsDetailsOpen(true);
            }}
            onEdit={(tax) => {
              setSelectedTax(tax);
              setIsFormOpen(true);
            }}
            onToggleStatus={handleToggleStatus}
            onSetDefault={handleSetDefaultTax}
            onDelete={(tax) => {
              setTaxToDelete(tax);
              setIsBulkDelete(false);
              setIsDeleteOpen(true);
            }}
          />
        </main>
      </div>

      {/* Modals */}
      <CreateInvoiceModal
        isOpen={isInvoiceModalOpen}
        onClose={() => setIsInvoiceModalOpen(false)}
      />

      <TaxFormModal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        tax={selectedTax}
        onSubmitCreate={handleCreateTax}
        onSubmitUpdate={handleUpdateTax}
      />

      <TaxDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        tax={selectedTax}
        onEdit={(tax) => {
          setSelectedTax(tax);
          setIsFormOpen(true);
        }}
        onToggleStatus={handleToggleStatus}
        onDelete={(tax) => {
          setTaxToDelete(tax);
          setIsBulkDelete(false);
          setIsDeleteOpen(true);
        }}
      />

      <TaxDeleteDialog
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        tax={taxToDelete}
        isBulk={isBulkDelete}
        selectedCount={selectedIds.length}
        onConfirmDelete={async () => {
          if (isBulkDelete) {
            await handleBulkDelete();
          } else if (taxToDelete) {
            await handleDeleteTax(taxToDelete);
          }
        }}
      />
    </div>
  );
};
