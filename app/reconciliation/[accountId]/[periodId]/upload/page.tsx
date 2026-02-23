"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { BRAND_GRADIENT } from "@/lib/utils";

const LABELS = ["Uploading", "Parsing", "AI Matching", "Complete"];
const DESCS = [
  "hsbc_q2_2025.csv",
  "Extracting 33 transactions...",
  "Comparing ledger with statement...",
  "28 matched · 4 suggestions · 2 orphans",
];

export default function UploadPage() {
  const params = useParams<{ accountId: string; periodId: string }>();
  const router = useRouter();
  const [st, setSt] = useState(0);
  const [pr, setPr] = useState(0);

  const reconcileHref = `/reconciliation/${params.accountId}/${params.periodId}/reconcile`;

  useEffect(() => {
    if (st === 0) {
      const t = setTimeout(() => setSt(1), 500);
      return () => clearTimeout(t);
    }
    if (st === 1) {
      const iv = setInterval(() => {
        setPr(p => {
          if (p >= 100) { clearInterval(iv); setSt(2); return 100; }
          return p + 5;
        });
      }, 30);
      return () => clearInterval(iv);
    }
    if (st === 2) {
      setPr(0);
      const iv2 = setInterval(() => {
        setPr(p => {
          if (p >= 100) { clearInterval(iv2); setSt(3); return 100; }
          return p + 3;
        });
      }, 25);
      return () => clearInterval(iv2);
    }
    if (st === 3) {
      const t2 = setTimeout(() => router.push(reconcileHref), 900);
      return () => clearTimeout(t2);
    }
  }, [st]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[420px]">
      <div className="w-full max-w-[440px]">
        {/* Progress steps */}
        <div className="flex gap-[3px] mb-8">
          {LABELS.map((_, i) => (
            <div
              key={i}
              className="flex-1 h-[3px] rounded-full transition-all duration-[400ms]"
              style={{ background: i <= st ? "var(--positive)" : "var(--border)" }}
            />
          ))}
        </div>

        <Card>
          <CardContent className="p-8 text-center">
            <div className="text-[28px] mb-3">{st === 3 ? "✅" : "✨"}</div>
            <h2 className="text-[16px] font-bold text-foreground m-0 mb-1">{LABELS[st]}</h2>
            <p className="text-[13px] text-muted-foreground m-0 mb-[18px]">{DESCS[st]}</p>

            {(st === 1 || st === 2) && (
              <div className="h-1 rounded-full bg-border overflow-hidden">
                <div
                  className="h-full rounded-full transition-[width] duration-[60ms]"
                  style={{
                    width: `${pr}%`,
                    background: st === 2 ? BRAND_GRADIENT : "var(--primary)",
                  }}
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
