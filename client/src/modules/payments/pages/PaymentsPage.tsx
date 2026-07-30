import React, { useState } from "react";
import { Sidebar } from "../../../components/layout/Sidebar";
import { Header } from "../../../components/layout/Header";
import type { Payment, PaymentMethod, PaymentStatus } from "../types/payment.types";
import {
  usePaymentsQuery,
  useCreatePaymentMutation,
  useRetryPaymentMutation,
  useDeletePaymentMutation,
  useRestorePaymentMutation,
  useSendPaymentEmailMutation,
} from "../hooks/usePayments";
import { useInvoicesQuery } from "../../invoices/hooks/useInvoices";
import { SearchBar } from "../components/SearchBar";
import { FilterBar } from "../components/FilterBar";
import { PaymentsTable } from "../components/PaymentsTable";
import { AwaitingInvoicesTable } from "../components/AwaitingInvoicesTable";
import { Pagination } from "../components/Pagination";
import { EmptyState } from "../components/EmptyState";
import { LoadingSkeleton } from "../components/LoadingSkeleton";
import { PaymentDetailsDialog } from "../components/PaymentDetailsDialog";
import { DeleteConfirmationDialog } from "../components/DeleteConfirmationDialog";
import { RestoreConfirmationDialog } from "../components/RestoreConfirmationDialog";
import {
  SimulatedPaymentGatewayModal,
  type GatewayInvoiceTarget,
} from "../components/SimulatedPaymentGatewayModal";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import {
  CreditCard,
  TrendingUp,
  Building,
  RefreshCw,
  Clock,
  CheckCircle2,
  Receipt,
} from "lucide-react";
import { DocumentPreviewModal } from "../../../components/common/DocumentPreviewModal";
import { SendEmailModal } from "../../../components/common/SendEmailModal";
import { paymentsApi } from "../api/payments.api";
import { toast } from "sonner";

export const PaymentsPage: React.FC = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Tab Selection State
  const [activeTab, setActiveTab] = useState<"AWAITING" | "HISTORY">("AWAITING");

  // Query Filters & Pagination State
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "ALL">("ALL");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isDeleted, setIsDeleted] = useState(false);
  const [sortBy, setSortBy] = useState<"paymentDate" | "amount" | "createdAt">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Gateway Modal State
  const [gatewayModalOpen, setGatewayModalOpen] = useState(false);
  const [selectedInvoiceForPayment, setSelectedInvoiceForPayment] =
    useState<GatewayInvoiceTarget | null>(null);

  // Dialog States
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

  // Fetch Invoices Awaiting Payment
  const { data: invoicesData, isLoading: isLoadingInvoices, refetch: refetchInvoices } =
    useInvoicesQuery({
      limit: 100,
      isDeleted: false,
    });

  const awaitingInvoices = (invoicesData?.invoices || []).filter(
    (inv) =>
      ["SENT", "PENDING", "OVERDUE", "PARTIALLY_PAID", "VIEWED"].includes(inv.status) &&
      inv.balanceDue > 0
  );

  const pendingBalanceTotal = awaitingInvoices.reduce((a, b) => a + b.balanceDue, 0);

  // Fetch Payments History
  const {
    data: paymentsData,
    isLoading: isLoadingPayments,
    isError,
    error,
    refetch: refetchPayments,
    isFetching: isFetchingPayments,
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
  const createPaymentMutation = useCreatePaymentMutation(() => {
    refetchInvoices();
  });

  const retryPaymentMutation = useRetryPaymentMutation(() => {
    refetchInvoices();
  });

  const deleteMutation = useDeletePaymentMutation(() => {
    setDeletingPayment(null);
    refetchInvoices();
  });

  const restoreMutation = useRestorePaymentMutation(() => {
    setRestoringPayment(null);
    refetchInvoices();
  });

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

  // Gateway Modal Triggers
  const handleOpenGatewayForInvoice = (target: GatewayInvoiceTarget) => {
    setSelectedInvoiceForPayment(target);
    setGatewayModalOpen(true);
  };

  const handleGatewaySubmit = async (params: {
    invoiceId: string;
    amount: number;
    paymentMethod: PaymentMethod;
    status: PaymentStatus;
    referenceNumber: string;
    notes?: string;
    failureReason?: string;
  }) => {
    await createPaymentMutation.mutateAsync({
      invoiceId: params.invoiceId,
      amount: params.amount,
      paymentMethod: params.paymentMethod,
      status: params.status,
      referenceNumber: params.referenceNumber,
      notes: params.notes,
      failureReason: params.failureReason,
    });
  };

  const handleRetryPaymentInTable = (payment: Payment) => {
    if (payment.invoice) {
      handleOpenGatewayForInvoice({
        id: payment.invoice.id,
        number: payment.invoice.number,
        clientName:
          payment.invoice.client?.companyName ||
          payment.invoice.client?.contactPerson ||
          "Client",
        amount: payment.amount,
        currency: payment.invoice.currency,
      });
    } else {
      retryPaymentMutation.mutate({
        id: payment.id,
        payload: { status: "SUCCESS" },
      });
    }
  };

  const handleRefreshStatusInTable = (payment: Payment) => {
    retryPaymentMutation.mutate({
      id: payment.id,
      payload: { status: "SUCCESS" },
    });
  };

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

  // Calculations for KPI Cards
  const paymentsList = paymentsData?.payments || [];
  const successfulPaymentsSum = paymentsList
    .filter((p) => (p.status || "SUCCESS") === "SUCCESS")
    .reduce((acc, curr) => acc + curr.amount, 0);

  const formatCurrency = (val: number, currSymbol: string = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currSymbol,
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
          onRefresh={() => {
            refetchPayments();
            refetchInvoices();
          }}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto select-none">
          {/* Page Header Banner */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#F97316] text-xs font-bold uppercase tracking-wider">
                <CreditCard className="w-4 h-4" />
                <span>Payment Settlement Center</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Payments & Collections
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                Pay outstanding invoices with instant checkout, view transaction logs, and manage payment receipts.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  refetchPayments();
                  refetchInvoices();
                }}
                disabled={isFetchingPayments}
                className="h-9 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
                title="Refresh Data"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400 ${isFetchingPayments ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
            </div>
          </div>

          {/* Clean Minimal Summary KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Revenue Collected */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Revenue Collected</span>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(successfulPaymentsSum)}
              </p>
              <p className="text-[11px] text-slate-400">
                {paymentsList.filter((p) => (p.status || "SUCCESS") === "SUCCESS").length} verified transactions
              </p>
            </div>

            {/* Pending Collections / Outstanding */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Outstanding Dues</span>
                <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {formatCurrency(pendingBalanceTotal)}
              </p>
              <p className="text-[11px] text-slate-400">
                Across {awaitingInvoices.length} unpaid invoices
              </p>
            </div>

            {/* Instant UPI & Digital Wire */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">UPI & Digital Wire</span>
                <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                  <Building className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {formatCurrency(
                  paymentsList
                    .filter((p) => ["UPI", "CREDIT_CARD", "DEBIT_CARD"].includes(p.paymentMethod))
                    .reduce((acc, curr) => acc + curr.amount, 0)
                )}
              </p>
              <p className="text-[11px] text-slate-400">Instant digital checkout payments</p>
            </div>

            {/* Collection Volume info (Replaces Gateway Status KPI) */}
            <div className="p-5 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
              <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
                <span className="text-xs font-bold uppercase tracking-wider">Invoices Handled</span>
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                  <Receipt className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-black text-slate-900 dark:text-white">
                {(invoicesData?.invoices || []).length} Total Invoices
              </p>
              <p className="text-[11px] text-slate-400">
                {(invoicesData?.invoices || []).filter((i) => i.status === "PAID").length} fully paid invoices
              </p>
            </div>
          </div>

          {/* Minimal Tab Bar Navigation */}
          <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab("AWAITING")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                  activeTab === "AWAITING"
                    ? "bg-[#F97316] text-white shadow-xs shadow-orange-500/20"
                    : "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <Clock className="w-3.5 h-3.5" />
                <span>Invoices Awaiting Payment</span>
                <Badge variant="outline" className={`ml-1 text-[10px] px-1.5 py-0 ${activeTab === "AWAITING" ? "bg-white/20 text-white border-transparent" : "bg-amber-500/10 text-amber-600 border-amber-500/30"}`}>
                  {awaitingInvoices.length}
                </Badge>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab("HISTORY")}
                className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 ${
                  activeTab === "HISTORY"
                    ? "bg-[#F97316] text-white shadow-xs shadow-orange-500/20"
                    : "bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                }`}
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Payment History Log</span>
                <Badge variant="outline" className={`ml-1 text-[10px] px-1.5 py-0 ${activeTab === "HISTORY" ? "bg-white/20 text-white border-transparent" : "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"}`}>
                  {paymentsData?.pagination.total || 0}
                </Badge>
              </button>
            </div>
          </div>

          {/* TAB 1: Invoices Awaiting Payment Table */}
          {activeTab === "AWAITING" && (
            <div className="space-y-4">
              <AwaitingInvoicesTable
                invoices={awaitingInvoices}
                isLoading={isLoadingInvoices}
                onPayNow={handleOpenGatewayForInvoice}
              />
            </div>
          )}

          {/* TAB 2: Payment History Dashboard Table & Toolbar */}
          {activeTab === "HISTORY" && (
            <div className="space-y-4">
              {/* Toolbar: SearchBar & FilterBar */}
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
              {isLoadingPayments ? (
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
                      : "Pay an unpaid invoice using the 'Invoices Awaiting Payment' tab to initiate simulated checkout and generate payment history."
                  }
                />
              ) : (
                <div className="space-y-4">
                  <PaymentsTable
                    payments={paymentsList}
                    onView={(payment) => setViewingPaymentId(payment.id)}
                    onDelete={(payment) => setDeletingPayment(payment)}
                    onRestore={(payment) => setRestoringPayment(payment)}
                    onRetryPayment={handleRetryPaymentInTable}
                    onRefreshStatus={handleRefreshStatusInTable}
                    onDownloadReceipt={handleDownloadReceipt}
                    onPreviewReceipt={handlePreviewReceipt}
                    onPrintReceipt={handlePrintReceipt}
                    onEmailReceipt={handleEmailReceipt}
                  />

                  {/* Standard Pagination Component (AGENTS.md pattern) */}
                  {paymentsData?.pagination && (
                    <Pagination
                      pagination={paymentsData.pagination}
                      onPageChange={(newPage) => setPage(newPage)}
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Minimal Simulated Payment Gateway Checkout Modal */}
      <SimulatedPaymentGatewayModal
        isOpen={gatewayModalOpen}
        onClose={() => setGatewayModalOpen(false)}
        invoice={selectedInvoiceForPayment}
        onSubmitPayment={handleGatewaySubmit}
        isLoading={createPaymentMutation.isPending}
      />

      {/* Dialog: Payment Details */}
      <PaymentDetailsDialog
        paymentId={viewingPaymentId}
        isOpen={!!viewingPaymentId}
        onClose={() => setViewingPaymentId(null)}
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
