"use client";

import { useParams } from "next/navigation";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/reconciliation/sidebar";
import { SiteHeader } from "@/components/reconciliation/site-header";

export function ReconciliationShell({ children }: { children: React.ReactNode }) {
  const params = useParams<{ accountId?: string; periodId?: string }>();

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <SiteHeader
          accountId={params.accountId}
          periodId={params.periodId}
        />
        <main className="flex-1 overflow-y-auto p-6 pb-[120px]">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
