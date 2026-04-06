"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { Invoice } from "@/types/invoices";
import { calcInvoiceTotals, calcAmountDue, fmtCurrency, CURRENCY_SYMBOLS } from "@/types/invoices";
import { Copy, Check, Pencil, AlertCircle, CheckCircle2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

// ─── Payment method logos ──────────────────────────────────────────────────────

function IdealLogo() {
  return (
    <svg height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#CC0066" aria-label="iDEAL">
      <path d="M.975 2.61v18.782h11.411c6.89 0 10.64-3.21 10.64-9.415 0-6.377-4.064-9.367-10.64-9.367H.975zm11.411-.975C22.491 1.635 24 8.115 24 11.977c0 6.7-4.124 10.39-11.614 10.39H0V1.635h12.386zM2.506 13.357h3.653v6.503H2.506zM6.602 10.082a2.27 2.27 0 1 1-4.54 0 2.27 2.27 0 0 1 4.54 0m1.396-1.057v2.12h.65c.45 0 .867-.13.867-1.077 0-.924-.463-1.043-.867-1.043h-.65zm10.85-1.054h1.053v3.174h1.56c-.428-5.758-4.958-7.002-9.074-7.002H7.999v3.83h.65c1.183 0 1.92.803 1.92 2.095 0 1.333-.719 2.129-1.92 2.129h-.65v7.665h4.388c6.692 0 9.021-3.107 9.103-7.665h-2.64V7.97zm-2.93 2.358h.76l-.348-1.195h-.063l-.35 1.195zm-1.643 1.87l1.274-4.228h1.497l1.274 4.227h-1.095l-.239-.818H15.61l-.24.818h-1.095zm-.505-1.054v1.052h-2.603V7.973h2.519v1.052h-1.467v.49h1.387v1.05H12.22v.58h1.55z"/>
    </svg>
  );
}

function VisaLogo() {
  return (
    <svg height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#1A1F71" aria-label="Visa">
      <path d="M9.112 8.262L5.97 15.758H3.92L2.374 9.775c-.094-.368-.175-.503-.461-.658C1.447 8.864.677 8.627 0 8.479l.046-.217h3.3a.904.904 0 01.894.764l.817 4.338 2.018-5.102zm8.033 5.049c.008-1.979-2.736-2.088-2.717-2.972.006-.269.262-.555.822-.628a3.66 3.66 0 011.913.336l.34-1.59a5.207 5.207 0 00-1.814-.333c-1.917 0-3.266 1.02-3.278 2.479-.012 1.079.963 1.68 1.698 2.04.756.367 1.01.603 1.006.931-.005.504-.602.725-1.16.734-.975.015-1.54-.263-1.992-.473l-.351 1.642c.453.208 1.289.39 2.156.398 2.037 0 3.37-1.006 3.377-2.564m5.061 2.447H24l-1.565-7.496h-1.656a.883.883 0 00-.826.55l-2.909 6.946h2.036l.405-1.12h2.488zm-2.163-2.656l1.02-2.815.588 2.815zm-8.16-4.84l-1.603 7.496H8.34l1.605-7.496z"/>
    </svg>
  );
}

function MastercardLogo() {
  // Two overlapping circles with proper orange lens
  return (
    <svg width="38" height="24" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard">
      <circle cx="14" cy="12" r="11" fill="#EB001B"/>
      <circle cx="24" cy="12" r="11" fill="#F79E1B"/>
      {/* Lens shape: circles at (14,12) and (24,12) r=11, intersect at x=19, y=12±√(121-25)=12±9.8 */}
      <path d="M19 2.2 A11 11 0 0 1 19 21.8 A11 11 0 0 0 19 2.2 Z" fill="#FF5F00"/>
    </svg>
  );
}

function PayPalLogo() {
  return (
    <svg height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="#002991" aria-label="PayPal">
      <path d="M15.607 4.653H8.941L6.645 19.251H1.82L4.862 0h7.995c3.754 0 6.375 2.294 6.473 5.513-.648-.478-2.105-.86-3.722-.86m6.57 5.546c0 3.41-3.01 6.853-6.958 6.853h-2.493L11.595 24H6.74l1.845-11.538h3.592c4.208 0 7.346-3.634 7.153-6.949a5.24 5.24 0 0 1 2.848 4.686M9.653 5.546h6.408c.907 0 1.942.222 2.363.541-.195 2.741-2.655 5.483-6.441 5.483H8.714Z"/>
    </svg>
  );
}

function GoCardlessLogo() {
  // Not available in Simple Icons — using brand-accurate styled text
  return (
    <span className="text-[13px] font-bold leading-none tracking-tight" style={{ color: "#1B2B4B" }}>
      Go<span style={{ color: "#00B56A" }}>Card</span>less
    </span>
  );
}

function GooglePayLogo() {
  return (
    <svg height="20" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" aria-label="Google Pay">
      <path fill="#4285F4" d="M3.963 7.235A3.963 3.963 0 00.422 9.419a3.963 3.963 0 000 3.559 3.963 3.963 0 003.541 2.184c1.07 0 1.97-.352 2.627-.957.748-.69 1.18-1.71 1.18-2.916a4.722 4.722 0 00-.07-.806H3.964v1.526h2.14a1.835 1.835 0 01-.79 1.205c-.356.241-.814.379-1.35.379-1.034 0-1.911-.697-2.225-1.636a2.375 2.375 0 010-1.517c.314-.94 1.191-1.636 2.225-1.636a2.152 2.152 0 011.52.594l1.132-1.13a3.808 3.808 0 00-2.652-1.033z"/>
      <path fill="#34A853" d="M10.464 7.785v6.9h.886V11.89h1.465c.603 0 1.11-.196 1.522-.588a1.911 1.911 0 00.635-1.464 1.92 1.92 0 00-.635-1.456 2.125 2.125 0 00-1.522-.598zm2.427.85a1.156 1.156 0 01.823.365 1.176 1.176 0 010 1.686 1.171 1.171 0 01-.877.357H11.35V8.635h1.487a1.156 1.156 0 01.054 0z"/>
      <path fill="#FBBC04" d="M17.015 9.81c-.842 0-1.477.308-1.907.925l.781.491c.288-.417.68-.626 1.175-.626a1.255 1.255 0 01.856.323 1.009 1.009 0 01.366.785v.202c-.34-.193-.774-.289-1.3-.289-.617 0-1.11.145-1.479.434-.37.288-.554.677-.554 1.165a1.476 1.476 0 00.525 1.156c.35.308.785.463 1.305.463.61 0 1.098-.27 1.465-.81h.038v.655h.848v-2.909c0-.61-.19-1.09-.568-1.44-.38-.35-.896-.525-1.551-.525zm-.143 3.587a1.081 1.081 0 01-.69-.232.708.708 0 01-.293-.578c0-.257.12-.47.363-.647.24-.173.54-.26.9-.26.494 0 .88.11 1.156.33 0 .372-.147.696-.44.973a1.413 1.413 0 01-.997.414z"/>
      <path fill="#EA4335" d="M19.278 9.963l-2.21 5.024h.915L19.035 13h.02l1.407 1.987h.965l-1.368-1.935 1.946-3.089z"/>
    </svg>
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

interface ScheduleItem {
  id: string;
  label: string;
  date: string;
  amount: number;
}

function buildSchedule(invoice: Invoice): ScheduleItem[] {
  const amountDue = calcAmountDue(invoice);
  if (amountDue <= 0) return [];

  const fmt = (d: Date) =>
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });

  if (amountDue > 100) {
    const half = Math.round((amountDue / 2) * 100) / 100;
    const d1 = new Date(), d2 = new Date();
    d2.setDate(d2.getDate() + 30);
    return [
      { id: "pay_1", label: "Payment (1 of 2)", date: fmt(d1), amount: half },
      { id: "pay_2", label: "Payment (2 of 2)", date: fmt(d2), amount: Math.round((amountDue - half) * 100) / 100 },
    ];
  }
  return [{ id: "pay_full", label: "Payment (1 of 1)", date: fmt(new Date()), amount: amountDue }];
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

// ─── Main component ───────────────────────────────────────────────────────────

export function InvoicePaymentPanel({ invoice }: { invoice: Invoice }) {
  const totals     = calcInvoiceTotals(invoice);
  const amountDue  = calcAmountDue(invoice);
  const amountPaid = totals.total - amountDue;
  const schedule   = buildSchedule(invoice);
  const currSym    = CURRENCY_SYMBOLS[invoice.currency] ?? invoice.currency + " ";

  // Checkbox state — all selected by default
  const [selected, setSelected] = useState<Set<string>>(
    () => new Set(schedule.map(s => s.id))
  );

  // Custom amount override
  const [editingAmount, setEditingAmount]   = useState(false);
  const [customAmountStr, setCustomAmountStr] = useState("");
  const [customAmount, setCustomAmount]     = useState<number | null>(null);
  const amountInputRef = useRef<HTMLInputElement>(null);

  // Payment method state
  const [method, setMethod]       = useState<MethodId | null>(null);
  const [methodsOpen, setMethodsOpen] = useState(true);
  const [cardForm, setCardForm]   = useState({ number: "", expiry: "", cvv: "", email: "" });
  const [bankNote, setBankNote]   = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showError, setShowError] = useState(false);

  // Derived amounts
  const checkedTotal = schedule
    .filter(s => selected.has(s.id))
    .reduce((sum, s) => sum + s.amount, 0);

  const amountToPay = customAmount !== null ? customAmount : checkedTotal;
  const outstanding = Math.max(0, amountDue - amountToPay);

  // Select-all state
  const allSelected  = schedule.length > 0 && selected.size === schedule.length;
  const someSelected = selected.size > 0 && selected.size < schedule.length;
  const selectAllState = allSelected ? true : someSelected ? "indeterminate" : false;

  function toggleAll() {
    if (allSelected) {
      setSelected(new Set());
    } else {
      setSelected(new Set(schedule.map(s => s.id)));
    }
    setCustomAmount(null);
    setCustomAmountStr("");
  }

  function toggleItem(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
    setCustomAmount(null);
    setCustomAmountStr("");
  }

  function startEditAmount() {
    setCustomAmountStr(amountToPay > 0 ? amountToPay.toFixed(2) : "");
    setEditingAmount(true);
    setTimeout(() => amountInputRef.current?.select(), 0);
  }

  function commitAmount() {
    const val = parseFloat(customAmountStr.replace(/,/g, ""));
    if (!isNaN(val) && val > 0) {
      const capped = Math.min(val, amountDue);
      setCustomAmount(capped);
      setCustomAmountStr(capped.toFixed(2));
    } else {
      setCustomAmount(null);
      setCustomAmountStr("");
    }
    setEditingAmount(false);
  }

  function selectMethod(id: MethodId) {
    setMethod(id); setMethodsOpen(false); setShowError(false);
  }

  function handleProceed() {
    if (!method) { setShowError(true); return; }
    setSubmitted(true);
  }

  // Sync customAmountStr when checkedTotal changes and no custom override
  useEffect(() => {
    if (customAmount === null) setCustomAmountStr("");
  }, [checkedTotal, customAmount]);

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
            <span className="text-sm text-muted-foreground">Total</span>
            <span className="text-sm font-bold tabular-nums financial-number">
              {fmtCurrency(totals.total, invoice.currency)}
            </span>
          </div>
        </div>
      </div>

      {/* ── Section 2: Payment schedule ── */}
      <div className="rounded-xl border border-border bg-card shadow-sm px-5 py-4 space-y-3">
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Select payments
        </p>

        {/* Select all */}
        <div
          onClick={toggleAll}
          className="w-full flex items-center gap-3 cursor-pointer group"
        >
          <Checkbox
            checked={selectAllState}
            onCheckedChange={toggleAll}
            onClick={e => e.stopPropagation()}
            className="cursor-pointer"
          />
          <span className="text-sm font-semibold text-foreground group-hover:text-foreground/80 transition-colors">
            Select all payments
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Payment rows */}
        <div className="space-y-2.5">
          {schedule.map(item => {
            const isChecked = selected.has(item.id);
            return (
              <div
                key={item.id}
                onClick={() => toggleItem(item.id)}
                className="w-full flex items-center gap-3 cursor-pointer group"
              >
                <Checkbox
                  checked={isChecked}
                  onCheckedChange={() => toggleItem(item.id)}
                  onClick={e => e.stopPropagation()}
                  className="cursor-pointer"
                />
                <span className={cn(
                  "flex-1 text-sm font-semibold text-left transition-colors",
                  isChecked ? "text-foreground" : "text-muted-foreground"
                )}>
                  {item.label}
                </span>
                <span className={cn(
                  "text-xs tabular-nums transition-colors",
                  isChecked ? "text-muted-foreground" : "text-muted-foreground/50"
                )}>
                  {item.date}
                </span>
                <span className={cn(
                  "text-sm font-bold tabular-nums financial-number min-w-[80px] text-right transition-colors",
                  isChecked ? "text-foreground" : "text-muted-foreground/50"
                )}>
                  {fmtCurrency(item.amount, invoice.currency)}
                </span>
              </div>
            );
          })}
        </div>

        {/* Divider */}
        <div className="border-t border-border" />

        {/* Amount to pay row */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">Amount to pay</span>
          <div className="flex items-center gap-1.5">
            {editingAmount ? (
              <div className="relative flex items-center">
                <span className="absolute left-2.5 text-xs font-medium text-muted-foreground pointer-events-none">
                  {currSym}
                </span>
                <Input
                  ref={amountInputRef}
                  className="h-8 w-32 pl-7 text-sm font-bold tabular-nums text-right pr-2"
                  inputMode="decimal"
                  value={customAmountStr}
                  onChange={e => setCustomAmountStr(e.target.value.replace(/[^0-9.]/g, ""))}
                  onBlur={commitAmount}
                  onKeyDown={e => { if (e.key === "Enter") commitAmount(); if (e.key === "Escape") { setEditingAmount(false); setCustomAmountStr(""); } }}
                  autoFocus
                />
              </div>
            ) : (
              <button
                onClick={startEditAmount}
                className="flex items-center gap-1.5 group cursor-pointer"
                title="Edit amount"
              >
                <Pencil
                  size={13}
                  className="text-muted-foreground group-hover:text-primary transition-colors"
                />
                <span className="text-sm font-bold tabular-nums financial-number text-primary">
                  {fmtCurrency(amountToPay, invoice.currency)}
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Outstanding */}
        <div className="flex items-center justify-between rounded-lg bg-muted/50 px-4 py-2.5">
          <span className="text-sm text-muted-foreground">Outstanding</span>
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
        <div className="flex items-center justify-between">
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
            <button
              onClick={() => setMethodsOpen(true)}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-xl border-2 border-primary bg-primary/5 text-sm font-medium text-foreground ring-1 ring-primary/20 cursor-pointer"
            >
              <span>{METHODS.find(m => m.id === method)?.label}</span>
              {(() => { const M = METHODS.find(m => m.id === method); return M ? <M.Logo /> : null; })()}
            </button>

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
                    id="bank-note" rows={2}
                    placeholder={`Invoice was paid on ${new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" })}`}
                    value={bankNote} onChange={e => setBankNote(e.target.value)}
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
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
          Summary
        </p>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Amount to pay</span>
          <span className="text-2xl font-bold tabular-nums financial-number text-foreground">
            {fmtCurrency(amountToPay, invoice.currency)}
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
