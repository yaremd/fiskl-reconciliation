"use client";

import { ChevronDown } from "lucide-react";
import { fmtGbp } from "@/lib/utils";

interface SecHdrProps {
  icon: React.ReactNode;
  color: string;
  title: string;
  itemCount?: number;
  totalAmt?: number;
  open: boolean;
  onToggle?: () => void;
}

export function SecHdr({ icon, color, title, itemCount, totalAmt, open, onToggle }: SecHdrProps) {
  return (
    <div
      onClick={onToggle}
      className="flex items-center justify-between px-[18px] py-3 select-none"
      style={{ cursor: onToggle ? "pointer" : "default" }}
    >
      <div className="flex items-center gap-2">
        <span style={{ color }} className="flex items-center">{icon}</span>
        <span className="text-[13px] font-semibold" style={{ color }}>{title}</span>
        {itemCount != null && (
          <span className="inline-flex items-center px-[7px] py-px rounded-full bg-muted border border-border text-[11px] font-semibold text-muted-foreground">
            {itemCount}
          </span>
        )}
        {totalAmt != null && (
          <span className="text-[12px] text-muted-foreground financial-number">
            {fmtGbp(totalAmt)}
          </span>
        )}
      </div>
      {onToggle && (
        <ChevronDown
          size={15}
          className="text-muted-foreground transition-transform"
          style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)" }}
        />
      )}
    </div>
  );
}
