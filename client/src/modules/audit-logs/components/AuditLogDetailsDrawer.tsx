import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../../../components/ui/dialog";
import type { AuditLogItem } from "../types/auditLog.types";
import { JsonDiffViewer } from "./JsonDiffViewer";
import { ShieldCheck, ShieldAlert, User, Laptop, Globe, Calendar, Tag, Layers, FileText } from "lucide-react";

interface AuditLogDetailsDrawerProps {
  log: AuditLogItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AuditLogDetailsDrawer: React.FC<AuditLogDetailsDrawerProps> = ({
  log,
  isOpen,
  onClose,
}) => {
  if (!log) return null;

  const isSuccess = log.status === "SUCCESS";
  const formattedDate = new Date(log.createdAt).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "medium",
  });

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl w-full max-h-[90vh] flex flex-col p-0 overflow-hidden bg-white dark:bg-[#111827] border-slate-200 dark:border-slate-800 shadow-2xl rounded-2xl">
        {/* Header Banner */}
        <DialogHeader className="p-5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/50 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                isSuccess
                  ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                  : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
              }`}
            >
              {isSuccess ? <ShieldCheck className="w-5 h-5" /> : <ShieldAlert className="w-5 h-5" />}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase bg-orange-100 dark:bg-orange-950/60 text-[#F97316]">
                  {log.module}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase ${
                    isSuccess
                      ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                      : "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                  }`}
                >
                  {log.status}
                </span>
              </div>
              <DialogTitle className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                {log.action}
              </DialogTitle>
            </div>
          </div>
        </DialogHeader>

        {/* Drawer Body - Scrollable */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs">
          {/* Action Description */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 space-y-1">
            <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase">
              <FileText className="w-3.5 h-3.5 text-[#F97316]" />
              <span>Event Description</span>
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-relaxed">
              {log.description}
            </p>
          </div>

          {/* User Snapshot & Timestamp Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* User Snapshot */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>User Snapshot</span>
              </div>
              <div className="space-y-1 pt-1">
                <p className="font-bold text-slate-900 dark:text-white text-xs">
                  {log.userName || log.user?.name || "System Automated Process"}
                </p>
                {log.userEmail && (
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] truncate">
                    {log.userEmail}
                  </p>
                )}
                {log.role && (
                  <span className="inline-block mt-1 text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    Role: {log.role}
                  </span>
                )}
              </div>
            </div>

            {/* Timestamp & IP Details */}
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase">
                <Calendar className="w-3.5 h-3.5 text-amber-500" />
                <span>Execution Context</span>
              </div>
              <div className="space-y-1 pt-1 text-slate-700 dark:text-slate-300">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-slate-500 text-[11px]">Time:</span>
                  <span className="font-mono text-[11px]">{formattedDate}</span>
                </div>
                {log.ipAddress && (
                  <div className="flex items-center gap-1.5">
                    <Globe className="w-3 h-3 text-slate-400" />
                    <span className="font-semibold text-slate-500 text-[11px]">IP:</span>
                    <span className="font-mono text-[11px] text-slate-900 dark:text-slate-100">{log.ipAddress}</span>
                  </div>
                )}
                {log.userAgent && (
                  <div className="flex items-center gap-1.5 pt-0.5">
                    <Laptop className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="font-mono text-[10px] text-slate-500 truncate" title={log.userAgent}>
                      {log.userAgent}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Entity Snapshot (if applicable) */}
          {(log.entityType || log.entityId || log.entityName) && (
            <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] space-y-2">
              <div className="flex items-center gap-1.5 text-slate-400 text-[11px] font-semibold uppercase">
                <Layers className="w-3.5 h-3.5 text-sky-500" />
                <span>Target Entity Reference</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Entity Type</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">{log.entityType || "System"}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-slate-400 text-[10px] block">Entity Name / Reference</span>
                  <span className="font-bold text-[#F97316] truncate block" title={log.entityName || log.description}>
                    {log.entityName || log.description}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* JSON Difference Viewer (Rendered only when state snapshot exists) */}
          {((log.oldValue && Object.keys(log.oldValue).length > 0) ||
            (log.newValue && Object.keys(log.newValue).length > 0)) && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center gap-1.5 text-slate-500 dark:text-slate-400 text-xs font-bold uppercase tracking-wider">
                <Tag className="w-3.5 h-3.5 text-[#F97316]" />
                <span>State Audit Comparison (Old vs. New)</span>
              </div>
              <JsonDiffViewer oldValue={log.oldValue} newValue={log.newValue} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
