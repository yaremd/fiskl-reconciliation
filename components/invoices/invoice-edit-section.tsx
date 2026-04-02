"use client";

import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DatePicker } from "@/components/ui/date-picker";
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

function SectionHeader({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-2.5">
        <span className="h-2 w-2 rounded-full bg-primary/60 shrink-0" />
        <span className="text-lg font-medium text-foreground">{children}</span>
      </div>
      {action}
    </div>
  );
}

function ClientAvatar({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
      : (parts[0]?.[0]?.toUpperCase() ?? "");
  if (!initials) return null;
  return (
    <div className="h-10 w-10 rounded-full bg-primary/10 text-primary text-sm font-semibold flex items-center justify-center shrink-0 ring-2 ring-primary/20 mt-6">
      {initials}
    </div>
  );
}

function CollapsibleItem({
  title,
  defaultOpen = false,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((p) => !p)}
        className="w-full flex items-center justify-between px-4 py-3.5 hover:bg-muted/60 transition-colors"
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

  const statusPill = !isNew ? (
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
        {invoice.status}
      </SelectTrigger>
      <SelectContent>
        {INVOICE_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            <span className={cn("rounded-full px-1.5 py-0.5 text-xs font-medium border", STATUS_COLORS[s])}>
              {s}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : null;

  return (
    <div>
      {/* ── Primary sections — no card borders, dividers only ── */}
      <div className="divide-y divide-border">

        {/* Invoice Details */}
        <div className="pb-6">
          <SectionHeader action={statusPill}>Invoice Details</SectionHeader>

          {/* Invoice # + Currency on same row */}
          <div className="flex gap-2 items-end mb-3">
            <div className="flex-1 space-y-1.5">
              <Label>Invoice Number</Label>
              <Input
                value={invoice.number}
                onChange={(e) => onChange({ number: e.target.value })}
                className="text-xl font-bold tracking-tight"
              />
            </div>
            <div className="w-24 space-y-1.5">
              <Label>Currency</Label>
              <Select value={invoice.currency} onValueChange={(v) => onChange({ currency: v as Currency })}>
                <SelectTrigger>
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

          {/* Issue + Due dates (primary) */}
          <div className="grid grid-cols-2 gap-2 mb-2">
            <div className="space-y-1.5">
              <Label>Issue Date</Label>
              <DatePicker value={invoice.issueDate} onChange={(v) => onChange({ issueDate: v })} />
            </div>
            <div className="space-y-1.5">
              <Label>Due Date</Label>
              <DatePicker value={invoice.dueDate} onChange={(v) => onChange({ dueDate: v })} />
            </div>
          </div>

          {/* Sale date (secondary) */}
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <Label className="text-muted-foreground">Sale Date</Label>
              <DatePicker value={invoice.saleDate} onChange={(v) => onChange({ saleDate: v })} />
            </div>
          </div>
        </div>

        {/* Client */}
        <div className="py-6">
          <SectionHeader>Client</SectionHeader>
          <div className="flex items-start gap-3">
            <ClientAvatar name={invoice.clientName} />
            <div className="flex-1 space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1.5">
                  <Label>Client Name</Label>
                  <Input
                    value={invoice.clientName}
                    onChange={(e) => onChange({ clientName: e.target.value })}
                    placeholder="Client or company name"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Client Email</Label>
                  <Input
                    type="email"
                    value={invoice.clientEmail}
                    onChange={(e) => onChange({ clientEmail: e.target.value })}
                    placeholder="billing@client.com"
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Address</Label>
                <Textarea
                  value={invoice.clientAddress}
                  onChange={(e) => onChange({ clientAddress: e.target.value })}
                  placeholder={"Street\nCity, State ZIP"}
                  className="min-h-[72px] resize-none"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Line Items */}
        <div className="py-6">
          <SectionHeader>Line Items</SectionHeader>
          <InvoiceLineItems
            items={invoice.lineItems}
            currency={invoice.currency}
            onChange={(lineItems) => onChange({ lineItems })}
          />

          {/* Discount + totals */}
          <div className="flex items-center justify-between gap-4 pt-3 mt-3 border-t border-border">
            <div className="flex items-center gap-2">
              <Label className="whitespace-nowrap">Discount</Label>
              <div className="relative w-24">
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={invoice.discountPercent}
                  onChange={(e) => onChange({ discountPercent: parseFloat(e.target.value) || 0 })}
                  className="pr-6"
                />
                <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">%</span>
              </div>
            </div>
            <div className="text-right text-sm space-y-0.5">
              {invoice.discountPercent > 0 && (
                <div className="text-muted-foreground text-xs">
                  Subtotal: <span className="tabular-nums">{fmtCurrency(totals.subtotal, invoice.currency)}</span>
                </div>
              )}
              <div className="font-semibold text-foreground">
                Total: <span className="tabular-nums">{fmtCurrency(totals.total, invoice.currency)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="py-6">
          <SectionHeader>Notes</SectionHeader>
          <Textarea
            value={invoice.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            placeholder="Payment terms, instructions, or any other notes…"
            className="min-h-[80px] resize-none"
          />
        </div>
      </div>

      {/* ── Secondary sections — grouped muted container ── */}
      <div className="mt-2 rounded-xl bg-muted/40 border border-border divide-y divide-border overflow-hidden">
        <CollapsibleItem title="Payments" defaultOpen={invoice.payments.length > 0}>
          <div className="pt-1">
            <InvoicePayments
              invoice={invoice}
              onChange={(payments, history) => onChange({ payments, history })}
            />
          </div>
        </CollapsibleItem>

        <CollapsibleItem title="Email & Reminders">
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
        </CollapsibleItem>

        <CollapsibleItem title="Recurring Schedule" defaultOpen={!!invoice.schedule}>
          <div className="pt-1">
            <InvoiceRecurring
              schedule={invoice.schedule}
              onChange={(schedule) => onChange({ schedule })}
            />
          </div>
        </CollapsibleItem>

        <CollapsibleItem title="Share Link">
          <div className="pt-1">
            <InvoiceShareLink shareToken={invoice.shareToken} invoiceNumber={invoice.number} />
          </div>
        </CollapsibleItem>

        <CollapsibleItem title="History">
          <div className="pt-1">
            <InvoiceHistory history={invoice.history} />
          </div>
        </CollapsibleItem>
      </div>
    </div>
  );
}
