import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Card, CardContent } from "../../../components/ui/card";
import { Badge } from "../../../components/ui/badge";
import { Button } from "../../../components/ui/button";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Separator } from "../../../components/ui/separator";
import { Skeleton } from "../../../components/ui/skeleton";
import type { Client } from "../types/client.types";
import {
  Mail,
  Phone,
  Edit3,
  Trash2,
  RotateCcw,
  Building2,
  MapPin,
  FileText,
  Calendar,
  Clock,
  CreditCard,
  Download,
  Printer,
  Eye,
} from "lucide-react";

import { useClientDetailsQuery } from "../hooks/useClients";

interface ClientDetailsDialogProps {
  client?: Client | null;
  clientId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (client: Client) => void;
  onDelete?: (client: Client) => void;
  onRestore?: (client: Client) => void;
  onDownloadStatement?: (client: Client) => void;
  onPreviewStatement?: (client: Client) => void;
  onPrintStatement?: (client: Client) => void;
  onEmailStatement?: (client: Client) => void;
  isLoading?: boolean;
}

export const ClientDetailsDialog: React.FC<ClientDetailsDialogProps> = ({
  client: propClient,
  clientId,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onRestore,
  onDownloadStatement,
  onPreviewStatement,
  onPrintStatement,
  onEmailStatement,
  isLoading: propIsLoading = false,
}) => {
  const { data: fetchedClient, isLoading: isQueryLoading } = useClientDetailsQuery(
    clientId ?? null
  );

  const client = propClient || fetchedClient || null;
  const isLoading = propIsLoading || (!!clientId && isQueryLoading);
  const getInitials = (name?: string) => {
    if (!name) return "CL";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return "N/A";
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? "N/A"
      : date.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "short",
          year: "numeric",
        });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 rounded-2xl bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-2xl overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-200 dark:border-slate-800 shrink-0 bg-white dark:bg-[#111827]">
          <DialogTitle className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Client Profile</span>
          </DialogTitle>
          <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Comprehensive account records, billing info, and linked transaction history.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-6 text-xs">
          {isLoading ? (
            <ClientDetailsSkeleton />
          ) : !client ? (
            <div className="p-8 text-center text-xs text-slate-500 dark:text-slate-400">
              Client details not found.
            </div>
          ) : (
            <div className="space-y-5">
              {/* Header Identity Card */}
            <Card className="bg-slate-50/90 dark:bg-slate-900/90 border-slate-200 dark:border-slate-800">
              <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-center gap-3.5 min-w-0">
                  <Avatar className="h-12 w-12 sm:h-14 sm:w-14 border-2 border-[#F97316] bg-orange-100 dark:bg-orange-950/80 text-[#F97316] shrink-0">
                    <AvatarFallback className="text-sm sm:text-base font-extrabold text-[#F97316]">
                      {getInitials(client.contactPerson || client.companyName)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate">
                        {client.companyName}
                      </h2>
                      {client.isDeleted ? (
                        <Badge
                          variant="outline"
                          className="bg-red-50 text-red-700 dark:bg-red-950/70 dark:text-red-300 border-red-200 dark:border-red-900/60 text-[10px] uppercase font-bold"
                        >
                          Deleted
                        </Badge>
                      ) : client.status === "ACTIVE" ? (
                        <Badge
                          variant="outline"
                          className="bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60 text-[10px] uppercase font-bold"
                        >
                          Active
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 text-[10px] uppercase font-bold"
                        >
                          Inactive
                        </Badge>
                      )}
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 font-semibold flex items-center gap-1.5 flex-wrap">
                      <span>Contact Person:</span>
                      <span className="text-slate-900 dark:text-white font-bold">
                        {client.contactPerson}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span>{client.clientType === "INDIVIDUAL" ? "Individual" : "Business Account"}</span>
                    </p>
                  </div>
                </div>

                {/* Header Action Buttons - Gracefully Wrapped & Spaced */}
                <div className="flex items-center gap-2 w-full md:w-auto justify-start md:justify-end flex-wrap pt-2 md:pt-0 border-t md:border-t-0 border-slate-200/80 dark:border-slate-800">
                  {onDownloadStatement && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onDownloadStatement(client)}
                      className="rounded-xl text-xs font-semibold px-2.5 py-1.5 h-8"
                    >
                      <Download className="w-3.5 h-3.5 mr-1" />
                      Statement
                    </Button>
                  )}

                  {onPreviewStatement && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPreviewStatement(client)}
                      className="rounded-xl text-xs font-semibold px-2.5 py-1.5 h-8"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1" />
                      Preview
                    </Button>
                  )}

                  {onPrintStatement && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onPrintStatement(client)}
                      className="rounded-xl text-xs font-semibold px-2.5 py-1.5 h-8"
                    >
                      <Printer className="w-3.5 h-3.5 mr-1" />
                      Print
                    </Button>
                  )}

                  {onEmailStatement && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onEmailStatement(client)}
                      className="rounded-xl text-xs font-semibold px-2.5 py-1.5 h-8"
                    >
                      <Mail className="w-3.5 h-3.5 mr-1" />
                      Email
                    </Button>
                  )}

                  {!client.isDeleted && onEdit && (
                    <Button
                      size="sm"
                      onClick={() => {
                        onClose();
                        onEdit(client);
                      }}
                      className="rounded-xl text-xs font-bold bg-[#F97316] hover:bg-[#EA580C] text-white shadow-xs px-3 py-1.5 h-8 flex items-center gap-1.5"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Edit Profile</span>
                    </Button>
                  )}

                  {client.isDeleted && onRestore && (
                    <Button
                      size="sm"
                      onClick={() => {
                        onClose();
                        onRestore(client);
                      }}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs"
                    >
                      <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
                      Restore
                    </Button>
                  )}

                  {!client.isDeleted && onDelete && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        onClose();
                        onDelete(client);
                      }}
                      className="rounded-xl text-xs text-red-600 dark:text-red-400 hover:text-red-700 border-red-200 dark:border-red-900/60 hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      Delete
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Contact & Tax Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">
                    Contact Info
                  </h4>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <Mail className="w-4 h-4 text-[#F97316] shrink-0" />
                      <a href={`mailto:${client.email}`} className="font-semibold hover:underline">
                        {client.email}
                      </a>
                    </div>

                    <div className="flex items-center gap-2 text-slate-800 dark:text-slate-200">
                      <Phone className="w-4 h-4 text-[#F97316] shrink-0" />
                      <span className="font-mono">{client.phone}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
                <CardContent className="p-4 space-y-3">
                  <h4 className="font-bold text-slate-700 dark:text-slate-300 text-xs uppercase tracking-wider">
                    Tax Identifiers
                  </h4>

                  <div className="space-y-2 font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400 font-sans font-medium">GSTIN:</span>
                      {client.gstNumber ? (
                        <span className="font-bold text-[#F97316] bg-orange-50 dark:bg-orange-950/60 px-2 py-0.5 rounded-lg border border-orange-200 dark:border-orange-900/60">
                          {client.gstNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 font-sans italic">Not specified</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 dark:text-slate-400 font-sans font-medium">PAN:</span>
                      {client.panNumber ? (
                        <span className="font-bold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded-lg">
                          {client.panNumber}
                        </span>
                      ) : (
                        <span className="text-slate-400 dark:text-slate-500 font-sans italic">Not specified</span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Addresses Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                    <MapPin className="w-4 h-4 text-orange-500" />
                    <span>Billing Address</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed pl-5 font-medium">
                    {client.billingAddress || "No registered billing address provided."}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
                <CardContent className="p-4 space-y-2">
                  <div className="flex items-center gap-1.5 text-slate-900 dark:text-white font-bold">
                    <Building2 className="w-4 h-4 text-orange-500" />
                    <span>Shipping Address</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed pl-5 font-medium">
                    {client.shippingAddress || "Same as billing address."}
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Internal Notes */}
            {client.notes && (
              <Card className="bg-white dark:bg-slate-900/80 border-slate-200 dark:border-slate-800">
                <CardContent className="p-4 space-y-1.5">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900 dark:text-white">
                    <FileText className="w-4 h-4 text-orange-500" />
                    <span>Internal Remarks & Notes</span>
                  </div>
                  <p className="text-slate-700 dark:text-slate-200 whitespace-pre-line pl-5 font-medium">
                    {client.notes}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Linked Recent Invoices if available */}
            {client.invoices && client.invoices.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#F97316]" />
                  <span>Recent Invoices ({client.invoices.length})</span>
                </h4>
                <div className="space-y-1.5">
                  {client.invoices.map((inv) => {
                    const invoiceAmount = typeof inv.total === "number" ? inv.total : (typeof inv.amount === "number" ? inv.amount : 0);
                    const formattedAmount = invoiceAmount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });

                    return (
                      <div
                        key={inv.id}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/60 flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            #{inv.number}
                          </span>
                          <span className="text-[10px] text-slate-500 dark:text-slate-400">
                            {formatDate(inv.createdAt)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-slate-900 dark:text-white font-mono">
                            ₹{formattedAmount}
                          </span>
                          <Badge
                            variant="outline"
                            className={
                              inv.status === "PAID"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/70 dark:text-emerald-300 border-emerald-200 dark:border-emerald-900/60 text-[10px]"
                                : inv.status === "OVERDUE"
                                ? "bg-red-50 text-red-700 dark:bg-red-950/70 dark:text-red-300 border-red-200 dark:border-red-900/60 text-[10px]"
                                : "bg-amber-50 text-amber-700 dark:bg-amber-950/70 dark:text-amber-300 border-amber-200 dark:border-amber-900/60 text-[10px]"
                            }
                          >
                            {inv.status}
                          </Badge>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <Separator className="bg-slate-200 dark:bg-slate-800" />

            {/* Timestamps Footer */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-slate-400 font-semibold pt-1">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Created: {formatDate(client.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                Last Updated: {formatDate(client.updatedAt)}
              </span>
            </div>
          </div>
        )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const ClientDetailsSkeleton: React.FC = () => (
  <div className="space-y-4">
    <Skeleton className="h-20 w-full rounded-2xl bg-slate-100 dark:bg-slate-800" />
    <div className="grid grid-cols-2 gap-3">
      <Skeleton className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />
      <Skeleton className="h-24 rounded-2xl bg-slate-100 dark:bg-slate-800" />
    </div>
    <Skeleton className="h-16 w-full rounded-2xl bg-slate-100 dark:bg-slate-800" />
  </div>
);
