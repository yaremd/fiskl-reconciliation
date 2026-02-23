"use client";

import { Pencil } from "lucide-react";
import { fmtGbp } from "@/lib/utils";
import type { LedgerEntry, StatementEntry } from "@/types/reconciliation";

// ── LedgerItem ───────────────────────────────────────────────────────────────

interface LedgerItemProps {
  item: LedgerEntry;
  checked: boolean;
  onCheck: () => void;
  onEdit: () => void;
}

export function LedgerItem({ item, checked, onCheck, onEdit }: LedgerItemProps) {
  return (
    <div
      className="p-[10px_12px] rounded-xl border"
      style={{
        borderColor: checked ? "var(--primary)" : "var(--border)",
        background: checked ? "rgba(0,120,255,.02)" : "var(--card)",
      }}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onCheck}
          className="mt-[3px] flex-shrink-0 cursor-pointer accent-primary"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between mb-0.5">
            <span className="text-[11px] text-muted-foreground">{item.d}</span>
            <AmtDisplay a={item.a} />
          </div>
          <div className="text-[13px] font-medium text-foreground truncate">{item.n}</div>
          {item.cat && <div className="text-[11px] text-muted-foreground mt-0.5">{item.cat}</div>}
        </div>
        <button
          onClick={e => { e.stopPropagation(); onEdit(); }}
          className="flex-shrink-0 p-1 bg-transparent border border-border rounded-[var(--radius)] cursor-pointer text-muted-foreground flex items-center transition-colors hover:bg-accent hover:text-foreground"
        >
          <Pencil size={11} />
        </button>
      </div>
    </div>
  );
}

// ── StatementItem ────────────────────────────────────────────────────────────

interface StatementItemProps {
  item: StatementEntry | null;
  checked: boolean;
  onCheck: () => void;
}

export function StatementItem({ item, checked, onCheck }: StatementItemProps) {
  if (!item) {
    return (
      <div className="p-3 rounded-xl border border-border bg-card flex items-center justify-center min-h-[56px]">
        <span className="text-[12px] text-muted-foreground">Not in statement</span>
      </div>
    );
  }

  return (
    <div
      className="p-[10px_12px] rounded-xl border"
      style={{
        borderColor: checked ? "var(--primary)" : "var(--border)",
        background: checked ? "rgba(0,120,255,.02)" : "var(--card)",
      }}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={checked}
          onChange={onCheck}
          className="mt-[3px] flex-shrink-0 cursor-pointer accent-primary"
        />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between mb-0.5">
            <span className="text-[11px] text-muted-foreground">{item.d}</span>
            <AmtDisplay a={item.a} />
          </div>
          <div className="text-[13px] font-medium text-foreground truncate">{item.n}</div>
        </div>
      </div>
    </div>
  );
}

// ── Shared amount display ─────────────────────────────────────────────────────

function AmtDisplay({ a }: { a: number }) {
  return (
    <span
      className="text-xs font-semibold financial-number"
      style={{ color: a > 0 ? "var(--positive)" : "var(--foreground)" }}
    >
      {fmtGbp(a)}
    </span>
  );
}
