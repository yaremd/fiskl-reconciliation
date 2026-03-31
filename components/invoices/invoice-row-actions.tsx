"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MoreHorizontal, Pencil, Trash2, Copy } from "lucide-react";
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
import { saveInvoice, generateInvoiceId, generateInvoiceNumber } from "@/lib/invoices/invoice-store";
import type { Invoice } from "@/types/invoices";

interface InvoiceRowActionsProps {
  invoice: Invoice;
  onDelete: (id: string) => void;
}

export function InvoiceRowActions({ invoice, onDelete }: InvoiceRowActionsProps) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);

  function handleDuplicate() {
    const newInvoice: Invoice = {
      ...invoice,
      id: generateInvoiceId(),
      number: generateInvoiceNumber(),
      status: "Open",
      createdAt: new Date().toISOString(),
      lineItems: invoice.lineItems.map((li) => ({ ...li, id: `li_${Date.now()}_${Math.random().toString(36).slice(2,6)}` })),
    };
    saveInvoice(newInvoice);
    router.push(`/invoices/${newInvoice.id}/edit`);
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
              This will permanently delete the invoice for {invoice.clientName}. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => { setConfirmOpen(false); onDelete(invoice.id); }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
