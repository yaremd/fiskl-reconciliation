"use client";

import { ArrowLeft, Trash2, Send } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
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
import { useState } from "react";
import { fmtCurrency, calcInvoiceTotals } from "@/types/invoices";
import type { Invoice } from "@/types/invoices";

interface InvoiceActionBarProps {
  invoice: Invoice;
  isNew: boolean;
  hasUnsaved: boolean;
  saving: boolean;
  onBack: () => void;
  onSave: () => void;
  onSend: () => void;
  onDelete: () => void;
}

export function InvoiceActionBar({
  invoice,
  isNew,
  hasUnsaved,
  saving,
  onBack,
  onSave,
  onSend,
  onDelete,
}: InvoiceActionBarProps) {
  const { state, isMobile } = useSidebar();
  const [showBackDialog, setShowBackDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const sidebarOffset = isMobile
    ? "0px"
    : state === "expanded"
    ? "var(--sidebar-width)"
    : "var(--sidebar-width-icon)";

  const totals = calcInvoiceTotals(invoice);

  function handleBack() {
    if (hasUnsaved) {
      setShowBackDialog(true);
    } else {
      onBack();
    }
  }

  return (
    <>
      <div
        className="fixed bottom-0 right-0 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between z-30"
        style={{ left: `calc(${sidebarOffset} + 1px)` }}
      >
        {/* Left: Cancel + Delete */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleBack}
          >
            Cancel
          </Button>
          {!isNew && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setShowDeleteDialog(true)}
              className="text-destructive border-destructive/30 hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Center: total amount — larger */}
        <div className="flex flex-col items-center">
          {hasUnsaved && (
            <span className="text-[10px] text-muted-foreground uppercase tracking-wider hidden sm:block">Unsaved</span>
          )}
          <div className="text-xl font-bold tabular-nums text-foreground">
            {fmtCurrency(totals.total, invoice.currency)}
          </div>
        </div>

        {/* Right: Save + Send */}
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onSave}
            disabled={saving}
          >
            {saving ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            onClick={onSend}
            disabled={saving || !invoice.clientName}
            className="gap-1.5"
          >
            <Send className="h-4 w-4" />
            {invoice.status === "Open" ? "Send" : "Re-send"}
          </Button>
        </div>
      </div>

      {/* Unsaved changes confirm */}
      <AlertDialog open={showBackDialog} onOpenChange={setShowBackDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Leave without saving?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction onClick={onBack}>Leave</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirm */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete invoice?</AlertDialogTitle>
            <AlertDialogDescription>
              Delete <strong>{invoice.number}</strong>? This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={onDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
