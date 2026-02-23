"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Filter, ChevronDown } from "lucide-react";
import { ACCOUNTS, MONTH_LABELS } from "@/lib/reconciliation/mock-data";
import { fmtCurrency } from "@/lib/utils";
import type { Account, MonthStatus } from "@/types/reconciliation";

// ── Timeline dot ──────────────────────────────────────────────────────────────
function TimelineDot({ status }: { status: MonthStatus }) {
  if (status === "reconciled") {
    return (
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 relative z-[1]">
        <div className="w-4 h-4 rounded-full flex-shrink-0" style={{ background: "#00d188" }} />
      </div>
    );
  }
  if (status === "needs_attention") {
    return (
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 relative z-[1]">
        <div className="w-4 h-4 rounded-full bg-destructive flex-shrink-0" />
      </div>
    );
  }
  if (status === "in_progress" || status === "draft") {
    return (
      <div className="w-5 h-5 flex items-center justify-center flex-shrink-0 relative z-[1]">
        <div className="w-4 h-4 rounded-full bg-primary flex-shrink-0" />
      </div>
    );
  }
  return (
    <div className="w-5 h-5 flex items-center justify-center p-1 flex-shrink-0 relative z-[1]">
      <div className="w-3 h-3 rounded-full border-2 border-border bg-card flex-shrink-0" />
    </div>
  );
}

function accountBadgeStatus(acct: Account): MonthStatus {
  const active = acct.months.find(
    m => m === "needs_attention" || m === "in_progress" || m === "draft"
  );
  if (!active) {
    return acct.months.some(m => m === "reconciled") ? "reconciled" : null;
  }
  return active;
}

function StatusBadge({ status }: { status: MonthStatus }) {
  if (!status) return null;
  const map: Record<NonNullable<MonthStatus>, { label: string; cls: string }> = {
    needs_attention: {
      label: "Needs attention",
      cls: "text-destructive bg-destructive/[.07] border border-destructive/20",
    },
    draft: {
      label: "Draft",
      cls: "text-primary bg-primary/[.07] border border-primary/20",
    },
    in_progress: {
      label: "In progress",
      cls: "text-primary bg-primary/[.07] border border-primary/20",
    },
    reconciled: {
      label: "Reconciled",
      cls: "text-[#00AD68] bg-[#00d188]/[.09] border border-[#00d188]/25",
    },
  };
  const m = map[status];
  if (!m) return null;
  return (
    <span className={`inline-flex items-center px-2 py-px rounded-lg text-xs font-semibold whitespace-nowrap ${m.cls}`}>
      {m.label}
    </span>
  );
}

export default function ReconciliationsPage() {
  const [search, setSearch] = useState("");
  const router = useRouter();

  const filtered = ACCOUNTS.filter(a =>
    a.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center gap-2 mb-4">
        {/* Combobox */}
        <div className="inline-flex items-center gap-2 px-3 min-w-[200px] h-9 bg-card border border-border rounded-lg cursor-pointer flex-shrink-0">
          <div className="flex flex-col gap-px flex-1">
            <span className="text-[10px] text-muted-foreground font-medium">
              Assets: Cash &amp; Cash Equivalents
            </span>
            <span className="text-[13px] font-medium text-foreground">All</span>
          </div>
          <ChevronDown size={14} className="text-muted-foreground flex-shrink-0" />
        </div>

        {/* Expand icon */}
        <button className="w-9 h-9 flex items-center justify-center bg-transparent border border-border rounded-lg cursor-pointer text-muted-foreground flex-shrink-0 transition-colors hover:bg-accent">
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7" />
          </svg>
        </button>

        <div className="flex-1" />

        {/* Search */}
        <div className="relative flex items-center">
          <Search size={13} className="absolute left-2.5 text-muted-foreground pointer-events-none" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search…"
            className="pl-8 pr-3 py-2 w-60 h-9 text-[13px] border border-border rounded-lg bg-background text-foreground outline-none transition-colors focus:border-primary"
          />
        </div>

        {/* Filter */}
        <button className="w-9 h-9 flex items-center justify-center bg-transparent border border-border rounded-lg cursor-pointer text-muted-foreground flex-shrink-0 transition-colors hover:bg-accent">
          <Filter size={14} />
        </button>
      </div>

      {/* Accounts list */}
      <div className="flex flex-col gap-2">
        {filtered.map(acct => (
          <div
            key={acct.id}
            onClick={() => router.push(`/reconciliation/${acct.id}`)}
            className="flex items-center gap-10 p-4 bg-card border border-border rounded-[10px] cursor-pointer shadow-[0_1px_3px_rgba(0,0,0,.04)] transition-all hover:shadow-[0_2px_8px_rgba(0,0,0,.08)] hover:border-input"
          >
            {/* Col 1: Name */}
            <div className="flex-[0_0_220px] min-w-0">
              <div className="text-[15px] font-medium text-foreground truncate">{acct.name}</div>
            </div>

            {/* Col 2: Status badge */}
            <div className="flex-[0_0_120px]">
              <StatusBadge status={accountBadgeStatus(acct)} />
            </div>

            {/* Col 3: Timeline */}
            <div className="flex-1 relative">
              <div className="absolute left-2.5 right-2.5 top-[9px] h-0.5 bg-border rounded-full" />
              <div className="flex justify-between items-start">
                {acct.months.map((st, i) => (
                  <div key={i} className="flex flex-col items-center gap-1">
                    <TimelineDot status={st} />
                    <span className="text-[9px] text-muted-foreground font-medium leading-none">
                      {MONTH_LABELS[i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Col 4: Balance */}
            <div className="flex-[0_0_180px] text-right">
              <div className="text-[11px] text-muted-foreground font-medium mb-0.5">
                Reconciled balance
              </div>
              <div className="text-[16px] font-medium text-foreground financial-number">
                {acct.balance != null ? fmtCurrency(acct.balance, acct.currency) : "—"}
              </div>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground text-[13px] bg-card border border-border rounded-[10px]">
            No accounts match your search.
          </div>
        )}
      </div>
    </div>
  );
}
