"use client";

import { Button } from "@/components/ui/button";
import { BRAND_GRADIENT } from "@/lib/utils";
import type { AttentionItem, MatchedItem } from "@/types/reconciliation";

interface BannerItem {
  id: string;
  item: { a: number };
}

interface BalanceBannerProps {
  selL: string[];
  selR: string[];
  allItems: BannerItem[];
  onResolve: () => void;
}

export function BalanceBanner({ selL, selR, allItems, onResolve }: BalanceBannerProps) {
  const lTotal = allItems.filter(m => selL.includes(m.id)).reduce((s, m) => s + Math.abs(m.item.a), 0);
  const rTotal = allItems.filter(m => selR.includes(m.id)).reduce((s, m) => s + Math.abs(m.item.a), 0);
  const diff = lTotal - rTotal;
  const balanced = lTotal > 0 && rTotal > 0 && Math.abs(diff) < 0.01;

  if (!selL.length && !selR.length) return null;

  return (
    <div className="fixed bottom-0 right-0 z-50 px-6 py-3 bg-background/95 backdrop-blur-sm border-t border-border shadow-[0_-4px_20px_rgba(0,0,0,.06)] flex items-center gap-4"
      style={{ left: "var(--sidebar-w, 256px)" }}
    >
      <div className="flex gap-5 flex-1 items-center">
        <div className="text-center">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">Ledger</div>
          <div className="text-[15px] font-bold text-foreground financial-number">£{lTotal.toFixed(2)}</div>
        </div>
        <div className="text-muted-foreground text-lg">⇄</div>
        <div className="text-center">
          <div className="text-[10px] font-semibold text-muted-foreground uppercase mb-0.5">Statement</div>
          <div className="text-[15px] font-bold text-foreground financial-number">£{rTotal.toFixed(2)}</div>
        </div>
        <div
          className="px-3 py-1 rounded-full text-xs font-bold border"
          style={{
            background: balanced ? "rgba(0,232,157,.1)" : "rgba(255,39,95,.08)",
            borderColor: balanced ? "rgba(0,232,157,.3)" : "rgba(255,39,95,.25)",
            color: balanced ? "var(--positive)" : "var(--destructive)",
          }}
        >
          {balanced ? "✓ Balanced" : `Diff: £${Math.abs(diff).toFixed(2)}`}
        </div>
      </div>
      <Button onClick={balanced ? onResolve : undefined} disabled={!balanced}>
        Resolve Selected
      </Button>
    </div>
  );
}
