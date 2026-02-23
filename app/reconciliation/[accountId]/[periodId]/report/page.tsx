"use client";

import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { BRAND_GRADIENT } from "@/lib/utils";

const SUMMARY_ROWS = [
  ["Beginning", "£130,347.28", false],
  ["Ending",    "£142,890.50", false],
  ["Ledger",    "£142,834.72", false],
  ["Difference","£0.00",       true],
] as const;

const AI_ROWS = [
  ["Total",        "33",       "var(--foreground)"],
  ["Auto",         "28 (85%)", "var(--positive)"],
  ["AI Assisted",  "4",        "var(--warning)"],
  ["Manual",       "2",        "var(--primary)"],
] as const;

export default function ReportPage() {
  const router = useRouter();

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[20px] font-bold text-foreground m-0">
              Reconciliation Report
            </h1>
            <Badge variant="positive">Approved</Badge>
          </div>
          <div className="text-[13px] text-muted-foreground">
            HSBC Current Account · Q2 2025
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => router.push("/reconciliation")}
        >
          ← Back to Accounts
        </Button>
      </div>

      {/* ── Summary + AI Performance ────────────────────────────────────────── */}
      <Card className="mb-5">
        <CardContent className="p-6">
          <div className="flex gap-8">
            {/* Summary */}
            <div className="flex-1">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[.05em] mb-3">
                Summary
              </div>
              <div className="grid grid-cols-2 gap-4">
                {SUMMARY_ROWS.map(([label, value, isPositive]) => (
                  <div key={label}>
                    <div className="text-[11px] text-muted-foreground mb-0.5">
                      {label}
                    </div>
                    <div
                      className="text-[17px] font-bold"
                      style={{
                        color: isPositive
                          ? "var(--positive)"
                          : "var(--foreground)",
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Vertical divider */}
            <div className="w-px bg-border" />

            {/* AI Performance */}
            <div className="flex-1">
              <div className="text-[10px] font-semibold text-muted-foreground uppercase tracking-[.05em] mb-3">
                AI Performance
              </div>
              <div className="grid grid-cols-2 gap-4">
                {AI_ROWS.map(([label, value, color]) => (
                  <div key={label}>
                    <div className="text-[11px] text-muted-foreground mb-0.5">
                      {label}
                    </div>
                    <div
                      className="text-[17px] font-bold"
                      style={{ color }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── Approval card ───────────────────────────────────────────────────── */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2.5">
            {/* Avatar */}
            <div
              style={{ background: BRAND_GRADIENT }}
              className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0"
            >
              AL
            </div>

            {/* Text */}
            <div>
              <div className="text-[13px] font-semibold text-foreground">
                Approved by Alina
              </div>
              <div className="text-[11px] text-muted-foreground">
                30 Jun 2025 at 14:32 GMT
              </div>
            </div>

            {/* Badge */}
            <div className="ml-auto">
              <Badge variant="positive">Reconciled</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
