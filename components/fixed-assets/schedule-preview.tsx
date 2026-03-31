"use client";

import { useMemo, useState } from "react";
import { calcSchedule } from "@/lib/fixed-assets/depreciation";
import type { DepreciationMethod } from "@/types/fixed-assets";

interface SchedulePreviewProps {
  cost: number;
  residual: number;
  life: number;
  method: DepreciationMethod;
  acquisitionDate: string;
}

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

export function SchedulePreview({
  cost,
  residual,
  life,
  method,
  acquisitionDate,
}: SchedulePreviewProps) {
  const [showAll, setShowAll] = useState(false);
  const DISPLAY_LIMIT = 10;

  const schedule = useMemo(
    () => calcSchedule(method, cost, residual, life),
    [method, cost, residual, life]
  );

  if (method === "uop") {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Units of Production requires usage data — schedule will be generated once production
        figures are recorded.
      </div>
    );
  }

  if (cost <= 0 || life <= 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Enter cost and useful life above to preview the depreciation schedule.
      </div>
    );
  }

  if (schedule.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Invalid values — residual value must be less than cost.
      </div>
    );
  }

  const annualCharge = schedule[0]?.depreciation ?? 0;
  const totalDepreciable = cost - residual;

  // End date: acquisitionDate + life years
  let endDateStr = "—";
  if (acquisitionDate) {
    try {
      const d = new Date(acquisitionDate + "T00:00:00");
      d.setFullYear(d.getFullYear() + life);
      endDateStr = d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } catch {
      // ignore
    }
  }

  const displayedRows = showAll ? schedule : schedule.slice(0, DISPLAY_LIMIT);
  const hasMore = schedule.length > DISPLAY_LIMIT;

  return (
    <div className="space-y-4">
      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Yr 1 charge", value: fmtCurrency(annualCharge) },
          { label: "Total depreciable", value: fmtCurrency(totalDepreciable) },
          { label: "Periods", value: `${life} yr${life !== 1 ? "s" : ""}` },
          { label: "End date", value: endDateStr },
        ].map((stat) => (
          <div key={stat.label} className="rounded-lg border border-border bg-muted/30 px-4 py-3">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              {stat.label}
            </p>
            <p className="mt-0.5 text-sm font-semibold tabular-nums">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Schedule table */}
      <div className="rounded-lg border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-4 py-2 text-left font-medium text-muted-foreground w-12">Year</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Opening NBV</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground bg-primary/5">
                  Depreciation
                </th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Accumulated</th>
                <th className="px-4 py-2 text-right font-medium text-muted-foreground">Closing NBV</th>
              </tr>
            </thead>
            <tbody>
              {displayedRows.map((row) => (
                <tr key={row.year} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-2 font-medium">{row.year}</td>
                  <td className="px-4 py-2 text-right tabular-nums">{fmtCurrency(row.beginNBV)}</td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium text-primary bg-primary/5">
                    {fmtCurrency(row.depreciation)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums text-muted-foreground">
                    {fmtCurrency(row.accumDepreciation)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">{fmtCurrency(row.endNBV)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {hasMore && !showAll && (
          <div className="border-t px-4 py-2.5 text-center">
            <button
              type="button"
              onClick={() => setShowAll(true)}
              className="text-xs text-primary hover:underline"
            >
              Show all {schedule.length} years
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
