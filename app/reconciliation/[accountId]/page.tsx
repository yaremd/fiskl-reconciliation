"use client";

import { useParams, useRouter } from "next/navigation";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ACCOUNTS, HSBC_PERIODS } from "@/lib/reconciliation/mock-data";
import { fmtCurrency, periodSlug } from "@/lib/utils";
import type { Period } from "@/types/reconciliation";

export default function AccountPeriodsPage() {
  const params = useParams<{ accountId: string }>();
  const router = useRouter();
  const account = ACCOUNTS.find(a => a.id === params.accountId) ?? null;

  function go(period: Period) {
    router.push(`/reconciliation/${params.accountId}/${periodSlug(period.period)}`);
  }

  function statusBadge(status: string | null) {
    if (status === "reconciled") return <Badge variant="positive">Reconciled</Badge>;
    if (status === "needs_attention") return <Badge variant="critical">Needs attention</Badge>;
    if (status === "draft") return <Badge variant="neutral">Draft</Badge>;
    if (status === "in_progress") return <Badge variant="neutral">In progress</Badge>;
    return <Badge variant="neutral">{status}</Badge>;
  }

  return (
    <div>
      {/* Back */}
      <button
        onClick={() => router.push("/reconciliation")}
        className="flex items-center gap-1 py-1 bg-transparent border-none text-xs text-muted-foreground cursor-pointer mb-3 hover:text-foreground"
      >
        ← Back
      </button>

      {/* Header */}
      <div className="mb-5">
        <h1 className="text-[20px] font-bold text-foreground mb-1">
          {account?.name ?? "Account"}
        </h1>
        <div className="text-[13px] text-muted-foreground">
          {account?.currency} · Select a period to start reconciling
        </div>
      </div>

      {/* Periods table */}
      <Card className="overflow-hidden">
        <CardContent className="p-0">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted">
                {["Period", "Status", "Reconciled Balance", "Actions"].map((h, i) => (
                  <th
                    key={i}
                    className={`px-[18px] py-2.5 text-[10px] font-semibold text-muted-foreground uppercase tracking-[.04em] ${i >= 2 ? "text-right" : "text-left"}`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {HSBC_PERIODS.map((row, idx) => (
                <tr
                  key={idx}
                  onClick={() => go(row)}
                  className={`cursor-pointer transition-colors hover:bg-accent ${idx < HSBC_PERIODS.length - 1 ? "border-b border-border" : ""}`}
                >
                  <td className="px-[18px] py-3.5 text-sm font-medium text-foreground">
                    {row.period}
                  </td>
                  <td className="px-[18px] py-3.5">
                    {statusBadge(row.status)}
                  </td>
                  <td className="px-[18px] py-3.5 text-right text-sm font-semibold text-foreground financial-number">
                    {fmtCurrency(row.balance, account?.currency ?? "GBP")}
                  </td>
                  <td className="px-[18px] py-3.5">
                    <div className="flex items-center gap-1.5 justify-end">
                      {row.status === "needs_attention" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={e => { e.stopPropagation(); go(row); }}
                        >
                          Resolve
                        </Button>
                      )}
                      {row.status === "reconciled" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={e => e.stopPropagation()}
                        >
                          View report
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="px-1.5 h-7"
                        onClick={e => e.stopPropagation()}
                      >
                        <MoreHorizontal size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
