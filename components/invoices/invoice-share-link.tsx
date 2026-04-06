"use client";

import { useState } from "react";
import { Link2, Copy, Check } from "lucide-react";

interface InvoiceShareLinkProps {
  shareToken: string;
  invoiceNumber: string;
}

export function InvoiceShareLink({ shareToken, invoiceNumber }: InvoiceShareLinkProps) {
  const [copied, setCopied] = useState(false);
  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/share/invoices/${shareToken}`;

  function copy() {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <Link2 className="h-3.5 w-3.5" />
        <span>Share a link to let your client view {invoiceNumber} online.</span>
      </div>

      <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 p-2 pl-3">
        <span className="flex-1 min-w-0 text-xs text-foreground truncate font-mono">
          {shareUrl}
        </span>
        <button
          type="button"
          onClick={copy}
          className="shrink-0 flex items-center gap-1 rounded-md border border-border bg-background px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted transition-colors"
        >
          {copied ? (
            <>
              <Check className="h-3 w-3 text-positive" />
              Copied
            </>
          ) : (
            <>
              <Copy className="h-3 w-3" />
              Copy
            </>
          )}
        </button>
      </div>

      <p className="text-[10px] text-muted-foreground">
        Anyone with this link can view the invoice. The link does not expire.
      </p>
    </div>
  );
}
