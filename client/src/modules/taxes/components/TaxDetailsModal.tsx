import React from "react";
import {
  Edit2,
  Trash2,
  CheckCircle2,
  XCircle,
  Percent,
  Clock,
  User,
  ShieldCheck,
  History,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "../../../components/ui/dialog";
import { Button } from "../../../components/ui/button";
import { Badge } from "../../../components/ui/badge";
import type { Tax } from "../types/tax.types";

interface TaxDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  tax: Tax | null;
  onEdit: (tax: Tax) => void;
  onToggleStatus: (tax: Tax, newStatus: boolean) => void;
  onDelete: (tax: Tax) => void;
}

export const TaxDetailsModal: React.FC<TaxDetailsModalProps> = ({
  isOpen,
  onClose,
  tax,
  onEdit,
  onToggleStatus,
  onDelete,
}) => {
  if (!tax) return null;

  const formatDate = (dateStr?: string | null) => {
    if (!dateStr) return "N/A";
    return new Date(dateStr).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden rounded-2xl border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-950/40 text-[#F97316] flex items-center justify-center font-bold">
              <Percent className="w-5 h-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>{tax.name}</span>
                <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                  {tax.code}
                </span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Statutory Tax Slab Details & Governance Audit Trail
              </DialogDescription>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6 text-xs overflow-y-auto max-h-[75vh]">
          {/* Top Quick Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Rate / Value</span>
              <p className="text-lg font-black text-slate-900 dark:text-white mt-0.5">
                {tax.valueType === "PERCENTAGE" ? `${tax.rate}%` : `₹${tax.rate.toLocaleString("en-IN")}`}
              </p>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Tax Type</span>
              <p className="text-sm font-bold text-slate-900 dark:text-white mt-1">{tax.type}</p>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</span>
              <div className="mt-1">
                {tax.isActive ? (
                  <Badge className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800 text-[10px]">
                    Active
                  </Badge>
                ) : (
                  <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 text-[10px]">
                    Inactive
                  </Badge>
                )}
              </div>
            </div>

            <div className="p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Default Slab</span>
              <div className="mt-1">
                {tax.isDefault ? (
                  <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-[10px] flex items-center gap-1 w-fit">
                    <ShieldCheck className="w-3 h-3" /> Yes
                  </Badge>
                ) : (
                  <span className="text-slate-400 font-semibold text-xs">No</span>
                )}
              </div>
            </div>
          </div>

          {/* Description & Modules */}
          <div className="space-y-3">
            <div>
              <span className="font-semibold text-slate-500 dark:text-slate-400">Description</span>
              <p className="text-slate-900 dark:text-slate-200 mt-1 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800">
                {tax.description || "No description configured for this tax slab."}
              </p>
            </div>

            <div>
              <span className="font-semibold text-slate-500 dark:text-slate-400">Applicable Modules</span>
              <div className="flex flex-wrap gap-1.5 mt-1.5">
                {tax.applicableModules.map((mod) => (
                  <span
                    key={mod}
                    className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-orange-50/80 dark:bg-orange-950/30 text-[#F97316] border border-orange-200 dark:border-orange-800"
                  >
                    {mod}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Creation & Modify Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30">
            <div className="flex items-start gap-2.5">
              <User className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-500 dark:text-slate-400">Created Information</span>
                <p className="text-slate-900 dark:text-slate-200 font-medium mt-0.5">
                  By: {tax.createdBy || "System Admin"}
                </p>
                <p className="text-slate-400 text-[11px]">{formatDate(tax.createdAt)}</p>
              </div>
            </div>

            <div className="flex items-start gap-2.5">
              <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
              <div>
                <span className="font-semibold text-slate-500 dark:text-slate-400">Last Modified</span>
                <p className="text-slate-900 dark:text-slate-200 font-medium mt-0.5">
                  By: {tax.updatedBy || tax.createdBy || "System Admin"}
                </p>
                <p className="text-slate-400 text-[11px]">{formatDate(tax.updatedAt)}</p>
              </div>
            </div>
          </div>

          {/* Audit Logs */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 font-bold text-slate-900 dark:text-white">
              <History className="w-4 h-4 text-[#F97316]" />
              <span>Audit Log History</span>
            </div>
            {tax.auditLogs && tax.auditLogs.length > 0 ? (
              <div className="space-y-2 border-l-2 border-slate-200 dark:border-slate-800 pl-4 ml-1">
                {tax.auditLogs.map((log) => (
                  <div key={log.id} className="relative pb-1">
                    <div className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-[#F97316]" />
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{log.action}</span>
                      <span className="text-slate-400">{formatDate(log.createdAt)}</span>
                    </div>
                    <p className="text-slate-600 dark:text-slate-400 text-[11px] mt-0.5">{log.details}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-slate-400 italic text-[11px]">No audit log entries available.</p>
            )}
          </div>
        </div>

        {/* Footer Quick Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
          <Button
            variant="ghost"
            onClick={() => {
              onClose();
              onDelete(tax);
            }}
            className="text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-semibold"
          >
            <Trash2 className="w-4 h-4 mr-1.5" /> Delete Tax
          </Button>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => {
                onToggleStatus(tax, !tax.isActive);
              }}
              className="text-xs font-semibold"
            >
              {tax.isActive ? (
                <>
                  <XCircle className="w-4 h-4 mr-1.5 text-amber-500" /> Disable
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" /> Enable
                </>
              )}
            </Button>
            <Button
              onClick={() => {
                onClose();
                onEdit(tax);
              }}
              className="bg-[#F97316] hover:bg-orange-600 text-white text-xs font-semibold"
            >
              <Edit2 className="w-4 h-4 mr-1.5" /> Edit Tax Rate
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
