import React, { useState } from "react";
import { Sidebar } from "../../../components/layout/Sidebar";
import { Header } from "../../../components/layout/Header";
import type { Payment, PaymentMethod } from "../types/payment.types";
import {
  usePaymentsQuery,
  useCreatePaymentMutation,
  useUpdatePaymentMutation,
  useDeletePaymentMutation,
  useRestorePaymentMutation,
  useSendPaymentEmailMutation,
} from "../hooks/usePayments";
import { SearchBar } from "../components/SearchBar";
import { FilterBar } from "../components/FilterBar";
import { PaymentsTable } from "../components/PaymentsTable";
import { Pagination } from "../components/Pagination";
import { EmptyState } from "../components/EmptyState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { PaymentForm } from "../components/PaymentForm";
import { PaymentDetailsDialog } from "../components/PaymentDetailsDialog";
import { DeleteConfirmationDialog } from "../components/DeleteConfirmationDialog";
import { RestoreConfirmationDialog } from "../components/RestoreConfirmationDialog";
import { Button } from "../../../components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../../../components/ui/dialog";
import {
  CreditCard,
  Plus,
  TrendingUp,
  Banknote,
  Building,
  RefreshCw,
} from "lucide-react";
import { DocumentPreviewModal } from "../../../components/common/DocumentPreviewModal";
import { SendEmailModal } from "../../../components/common/SendEmailModal";
import { paymentsApi } from "../api/payments.api";
import { toast } from "sonner";
import type { PaymentFormValues } from "../validation/payment.schema";

export const PaymentsPage: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Query Filters & Pagination State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "ALL">("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDeleted, setIsDeleted] = useState(false);
  const [sortBy, setSortBy] = useState<"paymentDate" | "amount" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Dialog States
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [viewingPaymentId, setViewingPaymentId] = useState<string | null>(null);
  const [deletingPayment, setDeletingPayment] = useState<Payment | null>(null);
  const [restoringPayment, setRestoringPayment] = useState<Payment | null>(null);

  // Document Actions States
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [selectedPaymentForActions, setSelectedPaymentForActions] = useState<Payment | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const sendEmailMutation = useSendPaymentEmailMutation(() => {
    setIsEmailModalOpen(false);
  });

  // PDF Receipt Handlers
  const handleDownloadReceipt = async (payment: Payment) => {
    try {
      toast.info(`Preparing receipt PDF...`);
      const blob = await paymentsApi.getReceiptPdfBlob(payment.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Payment-Receipt-${payment.id.slice(-6)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Downloaded Payment Receipt PDF");
    } catch {
      toast.error("Failed to download payment receipt PDF");
    }
  };

  const handlePreviewReceipt = async (payment: Payment) => {
    setSelectedPaymentForActions(payment);
    setPreviewTitle(`Payment Receipt - REC-${payment.id.slice(-6).toUpperCase()}`);
    setIsPreviewOpen(true);
    setIsPreviewLoading(true);
    try {
      const blob = await paymentsApi.getReceiptPdfBlob(payment.id);
      setPreviewBlob(blob);
    } catch {
      toast.error("Failed to load receipt preview");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handlePrintReceipt = async (payment: Payment) => {
    try {
      toast.info("Generating print version for receipt...");
      const blob = await paymentsApi.getReceiptPdfBlob(payment.id);
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
      toast.error("Failed to generate printable receipt");
    }
  };

  const handleEmailReceipt = (payment: Payment) => {
    setSelectedPaymentForActions(payment);
    setIsEmailModalOpen(true);
  };

  // TanStack Query
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = usePaymentsQuery({
    page,
    limit: 10,
    search,
    paymentMethod,
    startDate,
    endDate,
    isDeleted,
    sortBy,
    sortOrder,
  });

  // Mutations
  const createMutation = useCreatePaymentMutation(() => {
    setIsFormOpen(false);
  });

  const updateMutation = useUpdatePaymentMutation(() => {
    setIsFormOpen(false);
    setEditingPayment(null);
  });

  const deleteMutation = useDeletePaymentMutation(() => {
    setDeletingPayment(null);
  });

  const restoreMutation = useRestorePaymentMutation(() => {
    setRestoringPayment(null);
  });

  // Reset Filters
  const handleResetFilters = () => {
    setSearch("");
    setPaymentMethod("ALL");
    setStartDate("");
    setEndDate("");
    setIsDeleted(false);
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  // Handlers
  const handleOpenCreateForm = () => {
    setEditingPayment(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (payment: Payment) => {
    setEditingPayment(payment);
    setIsFormOpen(true);
  };

  const handleFormSubmit = async (values: PaymentFormValues) => {
    if (editingPayment) {
      await updateMutation.mutateAsync({
        id: editingPayment.id,
        payload: values,
      });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  const handleDeleteConfirm = async () => {
    if (deletingPayment) {
      await deleteMutation.mutateAsync(deletingPayment.id);
    }
  };

  const handleRestoreConfirm = async () => {
    if (restoringPayment) {
      await restoreMutation.mutateAsync(restoringPayment.id);
    }
  };

  // Calculations for Summary Cards
  const paymentsList = data?.payments || [];
  const totalAmountSum = paymentsList.reduce((acc, curr) => acc + curr.amount, 0);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(val);
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
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#F97316] text-xs font-bold uppercase tracking-wider">
                <CreditCard className="w-4 h-4" />
                <span>Payments & Settlement Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Payments & Collections
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                Record customer transactions, view payment histories, and track balance dues automatically.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="h-9 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
                title="Refresh Payments"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400 ${isFetching ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>

              <Button
                onClick={handleOpenCreateForm}
                className="h-9 px-4 text-xs font-semibold bg-[#F97316] hover:bg-orange-600 text-white rounded-xl shadow-sm shadow-orange-500/20 shrink-0"
              >
                <Plus className="w-4 h-4 mr-1.5" />
                <span>Record Payment</span>
              </Button>
            </div>
          </div>

          {/* Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Page Payments */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Page Total</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(totalAmountSum)}
              </p>
              <p className="text-[11px] text-slate-400">
                {data?.pagination.total || 0} total records recorded
              </p>
            </div>

            {/* Cash Collections */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Cash & UPI</span>
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-500">
                  <Banknote className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(
                  paymentsList
                    .filter((p) => p.paymentMethod === "CASH" || p.paymentMethod === "UPI")
                    .reduce((acc, curr) => acc + curr.amount, 0)
                )}
              </p>
              <p className="text-[11px] text-slate-400">Instant digital & cash payments</p>
            </div>

            {/* Bank & Card Wire */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Bank & Cards</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Building className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(
                  paymentsList
                    .filter((p) =>
                      ["BANK_TRANSFER", "CREDIT_CARD", "DEBIT_CARD"].includes(p.paymentMethod)
                    )
                    .reduce((acc, curr) => acc + curr.amount, 0)
                )}
              </p>
              <p className="text-[11px] text-slate-400">Direct wire & card settlements</p>
            </div>

            {/* Active Records */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Active State</span>
                <div className="p-2 rounded-xl bg-orange-500/10 text-[#F97316]">
                  <CreditCard className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {isDeleted ? "Trash Mode" : "Active Records"}
              </p>
              <p className="text-[11px] text-slate-400">
                Showing {isDeleted ? "deleted payments" : "valid transactions"}
              </p>
            </div>
          </div>

          {/* Toolbar: SearchBar & FilterBar in Single Responsive Line */}
          <div className="flex items-center gap-2.5 p-3 sm:p-4 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs overflow-x-auto scrollbar-none w-full select-none">
            <div className="w-64 sm:w-72 shrink-0">
              <SearchBar value={search} onChange={(val) => { setSearch(val); setPage(1); }} />
            </div>

            <FilterBar
              paymentMethod={paymentMethod}
              onPaymentMethodChange={(m) => { setPaymentMethod(m); setPage(1); }}
              startDate={startDate}
              onStartDateChange={(d) => { setStartDate(d); setPage(1); }}
              endDate={endDate}
              onEndDateChange={(d) => { setEndDate(d); setPage(1); }}
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
              {error instanceof Error ? error.message : "Failed to load payment records from server."}
            </div>
          ) : paymentsList.length === 0 ? (
            <EmptyState
              title={search || paymentMethod !== "ALL" || isDeleted ? "No Matching Payments Found" : "No Payments Recorded Yet"}
              description={
                search || paymentMethod !== "ALL" || isDeleted
                  ? "No payment records match your active search filters. Try adjusting your search query or resetting filters."
                  : "Start recording customer payments against active invoices to track revenue and balance dues."
              }
              onAction={handleOpenCreateForm}
            />
          ) : (
            <div className="space-y-4">
              <PaymentsTable
                payments={paymentsList}
                onView={(payment) => setViewingPaymentId(payment.id)}
                onEdit={handleOpenEditForm}
                onDelete={(payment) => setDeletingPayment(payment)}
                onRestore={(payment) => setRestoringPayment(payment)}
                onDownloadReceipt={handleDownloadReceipt}
                onPreviewReceipt={handlePreviewReceipt}
                onPrintReceipt={handlePrintReceipt}
                onEmailReceipt={handleEmailReceipt}
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

      {/* Dialog: Create / Edit Payment */}
      <Dialog open={isFormOpen} onOpenChange={(open) => !open && setIsFormOpen(false)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800">
          <DialogHeader className="mb-4">
            <DialogTitle className="text-xl font-black text-slate-900 dark:text-white">
              {editingPayment ? "Edit Payment Record" : "Record Customer Payment"}
            </DialogTitle>
          </DialogHeader>

          <PaymentForm
            initialData={editingPayment}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={createMutation.isPending || updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog: Payment Details */}
      <PaymentDetailsDialog
        paymentId={viewingPaymentId}
        isOpen={!!viewingPaymentId}
        onClose={() => setViewingPaymentId(null)}
        onEdit={handleOpenEditForm}
        onDownloadReceipt={handleDownloadReceipt}
        onPreviewReceipt={handlePreviewReceipt}
        onPrintReceipt={handlePrintReceipt}
        onEmailReceipt={handleEmailReceipt}
      />

      {/* Dialog: Delete Confirmation */}
      <DeleteConfirmationDialog
        payment={deletingPayment}
        isOpen={!!deletingPayment}
        onClose={() => setDeletingPayment(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      {/* Dialog: Restore Confirmation */}
      <RestoreConfirmationDialog
        payment={restoringPayment}
        isOpen={!!restoringPayment}
        onClose={() => setRestoringPayment(null)}
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
        onDownload={() => selectedPaymentForActions && handleDownloadReceipt(selectedPaymentForActions)}
        onPrint={() => selectedPaymentForActions && handlePrintReceipt(selectedPaymentForActions)}
        onEmail={() => {
          setIsPreviewOpen(false);
          if (selectedPaymentForActions) handleEmailReceipt(selectedPaymentForActions);
        }}
      />

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        recipientEmail={selectedPaymentForActions?.invoice?.client?.email}
        recipientName={selectedPaymentForActions?.invoice?.client?.contactPerson || selectedPaymentForActions?.invoice?.client?.companyName}
        documentTitle={`Payment Receipt REC-${selectedPaymentForActions?.id?.slice(-6).toUpperCase() || ""}`}
        onSend={async (email, subject, message) => {
          if (!selectedPaymentForActions) return;
          await sendEmailMutation.mutateAsync({
            id: selectedPaymentForActions.id,
            payload: { recipientEmail: email, subject, message },
          });
        }}
      />
    </div>
  );
};
