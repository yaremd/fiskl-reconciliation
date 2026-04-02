"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  PlusCircle, Search, ArrowUpDown, ArrowUp, ArrowDown,
  Download, Columns, Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InvoiceRowActions } from "./invoice-row-actions";
import { InvoiceBulkActions } from "./invoice-bulk-actions";
import { getInvoices, deleteInvoices, bulkUpdateStatus } from "@/lib/invoices/invoice-store";
import {
  calcInvoiceTotals, calcAmountDue, fmtCurrency,
  INVOICE_STATUSES, STATUS_COLORS,
} from "@/types/invoices";
import type { Invoice, InvoiceStatus } from "@/types/invoices";
import { cn } from "@/lib/utils";

type SortField = "number" | "clientName" | "issueDate" | "dueDate" | "total" | "status";
type SortDir = "asc" | "desc";

const COL_VIS_KEY = "invoice_col_visibility";

const ALL_COLUMNS = ["number", "client", "issueDate", "dueDate", "status", "total"] as const;
type ColKey = (typeof ALL_COLUMNS)[number];
const COL_LABELS: Record<ColKey, string> = {
  number: "#",
  client: "Client",
  issueDate: "Issue Date",
  dueDate: "Due Date",
  status: "Status",
  total: "Total",
};

function loadColVis(): Record<ColKey, boolean> {
  const defaults: Record<ColKey, boolean> = {
    number: true, client: true, issueDate: true,
    dueDate: true, status: true, total: true,
  };
  if (typeof window === "undefined") return defaults;
  try {
    const saved = JSON.parse(localStorage.getItem(COL_VIS_KEY) ?? "{}");
    return { ...defaults, ...saved };
  } catch {
    return defaults;
  }
}

function saveColVis(vis: Record<ColKey, boolean>) {
  localStorage.setItem(COL_VIS_KEY, JSON.stringify(vis));
}

function fmtDate(d: string) {
  if (!d) return "—";
  try {
    return new Date(d + "T00:00:00").toLocaleDateString("en-US", {
      month: "short", day: "numeric", year: "numeric",
    });
  } catch {
    return d;
  }
}

function exportCsv(invoices: Invoice[]) {
  const headers = ["Number", "Client", "Issue Date", "Due Date", "Status", "Subtotal", "Tax", "Total"];
  const rows = invoices.map((inv) => {
    const t = calcInvoiceTotals(inv);
    return [
      inv.number, inv.clientName, inv.issueDate, inv.dueDate, inv.status,
      t.subtotal.toFixed(2), t.taxAmount.toFixed(2), t.total.toFixed(2),
    ];
  });
  const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `invoices-${new Date().toISOString().split("T")[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

interface SortIconProps { field: SortField; sortField: SortField; sortDir: SortDir; }
function SortIcon({ field, sortField, sortDir }: SortIconProps) {
  if (field !== sortField) return <ArrowUpDown className="ml-1 h-3 w-3 opacity-40" />;
  return sortDir === "asc"
    ? <ArrowUp   className="ml-1 h-3 w-3 text-primary" />
    : <ArrowDown className="ml-1 h-3 w-3 text-primary" />;
}

export function InvoiceList() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [sortField, setSortField] = useState<SortField>("issueDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [colVis, setColVis] = useState<Record<ColKey, boolean>>(loadColVis);

  useEffect(() => { setInvoices(getInvoices()); }, []);

  function refresh() { setInvoices(getInvoices()); }

  function handleSort(field: SortField) {
    if (field === sortField) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function toggleColVis(col: ColKey) {
    setColVis((prev) => {
      const next = { ...prev, [col]: !prev[col] };
      saveColVis(next);
      return next;
    });
  }

  // KPIs
  const kpis = useMemo(() => {
    const outstanding = invoices
      .filter((i) => ["Open", "Sent", "Partial"].includes(i.status))
      .reduce((s, i) => s + calcAmountDue(i), 0);
    const overdue = invoices
      .filter((i) => i.status === "Overdue")
      .reduce((s, i) => s + calcAmountDue(i), 0);
    const draft = invoices.filter((i) => i.status === "Open").length;
    const now = new Date();
    const paidThisMonth = invoices
      .filter((i) => {
        if (i.status !== "Paid") return false;
        const u = new Date(i.updatedAt);
        return u.getMonth() === now.getMonth() && u.getFullYear() === now.getFullYear();
      })
      .reduce((s, i) => s + calcInvoiceTotals(i).total, 0);
    return { outstanding, overdue, draft, paidThisMonth };
  }, [invoices]);

  // Filtered + sorted
  const filtered = useMemo(() => {
    let list = invoices;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((i) =>
        i.number.toLowerCase().includes(q) ||
        i.clientName.toLowerCase().includes(q) ||
        i.clientEmail.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") {
      list = list.filter((i) => i.status === statusFilter);
    }
    return [...list].sort((a, b) => {
      let av: string | number = 0, bv: string | number = 0;
      switch (sortField) {
        case "number":     av = a.number;     bv = b.number;     break;
        case "clientName": av = a.clientName; bv = b.clientName; break;
        case "issueDate":  av = a.issueDate;  bv = b.issueDate;  break;
        case "dueDate":    av = a.dueDate;    bv = b.dueDate;    break;
        case "total":      av = calcInvoiceTotals(a).total; bv = calcInvoiceTotals(b).total; break;
        case "status":     av = a.status;     bv = b.status;     break;
      }
      if (av < bv) return sortDir === "asc" ? -1 : 1;
      if (av > bv) return sortDir === "asc" ? 1 : -1;
      return 0;
    });
  }, [invoices, search, statusFilter, sortField, sortDir]);

  // Selection
  const allChecked = filtered.length > 0 && filtered.every((i) => selectedIds.has(i.id));
  const someChecked = filtered.some((i) => selectedIds.has(i.id)) && !allChecked;

  function toggleAll() {
    if (allChecked) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((i) => i.id)));
    }
  }

  function toggleOne(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  function handleBulkDelete(ids: string[]) {
    deleteInvoices(ids);
    setSelectedIds(new Set());
    refresh();
  }

  function handleBulkStatus(ids: string[], status: InvoiceStatus) {
    bulkUpdateStatus(ids, status);
    setSelectedIds(new Set());
    refresh();
  }

  function handleSortHeader(field: SortField) {
    return (
      <button
        className="flex items-center text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
        onClick={() => handleSort(field)}
      >
        {COL_LABELS[field as ColKey] ?? field}
        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </button>
    );
  }

  return (
    <div className="space-y-4 p-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Outstanding", value: fmtCurrency(kpis.outstanding), sub: "Open + Sent + Partial" },
          { label: "Overdue",     value: fmtCurrency(kpis.overdue),     sub: "Past due date" },
          { label: "Open Drafts", value: String(kpis.draft),            sub: "Not yet sent" },
          { label: "Paid (this month)", value: fmtCurrency(kpis.paidThisMonth), sub: "Revenue collected" },
        ].map((k) => (
          <Card key={k.label} className="border-border">
            <CardContent className="px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{k.label}</p>
              <p className="mt-1 text-xl font-bold tabular-nums text-foreground">{k.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <Card className="border-border">
        <CardContent className="p-0">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 px-4 py-3 border-b border-border">
            <div className="relative flex-1 min-w-[180px] max-w-xs">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search invoices…"
                className="h-8 pl-8 text-sm"
              />
            </div>

            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InvoiceStatus | "all")}>
              <SelectTrigger className="h-8 w-[130px] text-xs">
                <SelectValue placeholder="All statuses" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {INVOICE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-semibold", STATUS_COLORS[s])}>
                      {s}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="ml-auto flex items-center gap-2">
              {/* Column visibility */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs">
                    <Columns className="h-3.5 w-3.5" />
                    Columns
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {ALL_COLUMNS.map((col) => (
                    <DropdownMenuItem
                      key={col}
                      onClick={() => toggleColVis(col)}
                      className="flex items-center gap-2"
                    >
                      <span className={cn("h-3.5 w-3.5 flex items-center justify-center", colVis[col] ? "text-primary" : "text-transparent")}>
                        <Check className="h-3 w-3" />
                      </span>
                      {COL_LABELS[col]}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Export */}
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => exportCsv(filtered)}
              >
                <Download className="h-3.5 w-3.5" />
                Export
              </Button>

              <Button
                size="sm"
                className="h-8 gap-1.5 text-xs"
                onClick={() => router.push("/invoices/new")}
              >
                <PlusCircle className="h-3.5 w-3.5" />
                New Invoice
              </Button>
            </div>
          </div>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <div className="px-4 py-2 border-b border-border bg-muted/30">
              <InvoiceBulkActions
                selectedIds={[...selectedIds]}
                onDelete={handleBulkDelete}
                onStatusChange={handleBulkStatus}
                onClear={() => setSelectedIds(new Set())}
              />
            </div>
          )}

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10 pl-4">
                  <Checkbox
                    checked={allChecked}
                    ref={(el) => { if (el) el.dataset.indeterminate = someChecked ? "true" : "false"; }}
                    onCheckedChange={toggleAll}
                    className={cn("border-input", someChecked && "[&>button]:bg-primary/20")}
                    aria-label="Select all"
                  />
                </TableHead>
                {colVis.number   && <TableHead>{handleSortHeader("number")}</TableHead>}
                {colVis.client   && <TableHead>{handleSortHeader("clientName" as SortField)}</TableHead>}
                {colVis.issueDate && <TableHead>{handleSortHeader("issueDate")}</TableHead>}
                {colVis.dueDate  && <TableHead>{handleSortHeader("dueDate")}</TableHead>}
                {colVis.status   && <TableHead>{handleSortHeader("status")}</TableHead>}
                {colVis.total    && (
                  <TableHead className="text-right">
                    <button
                      className="flex items-center justify-end w-full text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => handleSort("total")}
                    >
                      Total
                      <SortIcon field="total" sortField={sortField} sortDir={sortDir} />
                    </button>
                  </TableHead>
                )}
                <TableHead className="w-10" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                    {search || statusFilter !== "all" ? "No invoices match your filters." : "No invoices yet. Create your first one!"}
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((inv) => {
                  const t = calcInvoiceTotals(inv);
                  return (
                    <TableRow
                      key={inv.id}
                      className="cursor-pointer hover:bg-muted/30"
                      onClick={() => router.push(`/invoices/${inv.id}/edit`)}
                    >
                      <TableCell className="pl-4" onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(inv.id)}
                          onCheckedChange={() => toggleOne(inv.id)}
                          aria-label={`Select ${inv.number}`}
                        />
                      </TableCell>
                      {colVis.number && (
                        <TableCell className="font-medium text-xs">{inv.number}</TableCell>
                      )}
                      {colVis.client && (
                        <TableCell>
                          <div className="text-sm font-medium truncate max-w-[160px]">{inv.clientName || <span className="text-muted-foreground italic">No client</span>}</div>
                          {inv.clientEmail && (
                            <div className="text-xs text-muted-foreground truncate max-w-[160px]">{inv.clientEmail}</div>
                          )}
                        </TableCell>
                      )}
                      {colVis.issueDate && (
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(inv.issueDate)}</TableCell>
                      )}
                      {colVis.dueDate && (
                        <TableCell className="text-xs text-muted-foreground whitespace-nowrap">{fmtDate(inv.dueDate)}</TableCell>
                      )}
                      {colVis.status && (
                        <TableCell>
                          <span className={cn(
                            "rounded-full border px-2.5 py-0.5 text-[11px] font-semibold",
                            STATUS_COLORS[inv.status]
                          )}>
                            {inv.status}
                          </span>
                        </TableCell>
                      )}
                      {colVis.total && (
                        <TableCell className="text-right tabular-nums font-medium text-sm">
                          {fmtCurrency(t.total, inv.currency)}
                        </TableCell>
                      )}
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <InvoiceRowActions
                          invoice={inv}
                          onDeleted={refresh}
                          onDuplicated={refresh}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
