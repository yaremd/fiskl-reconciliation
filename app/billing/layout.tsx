import { ReconciliationShell } from "@/components/reconciliation/shell";

export default function BillingLayout({ children }: { children: React.ReactNode }) {
  return (
    <ReconciliationShell>
      <div className="max-w-4xl">{children}</div>
    </ReconciliationShell>
  );
}
