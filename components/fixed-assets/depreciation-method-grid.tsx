"use client";

import { cn } from "@/lib/utils";
import type { DepreciationMethod } from "@/types/fixed-assets";

interface DepreciationMethodGridProps {
  value: DepreciationMethod;
  onChange: (method: DepreciationMethod) => void;
}

const METHODS: {
  code: DepreciationMethod;
  name: string;
  description: string;
}[] = [
  {
    code: "sl",
    name: "Straight-Line",
    description: "Equal depreciation every year until residual value",
  },
  {
    code: "db",
    name: "Declining Balance",
    description: "Fixed percentage of book value each year",
  },
  {
    code: "ddb",
    name: "Double Declining",
    description: "2× declining balance, switches to SL in later years",
  },
  {
    code: "syd",
    name: "Sum-of-Years-Digits",
    description: "Accelerated method, heavier charge in early years",
  },
  {
    code: "uop",
    name: "Units of Production",
    description: "Depreciation tied to actual usage or output",
  },
];

export function DepreciationMethodGrid({ value, onChange }: DepreciationMethodGridProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {METHODS.map((m) => {
        const isSelected = value === m.code;
        return (
          <button
            key={m.code}
            type="button"
            onClick={() => onChange(m.code)}
            className={cn(
              "flex flex-col items-start rounded-lg border p-3 text-left transition-all",
              isSelected
                ? "border-primary/40 bg-primary/5 ring-2 ring-primary"
                : "border-border hover:border-primary/30 hover:bg-muted/50"
            )}
          >
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary mb-1">
              {m.code.toUpperCase()}
            </span>
            <p className="text-xs font-semibold text-foreground leading-snug">{m.name}</p>
            <p className="mt-1 text-[11px] text-muted-foreground leading-snug">{m.description}</p>
          </button>
        );
      })}
    </div>
  );
}
