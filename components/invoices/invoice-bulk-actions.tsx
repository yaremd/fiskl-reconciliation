"use client";

import { useState } from "react";
import { Trash2, X, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { INVOICE_STATUSES, STATUS_COLORS } from "@/types/invoices";
import type { InvoiceStatus } from "@/types/invoices";

interface InvoiceBulkActionsProps {
  selectedIds: string[];
  onDelete: (ids: string[]) => void;
  onStatusChange: (ids: string[], status: InvoiceStatus) => void;
  onClear: () => void;
}

export function InvoiceBulkActions({
  selectedIds,
  onDelete,
  onStatusChange,
  onClear,
}: InvoiceBulkActionsProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmStatus, setConfirmStatus] = useState<InvoiceStatus | null>(null);
  const count = selectedIds.length;

  return (
    <>
      <div className="flex items-center gap-3">
        <span className="text-sm font-medium">{count} selected</span>

        <div className="flex items-center gap-2 ml-auto">
          {/* Change status */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1 text-xs">
                Set Status
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {INVOICE_STATUSES.map((s) => (
                <DropdownMenuItem key={s} onClick={() => setConfirmStatus(s)}>
                  <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", STATUS_COLORS[s])}>
                    {s}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Delete */}
          <Button
            variant="outline"
            size="sm"
            className="h-7 gap-1.5 text-xs text-destructive border-destructive/30 hover:bg-destructive/5"
            onClick={() => setConfirmDelete(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>

          <Button variant="ghost" size="sm" onClick={onClear} className="h-7 w-7 p-0">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Delete confirm */}
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {count} invoice{count !== 1 ? "s" : ""}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the selected invoice{count !== 1 ? "s" : ""}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => { setConfirmDelete(false); onDelete(selectedIds); }}
            >
              Delete {count}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Status change confirm */}
      <AlertDialog open={!!confirmStatus} onOpenChange={() => setConfirmStatus(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Change status to {confirmStatus}?</AlertDialogTitle>
            <AlertDialogDescription>
              Update {count} invoice{count !== 1 ? "s" : ""} to{" "}
              <span className={cn("rounded-full border px-1.5 py-0.5 text-[11px] font-semibold", confirmStatus ? STATUS_COLORS[confirmStatus] : "")}>
                {confirmStatus}
              </span>
              ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmStatus) onStatusChange(selectedIds, confirmStatus);
                setConfirmStatus(null);
              }}
            >
              Update {count}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
