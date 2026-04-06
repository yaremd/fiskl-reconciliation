"use client";

import { useState, useCallback } from "react";
import type { Invoice } from "@/types/invoices";
import { calcInvoiceTotals, calcAmountDue, fmtCurrency } from "@/types/invoices";
import { Copy, Check, Pencil, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ─── Payment method definitions ───────────────────────────────────────────────

type MethodId = "ideal" | "card" | "paypal" | "gocardless" | "googlepay" | "bank";

interface PaymentMethod { id: MethodId; label: string; badge: string }

const METHODS: PaymentMethod[] = [
  { id: "ideal",      label: "iDEAL",        badge: "iDEAL" },
  { id: "card",       label: "Credit Card",  badge: "Visa / MC" },
  { id: "paypal",     label: "PayPal",       badge: "PayPal" },
  { id: "gocardless", label: "GoCardless",   badge: "Direct debit" },
  { id: "googlepay",  label: "Google Pay",   badge: "G Pay" },
  { id: "bank",       label: "Bank Transfer",badge: "SWIFT/ACH" },
];

const BANK_DETAILS = [
  { label: "Payee",      value: "John Smith" },
  { label: "Bank",       value: "Revolut" },
  { label: "IBAN",       value: "DE1234543534353" },
  { label: "Swift code", value: "12643" },
];

// ─── Schedule helpers ─────────────────────────────────────────────────────────

interface ScheduleItem { id: string; label: string; subtitle: string; amount: number }

function buildSchedule(invoice: Invoice): ScheduleItem[] {
  const amountDue = calcAmountDue(invoice);
  if (amountDue <= 0) return [];
  const fmt = (d: Date) =>
    d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });
  if (amountDue > 100) {
    const half = Math.round((amountDue / 2) * 100) / 100;
    const d1 = new Date(), d2 = new Date();
    d2.setDate(d2.getDate() + 30);
    return [
      { id: "pay_1", label: "Payment 1 of 2", subtitle: `Due ${fmt(d1)}`, amount: half },
      { id: "pay_2", label: "Payment 2 of 2", subtitle: `Due ${fmt(d2)}`, amount: Math.round((amountDue - half) * 100) / 100 },
    ];
  }
  return [{ id: "pay_full", label: "Full payment", subtitle: `Due ${fmt(new Date())}`, amount: amountDue }];
}

// ─── Copy button ──────────────────────────────────────────────────────────────

function CopyButton({ value }: { value: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); });
  }, [value]);
  return (
    <button
      onClick={handleCopy}
      className="ml-1.5 p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors cursor-pointer"
      title="Copy"
    >
      {copied ? <Check size={13} className="text-positive" /> : <Copy size={13} />}
    </button>
  );
}

// ─── Radio option ─────────────────────────────────────────────────────────────

function RadioOption({
  id, label, subtitle, amount, currency, selected, onSelect,
}: {
  id: string; label: string; subtitle: string; amount: number;
  currency: string; selected: boolean; onSelect: () => void;
}) {
  return (
    <button
      onClick={onSelect}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all cursor-pointer",
        selected
          ? "border-primary bg-primary/5"
          : "border-border bg-background hover:bg-accent/50"
      )}
    >
      {/* Radio circle */}
      <div className={cn(
        "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
        selected ? "border-primary" : "border-muted-foreground/50"
      )}>
        {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>
      {/* Label */}
      <div className="flex-1 min-w-0">
        <div className={cn("text-sm font-semibold leading-tight", selected ? "text-foreground" : "text-foreground/80")}>
          {label}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
      </div>
      {/* Amount */}
      <span className={cn(
        "text-sm font-bold tabular-nums financial-number shrink-0",
        selected ? "text-primary" : "text-muted-foreground"
      )}>
        {fmtCurrency(amount, currency)}
      </span>
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function InvoicePaymentPanel({ invoice }: { invoice: Invoice }) {
  const totals    = calcInvoiceTotals(invoice);
  const amountDue = calcAmountDue(invoice);
  const amountPaid = totals.total - amountDue;
  const schedule  = buildSchedule(invoice);

  // "full" is always the first option and pre-selected
  const [selectedOption, setSelectedOption] = useState<string>("full");
  const [method, setMethod]                 = useState<MethodId | null>(null);
  const [methodsOpen, setMethodsOpen]       = useState(true);
  const [cardForm, setCardForm]             = useState({ number: "", expiry: "", cvv: "", email: "" });
  const [bankNote, setBankNote]             = useState("");
  const [submitted, setSubmitted]           = useState(false);
  const [showError, setShowError]           = useState(false);

  const effectiveAmt = selectedOption === "full"
    ? amountDue
    : (schedule.find(s => s.id === selectedOption)?.amount ?? amountDue);

  const outstanding = Math.max(0, amountDue - effectiveAmt);

  function selectMethod(id: MethodId) {
    setMethod(id); setMethodsOpen(false); setShowError(false);
  }

  function handleProceed() {
    if (!method) { setShowError(true); return; }
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-20 px-8 text-center">
        <div className="w-14 h-14 rounded-full bg-positive/10 flex items-center justify-center ring-1 ring-positive/20">
          <CheckCircle2 size={28} className="text-positive" />
        </div>
        <div className="space-y-1.5">
          <p className="text-base font-semibold text-foreground">
            {method === "bank" ? "Payment noted — thank you!" : "Payment submitted!"}
          </p>
          <p className="text-sm text-muted-foreground">
            {method === "bank" ? "We'll confirm once the transfer is received." : "You'll receive a confirmation shortly."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 p-4">

      {/* ── Section 1: Amount due ── */}
      <div className="rounded-xl border border-border bg-card px-5 pt-4 pb-4 space-y-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Amount due
          </p>
          <p className="text-4xl font-bold tabular-nums financial-number text-foreground leading-none">
            {fmtCurrency(amountDue, invoice.currency)}
          </p>
        </div>
        <div className="space-y-1.5 pt-0.5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Amount paid</span>
            <span className="text-sm font-medium tabular-nums financial-number">
              {fmtCurrency(amountPaid, invoice.currency)}
            </span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-muted-foreground">Invoice total</span>
            <span className="text-sm font-bold tabular-nums financial-number">
              {fmtCurrency(totals.total, invoice.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Section 2: Payment options ── */}
      <div className="rounded-xl border border-border bg-card px-5 py-4 space-y-2.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pb-0.5">
          Pay in installments
        </p>

        {/* Pay in full — always first, pre-selected */}
        <RadioOption
          id="full"
          label="Pay in full"
          subtitle={`Due now · ${invoice.dueDate ? new Date(invoice.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "immediately"}`}
          amount={amountDue}
          currency={invoice.currency}
          selected={selectedOption === "full"}
          onSelect={() => setSelectedOption("full")}
        />

        {/* Installment options */}
        {schedule.map(item => (
          <RadioOption
            key={item.id}
            id={item.id}
            label={item.label}
            subtitle={item.subtitle}
            amount={item.amount}
            currency={invoice.currency}
            selected={selectedOption === item.id}
            onSelect={() => setSelectedOption(item.id)}
          />
        ))}

        {/* Outstanding after this */}
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5 mt-1">
          <span className="text-sm text-muted-foreground">Outstanding after this</span>
          <span className={cn(
            "text-sm font-bold tabular-nums financial-number",
            outstanding === 0 ? "text-positive" : "text-foreground"
          )}>
            {fmtCurrency(outstanding, invoice.currency)}
          </span>
        </div>
      </div>

      {/* ── Section 3: Pay with ── */}
      <div className="rounded-xl border border-border bg-card px-5 py-4 space-y-2">
        <div className="flex items-center justify-between pb-0.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
            Pay with
          </p>
          {method && !methodsOpen && (
            <button
              onClick={() => setMethodsOpen(true)}
              className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
            >
              <Pencil size={13} />
            </button>
          )}
        </div>

        {methodsOpen || !method ? (
          <div className="space-y-1.5">
            {METHODS.map(m => (
              <button
                key={m.id}
                onClick={() => selectMethod(m.id)}
                className={cn(
                  "w-full flex items-center justify-between px-3.5 py-3 rounded-xl border text-sm font-medium transition-all cursor-pointer",
                  method === m.id
                    ? "border-primary bg-primary/5 ring-1 ring-primary/20"
                    : "border-border bg-background hover:bg-accent"
                )}
              >
                <span className="text-foreground">{m.label}</span>
                <span className={cn(
                  "text-xs font-semibold px-2 py-0.5 rounded-md border",
                  method === m.id
                    ? "border-primary/30 bg-primary/10 text-primary"
                    : "border-border bg-muted text-muted-foreground"
                )}>
                  {m.badge}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            <button
              onClick={() => setMethodsOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border-2 border-primary bg-primary/5 text-sm font-medium text-foreground ring-1 ring-primary/20 cursor-pointer"
            >
              <span>{METHODS.find(m => m.id === method)?.label}</span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md border border-primary/30 bg-primary/10 text-primary">
                {METHODS.find(m => m.id === method)?.badge}
              </span>
            </button>

            {method === "card" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="card-number" className="text-xs text-muted-foreground">Card number</Label>
                  <Input id="card-number" placeholder="1234 5678 9012 3456" value={cardForm.number} maxLength={19}
                    onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 16); setCardForm(p => ({ ...p, number: v.replace(/(.{4})/g, "$1 ").trim() })); }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="card-expiry" className="text-xs text-muted-foreground">MM / YY</Label>
                    <Input id="card-expiry" placeholder="12/27" value={cardForm.expiry} maxLength={5}
                      onChange={e => { const v = e.target.value.replace(/\D/g, "").slice(0, 4); setCardForm(p => ({ ...p, expiry: v.length > 2 ? v.slice(0,2) + "/" + v.slice(2) : v })); }} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="card-cvv" className="text-xs text-muted-foreground">CVV</Label>
                    <Input id="card-cvv" type="password" placeholder="•••" value={cardForm.cvv} maxLength={4}
                      onChange={e => setCardForm(p => ({ ...p, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) }))} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="card-email" className="text-xs text-muted-foreground">Billing contact email</Label>
                  <Input id="card-email" type="email" placeholder="name@example.com" value={cardForm.email}
                    onChange={e => setCardForm(p => ({ ...p, email: e.target.value }))} />
                </div>
              </div>
            )}

            {method === "bank" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/50 p-3.5 space-y-2 text-xs text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground text-sm">Please use this payment method when doing a bank transfer</p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Sign into your bank and choose to make a transfer.</li>
                    <li>The details below are all you need to do the transfer.</li>
                    <li>Use the copy button to copy values to your clipboard.</li>
                    <li>Use the invoice number as a reference to help us reconcile.</li>
                  </ol>
                </div>
                <div className="rounded-lg border border-border divide-y divide-border overflow-hidden">
                  {BANK_DETAILS.map(row => (
                    <div key={row.label} className="flex items-center justify-between px-3.5 py-2.5 bg-background">
                      <span className="text-xs text-muted-foreground w-24">{row.label}</span>
                      <div className="flex items-center">
                        <span className="text-sm font-medium text-foreground">{row.value}</span>
                        <CopyButton value={row.value} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="bank-note" className="text-xs text-muted-foreground">Note for sender</Label>
                  <Textarea id="bank-note" rows={2}
                    placeholder={`Invoice was paid on ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}`}
                    value={bankNote} onChange={e => setBankNote(e.target.value)} className="resize-none text-sm" />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Section 4: Footer / CTA ── */}
      <div className="rounded-xl border border-border bg-card px-5 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Paying today</span>
          <span className="text-2xl font-bold tabular-nums financial-number text-foreground">
            {fmtCurrency(effectiveAmt, invoice.currency)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">A single charge with no additional fees.</p>

        {method === "bank" ? (
          <Button onClick={handleProceed} className="w-full h-11 text-sm">
            Mark as paid
          </Button>
        ) : (
          <Button onClick={handleProceed} className="w-full h-11 text-sm">
            Proceed to payment
          </Button>
        )}

        {showError && (
          <div className="flex items-center gap-2 text-xs bg-warning/10 border border-warning/20 rounded-lg px-3 py-2.5">
            <AlertCircle size={14} className="shrink-0 text-warning" />
            <span className="text-warning">Please select a payment method to proceed</span>
          </div>
        )}

        <div className="text-center pt-0.5">
          <p className="text-xs text-muted-foreground">
            Interested in billing like this?{" "}
            <a href="https://fiskl.com" target="_blank" rel="noopener noreferrer"
              className="text-primary font-medium hover:underline underline-offset-2 transition-colors">
              Try Fiskl free →
            </a>
          </p>
        </div>
      </div>

    </div>
  );
}
