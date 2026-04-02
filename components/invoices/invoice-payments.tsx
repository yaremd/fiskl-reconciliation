"use client";

import { useState } from "react";
import { PlusCircle, Trash2, CheckCircle2, Clock, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
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
import { cn } from "@/lib/utils";
import {
  calcAmountDue,
  calcInvoiceTotals,
  fmtCurrency,
  PAYMENT_METHODS,
} from "@/types/invoices";
import type { Invoice, InvoicePayment, PaymentMethod } from "@/types/invoices";

interface InvoicePaymentsProps {
  invoice: Invoice;
  onChange: (payments: InvoicePayment[], history: Invoice["history"]) => void;
}

function today() {
  return new Date().toISOString().split("T")[0];
}

const PAYMENT_STATUS_ICON: Record<string, React.ReactNode> = {
  Paid:    <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />,
  Pending: <Clock        className="h-3.5 w-3.5 text-yellow-500" />,
  Failed:  <XCircle      className="h-3.5 w-3.5 text-red-500" />,
};

const PAYMENT_STATUS_CLASS: Record<string, string> = {
  Paid:    "text-green-700 bg-green-50 border-green-200",
  Pending: "text-yellow-700 bg-yellow-50 border-yellow-200",
  Failed:  "text-red-700 bg-red-50 border-red-200",
};

export function InvoicePayments({ invoice, onChange }: InvoicePaymentsProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Add form state
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<PaymentMethod>("Bank Transfer");
  const [paymentDate, setPaymentDate] = useState(today());
  const [note, setNote] = useState("");

  const totals = calcInvoiceTotals(invoice);
  const amountDue = calcAmountDue(invoice);
  const totalPaid = invoice.payments
    .filter((p) => p.status === "Paid")
    .reduce((s, p) => s + p.amount, 0);

  function handleAdd() {
    const amt = parseFloat(amount);
    if (!amt || amt <= 0) return;
    const newPayment: InvoicePayment = {
      id: `pay_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
      amount: amt,
      currency: invoice.currency,
      paymentDate,
      method,
      note,
      status: "Paid",
      createdAt: new Date().toISOString(),
    };
    const newHistory = [
      ...invoice.history,
      {
        id: `h_${Date.now()}`,
        date: new Date().toISOString(),
        action: `Payment of ${fmtCurrency(amt, invoice.currency)} recorded`,
        by: "You",
      },
    ];
    onChange([...invoice.payments, newPayment], newHistory);
    setAmount("");
    setNote("");
    setPaymentDate(today());
    setShowAdd(false);
  }

  function handleDelete(id: string) {
    const p = invoice.payments.find((x) => x.id === id);
    const newPayments = invoice.payments.filter((x) => x.id !== id);
    const newHistory = [
      ...invoice.history,
      {
        id: `h_${Date.now()}`,
        date: new Date().toISOString(),
        action: p ? `Payment of ${fmtCurrency(p.amount, invoice.currency)} removed` : "Payment removed",
        by: "You",
      },
    ];
    onChange(newPayments, newHistory);
    setDeleteId(null);
  }

  return (
    <div className="space-y-3">
      {/* Summary */}
      <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1.5">
        {[
          { label: "Invoice Total", value: fmtCurrency(totals.total, invoice.currency) },
          { label: "Total Paid",    value: fmtCurrency(totalPaid, invoice.currency),     className: "text-positive" },
          { label: "Amount Due",    value: fmtCurrency(amountDue, invoice.currency),     className: amountDue > 0 ? "font-semibold text-foreground" : "text-positive" },
        ].map((row) => (
          <div key={row.label} className="flex justify-between text-xs">
            <span className="text-muted-foreground">{row.label}</span>
            <span className={cn("tabular-nums", row.className)}>{row.value}</span>
          </div>
        ))}
      </div>

      {/* Payment list */}
      {invoice.payments.map((p) => (
        <div key={p.id} className="rounded-lg border border-border bg-card p-3 space-y-1">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {PAYMENT_STATUS_ICON[p.status]}
              <span className={cn(
                "rounded-full border px-2 py-0.5 text-[10px] font-semibold",
                PAYMENT_STATUS_CLASS[p.status]
              )}>
                {p.status}
              </span>
              <span className="text-xs font-medium text-muted-foreground truncate">{p.method}</span>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs font-semibold tabular-nums">{fmtCurrency(p.amount, p.currency)}</span>
              <button
                type="button"
                onClick={() => setDeleteId(p.id)}
                className="p-1 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
          <div className="flex gap-3 text-[11px] text-muted-foreground">
            <span>{p.paymentDate}</span>
            {p.note && <span className="truncate">· {p.note}</span>}
          </div>
        </div>
      ))}

      {/* Add payment form */}
      {showAdd ? (
        <div className="rounded-lg border border-primary/30 bg-primary/5 p-3 space-y-3">
          <p className="text-xs font-semibold text-foreground">Record Payment</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label className="text-[11px]">Amount</Label>
              <Input
                type="number"
                min={0}
                step="any"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Max ${fmtCurrency(amountDue, invoice.currency)}`}
                className="h-7 text-xs"
                autoFocus
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px]">Date</Label>
              <Input
                type="date"
                value={paymentDate}
                onChange={(e) => setPaymentDate(e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Method</Label>
            <Select value={method} onValueChange={(v) => setMethod(v as PaymentMethod)}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Note (optional)</Label>
            <Input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Bank ref #12345"
              className="h-7 text-xs"
            />
          </div>
          <div className="flex gap-2">
            <Button type="button" size="sm" className="h-7 text-xs flex-1" onClick={handleAdd}
              disabled={!amount || parseFloat(amount) <= 0}>
              Record Payment
            </Button>
            <Button type="button" variant="outline" size="sm" className="h-7 text-xs"
              onClick={() => setShowAdd(false)}>
              Cancel
            </Button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowAdd(true)}
          disabled={amountDue <= 0}
          className={cn(
            "flex items-center gap-1.5 text-xs font-medium transition-colors",
            amountDue > 0
              ? "text-primary hover:text-primary/80"
              : "text-muted-foreground cursor-not-allowed"
          )}
        >
          <PlusCircle className="h-3.5 w-3.5" />
          Record payment
        </button>
      )}

      {/* Delete confirm */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove payment?</AlertDialogTitle>
            <AlertDialogDescription>
              This payment record will be removed from the invoice history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={() => deleteId && handleDelete(deleteId)}
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
