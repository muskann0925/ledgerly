import React from "react";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
} from "../../../components/ui/table";
import { ClientRow } from "./ClientRow";
import type { Client } from "../types/client.types";

interface ClientTableProps {
  clients: Client[];
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onRestore: (client: Client) => void;
}

export const ClientTable: React.FC<ClientTableProps> = ({
  clients,
  onView,
  onEdit,
  onDelete,
  onRestore,
}) => {
  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111827] shadow-xs overflow-hidden">
      <Table>
        <TableHeader className="bg-slate-50/80 dark:bg-slate-800/40">
          <TableRow>
            <TableHead className="w-[200px]">Client Name</TableHead>
            <TableHead className="w-[180px]">Company</TableHead>
            <TableHead className="w-[200px]">Email</TableHead>
            <TableHead className="w-[140px]">Phone</TableHead>
            <TableHead className="w-[160px]">GST Number</TableHead>
            <TableHead className="w-[100px]">Status</TableHead>
            <TableHead className="w-[120px]">Created Date</TableHead>
            <TableHead className="w-[80px] text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.map((client) => (
            <ClientRow
              key={client.id}
              client={client}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              onRestore={onRestore}
            />
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
