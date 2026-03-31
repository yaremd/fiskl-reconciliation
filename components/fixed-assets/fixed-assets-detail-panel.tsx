"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { X, Edit, ArchiveX } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { calcSchedule, getCurrentNBV } from "@/lib/fixed-assets/depreciation";
import { GL_ACCOUNTS } from "@/types/fixed-assets";
import type { FixedAsset } from "@/types/fixed-assets";

const CATEGORY_CLASSES: Record<string, string> = {
  "1400": "bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-300",
  "1410": "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  "1420": "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300",
  "1430": "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  "1440": "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300",
  "1450": "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
  "1460": "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  "1470": "bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-300",
};

const METHOD_LABELS: Record<string, string> = {
  sl: "Straight-Line",
  db: "Declining Balance",
  ddb: "Double Declining",
  syd: "Sum-of-Years-Digits",
  uop: "Units of Production",
};

function fmtCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

interface AssetDetailPanelProps {
  asset: FixedAsset;
  onClose: () => void;
  onDispose: (id: string) => void;
}

export function AssetDetailPanel({ asset, onClose, onDispose }: AssetDetailPanelProps) {
  const router = useRouter();

  const schedule = useMemo(
    () => calcSchedule(asset.method, asset.cost, asset.residual, asset.life),
    [asset.method, asset.cost, asset.residual, asset.life]
  );

  const { nbv, percentDepreciated, currentYearDepr } = useMemo(
    () => getCurrentNBV(schedule, asset.acquisitionDate),
    [schedule, asset.acquisitionDate]
  );

  const maxBarDepr = useMemo(
    () => Math.max(...schedule.slice(0, 10).map((r) => r.depreciation), 1),
    [schedule]
  );

  const statusBadge =
    asset.status === "active" ? (
      <Badge className="bg-positive/10 text-positive border-positive/20 text-xs">Active</Badge>
    ) : asset.status === "done" ? (
      <Badge variant="outline" className="bg-muted text-muted-foreground text-xs">
        Fully Depreciated
      </Badge>
    ) : (
      <Badge variant="outline" className="bg-muted/50 text-muted-foreground/60 text-xs">
        Disposed
      </Badge>
    );

  return (
    <Card className="border overflow-hidden">
      {/* Header */}
      <div className="flex items-start justify-between px-4 pt-4 pb-3 border-b">
        <div className="flex-1 min-w-0 pr-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                CATEGORY_CLASSES[asset.glAssetAccount] ?? "bg-muted text-muted-foreground"
              }`}
            >
              {GL_ACCOUNTS[asset.glAssetAccount] ?? asset.glAssetAccount}
            </span>
            {statusBadge}
          </div>
          <h2 className="mt-1.5 text-sm font-semibold leading-snug truncate">{asset.name}</h2>
          {asset.description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
              {asset.description}
            </p>
          )}
        </div>
        <Button variant="ghost" size="sm" onClick={onClose} className="h-7 w-7 p-0 shrink-0">
          <X className="h-4 w-4" />
        </Button>
      </div>

      <CardContent className="p-0 overflow-y-auto max-h-[calc(100vh-220px)]">
        {/* Key details grid */}
        <div className="px-4 py-3 grid grid-cols-2 gap-y-3 gap-x-4 border-b">
          {[
            { label: "Cost", value: fmtCurrency(asset.cost) },
            { label: "Residual", value: fmtCurrency(asset.residual) },
            { label: "Useful Life", value: `${asset.life} yr${asset.life !== 1 ? "s" : ""}` },
            { label: "Method", value: METHOD_LABELS[asset.method] ?? asset.method },
            { label: "GL Asset", value: `${asset.glAssetAccount} — ${GL_ACCOUNTS[asset.glAssetAccount] ?? ""}` },
            { label: "GL Accum", value: `${asset.glAccumAccount} — Acc. Depr.` },
            { label: "Acquired", value: fmtDate(asset.acquisitionDate) },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <p className="text-xs mt-0.5 font-medium truncate">{value}</p>
            </div>
          ))}
        </div>

        {/* Depreciation progress */}
        {schedule.length > 0 && (
          <div className="px-4 py-3 border-b space-y-2">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Depreciation Progress
            </p>
            <div className="flex items-end justify-between">
              <div>
                <p className="text-lg font-bold tabular-nums">{fmtCurrency(nbv)}</p>
                <p className="text-xs text-muted-foreground">Current book value</p>
              </div>
              <p className="text-sm font-semibold tabular-nums text-primary">
                {percentDepreciated}%
              </p>
            </div>
            <div className="h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-500"
                style={{ width: `${Math.min(100, percentDepreciated)}%` }}
              />
            </div>
            {currentYearDepr > 0 && (
              <p className="text-xs text-muted-foreground">
                Annual charge: {fmtCurrency(currentYearDepr)}
              </p>
            )}
          </div>
        )}

        {/* Mini bar chart */}
        {schedule.length > 0 && (
          <div className="px-4 py-3 border-b">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Depreciation by Year
              </p>
              <button
                onClick={() => router.push(`/fixed-assets/${asset.id}/edit#schedule-preview`)}
                className="text-[10px] font-medium text-primary hover:underline"
              >
                View Schedule
              </button>
            </div>
            <div className="flex items-end gap-1 h-14">
              {schedule.slice(0, 10).map((row) => (
                <div
                  key={row.year}
                  className="flex-1 min-w-0 flex flex-col items-center gap-0.5"
                  title={`Year ${row.year}: ${fmtCurrency(row.depreciation)}`}
                >
                  <div
                    className="w-full rounded-t-sm bg-primary/60 transition-all"
                    style={{ height: `${Math.round((row.depreciation / maxBarDepr) * 48)}px` }}
                  />
                  <span className="text-[9px] text-muted-foreground tabular-nums">{row.year}</span>
                </div>
              ))}
              {schedule.length > 10 && (
                <div className="flex flex-col items-center gap-0.5">
                  <div className="w-4 flex items-end justify-center h-12">
                    <span className="text-[10px] text-muted-foreground">…</span>
                  </div>
                  <span className="text-[9px] text-muted-foreground">+{schedule.length - 10}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="px-4 py-3 flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5"
            onClick={() => router.push(`/fixed-assets/${asset.id}/edit`)}
          >
            <Edit className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1 gap-1.5"
            disabled={asset.status === "disposed"}
            onClick={() => onDispose(asset.id)}
          >
            <ArchiveX className="h-3.5 w-3.5" />
            Dispose
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
