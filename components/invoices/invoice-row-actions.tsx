"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, Copy, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
  saveInvoice,
  deleteInvoices,
  generateInvoiceId,
  generateInvoiceNumber,
  generateShareToken,
} from "@/lib/invoices/invoice-store";
import type { Invoice } from "@/types/invoices";

interface InvoiceRowActionsProps {
  invoice: Invoice;
  onDeleted: () => void;
  onDuplicated: () => void;
}

export function InvoiceRowActions({ invoice, onDeleted, onDuplicated }: InvoiceRowActionsProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDuplicate() {
    const newInvoice: Invoice = {
      ...invoice,
      id: generateInvoiceId(),
      number: generateInvoiceNumber(),
      status: "Open",
      payments: [],
      history: [
        {
          id: `h_${Date.now()}`,
          date: new Date().toISOString(),
          action: `Duplicated from ${invoice.number}`,
          by: "You",
        },
      ],
      shareToken: generateShareToken(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lineItems: invoice.lineItems.map((li) => ({
        ...li,
        id: `li_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      })),
    };
    saveInvoice(newInvoice);
    onDuplicated();
    router.push(`/invoices/${newInvoice.id}/edit`);
  }

  function handleMarkSent() {
    const updated: Invoice = {
      ...invoice,
      status: "Sent",
      updatedAt: new Date().toISOString(),
      history: [
        ...invoice.history,
        {
          id: `h_${Date.now()}`,
          date: new Date().toISOString(),
          action: "Marked as Sent",
          by: "You",
        },
      ],
    };
    saveInvoice(updated);
    onDeleted(); // refresh
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => router.push(`/invoices/${invoice.id}/edit`)}>
            <Pencil className="mr-2 h-3.5 w-3.5" />
            Edit
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDuplicate}>
            <Copy className="mr-2 h-3.5 w-3.5" />
            Duplicate
          </DropdownMenuItem>
          {invoice.status === "Open" && (
            <DropdownMenuItem onClick={handleMarkSent}>
              <Send className="mr-2 h-3.5 w-3.5" />
              Mark as Sent
            </DropdownMenuItem>
          )}
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onClick={() => setConfirmOpen(true)}
          >
            <Trash2 className="mr-2 h-3.5 w-3.5" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete {invoice.number}?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the invoice for {invoice.clientName || "this client"}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => {
                setConfirmOpen(false);
                deleteInvoices([invoice.id]);
                onDeleted();
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
