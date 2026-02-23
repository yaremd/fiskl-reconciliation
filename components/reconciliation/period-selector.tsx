"use client";

import { useRef, useState } from "react";
import { Lock } from "lucide-react";

interface PeriodSelectorProps {
  periodStart: string;
  setPeriodStart: (v: string) => void;
  periodEnd: string;
  setPeriodEnd: (v: string) => void;
}

function fmtDate(val: string) {
  if (!val) return "—";
  const d = new Date(val + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function PeriodSelector({ periodStart, setPeriodStart, periodEnd, setPeriodEnd }: PeriodSelectorProps) {
  const endInputRef = useRef<HTMLInputElement>(null);
  const [endFocused, setEndFocused] = useState(false);

  return (
    <div className="flex items-center gap-1.5 mt-0.5">
      <span className="text-[13px] text-muted-foreground flex items-center gap-1">
        <Lock size={10} className="text-muted-foreground flex-shrink-0" />
        {fmtDate(periodStart)}
      </span>
      <span className="text-muted-foreground text-[13px]">→</span>
      <span
        onClick={() => endInputRef.current?.showPicker?.()}
        className="text-[13px] font-semibold cursor-pointer transition-colors"
        style={{
          color: endFocused ? "var(--primary)" : "var(--foreground)",
          borderBottom: `1px dashed ${endFocused ? "var(--primary)" : "var(--border)"}`,
        }}
      >
        {fmtDate(periodEnd)}
      </span>
      <input
        ref={endInputRef}
        type="date"
        value={periodEnd}
        onChange={e => setPeriodEnd(e.target.value)}
        onFocus={() => setEndFocused(true)}
        onBlur={() => setEndFocused(false)}
        className="absolute opacity-0 pointer-events-none w-0 h-0"
      />
      <span className="text-[11px] text-muted-foreground">· hsbc_q2_2025.csv</span>
    </div>
  );
}
