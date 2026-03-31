"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useSidebar } from "@/components/ui/sidebar";
import {
  getInvoice,
  saveInvoice,
  generateInvoiceId,
  generateInvoiceNumber,
} from "@/lib/invoices/invoice-store";
import {
  calcInvoiceTotals,
  CURRENCIES,
  CURRENCY_SYMBOLS,
  TAX_RATES,
} from "@/types/invoices";
import type { Invoice, InvoiceLineItem, InvoiceStatus, Currency } from "@/types/invoices";

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  Open:     "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900",
  Sent:     "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-900",
  Overdue:  "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900",
  Partial:  "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900",
  Paid:     "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900",
  Rejected: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900",
};

function newLineItem(): InvoiceLineItem {
  return {
    id: `li_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    description: "",
    quantity: 1,
    unitPrice: 0,
    taxRate: 0,
  };
}

function today() {
  return new Date().toISOString().split("T")[0];
}

function defaultDueDate() {
  const d = new Date();
  d.setDate(d.getDate() + 30);
  return d.toISOString().split("T")[0];
}

interface InvoiceFormProps {
  id?: string;
}

export function InvoiceForm({ id }: InvoiceFormProps) {
  const router = useRouter();
  const { state, isMobile } = useSidebar();
  const isNew = !id;

  const sidebarOffset = isMobile
    ? "0px"
    : state === "expanded"
    ? "var(--sidebar-width)"
    : "var(--sidebar-width-icon)";

  // Form state
  const [number, setNumber] = useState("");
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [currency, setCurrency] = useState<Currency>("USD");
  const [issueDate, setIssueDate] = useState(today());
  const [dueDate, setDueDate] = useState(defaultDueDate());
  const [lineItems, setLineItems] = useState<InvoiceLineItem[]>([newLineItem()]);
  const [notes, setNotes] = useState("");
  const [status, setStatus] = useState<InvoiceStatus>("Open");
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (isNew) {
      setNumber(generateInvoiceNumber());
      return;
    }
    const inv = getInvoice(id);
    if (!inv) { router.replace("/invoices"); return; }
    setNumber(inv.number);
    setClientName(inv.clientName);
    setClientEmail(inv.clientEmail);
    setCurrency(inv.currency);
    setIssueDate(inv.issueDate);
    setDueDate(inv.dueDate);
    setLineItems(inv.lineItems.length ? inv.lineItems : [newLineItem()]);
    setNotes(inv.notes);
    setStatus(inv.status);
  }, [id, isNew, router]);

  // Line item helpers
  const updateLineItem = (idx: number, patch: Partial<InvoiceLineItem>) => {
    setLineItems((prev) => prev.map((li, i) => i === idx ? { ...li, ...patch } : li));
  };
  const addLineItem = () => setLineItems((prev) => [...prev, newLineItem()]);
  const removeLineItem = (idx: number) => {
    setLineItems((prev) => prev.length > 1 ? prev.filter((_, i) => i !== idx) : prev);
  };

  const { subtotal, taxTotal, total } = calcInvoiceTotals(lineItems);
  const sym = CURRENCY_SYMBOLS[currency] ?? currency;

  function fmt(n: number) {
    return sym + n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function validate(): boolean {
    const e: Record<string, string> = {};
    if (!clientName.trim()) e.clientName = "Client name is required";
    if (!issueDate) e.issueDate = "Issue date is required";
    if (!dueDate) e.dueDate = "Due date is required";
    if (lineItems.every((li) => !li.description.trim())) e.lineItems = "At least one line item is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit() {
    if (!validate()) return;
    setSaving(true);
    const invoice: Invoice = {
      id: id ?? generateInvoiceId(),
      number,
      clientName: clientName.trim(),
      clientEmail: clientEmail.trim(),
      currency,
      issueDate,
      dueDate,
      lineItems: lineItems.filter((li) => li.description.trim()),
      notes: notes.trim(),
      status,
      createdAt: isNew ? new Date().toISOString() : (getInvoice(id!)?.createdAt ?? new Date().toISOString()),
    };
    saveInvoice(invoice);
    router.push("/invoices");
  }

  return (
    <div className="max-w-3xl w-full mx-auto pb-24 space-y-4">

      {/* Client Information */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-medium text-foreground">Client Information</p>
          {!isNew && (
            <Select value={status} onValueChange={(v) => setStatus(v as InvoiceStatus)}>
              <SelectTrigger
                id="status"
                className={cn(
                  "h-auto w-auto rounded-full border px-2.5 py-0.5 text-xs font-medium gap-1 [&>svg]:h-3 [&>svg]:w-3",
                  "focus-visible:ring-1 focus-visible:ring-offset-0",
                  STATUS_CLASSES[status],
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="Sent">Sent</SelectItem>
                <SelectItem value="Overdue">Overdue</SelectItem>
                <SelectItem value="Partial">Partial</SelectItem>
                <SelectItem value="Paid">Paid</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="clientName">Client Name <span className="text-destructive">*</span></Label>
            <Input
              id="clientName"
              placeholder="e.g. Acme Corp"
              value={clientName}
              onChange={(e) => { setClientName(e.target.value); setErrors((p) => ({ ...p, clientName: "" })); }}
              className={errors.clientName ? "border-destructive" : ""}
            />
            {errors.clientName && <p className="text-xs text-destructive">{errors.clientName}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="clientEmail">Client Email</Label>
            <Input
              id="clientEmail"
              type="email"
              placeholder="billing@client.com"
              value={clientEmail}
              onChange={(e) => setClientEmail(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Invoice Details */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <p className="text-lg font-medium text-foreground">Invoice Details</p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="number">Invoice #</Label>
            <Input id="number" value={number} onChange={(e) => setNumber(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={(v) => setCurrency(v as Currency)}>
              <SelectTrigger id="currency"><SelectValue /></SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>{c} {CURRENCY_SYMBOLS[c]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="issueDate">Issue Date <span className="text-destructive">*</span></Label>
            <Input
              id="issueDate"
              type="date"
              value={issueDate}
              onChange={(e) => { setIssueDate(e.target.value); setErrors((p) => ({ ...p, issueDate: "" })); }}
              className={errors.issueDate ? "border-destructive" : ""}
            />
            {errors.issueDate && <p className="text-xs text-destructive">{errors.issueDate}</p>}
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="dueDate">Due Date <span className="text-destructive">*</span></Label>
            <Input
              id="dueDate"
              type="date"
              value={dueDate}
              onChange={(e) => { setDueDate(e.target.value); setErrors((p) => ({ ...p, dueDate: "" })); }}
              className={errors.dueDate ? "border-destructive" : ""}
            />
            {errors.dueDate && <p className="text-xs text-destructive">{errors.dueDate}</p>}
          </div>
        </div>
      </div>

      {/* Line Items */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <p className="text-lg font-medium text-foreground">Line Items</p>

        {errors.lineItems && <p className="text-xs text-destructive">{errors.lineItems}</p>}

        <div className="overflow-x-auto -mx-1">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="pb-2 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground pl-1 w-full">Description</th>
                <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground px-2 min-w-[64px]">Qty</th>
                <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground px-2 min-w-[96px]">Unit Price</th>
                <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground px-2 min-w-[80px]">Tax %</th>
                <th className="pb-2 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground px-2 min-w-[96px]">Total</th>
                <th className="pb-2 w-8" />
              </tr>
            </thead>
            <tbody>
              {lineItems.map((li, idx) => {
                const lineTotal = li.quantity * li.unitPrice * (1 + li.taxRate / 100);
                return (
                  <tr key={li.id} className="border-b last:border-0 group">
                    <td className="py-2 pl-1 pr-2">
                      <Input
                        placeholder="Description of service or product"
                        value={li.description}
                        onChange={(e) => { updateLineItem(idx, { description: e.target.value }); setErrors((p) => ({ ...p, lineItems: "" })); }}
                        className="h-9"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        value={li.quantity}
                        onChange={(e) => updateLineItem(idx, { quantity: parseFloat(e.target.value) || 0 })}
                        className="h-9 text-right w-16"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Input
                        type="number"
                        min="0"
                        step="0.01"
                        value={li.unitPrice}
                        onChange={(e) => updateLineItem(idx, { unitPrice: parseFloat(e.target.value) || 0 })}
                        className="h-9 text-right w-24"
                      />
                    </td>
                    <td className="py-2 px-2">
                      <Select
                        value={String(li.taxRate)}
                        onValueChange={(v) => updateLineItem(idx, { taxRate: parseFloat(v) })}
                      >
                        <SelectTrigger className="h-9 w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TAX_RATES.map((r) => (
                            <SelectItem key={r} value={String(r)}>{r}%</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="py-2 px-2 text-right tabular-nums font-medium whitespace-nowrap">
                      {fmt(lineTotal)}
                    </td>
                    <td className="py-2 pl-1">
                      <button
                        type="button"
                        onClick={() => removeLineItem(idx)}
                        disabled={lineItems.length === 1}
                        className="h-9 w-8 flex items-center justify-center text-muted-foreground hover:text-destructive disabled:opacity-30 transition-colors"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <button
          type="button"
          onClick={addLineItem}
          className="flex items-center gap-1.5 text-sm text-primary hover:underline"
        >
          <PlusCircle className="h-4 w-4" />
          Add line item
        </button>

        {/* Totals */}
        <div className="border-t pt-4 flex justify-end">
          <div className="space-y-1.5 min-w-[220px]">
            {[
              { label: "Subtotal", value: fmt(subtotal) },
              { label: "Tax", value: fmt(taxTotal) },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between text-sm text-muted-foreground">
                <span>{label}</span>
                <span className="tabular-nums">{value}</span>
              </div>
            ))}
            <div className="flex justify-between text-base font-semibold border-t pt-1.5 mt-1.5">
              <span>Total</span>
              <span className="tabular-nums">{fmt(total)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes */}
      <div className="rounded-xl border border-border bg-card p-4 space-y-4">
        <p className="text-lg font-medium text-foreground">Notes</p>
        <Textarea
          placeholder="Payment instructions, terms, thank-you message…"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
        />
      </div>

      {/* Bottom action bar */}
      <div
        className="fixed bottom-0 right-0 z-30 flex items-center justify-between border-t border-border bg-background px-6 py-4"
        style={{ left: sidebarOffset }}
      >
        <Button variant="outline" onClick={() => router.push("/invoices")} disabled={saving}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} disabled={saving} className="min-w-[140px]">
          {saving ? "Saving…" : isNew ? "Create Invoice" : "Save Changes"}
        </Button>
      </div>
    </div>
  );
}
