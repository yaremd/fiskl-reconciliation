"use client";

import { useState, useCallback } from "react";
import type { Invoice } from "@/types/invoices";
import { calcInvoiceTotals, calcAmountDue, fmtCurrency, CURRENCY_SYMBOLS } from "@/types/invoices";
import { Copy, Check, Pencil, AlertCircle, CheckCircle2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

// ─── Payment method logos ──────────────────────────────────────────────────────

function IdealLogo() {
  return (
    <svg width="48" height="20" viewBox="0 0 48 20" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="15" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="16" fill="#CC0066">i</text>
      <text x="10" y="15" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="15" fill="#000000">DEAL</text>
    </svg>
  );
}

function VisaLogo() {
  return (
    <svg width="44" height="16" viewBox="0 0 44 16" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="14" fontFamily="Arial, Helvetica, sans-serif" fontWeight="900" fontSize="15" fontStyle="italic" letterSpacing="-0.5" fill="#1A1F71">VISA</text>
    </svg>
  );
}

function MastercardLogo() {
  return (
    <svg width="36" height="22" viewBox="0 0 36 22" xmlns="http://www.w3.org/2000/svg">
      <circle cx="13" cy="11" r="10" fill="#EB001B" />
      <circle cx="23" cy="11" r="10" fill="#F79E1B" />
      <path d="M18 3.8 C20.8 6 22 8.4 22 11 C22 13.6 20.8 16 18 18.2 C15.2 16 14 13.6 14 11 C14 8.4 15.2 6 18 3.8Z" fill="#FF5F00" />
    </svg>
  );
}

function PayPalLogo() {
  return (
    <svg width="56" height="18" viewBox="0 0 56 18" xmlns="http://www.w3.org/2000/svg">
      <text x="0" y="14" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="14" fill="#003087">Pay</text>
      <text x="24" y="14" fontFamily="Arial, Helvetica, sans-serif" fontWeight="700" fontSize="14" fill="#009CDE">Pal</text>
    </svg>
  );
}

function GoCardlessLogo() {
  return (
    <span className="text-[13px] font-bold leading-none tracking-tight" style={{ color: "#1B2B4B" }}>
      Go<span style={{ color: "#00B56A" }}>Card</span>less
    </span>
  );
}

function GooglePayLogo() {
  return (
    <span className="text-[13px] font-semibold leading-none">
      <span style={{ color: "#4285F4", fontWeight: 700 }}>G</span>
      <span style={{ color: "#34A853", fontWeight: 700 }}>o</span>
      <span style={{ color: "#FBBC04", fontWeight: 700 }}>o</span>
      <span style={{ color: "#EA4335", fontWeight: 700 }}>g</span>
      <span style={{ color: "#4285F4", fontWeight: 700 }}>l</span>
      <span style={{ color: "#34A853", fontWeight: 700 }}>e</span>
      <span className="text-foreground/70"> Pay</span>
    </span>
  );
}

function BankTransferLogo() {
  return (
    <span className="flex items-center gap-1.5 text-[13px] font-medium text-muted-foreground">
      <Building2 size={14} />
      Bank transfer
    </span>
  );
}

// ─── Payment method definitions ───────────────────────────────────────────────

type MethodId = "ideal" | "card" | "paypal" | "gocardless" | "googlepay" | "bank";

interface PaymentMethod {
  id: MethodId;
  label: string;
  Logo: () => React.ReactElement;
}

const METHODS: PaymentMethod[] = [
  { id: "ideal",      label: "iDEAL",         Logo: IdealLogo },
  { id: "card",       label: "Credit Card",   Logo: () => <span className="flex items-center gap-2"><VisaLogo /><MastercardLogo /></span> },
  { id: "paypal",     label: "PayPal",        Logo: PayPalLogo },
  { id: "gocardless", label: "GoCardless",    Logo: GoCardlessLogo },
  { id: "googlepay",  label: "Google Pay",    Logo: GooglePayLogo },
  { id: "bank",       label: "Bank Transfer", Logo: BankTransferLogo },
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
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
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
  id, label, subtitle, amount, currency, selected, onSelect, hideAmount,
}: {
  id: string; label: string; subtitle: string; amount: number;
  currency: string; selected: boolean; onSelect: () => void; hideAmount?: boolean;
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
      <div className={cn(
        "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
        selected ? "border-primary" : "border-muted-foreground/50"
      )}>
        {selected && <div className="w-2 h-2 rounded-full bg-primary" />}
      </div>
      <div className="flex-1 min-w-0">
        <div className={cn("text-sm font-semibold leading-tight", selected ? "text-foreground" : "text-foreground/80")}>
          {label}
        </div>
        <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>
      </div>
      {!hideAmount && (
        <span className={cn(
          "text-sm font-bold tabular-nums financial-number shrink-0",
          selected ? "text-primary" : "text-muted-foreground"
        )}>
          {fmtCurrency(amount, currency)}
        </span>
      )}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function InvoicePaymentPanel({ invoice }: { invoice: Invoice }) {
  const totals     = calcInvoiceTotals(invoice);
  const amountDue  = calcAmountDue(invoice);
  const amountPaid = totals.total - amountDue;
  const schedule   = buildSchedule(invoice);
  const currSym    = CURRENCY_SYMBOLS[invoice.currency] ?? invoice.currency + " ";

  const [selectedOption, setSelectedOption] = useState<string>("full");
  const [customAmount, setCustomAmount]     = useState<string>("");
  const [method, setMethod]                 = useState<MethodId | null>(null);
  const [methodsOpen, setMethodsOpen]       = useState(true);
  const [cardForm, setCardForm]             = useState({ number: "", expiry: "", cvv: "", email: "" });
  const [bankNote, setBankNote]             = useState("");
  const [submitted, setSubmitted]           = useState(false);
  const [showError, setShowError]           = useState(false);

  const parsedCustom = parseFloat(customAmount.replace(/,/g, "")) || 0;

  const effectiveAmt =
    selectedOption === "full"   ? amountDue :
    selectedOption === "custom" ? Math.min(parsedCustom, amountDue) :
    (schedule.find(s => s.id === selectedOption)?.amount ?? amountDue);

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
    <div className="flex flex-col gap-3">

      {/* ── Section 1: Amount due ── */}
      <div className="rounded-xl border border-border bg-card shadow-sm px-5 pt-4 pb-4 space-y-3">
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
      <div className="rounded-xl border border-border bg-card shadow-sm px-5 py-4 space-y-2.5">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground pb-0.5">
          Pay in installments
        </p>

        {/* Pay in full */}
        <RadioOption
          id="full"
          label="Pay in full"
          subtitle={`Due now · ${invoice.dueDate
            ? new Date(invoice.dueDate + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" })
            : "immediately"}`}
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

        {/* Custom amount */}
        <RadioOption
          id="custom"
          label="Custom amount"
          subtitle="Enter the amount you'd like to pay"
          amount={0}
          currency={invoice.currency}
          selected={selectedOption === "custom"}
          onSelect={() => setSelectedOption("custom")}
          hideAmount
        />

        {selectedOption === "custom" && (
          <div className="px-1 pt-0.5 pb-1">
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-muted-foreground pointer-events-none select-none">
                {currSym}
              </span>
              <Input
                className="pl-8 text-base font-semibold tabular-nums h-11"
                placeholder="0.00"
                inputMode="decimal"
                value={customAmount}
                autoFocus
                onChange={e => {
                  const raw = e.target.value.replace(/[^0-9.]/g, "");
                  setCustomAmount(raw);
                }}
              />
              {parsedCustom > amountDue && (
                <p className="text-xs text-destructive mt-1.5 ml-0.5">
                  Amount cannot exceed {fmtCurrency(amountDue, invoice.currency)}
                </p>
              )}
            </div>
          </div>
        )}

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
      <div className="rounded-xl border border-border bg-card shadow-sm px-5 py-4 space-y-2">
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
                <m.Logo />
              </button>
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Selected method row */}
            <button
              onClick={() => setMethodsOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border-2 border-primary bg-primary/5 text-sm font-medium text-foreground ring-1 ring-primary/20 cursor-pointer"
            >
              <span>{METHODS.find(m => m.id === method)?.label}</span>
              {(() => { const M = METHODS.find(m => m.id === method); return M ? <M.Logo /> : null; })()}
            </button>

            {/* Card form */}
            {method === "card" && (
              <div className="space-y-3">
                <div className="space-y-1.5">
                  <Label htmlFor="card-number" className="text-xs text-muted-foreground">Card number</Label>
                  <Input id="card-number" placeholder="1234 5678 9012 3456" value={cardForm.number} maxLength={19}
                    onChange={e => {
                      const v = e.target.value.replace(/\D/g, "").slice(0, 16);
                      setCardForm(p => ({ ...p, number: v.replace(/(.{4})/g, "$1 ").trim() }));
                    }} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label htmlFor="card-expiry" className="text-xs text-muted-foreground">MM / YY</Label>
                    <Input id="card-expiry" placeholder="12/27" value={cardForm.expiry} maxLength={5}
                      onChange={e => {
                        const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                        setCardForm(p => ({ ...p, expiry: v.length > 2 ? v.slice(0, 2) + "/" + v.slice(2) : v }));
                      }} />
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

            {/* Bank transfer */}
            {method === "bank" && (
              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/50 p-3.5 space-y-2 text-xs text-muted-foreground leading-relaxed">
                  <p className="font-semibold text-foreground text-sm">Use these details for your bank transfer</p>
                  <ol className="list-decimal list-inside space-y-0.5">
                    <li>Sign into your bank and choose to make a transfer.</li>
                    <li>Enter the details below — copy with the button.</li>
                    <li>Use the invoice number as reference for reconciliation.</li>
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
                  <Textarea
                    id="bank-note"
                    rows={2}
                    placeholder={`Invoice was paid on ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}`}
                    value={bankNote}
                    onChange={e => setBankNote(e.target.value)}
                    className="resize-none text-sm"
                  />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Section 4: Footer / CTA ── */}
      <div className="rounded-xl border border-border bg-card shadow-sm px-5 py-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Paying today</span>
          <span className="text-2xl font-bold tabular-nums financial-number text-foreground">
            {fmtCurrency(effectiveAmt, invoice.currency)}
          </span>
        </div>
        <p className="text-xs text-muted-foreground">A single charge with no additional fees.</p>

        <Button onClick={handleProceed} className="w-full h-11 text-sm">
          {method === "bank" ? "Mark as paid" : "Proceed to payment"}
        </Button>

        {showError && (
          <div className="flex items-center gap-2 text-xs bg-warning/10 border border-warning/20 rounded-lg px-3 py-2.5">
            <AlertCircle size={14} className="shrink-0 text-warning" />
            <span className="text-warning">Please select a payment method to proceed</span>
          </div>
        )}

        <div className="text-center pt-0.5">
          <p className="text-xs text-muted-foreground">
            Interested in billing like this?{" "}
            <a
              href="https://fiskl.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary font-medium hover:underline underline-offset-2 transition-colors"
            >
              Try Fiskl free →
            </a>
          </p>
        </div>
      </div>

    </div>
  );
}
