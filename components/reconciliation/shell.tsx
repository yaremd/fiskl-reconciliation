"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Sidebar } from "@/components/reconciliation/sidebar";
import { SiteHeader } from "@/components/reconciliation/site-header";

export function ReconciliationShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const params = useParams<{ accountId?: string; periodId?: string }>();

  return (
    <div
      className="flex h-screen bg-background text-foreground"
      style={{ "--sidebar-w": collapsed ? "48px" : "256px" } as React.CSSProperties}
    >
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(c => !c)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <SiteHeader
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(c => !c)}
          accountId={params.accountId}
          periodId={params.periodId}
        />
        <main className="flex-1 overflow-y-auto p-6 pb-[120px]">
          {children}
        </main>
      </div>
    </div>
  );
}
