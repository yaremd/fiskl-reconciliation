"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown, PlusCircle, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AssetRowActions } from "./fixed-assets-row-actions";
import { AssetBulkActions } from "./fixed-assets-bulk-actions";
import { AssetDetailPanel } from "./fixed-assets-detail-panel";
import {
  getFixedAssets,
  deleteFixedAssets,
  disposeAsset,
} from "@/lib/fixed-assets/fixed-assets-store";
import { calcSchedule, getCurrentNBV } from "@/lib/fixed-assets/depreciation";
import { GL_ACCOUNTS } from "@/types/fixed-assets";
import type { FixedAsset, AssetStatus } from "@/types/fixed-assets";

type SortField = "name" | "acquisitionDate" | "glAssetAccount" | "cost" | "status";
type SortDir = "asc" | "desc";

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

function SortIcon({
  field,
  sortField,
  sortDir,
}: {
  field: SortField;
  sortField: SortField;
  sortDir: SortDir;
}) {
  if (field !== sortField) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />;
  return sortDir === "asc" ? (
    <ArrowUp className="ml-1 h-3.5 w-3.5" />
  ) : (
    <ArrowDown className="ml-1 h-3.5 w-3.5" />
  );
}

export function FixedAssetsList() {
  const router = useRouter();
  const [assets, setAssets] = useState<FixedAsset[]>([]);
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [glAccountFilter, setGlAccountFilter] = useState<string | "all">("all");
  const [statusFilter, setStatusFilter] = useState<AssetStatus | "all">("all");
  const [sortField, setSortField] = useState<SortField>("acquisitionDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const refresh = useCallback(() => {
    setAssets(getFixedAssets());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // KPI calculations
  const kpis = useMemo(() => {
    const nonDisposed = assets.filter((a) => a.status !== "disposed");
    let totalNBV = 0;
    let totalAnnualDepr = 0;

    for (const a of nonDisposed) {
      const sched = calcSchedule(a.method, a.cost, a.residual, a.life);
      const { nbv, currentYearDepr } = getCurrentNBV(sched, a.acquisitionDate);
      totalNBV += nbv;
      if (a.status === "active") totalAnnualDepr += currentYearDepr;
    }

    return {
      totalAssets: nonDisposed.length,
      totalNBV,
      totalAnnualDepr,
      fullyDepreciated: assets.filter((a) => a.status === "done").length,
    };
  }, [assets]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let items = [...assets];

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (GL_ACCOUNTS[a.glAssetAccount] ?? "").toLowerCase().includes(q)
      );
    }

    if (glAccountFilter !== "all") items = items.filter((a) => a.glAssetAccount === glAccountFilter);
    if (statusFilter !== "all") items = items.filter((a) => a.status === statusFilter);

    items.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "acquisitionDate":
          cmp = a.acquisitionDate.localeCompare(b.acquisitionDate);
          break;
        case "glAssetAccount":
          cmp = a.glAssetAccount.localeCompare(b.glAssetAccount);
          break;
        case "cost":
          cmp = a.cost - b.cost;
          break;
        case "status":
          cmp = a.status.localeCompare(b.status);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return items;
  }, [assets, search, glAccountFilter, statusFilter, sortField, sortDir]);

  const selectedAsset = useMemo(
    () => assets.find((a) => a.id === selectedAssetId) ?? null,
    [assets, selectedAssetId]
  );

  const allSelected = filtered.length > 0 && filtered.every((a) => selectedIds.has(a.id));
  const someSelected = filtered.some((a) => selectedIds.has(a.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((a) => a.id)));
    }
  };

  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = (id: string) => {
    deleteFixedAssets([id]);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (selectedAssetId === id) setSelectedAssetId(null);
    refresh();
  };

  const handleBulkDelete = (ids: string[]) => {
    deleteFixedAssets(ids);
    setSelectedIds(new Set());
    if (ids.includes(selectedAssetId ?? "")) setSelectedAssetId(null);
    refresh();
  };

  const handleDispose = (id: string) => {
    disposeAsset(id);
    refresh();
  };

  const selectedItems = useMemo(
    () => assets.filter((a) => selectedIds.has(a.id)),
    [assets, selectedIds]
  );

  const SortableHead = ({
    field,
    children,
    className,
    align,
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
    align?: "right";
  }) => (
    <TableHead className={className}>
      <button
        className={`flex items-center text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors ${align === "right" ? "w-full justify-end" : "text-left"}`}
        onClick={() => handleSort(field)}
      >
        {children}
        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </button>
    </TableHead>
  );

  const hasFilters = search || glAccountFilter !== "all" || statusFilter !== "all";

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          {
            label: "Total Assets",
            value: kpis.totalAssets.toString(),
            sub: "excluding disposed",
          },
          {
            label: "Total Book Value",
            value: fmtCurrency(kpis.totalNBV),
            sub: "net of depreciation",
          },
          {
            label: "Annual Depreciation",
            value: fmtCurrency(kpis.totalAnnualDepr),
            sub: "current period",
          },
          {
            label: "Fully Depreciated",
            value: kpis.fullyDepreciated.toString(),
            sub: "at residual value",
          },
        ].map((kpi) => (
          <Card key={kpi.label} className="border">
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {kpi.label}
              </p>
              <p className="text-xl font-medium mt-1 tabular-nums">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Split panel */}
      <div className="flex gap-4 items-start">
        {/* Table panel */}
        <div className="flex-1 min-w-0">
          <Card className="border rounded-xl">
            <CardContent className="pt-5 pb-5">
              {/* Toolbar */}
              <div className="flex flex-col sm:flex-row gap-3 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assets…"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-8"
                  />
                </div>
                <Select
                  value={glAccountFilter}
                  onValueChange={(v) => setGlAccountFilter(v)}
                >
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All asset types</SelectItem>
                    {Object.entries(GL_ACCOUNTS).map(([code, label]) => (
                      <SelectItem key={code} value={code}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={statusFilter}
                  onValueChange={(v) => setStatusFilter(v as AssetStatus | "all")}
                >
                  <SelectTrigger className="w-[150px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="done">Fully Depreciated</SelectItem>
                    <SelectItem value="disposed">Disposed</SelectItem>
                  </SelectContent>
                </Select>
                <Button onClick={() => router.push("/fixed-assets/new")} className="gap-1.5 shrink-0">
                  <PlusCircle className="h-4 w-4" />
                  New Asset
                </Button>
              </div>

              {/* Bulk actions */}
              {selectedIds.size > 0 && (
                <AssetBulkActions
                  selectedItems={selectedItems}
                  onDelete={handleBulkDelete}
                  onClearSelection={() => setSelectedIds(new Set())}
                />
              )}

              {/* Count */}
              <p className="text-xs text-muted-foreground mb-3">
                {filtered.length} {filtered.length === 1 ? "asset" : "assets"}
                {assets.length !== filtered.length && ` of ${assets.length}`}
              </p>

              {/* Table */}
              <div className="-mx-4 [&_th:first-child]:pl-4 [&_td:first-child]:pl-4 [&_th:last-child]:pr-4 [&_td:last-child]:pr-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox
                        checked={allSelected ? true : someSelected ? "indeterminate" : false}
                        onCheckedChange={toggleAll}
                        aria-label="Select all"
                      />
                    </TableHead>
                    <SortableHead field="name">Name</SortableHead>
                    <SortableHead field="acquisitionDate" className="hidden sm:table-cell">
                      Acquired
                    </SortableHead>
                    <SortableHead field="glAssetAccount" className="hidden md:table-cell">
                      Asset Type
                    </SortableHead>
                    <TableHead className="text-muted-foreground font-medium hidden lg:table-cell">Method</TableHead>
                    <TableHead className="text-muted-foreground font-medium hidden lg:table-cell min-w-[140px] pr-8">Depr. Progress</TableHead>
                    <TableHead className="text-muted-foreground font-medium">Status</TableHead>
                    <SortableHead field="cost" className="hidden md:table-cell" align="right">
                      Cost
                    </SortableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtered.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={9}
                        className="text-center py-12 text-muted-foreground"
                      >
                        {hasFilters
                          ? "No assets match your filters."
                          : "No fixed assets yet. Create your first one!"}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filtered.map((asset) => {
                      const isSelected = selectedAssetId === asset.id;
                      return (
                        <TableRow
                          key={asset.id}
                          className="cursor-pointer"
                          onClick={() =>
                            setSelectedAssetId((prev) => (prev === asset.id ? null : asset.id))
                          }
                          data-state={
                            selectedIds.has(asset.id)
                              ? "selected"
                              : isSelected
                              ? "selected"
                              : undefined
                          }
                        >
                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedIds.has(asset.id)}
                              onCheckedChange={() => toggleOne(asset.id)}
                              aria-label="Select row"
                            />
                          </TableCell>

                          <TableCell>
                            <div className="min-w-[160px]">
                              <p className="font-medium truncate max-w-[220px]">{asset.name}</p>
                              {asset.description && (
                                <p className="text-xs text-muted-foreground truncate max-w-[220px] hidden lg:block">
                                  {asset.description}
                                </p>
                              )}
                            </div>
                          </TableCell>

                          <TableCell className="hidden sm:table-cell text-sm tabular-nums whitespace-nowrap">
                            {fmtDate(asset.acquisitionDate)}
                          </TableCell>

                          <TableCell className="hidden md:table-cell">
                            <span
                              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                                CATEGORY_CLASSES[asset.glAssetAccount] ??
                                "bg-muted text-muted-foreground"
                              }`}
                            >
                              {GL_ACCOUNTS[asset.glAssetAccount] ?? asset.glAssetAccount}
                            </span>
                          </TableCell>

                          <TableCell className="hidden lg:table-cell">
                            <span className="text-xs font-medium uppercase text-muted-foreground">
                              {asset.method === "sl" ? "SL" : asset.method === "db" ? "DB" : asset.method === "ddb" ? "DDB" : asset.method === "syd" ? "SYD" : "UoP"}
                            </span>
                          </TableCell>

                          <TableCell className="hidden lg:table-cell pr-8">
                            {(() => {
                              if (asset.method === "uop") return <span className="text-xs text-muted-foreground">—</span>;
                              const schedule = calcSchedule(asset.method, asset.cost, asset.residual, asset.life);
                              const { percentDepreciated } = getCurrentNBV(schedule, asset.acquisitionDate);
                              return (
                                <div className="flex items-center gap-2 min-w-[120px]">
                                  <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                                    <div
                                      className="h-full rounded-full bg-primary"
                                      style={{ width: `${Math.min(percentDepreciated, 100)}%` }}
                                    />
                                  </div>
                                  <span className="text-xs tabular-nums text-muted-foreground w-8 text-right">
                                    {Math.round(percentDepreciated)}%
                                  </span>
                                </div>
                              );
                            })()}
                          </TableCell>

                          <TableCell>
                            {asset.status === "active" ? (
                              <Badge className="bg-positive/10 text-positive border-positive/20 text-xs">
                                Active
                              </Badge>
                            ) : asset.status === "done" ? (
                              <Badge
                                variant="outline"
                                className="bg-muted text-muted-foreground text-xs"
                              >
                                Fully Depr.
                              </Badge>
                            ) : (
                              <Badge
                                variant="outline"
                                className="bg-muted/50 text-muted-foreground/60 text-xs"
                              >
                                Disposed
                              </Badge>
                            )}
                          </TableCell>

                          <TableCell className="hidden md:table-cell tabular-nums text-sm font-medium text-right">
                            {fmtCurrency(asset.cost)}
                          </TableCell>

                          <TableCell onClick={(e) => e.stopPropagation()}>
                            <AssetRowActions
                              asset={asset}
                              onDelete={handleDelete}
                              onDispose={handleDispose}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Detail panel */}
        {selectedAsset && (
          <div className="w-[340px] flex-shrink-0 sticky top-20 hidden md:block">
            <AssetDetailPanel
              asset={selectedAsset}
              onClose={() => setSelectedAssetId(null)}
              onDispose={handleDispose}
            />
          </div>
        )}
      </div>
    </div>
  );
}
