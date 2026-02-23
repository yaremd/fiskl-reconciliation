"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Search, Plus, Minus, Pencil, Check, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { PeriodSelector } from "@/components/reconciliation/period-selector";
import { StatsBar } from "@/components/reconciliation/stats-bar";
import { BalanceBanner } from "@/components/reconciliation/balance-banner";
import { ConfBox } from "@/components/reconciliation/conf-box";
import { LedgerItem, StatementItem } from "@/components/reconciliation/ledger-statement-items";
import { EditTransactionDialog } from "@/components/reconciliation/edit-transaction-dialog";
import { SecHdr } from "@/components/reconciliation/sec-hdr";
import { NotInLedgerCenter } from "@/components/reconciliation/not-in-ledger";
import { INIT_ATTENTION, INIT_MATCHED } from "@/lib/reconciliation/mock-data";
import { fmtGbp, BRAND_GRADIENT } from "@/lib/utils";
import type { AttentionItem, MatchedItem, LedgerEntry, StatementEntry } from "@/types/reconciliation";

interface ResolvedItem {
  id: string;
  L: LedgerEntry | null;
  R: StatementEntry | null;
  how: string;
}

type EditTarget = {
  id: string;
  L: LedgerEntry | null;
  R?: StatementEntry | null;
  _candidateIdx?: number;
  _ledgerItemIdx?: number;
};

// ── AI Matching Bridge label ──────────────────────────────────────────────────
function AiBridgeCenter({ aiCount }: { aiCount: number }) {
  return (
    <div className="flex flex-col items-center justify-center gap-[3px]">
      <div className="flex items-center gap-[5px]">
        <Sparkles />
        <span
          className="text-[11px] font-semibold uppercase tracking-[.04em] whitespace-nowrap"
          style={{
            background: "linear-gradient(92deg,#0058FF 0%,#00B4FF 45%,#00E0A0 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
          }}
        >
          AI Matching Bridge
        </span>
      </div>
      {aiCount > 0 && (
        <div className="text-[10px] text-muted-foreground">
          {aiCount} AI suggestion{aiCount !== 1 ? "s" : ""}
        </div>
      )}
    </div>
  );
}

function Sparkles() {
  return (
    <>
      <svg width={0} height={0} style={{ position: "absolute" }}>
        <defs>
          <linearGradient id="sparklesGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0058FF" />
            <stop offset="45%" stopColor="#00B4FF" />
            <stop offset="100%" stopColor="#00E0A0" />
          </linearGradient>
        </defs>
      </svg>
      <svg width={13} height={13} viewBox="0 0 24 24" fill="none" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0" style={{ stroke: "url(#sparklesGrad)" }}>
        <path d="M12 2L14.09 8.26L20.18 9L15.09 14.14L16.36 20.27L12 17L7.64 20.27L8.91 14.14L3.82 9L9.91 8.26L12 2Z" />
        <path d="M5 3L5.5 5L7 5.5L5.5 6L5 8L4.5 6L3 5.5L4.5 5L5 3Z" />
        <path d="M19 13L19.5 15L21 15.5L19.5 16L19 18L18.5 16L17 15.5L18.5 15L19 13Z" />
      </svg>
    </>
  );
}

export default function ReconcilePage() {
  const params = useParams<{ accountId: string; periodId: string }>();
  const router = useRouter();

  const [attention, setAttention] = useState<AttentionItem[]>(INIT_ATTENTION);
  const [matched, setMatched] = useState<MatchedItem[]>(INIT_MATCHED);
  const [resolved, setResolved] = useState<ResolvedItem[]>([]);
  const [selL, setSelL] = useState<string[]>([]);
  const [selR, setSelR] = useState<string[]>([]);
  const [editTarget, setEditTarget] = useState<EditTarget | null>(null);
  const [matchOpen, setMatchOpen] = useState(true);
  const [resolvedOpen, setResolvedOpen] = useState(false);
  const [attOpen, setAttOpen] = useState(true);
  const [toast, setToast] = useState<string | null>(null);
  const [stmtBal, setStmtBal] = useState("142890.50");
  const [periodStart, setPeriodStart] = useState("2025-04-01");
  const [periodEnd, setPeriodEnd] = useState("2025-06-30");
  const [createdLedger, setCreatedLedger] = useState<Record<string, boolean>>({});
  const [keptCandidates, setKeptCandidates] = useState<Record<string, Set<number>>>({});
  const [searchL, setSearchL] = useState("");
  const [searchR, setSearchR] = useState("");

  const reportHref = `/reconciliation/${params.accountId}/${params.periodId}/report`;

  // ── Filtering helpers ────────────────────────────────────────────────────────
  function matchesSide(side: LedgerEntry | StatementEntry | null, q: string): boolean {
    if (!side) return false;
    const s = q.toLowerCase();
    return (side.n ?? "").toLowerCase().includes(s) || (side.d ?? "").toLowerCase().includes(s);
  }
  function itemLVisible(item: AttentionItem) {
    if (!searchL) return true;
    const lSide = item.L ?? (item.candidates?.[0] ?? null);
    return matchesSide(lSide, searchL);
  }
  function itemRVisible(item: AttentionItem) {
    if (!searchR) return true;
    return matchesSide(item.R, searchR);
  }
  const filteredAttention = attention.filter(item => itemLVisible(item) || itemRVisible(item));
  const filteredMatched = matched.filter(item => {
    const passL = !searchL || matchesSide(item.L, searchL);
    const passR = !searchR || matchesSide(item.R, searchR);
    return passL || passR;
  });

  // ── Derived ──────────────────────────────────────────────────────────────────
  const aiSuggestedCount = attention.filter(i => i.aiSuggested).length;
  const allPeriodAmounts = [
    ...matched.flatMap(m => [m.L?.a, m.R?.a]),
    ...attention.flatMap(a => [a.L?.a, ...(a.ledgerItems ?? []).map(li => li.a), a.R?.a]),
  ].filter((v): v is number => v != null && v !== 0);
  const debitIn = allPeriodAmounts.filter(v => v > 0).reduce((s, v) => s + v, 0);
  const creditOut = Math.abs(allPeriodAmounts.filter(v => v < 0).reduce((s, v) => s + v, 0));
  const bannerItems = [
    ...attention.filter(a => a.L).map(a => ({ id: a.id, item: a.L! })),
    ...attention.filter(a => a.R).map(a => ({ id: a.id, item: a.R! })),
  ];
  const resolvedTotal = resolved.reduce((s, r) => s + Math.abs((r.L ?? r.R ?? { a: 0 }).a ?? 0), 0);
  const matchTotal = matched.reduce((s, m) => s + Math.abs(m.L.a), 0);
  const canDone = attention.filter(i => i.type !== "missing-in-bank").length === 0;
  const hasSelection = selL.length > 0 || selR.length > 0;

  // ── Toast ────────────────────────────────────────────────────────────────────
  function flash(m: string) {
    setToast(m);
    setTimeout(() => setToast(null), 2200);
  }

  // ── Handlers ─────────────────────────────────────────────────────────────────
  function acceptItem(item: AttentionItem) {
    setAttention(p => p.filter(a => a.id !== item.id));
    setResolved(p => [{ id: item.id, L: item.L, R: item.R, how: "AI Accepted" }, ...p]);
    setResolvedOpen(true);
    flash("Resolved: " + (item.L?.n ?? item.R?.n ?? "item"));
  }

  function resolveSelected() {
    const handled = new Set<string>();
    const newResolved: ResolvedItem[] = [];
    attention
      .filter(a => (a.L && selL.includes(a.id)) || (a.R && selR.includes(a.id)))
      .forEach(a => {
        if (handled.has(a.id)) return;
        handled.add(a.id);
        newResolved.push({ id: a.id, L: a.L, R: a.R, how: "Manual" });
      });
    setAttention(p => p.filter(a => !handled.has(a.id)));
    setResolved(p => [...newResolved, ...p]);
    setSelL([]); setSelR([]);
    setResolvedOpen(true);
    flash("Manually resolved " + newResolved.length + " item(s)");
  }

  function toggleSelL(id: string) {
    setSelL(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }
  function toggleSelR(id: string) {
    setSelR(p => p.includes(id) ? p.filter(x => x !== id) : [...p, id]);
  }

  function uncheckMatched(id: string) {
    const m = matched.find(x => x.id === id);
    if (!m) return;
    setMatched(p => p.filter(x => x.id !== id));
    setAttention(p => [{ id, L: m.L, R: m.R, conf: m.conf, type: "Unconfirmed", ex: "Auto-match moved back for manual review.", at: "accept", aiSuggested: true }, ...p]);
    flash("Moved back to Needs Attention");
  }

  function uncheckResolved(id: string) {
    const r = resolved.find(x => x.id === id);
    if (!r) return;
    setResolved(p => p.filter(x => x.id !== id));
    setAttention(p => [{ id, L: r.L, R: r.R, conf: null, type: "", ex: null, at: null, aiSuggested: false }, ...p]);
    flash("Moved back to Needs Attention");
  }

  function saveEdit(form: LedgerEntry) {
    if (!editTarget) return;
    const updated = { n: form.n, a: parseFloat(String(form.a)), d: form.d, cat: form.cat };
    setAttention(p => p.map(a => {
      if (a.id !== editTarget.id) return a;
      if (editTarget._candidateIdx != null) {
        const candidates = [...(a.candidates ?? [])];
        candidates[editTarget._candidateIdx] = { ...candidates[editTarget._candidateIdx], ...updated };
        return { ...a, candidates };
      }
      if (editTarget._ledgerItemIdx != null) {
        const ledgerItems = [...(a.ledgerItems ?? [])];
        ledgerItems[editTarget._ledgerItemIdx] = { ...ledgerItems[editTarget._ledgerItemIdx], ...updated };
        return { ...a, ledgerItems };
      }
      if (!a.L) return a;
      return { ...a, L: { ...a.L, ...updated } };
    }));
    setMatched(p => p.map(m => m.id !== editTarget.id ? m : { ...m, L: { ...m.L, ...updated } }));
    setResolved(p => p.map(r => r.id !== editTarget.id ? r : { ...r, L: r.L ? { ...r.L, ...updated } : r.L }));
    flash("Transaction updated");
  }

  function handleCreateLedger(itemId: string, stmtItem: StatementEntry) {
    const newL: LedgerEntry = { d: stmtItem.d, n: stmtItem.n, a: stmtItem.a, cat: "Uncategorized" };
    setAttention(p => p.map(a => a.id === itemId ? { ...a, L: newL } : a));
    setCreatedLedger(p => ({ ...p, [itemId]: true }));
    flash("Ledger entry created: " + stmtItem.n);
  }

  function handleResolveCreated(itemId: string) {
    const item = attention.find(a => a.id === itemId);
    if (!item) return;
    setAttention(p => p.filter(a => a.id !== itemId));
    setResolved(p => [{ id: itemId, L: item.L, R: item.R, how: "Created" }, ...p]);
    setResolvedOpen(true);
    setCreatedLedger(p => { const next = { ...p }; delete next[itemId]; return next; });
    flash("Resolved: " + (item.R?.n ?? "item"));
  }

  function resolveDuplicates(item: AttentionItem) {
    const kept = keptCandidates[item.id] ?? new Set<number>();
    const candidates = item.candidates ?? [item.L!];
    const toKeep = candidates.filter((_, i) => kept.has(i));
    const chosenL = toKeep[0] ?? candidates[0];
    setAttention(p => p.filter(a => a.id !== item.id));
    setResolved(p => [{ id: item.id, L: chosenL, R: item.R, how: "Duplicate resolved" }, ...p]);
    setResolvedOpen(true);
    setKeptCandidates(p => { const next = { ...p }; delete next[item.id]; return next; });
    flash("Duplicate resolved: kept " + toKeep.length + " of " + candidates.length);
  }

  function ignoreDuplication(item: AttentionItem) {
    setAttention(p => p.filter(a => a.id !== item.id));
    setKeptCandidates(p => { const next = { ...p }; delete next[item.id]; return next; });
    flash("Duplication ignored — all transactions kept");
  }

  function toggleKept(itemId: string, idx: number) {
    setKeptCandidates(p => {
      const cur = new Set(p[itemId] ?? []);
      cur.has(idx) ? cur.delete(idx) : cur.add(idx);
      return { ...p, [itemId]: cur };
    });
  }

  // ── How badge styles ──────────────────────────────────────────────────────────
  function howBadgeStyle(how: string): React.CSSProperties {
    const h = how.toLowerCase();
    if (h === "ai accepted") return { color: "#00AD68", background: "rgba(0,232,157,0.12)" };
    if (h === "ai updated" || h === "duplicate resolved") return { color: "#0078FF", background: "rgba(0,120,255,0.08)" };
    if (h === "manual") return { color: "#5F6C85", background: "#EDF1F7" };
    if (h === "created") return { color: "#0078FF", background: "rgba(0,120,255,0.08)" };
    return { color: "#5F6C85", background: "#EDF1F7" };
  }

  // ── Shared row action button ──────────────────────────────────────────────────
  function EditBtn({ onClick }: { onClick: () => void }) {
    return (
      <button
        onClick={e => { e.stopPropagation(); onClick(); }}
        className="flex-shrink-0 w-[22px] h-[22px] flex items-center justify-center bg-transparent border border-border rounded-[var(--radius)] cursor-pointer text-muted-foreground transition-colors hover:bg-accent"
      >
        <Pencil size={11} />
      </button>
    );
  }

  return (
    <TooltipProvider>
      {/* Toast */}
      {toast && (
        <div
          className="fixed bottom-[80px] left-1/2 -translate-x-1/2 bg-foreground text-background px-[18px] py-[9px] rounded-[var(--radius)] text-[13px] font-medium z-[500] shadow-[0_4px_20px_rgba(0,0,0,.2)]"
        >
          ✓ {toast}
        </div>
      )}

      {/* Edit dialog */}
      {editTarget && editTarget.L && (
        <EditTransactionDialog
          tx={editTarget.L}
          open={true}
          onClose={() => setEditTarget(null)}
          onSave={saveEdit}
        />
      )}

      {/* Page header */}
      <div className="flex justify-between items-start mb-3.5">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <h1 className="text-[20px] font-bold text-foreground m-0">HSBC Current Account</h1>
          </div>
          <PeriodSelector
            periodStart={periodStart}
            setPeriodStart={setPeriodStart}
            periodEnd={periodEnd}
            setPeriodEnd={setPeriodEnd}
          />
        </div>
        <Button
          className="bg-gradient-primary text-white"
          onClick={canDone ? () => router.push(reportHref) : undefined}
          disabled={!canDone}
        >
          Reconcile
        </Button>
      </div>

      <StatsBar stmtBal={stmtBal} onStmtBalChange={setStmtBal} debitIn={debitIn} creditOut={creditOut} />

      {/* Column headers + search/add controls */}
      <div
        className="grid gap-2 py-2.5 pb-2 border-t border-border mt-1"
        style={{ gridTemplateColumns: "1fr 180px 1fr" }}
      >
        {/* Left: search + add/expense buttons */}
        <div className="flex gap-1 items-center">
          <div className="flex-1 relative flex items-center">
            <Search size={12} className="absolute left-2 text-muted-foreground pointer-events-none" />
            <input
              value={searchL}
              onChange={e => setSearchL(e.target.value)}
              placeholder="Search…"
              className="w-full py-[5px] px-[9px] pl-[26px] text-xs border border-border rounded-[var(--radius)] bg-background text-foreground outline-none transition-colors focus:border-primary"
            />
          </div>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => flash("Income transaction added")}
                className="w-7 h-7 rounded-[var(--radius)] bg-transparent text-muted-foreground border border-border cursor-pointer flex items-center justify-center transition-colors hover:bg-accent hover:border-input"
              >
                <Plus size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Add income</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                onClick={() => flash("Expense transaction added")}
                className="w-7 h-7 rounded-[var(--radius)] bg-transparent text-muted-foreground border border-border cursor-pointer flex items-center justify-center transition-colors hover:bg-accent hover:border-input"
              >
                <Minus size={14} />
              </button>
            </TooltipTrigger>
            <TooltipContent>Add expense</TooltipContent>
          </Tooltip>
        </div>

        {/* Center: AI bridge label */}
        <AiBridgeCenter aiCount={aiSuggestedCount} />

        {/* Right: search */}
        <div className="relative flex items-center">
          <Search size={12} className="absolute left-2 text-muted-foreground pointer-events-none" />
          <input
            value={searchR}
            onChange={e => setSearchR(e.target.value)}
            placeholder="Search…"
            className="w-full py-[5px] px-[9px] pl-[26px] text-xs border border-border rounded-[var(--radius)] bg-background text-foreground outline-none transition-colors focus:border-primary"
          />
        </div>
      </div>

      {/* ── Needs Attention ──────────────────────────────────────────────────── */}
      <Card
        className="mb-3 overflow-hidden"
        style={{ borderColor: "rgba(255,89,5,.15)", background: "rgba(255,89,5,.01)" }}
      >
        <SecHdr
          icon="⚠"
          color="var(--warning)"
          title="Needs Attention"
          itemCount={filteredAttention.length}
          open={attOpen}
          onToggle={() => setAttOpen(!attOpen)}
        />
        {attOpen && (
          <div className="px-3.5 pb-3.5 flex flex-col gap-2">
            {attention.length === 0 ? (
              <div className="text-center py-5 text-positive text-sm font-semibold">✓ All items resolved</div>
            ) : filteredAttention.length === 0 ? (
              <div className="text-center py-5 text-muted-foreground text-[13px]">No results match your search</div>
            ) : (
              filteredAttention.map(item => {
                const isMissingInBank = item.type === "missing-in-bank";
                const isOneToMany = item.type === "one-to-many";
                const isNotInLedger = !item.L && !item.aiSuggested && !isOneToMany;
                const wasCreated = !!createdLedger[item.id];
                const showL = itemLVisible(item);
                const showR = !isMissingInBank && itemRVisible(item);
                const showBridge = isMissingInBank ? showL : (showL && showR);

                return (
                  <div
                    key={item.id}
                    className="grid gap-2"
                    style={{ gridTemplateColumns: "1fr 180px 1fr" }}
                  >
                    {/* Left column */}
                    {!showL ? (
                      <div />
                    ) : item.type === "Duplicate" && item.candidates?.length ? (
                      <div className="flex flex-col gap-1">
                        {item.candidates.map((c, i) => {
                          const isKept = (keptCandidates[item.id] ?? new Set()).has(i);
                          return (
                            <div key={i}>
                              {i > 0 && (
                                <div className="text-[10px] font-semibold text-muted-foreground text-center uppercase tracking-[.05em] py-0.5">vs</div>
                              )}
                              <div
                                className="p-[10px_12px] rounded-xl border cursor-pointer"
                                style={{
                                  borderColor: isKept ? "var(--positive)" : "var(--border)",
                                  background: isKept ? "rgba(0,232,157,.03)" : "var(--card)",
                                }}
                                onClick={() => toggleKept(item.id, i)}
                              >
                                <div className="flex items-start gap-2">
                                  <input
                                    type="checkbox"
                                    checked={isKept}
                                    onChange={() => toggleKept(item.id, i)}
                                    className="mt-0.5 accent-positive cursor-pointer flex-shrink-0"
                                  />
                                  <div className="flex-1 min-w-0">
                                    <div className="flex justify-between mb-0.5">
                                      <span className="text-[11px] text-muted-foreground">{c.d}</span>
                                      <span className="text-xs font-semibold financial-number" style={{ color: c.a > 0 ? "var(--positive)" : "var(--foreground)" }}>
                                        {c.a > 0 ? "" : "−"}£{Math.abs(c.a).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                                      </span>
                                    </div>
                                    <div className="text-[13px] font-semibold text-foreground truncate">{c.n}</div>
                                    {c.cat && <div className="text-[11px] text-muted-foreground mt-px">{c.cat}</div>}
                                  </div>
                                  <EditBtn onClick={() => setEditTarget({ id: item.id, L: c, _candidateIdx: i })} />
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : isOneToMany && item.ledgerItems?.length ? (
                      <div className="flex flex-col gap-1">
                        {item.ledgerItems.map((li, i) => (
                          <div key={i} className="p-[8px_10px] rounded-xl border border-border bg-card">
                            <div className="flex items-start gap-1.5">
                              <div className="flex-1 min-w-0">
                                <div className="flex justify-between mb-0.5">
                                  <span className="text-[11px] text-muted-foreground">{li.d}</span>
                                  <span className="text-xs font-semibold financial-number" style={{ color: li.a > 0 ? "var(--positive)" : "var(--foreground)" }}>
                                    {li.a > 0 ? "" : "−"}£{Math.abs(li.a).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                                  </span>
                                </div>
                                <div className="text-[12px] font-medium text-foreground truncate">{li.n}</div>
                                {li.cat && <div className="text-[11px] text-muted-foreground mt-px">{li.cat}</div>}
                              </div>
                              <EditBtn onClick={() => setEditTarget({ id: item.id, L: li, _ledgerItemIdx: i })} />
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : item.L ? (
                      <LedgerItem
                        item={item.L}
                        checked={selL.includes(item.id)}
                        onCheck={() => toggleSelL(item.id)}
                        onEdit={() => setEditTarget(item)}
                      />
                    ) : (
                      <div />
                    )}

                    {/* Center column */}
                    {!showBridge ? (
                      <div />
                    ) : isMissingInBank ? (
                      <div className="flex items-center justify-center">
                        <div
                          className="p-2.5 rounded-xl text-center w-full box-border"
                          style={{ border: "1px dashed var(--border)", background: "var(--muted)" }}
                        >
                          <div className="text-[11px] font-semibold text-muted-foreground mb-1">Missing in Bank</div>
                          <div className="text-[10px] text-muted-foreground leading-[1.4]">Carries forward to next period</div>
                        </div>
                      </div>
                    ) : isNotInLedger || wasCreated ? (
                      <NotInLedgerCenter
                        statementItem={item.R!}
                        created={wasCreated}
                        onCreated={stmtItem => handleCreateLedger(item.id, stmtItem)}
                        onResolve={() => handleResolveCreated(item.id)}
                      />
                    ) : item.aiSuggested ? (
                      <ConfBox
                        item={item}
                        onAccept={item.type === "Duplicate" ? resolveDuplicates : acceptItem}
                        onDismissBoth={ignoreDuplication}
                      />
                    ) : (
                      <div className="flex items-center justify-center">
                        <div
                          className="px-2.5 py-2 rounded-xl text-center"
                          style={{ border: "1px dashed var(--border)", background: "var(--muted)" }}
                        >
                          <div className="text-[11px] text-muted-foreground mb-1">No match found</div>
                          <div className="text-[10px] text-muted-foreground">Select &amp; resolve manually</div>
                        </div>
                      </div>
                    )}

                    {/* Right column */}
                    {isMissingInBank ? (
                      <div />
                    ) : showR ? (
                      <StatementItem
                        item={item.R ?? null}
                        checked={selR.includes(item.id)}
                        onCheck={() => toggleSelR(item.id)}
                      />
                    ) : (
                      <div />
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </Card>

      {/* ── Resolve Selected button ──────────────────────────────────────────── */}
      {hasSelection && (
        <div className="flex justify-end mb-2">
          <Button size="sm" className="bg-gradient-primary text-white" onClick={resolveSelected}>
            ✓ Resolve Selected ({selL.length + selR.length})
          </Button>
        </div>
      )}

      {/* ── Resolved ────────────────────────────────────────────────────────── */}
      {resolved.length > 0 && (
        <Card
          className="mb-3 overflow-hidden"
          style={{ borderColor: "rgba(0,120,255,.12)" }}
        >
          <SecHdr
            icon="✓"
            color="var(--primary)"
            title="Resolved"
            itemCount={resolved.length}
            totalAmt={resolvedTotal}
            open={resolvedOpen}
            onToggle={() => setResolvedOpen(!resolvedOpen)}
          />
          {resolvedOpen && (
            <div className="px-3.5 pb-3.5 flex flex-col gap-1.5">
              {resolved.map((r, i) => (
                <div
                  key={r.id ?? i}
                  className="grid gap-2 opacity-65"
                  style={{ gridTemplateColumns: "1fr 180px 1fr" }}
                >
                  {/* Left */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => uncheckResolved(r.id)}
                      className="accent-primary flex-shrink-0"
                      title="Uncheck to move back"
                    />
                    <div className="flex-1 min-w-0">
                      {r.L ? (
                        <>
                          <div className="text-[11px] text-muted-foreground">{r.L.d}</div>
                          <div className="text-[12px] font-medium text-foreground truncate">{r.L.n}</div>
                          <span className="text-xs font-semibold financial-number" style={{ color: r.L.a > 0 ? "var(--positive)" : "var(--foreground)" }}>
                            {r.L.a > 0 ? "" : "−"}£{Math.abs(r.L.a).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                          </span>
                        </>
                      ) : (
                        <span className="text-[12px] text-muted-foreground">—</span>
                      )}
                    </div>
                    {r.L && <EditBtn onClick={() => setEditTarget(r as EditTarget)} />}
                  </div>

                  {/* Center badge */}
                  <div className="flex items-center justify-center">
                    <span
                      className="text-[10px] font-semibold px-2 py-[3px] rounded-full whitespace-nowrap"
                      style={howBadgeStyle(r.how)}
                    >
                      {r.how}
                    </span>
                  </div>

                  {/* Right */}
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={true}
                      onChange={() => uncheckResolved(r.id)}
                      className="accent-primary flex-shrink-0"
                      title="Uncheck to move back"
                    />
                    <div className="flex-1 min-w-0">
                      {r.R ? (
                        <>
                          <div className="text-[11px] text-muted-foreground">{r.R.d}</div>
                          <div className="text-[12px] font-medium text-foreground truncate">{r.R.n}</div>
                          <span className="text-xs font-semibold financial-number" style={{ color: r.R.a > 0 ? "var(--positive)" : "var(--foreground)" }}>
                            {r.R.a > 0 ? "" : "−"}£{Math.abs(r.R.a).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                          </span>
                        </>
                      ) : (
                        <span className="text-[12px] text-muted-foreground">—</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}

      {/* ── Auto Matched ────────────────────────────────────────────────────── */}
      <Card
        className="mb-3 overflow-hidden"
        style={{ borderColor: "rgba(0,232,157,.15)" }}
      >
        <SecHdr
          icon="✓"
          color="var(--positive)"
          title="Auto Matched"
          itemCount={filteredMatched.length}
          open={matchOpen}
          onToggle={() => setMatchOpen(!matchOpen)}
        />
        {matchOpen && (
          <div className="px-3.5 pb-0">
            {filteredMatched.length === 0 && matched.length > 0 && (
              <div className="text-center py-5 text-muted-foreground text-[13px]">No results match your search</div>
            )}
            {filteredMatched.map(m => {
              const mShowL = !searchL || matchesSide(m.L, searchL);
              const mShowR = !searchR || matchesSide(m.R, searchR);
              const mShowBridge = mShowL && mShowR;
              return (
                <div
                  key={m.id}
                  className="grid gap-2 py-1.5 border-b border-border"
                  style={{ gridTemplateColumns: "1fr 180px 1fr" }}
                >
                  {mShowL ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => uncheckMatched(m.id)}
                        className="accent-positive flex-shrink-0"
                        title="Uncheck to move back"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <span className="text-[11px] text-muted-foreground">{m.L.d}</span>
                          <span className="text-xs font-semibold financial-number" style={{ color: m.L.a > 0 ? "var(--positive)" : "var(--foreground)" }}>
                            {m.L.a > 0 ? "" : "−"}£{Math.abs(m.L.a).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="text-[12px] font-medium text-foreground truncate">{m.L.n}</div>
                      </div>
                      <EditBtn onClick={() => setEditTarget(m as EditTarget)} />
                    </div>
                  ) : <div />}

                  {mShowBridge ? (
                    <div className="flex items-center justify-center">
                      <div className="flex items-center gap-[3px] text-primary">
                        <Star size={10} fill="currentColor" stroke="none" className="flex-shrink-0" />
                        <span className="text-[10px] font-semibold">AI Matched</span>
                      </div>
                    </div>
                  ) : <div />}

                  {mShowR ? (
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={true}
                        onChange={() => uncheckMatched(m.id)}
                        className="accent-positive"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <span className="text-[11px] text-muted-foreground">{m.R.d}</span>
                          <span className="text-xs font-semibold financial-number" style={{ color: m.R.a > 0 ? "var(--positive)" : "var(--foreground)" }}>
                            {m.R.a > 0 ? "" : "−"}£{Math.abs(m.R.a).toLocaleString("en-GB", { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="text-[12px] font-medium text-foreground truncate">{m.R.n}</div>
                      </div>
                    </div>
                  ) : <div />}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* ── Balance Banner ───────────────────────────────────────────────────── */}
      <BalanceBanner
        selL={selL}
        selR={selR}
        allItems={bannerItems}
        onResolve={resolveSelected}
      />
    </TooltipProvider>
  );
}
