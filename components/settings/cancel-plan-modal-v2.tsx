"use client";

import { useEffect, useState } from "react";
import {
  Landmark, FileText, Receipt, Car, Globe, Users,
  XCircle, ChevronLeft, CheckCircle2, X, ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { cn, BRAND_GRADIENT } from "@/lib/utils";

// ─── Types ─────────────────────────────────────────────────────────────────

type CancelStep = 1 | 2 | 3 | 4 | 5;

type CancelReason =
  | "too_expensive"
  | "not_using"
  | "missing_feature"
  | "switching"
  | "technical_issues"
  | "other";

// ─── Feature data ───────────────────────────────────────────────────────────

const FEATURES = [
  {
    key: "bank",
    title: "Bank Reconciliation",
    desc: "Automatic transaction matching and bank feeds",
    iconColor: "#0058FF",
    accentColor: "rgba(0,88,255,0.08)",
  },
  {
    key: "invoice",
    title: "Invoice & Quote Builder",
    desc: "Professional invoices with online payment links",
    iconColor: "#00B4FF",
    accentColor: "rgba(0,180,255,0.08)",
  },
  {
    key: "expense",
    title: "Expense Tracking",
    desc: "Capture, categorize, and claim every expense",
    iconColor: "#00C896",
    accentColor: "rgba(0,200,150,0.08)",
  },
  {
    key: "mileage",
    title: "Mileage Tracking",
    desc: "Log business journeys and claim deductions",
    iconColor: "#8B5CF6",
    accentColor: "rgba(139,92,246,0.08)",
  },
  {
    key: "currency",
    title: "Multi-Currency Support",
    desc: "150+ currencies with live exchange rates",
    iconColor: "#D97706",
    accentColor: "rgba(217,119,6,0.08)",
  },
  {
    key: "portal",
    title: "Client Portal",
    desc: "Branded payment pages shared with clients",
    iconColor: "#DB2777",
    accentColor: "rgba(219,39,119,0.08)",
  },
] as const;

const REASONS: { value: CancelReason; label: string }[] = [
  { value: "too_expensive",    label: "The service is too expensive" },
  { value: "not_using",        label: "I am not using Fiskl right now" },
  { value: "missing_feature",  label: "The product does not meet my needs" },
  { value: "switching",        label: "I am switching to a different product" },
  { value: "technical_issues", label: "I am having technical issues" },
  { value: "other",            label: "Other" },
];

const PAUSE_WEEKS = [2, 4, 6, 8, 10, 12];

// ─── Product mockup screens ─────────────────────────────────────────────────

function BankMockup() {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-md w-full text-[10px]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
        <span className="font-semibold text-slate-700 text-[11px]">Bank Reconciliation</span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium text-emerald-700 bg-emerald-50 border border-emerald-200">3 matched</span>
      </div>
      <div className="divide-y divide-slate-100">
        {[
          { date: "02 May", desc: "Stripe payout", amt: "+£1,240.00", ok: true },
          { date: "01 May", desc: "AWS Europe", amt: "−£89.00", ok: true },
          { date: "30 Apr", desc: "Office supplies", amt: "−£47.50", ok: false },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5">
            <span className="text-slate-400 w-8 shrink-0">{r.date}</span>
            <span className="flex-1 text-slate-600 truncate">{r.desc}</span>
            <span className={r.amt.startsWith("+") ? "text-emerald-600 font-medium" : "text-slate-600"}>{r.amt}</span>
            <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", r.ok ? "bg-emerald-400" : "bg-amber-400")} />
          </div>
        ))}
      </div>
      <div className="flex gap-1.5 px-3 py-2 border-t border-slate-100">
        <div className="h-5 rounded-md bg-blue-500 text-white flex items-center px-2 text-[9px] font-medium">Match all</div>
        <div className="h-5 rounded-md border border-slate-200 text-slate-500 flex items-center px-2 text-[9px]">Report</div>
      </div>
    </div>
  );
}

function InvoiceMockup() {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-md w-full text-[10px]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
        <div>
          <p className="font-semibold text-slate-700 text-[11px]">Invoice #1042</p>
          <p className="text-slate-400 text-[9px]">Acme Corp · Due 15 May</p>
        </div>
        <span className="text-[9px] px-1.5 py-0.5 rounded-full font-medium text-blue-700 bg-blue-50 border border-blue-200">Sent</span>
      </div>
      <div className="divide-y divide-slate-100">
        {[
          { item: "Web Design", qty: "8h × £95", total: "£760.00" },
          { item: "Consulting", qty: "3h × £120", total: "£360.00" },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5">
            <span className="flex-1 text-slate-600">{r.item}</span>
            <span className="text-slate-400">{r.qty}</span>
            <span className="text-slate-700 font-medium w-12 text-right">{r.total}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100 bg-slate-50">
        <span className="text-slate-500">Total due</span>
        <span className="font-bold text-slate-800 text-[12px]">£1,120.00</span>
      </div>
    </div>
  );
}

function ExpenseMockup() {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-md w-full text-[10px]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
        <span className="font-semibold text-slate-700 text-[11px]">Expenses — May 2026</span>
        <span className="text-[9px] text-slate-400">3 items</span>
      </div>
      <div className="divide-y divide-slate-100">
        {[
          { cat: "Travel",    desc: "London to Manchester", amt: "£342.00" },
          { cat: "Meals",     desc: "Client dinner",        amt: "£89.40" },
          { cat: "Software",  desc: "Annual subscription",  amt: "£47.99" },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5">
            <div className="w-12 shrink-0">
              <span className="text-[8px] px-1 py-0.5 rounded bg-slate-100 text-slate-500 font-medium">{r.cat}</span>
            </div>
            <span className="flex-1 text-slate-600 truncate">{r.desc}</span>
            <span className="text-slate-700 font-medium">{r.amt}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100">
        <span className="text-slate-500">Total</span>
        <span className="font-bold text-slate-800">£479.39</span>
      </div>
    </div>
  );
}

function MileageMockup() {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-md w-full text-[10px]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
        <span className="font-semibold text-slate-700 text-[11px]">Mileage — May 2026</span>
        <span className="text-[9px] text-emerald-600 font-medium">842 mi total</span>
      </div>
      <div className="divide-y divide-slate-100">
        {[
          { desc: "Client visit — Bristol",    mi: "47 mi", amt: "£21.15" },
          { desc: "Site inspection — Leeds",   mi: "83 mi", amt: "£37.35" },
          { desc: "Airport — Heathrow",        mi: "31 mi", amt: "£13.95" },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5">
            <span className="flex-1 text-slate-600 truncate">{r.desc}</span>
            <span className="text-slate-400 w-9 text-right">{r.mi}</span>
            <span className="text-slate-700 font-medium w-10 text-right">{r.amt}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between px-3 py-2 border-t border-slate-100">
        <span className="text-slate-500">Reimbursable total</span>
        <span className="font-bold text-slate-800">£378.90</span>
      </div>
    </div>
  );
}

function CurrencyMockup() {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-md w-full text-[10px]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100 bg-slate-50">
        <span className="font-semibold text-slate-700 text-[11px]">Multi-Currency</span>
        <span className="text-[9px] text-slate-400">Live rates</span>
      </div>
      <div className="flex gap-2 px-3 py-2 border-b border-slate-100">
        {[["USD","1.27"],["EUR","1.16"],["JPY","160"]].map(([cur, rate]) => (
          <div key={cur} className="flex-1 bg-slate-50 rounded-lg p-1.5 text-center">
            <p className="text-[9px] text-slate-400 font-medium">{cur}</p>
            <p className="font-bold text-slate-700">{rate}</p>
          </div>
        ))}
      </div>
      <div className="divide-y divide-slate-100">
        {[
          { inv: "#1039", cur: "EUR", foreign: "€2,400", gbp: "£2,069" },
          { inv: "#1038", cur: "USD", foreign: "$1,800", gbp: "£1,417" },
        ].map((r, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5">
            <span className="text-slate-400">{r.inv}</span>
            <span className="text-[8px] px-1 py-0.5 rounded bg-amber-50 text-amber-600 font-medium border border-amber-100">{r.cur}</span>
            <span className="flex-1 text-right text-slate-500">{r.foreign}</span>
            <ArrowRight size={8} className="text-slate-300" />
            <span className="text-slate-700 font-medium">{r.gbp}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PortalMockup() {
  return (
    <div className="rounded-xl overflow-hidden border border-slate-200 bg-white shadow-md w-full text-[10px]">
      <div className="flex items-center justify-between px-3 py-2 border-b border-slate-100"
           style={{ background: "linear-gradient(92deg,#0058FF 0%,#00B4FF 100%)" }}>
        <span className="font-semibold text-white text-[11px]">Fiskl</span>
        <span className="text-[9px] text-white/80">Invoice #1042</span>
      </div>
      <div className="px-3 py-2 border-b border-slate-100">
        <p className="text-slate-500 text-[9px]">Amount due</p>
        <p className="font-bold text-slate-800 text-[14px]">£1,120.00</p>
        <p className="text-slate-400 text-[9px]">Acme Corp · Due 15 May 2026</p>
      </div>
      <div className="flex gap-1.5 px-3 py-2">
        <div className="flex-1 h-6 rounded-md flex items-center justify-center text-[9px] font-medium text-white"
             style={{ background: BRAND_GRADIENT }}>
          Pay by card
        </div>
        <div className="flex-1 h-6 rounded-md border border-slate-200 flex items-center justify-center text-[9px] text-slate-600">
          Bank transfer
        </div>
      </div>
    </div>
  );
}

const MOCKUPS: Record<string, React.ReactNode> = {
  bank:     <BankMockup />,
  invoice:  <InvoiceMockup />,
  expense:  <ExpenseMockup />,
  mileage:  <MileageMockup />,
  currency: <CurrencyMockup />,
  portal:   <PortalMockup />,
};

// ─── Right panel ─────────────────────────────────────────────────────────────

function RightPanel({ index }: { index: number }) {
  const f = FEATURES[index];
  return (
    <div
      className="flex flex-col items-center justify-center gap-4 p-8 h-full"
      style={{
        background: "linear-gradient(140deg, #e8f3ff 0%, #d4e9ff 45%, #ddf4f9 100%)",
      }}
    >
      <p className="text-xs font-medium text-slate-400 tracking-wide uppercase">
        You'll be locked out from
      </p>

      <p className="text-base font-bold text-slate-800 text-center">{f.title}</p>

      <div className="w-full max-w-[280px]">
        {MOCKUPS[f.key]}
      </div>

      {/* Dot indicators */}
      <div className="flex gap-1.5 mt-1">
        {FEATURES.map((_, i) => (
          <div
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: i === index ? 16 : 6,
              height: 6,
              background: i === index ? BRAND_GRADIENT : "#c7d8eb",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main component ──────────────────────────────────────────────────────────

interface CancelPlanModalV2Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmCancel?: () => void;
}

export function CancelPlanModalV2({
  open,
  onOpenChange,
  onConfirmCancel,
}: CancelPlanModalV2Props) {
  const [step, setStep] = useState<CancelStep>(1);
  const [reason, setReason] = useState<CancelReason | null>(null);
  const [pauseWeeks, setPauseWeeks] = useState<number | null>(null);
  const [carouselIndex, setCarouselIndex] = useState(0);

  useEffect(() => {
    if (step === 5) return;
    const id = setInterval(
      () => setCarouselIndex((i) => (i + 1) % FEATURES.length),
      3000
    );
    return () => clearInterval(id);
  }, [step]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setTimeout(() => {
        setStep(1);
        setReason(null);
        setPauseWeeks(null);
        setCarouselIndex(0);
      }, 200);
    }
    onOpenChange(next);
  }

  // "Continue cancellation" advances the step; on step 4 it finalises
  function handleContinue() {
    if (step < 4) {
      setStep((s) => (s + 1) as CancelStep);
    } else {
      setStep(5);
      onConfirmCancel?.();
    }
  }

  // ── Step renderers ─────────────────────────────────────────────────────

  function renderStep1Body() {
    return (
      <>
        <h2 className="text-[22px] font-bold tracking-tight text-foreground leading-snug">
          You'll lose access to these amazing features:
        </h2>

        <div className="flex flex-col gap-3 mt-5">
          {FEATURES.map((f) => (
            <div key={f.key} className="flex items-start gap-3">
              <XCircle size={17} className="text-destructive shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-foreground leading-tight">{f.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  function renderStep2Body() {
    return (
      <>
        <h2 className="text-[22px] font-bold tracking-tight text-foreground leading-snug">
          Why do you want to cancel?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Help us get better, we'd love your feedback.
        </p>

        <div className="flex flex-col gap-2 mt-5">
          {REASONS.map(({ value, label }) => {
            const selected = reason === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setReason(value)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-lg border text-sm text-left transition-colors cursor-pointer",
                  selected
                    ? "border-primary bg-primary/5 text-foreground"
                    : "border-border bg-background hover:bg-accent/50 text-foreground"
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                    selected ? "border-primary" : "border-muted-foreground/40"
                  )}
                >
                  {selected && <span className="w-2 h-2 rounded-full bg-primary" />}
                </span>
                {label}
              </button>
            );
          })}
        </div>
      </>
    );
  }

  function renderStep3Body() {
    return (
      <>
        <h2 className="text-[22px] font-bold tracking-tight text-foreground leading-snug">
          Pause your subscription until you're ready to start again.
        </h2>
        <p className="text-sm text-muted-foreground mt-2">
          You will not be charged while your subscription is paused.
          Cancel anytime.
        </p>

        <div className="mt-6">
          <p className="text-sm font-medium text-foreground mb-3">
            How many weeks would you like to pause for?
          </p>
          <div className="flex flex-wrap gap-2">
            {PAUSE_WEEKS.map((w) => {
              const selected = pauseWeeks === w;
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => setPauseWeeks(w)}
                  className={cn(
                    "w-14 h-14 rounded-xl border text-sm font-semibold transition-colors cursor-pointer",
                    selected
                      ? "border-transparent text-white"
                      : "border-border bg-background text-foreground hover:border-primary/40"
                  )}
                  style={selected ? { background: BRAND_GRADIENT } : undefined}
                >
                  {w}
                </button>
              );
            })}
          </div>
        </div>

        <Button
          className="w-full mt-6"
          disabled={pauseWeeks === null}
          onClick={() => handleOpenChange(false)}
        >
          {pauseWeeks ? `Pause subscription for ${pauseWeeks} weeks` : "Pause subscription"}
        </Button>
      </>
    );
  }

  function renderStep4Body() {
    return (
      <>
        <h2 className="text-[22px] font-bold tracking-tight text-foreground leading-snug">
          Get 2 months free with your subscription
        </h2>

        <div className="mt-5 rounded-xl border border-border p-5">
          <p className="text-base font-bold text-foreground">Switch to Pro Annual plan</p>
          <p className="text-sm text-muted-foreground mt-0.5">Billed yearly</p>

          <Button className="w-full mt-4">
            Get 2 months free now
          </Button>

          <p className="text-xs text-muted-foreground text-center mt-2.5">
            *On a yearly plan if you keep your account today
          </p>
        </div>
      </>
    );
  }

  // ── Shared footer ──────────────────────────────────────────────────────

  function Footer({ continueLocked }: { continueLocked?: boolean }) {
    return (
      <div className="flex items-center justify-between mt-auto pt-5 border-t border-border/60">
        <button
          type="button"
          disabled={continueLocked}
          onClick={handleContinue}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Continue cancellation
        </button>
        <Button onClick={() => handleOpenChange(false)}>
          Stay on this plan
        </Button>
      </div>
    );
  }

  // ── Step 5 — confirmation ──────────────────────────────────────────────

  function renderConfirmation() {
    return (
      <div className="flex flex-col items-center text-center px-8 py-10 gap-4">
        <h2 className="text-xl font-bold text-foreground">
          Your plan has been cancelled
        </h2>
        <p className="text-sm text-muted-foreground max-w-[300px]">
          You can still use Fiskl until{" "}
          <span className="font-semibold text-foreground">11 Jun 2026</span>.
        </p>
        <Button className="w-full max-w-[280px] mt-2" onClick={() => handleOpenChange(false)}>
          Close
        </Button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  const isConfirmation = step === 5;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden",
          isConfirmation
            ? "max-w-[420px] w-[90vw]"
            : "max-w-[860px] w-[90vw]"
        )}
      >
        <DialogClose className="absolute top-3.5 right-3.5 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors z-10">
          <X size={15} />
        </DialogClose>

        {isConfirmation ? (
          renderConfirmation()
        ) : (
          <div className="flex" style={{ minHeight: 520, maxHeight: "88vh" }}>
            {/* ── Left panel ── */}
            <div className="flex flex-col w-[45%] min-w-0 p-8 overflow-y-auto">
              {step > 1 && (
                <button
                  type="button"
                  onClick={() => setStep((s) => (s - 1) as CancelStep)}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 -ml-0.5 cursor-pointer self-start"
                >
                  <ChevronLeft size={15} />
                  Back
                </button>
              )}

              {step === 1 && renderStep1Body()}
              {step === 2 && renderStep2Body()}
              {step === 3 && renderStep3Body()}
              {step === 4 && renderStep4Body()}

              <Footer continueLocked={step === 2 && reason === null} />
            </div>

            {/* ── Right panel ── */}
            <div className="w-[55%] flex flex-col overflow-hidden">
              <RightPanel index={carouselIndex} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
