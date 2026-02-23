"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, Plus, Minus, MoreHorizontal, Sparkles, SlidersHorizontal, ChevronRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PeriodSelector } from "@/components/reconciliation/period-selector";
import { StatsBar } from "@/components/reconciliation/stats-bar";
import { CreateTransactionDialog } from "@/components/reconciliation/create-transaction-dialog";
import { TRANSACTIONS } from "@/lib/reconciliation/mock-data";
import { fmtAmt } from "@/lib/utils";
import type { Transaction } from "@/types/reconciliation";

function aiColor(conf: number): string {
  if (conf >= 90) return "var(--positive)";
  if (conf >= 70) return "#E8A000";
  return "var(--destructive)";
}

function pageButtons(page: number, total: number): (number | "…")[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  if (page <= 3) return [1, 2, 3, "…", total];
  if (page >= total - 2) return [1, "…", total - 2, total - 1, total];
  return [1, "…", page, "…", total];
}

export default function PeriodTransactionsPage() {
  const params = useParams<{ accountId: string; periodId: string }>();
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [createModal, setCreateModal] = useState<"in" | "out" | null>(null);
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [page, setPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [stmtBal, setStmtBal] = useState("");
  const [periodStart, setPeriodStart] = useState("2025-04-01");
  const [periodEnd, setPeriodEnd] = useState("2025-06-30");
  const [transactions, setTransactions] = useState<Transaction[]>(TRANSACTIONS);

  const uploadHref = `/reconciliation/${params.accountId}/${params.periodId}/upload`;
  const reportHref = `/reconciliation/${params.accountId}/${params.periodId}/report`;

  const filtered = transactions.filter(tx => {
    if (!search) return true;
    const q = search.toLowerCase();
    return tx.n.toLowerCase().includes(q) || (tx.cat ?? "").toLowerCase().includes(q);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / rowsPerPage));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * rowsPerPage, safePage * rowsPerPage);
  const allChecked = pageRows.length > 0 && pageRows.every(r => selectedRows.has(r.id));
  const someChecked = pageRows.some(r => selectedRows.has(r.id));

  function toggleAll() {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (allChecked) pageRows.forEach(r => next.delete(r.id));
      else pageRows.forEach(r => next.add(r.id));
      return next;
    });
  }

  function toggleRow(id: string) {
    setSelectedRows(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  }

  const thStyle = "px-3.5 py-2.5 text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-[.05em] border-b border-border whitespace-nowrap select-none bg-background";

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => router.push(`/reconciliation/${params.accountId}`)}
        className="flex items-center gap-1 py-1 bg-transparent border-none text-xs text-muted-foreground cursor-pointer mb-3 hover:text-foreground"
      >
        ← Back
      </button>

      {/* Page header */}
      <div className="flex justify-between items-start mb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[20px] font-bold text-foreground m-0">HSBC Current Account</h1>
            <Badge variant="warning">Draft</Badge>
          </div>
          <PeriodSelector
            periodStart={periodStart}
            setPeriodStart={setPeriodStart}
            periodEnd={periodEnd}
            setPeriodEnd={setPeriodEnd}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => router.push(uploadHref)}>
            ↑ Upload Statement
          </Button>
          <Button variant="outline" size="sm" onClick={() => router.push(reportHref)}>
            ⬒ Report
          </Button>
        </div>
      </div>

      <StatsBar stmtBal={stmtBal} onStmtBalChange={setStmtBal} />

      {/* Table card */}
      <Card className="mt-4 overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="relative flex items-center">
            <Search size={14} className="absolute left-2.5 text-muted-foreground pointer-events-none z-[1]" />
            <input
              placeholder="Search..."
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-8 pr-2.5 py-[7px] border border-border rounded-[var(--radius)] text-[13px] text-foreground bg-background outline-none w-[220px] transition-colors focus:border-primary"
            />
          </div>
          <div className="flex gap-2">
            {(["in", "out"] as const).map(dir => (
              <button
                key={dir}
                onClick={() => setCreateModal(dir)}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-transparent text-foreground border border-border rounded-[var(--radius)] text-[13px] font-medium cursor-pointer transition-colors hover:bg-accent"
              >
                {dir === "in" ? <Plus size={13} /> : <Minus size={13} />}
                {dir === "in" ? "IN" : "OUT"}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse" style={{ tableLayout: "fixed" }}>
            <colgroup>
              <col style={{ width: 44 }} />
              <col style={{ width: 110 }} />
              <col style={{ width: "20%" }} />
              <col style={{ width: "35%" }} />
              <col style={{ width: 70 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 130 }} />
              <col style={{ width: 44 }} />
            </colgroup>
            <thead>
              <tr>
                <th className={`${thStyle} text-center px-2`}>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={el => { if (el) el.indeterminate = someChecked && !allChecked; }}
                    onChange={toggleAll}
                    className="accent-primary cursor-pointer"
                  />
                </th>
                <th className={thStyle}>DATE</th>
                <th className={thStyle}>NAME</th>
                <th className={thStyle}>
                  <span className="inline-flex items-center gap-1.5">
                    <Sparkles size={12} className="text-primary flex-shrink-0" />
                  </span>
                </th>
                <th className={thStyle}>TAX</th>
                <th className={`${thStyle} text-right`}>AMOUNT</th>
                <th className={`${thStyle} text-right`}>AMOUNT GBP</th>
                <th className={`${thStyle} px-2`}>
                  <SlidersHorizontal size={14} className="text-muted-foreground" />
                </th>
              </tr>
            </thead>
            <tbody>
              {pageRows.map(tx => {
                const sel = selectedRows.has(tx.id);
                const tdBase = "px-3.5 py-2.5 border-b border-border text-[13px] text-foreground align-middle";
                return (
                  <tr
                    key={tx.id}
                    className="transition-colors"
                    style={{ background: sel ? "rgba(0,120,255,.025)" : undefined }}
                    onMouseEnter={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = "var(--muted)"; }}
                    onMouseLeave={e => { if (!sel) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
                  >
                    {/* Checkbox */}
                    <td className={`${tdBase} text-center px-2`}>
                      <input type="checkbox" checked={sel} onChange={() => toggleRow(tx.id)} className="accent-primary cursor-pointer" />
                    </td>

                    {/* Date */}
                    <td className={`${tdBase} text-muted-foreground text-xs`}>{tx.d}</td>

                    {/* Name */}
                    <td className={tdBase}>
                      <div className="flex items-center gap-1.5 min-w-0">
                        {tx.isManual && (
                          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" aria-label="Manually categorized">
                            <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                            <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                            <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                            <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                          </svg>
                        )}
                        <span className="font-medium truncate">{tx.n}</span>
                      </div>
                    </td>

                    {/* AI% + Category */}
                    <td className={tdBase}>
                      <div className="flex items-center gap-1.5 flex-nowrap min-w-0">
                        {tx.aiConf != null && (
                          <span className="text-xs font-bold flex-shrink-0" style={{ color: aiColor(tx.aiConf) }}>
                            {tx.aiConf}%
                          </span>
                        )}
                        <span
                          className="text-[13px] font-medium truncate cursor-pointer flex-shrink min-w-0"
                          style={{
                            color: tx.catType === "expense" ? "var(--warning)"
                              : tx.catType === "income" ? "var(--primary)"
                              : "var(--primary)",
                          }}
                        >
                          {tx.cat}
                        </span>
                        {tx.hasLink && (
                          <svg width={13} height={13} viewBox="0 0 24 24" fill="none" stroke="var(--muted-foreground)" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                            <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                            <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                          </svg>
                        )}
                        {tx.extraCats > 0 && (
                          <span className="inline-flex items-center flex-shrink-0 px-1.5 py-px rounded bg-muted border border-border text-[10px] font-semibold text-muted-foreground">
                            +{tx.extraCats}
                          </span>
                        )}
                      </div>
                    </td>

                    {/* Tax */}
                    <td className={`${tdBase} text-muted-foreground text-xs`}>
                      {tx.tax != null ? `${tx.tax}%` : ""}
                    </td>

                    {/* Amount */}
                    <td className={`${tdBase} text-right financial-number`}>
                      <span style={{ color: tx.amount > 0 ? "var(--positive)" : "var(--foreground)", fontWeight: 500 }}>
                        {fmtAmt(tx.amount, tx.currency)}
                      </span>
                    </td>

                    {/* Amount GBP */}
                    <td className={`${tdBase} text-right financial-number`}>
                      <span style={{ color: tx.amountGbp > 0 ? "var(--positive)" : "var(--foreground)", fontWeight: 500 }}>
                        {fmtAmt(tx.amountGbp, "GBP")}
                      </span>
                    </td>

                    {/* Actions */}
                    <td className={`${tdBase} px-2 text-center`}>
                      <button className="p-1 bg-transparent border-none rounded-[var(--radius)] cursor-pointer text-muted-foreground flex items-center transition-colors hover:bg-accent hover:text-foreground">
                        <MoreHorizontal size={15} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Bottom bar */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-border flex-wrap gap-2">
          {/* Selection count */}
          <span className="text-[13px] text-muted-foreground min-w-[140px]">
            {selectedRows.size} of {filtered.length} row(s) selected
          </span>

          {/* Pagination */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={safePage === 1}
              className="inline-flex items-center gap-1 px-2.5 py-[5px] bg-transparent border border-border rounded-[var(--radius)] text-[13px] transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronRight size={13} className="rotate-180" /> Previous
            </button>

            {pageButtons(safePage, totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`ell-${i}`} className="px-1.5 text-muted-foreground text-[13px]">···</span>
              ) : (
                <button
                  key={p}
                  onClick={() => setPage(p)}
                  className="w-8 h-8 flex items-center justify-center border rounded-[var(--radius)] text-[13px] transition-all"
                  style={{
                    background: safePage === p ? "var(--foreground)" : "transparent",
                    color: safePage === p ? "var(--background)" : "var(--foreground)",
                    borderColor: safePage === p ? "var(--foreground)" : "var(--border)",
                    fontWeight: safePage === p ? 600 : 400,
                  }}
                >
                  {p}
                </button>
              )
            )}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={safePage === totalPages}
              className="inline-flex items-center gap-1 px-2.5 py-[5px] bg-transparent border border-border rounded-[var(--radius)] text-[13px] transition-colors hover:bg-accent disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Next <ChevronRight size={13} />
            </button>
          </div>

          {/* Rows per page */}
          <div className="flex items-center gap-2">
            <span className="text-[13px] text-muted-foreground">Rows per page</span>
            <select
              value={rowsPerPage}
              onChange={e => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
              className="pl-2 pr-7 py-1 border border-border rounded-[var(--radius)] text-[13px] text-foreground bg-background cursor-pointer outline-none"
              style={{
                appearance: "none",
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundRepeat: "no-repeat",
                backgroundPosition: "right 8px center",
              }}
            >
              {[10, 25, 50].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </div>
        </div>
      </Card>

      {/* AI upload prompt */}
      <div className="mt-4 px-[18px] py-3.5 border border-dashed rounded-xl flex justify-between items-center" style={{ borderColor: "rgba(0,120,255,.2)" }}>
        <div>
          <div className="text-[13px] font-medium text-foreground">✨ AI-powered reconciliation available</div>
          <div className="text-[11px] text-muted-foreground mt-px">Upload a CSV to auto-match transactions</div>
        </div>
        <Button variant="outline" size="sm" onClick={() => router.push(uploadHref)}>
          ↑ Upload CSV
        </Button>
      </div>

      {/* Create transaction dialog */}
      {createModal && (
        <CreateTransactionDialog
          direction={createModal}
          open={!!createModal}
          onClose={() => setCreateModal(null)}
          onSave={tx => {
            const newTx: Transaction = {
              id: "tx-" + Date.now(),
              d: tx.d,
              n: tx.n,
              aiConf: null,
              cat: tx.cat,
              catType: tx.catType,
              isManual: true,
              tax: tx.tax,
              amount: tx.amount,
              currency: tx.currency,
              amountGbp: tx.currency === "GBP" ? tx.amount : Math.round(tx.amount * 0.858 * 100) / 100,
              hasLink: false,
              extraCats: 0,
            };
            setTransactions(p => [newTx, ...p]);
          }}
        />
      )}
    </div>
  );
}
