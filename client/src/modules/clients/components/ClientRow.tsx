import React from "react";
import { TableRow, TableCell } from "../../../components/ui/table";
import { Avatar, AvatarFallback } from "../../../components/ui/avatar";
import { Badge } from "../../../components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../../../components/ui/tooltip";
import { ClientActions } from "./ClientActions";
import type { Client } from "../types/client.types";

interface ClientRowProps {
  client: Client;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onRestore: (client: Client) => void;
}

export const ClientRow: React.FC<ClientRowProps> = ({
  client,
  onView,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const getInitials = (name: string) => {
    if (!name) return "CL";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <TableRow className={client.isDeleted ? "opacity-60 bg-slate-50/50 dark:bg-slate-900/30" : ""}>
      {/* Contact Person / Client Name */}
      <TableCell className="font-medium">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-orange-200 dark:border-orange-950 bg-orange-50 dark:bg-orange-950/40 text-[#F97316]">
            <AvatarFallback className="text-xs font-extrabold">
              {getInitials(client.contactPerson || client.companyName)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col min-w-0">
            <button
              onClick={() => onView(client)}
              className="text-left font-bold text-slate-900 dark:text-white hover:text-[#F97316] dark:hover:text-[#F97316] truncate text-xs transition-colors"
            >
              {client.contactPerson}
            </button>
            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
              {client.clientType === "INDIVIDUAL" ? "Individual" : "Business Account"}
            </span>
          </div>
        </div>
      </TableCell>

      {/* Company Name */}
      <TableCell>
        <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[160px] block">
          {client.companyName}
        </span>
      </TableCell>

      {/* Email */}
      <TableCell>
        <a
          href={`mailto:${client.email}`}
          className="text-slate-600 dark:text-slate-400 hover:underline hover:text-[#F97316] truncate max-w-[170px] block"
          title={client.email}
        >
          {client.email}
        </a>
      </TableCell>

      {/* Phone */}
      <TableCell>
        <span className="text-slate-600 dark:text-slate-400 font-mono text-[11px]">
          {client.phone}
        </span>
      </TableCell>

      {/* GST Number */}
      <TableCell>
        {client.gstNumber ? (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="inline-flex items-center font-mono text-[11px] font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <span>{client.gstNumber}</span>
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-[11px]">GSTIN Verified</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ) : (
          <span className="text-slate-400 dark:text-slate-600 italic text-[11px]">N/A</span>
        )}
      </TableCell>

      {/* Status Badge */}
      <TableCell>
        {client.isDeleted ? (
          <Badge variant="outline" className="bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 border-red-200 dark:border-red-900 text-[10px] uppercase tracking-wider font-bold">
            Deleted
          </Badge>
        ) : client.status === "ACTIVE" ? (
          <Badge variant="outline" className="bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900 text-[10px] uppercase tracking-wider font-bold">
            Active
          </Badge>
        ) : (
          <Badge variant="outline" className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 text-[10px] uppercase tracking-wider font-bold">
            Inactive
          </Badge>
        )}
      </TableCell>

      {/* Created Date */}
      <TableCell className="text-slate-500 dark:text-slate-400 font-medium text-[11px] whitespace-nowrap">
        {formatDate(client.createdAt)}
      </TableCell>

      {/* Actions Dropdown */}
      <TableCell className="text-right">
        <ClientActions
          client={client}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          onRestore={onRestore}
        />
      </TableCell>
    </TableRow>
  );
};
