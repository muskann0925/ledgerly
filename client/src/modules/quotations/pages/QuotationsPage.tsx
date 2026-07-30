import React, { useState } from "react";
import { Sidebar } from "../../../components/layout/Sidebar";
import { Header } from "../../../components/layout/Header";
import type { Quotation, QuotationStatus } from "../types/quotation.types";
import {
  useQuotationsQuery,
  useCreateQuotationMutation,
  useUpdateQuotationMutation,
  useDeleteQuotationMutation,
  useRestoreQuotationMutation,
  useDuplicateQuotationMutation,
  useApproveQuotationMutation,
  useRejectQuotationMutation,
  useConvertQuotationMutation,
  useSendQuotationEmailMutation,
} from "../hooks/useQuotations";
import { quotationsApi } from "../api/quotations.api";
import { SearchBar } from "../components/SearchBar";
import { FilterBar } from "../components/FilterBar";
import { QuotationsTable } from "../components/QuotationsTable";
import { Pagination } from "../components/Pagination";
import { EmptyState } from "../components/EmptyState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { QuotationForm } from "../components/QuotationForm";
import { QuotationDetailsDialog } from "../components/QuotationDetailsDialog";
import { QuotationRejectDialog } from "../components/QuotationRejectDialog";
import { QuotationConvertDialog } from "../components/QuotationConvertDialog";
import { DeleteConfirmationDialog } from "../components/DeleteConfirmationDialog";
import { RestoreConfirmationDialog } from "../components/RestoreConfirmationDialog";
import { DocumentPreviewModal } from "../../../components/common/DocumentPreviewModal";
import { SendEmailModal } from "../../../components/common/SendEmailModal";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  FileText,
  Plus,
  TrendingUp,
  CheckCircle2,
  Clock,
  RefreshCw,
  FileCheck,
  Download,
} from "lucide-react";
import type { QuotationFormValues } from "../validation/quotation.schema";
import { toast } from "sonner";

import { usePermission } from "../../../hooks/usePermission";

export const QuotationsPage: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const permission = usePermission();

  // Filters & Pagination State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<QuotationStatus | "ALL">("ALL");
  const [clientId, setClientId] = useState("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isExpired, setIsExpired] = useState(false);
  const [isDeleted, setIsDeleted] = useState(false);
  const [sortBy, setSortBy] = useState<"quotationNumber" | "issueDate" | "expiryDate" | "total" | "status" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingQuotation, setEditingQuotation] = useState<Quotation | null>(null);
  const [viewingQuotationId, setViewingQuotationId] = useState<string | null>(null);
  const [rejectingQuotation, setRejectingQuotation] = useState<Quotation | null>(null);
  const [convertingQuotation, setConvertingQuotation] = useState<Quotation | null>(null);
  const [deletingQuotation, setDeletingQuotation] = useState<Quotation | null>(null);
  const [restoringQuotation, setRestoringQuotation] = useState<Quotation | null>(null);

  // TanStack Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuotationsQuery({
    page,
    limit: 10,
    search,
    status,
    clientId,
    startDate,
    endDate,
    isExpired,
    isDeleted,
    sortBy,
    sortOrder,
  });

  // Mutations
  const createMutation = useCreateQuotationMutation(() => {
    setIsFormOpen(false);
  });

  const updateMutation = useUpdateQuotationMutation(() => {
    setIsFormOpen(false);
    setEditingQuotation(null);
  });

  const deleteMutation = useDeleteQuotationMutation(() => {
    setDeletingQuotation(null);
  });

  const restoreMutation = useRestoreQuotationMutation(() => {
    setRestoringQuotation(null);
  });

  const duplicateMutation = useDuplicateQuotationMutation();

  const approveMutation = useApproveQuotationMutation();

  const rejectMutation = useRejectQuotationMutation(() => {
    setRejectingQuotation(null);
  });

  const convertMutation = useConvertQuotationMutation(() => {
    setConvertingQuotation(null);
  });

  const sendEmailMutation = useSendQuotationEmailMutation(() => {
    setIsEmailModalOpen(false);
  });

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setStatus("ALL");
    setClientId("ALL");
    setStartDate("");
    setEndDate("");
    setIsExpired(false);
    setIsDeleted(false);
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  // Handlers
  const handleOpenCreateForm = () => {
    setEditingQuotation(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (quotation: Quotation) => {
    setEditingQuotation(quotation);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: QuotationFormValues) => {
    if (editingQuotation) {
      await updateMutation.mutateAsync({
        id: editingQuotation.id,
        payload: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  // Document Actions States
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [selectedQuotationForActions, setSelectedQuotationForActions] = useState<Quotation | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const handleDownloadPdf = async (quotation: Quotation) => {
    try {
      toast.info(`Preparing PDF for ${quotation.quotationNumber}...`);
      const blob = await quotationsApi.downloadPdf(quotation.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `Quotation-${quotation.quotationNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded ${quotation.quotationNumber}.pdf`);
    } catch {
      toast.error("Failed to download PDF document");
    }
  };

  const handlePreviewPdf = async (quotation: Quotation) => {
    setSelectedQuotationForActions(quotation);
    setPreviewTitle(`Quotation Preview - ${quotation.quotationNumber}`);
    setIsPreviewOpen(true);
    setIsPreviewLoading(true);
    try {
      const blob = await quotationsApi.downloadPdf(quotation.id);
      setPreviewBlob(blob);
    } catch {
      toast.error("Failed to load quotation preview");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handlePrint = async (quotation: Quotation) => {
    try {
      toast.info(`Generating print version for ${quotation.quotationNumber}...`);
      const blob = await quotationsApi.downloadPdf(quotation.id);
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
      toast.error("Failed to generate printable proposal");
    }
  };

  const handleEmailQuotation = (quotation: Quotation) => {
    setSelectedQuotationForActions(quotation);
    setIsEmailModalOpen(true);
  };

  const handleApprove = async (quotation: Quotation) => {
    await approveMutation.mutateAsync(quotation.id);
  };

  const handleRejectConfirm = async (reason?: string) => {
    if (rejectingQuotation) {
      await rejectMutation.mutateAsync({
        id: rejectingQuotation.id,
        reason,
      });
    }
  };

  const handleConvertConfirm = async () => {
    if (convertingQuotation) {
      await convertMutation.mutateAsync(convertingQuotation.id);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingQuotation) {
      await deleteMutation.mutateAsync(deletingQuotation.id);
    }
  };

  const handleRestoreConfirm = async () => {
    if (restoringQuotation) {
      await restoreMutation.mutateAsync(restoringQuotation.id);
    }
  };

  const handleDuplicate = async (quotation: Quotation) => {
    await duplicateMutation.mutateAsync(quotation.id);
  };

  // KPI Calculations
  const quotationsList = data?.quotations || [];
  const totalProposalSum = quotationsList.reduce((acc, curr) => acc + curr.total, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);
  };

  const handleExportCSV = () => {
    if (!quotationsList.length) {
      toast.error("Export Error", { description: "No quotation records available to export." });
      return;
    }

    const headers = [
      "Quotation Number",
      "Client Name",
      "Issue Date",
      "Expiry Date",
      "Subtotal",
      "Tax Amount",
      "Total Amount",
      "Status",
    ];

    const rows = quotationsList.map((q) => {
      const clientName = q.client?.companyName || q.client?.contactPerson || "N/A";
      return [
        `"${(q.quotationNumber || "").replace(/"/g, '""')}"`,
        `"${clientName.replace(/"/g, '""')}"`,
        q.issueDate ? new Date(q.issueDate).toISOString().slice(0, 10) : "",
        q.expiryDate ? new Date(q.expiryDate).toISOString().slice(0, 10) : "",
        q.subtotal || 0,
        q.tax || 0,
        q.total || 0,
        `"${(q.status || "").replace(/"/g, '""')}"`,
      ];
    });

    const csvString = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvString], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Quotations_Export_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success("CSV Exported", { description: "Quotations exported successfully." });
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#090D16] text-[#111827] dark:text-[#F9FAFB] flex transition-colors duration-200">
      {/* Navigation Sidebar */}
      <Sidebar
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header
          onOpenCreateInvoice={() => {}}
          onOpenCreateClient={() => {}}
          onRefresh={refetch}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto select-none">
          {/* Page Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-[#111827] px-4 py-3.5 sm:px-5 sm:py-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/20 text-[#F97316] flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Quotations & Estimates
                </h1>
                <p className="text-slate-500 dark:text-slate-400 text-xs mt-0.5 truncate max-w-xl">
                  Create formal price quotes, handle client approvals, and convert proposals to active invoices.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5 shrink-0 self-start sm:self-auto flex-wrap">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-9 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
                title="Refresh Quotations"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400 ${isFetching ? "animate-spin" : ""}`} />
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

              {permission.can("quotations", "create") && (
                <Button
                  onClick={handleOpenCreateForm}
                  className="h-9 px-4 text-xs font-semibold bg-[#F97316] hover:bg-orange-600 text-white rounded-xl shadow-sm shadow-orange-500/20 shrink-0"
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  <span>Create Proposal</span>
                </Button>
              )}
            </div>
          </div>

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Page Proposals */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Page Value</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(totalProposalSum)}
              </p>
              <p className="text-[11px] text-slate-400">
                {data?.pagination.total || 0} total proposals recorded
              </p>
            </div>

            {/* Approved & Converted Value */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Approved Value</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(
                  quotationsList
                    .filter((q) => q.status === "APPROVED" || q.status === "CONVERTED")
                    .reduce((acc, curr) => acc + curr.total, 0)
                )}
              </p>
              <p className="text-[11px] text-slate-400">Approved & converted deals</p>
            </div>

            {/* Pending Proposals */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Pending Deals</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(
                  quotationsList
                    .filter((q) => q.status === "DRAFT" || q.status === "PENDING")
                    .reduce((acc, curr) => acc + curr.total, 0)
                )}
              </p>
              <p className="text-[11px] text-slate-400">Drafts & awaiting client feedback</p>
            </div>

            {/* Converted to Invoices */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Converted Invoices</span>
                <div className="p-2 rounded-xl bg-orange-500/10 text-[#F97316]">
                  <FileCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {quotationsList.filter((q) => q.status === "CONVERTED").length}
              </p>
              <p className="text-[11px] text-slate-400">Successfully converted proposals</p>
            </div>
          </div>

          {/* Toolbar: SearchBar & FilterBar in Single Responsive Line */}
          <div className="flex items-center gap-2.5 p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto scrollbar-none w-full select-none">
            <div className="w-64 sm:w-72 shrink-0">
              <SearchBar value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
            </div>

            <FilterBar
              status={status}
              onStatusChange={(s) => { setStatus(s); setPage(1); }}
              clientId={clientId}
              onClientIdChange={(c) => { setClientId(c); setPage(1); }}
              startDate={startDate}
              onStartDateChange={(d) => { setStartDate(d); setPage(1); }}
              endDate={endDate}
              onEndDateChange={(d) => { setEndDate(d); setPage(1); }}
              isExpired={isExpired}
              onIsExpiredChange={(exp) => { setIsExpired(exp); setPage(1); }}
              isDeleted={isDeleted}
              onIsDeletedChange={(del) => { setIsDeleted(del); setPage(1); }}
              sortBy={sortBy}
              onSortByChange={(s) => { setSortBy(s); setPage(1); }}
              sortOrder={sortOrder}
              onSortOrderChange={(o) => { setSortOrder(o); setPage(1); }}
              onResetFilters={handleResetFilters}
            />
          </div>

          {/* Table / Loading / Empty State */}
          {isLoading ? (
            <LoadingSkeleton />
          ) : isError ? (
            <div className="p-8 text-center bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 rounded-2xl text-rose-600 dark:text-rose-300 text-xs">
              {error instanceof Error ? error.message : "Failed to load quotations from server."}
            </div>
          ) : quotationsList.length === 0 ? (
            <EmptyState
              title={search || status !== "ALL" || isDeleted ? "No Matching Proposals Found" : "No Quotations Recorded Yet"}
              description={
                search || status !== "ALL" || isDeleted
                  ? "No quotation proposals match your active search filters. Try adjusting your search query or resetting filters."
                  : "Start creating formal price estimates and proposals for potential clients."
              }
              onAction={handleOpenCreateForm}
            />
          ) : (
            <div className="space-y-4">
              <QuotationsTable
                quotations={quotationsList}
                onView={(quotation) => setViewingQuotationId(quotation.id)}
                onEdit={handleOpenEditForm}
                onDelete={(quotation) => setDeletingQuotation(quotation)}
                onRestore={(quotation) => setRestoringQuotation(quotation)}
                onDuplicate={handleDuplicate}
                onApprove={handleApprove}
                onReject={(quotation) => setRejectingQuotation(quotation)}
                onConvert={(quotation) => setConvertingQuotation(quotation)}
                onDownloadPdf={handleDownloadPdf}
                onPreview={handlePreviewPdf}
                onPrint={handlePrint}
                onEmail={handleEmailQuotation}
              />

              {/* Standard Pagination Component */}
              {data?.pagination && (
                <Pagination
                  pagination={data.pagination}
                  onPageChange={(newPage) => setPage(newPage)}
                />
              )}
            </div>
          )}
        </main>
      </div>

      {/* Dialog: Create / Edit Quotation */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && setIsFormOpen(false)}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden">
          <DialogHeader className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-[#111827]">
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
              {editingQuotation
                ? `Edit Proposal ${editingQuotation.quotationNumber}`
                : "Create Proposal & Price Quote"}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6">
            <QuotationForm
              initialData={editingQuotation}
              onSubmit={handleFormSubmit}
              onCancel={() => setIsFormOpen(false)}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog: Details View */}
      <QuotationDetailsDialog
        quotationId={viewingQuotationId}
        isOpen={!!viewingQuotationId}
        onClose={() => setViewingQuotationId(null)}
        onEdit={handleOpenEditForm}
        onDownloadPdf={handleDownloadPdf}
        onPreview={handlePreviewPdf}
        onPrint={handlePrint}
        onEmail={handleEmailQuotation}
        onConvert={(q) => setConvertingQuotation(q)}
      />

      {/* Dialog: Reject Reason */}
      <QuotationRejectDialog
        quotation={rejectingQuotation}
        isOpen={!!rejectingQuotation}
        onClose={() => setRejectingQuotation(null)}
        onConfirm={handleRejectConfirm}
        isLoading={rejectMutation.isPending}
      />

      {/* Dialog: Convert to Invoice */}
      <QuotationConvertDialog
        quotation={convertingQuotation}
        isOpen={!!convertingQuotation}
        onClose={() => setConvertingQuotation(null)}
        onConfirm={handleConvertConfirm}
        isLoading={convertMutation.isPending}
      />

      {/* Dialog: Delete Confirmation */}
      <DeleteConfirmationDialog
        quotation={deletingQuotation}
        isOpen={!!deletingQuotation}
        onClose={() => setDeletingQuotation(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      {/* Dialog: Restore Confirmation */}
      <RestoreConfirmationDialog
        quotation={restoringQuotation}
        isOpen={!!restoringQuotation}
        onClose={() => setRestoringQuotation(null)}
        onConfirm={handleRestoreConfirm}
        isLoading={restoreMutation.isPending}
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
        onDownload={() => selectedQuotationForActions && handleDownloadPdf(selectedQuotationForActions)}
        onPrint={() => selectedQuotationForActions && handlePrint(selectedQuotationForActions)}
        onEmail={() => {
          setIsPreviewOpen(false);
          if (selectedQuotationForActions) handleEmailQuotation(selectedQuotationForActions);
        }}
      />

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        recipientEmail={selectedQuotationForActions?.client?.email}
        recipientName={selectedQuotationForActions?.client?.contactPerson || selectedQuotationForActions?.client?.companyName}
        documentTitle={`Quotation #${selectedQuotationForActions?.quotationNumber || ""}`}
        onSend={async (email, subject, message) => {
          if (!selectedQuotationForActions) return;
          await sendEmailMutation.mutateAsync({
            id: selectedQuotationForActions.id,
            payload: { recipientEmail: email, subject, message },
          });
        }}
      />
    </div>
  );
};
