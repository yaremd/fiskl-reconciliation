"use client";

import type { Invoice, InvoiceStatus } from "@/types/invoices";
import { calcAmountDue, fmtCurrency } from "@/types/invoices";
import { Download, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BRAND_GRADIENT } from "@/lib/utils";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import { InvoicePaymentPanel } from "@/components/invoices/invoice-payment-panel";

const STATUS_BADGE: Record<InvoiceStatus, "neutral" | "positive" | "warning" | "critical" | "secondary"> = {
  Open:     "neutral",
  Sent:     "neutral",
  Partial:  "warning",
  Overdue:  "critical",
  Paid:     "positive",
  Rejected: "secondary",
};

// ─── Fiskl wordmark ───────────────────────────────────────────────────────────

function FisklWordmark({ size = "md" }: { size?: "md" | "sm" | "xs" }) {
  const height =
    size === "md" ? "h-7" :
    size === "sm" ? "h-5" :
                    "h-4";
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/fiskl-logo.svg" alt="fiskl" className={`${height} w-auto`} />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function InvoiceShareView({ invoice }: { invoice: Invoice }) {
  const amountDue = calcAmountDue(invoice);

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-muted/40">

      {/* ── Top bar ── */}
      <header className="shrink-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="max-w-screen-xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">

          {/* Left: Fiskl logo */}
          <div className="flex items-center gap-4 min-w-0">
            <FisklWordmark size="md" />
            <span className="hidden sm:block w-px h-5 bg-border shrink-0" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-sm font-medium text-foreground">
                Invoice {invoice.number ? `#${invoice.number}` : ""}
              </span>
              <Badge variant={STATUS_BADGE[invoice.status]}>
                {invoice.status}
              </Badge>
            </div>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex gap-1.5 h-8 text-xs"
              onClick={() => window.print()}
            >
              <Download size={14} />
              Download
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="hidden sm:flex gap-1.5 h-8 text-xs"
            >
              <HelpCircle size={14} />
              Contact support
            </Button>
            <div className="relative inline-flex rounded-[9px]">
              <div
                style={{ background: BRAND_GRADIENT, opacity: 0.25, filter: "blur(4px)" }}
                className="absolute inset-[-1px] rounded-[9px] pointer-events-none"
              />
              <div style={{ background: BRAND_GRADIENT }} className="relative rounded-[9px] p-px">
                <a
                  href="https://fiskl.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-8 px-3 rounded-[8px] bg-background text-xs font-semibold text-foreground no-underline"
                >
                  Try Fiskl
                </a>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* ── Main content — single centered scroll area ── */}
      <main className="share-scroll flex-1 overflow-y-auto">
        <div className="max-w-screen-xl mx-auto pl-2 pr-4 md:pr-8 pb-8 flex gap-6 items-start">

          {/* Invoice PDF */}
          <div className="flex-1 min-w-0">
            <InvoicePreview invoice={invoice} containerClassName="" />

            {/* Fiskl promo banner */}
            <div
              style={{ background: BRAND_GRADIENT }}
              className="mx-6 mb-6 rounded-2xl px-8 py-8 flex items-center justify-between gap-8 overflow-hidden"
            >
              {/* Copy + CTA */}
              <div className="min-w-0">
                <div className="inline-flex items-center bg-white/20 rounded-full px-3 py-1 mb-3">
                  <span className="text-[10px] font-semibold text-white tracking-widest uppercase">Invoicing Software</span>
                </div>
                <p className="text-[17px] font-bold text-white leading-snug">
                  Invoicing built for<br />modern businesses
                </p>
                <p className="text-sm text-white/70 mt-2 leading-relaxed">
                  Send beautiful invoices, track payments,<br className="hidden sm:block" />
                  and get paid faster — all in one place.
                </p>
                <a
                  href="https://fiskl.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex mt-5 bg-white text-[13px] font-semibold text-foreground px-5 py-2.5 rounded-lg hover:bg-white/90 transition-colors no-underline whitespace-nowrap"
                >
                  Try free →
                </a>
              </div>

              {/* Illustration */}
              <div className="shrink-0 hidden sm:block">
                <svg width="210" height="158" viewBox="0 0 210 158" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Shadow card (depth) */}
                  <rect x="12" y="24" width="106" height="124" rx="9" fill="white" fillOpacity="0.08" transform="rotate(-7 65 86)" />
                  {/* Main invoice card */}
                  <rect x="22" y="16" width="106" height="126" rx="9" fill="white" fillOpacity="0.2" />
                  {/* Invoice header bar */}
                  <rect x="34" y="28" width="42" height="7" rx="3.5" fill="white" fillOpacity="0.65" />
                  <rect x="104" y="30" width="14" height="3" rx="1.5" fill="white" fillOpacity="0.35" />
                  {/* Hairline divider */}
                  <rect x="33" y="45" width="82" height="1" rx="0.5" fill="white" fillOpacity="0.18" />
                  {/* Line items */}
                  <rect x="33" y="52" width="48" height="3.5" rx="1.75" fill="white" fillOpacity="0.38" />
                  <rect x="99" y="52" width="16" height="3.5" rx="1.75" fill="white" fillOpacity="0.38" />
                  <rect x="33" y="62" width="36" height="3" rx="1.5" fill="white" fillOpacity="0.22" />
                  <rect x="99" y="62" width="16" height="3" rx="1.5" fill="white" fillOpacity="0.22" />
                  <rect x="33" y="72" width="42" height="3" rx="1.5" fill="white" fillOpacity="0.22" />
                  <rect x="99" y="72" width="16" height="3" rx="1.5" fill="white" fillOpacity="0.22" />
                  <rect x="33" y="82" width="30" height="3" rx="1.5" fill="white" fillOpacity="0.16" />
                  <rect x="99" y="82" width="16" height="3" rx="1.5" fill="white" fillOpacity="0.16" />
                  {/* Subtotal divider */}
                  <rect x="33" y="96" width="82" height="1" rx="0.5" fill="white" fillOpacity="0.18" />
                  {/* Total row */}
                  <rect x="33" y="103" width="28" height="4" rx="2" fill="white" fillOpacity="0.45" />
                  <rect x="93" y="102" width="24" height="6" rx="3" fill="white" fillOpacity="0.55" />
                  {/* PAID stamp */}
                  <g transform="rotate(-8 75 128)">
                    <rect x="46" y="116" width="50" height="22" rx="5" fill="white" fillOpacity="0.12" />
                    <rect x="47.75" y="117.75" width="46.5" height="18.5" rx="4" stroke="white" strokeOpacity="0.45" strokeWidth="1.5" />
                    <text x="71" y="131" textAnchor="middle" fill="white" fillOpacity="0.65" fontSize="8.5" fontWeight="800" letterSpacing="2.5">PAID</text>
                  </g>

                  {/* Checkmark badge */}
                  <circle cx="158" cy="38" r="26" fill="white" fillOpacity="0.1" />
                  <circle cx="158" cy="38" r="18" fill="white" fillOpacity="0.18" />
                  <circle cx="158" cy="38" r="12" fill="white" fillOpacity="0.28" />
                  <path d="M151 38 L157 44 L167 30" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

                  {/* Floating payment card */}
                  <rect x="142" y="68" width="60" height="38" rx="8" fill="white" fillOpacity="0.16" />
                  <circle cx="157" cy="80" r="5" fill="white" fillOpacity="0.45" />
                  <circle cx="165" cy="80" r="5" fill="white" fillOpacity="0.28" />
                  <rect x="152" y="91" width="32" height="3" rx="1.5" fill="white" fillOpacity="0.28" />
                  <rect x="152" y="97" width="20" height="2.5" rx="1.25" fill="white" fillOpacity="0.18" />

                  {/* Decorative dots */}
                  <circle cx="197" cy="14" r="3" fill="white" fillOpacity="0.3" />
                  <circle cx="188" cy="7"  r="2" fill="white" fillOpacity="0.2" />
                  <circle cx="205" cy="24" r="1.5" fill="white" fillOpacity="0.18" />
                  <circle cx="16"  cy="148" r="4" fill="white" fillOpacity="0.14" />
                  <circle cx="8"   cy="138" r="2.5" fill="white" fillOpacity="0.1" />
                  <circle cx="198" cy="130" r="3" fill="white" fillOpacity="0.15" />
                  <circle cx="207" cy="118" r="2" fill="white" fillOpacity="0.1" />
                </svg>
              </div>
            </div>

            <div className="flex items-center gap-2 px-6 pt-2 pb-2">
              <span className="text-xs text-muted-foreground">Powered by</span>
              <FisklWordmark size="sm" />
            </div>
          </div>

          {/* Payment panel — sticky alongside the invoice */}
          <div className="w-[360px] xl:w-[380px] shrink-0 sticky top-0 hidden lg:block pt-6">
            <InvoicePaymentPanel invoice={invoice} />
          </div>

        </div>
      </main>

      {/* ── Mobile sticky pay bar ── */}
      <div className="lg:hidden shrink-0 border-t border-border bg-background/95 backdrop-blur-sm px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <div className="text-xs text-muted-foreground">Amount due</div>
          <div className="text-lg font-bold tabular-nums financial-number">
            {fmtCurrency(amountDue, invoice.currency)}
          </div>
        </div>
        <Button size="default" className="shrink-0 px-6">
          Pay now
        </Button>
      </div>

      <style>{`
        /* Hide scrollbar by default, fade in on scroll/hover */
        .share-scroll { scrollbar-width: thin; scrollbar-color: transparent transparent; }
        .share-scroll:hover { scrollbar-color: oklch(var(--border)) transparent; }
        .share-scroll::-webkit-scrollbar { width: 6px; }
        .share-scroll::-webkit-scrollbar-track { background: transparent; }
        .share-scroll::-webkit-scrollbar-thumb { background: transparent; border-radius: 3px; transition: background 0.2s; }
        .share-scroll:hover::-webkit-scrollbar-thumb { background: oklch(var(--border)); }
        @media print { header { display: none !important; } }
      `}</style>
    </div>
  );
}
