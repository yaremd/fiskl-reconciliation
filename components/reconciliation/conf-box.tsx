"use client";

import { Check, Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { AttentionItem } from "@/types/reconciliation";

interface ConfBoxProps {
  item: AttentionItem;
  onAccept: (item: AttentionItem, idx?: number) => void;
  onDismissBoth: (item: AttentionItem) => void;
}

export function ConfBox({ item, onAccept, onDismissBoth }: ConfBoxProps) {
  // One-to-many
  if (item.type === "one-to-many") {
    return (
      <div className="w-full p-2.5 rounded-xl border flex flex-col gap-2 box-border"
        style={{ borderColor: "rgba(0,120,255,.25)", background: "rgba(0,120,255,.03)" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1 text-primary">
            <Star size={10} fill="currentColor" stroke="none" className="flex-shrink-0" />
            <span className="text-[10px] font-semibold">AI Suggested</span>
          </div>
          <Badge variant="neutral" className="text-[10px] px-1.5 py-0">1 → many</Badge>
        </div>
        {item.ex && <div className="text-[10px] text-muted-foreground text-center leading-snug">{item.ex}</div>}
        <button
          onClick={e => { e.stopPropagation(); onAccept(item); }}
          className="w-full py-[5px] px-1.5 rounded-[var(--radius)] text-[11px] font-semibold flex items-center justify-center gap-[3px] transition-colors cursor-pointer"
          style={{ background: "rgba(0,232,157,.12)", color: "#00AD68", border: "1px solid rgba(0,232,157,.4)" }}
          onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,232,157,.22)")}
          onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,232,157,.12)")}
        >
          <Check size={10} /> Accept
        </button>
      </div>
    );
  }

  // Duplicate
  if (item.type === "Duplicate") {
    const candidates = item.candidates || [item.L];
    return (
      <TooltipProvider>
        <div className="w-full p-2.5 rounded-xl border flex flex-col gap-2 box-border"
          style={{ borderColor: "rgba(255,89,5,.3)", background: "rgba(255,89,5,.04)" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-bold" style={{ color: "var(--warning)" }}>{item.conf}%</span>
            <Badge variant="warning" className="text-[10px] px-1.5 py-0">Duplicate</Badge>
          </div>
          <div className="text-[10px] text-muted-foreground text-center leading-snug">
            <Tooltip>
              <TooltipTrigger asChild>
                <span className="cursor-default border-b border-dashed border-muted-foreground">
                  {candidates.length} entries · select to keep
                </span>
              </TooltipTrigger>
              <TooltipContent>Select the entries you want to keep. The rest will be deleted.</TooltipContent>
            </Tooltip>
          </div>
          <button
            onClick={e => { e.stopPropagation(); onAccept(item, 0); }}
            className="w-full py-[5px] text-white rounded-[var(--radius)] text-[11px] font-semibold flex items-center justify-center gap-1 transition-opacity cursor-pointer"
            style={{ background: "var(--primary)", border: "none" }}
            onMouseEnter={e => (e.currentTarget.style.opacity = ".88")}
            onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
          >
            <Check size={11} /> Resolve
          </button>
          <button
            onClick={e => { e.stopPropagation(); onDismissBoth(item); }}
            className="w-full py-[5px] bg-transparent text-muted-foreground border border-border rounded-[var(--radius)] text-[11px] font-semibold transition-colors hover:bg-accent cursor-pointer"
          >
            Ignore Duplication
          </button>
        </div>
      </TooltipProvider>
    );
  }

  // Normal AI anomaly
  const inner = (
    <div className="w-full p-2.5 rounded-xl border bg-muted flex flex-col gap-2 box-border cursor-default">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1 text-primary">
          <Star size={10} fill="currentColor" stroke="none" className="flex-shrink-0" />
          <span className="text-[10px] font-semibold">AI Suggested</span>
        </div>
        <Badge variant="neutral" className="text-[10px] px-1.5 py-0">{item.type}</Badge>
      </div>
      <button
        onClick={e => { e.stopPropagation(); onAccept(item); }}
        className="w-full py-[5px] px-1 rounded-[var(--radius)] text-[11px] font-semibold flex items-center justify-center gap-[3px] transition-colors cursor-pointer"
        style={{ background: "rgba(0,232,157,.12)", color: "#00AD68", border: "1px solid rgba(0,232,157,.4)" }}
        onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,232,157,.22)")}
        onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,232,157,.12)")}
      >
        <Check size={10} /> Accept
      </button>
    </div>
  );

  if (!item.ex) return inner;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{inner}</TooltipTrigger>
        <TooltipContent className="max-w-[230px]">
          <div className="text-[10px] font-semibold opacity-60 mb-1 uppercase tracking-[.05em]">AI Analysis</div>
          <div>{item.ex}</div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
