import React, { useState } from "react";
import { Sidebar } from "../../../components/layout/Sidebar";
import { Header } from "../../../components/layout/Header";
import { SearchBar } from "../components/SearchBar";
import { FilterBar, type FilterStatus } from "../components/FilterBar";
import { ClientTable } from "../components/ClientTable";
import { TableLoadingSkeleton } from "../components/LoadingSkeleton";
import { EmptyState } from "../components/EmptyState";
import { Pagination } from "../components/Pagination";
import { ClientForm } from "../components/ClientForm";
import { ClientDetailsDialog } from "../components/ClientDetailsDialog";
import { DeleteConfirmationDialog } from "../components/DeleteConfirmationDialog";
import { RestoreConfirmationDialog } from "../components/RestoreConfirmationDialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import {
  useClientsQuery,
  useCreateClientMutation,
  useUpdateClientMutation,
  useDeleteClientMutation,
  useRestoreClientMutation,
  useSendClientEmailMutation,
} from "../hooks/useClients";
import type { Client, ClientType, ClientQueryParams } from "../types/client.types";
import { DocumentPreviewModal } from "../../../components/common/DocumentPreviewModal";
import { SendEmailModal } from "../../../components/common/SendEmailModal";
import { clientsApi } from "../api/clients.api";
import { toast } from "sonner";
import type { ClientFormValues } from "../validation/client.schema";
import { UserPlus, Users, AlertCircle, RefreshCw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { usePermission } from "../../../hooks/usePermission";

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const permission = usePermission();

  // Search & Filter state
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<FilterStatus>("ALL");
  const [typeFilter, setTypeFilter] = useState<"ALL" | ClientType>("ALL");
  const [sortBy, setSortBy] = useState<"companyName" | "createdAt" | "status" | "email">("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal / Dialog States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [viewingClientId, setViewingClientId] = useState<string | null>(null);
  const [deletingClient, setDeletingClient] = useState<Client | null>(null);
  const [restoringClient, setRestoringClient] = useState<Client | null>(null);

  // Document Actions States
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewTitle, setPreviewTitle] = useState("");
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);
  const [selectedClientForActions, setSelectedClientForActions] = useState<Client | null>(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);

  const sendEmailMutation = useSendClientEmailMutation(() => {
    setIsEmailModalOpen(false);
  });

  // Statement Handlers
  const handleDownloadStatement = async (client: Client) => {
    try {
      toast.info(`Preparing account statement for ${client.companyName}...`);
      const blob = await clientsApi.getStatementPdfBlob(client.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Statement-${client.companyName.replace(/\s+/g, "_")}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Downloaded statement for ${client.companyName}`);
    } catch {
      toast.error("Failed to download client statement PDF");
    }
  };

  const handlePreviewStatement = async (client: Client) => {
    setSelectedClientForActions(client);
    setPreviewTitle(`Account Statement - ${client.companyName}`);
    setIsPreviewOpen(true);
    setIsPreviewLoading(true);
    try {
      const blob = await clientsApi.getStatementPdfBlob(client.id);
      setPreviewBlob(blob);
    } catch {
      toast.error("Failed to load account statement preview");
    } finally {
      setIsPreviewLoading(false);
    }
  };

  const handlePrintStatement = async (client: Client) => {
    try {
      toast.info(`Generating print version of statement for ${client.companyName}...`);
      const blob = await clientsApi.getStatementPdfBlob(client.id);
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
      toast.error("Failed to generate printable account statement");
    }
  };

  const handleEmailStatement = (client: Client) => {
    setSelectedClientForActions(client);
    setIsEmailModalOpen(true);
  };

  // Build query params for backend API
  const queryParams: ClientQueryParams = {
    page,
    limit,
    search: search.trim() || undefined,
    sortBy,
    sortOrder,
  };

  if (statusFilter === "ACTIVE") {
    queryParams.status = "ACTIVE";
    queryParams.isDeleted = false;
  } else if (statusFilter === "DELETED") {
    queryParams.isDeleted = true;
  } else if (statusFilter === "ALL") {
    // If status filter is ALL, request all records
    queryParams.isDeleted = false;
  }

  if (typeFilter !== "ALL") {
    queryParams.clientType = typeFilter;
  }

  // TanStack Query & Mutations
  const { data, isLoading, isError, error, refetch } = useClientsQuery(queryParams);

  const createMutation = useCreateClientMutation(() => {
    setIsCreateModalOpen(false);
  });

  const updateMutation = useUpdateClientMutation(() => {
    setEditingClient(null);
  });

  const deleteMutation = useDeleteClientMutation(() => {
    setDeletingClient(null);
  });

  const restoreMutation = useRestoreClientMutation(() => {
    setRestoringClient(null);
  });

  // Event Handlers
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    setPage(1); // Reset pagination on search change
  };

  const handleStatusFilterChange = (newStatus: FilterStatus) => {
    setStatusFilter(newStatus);
    setPage(1);
  };

  const handleTypeFilterChange = (newType: "ALL" | ClientType) => {
    setTypeFilter(newType);
    setPage(1);
  };

  const handleSortByChange = (newSortBy: "companyName" | "createdAt" | "status" | "email") => {
    setSortBy(newSortBy);
  };

  const handleSortOrderToggle = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("ALL");
    setTypeFilter("ALL");
    setSortBy("createdAt");
    setSortOrder("desc");
    setPage(1);
  };

  const isFilteredOrSorted =
    !!search || statusFilter !== "ALL" || typeFilter !== "ALL" || sortBy !== "createdAt" || sortOrder !== "desc";

  const handleCreateSubmit = async (values: ClientFormValues) => {
    await createMutation.mutateAsync({
      companyName: values.companyName,
      clientType: values.clientType,
      contactPerson: values.contactPerson,
      email: values.email,
      phone: values.phone,
      gstNumber: values.gstNumber || null,
      panNumber: values.panNumber || null,
      billingAddress: values.billingAddress || null,
      shippingAddress: values.shippingAddress || null,
      status: values.status,
      notes: values.notes || null,
    });
  };

  const handleEditSubmit = async (values: ClientFormValues) => {
    if (!editingClient) return;
    await updateMutation.mutateAsync({
      id: editingClient.id,
      payload: {
        companyName: values.companyName,
        clientType: values.clientType,
        contactPerson: values.contactPerson,
        email: values.email,
        phone: values.phone,
        gstNumber: values.gstNumber || null,
        panNumber: values.panNumber || null,
        billingAddress: values.billingAddress || null,
        shippingAddress: values.shippingAddress || null,
        status: values.status,
        notes: values.notes || null,
      },
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deletingClient) return;
    await deleteMutation.mutateAsync(deletingClient.id);
  };

  const handleRestoreConfirm = async () => {
    if (!restoringClient) return;
    await restoreMutation.mutateAsync(restoringClient.id);
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
          onOpenCreateInvoice={() => navigate("/dashboard")}
          onOpenCreateClient={() => setIsCreateModalOpen(true)}
          onRefresh={refetch}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        <main className="flex-1 p-3 sm:p-6 lg:p-8 space-y-6 max-w-[1600px] w-full mx-auto">
          {/* Page Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#111827] p-5 sm:p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-[#F97316] text-xs font-bold uppercase tracking-wider">
                <Users className="w-4 h-4" />
                <span>Client Management Directory</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                Client Directory
              </h1>
              <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm">
                Manage corporate and individual billing accounts, GSTIN profiles, and contact details.
              </p>
            </div>

            <div className="flex items-center gap-2.5 flex-wrap shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isLoading}
                className="h-9 px-3.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-xs"
                title="Refresh Client Directory"
              >
                <RefreshCw className={`w-3.5 h-3.5 mr-1.5 text-slate-500 dark:text-slate-400 ${isLoading ? "animate-spin" : ""}`} />
                <span>Refresh</span>
              </Button>
              {permission.can("clients", "create") && (
                <Button
                  onClick={() => setIsCreateModalOpen(true)}
                  className="h-9 px-4 text-xs font-semibold bg-[#F97316] hover:bg-orange-600 text-white rounded-xl shadow-sm shadow-orange-500/20 shrink-0"
                >
                  <UserPlus className="w-4 h-4 mr-1.5" />
                  <span>Add New Client</span>
                </Button>
              )}
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
              typeFilter={typeFilter}
              onTypeChange={handleTypeFilterChange}
              sortBy={sortBy}
              onSortByChange={handleSortByChange}
              sortOrder={sortOrder}
              onSortOrderToggle={handleSortOrderToggle}
              onResetFilters={handleResetFilters}
              isFilteredOrSorted={isFilteredOrSorted}
              clientsData={data?.clients}
            />
          </div>

          {/* Error Banner */}
          {isError && (
            <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-300 text-xs flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                <span>
                  {error instanceof Error ? error.message : "Failed to load clients list from server."}
                </span>
              </div>
              <Button size="sm" variant="outline" onClick={() => refetch()} className="rounded-xl text-xs">
                <RefreshCw className="w-3.5 h-3.5 mr-1" />
                Retry
              </Button>
            </div>
          )}

          {/* Main Table / Skeleton / Empty View */}
          {isLoading ? (
            <TableLoadingSkeleton rowCount={limit} />
          ) : !data || data.clients.length === 0 ? (
            <EmptyState
              isSearchOrFilterActive={isFilteredOrSorted}
              onCreateClient={() => setIsCreateModalOpen(true)}
              onClearFilters={handleResetFilters}
            />
          ) : (
            <div className="space-y-4">
              <ClientTable
                clients={data.clients}
                onView={(c) => setViewingClientId(c.id)}
                onEdit={(c) => setEditingClient(c)}
                onDelete={(c) => setDeletingClient(c)}
                onRestore={(c) => setRestoringClient(c)}
              />

              <Pagination
                pagination={data.pagination}
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

      {/* Create Client Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Add New Client Profile
            </DialogTitle>
            <DialogDescription>
              Register a corporate or individual client profile in the billing database.
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            onSubmit={handleCreateSubmit}
            onCancel={() => setIsCreateModalOpen(false)}
            isLoading={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Client Modal */}
      <Dialog open={!!editingClient} onOpenChange={(open) => !open && setEditingClient(null)}>
        <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-slate-900 dark:text-white">
              Edit Client Profile
            </DialogTitle>
            <DialogDescription>
              Update account details for {editingClient?.companyName}.
            </DialogDescription>
          </DialogHeader>
          <ClientForm
            initialData={editingClient}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditingClient(null)}
            isLoading={updateMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Client Profile Details Dialog */}
      <ClientDetailsDialog
        clientId={viewingClientId}
        isOpen={!!viewingClientId}
        onClose={() => setViewingClientId(null)}
        onEdit={(c) => setEditingClient(c)}
        onDelete={(c) => setDeletingClient(c)}
        onRestore={(c) => setRestoringClient(c)}
        onDownloadStatement={handleDownloadStatement}
        onPreviewStatement={handlePreviewStatement}
        onPrintStatement={handlePrintStatement}
        onEmailStatement={handleEmailStatement}
      />

      {/* Soft Delete Confirmation Dialog */}
      <DeleteConfirmationDialog
        client={deletingClient}
        isOpen={!!deletingClient}
        onClose={() => setDeletingClient(null)}
        onConfirm={handleDeleteConfirm}
        isLoading={deleteMutation.isPending}
      />

      {/* Restore Confirmation Dialog */}
      <RestoreConfirmationDialog
        client={restoringClient}
        isOpen={!!restoringClient}
        onClose={() => setRestoringClient(null)}
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
        onDownload={() => selectedClientForActions && handleDownloadStatement(selectedClientForActions)}
        onPrint={() => selectedClientForActions && handlePrintStatement(selectedClientForActions)}
        onEmail={() => {
          setIsPreviewOpen(false);
          if (selectedClientForActions) handleEmailStatement(selectedClientForActions);
        }}
      />

      {/* Send Email Modal */}
      <SendEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        recipientEmail={selectedClientForActions?.email}
        recipientName={selectedClientForActions?.contactPerson || selectedClientForActions?.companyName}
        documentTitle={`Account Statement for ${selectedClientForActions?.companyName || ""}`}
        onSend={async (email, subject, message) => {
          if (!selectedClientForActions) return;
          await sendEmailMutation.mutateAsync({
            id: selectedClientForActions.id,
            payload: { recipientEmail: email, subject, message },
          });
        }}
      />
    </div>
  );
};
