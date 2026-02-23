import { ReconciliationShell } from "@/components/reconciliation/shell";

export default function ReconciliationLayout({ children }: { children: React.ReactNode }) {
  return <ReconciliationShell>{children}</ReconciliationShell>;
}
