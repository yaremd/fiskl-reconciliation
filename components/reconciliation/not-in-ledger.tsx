"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { BRAND_GRADIENT } from "@/lib/utils";
import type { StatementEntry } from "@/types/reconciliation";

interface NotInLedgerCenterProps {
  statementItem: StatementEntry;
  created: boolean;
  onCreated: (item: StatementEntry) => void;
  onResolve: () => void;
}

export function NotInLedgerCenter({ statementItem, created, onCreated, onResolve }: NotInLedgerCenterProps) {
  const [loading, setLoading] = useState(false);

  function handleCreate() {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onCreated(statementItem);
    }, 500);
  }

  if (created) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 p-[14px_10px] rounded-xl"
        style={{ border: "1px solid rgba(0,232,157,.25)", background: "rgba(0,232,157,.03)" }}>
        <div className="text-[11px] font-semibold text-positive flex items-center gap-1">
          <Check size={12} /> Transaction Created
        </div>
        <button
          onClick={e => { e.stopPropagation(); onResolve(); }}
          className="px-3.5 py-[5px] bg-primary text-white border-none rounded-[var(--radius)] text-[11px] font-semibold cursor-pointer flex items-center gap-1 transition-opacity hover:opacity-[.88]"
        >
          <Check size={11} /> Resolve
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center gap-2 p-[14px_10px] rounded-xl border-2 border-dashed border-border bg-muted">
      <div className="text-[11px] font-semibold text-muted-foreground uppercase tracking-[.05em]">
        Missing Transaction
      </div>
      {loading ? (
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-[12px] text-primary font-medium">Creating…</span>
        </div>
      ) : (
        <button
          onClick={handleCreate}
          className="px-3.5 py-[5px] text-white border-none rounded-[var(--radius)] text-[11px] font-semibold cursor-pointer"
          style={{ background: BRAND_GRADIENT }}
        >
          + Create
        </button>
      )}
    </div>
  );
}
