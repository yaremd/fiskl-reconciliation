"use client";

import { useRef, useState } from "react";
import { Pencil } from "lucide-react";

interface StatsBarProps {
  stmtBal: string;
  onStmtBalChange: (v: string) => void;
  debitIn?: number;
  creditOut?: number;
}

const LEDGER_TOTAL = 142834.72;

function tile(value: React.ReactNode, label: string, sub?: string, style?: React.CSSProperties) {
  return (
    <div className="flex-1 px-4 py-2.5 bg-card rounded-[var(--radius)] border border-border shadow-[0_1px_3px_rgba(0,0,0,.06)]" style={style}>
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[.06em] mb-[3px]">{label}</div>
      <div className="text-[17px] font-bold text-foreground financial-number">{value}</div>
      {sub && <div className="text-[11px] text-muted-foreground mt-px">{sub}</div>}
    </div>
  );
}

function StmtBalanceField({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function startEdit() {
    setEditing(true);
    setTimeout(() => inputRef.current?.select(), 0);
  }

  return (
    <div className="flex-1 px-4 py-2.5 bg-card rounded-[var(--radius)] border border-border shadow-[0_1px_3px_rgba(0,0,0,.06)]">
      <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[.06em] mb-[3px]">Statement Balance</div>
      <div className="flex items-center gap-1">
        {editing ? (
          <>
            <span className="text-[17px] font-bold text-foreground">£</span>
            <input
              ref={inputRef}
              value={value}
              onChange={e => onChange(e.target.value)}
              onBlur={() => setEditing(false)}
              onKeyDown={e => { if (e.key === "Enter" || e.key === "Escape") setEditing(false); }}
              className="flex-1 text-[17px] font-bold text-foreground border-none outline-none bg-transparent financial-number min-w-0"
            />
          </>
        ) : (
          <>
            <span className="text-[17px] font-bold text-foreground financial-number flex-1">
              {value ? `£${value}` : <span className="text-muted-foreground text-[13px] font-normal">Enter balance…</span>}
            </span>
            <button
              onClick={startEdit}
              className="p-1 bg-transparent border border-border rounded-[var(--radius)] cursor-pointer text-muted-foreground hover:bg-accent hover:text-foreground transition-colors flex items-center"
            >
              <Pencil size={11} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export function StatsBar({ stmtBal, onStmtBalChange, debitIn = 0, creditOut = 0 }: StatsBarProps) {
  const parsed = parseFloat((stmtBal || "").replace(/,/g, ""));
  const hasBal = stmtBal && !isNaN(parsed);
  const diff = hasBal ? parsed - LEDGER_TOTAL : 0;
  const diffZero = Math.abs(diff) < 0.01;

  const fmt = (n: number) => "£" + n.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div className="flex gap-3 py-2.5">
      {tile("£130,347.28", "Beginning Balance", "From prev. reconciliation")}
      {tile(
        <span style={{ color: "var(--positive)" }}>{debitIn > 0 ? fmt(debitIn) : "£0.00"}</span>,
        "Debit In", "Credits received"
      )}
      {tile(
        <span style={{ color: "var(--destructive)" }}>{creditOut > 0 ? fmt(creditOut) : "£0.00"}</span>,
        "Credit Out", "Debits paid out"
      )}
      <StmtBalanceField value={stmtBal} onChange={onStmtBalChange} />
      {hasBal && (
        <div
          className="flex-1 px-4 py-2.5 rounded-[var(--radius)] border shadow-[0_1px_3px_rgba(0,0,0,.06)]"
          style={{
            background: diffZero ? "rgba(0,232,157,.04)" : "rgba(255,39,95,.03)",
            borderColor: diffZero ? "rgba(0,232,157,.15)" : "rgba(255,39,95,.12)",
          }}
        >
          <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[.06em] mb-[3px]">Difference</div>
          <div className="text-[17px] font-bold financial-number" style={{ color: diffZero ? "var(--positive)" : "var(--destructive)" }}>
            {diffZero ? "£0.00" : (diff < 0 ? "−" : "+") + "£" + Math.abs(diff).toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          {diffZero && <div className="text-[11px] mt-px" style={{ color: "var(--positive)" }}>Balanced ✓</div>}
        </div>
      )}
    </div>
  );
}
