import React, { useState } from "react";
import { Sidebar } from "../../../components/layout/Sidebar";
import { Header } from "../../../components/layout/Header";
import { Button } from "../../../components/ui/button";
import {
  Plus,
  PiggyBank,
  LayoutDashboard,
  List,
  Tag,
  Building2,
  BarChart3,
  RefreshCw,
} from "lucide-react";
import {
  useExpenses,
  useExpenseCategories,
  useVendors,
  useExpenseDashboard,
  useExpenseReports,
  useCreateExpense,
  useUpdateExpense,
  useUpdateExpenseStatus,
  useDeleteExpense,
  useRestoreExpense,
} from "../hooks/useExpenses";
import type { Expense, ExpenseQueryFilters } from "../types/expense.types";
import { ExpenseStatCards } from "../components/ExpenseStatCards";
import { ExpenseFiltersBar } from "../components/ExpenseFiltersBar";
import { ExpenseTable } from "../components/ExpenseTable";
import { ExpenseFormDialog } from "../components/ExpenseFormDialog";
import { ExpenseDetailsModal } from "../components/ExpenseDetailsModal";
import { CategoryManagementModal } from "../components/CategoryManagementModal";
import { VendorManagementModal } from "../components/VendorManagementModal";
import { ExpenseCharts } from "../components/ExpenseCharts";
import { ExpenseReportsView } from "../components/ExpenseReportsView";

import { usePermission } from "../../../hooks/usePermission";

export const ExpensesPage: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const permission = usePermission();
  const userRole = permission.role;

  const [activeTab, setActiveTab] = useState<
    "list" | "dashboard" | "categories" | "vendors" | "reports"
  >("list");

  // Query filters state
  const [filters, setFilters] = useState<ExpenseQueryFilters>({
    page: 1,
    limit: 10,
    sortBy: "expenseDate",
    sortOrder: "desc",
  });

  // Selected table row IDs for bulk operations
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Dialog states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  const [selectedDetailsExpense, setSelectedDetailsExpense] = useState<Expense | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isVendorModalOpen, setIsVendorModalOpen] = useState(false);

  // Queries & Mutations
  const { data: expensesData, isLoading: isExpensesLoading, refetch } = useExpenses(filters);
  const { data: categoriesData } = useExpenseCategories({ limit: 100 });
  const { data: vendorsData } = useVendors({ limit: 100 });
  const { data: dashboardData, isLoading: isDashboardLoading } = useExpenseDashboard();
  const { monthlyTrend, taxSummary, isLoading: isReportsLoading } = useExpenseReports({});

  const createExpenseMutation = useCreateExpense();
  const updateExpenseMutation = useUpdateExpense();
  const updateStatusMutation = useUpdateExpenseStatus();
  const deleteExpenseMutation = useDeleteExpense();
  const restoreExpenseMutation = useRestoreExpense();

  const categories = categoriesData?.data || [];
  const vendors = vendorsData?.data || [];
  const expenses = expensesData?.data || [];
  const meta = expensesData?.meta;

  const canCreate = permission.can("expenses", "create");

  const handleFilterChange = (updated: Partial<ExpenseQueryFilters>) => {
    setFilters((prev) => ({ ...prev, ...updated }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: "expenseDate",
      sortOrder: "desc",
    });
  };

  const handleSelectToggle = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSelectAllToggle = (allIds: string[]) => {
    if (allIds.every((id) => selectedIds.includes(id))) {
      setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedIds((prev) => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedIds.length} selected expenses?`)) {
      for (const id of selectedIds) {
        await deleteExpenseMutation.mutateAsync(id);
      }
      setSelectedIds([]);
    }
  };

  const handleBulkRestore = async () => {
    if (window.confirm(`Restore ${selectedIds.length} selected expenses?`)) {
      for (const id of selectedIds) {
        await restoreExpenseMutation.mutateAsync(id);
      }
      setSelectedIds([]);
    }
  };

  const handleExportCsv = () => {
    const rows = [
      [
        "Expense Number",
        "Title",
        "Category",
        "Vendor",
        "Amount (INR)",
        "Tax Rate (%)",
        "Tax Amount (INR)",
        "Total Amount (INR)",
        "Payment Method",
        "Status",
        "Expense Date",
        "Reference Number",
      ],
      ...expenses.map((e) => [
        e.expenseNumber,
        `"${e.title.replace(/"/g, '""')}"`,
        `"${(e.category?.name || "Uncategorized").replace(/"/g, '""')}"`,
        `"${(e.vendor?.name || "Direct Expense").replace(/"/g, '""')}"`,
        e.amount,
        e.taxRate,
        e.taxAmount,
        e.totalAmount,
        e.paymentMethod,
        e.status,
        new Date(e.expenseDate).toISOString().slice(0, 10),
        e.referenceNumber || "",
      ]),
    ];

    const csvContent = "data:text/csv;charset=utf-8," + rows.map((r) => r.join(",")).join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Expenses_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenAddForm = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (formData: FormData) => {
    if (editingExpense) {
      await updateExpenseMutation.mutateAsync({
        id: editingExpense.id,
        formData,
      });
    } else {
      await createExpenseMutation.mutateAsync(formData);
    }
    setIsFormOpen(false);
  };

  const handleViewDetails = (expense: Expense) => {
    setSelectedDetailsExpense(expense);
    setIsDetailsOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-[#111827] dark:text-[#F9FAFB] flex transition-colors duration-200">
      {/* Navigation Sidebar */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenCreateInvoice={() => {}}
          onOpenCreateClient={() => {}}
          onRefresh={() => {}}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 text-[#F97316] flex items-center justify-center shrink-0">
                <PiggyBank className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Expense Management
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate max-w-xl">
                  Log operational costs, vendor bills, tax breakdowns, and receipt attachments.
                </p>
              </div>
            </div>

            {/* Top Right Action Buttons */}
            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isExpensesLoading}
                className="h-9 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
                title="Refresh Expenses"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400 ${isExpensesLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCategoryModalOpen(true)}
                className="h-9 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Tag className="w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400" />
                <span>Categories</span>
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsVendorModalOpen(true)}
                className="h-9 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
              >
                <Building2 className="w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400" />
                <span>Vendors</span>
              </Button>
              {canCreate && (
                <Button
                  type="button"
                  onClick={handleOpenAddForm}
                  className="h-9 px-4 text-xs font-semibold bg-[#F97316] hover:bg-orange-600 text-white rounded-xl shadow-sm shadow-orange-500/20 shrink-0"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>Record Expense</span>
                </Button>
              )}
            </div>
          </div>

      {/* Overview Stat Cards */}
      <ExpenseStatCards summary={dashboardData?.data} isLoading={isDashboardLoading} />

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 mb-6 overflow-x-auto">
        <button
          type="button"
          onClick={() => setActiveTab("list")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all shrink-0 ${
            activeTab === "list"
              ? "border-[#F97316] text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <List className="w-4 h-4" />
          Expense Transactions
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("dashboard")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all shrink-0 ${
            activeTab === "dashboard"
              ? "border-[#F97316] text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <LayoutDashboard className="w-4 h-4" />
          Visual Analytics & Charts
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all shrink-0 ${
            activeTab === "reports"
              ? "border-[#F97316] text-orange-600 dark:text-orange-400"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          Tax & Audit Reports
        </button>
      </div>

      {/* Tab Content Rendering */}
      {activeTab === "list" && (
        <>
          <ExpenseFiltersBar
            filters={filters}
            categories={categories}
            vendors={vendors}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            selectedCount={selectedIds.length}
            onBulkDelete={handleBulkDelete}
            onBulkRestore={handleBulkRestore}
            onExportCsv={handleExportCsv}
            userRole={userRole}
          />

          <ExpenseTable
            expenses={expenses}
            meta={meta}
            isLoading={isExpensesLoading}
            filters={filters}
            onFilterChange={handleFilterChange}
            onViewDetails={handleViewDetails}
            onEditExpense={handleOpenEditForm}
            onDeleteExpense={(id) => deleteExpenseMutation.mutate(id)}
            onRestoreExpense={(id) => restoreExpenseMutation.mutate(id)}
            onStatusChange={(id, status) =>
              updateStatusMutation.mutate({ id, status })
            }
            selectedIds={selectedIds}
            onSelectToggle={handleSelectToggle}
            onSelectAllToggle={handleSelectAllToggle}
            userRole={userRole}
          />
        </>
      )}

      {activeTab === "dashboard" && (
        <ExpenseCharts
          monthlyTrend={monthlyTrend.data?.data || []}
          categories={dashboardData?.data?.topCategories}
          vendors={dashboardData?.data?.topVendors}
          taxSummary={taxSummary.data?.data}
          isLoading={isDashboardLoading || isReportsLoading}
        />
      )}

      {activeTab === "reports" && (
        <ExpenseReportsView categories={categories} vendors={vendors} />
      )}

      {/* Modals & Dialogs */}
      <ExpenseFormDialog
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        expenseToEdit={editingExpense}
        categories={categories}
        vendors={vendors}
        isSubmitting={createExpenseMutation.isPending || updateExpenseMutation.isPending}
        onOpenCategoryModal={() => setIsCategoryModalOpen(true)}
        onOpenVendorModal={() => setIsVendorModalOpen(true)}
      />

      <ExpenseDetailsModal
        isOpen={isDetailsOpen}
        onClose={() => setIsDetailsOpen(false)}
        expense={selectedDetailsExpense}
        onEdit={handleOpenEditForm}
        onDelete={(id) => deleteExpenseMutation.mutate(id)}
        onStatusChange={(id, status) => updateStatusMutation.mutate({ id, status })}
        userRole={userRole}
      />

      <CategoryManagementModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        userRole={userRole}
      />

      <VendorManagementModal
        isOpen={isVendorModalOpen}
        onClose={() => setIsVendorModalOpen(false)}
        userRole={userRole}
      />
        </main>
      </div>
    </div>
  );
};
