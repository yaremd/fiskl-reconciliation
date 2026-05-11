"use client";

import { useEffect, useState } from "react";
import {
  Landmark, FileText, Receipt, Car, Globe, Users,
  ChevronLeft, CheckCircle2, X, PauseCircle, TrendingUp,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogClose,
} from "@/components/ui/dialog";
import { cn, BRAND_GRADIENT } from "@/lib/utils";

// ─── Constants ─────────────────────────────────────────────────────────────

type CancelStep = 1 | 2 | 3 | 4 | 5;

type CancelReason =
  | "too_expensive"
  | "not_using"
  | "missing_feature"
  | "switching"
  | "technical_issues"
  | "other";

const FEATURE_CARDS = [
  {
    icon: "bank",
    title: "Bank Reconciliation",
    desc: "Match transactions automatically.",
    accentColor: "rgba(0,88,255,0.10)",
    iconColor: "#0058FF",
  },
  {
    icon: "invoice",
    title: "Invoice & Quote Builder",
    desc: "Professional invoices in seconds.",
    accentColor: "rgba(0,180,255,0.10)",
    iconColor: "#00B4FF",
  },
  {
    icon: "expense",
    title: "Expense Tracking",
    desc: "Capture and categorize every expense.",
    accentColor: "rgba(0,224,160,0.10)",
    iconColor: "#00C896",
  },
  {
    icon: "mileage",
    title: "Mileage Tracking",
    desc: "Log journeys, claim deductions.",
    accentColor: "rgba(139,92,246,0.10)",
    iconColor: "#8B5CF6",
  },
  {
    icon: "currency",
    title: "Multi-Currency",
    desc: "Transact in 150+ currencies.",
    accentColor: "rgba(245,158,11,0.10)",
    iconColor: "#D97706",
  },
  {
    icon: "portal",
    title: "Client Portal",
    desc: "Share invoices directly with clients.",
    accentColor: "rgba(236,72,153,0.10)",
    iconColor: "#DB2777",
  },
] as const;

const REASONS: { value: CancelReason; label: string }[] = [
  { value: "too_expensive",    label: "It's too expensive" },
  { value: "not_using",        label: "I'm not using Fiskl right now" },
  { value: "missing_feature",  label: "A feature I need is missing" },
  { value: "switching",        label: "I'm switching to another tool" },
  { value: "technical_issues", label: "I'm having technical issues" },
  { value: "other",            label: "Other" },
];

const PAUSE_WEEKS = [2, 4, 6, 8, 10, 12];

function iconForKey(key: string) {
  const map: Record<string, React.ReactNode> = {
    bank:     <Landmark size={20} />,
    invoice:  <FileText size={20} />,
    expense:  <Receipt size={20} />,
    mileage:  <Car size={20} />,
    currency: <Globe size={20} />,
    portal:   <Users size={20} />,
  };
  return map[key] ?? null;
}

// ─── Right Panel ────────────────────────────────────────────────────────────

function FeatureCarousel({ index }: { index: number }) {
  const card = FEATURE_CARDS[index];
  return (
    <div className="flex flex-col items-center justify-center gap-5 p-8 h-full">
      <p className="text-xs font-medium text-muted-foreground tracking-wide uppercase">
        You'll lose access to
      </p>

      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: card.accentColor, color: card.iconColor }}
      >
        {iconForKey(card.icon)}
      </div>

      <div className="text-center max-w-[240px]">
        <p className="font-semibold text-foreground text-sm">{card.title}</p>
        <p className="text-xs text-muted-foreground mt-1">{card.desc}</p>
      </div>

      {/* Mock UI skeleton */}
      <div className="w-full max-w-[260px] rounded-lg border border-border bg-background p-4 space-y-2.5 shadow-[0_2px_12px_rgba(0,0,0,0.06)]">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-5 h-5 rounded flex items-center justify-center shrink-0"
            style={{ background: card.accentColor, color: card.iconColor }}
          >
            {iconForKey(card.icon) && (
              <span style={{ transform: "scale(0.7)", display: "flex" }}>
                {iconForKey(card.icon)}
              </span>
            )}
          </div>
          <div className="h-2 rounded bg-muted w-24 animate-pulse" />
        </div>
        <div
          className="h-9 rounded-md w-full"
          style={{ background: card.accentColor }}
        />
        <div className="h-2 rounded bg-muted w-3/4 animate-pulse" />
        <div className="h-2 rounded bg-muted w-1/2 animate-pulse" />
        <div className="h-2 rounded bg-muted w-2/3 animate-pulse" />
      </div>

      {/* Dot indicators */}
      <div className="flex gap-1.5">
        {FEATURE_CARDS.map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full transition-all duration-300"
            style={{
              background: i === index ? BRAND_GRADIENT : "var(--border)",
              transform: i === index ? "scale(1.25)" : "scale(1)",
            }}
          />
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface CancelPlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirmCancel?: () => void;
}

export function CancelPlanModal({ open, onOpenChange, onConfirmCancel }: CancelPlanModalProps) {
  const [step, setStep] = useState<CancelStep>(1);
  const [reason, setReason] = useState<CancelReason | null>(null);
  const [pauseWeeks, setPauseWeeks] = useState<number | null>(null);
  const [annualSwitch, setAnnualSwitch] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(0);

  // Auto-advance carousel on steps 1–4
  useEffect(() => {
    if (step === 5) return;
    const id = setInterval(() => {
      setCarouselIndex((i) => (i + 1) % FEATURE_CARDS.length);
    }, 3000);
    return () => clearInterval(id);
  }, [step]);

  function handleOpenChange(next: boolean) {
    if (!next) {
      setTimeout(() => {
        setStep(1);
        setReason(null);
        setPauseWeeks(null);
        setAnnualSwitch(false);
        setCarouselIndex(0);
      }, 200);
    }
    onOpenChange(next);
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1) as CancelStep);
  }

  // ── Step renderers ──────────────────────────────────────────────────────

  function renderStep1() {
    return (
      <>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Are you sure you want to cancel?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          You'll immediately lose access to everything below:
        </p>

        <div className="grid grid-cols-2 gap-x-4 gap-y-3 mt-5">
          {FEATURE_CARDS.map((f) => (
            <div key={f.icon} className="flex items-center gap-2.5">
              <div
                className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
                style={{ background: f.accentColor, color: f.iconColor }}
              >
                <span style={{ transform: "scale(0.8)", display: "flex" }}>
                  {iconForKey(f.icon)}
                </span>
              </div>
              <span className="text-sm font-medium text-foreground leading-tight">
                {f.title}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-5 rounded-lg border border-destructive/25 bg-destructive/5 px-4 py-3 flex items-start gap-2.5">
          <AlertTriangle size={15} className="text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive leading-relaxed">
            Bank connections will be disconnected and all scheduled reports will stop.
          </p>
        </div>

        <div className="flex flex-col gap-2.5 mt-auto pt-6">
          <Button onClick={() => handleOpenChange(false)}>
            Keep my plan
          </Button>
          <Button
            variant="outline"
            className="border-destructive/40 text-destructive hover:bg-destructive/5 hover:border-destructive/60"
            onClick={() => setStep(2)}
          >
            Continue to cancel
          </Button>
        </div>
      </>
    );
  }

  function renderStep2() {
    return (
      <>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          What's your reason for leaving?
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your feedback helps us build a better product.
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
                    ? "border-primary bg-primary/5 text-foreground font-medium"
                    : "border-border bg-background hover:bg-accent/60 text-foreground"
                )}
              >
                <span
                  className={cn(
                    "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors",
                    selected ? "border-primary" : "border-muted-foreground/40"
                  )}
                >
                  {selected && (
                    <span className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </span>
                {label}
              </button>
            );
          })}
        </div>

        <div className="mt-auto pt-6">
          <Button
            className="w-full"
            disabled={reason === null}
            onClick={() => setStep(3)}
          >
            Continue
          </Button>
        </div>
      </>
    );
  }

  function renderStep3() {
    return (
      <>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Need a break? Pause instead.
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Your data stays safe. Resume any time — no reconfiguration needed.
        </p>

        <div className="mt-4 rounded-lg border border-positive/30 bg-positive/5 px-4 py-3 flex items-start gap-2.5">
          <PauseCircle size={15} className="text-positive shrink-0 mt-0.5" />
          <p className="text-xs text-positive leading-relaxed font-medium">
            Nothing is deleted while paused. Your bank connections stay active.
          </p>
        </div>

        <div className="mt-5">
          <Label className="text-sm text-muted-foreground mb-3 block">
            How many weeks would you like to pause for?
          </Label>
          <div className="flex flex-wrap gap-2">
            {PAUSE_WEEKS.map((w) => {
              const selected = pauseWeeks === w;
              return (
                <button
                  key={w}
                  type="button"
                  onClick={() => setPauseWeeks(w)}
                  className={cn(
                    "px-4 py-2 rounded-full border text-sm font-medium transition-colors cursor-pointer",
                    selected
                      ? "border-transparent text-white"
                      : "border-border bg-background text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  )}
                  style={selected ? { background: BRAND_GRADIENT } : undefined}
                >
                  {w} weeks
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col gap-2.5 mt-auto pt-6">
          <Button
            className="w-full"
            disabled={pauseWeeks === null}
            onClick={() => handleOpenChange(false)}
          >
            {pauseWeeks ? `Pause for ${pauseWeeks} weeks` : "Pause my plan"}
          </Button>
          <button
            type="button"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors py-1 cursor-pointer"
            onClick={() => setStep(4)}
          >
            No thanks, continue to cancel
          </button>
        </div>
      </>
    );
  }

  function renderStep4() {
    return (
      <>
        <h2 className="text-xl font-semibold tracking-tight text-foreground">
          Get 2 months free — switch to annual
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Save 17% by paying yearly. Lock in your current price.
        </p>

        {/* Comparison card */}
        <div className="mt-5 grid grid-cols-2 gap-0 rounded-xl overflow-hidden border border-border">
          <div className="p-4 bg-background flex flex-col gap-1">
            <p className="text-xs text-muted-foreground font-medium">Monthly</p>
            <p className="text-2xl font-bold tracking-tight text-foreground">£29</p>
            <p className="text-xs text-muted-foreground">per month</p>
          </div>
          <div className="p-4 bg-secondary flex flex-col gap-1 border-l border-border ring-1 ring-inset ring-primary/15">
            <p className="text-xs font-semibold" style={{ color: "#0058FF" }}>
              Annual  — Best value
            </p>
            <p className="text-2xl font-bold tracking-tight text-foreground">£24.17</p>
            <p className="text-xs text-muted-foreground">per month · billed £290/yr</p>
          </div>
        </div>

        {/* Annual switch */}
        <div className="mt-5 flex items-center justify-between rounded-lg border border-border p-4">
          <div>
            <p className="text-sm font-medium text-foreground">Switch to annual billing</p>
            <p className="text-xs text-muted-foreground mt-0.5">
              You'll be charged £290 today and your plan continues.
            </p>
          </div>
          <Switch
            checked={annualSwitch}
            onCheckedChange={setAnnualSwitch}
          />
        </div>

        {annualSwitch && (
          <div className="mt-3 flex items-center gap-2">
            <TrendingUp size={14} className="text-positive shrink-0" />
            <p className="text-xs text-positive font-medium">
              Save £58/year + 2 months free applied automatically
            </p>
          </div>
        )}

        <div className="flex flex-col gap-2.5 mt-auto pt-6">
          {annualSwitch && (
            <Button className="w-full" onClick={() => handleOpenChange(false)}>
              Switch to Annual
            </Button>
          )}
          <button
            type="button"
            className="text-sm text-destructive/70 hover:text-destructive transition-colors py-1 cursor-pointer"
            onClick={() => {
              setStep(5);
              onConfirmCancel?.();
            }}
          >
            No thanks, cancel my plan
          </button>
        </div>
      </>
    );
  }

  function renderStep5() {
    return (
      <div className="flex flex-col items-center text-center px-8 py-10 gap-5">
        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-positive/10">
          <CheckCircle2 size={28} className="text-positive" />
        </div>

        <div className="space-y-2 max-w-[320px]">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Your subscription has been cancelled
          </h2>
          <p className="text-sm text-muted-foreground">
            You have full access until{" "}
            <span className="font-medium text-foreground">May 19, 2026</span>.
            After that, your account moves to the free plan.
          </p>
        </div>

        <div className="w-full max-w-[340px] rounded-lg border border-border bg-muted/40 px-4 py-3">
          <p className="text-xs text-muted-foreground leading-relaxed">
            Your data is retained for{" "}
            <span className="font-medium text-foreground">90 days</span>{" "}
            after cancellation. Reactivate any time to pick up where you left off.
          </p>
        </div>

        <Button className="w-full max-w-[340px] mt-1" onClick={() => handleOpenChange(false)}>
          Close
        </Button>
      </div>
    );
  }

  // ── Render ──────────────────────────────────────────────────────────────

  const isConfirmation = step === 5;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent
        className={cn(
          "p-0 gap-0 overflow-hidden",
          isConfirmation
            ? "max-w-[480px] w-[90vw]"
            : "max-w-[820px] w-[90vw]"
        )}
      >
        <DialogClose className="absolute top-3.5 right-3.5 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors z-10">
          <X size={15} />
        </DialogClose>

        {isConfirmation ? (
          renderStep5()
        ) : (
          <div className="flex" style={{ minHeight: 520, maxHeight: "88vh" }}>
            {/* Left panel */}
            <div className="flex flex-col w-[45%] min-w-0 p-8 overflow-y-auto">
              {/* Back button */}
              {step > 1 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-5 -ml-0.5 cursor-pointer self-start"
                >
                  <ChevronLeft size={15} />
                  Back
                </button>
              )}

              {step === 1 && renderStep1()}
              {step === 2 && renderStep2()}
              {step === 3 && renderStep3()}
              {step === 4 && renderStep4()}
            </div>

            {/* Right panel */}
            <div className="w-[55%] bg-secondary border-l border-border flex flex-col overflow-hidden">
              <FeatureCarousel index={carouselIndex} />
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
