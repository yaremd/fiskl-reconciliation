"use client";

import { Clock } from "lucide-react";
import type { InvoiceHistoryEntry } from "@/types/invoices";

interface InvoiceHistoryProps {
  history: InvoiceHistoryEntry[];
}

function fmtDateTime(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function InvoiceHistory({ history }: InvoiceHistoryProps) {
  if (history.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground py-2">
        <Clock className="h-3.5 w-3.5" />
        <span>No history yet.</span>
      </div>
    );
  }

  const sorted = [...history].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <div className="relative">
      {/* vertical line */}
      <div className="absolute left-[5px] top-2 bottom-2 w-px bg-border" />

      <ul className="space-y-3 pl-5">
        {sorted.map((entry) => (
          <li key={entry.id} className="relative">
            {/* dot */}
            <span className="absolute -left-5 top-1 h-2.5 w-2.5 rounded-full border-2 border-border bg-background" />
            <p className="text-xs text-foreground">{entry.action}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">
              {fmtDateTime(entry.date)} · {entry.by}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}
