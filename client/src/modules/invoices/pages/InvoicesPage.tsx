import React, { useState } from "react";
import { Sidebar } from "../../../components/layout/Sidebar";
import { Header } from "../../../components/layout/Header";
import { SearchBar } from "../components/SearchBar";
import { FilterBar, type FilterStatus } from "../components/FilterBar";
import { InvoiceTable } from "../components/InvoiceTable";
import { TableLoadingSkeleton } from "../components/LoadingSkeleton";
import { EmptyState } from "../components/EmptyState";
import { Pagination } from "../components/Pagination";
import { InvoiceForm } from "../components/InvoiceForm";
import { InvoiceDetailsDialog } from "../components/InvoiceDetailsDialog";
import { InvoiceDeleteDialog } from "../components/InvoiceDeleteDialog";
import { InvoiceRestoreDialog } from "../components/InvoiceRestoreDialog";
import { InvoiceStatusDialog } from "../components/InvoiceStatusDialog";
import { InvoicePaymentDialog } from "../components/InvoicePaymentDialog";
import { DocumentPreviewModal } from "../../../components/common/DocumentPreviewModal";
import { SendEmailModal } from "../../../components/common/SendEmailModal";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import {
  useInvoicesQuery,
  useInvoiceDashboardQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceMutation,
  useDeleteInvoiceMutation,
  useRestoreInvoiceMutation,
  useDuplicateInvoiceMutation,
  useUpdateStatusMutation,
  useMarkPaidMutation,
  useMarkPartialMutation,
  useSendInvoiceEmailMutation,
} from "../hooks/useInvoices";
import { invoicesApi } from "../api/invoices.api";
import type { Invoice, InvoiceQueryParams, InvoiceStatus } from "../types/invoice.types";
import type {
  InvoiceFormValues,
  MarkPaidFormValues,
  MarkPartialFormValues,
} from "../validation/invoice.schema";
import {
  Receipt,
  Plus,
  AlertCircle,
  RefreshCw,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Download,
} from "lucide-react";
import { toast } from "sonner";

export const InvoicesPage: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Search, Filters & Sorting State
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [clientIdFilter, setClientIdFilter] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [sortBy, setSortBy] = useState<
    "number" | "issueDate" | "dueDate" | "createdAt" | "total" | "status"
  >("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal / Dialog States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [viewingInvoiceId, setViewingInvoiceId] = useState<string | null>(null);
  const [deletingInvoice, setDeletingInvoice] = useState<Invoice | null>(null);
  const [restoringInvoice, setRestoringInvoice] = useState<Invoice | null>(null);
  const [statusChangingInvoice, setStatusChangingInvoice] = useState<Invoice | null>(null);
  const [paymentInvoice, setPaymentInvoice] = useState<Invoice | null>(null);
  const [paymentMode, setPaymentMode] = useState<"FULL" | "PARTIAL" | null>(null);

  // Document Preview & Email States
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [selectedInvoiceForActions, setSelectedInvoiceForActions] = useState<Invoice | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  // Query Params Construction
  const queryParams: InvoiceQueryParams = {
    page,
    limit,
    search: search.trim() || undefined,
    sortBy,
    sortOrder,
    clientId: clientIdFilter !== "ALL" ? clientIdFilter : undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
  };

  if (statusFilter === "DELETED") {
    queryParams.isDeleted = true;
  } else if (statusFilter !== "ALL") {
    queryParams.status = statusFilter as InvoiceStatus;
    queryParams.isDeleted = false;
  } else {
    queryParams.isDeleted = false;
  }

  // TanStack Queries
  const { data, isLoading, isError, error, refetch } = useInvoicesQuery(queryParams);
  const { data: dashboardSummary } = useInvoiceDashboardQuery();

  // TanStack Mutations
  const createMutation = useCreateInvoiceMutation(() => {
    setIsCreateModalOpen(false);
  });

  const updateMutation = useUpdateInvoiceMutation(() => {
    setEditingInvoice(null);
  });

  const deleteMutation = useDeleteInvoiceMutation(() => {
    setDeletingInvoice(null);
  });

  const restoreMutation = useRestoreInvoiceMutation(() => {
    setRestoringInvoice(null);
  });

  const duplicateMutation = useDuplicateInvoiceMutation();

  const updateStatusMutation = useUpdateStatusMutation(() => {
    setStatusChangingInvoice(null);
  });

  const markPaidMutation = useMarkPaidMutation(() => {
    setPaymentInvoice(null);
    setPaymentMode(null);
  });

  const markPartialMutation = useMarkPartialMutation(() => {
    setPaymentInvoice(null);
    setPaymentMode(null);
  });

  const sendEmailMutation = useSendInvoiceEmailMutation(() => {
    setIsEmailModalOpen(false);
  });

  // Handlers
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1);
  };

  const handleStatusFilterChange = (newStatus: FilterStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleClientIdChange = (newClientId: string) => {
    setClientIdFilter(newClientId);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setClientIdFilter("ALL");
    setStartDate("");
    setEndDate("");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const isFilteredOrSorted =
    !!search ||
    statusFilter !== "ALL" ||
    clientIdFilter !== "ALL" ||
    !!startDate ||
    !!endDate ||
    sortBy !== "createdAt" ||
    sortOrder !== "desc";

  // Form Submissions
  const handleCreateSubmit = async (values: InvoiceFormValues) => {
    await createMutation.mutateAsync({
      clientId: values.clientId,
      issueDate: values.issueDate,
      dueDate: values.dueDate,
      currency: values.currency,
      notes: values.notes || undefined,
      terms: values.terms || undefined,
      items: values.items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
        taxIds: item.taxIds || [],
        discount: item.discount,
      })),
    });
  };

  const handleEditSubmit = async (values: InvoiceFormValues) => {
    if (!editingInvoice) return;
    await updateMutation.mutateAsync({
      id: editingInvoice.id,
      payload: {
        clientId: values.clientId,
        issueDate: values.issueDate,
        dueDate: values.dueDate,
        currency: values.currency,
        notes: values.notes || undefined,
        terms: values.terms || undefined,
        items: values.items.map((item) => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxIds: item.taxIds || [],
          discount: item.discount,
        })),
      },
    });
  };

  // PDF Handlers
  const handleDownloadPdf = async (invoice: Invoice) => {
    try {
      toast.info(`Preparing PDF for ${invoice.number}...`);
      const blob = await invoicesApi.getInvoicePdfBlob(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${invoice.number}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${invoice.number}.pdf`);
    } catch {
      toast.error("Failed to download PDF document");
    }
  };

  const handlePreviewPdf = async (invoice: Invoice) => {
    setSelectedInvoiceForActions(invoice);
    setPreviewTitle(`Invoice Preview - ${invoice.number}`);
    setIsPreviewOpen(true);
    setIsPreviewLoading(true);
    try {
      const blob = await invoicesApi.getInvoicePdfBlob(invoice.id);
      setPreviewBlob(blob);
    } catch {
      toast.error("Failed to load invoice preview");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handleEmailInvoice = (invoice: Invoice) => {
    setSelectedInvoiceForActions(invoice);
    setIsEmailModalOpen(true);
  };

  const handlePrint = async (invoice: Invoice) => {
    try {
      toast.info(`Generating print version for ${invoice.number}...`);
      const blob = await invoicesApi.getInvoicePdfBlob(invoice.id);
      const url = window.URL.createObjectURL(blob);
      const printWindow = window.open(url, "_blank");
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      } else {
        toast.error("Popup window was blocked by browser");
      }
    } catch {
      toast.error("Failed to generate printable document");
    }
  };

  const formatCurrency = (val?: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0,
    }).format(val || 0);
  };

  const handleExportCSV = () => {
    const invoicesList = data?.invoices || [];
    if (!invoicesList.length) {
      toast.error("Export Error", { description: "No invoice records available to export." });
      return;
    }

    const headers = [
      "Invoice Number",
      "Client Name",
      "Issue Date",
      "Due Date",
      "Subtotal",
      "Tax Amount",
      "Total Amount",
      "Paid Amount",
      "Amount Due",
      "Currency",
      "Status",
    ];

    const rows = invoicesList.map((inv) => {
      const clientName = inv.client?.companyName || inv.client?.contactPerson || "N/A";
      return [
        `"${(inv.number || "").replace(/"/g, '""')}"`,
        `"${clientName.replace(/"/g, '""')}"`,
        inv.issueDate ? new Date(inv.issueDate).toISOString().slice(0, 10) : "",
        inv.dueDate ? new Date(inv.dueDate).toISOString().slice(0, 10) : "",
        inv.subtotal || 0,
        inv.tax || 0,
        inv.total || 0,
        inv.amountPaid || 0,
        inv.balanceDue || 0,
        inv.currency || "INR",
        `"${(inv.status || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvString = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Invoices_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV Exported", { description: "Invoices exported successfully." });
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
          onOpenCreateInvoice={() => setIsCreateModalOpen(true)}
          onOpenCreateClient={() => {}}
          onRefresh={refetch}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 text-[#F97316] flex items-center justify-center shrink-0">
                <Receipt className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Invoices & Billing
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate max-w-xl">
                  Issue, track, and manage customer billing invoices and payment collections.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="h-9 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
                title="Refresh Invoices"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400 ${isLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="h-9 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
                title="Export CSV"
              >
                <Download className="w-3.5 h-3.5 mr-1.5 text-[#F97316]" />
                <span>Export CSV</span>
              </Button>
              <Button
                onClick={() => setIsCreateModalOpen(true)}
                className="h-9 px-4 text-xs font-semibold bg-[#F97316] hover:bg-orange-600 text-white rounded-xl shadow-sm shadow-orange-500/20 shrink-0"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Create New Invoice</span>
              </Button>
            </div>
          </div>

          {/* Dashboard Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 select-none">
            {/* Total Invoices */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>Total Invoices</span>
                <Receipt className="w-4 h-4 text-[#F97316]" />
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {dashboardSummary?.totalInvoices ?? "-"}
              </p>
              <p className="text-[11px] text-slate-400">All registered billing records</p>
            </div>

            {/* Total Revenue */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>Total Revenue Paid</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              </div>
              <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {formatCurrency(dashboardSummary?.totalRevenue)}
              </p>
              <p className="text-[11px] text-slate-400">Settled & collected funds</p>
            </div>

            {/* Outstanding Amount */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>Outstanding Balance</span>
                <Clock className="w-4 h-4 text-amber-500" />
              </div>
              <p className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {formatCurrency(dashboardSummary?.outstandingAmount)}
              </p>
              <p className="text-[11px] text-slate-400">Pending & active invoices balance</p>
            </div>

            {/* Overdue Amount */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-xs font-bold">
                <span>Overdue Amount</span>
                <AlertTriangle className="w-4 h-4 text-rose-500" />
              </div>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {formatCurrency(dashboardSummary?.overdueAmount)}
              </p>
              <p className="text-[11px] text-slate-400">Past due date collections</p>
            </div>
          </div>

          {/* Search & Filter Toolbar in Single Responsive Line */}
          <div className="flex items-center gap-2.5 bg-white dark:bg-[#111827] p-3 sm:p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto scrollbar-none w-full select-none">
            <div className="w-64 sm:w-72 shrink-0">
              <SearchBar value={search} onChange={handleSearchChange} />
            </div>

            <FilterBar
              statusFilter={statusFilter}
              onStatusChange={handleStatusFilterChange}
              clientIdFilter={clientIdFilter}
              onClientIdChange={handleClientIdChange}
              startDate={startDate}
              onStartDateChange={(d) => {
                setStartDate(d);
                setPage(1);
              }}
              endDate={endDate}
              onEndDateChange={(d) => {
                setEndDate(d);
                setPage(1);
              }}
              sortBy={sortBy}
              onSortByChange={(s) => setSortBy(s)}
              sortOrder={sortOrder}
              onSortOrderToggle={() => setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"))}
              onResetFilters={handleResetFilters}
              isFilteredOrSorted={isFilteredOrSorted}
            />
          </div>

          {/* Error Banner */}
          {isError && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>
                  {error instanceof Error ? error.message : "Failed to load invoices list."}
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={() => refetch()} className="rounded-xl text-xs">
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Retry
              </Button>
            </div>
          )}

          {/* Table / Skeleton / Empty State */}
          {isLoading ? (
            <TableLoadingSkeleton rowCount={limit} />
          ) : !data || data.invoices.length === 0 ? (
            <EmptyState
              isSearchOrFilterActive={isFilteredOrSorted}
              onCreateInvoice={() => setIsCreateModalOpen(true)}
              onClearFilters={handleResetFilters}
            />
          ) : (
            <div className="space-y-4">
              <InvoiceTable
                invoices={data.invoices}
                onView={(inv) => setViewingInvoiceId(inv.id)}
                onEdit={(inv) => setEditingInvoice(inv)}
                onDelete={(inv) => setDeletingInvoice(inv)}
                onRestore={(inv) => setRestoringInvoice(inv)}
                onDuplicate={(inv) => duplicateMutation.mutate(inv.id)}
                onDownloadPdf={handleDownloadPdf}
                onPreview={handlePreviewPdf}
                onPrint={handlePrint}
                onEmail={handleEmailInvoice}
                onMarkPaid={(inv) => {
                  setPaymentInvoice(inv);
                  setPaymentMode("FULL");
                }}
                onMarkPartial={(inv) => {
                  setPaymentInvoice(inv);
                  setPaymentMode("PARTIAL");
                }}
                onChangeStatus={(inv) => setStatusChangingInvoice(inv)}
              />

              {/* Standard Pagination Component */}
              <Pagination
                pagination={data.meta}
                onPageChange={(p) => setPage(p)}
                onLimitChange={(l) => {
                  setLimit(l);
                  setPage(1);
                }}
              />
            </div>
          )}
        </main>
      </div>

      {/* Create Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-[#111827] space-y-1">
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#F97316]" />
              <span>Create New Invoice</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Draft a new billing invoice with clients, tax rules, and line items.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <InvoiceForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setIsCreateModalOpen(false)}
              isLoading={createMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={!!editingInvoice} onOpenChange={() => setEditingInvoice(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-[#111827] space-y-1">
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#F97316]" />
              <span>Edit Invoice ({editingInvoice?.number})</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500 dark:text-slate-400">
              Modify details and save updated calculations.
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <InvoiceForm
              initialData={editingInvoice}
              onSubmit={handleEditSubmit}
              onCancel={() => setEditingInvoice(null)}
              isLoading={updateMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* View Details Dialog */}
      <InvoiceDetailsDialog
        invoiceId={viewingInvoiceId}
        isOpen={!!viewingInvoiceId}
        onClose={() => setViewingInvoiceId(null)}
        onEdit={(inv) => setEditingInvoice(inv)}
        onDownloadPdf={handleDownloadPdf}
        onPreview={handlePreviewPdf}
        onPrint={handlePrint}
        onEmail={handleEmailInvoice}
        onMarkPaid={(inv) => {
          setPaymentInvoice(inv);
          setPaymentMode("FULL");
        }}
        onMarkPartial={(inv) => {
          setPaymentInvoice(inv);
          setPaymentMode("PARTIAL");
        }}
        onChangeStatus={(inv) => setStatusChangingInvoice(inv)}
      />

      {/* Delete Dialog */}
      <InvoiceDeleteDialog
        invoice={deletingInvoice}
        isOpen={!!deletingInvoice}
        onClose={() => setDeletingInvoice(null)}
        onConfirm={async () => {
          if (deletingInvoice) await deleteMutation.mutateAsync(deletingInvoice.id);
        }}
        isLoading={deleteMutation.isPending}
      />

      {/* Restore Dialog */}
      <InvoiceRestoreDialog
        invoice={restoringInvoice}
        isOpen={!!restoringInvoice}
        onClose={() => setRestoringInvoice(null)}
        onConfirm={async () => {
          if (restoringInvoice) await restoreMutation.mutateAsync(restoringInvoice.id);
        }}
        isLoading={restoreMutation.isPending}
      />

      {/* Change Status Dialog */}
      <InvoiceStatusDialog
        invoice={statusChangingInvoice}
        isOpen={!!statusChangingInvoice}
        onClose={() => setStatusChangingInvoice(null)}
        onConfirm={async (id, status) => {
          await updateStatusMutation.mutateAsync({ id, status });
        }}
        isLoading={updateStatusMutation.isPending}
      />

      {/* Payment Dialog */}
      <InvoicePaymentDialog
        invoice={paymentInvoice}
        mode={paymentMode}
        isOpen={!!paymentInvoice}
        onClose={() => {
          setPaymentInvoice(null);
          setPaymentMode(null);
        }}
        onConfirmFull={async (id, values: MarkPaidFormValues) => {
          await markPaidMutation.mutateAsync({ id, payload: values });
        }}
        onConfirmPartial={async (id, values: MarkPartialFormValues) => {
          await markPartialMutation.mutateAsync({ id, payload: values });
        }}
        isLoading={markPaidMutation.isPending || markPartialMutation.isPending}
      />

      {/* PDF Document Preview Modal */}
      <DocumentPreviewModal
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewBlob(null);
        }}
        title={previewTitle}
        pdfBlob={previewBlob}
        isLoading={isPreviewLoading}
        onDownload={() => selectedInvoiceForActions && handleDownloadPdf(selectedInvoiceForActions)}
        onPrint={() => selectedInvoiceForActions && handlePrint(selectedInvoiceForActions)}
        onEmail={() => {
          setIsPreviewOpen(false);
          if (selectedInvoiceForActions) handleEmailInvoice(selectedInvoiceForActions);
        }}
      />

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        recipientEmail={selectedInvoiceForActions?.client?.email}
        recipientName={selectedInvoiceForActions?.client?.contactPerson || selectedInvoiceForActions?.client?.companyName}
        documentTitle={`Invoice #${selectedInvoiceForActions?.number || ""}`}
        onSend={async (email, subject, message) => {
          if (!selectedInvoiceForActions) return;
          await sendEmailMutation.mutateAsync({
            id: selectedInvoiceForActions.id,
            payload: { recipientEmail: email, subject, message },
          });
        }}
      />
    </div>
  );
};
