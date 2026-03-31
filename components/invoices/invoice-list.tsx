"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusCircle, Search, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { InvoiceRowActions } from "./invoice-row-actions";
import { InvoiceBulkActions } from "./invoice-bulk-actions";
import { getInvoices, deleteInvoices } from "@/lib/invoices/invoice-store";
import { calcInvoiceTotals, INVOICE_STATUSES, CURRENCY_SYMBOLS } from "@/types/invoices";
import type { Invoice, InvoiceStatus } from "@/types/invoices";

type SortField = "number" | "clientName" | "issueDate" | "dueDate" | "total" | "status";
type SortDir = "asc" | "desc";

const STATUS_CLASSES: Record<InvoiceStatus, string> = {
  Open:     "bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-900",
  Sent:     "bg-indigo-50 text-indigo-700 border border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-400 dark:border-indigo-900",
  Overdue:  "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900",
  Partial:  "bg-yellow-50 text-yellow-700 border border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-900",
  Paid:     "bg-green-50 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-900",
  Rejected: "bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-900",
};

function fmtCurrency(amount: number, currency: string) {
  const sym = CURRENCY_SYMBOLS[currency] ?? currency;
  return sym + amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(iso: string) {
  try {
    return new Date(iso + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch { return iso; }
}

function SortIcon({ field, sortField, sortDir }: { field: SortField; sortField: SortField; sortDir: SortDir }) {
  if (field !== sortField) return <ArrowUpDown className="ml-1 h-3.5 w-3.5 opacity-40" />;
  return sortDir === "asc"
    ? <ArrowUp className="ml-1 h-3.5 w-3.5" />
    : <ArrowDown className="ml-1 h-3.5 w-3.5" />;
}

export function InvoiceList() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<InvoiceStatus | "all">("all");
  const [sortField, setSortField] = useState<SortField>("issueDate");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  const refresh = useCallback(() => setInvoices(getInvoices()), []);
  useEffect(() => { refresh(); }, [refresh]);

  const kpis = useMemo(() => {
    const outstanding = invoices.filter((i) => ["Open", "Sent", "Overdue", "Partial"].includes(i.status));
    const overdue = invoices.filter((i) => i.status === "Overdue");
    const open = invoices.filter((i) => i.status === "Open");
    const thisMonth = new Date().toISOString().slice(0, 7);
    const paidThisMonth = invoices.filter((i) => i.status === "Paid" && i.issueDate.startsWith(thisMonth));

    function sumTotal(list: Invoice[]) {
      return list.reduce((acc, inv) => acc + calcInvoiceTotals(inv.lineItems).total, 0);
    }

    return {
      outstandingAmount: sumTotal(outstanding),
      overdueCount: overdue.length,
      overdueAmount: sumTotal(overdue),
      openCount: open.length,
      paidCount: paidThisMonth.length,
      paidAmount: sumTotal(paidThisMonth),
    };
  }, [invoices]);

  const handleSort = (field: SortField) => {
    if (field === sortField) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortField(field); setSortDir("asc"); }
  };

  const filtered = useMemo(() => {
    let items = [...invoices];
    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((i) =>
        i.number.toLowerCase().includes(q) ||
        i.clientName.toLowerCase().includes(q) ||
        i.clientEmail.toLowerCase().includes(q)
      );
    }
    if (statusFilter !== "all") items = items.filter((i) => i.status === statusFilter);

    items.sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "number":     cmp = a.number.localeCompare(b.number); break;
        case "clientName": cmp = a.clientName.localeCompare(b.clientName); break;
        case "issueDate":  cmp = a.issueDate.localeCompare(b.issueDate); break;
        case "dueDate":    cmp = a.dueDate.localeCompare(b.dueDate); break;
        case "total":      cmp = calcInvoiceTotals(a.lineItems).total - calcInvoiceTotals(b.lineItems).total; break;
        case "status":     cmp = a.status.localeCompare(b.status); break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
    return items;
  }, [invoices, search, statusFilter, sortField, sortDir]);

  const allSelected = filtered.length > 0 && filtered.every((i) => selectedIds.has(i.id));
  const someSelected = filtered.some((i) => selectedIds.has(i.id));

  const toggleAll = () => {
    if (allSelected) setSelectedIds(new Set());
    else setSelectedIds(new Set(filtered.map((i) => i.id)));
  };
  const toggleOne = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleDelete = (id: string) => {
    deleteInvoices([id]);
    setSelectedIds((prev) => { const n = new Set(prev); n.delete(id); return n; });
    refresh();
  };

  const handleBulkDelete = (ids: string[]) => {
    deleteInvoices(ids);
    setSelectedIds(new Set());
    refresh();
  };

  const selectedItems = useMemo(() => invoices.filter((i) => selectedIds.has(i.id)), [invoices, selectedIds]);
  const hasFilters = search || statusFilter !== "all";

  const SortableHead = ({ field, children, align }: { field: SortField; children: React.ReactNode; align?: "right" }) => (
    <TableHead>
      <button
        className={`flex items-center text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors ${align === "right" ? "w-full justify-end" : "text-left"}`}
        onClick={() => handleSort(field)}
      >
        {children}
        <SortIcon field={field} sortField={sortField} sortDir={sortDir} />
      </button>
    </TableHead>
  );

  return (
    <div className="space-y-4">
      {/* KPI cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: "Outstanding", value: fmtCurrency(kpis.outstandingAmount, "USD"), sub: "open + sent + overdue" },
          { label: "Overdue", value: kpis.overdueCount > 0 ? fmtCurrency(kpis.overdueAmount, "USD") : "—", sub: `${kpis.overdueCount} invoice${kpis.overdueCount !== 1 ? "s" : ""}` },
          { label: "Draft", value: String(kpis.openCount), sub: "awaiting send" },
          { label: "Paid This Month", value: kpis.paidCount > 0 ? fmtCurrency(kpis.paidAmount, "USD") : "—", sub: `${kpis.paidCount} invoice${kpis.paidCount !== 1 ? "s" : ""}` },
        ].map((kpi) => (
          <Card key={kpi.label} className="border">
            <CardContent className="pt-4 pb-3 px-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{kpi.label}</p>
              <p className="text-xl font-medium mt-1 tabular-nums">{kpi.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{kpi.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Table card */}
      <Card className="border rounded-xl">
        <CardContent className="pt-5 pb-5">
          {/* Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search invoices…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as InvoiceStatus | "all")}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All statuses</SelectItem>
                {INVOICE_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => router.push("/invoices/new")} className="gap-1.5 shrink-0">
              <PlusCircle className="h-4 w-4" />
              New Invoice
            </Button>
          </div>

          {/* Bulk actions */}
          {selectedIds.size > 0 && (
            <InvoiceBulkActions
              selectedItems={selectedItems}
              onDelete={handleBulkDelete}
              onClearSelection={() => setSelectedIds(new Set())}
            />
          )}

          <p className="text-xs text-muted-foreground mb-3">
            {filtered.length} {filtered.length === 1 ? "invoice" : "invoices"}
            {invoices.length !== filtered.length && ` of ${invoices.length}`}
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
                  <SortableHead field="number">#</SortableHead>
                  <SortableHead field="clientName">Client</SortableHead>
                  <SortableHead field="issueDate" >Issue Date</SortableHead>
                  <SortableHead field="dueDate">Due Date</SortableHead>
                  <SortableHead field="status">Status</SortableHead>
                  <SortableHead field="total" align="right">Amount</SortableHead>
                  <TableHead className="w-10" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-12 text-muted-foreground">
                      {hasFilters ? "No invoices match your filters." : "No invoices yet. Create your first one!"}
                    </TableCell>
                  </TableRow>
                ) : (
                  filtered.map((invoice) => {
                    const { total } = calcInvoiceTotals(invoice.lineItems);
                    return (
                      <TableRow
                        key={invoice.id}
                        className="cursor-pointer"
                        onClick={() => router.push(`/invoices/${invoice.id}/edit`)}
                        data-state={selectedIds.has(invoice.id) ? "selected" : undefined}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(invoice.id)}
                            onCheckedChange={() => toggleOne(invoice.id)}
                            aria-label="Select row"
                          />
                        </TableCell>

                        <TableCell>
                          <span className="font-medium text-sm tabular-nums">{invoice.number}</span>
                        </TableCell>

                        <TableCell>
                          <div>
                            <p className="font-medium text-sm truncate max-w-[180px]">{invoice.clientName}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[180px]">{invoice.clientEmail}</p>
                          </div>
                        </TableCell>

                        <TableCell className="text-sm tabular-nums whitespace-nowrap">
                          {fmtDate(invoice.issueDate)}
                        </TableCell>

                        <TableCell className="text-sm tabular-nums whitespace-nowrap">
                          {fmtDate(invoice.dueDate)}
                        </TableCell>

                        <TableCell>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_CLASSES[invoice.status]}`}>
                            {invoice.status}
                          </span>
                        </TableCell>

                        <TableCell className="text-right tabular-nums text-sm font-medium">
                          {fmtCurrency(total, invoice.currency)}
                        </TableCell>

                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <InvoiceRowActions invoice={invoice} onDelete={handleDelete} />
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
  );
}
