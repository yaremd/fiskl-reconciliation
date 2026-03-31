"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowUpDown, ArrowUp, ArrowDown, Flag, PlusCircle, Search } from "lucide-react";
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { MileageRowActions } from "./mileage-row-actions";
import { MileageBulkActions } from "./mileage-bulk-actions";
import { getMileages, deleteMileages } from "@/lib/mileage/mileage-store";
import type { MileageItem } from "@/types/mileage";

type SortField = "name" | "occurDate" | "client" | "quantity" | "subtotal";
type SortDir = "asc" | "desc";
type BillingFilter = "all" | "billed" | "unbilled";

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

function fmtAmount(amount: number, currency: string): string {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />;
  return sortDir === "asc"
    ? <ArrowUp className="ml-1 h-3.5 w-3.5" />
    : <ArrowDown className="ml-1 h-3.5 w-3.5" />;
}

export function MileageList() {
  const router = useRouter();
  const [mileages, setMileages] = useState<MileageItem[]>([]);
  const [search, setSearch] = useState("");
  const [billingFilter, setBillingFilter] = useState<BillingFilter>("all");
  const [sortField, setSortField] = useState<SortField>("occurDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const refresh = useCallback(() => {
    setMileages(getMileages());
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let items = [...mileages];

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.client?.companyName ?? "").toLowerCase().includes(q) ||
          m.note.toLowerCase().includes(q)
      );
    }

    if (billingFilter === "billed") items = items.filter((m) => m.report);
    if (billingFilter === "unbilled") items = items.filter((m) => !m.report);

    items.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "occurDate":
          cmp = a.occurDate.localeCompare(b.occurDate);
          break;
        case "client":
          cmp = (a.client?.companyName ?? "").localeCompare(b.client?.companyName ?? "");
          break;
        case "quantity":
          cmp = (a.quantity ?? 0) - (b.quantity ?? 0);
          break;
        case "subtotal":
          cmp = a.subtotal - b.subtotal;
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return items;
  }, [mileages, search, billingFilter, sortField, sortDir]);

  const allSelected =
    filtered.length > 0 && filtered.every((m) => selectedIds.has(m.id));
  const someSelected = filtered.some((m) => selectedIds.has(m.id));

  const toggleAll = () => {
    if (allSelected) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((m) => m.id)));
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
    deleteMileages([id]);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    refresh();
  };

  const handleBulkDelete = (ids: string[]) => {
    deleteMileages(ids);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      ids.forEach((id) => next.delete(id));
      return next;
    });
    refresh();
  };

  const selectedItems = useMemo(
    () => mileages.filter((m) => selectedIds.has(m.id)),
    [mileages, selectedIds]
  );

  const SortableHead = ({
    field,
    children,
    className,
  }: {
    field: SortField;
    children: React.ReactNode;
    className?: string;
  }) => (
    <TableHead className={className}>
      <button
        className="flex items-center text-left font-medium text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => handleSort(field)}
      >
        {children}
        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </button>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Mileage</h1>
        <Button onClick={() => router.push("/mileage/new")} className="gap-1.5">
          <PlusCircle className="h-4 w-4" />
          New Mileage Entry
        </Button>
      </div>

      <Card className="border-0">
        <CardContent className="pt-5">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search mileage entries..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select
              value={billingFilter}
              onValueChange={(v) => setBillingFilter(v as BillingFilter)}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All entries</SelectItem>
                <SelectItem value="billed">Billed</SelectItem>
                <SelectItem value="unbilled">Unbilled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <MileageBulkActions
              selectedItems={selectedItems}
              onDelete={handleBulkDelete}
              onClearSelection={() => setSelectedIds(new Set())}
            />
          )}

          {/* Count */}
          <p className="text-xs text-muted-foreground mb-3">
            {filtered.length} {filtered.length === 1 ? "entry" : "entries"}
            {mileages.length !== filtered.length && ` of ${mileages.length}`}
          </p>

          {/* Table */}
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
                <SortableHead field="client" className="hidden lg:table-cell">
                  Client
                </SortableHead>
                <SortableHead field="occurDate">Date</SortableHead>
                <SortableHead field="quantity" className="hidden md:table-cell">
                  Distance
                </SortableHead>
                <TableHead className="hidden xl:table-cell text-muted-foreground font-medium">
                  Rate
                </TableHead>
                <SortableHead field="subtotal">Total</SortableHead>
                <TableHead className="hidden md:table-cell text-muted-foreground font-medium">
                  Status
                </TableHead>
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
                    {search || billingFilter !== "all"
                      ? "No entries match your filters."
                      : "No mileage entries yet. Create your first one!"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((mileage) => (
                  <TableRow
                    key={mileage.id}
                    className="cursor-pointer"
                    onClick={() => router.push(`/mileage/${mileage.id}/edit`)}
                    data-state={selectedIds.has(mileage.id) ? "selected" : undefined}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(mileage.id)}
                        onCheckedChange={() => toggleOne(mileage.id)}
                        aria-label="Select row"
                      />
                    </TableCell>

                    <TableCell>
                      <div className="flex items-center gap-1.5 min-w-[140px]">
                        <span className="font-medium truncate max-w-[220px]">
                          {mileage.name || (
                            <span className="text-muted-foreground italic">Untitled</span>
                          )}
                        </span>
                        {!mileage.quantity && (
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Flag className="h-3.5 w-3.5 text-destructive shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="text-xs">Distance not set</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )}
                      </div>
                    </TableCell>

                    <TableCell className="hidden lg:table-cell">
                      <span className="truncate max-w-[140px] block text-sm">
                        {mileage.client?.companyName ?? (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </span>
                    </TableCell>

                    <TableCell className="text-sm tabular-nums whitespace-nowrap">
                      {fmtDate(mileage.occurDate)}
                    </TableCell>

                    <TableCell className="hidden md:table-cell tabular-nums text-sm">
                      {mileage.quantity != null ? (
                        <>
                          {mileage.quantity.toFixed(1)} {mileage.unit}
                          {mileage.roundTrip && (
                            <span className="ml-1 text-xs text-muted-foreground">(RT)</span>
                          )}
                        </>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </TableCell>

                    <TableCell className="hidden xl:table-cell tabular-nums text-sm text-muted-foreground">
                      {fmtAmount(mileage.price, mileage.currency)}/{mileage.unit}
                    </TableCell>

                    <TableCell className="tabular-nums text-sm font-medium text-right">
                      {fmtAmount(mileage.subtotal, mileage.currency)}
                    </TableCell>

                    <TableCell className="hidden md:table-cell">
                      {mileage.report ? (
                        <Badge
                          variant="outline"
                          className="text-xs bg-positive/10 text-positive border-positive/20"
                        >
                          Billed
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">—</span>
                      )}
                    </TableCell>

                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <MileageRowActions mileage={mileage} onDelete={handleDelete} />
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
