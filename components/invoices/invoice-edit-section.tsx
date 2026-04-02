"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { STATUS_COLORS, CURRENCIES, INVOICE_STATUSES, calcInvoiceTotals, fmtCurrency } from "@/types/invoices";
import type { Invoice, InvoiceStatus, Currency } from "@/types/invoices";
import { InvoiceLineItems } from "./invoice-line-items";
import { InvoicePayments } from "./invoice-payments";
import { InvoiceEmail } from "./invoice-email";
import { InvoiceRecurring } from "./invoice-recurring";
import { InvoiceShareLink } from "./invoice-share-link";
import { InvoiceHistory } from "./invoice-history";

interface InvoiceEditSectionProps {
  invoice: Invoice;
  isNew: boolean;
  onChange: (patch: Partial<Invoice>) => void;
}

interface CollapsibleCardProps {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}

function CollapsibleCard({ title, defaultOpen = true, children }: CollapsibleCardProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="rounded-lg border border-border bg-card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
      >
        <span className="text-sm font-medium text-foreground">{title}</span>
        {open ? (
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        ) : (
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        )}
      </button>
      {open && <div className="px-4 pb-4">{children}</div>}
    </div>
  );
}

export function InvoiceEditSection({ invoice, isNew, onChange }: InvoiceEditSectionProps) {
  const totals = calcInvoiceTotals(invoice);

  return (
    <div className="space-y-3">
      {/* Basic Info card */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-foreground">Invoice Details</p>
          {!isNew && (
            <Select
              value={invoice.status}
              onValueChange={(v) =>
                onChange({
                  status: v as InvoiceStatus,
                  history: [
                    ...invoice.history,
                    {
                      id: `h_${Date.now()}`,
                      date: new Date().toISOString(),
                      action: `Status changed to ${v}`,
                      by: "You",
                    },
                  ],
                })
              }
            >
              <SelectTrigger
                className={cn(
                  "h-auto w-auto rounded-full border px-2.5 py-0.5 text-xs font-medium gap-1 [&>svg]:h-3 [&>svg]:w-3 focus-visible:ring-1 focus-visible:ring-offset-0",
                  STATUS_COLORS[invoice.status]
                )}
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {INVOICE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className={cn("rounded-full px-2 py-0.5 text-xs font-medium border", STATUS_COLORS[s])}>
                      {s}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2 space-y-1">
            <Label className="text-[11px]">Invoice #</Label>
            <Input
              value={invoice.number}
              onChange={(e) => onChange({ number: e.target.value })}
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Currency</Label>
            <Select value={invoice.currency} onValueChange={(v) => onChange({ currency: v as Currency })}>
              <SelectTrigger className="h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px]">Issue Date</Label>
            <Input type="date" value={invoice.issueDate} onChange={(e) => onChange({ issueDate: e.target.value })} className="h-7 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Due Date</Label>
            <Input type="date" value={invoice.dueDate} onChange={(e) => onChange({ dueDate: e.target.value })} className="h-7 text-xs" />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Sale Date</Label>
            <Input type="date" value={invoice.saleDate} onChange={(e) => onChange({ saleDate: e.target.value })} className="h-7 text-xs" />
          </div>
        </div>
      </div>

      {/* Client card */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">Client</p>
        <div className="grid grid-cols-2 gap-2">
          <div className="space-y-1">
            <Label className="text-[11px]">Client Name</Label>
            <Input
              value={invoice.clientName}
              onChange={(e) => onChange({ clientName: e.target.value })}
              placeholder="Client or company name"
              className="h-7 text-xs"
            />
          </div>
          <div className="space-y-1">
            <Label className="text-[11px]">Client Email</Label>
            <Input
              type="email"
              value={invoice.clientEmail}
              onChange={(e) => onChange({ clientEmail: e.target.value })}
              placeholder="billing@client.com"
              className="h-7 text-xs"
            />
          </div>
        </div>
        <div className="space-y-1">
          <Label className="text-[11px]">Address</Label>
          <Textarea
            value={invoice.clientAddress}
            onChange={(e) => onChange({ clientAddress: e.target.value })}
            placeholder={"Street\nCity, State ZIP"}
            className="text-xs min-h-[52px] resize-none"
          />
        </div>
      </div>

      {/* Line items card */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-3">
        <p className="text-sm font-medium text-foreground">Line Items</p>
        <InvoiceLineItems
          items={invoice.lineItems}
          currency={invoice.currency}
          onChange={(lineItems) => onChange({ lineItems })}
        />

        {/* Discount + totals */}
        <div className="flex items-center justify-between gap-4 pt-1 border-t border-border">
          <div className="flex items-center gap-2">
            <Label className="text-[11px] whitespace-nowrap">Discount</Label>
            <div className="relative w-24">
              <Input
                type="number"
                min={0}
                max={100}
                value={invoice.discountPercent}
                onChange={(e) => onChange({ discountPercent: parseFloat(e.target.value) || 0 })}
                className="h-7 text-xs pr-5"
              />
              <span className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">%</span>
            </div>
          </div>
          <div className="text-right text-xs space-y-0.5">
            {invoice.discountPercent > 0 && (
              <div className="text-muted-foreground text-[11px]">
                Subtotal: <span className="tabular-nums">{fmtCurrency(totals.subtotal, invoice.currency)}</span>
              </div>
            )}
            <div className="font-semibold text-foreground">
              Total: <span className="tabular-nums">{fmtCurrency(totals.total, invoice.currency)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Notes card */}
      <div className="rounded-lg border border-border bg-card p-4 space-y-2">
        <p className="text-sm font-medium text-foreground">Notes</p>
        <Textarea
          value={invoice.notes}
          onChange={(e) => onChange({ notes: e.target.value })}
          placeholder="Payment terms, instructions, or any other notes…"
          className="text-xs min-h-[68px] resize-none"
        />
      </div>

      {/* Payments */}
      <CollapsibleCard title="Payments" defaultOpen={invoice.payments.length > 0}>
        <div className="pt-1">
          <InvoicePayments
            invoice={invoice}
            onChange={(payments, history) => onChange({ payments, history })}
          />
        </div>
      </CollapsibleCard>

      {/* Email */}
      <CollapsibleCard title="Email & Reminders" defaultOpen={false}>
        <div className="pt-1">
          <InvoiceEmail
            emailSubject={invoice.emailSubject}
            emailMessage={invoice.emailMessage}
            overdueReminders={invoice.overdueReminders}
            clientEmail={invoice.clientEmail}
            onSubjectChange={(v) => onChange({ emailSubject: v })}
            onMessageChange={(v) => onChange({ emailMessage: v })}
            onRemindersChange={(v) => onChange({ overdueReminders: v })}
          />
        </div>
      </CollapsibleCard>

      {/* Recurring */}
      <CollapsibleCard title="Recurring Schedule" defaultOpen={!!invoice.schedule}>
        <div className="pt-1">
          <InvoiceRecurring
            schedule={invoice.schedule}
            onChange={(schedule) => onChange({ schedule })}
          />
        </div>
      </CollapsibleCard>

      {/* Share Link */}
      <CollapsibleCard title="Share Link" defaultOpen={false}>
        <div className="pt-1">
          <InvoiceShareLink shareToken={invoice.shareToken} invoiceNumber={invoice.number} />
        </div>
      </CollapsibleCard>

      {/* History */}
      <CollapsibleCard title="History" defaultOpen={false}>
        <div className="pt-1">
          <InvoiceHistory history={invoice.history} />
        </div>
      </CollapsibleCard>
    </div>
  );
}
