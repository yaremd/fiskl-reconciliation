"use client";

import type { Invoice } from "@/types/invoices";
import { calcAmountDue, fmtCurrency } from "@/types/invoices";
import { Download, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { InvoicePreview } from "@/components/invoices/invoice-preview";
import { InvoicePaymentPanel } from "@/components/invoices/invoice-payment-panel";

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
            <span className="hidden sm:block text-sm text-muted-foreground truncate">
              Invoice {invoice.number ? `#${invoice.number}` : ""}
              {invoice.clientName ? ` · ${invoice.clientName}` : ""}
            </span>
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
            <a
              href="https://fiskl.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center h-8 px-3 rounded-lg text-xs font-semibold text-primary border border-primary/30 bg-primary/5 hover:bg-primary/10 transition-colors"
            >
              Try Fiskl
            </a>
          </div>
        </div>
      </header>

      {/* ── Main content — single centered scroll area ── */}
      <main className="share-scroll flex-1 overflow-y-auto">
        <div className="max-w-screen-xl mx-auto pl-2 pr-4 md:pr-8 pb-8 flex gap-6 items-start">

          {/* Invoice PDF */}
          <div className="flex-1 min-w-0">
            <InvoicePreview invoice={invoice} containerClassName="" />
            <div className="flex items-center gap-2 px-6 pt-3 pb-2">
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
