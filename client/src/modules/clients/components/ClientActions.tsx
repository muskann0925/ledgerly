import React from "react";
import { MoreHorizontal, Eye, Edit3, Trash2, RotateCcw } from "lucide-react";
import { usePermission } from "../../../hooks/usePermission";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../../../components/ui/dropdown-menu";
import { Button } from "../../../components/ui/button";
import type { Client } from "../types/client.types";

interface ClientActionsProps {
  client: Client;
  onView: (client: Client) => void;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
  onRestore: (client: Client) => void;
}

export const ClientActions: React.FC<ClientActionsProps> = ({
  client,
  onView,
  onEdit,
  onDelete,
  onRestore,
}) => {
  const permission = usePermission();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Open client options menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuItem onClick={() => onView(client)} className="gap-2 text-xs">
          <Eye className="w-3.5 h-3.5 text-blue-500" />
          <span>View Profile</span>
        </DropdownMenuItem>

        {!client.isDeleted && permission.can("clients", "edit") && (
          <DropdownMenuItem onClick={() => onEdit(client)} className="gap-2 text-xs">
            <Edit3 className="w-3.5 h-3.5 text-orange-500" />
            <span>Edit Client</span>
          </DropdownMenuItem>
        )}

        <DropdownMenuSeparator />

        {permission.can("clients", "delete") && (
          client.isDeleted ? (
            <DropdownMenuItem
              onClick={() => onRestore(client)}
              className="gap-2 text-xs text-emerald-600 dark:text-emerald-400 focus:text-emerald-600 focus:bg-emerald-50 dark:focus:bg-emerald-950/30"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Client</span>
            </DropdownMenuItem>
          ) : (
            <DropdownMenuItem
              onClick={() => onDelete(client)}
              className="gap-2 text-xs text-red-600 dark:text-red-400 focus:text-red-600 focus:bg-red-50 dark:focus:bg-red-950/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete Client</span>
            </DropdownMenuItem>
          )
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
